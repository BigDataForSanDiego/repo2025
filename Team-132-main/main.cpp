#include <algorithm>
#include <cmath>
#include <iostream>
#include <limits>
#include <optional>
#include <string>
#include <unordered_set>
#include <utility>
#include <vector>

using namespace std;

// ------------------------- Data Models -------------------------

struct Eligibility {
    // Hard gates
    optional<int> age_min;
    optional<int> age_max;
    vector<string> genders_allowed; // empty => no restriction
    bool requires_veteran = false;
    bool requires_children = false;

    optional<double> income_max_monthly;

    // Documents: requires any or requires all
    vector<string> requires_docs_any; // empty => none
    vector<string> requires_docs_all; // empty => none
};

struct Capacity {
    int available_beds = -1; // -1 means unknown / not applicable
    bool waitlist = false;
};

struct UserProfile {
    string id;
    int age = 0;
    string gender;       // e.g., "woman", "man", "nonbinary"
    string education;
    bool veteran = false;
    bool lgbtq = false;
    bool has_children = false;
    bool has_pets = false;
    bool has_disability = false;
    bool employment = false;
    optional<double> income_monthly;
    vector<string> documentation;
    string zip;
    string licencesAndCertifications;

    // optional prefs
    vector<string> preferred_categories;
};

struct Resource {
    string id;
    string name;
    string category; // e.g., "shelter","food","legal","health"
    Eligibility eligibility;
    vector<string> soft_tags; // e.g., {"women_only","lgbtq_friendly","serves_families","pet_friendly"}
    Capacity capacity;
};

struct Employment {
    string id;
    string job_name;
    string category;          // e.g., "retail", "food service", "cosmetology"
    optional<int> min_age;    // inclusive; nullopt => no bound
    optional<int> max_age;    // inclusive; nullopt => no bound
    string req_education;     // simple equality match, e.g., "none", "high school", "bachelor"
    string zip;               // match UserProfile::zip (string)
    vector<string> requires_docs_any;  // any of these; empty => none
    vector<string> requires_docs_all;  // all of these; empty => none
    vector<string> soft_tags;          // e.g., {"lgbtq_friendly","cosmetology_license_required"}
    // Reuse Capacity: interpret available_beds as "open positions"
    Capacity capacity;
};

// ------------------------- Match result (define early) -------------------------

struct MatchResult {
    string resource_id;       // for jobs, this will be job id
    string name;              // resource or job name
    int score = 0;
    vector<string> explanations;
};

// ------------------------- Matching Core (Resources) -------------------------

static pair<bool, vector<string>> hard_eligibility(const UserProfile& user, const Resource& r) {
    const auto& e = r.eligibility;

    if (e.age_min && user.age < *e.age_min)
        return {false, {"age_below_min"}};
    if (e.age_max && user.age > *e.age_max)
        return {false, {"age_above_max"}};

    if (!e.genders_allowed.empty()) {
        if (find(e.genders_allowed.begin(), e.genders_allowed.end(), user.gender) == e.genders_allowed.end())
            return {false, {"gender_not_allowed"}};
    }

    if (e.requires_veteran && !user.veteran)
        return {false, {"veteran_required"}};

    if (e.requires_children && !user.has_children)
        return {false, {"children_required"}};

    if (e.income_max_monthly) {
        if (!user.income_monthly.has_value() || user.income_monthly.value() > *e.income_max_monthly)
            return {false, {"income_over_limit"}};
    }

    // Docs
    unordered_set<string> user_docs(user.documentation.begin(), user.documentation.end());

    if (!e.requires_docs_all.empty()) {
        for (const auto& d : e.requires_docs_all) {
            if (!user_docs.count(d)) return {false, {"missing_required_docs_all"}};
        }
    }

    if (!e.requires_docs_any.empty()) {
        bool has_any = false;
        for (const auto& d : e.requires_docs_any) {
            if (user_docs.count(d)) { has_any = true; break; }
        }
        if (!has_any) return {false, {"missing_required_docs_any"}};
    }

    // Capacity policy: exclude if known zero capacity and no waitlist
    if (r.capacity.available_beds == 0 && !r.capacity.waitlist) {
        return {false, {"no_capacity"}};
    }

    return {true, {}};
}

static pair<int, vector<string>> score_match(const UserProfile& user, const Resource& r) {
    int score = 0;
    vector<string> notes;
    unordered_set<string> tags(r.soft_tags.begin(), r.soft_tags.end());

    // Capacity signal
    if (r.capacity.available_beds > 0) {
        score += 1;
        notes.push_back("capacity_available");
    }

    // Soft tags
    if (tags.count("women_only") && user.gender == "woman") {
        score += 3; notes.push_back("women_only");
    }
    if (tags.count("lgbtq_friendly") && user.lgbtq) {
        score += 2; notes.push_back("lgbtq_friendly");
    }
    if (tags.count("serves_families") && user.has_children) {
        score += 2; notes.push_back("serves_families");
    }
    if (tags.count("pet_friendly") && user.has_pets) {
        score += 2; notes.push_back("pet_friendly");
    }

    // Preferences
    if (!user.preferred_categories.empty()) {
        if (find(user.preferred_categories.begin(),
                 user.preferred_categories.end(),
                 r.category) != user.preferred_categories.end()) {
            score += 1; notes.push_back("category_preference");
        }
    }

    return {score, notes};
}

static vector<MatchResult> match_resources(const UserProfile& user,
                                           const vector<Resource>& resources,
                                           size_t top_k = 10) {
    vector<MatchResult> out;
    out.reserve(resources.size());

    for (const auto& r : resources) {
        auto [ok, _reasons] = hard_eligibility(user, r);
        if (!ok) continue;

        auto [s, notes] = score_match(user, r);

        out.push_back(MatchResult{
            r.id,
            r.name,
            s,
            notes
        });
    }

    sort(out.begin(), out.end(), [](const MatchResult& a, const MatchResult& b){
        return a.score > b.score;
    });

    if (out.size() > top_k) out.resize(top_k);
    return out;
}

// ------------------------- Matching Core (Employment) -------------------------

static pair<bool, vector<string>> job_hard_eligibility(const UserProfile& user, const Employment& e) {
    if (e.min_age && user.age < *e.min_age) return {false, {"age_below_min"}};
    if (e.max_age && user.age > *e.max_age) return {false, {"age_above_max"}};

    if (!e.req_education.empty() && e.req_education != user.education){
        return {false, {"education_required"}};
    }
    if (!e.zip.empty() && e.zip != user.zip){
        return {false, {"wrong_zip"}};
    }

    unordered_set<string> user_docs(user.documentation.begin(), user.documentation.end());
    if (!e.requires_docs_all.empty()) {
        for (const auto& d : e.requires_docs_all){
            if (!user_docs.count(d)) return {false, {"missing_required_docs_all"}};
        }
    }
    if (!e.requires_docs_any.empty()) {
        bool has_any = false;
        for (const auto& d : e.requires_docs_any) {
            if (user_docs.count(d)) { has_any = true; break; }
        }
        if (!has_any) return {false, {"missing_required_docs_any"}};
    }

    // Capacity policy: exclude if known zero openings and no waitlist
    if (e.capacity.available_beds == 0 && !e.capacity.waitlist)
        return {false, {"no_open_positions"}};

    return {true, {}};
}

static pair<int, vector<string>> job_score(const UserProfile& user, const Employment& e) {
    int score = 0;
    vector<string> notes;
    unordered_set<string> tags(e.soft_tags.begin(), e.soft_tags.end());

    // Open positions signal
    if (e.capacity.available_beds > 0) {
        score += 1; notes.push_back("positions_available");
    }

    // Soft tags
    if (tags.count("lgbtq_friendly") && user.lgbtq) { score += 2; notes.push_back("lgbtq_friendly"); }
    if (tags.count("serves_families") && user.has_children) { score += 1; notes.push_back("family_friendly"); }
    if (tags.count("pet_friendly") && user.has_pets) { score += 1; notes.push_back("pet_friendly"); }

    // Preference alignment
    if (!user.preferred_categories.empty()) {
        if (find(user.preferred_categories.begin(), user.preferred_categories.end(), e.category)
            != user.preferred_categories.end()) {
            score += 1; notes.push_back("category_preference");
        }
    }

    return {score, notes};
}

static vector<MatchResult> match_jobs(const UserProfile& user, const vector<Employment>& jobs, size_t top_k = 10) {
    vector<MatchResult> out;
    out.reserve(jobs.size());

    for (const auto& e : jobs) {
        auto [ok, _reasons] = job_hard_eligibility(user, e);
        if (!ok) continue;
        auto [s, notes] = job_score(user, e);
        out.push_back(MatchResult{
            e.id,
            e.job_name,
            s,
            notes
        });
    }

    sort(out.begin(), out.end(), [](const MatchResult& a, const MatchResult& b){
        return a.score > b.score;
    });

    if (out.size() > top_k) out.resize(top_k);
    return out;
}

// ------------------------- Demo main -------------------------

int main() {
    UserProfile user;
    user.id = "user_123";
    user.age = 36;
    user.gender = "woman";
    user.education = "none";
    user.veteran = false;
    user.lgbtq = true;
    user.has_children = true;
    user.has_pets = true;
    user.has_disability = true;
    user.employment = false;
    user.income_monthly = 400.0;
    user.documentation = {"state_id"};
    user.zip = "90210";
    user.preferred_categories = {"shelter","food"};

    Resource r1;
    r1.id = "res_987";
    r1.name = "Safe Harbor Women's Center";
    r1.category = "shelter";
    r1.eligibility.age_min = 18;
    r1.eligibility.genders_allowed = {"woman","nonbinary"};
    r1.eligibility.requires_veteran = false;
    r1.eligibility.requires_children = false;
    r1.eligibility.income_max_monthly = 1200.0;
    r1.eligibility.requires_docs_any = {"state_id","passport"};
    r1.soft_tags = {"women_only","trauma_informed","lgbtq_friendly","pet_friendly"};
    r1.capacity.available_beds = 3;
    r1.capacity.waitlist = false;

    Resource r2;
    r2.id = "res_555";
    r2.name = "Community Food Hub";
    r2.category = "food";
    r2.eligibility.age_min = nullopt;
    r2.eligibility.genders_allowed = {}; // all
    r2.eligibility.income_max_monthly = nullopt;
    r2.soft_tags = {"serves_families"};
    r2.capacity.available_beds = -1; // not applicable

    Resource r3;
    r3.id = "res_777";
    r3.name = "Vet-Only Shelter";
    r3.category = "shelter";
    r3.eligibility.requires_veteran = true; // user is not a veteran
    r3.capacity.available_beds = 5;

    // Employment demo data
    Employment j1;
    j1.id = "job_001";
    j1.job_name = "Community Cafe Barista";
    j1.category = "food service";
    j1.min_age = 18;
    j1.max_age = 65;
    j1.req_education = "none";
    j1.zip = "90210";
    j1.requires_docs_any = {"state_id"};
    j1.requires_docs_all = {}; // none
    j1.soft_tags = {"lgbtq_friendly"};
    j1.capacity.available_beds = 2;  // open positions
    j1.capacity.waitlist = false;

    Employment j2;
    j2.id = "job_002";
    j2.job_name = "Evening Shelter Attendant";
    j2.category = "shelter";
    j2.min_age = 21;
    j2.max_age = 70;
    j2.req_education = "none";
    j2.zip = "90210";
    j2.requires_docs_any = {}; // none
    j2.requires_docs_all = {}; // none
    j2.soft_tags = {"serves_families"};
    j2.capacity.available_beds = 0;  // zero openings
    j2.capacity.waitlist = true;     // waitlist present, so not excluded

    vector<Resource> resources = {r1, r2, r3};
    vector<Employment> jobs = {j1, j2};

    auto matches = match_resources(user, resources, 10);
    cout << "Resource Matches (" << matches.size() << "):\n";
    for (const auto& m : matches) {
        cout << " - " << m.name
             << " | score=" << m.score
             << " | notes=[";
        for (size_t i = 0; i < m.explanations.size(); ++i) {
            cout << m.explanations[i] << (i + 1 < m.explanations.size() ? "," : "");
        }
        cout << "]\n";
    }

    auto job_matches = match_jobs(user, jobs, 10);
    cout << "Job Matches (" << job_matches.size() << "):\n";
    for (const auto& m : job_matches) {
        cout << " - " << m.name
             << " | score=" << m.score
             << " | notes=[";
        for (size_t i = 0; i < m.explanations.size(); ++i) {
            cout << m.explanations[i] << (i + 1 < m.explanations.size() ? "," : "");
        }
        cout << "]\n";
    }

    return 0;
}
