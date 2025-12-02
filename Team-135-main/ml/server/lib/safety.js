import * as turf from '@turf/turf';
import fs from 'fs';

function loadGeo(path){
  try { return JSON.parse(fs.readFileSync(path,'utf8')); } catch { return { type:"FeatureCollection", features:[] }; }
}

const lighting = loadGeo('server/cache/sandag.lighting.sample.geojson');
const crime    = loadGeo('server/cache/sandag.crime.sample.geojson');

export function scoreRoute(line) {
  // sample points every ~80m to estimate lighting coverage
  const lengthKm = turf.length(line, { units:'kilometers' });
  const stepKm = 0.08;
  let litHits = 0, totalPts = 0;

  for (let d=0; d<=lengthKm; d+=stepKm){
    const p = turf.along(line, d, { units:'kilometers' });
    totalPts++;
    for (const poly of lighting.features){
      if (turf.booleanPointInPolygon(p, poly)) { litHits++; break; }
    }
  }
  const lit_ratio = totalPts ? (litHits/totalPts) : 0;

  // crime weight: area-weighted mean of intersecting crime cells with 60m buffer
  const buf = turf.buffer(line, 0.06, { units:'kilometers' });
  let num=0, den=0;
  for (const cell of crime.features){
    const inter = turf.intersect(buf, cell);
    if (inter){
      const a = turf.area(inter);
      const s = Number(cell.properties?.score || 0);
      num += a * s; den += a;
    }
  }
  const crime_weight = den ? (num/den) : 0;

  // final 0..1 risk
  const risk = 0.7 * crime_weight + 0.3 * (1 - lit_ratio);
  let color = '#25D366'; // green
  if (risk > 0.66) color = '#FF5252'; else if (risk > 0.33) color = '#FFC107';

  return { risk, color, lit_ratio, crime_weight, distance_m: Math.round(lengthKm*1000) };
}
