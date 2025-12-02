const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const rec = SpeechRecognition ? new SpeechRecognition() : null;
const mic = document.getElementById('micFloat');

if(rec){
  rec.lang='en-US'; rec.interimResults=false;
  mic.onclick = ()=> { rec.start(); };
  rec.onstart = ()=> { mic.style.transform='scale(1.06)'; };
  rec.onend = ()=> { mic.style.transform='scale(1.0)'; };
  rec.onresult = async (e)=>{
    const q = e.results[0][0].transcript.toLowerCase();
    const type = /(shower|hygiene|food|meal|shelter|clinic)/.exec(q)?.[1] || null;
    const r = await fetch('http://localhost:8080/v1/resources').then(r=>r.json());
    const c = window.map.getCenter ? window.map.getCenter() : {lat:32.7157,lng:-117.1611};
    let best=null, bd=1e9;
    for(const it of r.results){
      if(type && !(it.type||'').includes(type)) continue;
      if(!it.lat||!it.lng) continue;
      const d=dist(c.lat,c.lng,it.lat,it.lng);
      if(d<bd){ bd=d; best=it; }
    }
    if(best) routeTo(best.lat,best.lng); else alert('No matching resource found.');
  };
}else{
  mic.style.display='none';
}

function dist(a1,o1,a2,o2){ const R=6371, dLat=rad(a2-a1), dLon=rad(o2-o1);
  const s=Math.sin(dLat/2)**2 + Math.cos(rad(a1))*Math.cos(rad(a2))*Math.sin(dLon/2)**2;
  return 2*R*Math.atan2(Math.sqrt(s),Math.sqrt(1-s));
  function rad(d){return d*Math.PI/180;}
}
