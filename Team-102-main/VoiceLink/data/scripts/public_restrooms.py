import json, os, requests
from dotenv import load_dotenv

load_dotenv()

INPUT_FILE = r"data\raw\DPR_Public_Restrooms.json"
OUTPUT_FILE = r"data\raw\Public_Restrooms_Lat_Long.json"

def get_lat_lon(address):
    try:
        url = "https://nominatim.openstreetmap.org/search"
        params = {
            "q": address,
            "format": "json",
            "limit": 1,
            "email": os.getenv("EMAIL_FOR_NOMINATIM")
        }
        resp = requests.get(url, params=params, timeout=15)
        data = resp.json()
        if data:
            lat = float(data[0]["lat"])
            lon = float(data[0]["lon"])
            return lat, lon
    except Exception as e:
        print(f"Error for {address}: {e}")
    return None, None


def main():
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        places = json.load(f)

    enriched = []
    for i, item in enumerate(places, 1):
        name = item.get("name")
        address = item.get("address")
        print(f"[{i}/{len(places)}] Geocoding: {name} — {address}")
        lat, lon = get_lat_lon(address)
        item["lat"] = lat
        item["lon"] = lon
        item["hours"] = item.get("hours") + " | " + item.get("location")
        item["phone"] = "No need to call"
        item["eligibility"] = "Open to all"
        item["category"] = ["restroom"]
        item.pop("restroom_type", None)
        item.pop("location", None)
        enriched.append(item)

    filtered_records = [
        r for r in enriched
        if r.get("lat") not in (None, "", "None") and r.get("lon") not in (None, "", "None")
    ]

    # with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    #     json.dump(filtered_records, f, ensure_ascii=False, indent=2)

    existing_json = r"data\services-refined.json"

    if os.path.exists(existing_json) and os.path.getsize(existing_json) > 0:
        try:
            with open(existing_json, "r", encoding="utf-8") as f:
                data = json.load(f)
                if not isinstance(data, list):
                    data = [data]
        except json.JSONDecodeError:
            data = []
    else:
        data = []

    data.extend(filtered_records)

    with open(existing_json, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"\nDone! Saved {len(filtered_records)} records to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
