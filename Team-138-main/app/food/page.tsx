"use client";
import { useEffect, useState } from "react";
import type { FoodPantry } from "@/lib/store";

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function FoodPage() {
  const [pantries, setPantries] = useState<FoodPantry[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    fetchPantries();
    // Set today as default filter
    const today = dayNames[new Date().getDay()];
    setSelectedDay(today);
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      fetchPantries();
      setLastRefresh(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  function fetchPantries() {
    fetch("/api/food-pantries")
      .then(r => r.json())
      .then(data => {
        setPantries(data.pantries || []);
        setLoading(false);
      });
  }

  const filteredPantries = selectedDay
    ? pantries.filter(p => p.days.includes(selectedDay))
    : pantries;

  return (
    <div className="grid gap-6">
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="h1">Food Pantries & Resources</h1>
            <p className="mt-2 text-sm text-gray-600">
              Find food pantries and meal services throughout San Diego County. Many locations serve multiple days per week.
            </p>
          </div>
          <div className="text-xs text-gray-500 text-right">
            <div>Auto-refreshing...</div>
            <div>Last updated: {lastRefresh.toLocaleTimeString()}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <label className="block text-sm font-medium mb-2">Filter by day:</label>
        <select className="input" value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)}>
          <option value="">All Days</option>
          {dayNames.map(day => (
            <option key={day} value={day}>{day}</option>
          ))}
        </select>
        {selectedDay && (
          <p className="text-xs text-gray-500 mt-2">
            Showing pantries open on {selectedDay}
          </p>
        )}
      </div>

      {loading ? (
        <div className="card text-center">Loading food pantries...</div>
      ) : filteredPantries.length === 0 ? (
        <div className="card">
          {selectedDay ? `No pantries open on ${selectedDay}. Try selecting a different day.` : "No food pantries found."}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredPantries.map((pantry) => (
            <div key={pantry.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="h2">{pantry.name}</h2>
                  <p className="text-sm text-gray-600 mt-1">{pantry.address}</p>
                  
                  <div className="mt-3 flex flex-wrap gap-2">
                    <div className="badge">
                      📅 {pantry.days.join(", ")}
                    </div>
                    <div className="badge">
                      🕐 {pantry.hours}
                    </div>
                    {pantry.walkingDistance && (
                      <div className="badge">
                        🚶 {pantry.walkingDistance} walk
                      </div>
                    )}
                  </div>

                  {pantry.phone && (
                    <div className="mt-2">
                      <a href={`tel:${pantry.phone}`} className="text-sm text-blue-600 hover:underline">
                        📞 {pantry.phone}
                      </a>
                    </div>
                  )}
                </div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${pantry.lat},${pantry.lng}`}
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

      <div className="card bg-orange-50 border-orange-200">
        <h2 className="h2 text-orange-900">Food Security Information</h2>
        <p className="mt-2 text-sm text-orange-800">
          <strong>Persistent Hunger:</strong> Surveys show that many individuals experience food insecurity. 
          These pantries provide regular access to nutritious food throughout the week.
        </p>
        <p className="mt-2 text-sm text-orange-800">
          <strong>Community Knowledge:</strong> Individuals who have been unhoused often know where to find food. 
          This directory helps share that knowledge and ensures everyone has access to resources.
        </p>
        <p className="mt-2 text-sm text-orange-800">
          <strong>Need Help?</strong> Call <strong>211</strong> for 24/7 assistance finding food resources, 
          or visit <a href="https://211sandiego.org" className="underline" target="_blank" rel="noopener noreferrer">211sandiego.org</a>.
        </p>
      </div>

      <div className="card bg-gray-50 text-xs text-gray-600">
        <p className="font-semibold mb-2">Official Data Sources:</p>
        <ul className="list-disc list-inside space-y-1 mb-3">
          <li>
            <a href="https://211sandiego.org" className="underline" target="_blank" rel="noopener noreferrer">
              211 San Diego
            </a> - Comprehensive food pantry and meal service directory (Call 211 or visit online)
          </li>
          <li>
            <a href="https://www.sandiegofoodbank.org" className="underline" target="_blank" rel="noopener noreferrer">
              San Diego Food Bank
            </a> - Main food distribution center and pantry network
          </li>
          <li>
            <a href="https://www.sandiegofoodbank.org/get-help/find-food" className="underline" target="_blank" rel="noopener noreferrer">
              Food Bank Distribution Locations
            </a> - Searchable map of food distribution sites
          </li>
          <li>
            <a href="https://www.fatherjoesvillages.org" className="underline" target="_blank" rel="noopener noreferrer">
              Father Joe's Villages
            </a> - Meals and food services for people experiencing homelessness
          </li>
          <li>
            <a href="https://www.svdpsandiego.org" className="underline" target="_blank" rel="noopener noreferrer">
              St. Vincent de Paul San Diego
            </a> - Food pantries and meal programs
          </li>
          <li>
            <a href="https://www.sandiegocounty.gov/content/sdc/hhsa/programs/ssp/cal-fresh.html" className="underline" target="_blank" rel="noopener noreferrer">
              CalFresh (SNAP) Program
            </a> - County food assistance program information
          </li>
        </ul>
        <p className="mt-3">
          <strong>Note:</strong> This directory uses sample data for demonstration. For the most current food pantry locations, 
          hours, and availability, visit <a href="https://211sandiego.org" className="underline" target="_blank" rel="noopener noreferrer">211sandiego.org</a>, 
          call <strong>211</strong> (24/7), or check the <a href="https://www.sandiegofoodbank.org/get-help/find-food" className="underline" target="_blank" rel="noopener noreferrer">San Diego Food Bank website</a>.
        </p>
      </div>
    </div>
  );
}

