import io, os, re, json, csv, time
import requests
import pdfplumber
import uuid
from dotenv import load_dotenv

load_dotenv()

URL = "https://www.sandiegocounty.gov/content/dam/sdc/sdhcd/docs/rental-assistance/Trifold_pamphlet_Emergency_contacts_FINAL.pdf"

EMAIL_FOR_NOMINATIM = os.getenv("EMAIL_FOR_NOMINATIM")
NOMINATIM_BASE = "https://nominatim.openstreetmap.org/search"
REQUESTS_TIMEOUT = 20
RATE_LIMIT_SECONDS = 1.1
MAX_RETRIES = 3

REGION_RE = re.compile(
    r"^(Central County and Downtown|East County|North County(?: \(Continued\))?|North County|South County|Contact Information)$",
    re.I
)
PHONE_RE = re.compile(r"\(\s*\d{3}\s*\)\s*\d{3}\s*-\s*\d{4}")
LABELLED_PHONE_RE = re.compile(
    r"(?:(Crisis Help Line|24/7 Hotline|Office|General Contact|Housing|Hotline|Crisis Line)\s*:?\s*)?"
    r"(\(\s*\d{3}\s*\)\s*\d{3}\s*-\s*\d{4})",
    re.I
)
POP_HINTS = [
    "homeless","single","families","women","children","men","veterans",
    "ages","residential","emergency rental","mortgage assistance","youth","only"
]
STREET_TOKENS = [" Ave", " St", " Blvd", " Way", " Hwy", " Dr", " Road", " Rd", " Avenue", " Ct", " Pl"]
VETERANS_NAME_PREFIXES = ("Veterans", "VA")
CITIES = {"San Diego","Chula Vista","Oceanside","Escondido","Encinitas","Vista","Carlsbad","El Cajon"}

def is_region(t): return bool(REGION_RE.match(t.strip()))
def is_phone_line(t): return bool(PHONE_RE.search(t))
def is_population_line(t):
    s = t.strip()
    return bool(s) and len(s) <= 120 and any(w in s.lower() for w in POP_HINTS)
def is_address_like(t):
    s = t.strip()
    has_digit = bool(re.search(r"\d", s))
    streetish = any(tok in s for tok in STREET_TOKENS)
    specials = "Multiple Locations" in s or "Location " in s
    city_only = s in CITIES
    return specials or city_only or (has_digit and ("," in s or streetish))
def collect_labelled_phones(s):
    out = []
    for lab, num in LABELLED_PHONE_RE.findall(s):
        out.append({"label": lab.strip() if lab else None, "number": re.sub(r"\s+", " ", num)})
    if not out:
        for num in PHONE_RE.findall(s):
            out.append({"label": None, "number": re.sub(r"\s+", " ", num)})
    return out

def load_pdf_bytes():
    r = requests.get(URL, timeout=REQUESTS_TIMEOUT)
    r.raise_for_status()
    return io.BytesIO(r.content)

def geocode_query_address_only(session, address, cache, sleep_between=True):
    """Query Nominatim with address only. Returns (lat, lon) or (None, None)."""
    if not address:
        return None, None
    q = address.strip()
    if not q:
        return None, None

    if not any(city.lower() in q.lower() for city in CITIES) and " CA" not in q.upper():
        q = f"{q}, San Diego County, CA"

    if q in cache:
        return cache[q]

    params = {"q": q, "format": "jsonv2", "email": EMAIL_FOR_NOMINATIM}
    headers = {"User-Agent": f"SanDiegoShelters/1.0 ({EMAIL_FOR_NOMINATIM})", "Accept": "application/json"}

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            if sleep_between and attempt > 1:
                time.sleep(RATE_LIMIT_SECONDS * attempt)
            time.sleep(RATE_LIMIT_SECONDS)
            resp = session.get(NOMINATIM_BASE, params=params, headers=headers, timeout=REQUESTS_TIMEOUT)
            resp.raise_for_status()
            data = resp.json()
            if isinstance(data, list) and data:
                lat, lon = data[0].get("lat"), data[0].get("lon")
                cache[q] = (lat, lon)
                return float(lat), float(lon)
            cache[q] = (None, None)
            return None, None
        except Exception:
            pass
    cache[q] = (None, None)
    return None, None

def parse_pdf_to_records(pdf_bytes):
    records = []
    with pdfplumber.open(pdf_bytes) as pdf:
        for page in pdf.pages:
            w, h = page.width, page.height
            cols = [(0, 0, w/3, h), (w/3, 0, 2*w/3, h), (2*w/3, 0, w, h)]

            for (x0, y0, x1, y1) in cols:
                col = page.crop((x0, y0, x1, y1))
                words = col.extract_words(use_text_flow=True, extra_attrs=["fontname","size"]) or []
                if not words:
                    continue
                words.sort(key=lambda w: (round(w["top"],1), w["x0"]))

                lines, buf = [], []
                cur_top = round(words[0]["top"], 1)
                def flush_line():
                    if not buf: return
                    txt = " ".join(w["text"] for w in buf).strip()
                    boldish = any(("Bold" in (w.get("fontname") or "")) or (float(w.get("size",0)) >= 11.6)
                                  for w in buf)
                    lines.append({"text": txt, "bold": boldish})

                for wobj in words:
                    top = round(wobj["top"], 1)
                    if abs(top - cur_top) <= 1.2:
                        buf.append(wobj)
                    else:
                        flush_line()
                        buf = [wobj]
                        cur_top = top
                flush_line()

                def looks_like_org_header(txt, bold):
                    if not bold:
                        return False
                    if is_phone_line(txt) or is_address_like(txt) or is_region(txt):
                        return False
                    starts_v = txt.strip().startswith(VETERANS_NAME_PREFIXES)
                    if is_population_line(txt) and not starts_v:
                        return False
                    return True

                i = 0
                while i < len(lines):
                    t = lines[i]["text"]; b = lines[i]["bold"]
                    if is_region(t) or t.upper() in {"EMERGENCY","SHELTER","CONTACTS"}:
                        i += 1; continue

                    if looks_like_org_header(t, b):
                        name_parts, j = [t], i + 1
                        while j < len(lines):
                            t2, b2 = lines[j]["text"], lines[j]["bold"]
                            if looks_like_org_header(t2, b2):
                                name_parts.append(t2); j += 1
                            else:
                                break
                        if j < len(lines):
                            t_next, b_next = lines[j]["text"], lines[j]["bold"]
                            if re.fullmatch(r"\([A-Za-z0-9&.\-]+\)", t_next.strip()) and not b_next:
                                name_parts.append(t_next.strip()); j += 1
                        name = " ".join(name_parts).replace("  ", " ").strip(" -–—")
                        i = j

                        addr, phones, pops = [], [], []
                        while i < len(lines):
                            t3, b3 = lines[i]["text"], lines[i]["bold"]
                            if looks_like_org_header(t3, b3) or is_region(t3):
                                break
                            if is_phone_line(t3):
                                phones.extend(collect_labelled_phones(t3)); i += 1; continue
                            if is_population_line(t3) or t3 == "Only Tuesdays and Thursdays":
                                pops.append(t3); i += 1; continue
                            if is_address_like(t3) or len(t3) < 80:
                                addr.append(t3); i += 1; continue
                            i += 1

                        seen, uniq = set(), []
                        for ph in phones:
                            key = ((ph["label"] or "").lower(), ph["number"])
                            if key not in seen:
                                seen.add(key); uniq.append(ph)

                        records.append({
                            "name": name or None,
                            "address": (" ".join(addr)).strip() or None,
                            "phone": "; ".join(
                                [f'{p["label"]}: {p["number"]}' if p["label"] else p["number"] for p in uniq]
                            ) or None,
                            "eligibility": ("; ".join(pops)).strip() or "Contact for eligibility",
                            "category": ["emergency shelter"],
                            "hours": "Contact for hours"
                        })
                        continue
                    i += 1
    return records

def main():
    pdf_bytes = load_pdf_bytes()
    records = parse_pdf_to_records(pdf_bytes)

    # Geocode using ADDRESS ONLY
    session = requests.Session()
    cache = {}
    for r in records:
        lat, lon = geocode_query_address_only(session, r.get("address"), cache)
        r["lat"] = lat
        r["lon"] = lon

    # ---- Filter: only keep records that have lat/lon ----
    filtered_records = [
        r for r in records
        if r.get("lat") not in (None, "", "None") and r.get("lon") not in (None, "", "None")
    ]

    file = r"data\services-refined.json"

    if os.path.exists(file) and os.path.getsize(file) > 0:
        try:
            with open(file, "r", encoding="utf-8") as f:
                data = json.load(f)
                if not isinstance(data, list):
                    data = [data]
        except json.JSONDecodeError:
            data = []
    else:
        data = []
    
    data.extend(filtered_records)
    
    # Save filtered only
    with open(file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"Done. {len(filtered_records)} of {len(records)} entries have lat/lon.")

if __name__ == "__main__":
    main()