"use client";
import { useEffect, useState } from "react";
import type { HygieneStation } from "@/lib/store";

export default function HygienePage() {
  const [stations, setStations] = useState<HygieneStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    fetchStations();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchStations();
      setLastRefresh(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  function fetchStations() {
    fetch("/api/hygiene-stations")
      .then(r => r.json())
      .then(data => {
        setStations(data.stations || []);
        setLoading(false);
      });
  }

  const serviceIcons: Record<string, string> = {
    showers: "🚿",
    restrooms: "🚻",
    laundry: "🧺",
    mail: "📬",
    storage: "📦",
  };

  return (
    <div className="grid gap-6">
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="h1">Hygiene Stations</h1>
            <p className="mt-2 text-sm text-gray-600">
              Find showers, restrooms, laundry, mail services, and storage facilities throughout San Diego County.
            </p>
          </div>
          <div className="text-xs text-gray-500 text-right">
            <div>Auto-refreshing...</div>
            <div>Last updated: {lastRefresh.toLocaleTimeString()}</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card text-center">Loading hygiene stations...</div>
      ) : stations.length === 0 ? (
        <div className="card">No hygiene stations found.</div>
      ) : (
        <div className="grid gap-4">
          {stations.map((station) => (
            <div key={station.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="h2">{station.name}</h2>
                    {station.available ? (
                      <span className="badge bg-green-100 text-green-800">✅ Available</span>
                    ) : (
                      <span className="badge bg-red-100 text-red-800">❌ Full</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{station.address}</p>
                  
                  <div className="mt-3 flex flex-wrap gap-2">
                    {station.services.map(service => (
                      <span key={service} className="badge">
                        {serviceIcons[service]} {service.charAt(0).toUpperCase() + service.slice(1)}
                      </span>
                    ))}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Hours:</span> {station.hours}
                    </div>
                    {station.walkingDistance && (
                      <div>
                        <span className="font-medium">Walking:</span> {station.walkingDistance}
                      </div>
                    )}
                    {station.capacity && (
                      <div className="col-span-2">
                        <span className="font-medium">Capacity:</span> {station.currentUsers || 0} / {station.capacity} in use
                      </div>
                    )}
                  </div>

                  {station.phone && (
                    <div className="mt-2">
                      <a href={`tel:${station.phone}`} className="text-sm text-blue-600 hover:underline">
                        📞 {station.phone}
                      </a>
                    </div>
                  )}
                </div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary ml-4"
                >
                  Directions
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card bg-blue-50 border-blue-200">
        <h2 className="h2 text-blue-900">About Hygiene Stations</h2>
        <p className="mt-2 text-sm text-blue-800">
          Hygiene stations provide essential services including showers, restrooms, laundry facilities, mail services, 
          and storage. Availability updates in real-time. If a station is full, check back in 30 minutes or try another location.
        </p>
        <p className="mt-2 text-sm text-blue-800">
          <strong>Note:</strong> Some stations may have time limits or require sign-up. Call ahead to confirm availability 
          and requirements.
        </p>
      </div>

      <div className="card bg-gray-50 text-xs text-gray-600">
        <p className="font-semibold mb-2">Official Data Sources:</p>
        <ul className="list-disc list-inside space-y-1 mb-3">
          <li>
            <a href="https://211sandiego.org" className="underline" target="_blank" rel="noopener noreferrer">
              211 San Diego
            </a> - Comprehensive hygiene resource directory (Call 211 or visit online)
          </li>
          <li>
            <a href="https://www.fatherjoesvillages.org" className="underline" target="_blank" rel="noopener noreferrer">
              Father Joe's Villages
            </a> - Hygiene services and facilities
          </li>
          <li>
            <a href="https://www.sandiegocounty.gov/content/sdc/hhsa/programs/ssp/homeless_services.html" className="underline" target="_blank" rel="noopener noreferrer">
              County Homeless Services
            </a> - Official county hygiene and service programs
          </li>
        </ul>
        <p className="mt-3">
          <strong>Note:</strong> This directory uses sample data for demonstration. For current hygiene station locations 
          and availability, visit <a href="https://211sandiego.org" className="underline" target="_blank" rel="noopener noreferrer">211sandiego.org</a> 
          or call <strong>211</strong> (24/7).
        </p>
      </div>
    </div>
  );
}

