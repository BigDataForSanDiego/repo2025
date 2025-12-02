export function mapSdheartFeature(f) {
  const coords = f.geometry?.coordinates || [];
  const [lng, lat] = coords;
  return {
    source: "sdheart",
    name: f.properties?.name || "Unnamed Site",
    type: "shelter",
    lat,
    lng,
    address: "",
    contact: "",
    hours_json: "",
    last_verified_at: new Date().toISOString(),
  };
}


export function map211Item(s) {
  return {
    source: '211',
    name: s.service_name || s.name || null,
    type: (s.service_category || s.type || '').toLowerCase() || null,
    lat: Number(s.latitude ?? s.lat ?? NaN),
    lng: Number(s.longitude ?? s.lng ?? NaN),
    hours_json: s.hours_of_operation || s.hours || null,
    eligibility_notes: s.eligibility || null,
    address: s.address || null,
    contact: s.contact_phone || s.phone || null,
    status: s.service_status || null,
    capacity_available: s.capacity_available ?? null,
    wait_minutes: s.wait_time ?? null,
    last_verified_at: s.last_verified || null
  };
}

export function dedupeUnified(list) {
  const seen = new Set();
  const out = [];
  for (const it of list) {
    const key = `${(it.name||'').toLowerCase()}|${Math.round((it.lat||0)*1000)}|${Math.round((it.lng||0)*1000)}`;
    if (!seen.has(key)) { seen.add(key); out.push(it); }
  }
  return out;
}
