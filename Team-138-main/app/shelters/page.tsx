"use client";
import { useEffect, useState } from "react";
import type { Shelter } from "@/lib/store";

export default function SheltersPage() {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [filter, setFilter] = useState<"all" | "temporary" | "permanent">("all");
  const [loading, setLoading] = useState(true);
  const [clientId, setClientId] = useState("");
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    // Try to get clientId from localStorage or URL
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("clientId") || localStorage.getItem("clientId") || "";
    setClientId(id);
    
    fetchShelters();
    // Auto-refresh every 30 seconds for real-time availability
    const interval = setInterval(() => {
      fetchShelters();
      setLastRefresh(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  function fetchShelters() {
    fetch("/api/shelters" + (filter !== "all" ? `?type=${filter}` : ""))
      .then(r => r.json())
      .then(data => {
        setShelters(data.shelters || []);
        setLoading(false);
      });
  }

  async function handleCheckIn(shelterId: string) {
    if (!clientId) {
      alert("Please start from the intake page to check in to a shelter.");
      window.location.href = "/intake";
      return;
    }
    
    const res = await fetch("/api/shelters/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shelterId, clientId }),
    });
    const data = await res.json();
    if (res.ok) {
      alert(`Checked in to ${data.shelter.name}! Check-in ID: ${data.checkInId}`);
      // Refresh shelters
      fetchShelters();
    } else {
      alert(data.error || "Check-in failed");
    }
  }

  return (
    <div className="grid gap-6">
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="h1">Shelter Directory</h1>
            <p className="mt-2 text-sm text-gray-600">
              Real-time availability for temporary and permanent shelters. Check in and check out like Airbnb.
            </p>
          </div>
          <div className="text-xs text-gray-500 text-right">
            <div>Auto-refreshing...</div>
            <div>Last updated: {lastRefresh.toLocaleTimeString()}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <label className="block text-sm font-medium mb-2">Filter by type:</label>
        <select className="input" value={filter} onChange={(e) => setFilter(e.target.value as any)}>
          <option value="all">All Shelters</option>
          <option value="temporary">Temporary Shelters</option>
          <option value="permanent">Permanent Shelters</option>
        </select>
      </div>

      {loading ? (
        <div className="card text-center">Loading shelters...</div>
      ) : shelters.length === 0 ? (
        <div className="card">No shelters found.</div>
      ) : (
        <div className="grid gap-4">
          {shelters.map((shelter) => (
            <div key={shelter.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="h2">{shelter.name}</h2>
                    <span className={`badge ${shelter.type === "permanent" ? "bg-green-100" : "bg-blue-100"}`}>
                      {shelter.type === "permanent" ? "🏠 Permanent" : "⛺ Temporary"}
                    </span>
                    {shelter.priority === "families" && (
                      <span className="badge bg-purple-100">👨‍👩‍👧‍👦 Families First</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{shelter.address}</p>
                  
                  {shelter.status && (
                    <div className="mt-2">
                      {shelter.status === "funding" && (
                        <span className="badge bg-yellow-100">💰 Seeking Funding</span>
                      )}
                      {shelter.status === "building" && (
                        <span className="badge bg-orange-100">🏗️ Under Construction</span>
                      )}
                      {shelter.status === "ready" && (
                        <span className="badge bg-green-100">✅ Ready to Move In</span>
                      )}
                    </div>
                  )}

                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Availability:</span> {shelter.available} / {shelter.capacity}
                    </div>
                    {shelter.walkingDistance && (
                      <div>
                        <span className="font-medium">Walking:</span> {shelter.walkingDistance}
                      </div>
                    )}
                    {shelter.transitInfo && (
                      <div className="col-span-2">
                        <span className="font-medium">Transit:</span> {shelter.transitInfo}
                      </div>
                    )}
                  </div>
                </div>
                <div className="ml-4 flex flex-col gap-2">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${shelter.lat},${shelter.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn"
                  >
                    Directions
                  </a>
                  {shelter.type === "temporary" && shelter.available > 0 && shelter.status !== "building" && (
                    <button
                      className="btn btn-primary"
                      onClick={() => handleCheckIn(shelter.id)}
                    >
                      Check In
                    </button>
                  )}
                  {shelter.type === "permanent" && shelter.status === "ready" && shelter.available > 0 && (
                    <button
                      className="btn btn-primary"
                      onClick={() => handleCheckIn(shelter.id)}
                    >
                      Apply
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card bg-purple-50 border-purple-200">
        <h2 className="h2 text-purple-900">About Permanent Shelters</h2>
        <p className="mt-2 text-sm text-purple-800">
          <strong>Families First Priority:</strong> Permanent shelters marked "Families First" prioritize families with children 
          for housing placement. Other permanent shelters are available to all individuals.
        </p>
        <p className="mt-2 text-sm text-purple-800">
          <strong>Status:</strong> Shelters may be in funding, construction, or ready for move-in. Check availability and apply 
          for ready shelters.
        </p>
      </div>

      <div className="card bg-gray-50 text-xs text-gray-600">
        <p className="font-semibold mb-2">Official Data Sources:</p>
        <ul className="list-disc list-inside space-y-1 mb-3">
          <li>
            <a href="https://211sandiego.org" className="underline" target="_blank" rel="noopener noreferrer">
              211 San Diego
            </a> - Comprehensive shelter and housing resource directory (Call 211 or visit online)
          </li>
          <li>
            <a href="https://www.sandiegocounty.gov/content/sdc/hhsa/programs/ssp/homeless_services.html" className="underline" target="_blank" rel="noopener noreferrer">
              San Diego County Homeless Services
            </a> - Official county shelter and housing programs
          </li>
          <li>
            <a href="https://www.sandiegocounty.gov/content/sdc/hhsa/programs/ssp/housing_opportunities.html" className="underline" target="_blank" rel="noopener noreferrer">
              County Housing Opportunities
            </a> - Permanent supportive housing and rental assistance programs
          </li>
          <li>
            <a href="https://www.sdhc.org" className="underline" target="_blank" rel="noopener noreferrer">
              San Diego Housing Commission
            </a> - Affordable housing programs and resources
          </li>
          <li>
            <a href="https://www.sandiego.gov/development-services/housing" className="underline" target="_blank" rel="noopener noreferrer">
              City of San Diego Housing Division
            </a> - City housing programs and development
          </li>
          <li>
            <a href="https://www.hud.gov/states/california/homeless" className="underline" target="_blank" rel="noopener noreferrer">
              HUD San Diego Resources
            </a> - Federal housing and homeless assistance programs
          </li>
        </ul>
        <p className="mt-3">
          <strong>Note:</strong> This directory uses sample data for demonstration. For real-time shelter availability and 
          official housing resources, contact <a href="https://211sandiego.org" className="underline" target="_blank" rel="noopener noreferrer">211 San Diego</a> 
          or call <strong>211</strong> (24/7). For emergency shelter, call the Regional Task Force on Homelessness at 
          <strong> (619) 446-2100</strong>.
        </p>
      </div>
    </div>
  );
}

