let map, resourcesLayer, routeLayer;
const BASE = (location.hostname==='localhost'||location.hostname==='127.0.0.1')
  ? 'http://localhost:8080' : '';

function initMap(){
  map = L.map('map').setView([32.7157, -117.1611], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    attribution:'&copy; OpenStreetMap'
  }).addTo(map);

  resourcesLayer = L.layerGroup().addTo(map);
  routeLayer = L.layerGroup().addTo(map);

  const Panel = L.Control.extend({
    options:{position:'topright'},
    onAdd: function(){
      const c = L.DomUtil.create('div','leaflet-control panel');
      c.innerHTML = `
        <div class="row"><b>Origin</b></div>
        <div class="row">
          <input id="o" type="text" placeholder="lat,lng">
          <button id="o_me">Use my location</button>
          <button id="o_pick">Pick on map</button>
        </div>
        <div class="row"><b>Destination</b></div>
        <div class="row">
          <input id="d" type="text" placeholder="lat,lng">
          <button id="d_pick">Pick on map</button>
        </div>
        <div class="row">
          <button id="route">Route Safe</button>
          <label><input id="show_res" type="checkbox" checked> Show resources</label>
        </div>
        <div class="mini" id="status">Loading resources…</div>
      `;
      L.DomEvent.disableClickPropagation(c);

      c.querySelector('#o_me').onclick = async ()=>{
        if(navigator.geolocation){
          navigator.geolocation.getCurrentPosition(p=>{
            c.querySelector('#o').value = `${p.coords.latitude.toFixed(6)},${p.coords.longitude.toFixed(6)}`;
          });
        }
      };

      let picking = null;
      const startPick = (which)=>{
        picking = which;
        c.querySelector('#status').textContent = 'Click on map to set point…';
        map.getContainer().style.cursor='crosshair';
      };
      c.querySelector('#o_pick').onclick = ()=> startPick('o');
      c.querySelector('#d_pick').onclick = ()=> startPick('d');
      map.on('click', (e)=>{
        if(!picking) return;
        const val = `${e.latlng.lat.toFixed(6)},${e.latlng.lng.toFixed(6)}`;
        c.querySelector('#'+picking).value = val;
        picking = null;
        map.getContainer().style.cursor='';
        c.querySelector('#status').textContent = 'Point set';
      });

      c.querySelector('#show_res').onchange = (e)=>{
        if(e.target.checked) map.addLayer(resourcesLayer);
        else map.removeLayer(resourcesLayer);
      };

      c.querySelector('#route').onclick = async ()=>{
        const o = c.querySelector('#o').value.trim();
        const d = c.querySelector('#d').value.trim();
        if(!o || !d) { c.querySelector('#status').textContent='Enter origin & destination'; return; }
        const url = `${BASE}/v1/route/safe?origin=${encodeURIComponent(o)}&dest=${encodeURIComponent(d)}`;
        try{
          const r = await fetch(url); const j = await r.json();
          routeLayer.clearLayers();
          const line = L.geoJSON(j.route, {weight:6, opacity:0.9}).addTo(routeLayer);
          const b = line.getBounds(); map.fitBounds(b.pad(0.2));
          c.querySelector('#status').textContent = `Risk ${j.risk} • ${Math.round(j.distance_m)} m • ${Math.round(j.duration_s)} s`;
        }catch(err){
          console.error('route error', err);
          c.querySelector('#status').textContent='Route failed';
        }
      };

      loadResources(c);
      return c;
    }
  });
  map.addControl(new Panel());
}

async function loadResources(panelEl){
  try{
    const r = await fetch(`${BASE}/v1/resources`);
    const j = await r.json();
    resourcesLayer.clearLayers();
    const pts = [];
    for(const f of j.results){
      if(!(Number.isFinite(f.lat) && Number.isFinite(f.lng))) continue;
      const fresh = f.last_verified_at ? ((Date.now() - new Date(f.last_verified_at).getTime()) < 7*24*3600*1000) : False;
      const m = L.circleMarker([f.lat, f.lng], { radius: fresh ? 9 : 7, weight: fresh ? 3 : 2, fillOpacity:.95, color: fresh ? '#25D366' : '#FF8C00' })
        .bindPopup(`
          <div class="resource-popup">
            <b>${f.name || 'Unnamed Site'}</b>
            <div class="muted">${f.type || ''} ${f.status || ''}</div>
            <div>${f.address || ''}</div>
            <div>${f.contact || ''}</div>
            <div class="muted">Verified: ${f.last_verified_at ? new Date(f.last_verified_at).toLocaleDateString() : '—'}</div>
            <div class="muted">Capacity: ${f.capacity_available ?? '—'} • Wait: ${f.wait_minutes ?? '—'}</div>
          </div>
        `);
      m.addTo(resourcesLayer);
      pts.push([f.lat, f.lng]);
    }
    if(panelEl) panelEl.querySelector('#status').textContent = `Loaded ${pts.length} resources`;
    if(pts.length) map.fitBounds(L.latLngBounds(pts).pad(0.3));
  }catch(e){
    console.error('resources error', e);
    if(panelEl) panelEl.querySelector('#status').textContent='Resources failed';
  }
}

document.addEventListener('DOMContentLoaded', initMap);
