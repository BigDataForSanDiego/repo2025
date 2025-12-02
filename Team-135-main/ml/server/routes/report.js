function parseJson(req,res,next){ let d=''; req.on('data',c=>d+=c); req.on('end',()=>{ try{req.body=JSON.parse(d||'{}')}catch{req.body={}}; next();}); }
const _reports = [];
export default function reports(app){
  app.post('/v1/report', parseJson, (req,res)=>{
    const { type, lat, lng, note } = req.body||{};
    if(!type||!lat||!lng) return res.status(400).json({ error:'missing_fields' });
    const r = { id:_reports.length+1, ts:new Date().toISOString(), type, lat:+lat, lng:+lng, note:(note||'').slice(0,140) };
    _reports.push(r);
    res.json({ ok:true, report_id:r.id });
  });
  app.get('/v1/reports', (_req,res)=> res.json({ count:_reports.length, results:_reports }));
  app.locals.getReports = () => _reports;
}
