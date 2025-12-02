'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/app/context/AdminAuthContext';
import BackButton from '@/app/components/BackButton';

export default function HeatmapPage() {
  const { admin, loading } = useAdminAuth();
  const router = useRouter();
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    if (!loading && !admin) {
      router.push('/admin/login');
      return;
    }

    if (admin) {
      loadHeatmap();
    }
  }, [admin, loading, router]);

  const loadHeatmap = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/heatmap/data');
      const data = await response.json();
      
      setSummary(data.summary);
      
      // Dynamically load Leaflet
      const L = (window as any).L;
      if (!L) {
        // Load Leaflet CSS and JS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => createMap(data);
        document.head.appendChild(script);
      } else {
        createMap(data);
      }
    } catch (error) {
      console.error('Failed to load heatmap data:', error);
      setMapLoading(false);
    }
  };

  const createMap = (data: any) => {
    const L = (window as any).L;
    if (!mapRef.current || !L) return;

    // Clear existing map
    mapRef.current.innerHTML = '';
    const mapDiv = document.createElement('div');
    mapDiv.style.height = '600px';
    mapDiv.style.width = '100%';
    mapRef.current.appendChild(mapDiv);

    // Create map
    const map = L.map(mapDiv).setView([32.7157, -117.1611], 10);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Create color scale
    const getColor = (d: number) => {
      return d > 100 ? '#800026' :
             d > 50  ? '#BD0026' :
             d > 20  ? '#E31A1C' :
             d > 10  ? '#FC4E2A' :
             d > 5   ? '#FD8D3C' :
             d > 1   ? '#FEB24C' :
             d > 0   ? '#FED976' :
                       '#FFEDA0';
    };

    // Create a map of homeless data by geoid
    const homelessMap = new Map();
    data.homeless_data.forEach((item: any) => {
      homelessMap.set(item.geoid, item);
    });

    // Add GeoJSON layer
    L.geoJSON(data.geojson, {
      style: (feature: any) => {
        const geoid = feature.properties.GEOID;
        const tractData = homelessMap.get(geoid);
        const homeless = tractData ? tractData.homeless_d : 0;
        
        return {
          fillColor: getColor(homeless),
          weight: 2,
          opacity: 0.8,
          color: 'white',
          fillOpacity: 0.7
        };
      },
      onEachFeature: (feature: any, layer: any) => {
        const geoid = feature.properties.GEOID;
        const tractData = homelessMap.get(geoid);
        
        let popupContent = `<b>Census Tract: ${geoid}</b><br>`;
        if (tractData) {
          popupContent += `Homeless Population: ${tractData.homeless_d.toFixed(1)}<br>`;
          popupContent += `Total Count: ${tractData.TotalCount}<br>`;
          popupContent += `Tract Code: ${tractData.ct}`;
        } else {
          popupContent += 'No homeless data available';
        }
        
        layer.bindPopup(popupContent);
      }
    }).addTo(map);

    // Add legend
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'info legend');
      const grades = [0, 1, 5, 10, 20, 50, 100];
      div.style.background = 'white';
      div.style.padding = '10px';
      div.style.borderRadius = '5px';
      div.style.boxShadow = '0 0 15px rgba(0,0,0,0.2)';
      
      div.innerHTML = '<b>Homeless Population</b><br>';
      for (let i = 0; i < grades.length; i++) {
        div.innerHTML +=
          '<i style="background:' + getColor(grades[i] + 1) + '; width: 18px; height: 18px; display: inline-block; margin-right: 5px;"></i> ' +
          grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }
      return div;
    };
    legend.addTo(map);

    setMapLoading(false);
  };

  if (loading || !admin) return null;

  return (
    <section className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <BackButton href="/admin/dashboard" label="Back to Dashboard" />
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800">San Diego Homeless Population Heat Map</h1>
            <p className="text-gray-600 mt-1">Area-wise distribution of homeless individuals</p>
          </div>

          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-gray-600">Total Tracts</p>
                <p className="text-2xl font-bold text-blue-600">{summary.total_tracts}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <p className="text-sm text-gray-600">With Homeless</p>
                <p className="text-2xl font-bold text-green-600">{summary.tracts_with_homeless}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <p className="text-sm text-gray-600">Total Homeless</p>
                <p className="text-2xl font-bold text-red-600">{summary.total_homeless.toFixed(0)}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <p className="text-sm text-gray-600">Average/Tract</p>
                <p className="text-2xl font-bold text-purple-600">{summary.average_per_tract.toFixed(1)}</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <p className="text-sm text-gray-600">Max in Tract</p>
                <p className="text-2xl font-bold text-orange-600">{summary.max_in_tract.toFixed(0)}</p>
              </div>
            </div>
          )}

          {mapLoading && (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin h-12 w-12 border-4 border-red-600 border-t-transparent rounded-full"></div>
            </div>
          )}

          <div ref={mapRef} className="rounded-lg overflow-hidden border-2 border-gray-200"></div>
        </div>
      </div>
    </section>
  );
}
