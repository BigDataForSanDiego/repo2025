import pandas as pd, re, json, os

files = [r"data\raw\SafeSleepSites.xlsx", r"data\raw\SafeParking.xlsx"]
existing_json = r"data\services-refined.json"

def dms_to_decimal(dms_str):
    pattern = r"(\d+)°(\d+)'([\d.]+)\"([NSEW])"
    matches = re.findall(pattern, dms_str)
    if len(matches) < 2:
        raise ValueError("Could not parse coordinates")
    
    def convert(deg, min, sec, direction):
        decimal = float(deg) + float(min)/60 + float(sec)/3600
        if direction in ['S', 'W']:
            decimal = -decimal
        return decimal
    
    lat = convert(*matches[0])
    lon = convert(*matches[1])

    return lat, lon

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

count = 0

for input_xlsx in files:

    df = pd.read_excel(input_xlsx)

    df = df.rename(columns={
        "Location Name": "name",
        "Street Address": "address"
    })

    if "Coordinates" in df.columns:
        lat_list, lon_list = [], []
        for val in df["Coordinates"]:
            lat, lon = dms_to_decimal(val)
            lat_list.append(lat)
            lon_list.append(lon)
        df["lat"] = lat_list
        df["lon"] = lon_list
        df = df.drop(columns=["Coordinates"])

    if "Services Offered" in df.columns:
        df["category"] = (
            df["Services Offered"]
            .fillna("")
            .apply(lambda x: [
                s.strip().capitalize()
                for s in re.split(r"[;,]", str(x).replace(" and ", ", "))
                if s.strip() and s.strip().lower() != "and"
            ])
        )
        df = df.drop(columns=["Services Offered"])

    if "SafeParking" in input_xlsx:
        df['phone'] = "858-637-3373"
        df = df.drop(columns=["Vehicle Type", "Time Open"])

    elif "SafeSleepSites" in input_xlsx:
        df['phone'] = "Call 2-1-1 for info"
        df = df.drop(columns=["Population Served", "Capacity"])
    
    df['hours'] = "Contact for hours"
    df['eligibility'] = "Contact for eligibility"

    records = df.to_dict(orient="records")

    data.extend(records)

    count += len(df)

with open(existing_json, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Clean JSON saved → {existing_json} ({count} rows)")