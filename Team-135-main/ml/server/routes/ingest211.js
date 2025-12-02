import fetch from 'node-fetch';
import { parse } from 'csv-parse/sync';

function toFloat(x){
  const v = parseFloat(String(x||'').trim());
  return Number.isFinite(v) ? v : null;
}

function normalizeRow(r){
  const name = r.service_name || r.name || r.Name || r.title || r.Title || '';
  const type = (r.service_category || r.type || r.Type || r.category || r.Category || '').toLowerCase();
  const lat = toFloat(r.lat || r.latitude || r.Lat || r.Latitude);
  const lng = toFloat(r.lng || r.lon || r.long || r.longitude || r.Lon || r.Longitude);
  const address = r.address || r.Address || '';
  const contact = r.contact_phone || r.phone || r.Phone || r.contact || r.Contact || '';
  const status = r.service_status || r.status || r.Status || '';
  const wait_minutes = toFloat(r.wait || r.wait_minutes || r.Wait);
  const hours_json = r.hours_of_operation || r.hours || r.Hours || '';
  const last_verified_at = r.last_verified || r.verified_at || r.last_verified_at || r.Verified || '';

  return {
    source: '211',
    name,
    type,
    lat,
    lng,
    hours_json,
    eligibility_notes: null,
    address,
    contact,
    status,
    capacity_available: null,
    wait_minutes,
    last_verified_at
  };
}

export default function ingest211(app){
  app.get('/v1/211/json', async (_req,res)=>{
    try{
      const url = process.env.API_211_CSV_URL || '';
      if(!url) return res.status(400).json({ error:'missing_API_211_CSV_URL' });

      const r = await fetch(url, { headers: { 'cache-control':'no-cache' } });
      if(!r.ok) throw new Error(`fetch_failed ${r.status}`);
      const csv = await r.text();

      const rows = parse(csv, { columns:true, skip_empty_lines:true });
      const items = rows.map(normalizeRow).filter(x=> Number.isFinite(x.lat) && Number.isFinite(x.lng));
      res.json({ data: items });
    }catch(e){
      res.status(500).json({ error:'ingest211_failed', detail:String(e) });
    }
  });
}
