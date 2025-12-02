import fetch from 'node-fetch';
import * as turf from '@turf/turf';
import { scoreRoute } from '../lib/safety.js';

function parseLatLng(x){ const [lat,lng]=String(x).split(',').map(Number); return {lat,lng}; }
function lineStringFromOSRM(osrmGeom){ return { type:'Feature', geometry: osrmGeom, properties: {} }; }

export default function routeSafe(app){
  app.get('/v1/route/safe', async (req,res)=>{
    try{
      const origin = parseLatLng(req.query.origin||'32.7157,-117.1611');
      const dest   = parseLatLng(req.query.dest||'32.7175,-117.1570');
      const mode   = (req.query.mode||'walk');
      const base   = process.env.OSRM_URL || 'https://router.project-osrm.org';

      const url = `${base}/route/v1/foot/${origin.lng},${origin.lat};${dest.lng},${dest.lat}?overview=full&geometries=geojson`;
      const r = await fetch(url);
      if(!r.ok) throw new Error('osrm_failed '+r.status);
      const j = await r.json();
      const route = j.routes?.[0]?.geometry;
      if(!route) return res.json({ route:null, error:'no_route' });

      const line = lineStringFromOSRM(route);
      const scored = scoreRoute(line);

      return res.json({
        route: line,
        risk: Number(scored.risk.toFixed(3)),
        color: scored.color,
        distance_m: scored.distance_m,
        duration_s: j.routes?.[0]?.duration ? Math.round(j.routes[0].duration) : null,
        explain: { lit_ratio: Number(scored.lit_ratio.toFixed(3)), crime_weight: Number(scored.crime_weight.toFixed(3)) }
      });
    }catch(e){
      res.status(500).json({ error:'route_failed', detail: String(e) });
    }
  });
}
