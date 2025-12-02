import * as turf from '@turf/turf';
function hexbin(points, cellKm = 0.5) {
  if (!points.features?.length) return turf.featureCollection([]);
  const bbox = turf.bbox(points);
  const grid = turf.hexGrid(bbox, cellKm, { units: 'kilometers' });
  const out = grid.features.map(h => {
    let count = 0;
    for (const p of points.features) if (turf.booleanPointInPolygon(p, h)) count++;
    h.properties = { count }; return h;
  }).filter(f => f.properties.count>0);
  return turf.featureCollection(out);
}
export default function insights(app){
  app.get('/v1/insights/hotspots', (_req,res)=>{
    const reports = (app.locals.getReports?.()||[]).map(r => turf.point([r.lng, r.lat]));
    const fc = turf.featureCollection(reports);
    res.json(hexbin(fc, 0.5));
  });
}
