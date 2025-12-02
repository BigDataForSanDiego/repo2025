import os, json, uuid, datetime as dt
from typing import Optional, Dict, Any, Tuple, List
from flask import Flask, request, jsonify, send_from_directory
from dotenv import load_dotenv
from geopy.distance import geodesic

# load .env variables
load_dotenv()

app = Flask(__name__)

# File Paths
BASE_DIR = os.path.dirname(__file__)
DATA_PATH = os.environ.get("VOICELINK_DATA", os.path.join(BASE_DIR, "..", "data"))
SERVICES_FILE = os.path.join(DATA_PATH, "services-refined.json")
AVAIL_FILE = os.path.join(DATA_PATH, "availability.json")   # name-keyed availability (lowercase keys recommended)
LOGS_FILE = os.path.join(DATA_PATH, "logs.jsonl")
WEB_DIR = os.path.join(BASE_DIR, "..", "web")

# Helpers
def normalize_name(name: str) -> str:
    return (name or "").strip().lower()

def distance(lat1, lon1, lat2, lon2) -> float:
    try:
        km = float(geodesic((lat1, lon1), (lat2, lon2)).km)
        return km * 0.621371
    except Exception:
        return 0.0

# =========================
# Availability loader (by NAME)
# =========================
# We keep a cache of the *normalized* availability map for fast joins.
_avail_cache: Dict[str, Any] = {"data": None, "ts": 0.0}

def _load_availability_raw() -> Dict[str, Any]:
    try:
        with open(AVAIL_FILE, "r", encoding="utf-8") as f:
            raw = json.load(f)
            return raw if isinstance(raw, dict) else {}
    except Exception:
        return {}

def get_availability() -> Dict[str, Any]:
    now = dt.datetime.utcnow().timestamp()
    if not _avail_cache["data"] or now - _avail_cache["ts"] > 30:
        raw = _load_availability_raw()
        norm = {normalize_name(k): v for k, v in raw.items()}
        _avail_cache["data"] = norm
        _avail_cache["ts"] = now
    return _avail_cache["data"]

def set_availability_map(raw_map: Dict[str, Any]) -> None:
    os.makedirs(os.path.dirname(AVAIL_FILE), exist_ok=True)
    with open(AVAIL_FILE, "w", encoding="utf-8") as f:
        json.dump(raw_map, f, ensure_ascii=False, indent=2)
    # refresh cache
    _avail_cache["data"] = {normalize_name(k): v for k, v in raw_map.items()}
    _avail_cache["ts"] = dt.datetime.utcnow().timestamp()

def is_stale(entry: Dict[str, Any]) -> bool:
    try:
        lu = dt.datetime.fromisoformat((entry.get("last_updated") or "").replace("Z", ""))
        ttl = int(entry.get("ttl_minutes", 120))
        return (dt.datetime.utcnow() - lu) > dt.timedelta(minutes=ttl)
    except Exception:
        return True

# =========================
# Service loading / helpers
# =========================
def load_services() -> List[Dict[str, Any]]:
    with open(SERVICES_FILE, "r", encoding="utf-8") as f:
        services = json.load(f)

    seen = set()
    out = []
    for s in services:
        # normalize categories
        cats = s.get("category", [])
        if isinstance(cats, list):
            s["category"] = [str(c).strip().lower() for c in cats]
        elif isinstance(cats, str):
            s["category"] = [cats.strip().lower()]
        else:
            s["category"] = []

        # light canonicalization
        CANON = {
            "restrooms": "restroom",
            "toilets": "toilet",
            "bathrooms": "bathroom",
            "groceries": "food",
        }
        s["category"] = [CANON.get(c, c) for c in s["category"]]

        # availability join key
        s["name_key"] = normalize_name(s.get("name", ""))

        key = (s.get("name", "").strip().lower(), s.get("address", "").strip().lower())
        if key not in seen:
            seen.add(key)
            out.append(s)
    return out

# =========================
# INTENT classifier (Groq) + fallback
# =========================
INTENT_LABELS = [
    "emergency shelter",
    "safe parking",
    "food",
    "mental health",
    "rental assistance",
    "clinic",
    "housing",
    "youth shelter",
    "showers",
]

def normalize_need(need_text: str) -> Optional[str]:
    text = (need_text or "").strip()
    if not text:
        return None
    intent = classify_intent_groq(text)
    if intent in INTENT_LABELS:
        return intent
    return _fallback_rules(text.lower())

def _fallback_rules(t: str) -> Optional[str]:
    if any(k in t for k in ["shelter", "bed", "sleep"]): return "emergency shelter"
    if any(k in t for k in ["parking", "vehicle", "rv"]): return "safe parking"
    if any(k in t for k in ["food", "meal", "hungry", "pantry", "grocer"]): return "food"
    if any(k in t for k in ["mental", "depress", "anx", "suicid", "therapy", "counsel"]): return "mental health"
    if any(k in t for k in ["rent", "evict", "utility", "deposit"]): return "rental assistance"
    if any(k in t for k in ["doctor", "clinic", "medical", "nurse", "urgent"]): return "clinic"
    if "housing" in t or "voucher" in t or "navigator" in t: return "housing"
    if any(k in t for k in ["youth", "teen", "minor"]): return "youth shelter"
    if any(k in t for k in ["washroom", "restroom", "toilet", "bathroom", "shower", "hygiene"]): return "showers"
    return None

def classify_intent_groq(user_text: str) -> Optional[str]:
    provider = (os.getenv("LLM_PROVIDER") or "").lower()
    if provider != "groq":
        return None
    api_key = os.getenv("GROQ_API_KEY")
    model = os.getenv("GROQ_MODEL") or "llama-3.1-8b-instant"
    if not api_key:
        return None

    cache_key = json.dumps({"t": user_text.strip().lower(), "m": model})
    if not hasattr(classify_intent_groq, "_cache"):
        classify_intent_groq._cache = {}
    if cache_key in classify_intent_groq._cache:
        return classify_intent_groq._cache[cache_key]

    labels_csv = ", ".join(f'"{l}"' for l in INTENT_LABELS)
    system_prompt = (
        "Classify the user's short request into exactly one label from a fixed list. "
        "Return strict JSON only: {\"intent\":\"<label or null>\",\"confidence\":0-1}. "
        f"Labels: {', '.join(INTENT_LABELS)}. If none fit, use null."
    )
    user_prompt = f"""User text: {user_text}

Rules:
- Choose only from: [{labels_csv}]
- Prefer the most obvious help-seeking intent.
- If unclear, use null.

Return only JSON:
{{"intent":"<one of labels or null>","confidence":0.xx}}"""

    try:
        from groq import Groq
        client = Groq(api_key=api_key)
        resp = client.chat.completions.create(
            model=model,
            temperature=0,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )
        content = resp.choices[0].message.content
        data = json.loads(content) if content else {}
        intent = (data.get("intent") or "").strip().lower()
        if intent in INTENT_LABELS:
            classify_intent_groq._cache[cache_key] = intent
            return intent
        return None
    except Exception:
        return None

#Intent - Acceptable Tags
INTENT_TAGS = {
    "emergency shelter": {"emergency shelter", "tents", "shelter"},
    "youth shelter": {"youth shelter", "emergency shelter"},
    "food": {"food", "meals", "pantry", "groceries"},
    "showers": {"showers", "restrooms", "restroom", "hygiene", "toilet", "bathroom"},
    "safe parking": {"safe parking", "parking space"},
    "mental health": {"mental health", "mental health treatment", "therapy", "counseling"},
    "clinic": {"clinic", "medical", "doctor", "nurse", "urgent care"},
    "housing": {"housing", "housing navigation"},
    "rental assistance": {"rental assistance", "emergency rental or mortgage assistance", "utility"},
}

def suggest_categories(need_text, limit=4):
    text = (need_text or "").lower()
    hints = []
    for cat, keys in {
        "emergency shelter": ["shelter", "bed", "sleep"],
        "food": ["food", "meal", "hungry", "pantry"],
        "mental health": ["mental", "depress", "anx", "counsel"],
        "safe parking": ["car", "parking", "vehicle", "rv"],
        "rental assistance": ["rent", "evict", "utility"],
        "clinic": ["doctor", "clinic", "medical"],
        "housing": ["housing", "voucher", "navigator"],
        "youth shelter": ["youth", "teen", "young"],
        "showers": ["washroom", "restroom", "toilet", "bathroom", "shower", "hygiene"],
    }.items():
        if any(k in text for k in keys):
            hints.append(cat)
    if not hints:
        hints = ["emergency shelter", "food", "mental health", "safe parking"]
    return hints[:limit]

def log_event(payload):
    os.makedirs(os.path.dirname(LOGS_FILE), exist_ok=True)
    with open(LOGS_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps(payload) + "\n")

def match_services(need: str, lat: float, lon: float, k: int = 5) -> Tuple[Optional[str], List[Dict[str, Any]]]:
    services = load_services()
    target_intent = normalize_need(need)

    if target_intent is None:
        return None, []

    allowed = INTENT_TAGS.get(target_intent, {target_intent})
    matching = [s for s in services if any(tag in allowed for tag in s.get("category", []))]
    candidates = matching if matching else services

    rows: List[Tuple[float, Dict[str, Any]]] = []
    for s in candidates:
        dist_mi = distance(lat, lon, s["lat"], s["lon"])
        rows.append((dist_mi, s))

    avail = get_availability()

    def tie_break_score(svc: Dict[str, Any]) -> int:
        a = avail.get(svc.get("name_key", ""), {})
        ba = a.get("beds_available")
        return -(ba if isinstance(ba, int) else -1)

    rows.sort(key=lambda x: (x[0], tie_break_score(x[1])))

    out: List[Dict[str, Any]] = []
    for dist_mi, s in rows[:k]:
        item = {k2: s[k2] for k2 in ["name", "phone", "address", "hours", "eligibility"] if k2 in s}
        item["distance_miles"] = round(dist_mi, 1)
        item["category"] = s.get("category", [])

        a = avail.get(s.get("name_key", ""), None)
        if a:
            item["availability"] = {
                "beds_total": a.get("beds_total"),
                "beds_available": a.get("beds_available"),
                "last_updated": a.get("last_updated"),
                "stale": is_stale(a),
                "notes": a.get("notes"),
            }

        out.append(item)

    return target_intent, out

# Lat/Long Helper - ZIP
def latlon_from_zip(zip_code: str):
    z = (zip_code or "").strip()[:5]
    if not z.isdigit() or len(z) != 5:
        return None
    try:
        import pgeocode
        nomi = pgeocode.Nominatim("us")
        r = nomi.query_postal_code(z)
        if r is not None and r.latitude == r.latitude and r.longitude == r.longitude:
            return float(r.latitude), float(r.longitude)
    except ImportError:
        pass
    fallback = {
        "92101": (32.719, -117.162),
        "92102": (32.711, -117.119),
        "92103": (32.742, -117.165),
        "92104": (32.741, -117.129),
        "92105": (32.737, -117.092),
        "92110": (32.763, -117.201),
        "92113": (32.695, -117.128),
        "92116": (32.762, -117.122),
        "92021": (32.817, -116.936),
        "91910": (32.640, -117.083),
    }
    return fallback.get(z)

# Routes
@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "VoiceLink API is running",
        "endpoints": {
            "GET /health": "Basic health check",
            "GET /demo": "Microphone demo page",
            "GET /admin": "Admin UI page",
            "GET /zip_to_latlon?zip=92101": "Zip to lat/lon",
            "GET /debug_distance?lat=..&lon=..&to_lat=..&to_lon=..": "Distance in miles",
            "POST /match": "Match: {need, lat, lon | zip, k?} -> services",
            "GET/POST /availability": "Admin: read/upsert name-based availability",
            "POST /availability/delete": "Admin: delete availability entry by name",
            "POST /log": "Append a custom event to logs"
        }
    })

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"ok": True})

@app.route("/demo", methods=["GET"])
def demo():
    return send_from_directory(WEB_DIR, "index.html")

@app.route("/admin", methods=["GET"])
def admin_page():
    return send_from_directory(WEB_DIR, "admin.html")

@app.route("/debug_distance", methods=["GET"])
def debug_distance():
    try:
        lat = float(request.args.get("lat"))
        lon = float(request.args.get("lon"))
        to_lat = float(request.args.get("to_lat"))
        to_lon = float(request.args.get("to_lon"))
    except (TypeError, ValueError):
        return jsonify({"error": "Provide lat, lon, to_lat, to_lon as numbers"}), 400

    mi = distance(lat, lon, to_lat, to_lon)
    return jsonify({
        "from": {"lat": lat, "lon": lon},
        "to": {"lat": to_lat, "lon": to_lon},
        "distance_miles": round(mi, 4)
    })

@app.route("/zip_to_latlon", methods=["GET"])
def zip_to_latlon():
    zipc = request.args.get("zip", "")
    loc = latlon_from_zip(zipc)
    if not loc:
        return jsonify({}), 400
    return jsonify({"lat": loc[0], "lon": loc[1]})

@app.route("/match", methods=["POST"])
def match():
    data = request.get_json(force=True)
    need = data.get("need", "")
    session_id = data.get("session_id") or str(uuid.uuid4())

    lat_raw, lon_raw = data.get("lat"), data.get("lon")
    lat = lon = None
    try:
        if lat_raw is not None and lon_raw is not None:
            lat = float(lat_raw)
            lon = float(lon_raw)
    except (TypeError, ValueError):
        lat = lon = None

    if (lat is None or lon is None) and data.get("zip"):
        loc = latlon_from_zip(str(data.get("zip")))
        if loc:
            lat, lon = loc

    if lat is None or lon is None:
        return jsonify({"error": "Missing or invalid lat/lon. Provide numeric lat & lon, or a valid zip."}), 400

    k_req = int(data.get("k", 5))
    category, results = match_services(need, lat, lon, k=k_req)

    if category is None:
        return jsonify({
            "needs_confirmation": True,
            "suggested_categories": suggest_categories(need),
            "session_id": session_id,
            "requested_k": k_req
        })

    event = {
        "ts": dt.datetime.utcnow().isoformat() + "Z",
        "session_id": session_id,
        "lat": round(float(lat), 5),
        "lon": round(float(lon), 5),
        "need_raw": need[:120],
        "need_category": category,
        "returned": len(results),
        "results": results,
    }
    log_event(event)

    return jsonify({
        "category": category,
        "results": results,
        "session_id": session_id,
        "requested_k": k_req,
        "origin": {"lat": lat, "lon": lon}
    })

# Admin Availability
@app.route("/availability", methods=["GET", "POST"])
def availability_endpoint():
    secret = request.headers.get("X-Admin-Token")
    if secret != os.getenv("ADMIN_TOKEN"):
        return jsonify({"error": "unauthorized"}), 401

    if request.method == "GET":
        return jsonify({"ok": True, "availability": _load_availability_raw()})

    payload = request.get_json(force=True)
    name = payload.get("service_name")
    if not name:
        return jsonify({"error": "service_name required"}), 400

    key = normalize_name(name)
    data = _load_availability_raw()
    entry = {
        "beds_total": int(payload.get("beds_total", 0)),
        "beds_available": int(payload.get("beds_available", 0)),
        "last_updated": dt.datetime.utcnow().isoformat() + "Z",
        "source": payload.get("source", "manual"),
        "source_url": payload.get("source_url"),
        "ttl_minutes": int(payload.get("ttl_minutes", 120)),
        "notes": payload.get("notes"),
    }
    data[key] = entry
    set_availability_map(data)
    return jsonify({"ok": True, "service_name": name, "key": key, "entry": entry})

@app.route("/availability/delete", methods=["POST"])
def availability_delete():
    secret = request.headers.get("X-Admin-Token")
    if secret != os.getenv("ADMIN_TOKEN"):
        return jsonify({"error": "unauthorized"}), 401

    payload = request.get_json(force=True)
    name = payload.get("service_name")
    if not name:
        return jsonify({"error": "service_name required"}), 400

    key = normalize_name(name)
    data = _load_availability_raw()
    if key in data:
        del data[key]
        set_availability_map(data)
        return jsonify({"ok": True, "deleted": name})
    return jsonify({"ok": True, "deleted": None, "note": "not found"})

@app.route("/log", methods=["POST"])
def add_log():
    data = request.get_json(force=True)
    data["ts"] = data.get("ts") or (dt.datetime.utcnow().isoformat() + "Z")
    log_event(data)
    return jsonify({"ok": True})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    app.run(host="0.0.0.0", port=port)