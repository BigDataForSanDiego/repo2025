import fetch from 'node-fetch';
import { LRUCache } from 'lru-cache';
import { mapSdheartFeature, map211Item, dedupeUnified } from '../lib/unify.js';
import fs from 'fs';

const cache = new LRUCache({ max: 50, ttl: 5 * 60 * 1000 }); // 5 min

function readLocal(path) {
  try { return JSON.parse(fs.readFileSync(path, 'utf8')); } catch { return null; }
}

async function getJson(url) {
  if (!url) return null;
  const r = await fetch(url);
  if (!r.ok) throw new Error('fetch_failed ' + url + ' ' + r.status);
  return await r.json();
}

export default function resources(app){
  app.get('/v1/resources', async (_req,res)=>{
    try {
      const key = 'unified_resources';
      const cached = cache.get(key);
      if (cached) return res.json(cached);

      const sdheartUrl = process.env.SDHEART_RES_URL || '';
      const api211Url  = process.env.API_211_URL || '';

      const [sdheartJson, a211Json] = await Promise.all([
        getJson(sdheartUrl).catch(()=> readLocal('cache/sdheart.sample.geojson') || { features: [] }),
        getJson(api211Url).catch(()=> readLocal('cache/211.sample.json') || { data: [] })
      ]);

      const A = (sdheartJson && sdheartJson.features ? sdheartJson.features : [])
        .map(mapSdheartFeature)
        .filter(x => (Number.isFinite(x.lat) && Number.isFinite(x.lng)) || (x.lat && x.lng));

      const B = (a211Json && a211Json.data ? a211Json.data : [])
        .map(map211Item)
        .filter(x => Number.isFinite(x.lat) && Number.isFinite(x.lng));

      const unified = dedupeUnified([...A, ...B]);

      const payload = {
        count: unified.length,
        results: unified,
        sources: { sdheart: A.length, s211: B.length },
        last_updated: new Date().toISOString()
      };

      cache.set(key, payload);
      res.json(payload);
    } catch (e) {
      res.status(500).json({ error:'resources_failed', detail:String(e) });
    }
  });
}
