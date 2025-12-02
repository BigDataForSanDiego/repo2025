"use client";
import { useEffect, useState } from "react";
import type { Resource } from "@/lib/store";

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filter, setFilter] = useState<Resource["type"] | "all">("all");
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    fetchResources();
    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      fetchResources();
      setLastRefresh(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, [filter]);

  function fetchResources() {
    fetch("/api/resources" + (filter !== "all" ? `?type=${filter}` : ""))
      .then(r => r.json())
      .then(data => {
        setResources(data.resources || []);
        setLoading(false);
      });
  }

  return (
    <div className="grid gap-6">
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="h1">Community Resources</h1>
            <p className="mt-2 text-sm text-gray-600">
              Find nearby shelters, food banks, social services, and transportation options in San Diego County.
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
          <option value="all">All Resources</option>
          <option value="food_bank">Food Banks</option>
          <option value="affordable_grocery">Affordable Grocery Stores</option>
          <option value="social_service">Social Services</option>
          <option value="shelter">Shelters</option>
          <option value="transportation">Transportation</option>
        </select>
      </div>

      {loading ? (
        <div className="card text-center">Loading resources...</div>
      ) : resources.length === 0 ? (
        <div className="card">No resources found.</div>
      ) : (
        <div className="grid gap-4">
          {resources.map((resource) => (
            <div key={resource.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="h2">{resource.name}</h2>
                  <p className="text-sm text-gray-600 mt-1">{resource.address}</p>
                  {resource.description && (
                    <p className="text-sm mt-2">{resource.description}</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-3 text-xs">
                    {resource.phone && (
                      <span className="badge">
                        📞 <a href={`tel:${resource.phone}`} className="hover:underline">{resource.phone}</a>
                      </span>
                    )}
                    {resource.hours && (
                      <span className="badge">🕐 {resource.hours}</span>
                    )}
                    {resource.walkingDistance && (
                      <span className="badge">🚶 {resource.walkingDistance} walk</span>
                    )}
                  </div>
                </div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${resource.lat},${resource.lng}`}
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
        <h2 className="h2 text-blue-900">Transportation Help</h2>
        <p className="mt-2 text-sm text-blue-800">
          Many resources include walking distances. For public transit, call <strong>511</strong> or visit 
          <a href="https://www.sdmts.com" className="underline ml-1" target="_blank" rel="noopener noreferrer">sdmts.com</a>.
        </p>
        <p className="mt-2 text-sm text-blue-800">
          <strong>Note:</strong> Some individuals may face transportation challenges. If you need assistance getting to resources, 
          contact 211 San Diego for transportation support options.
        </p>
      </div>

      <div className="card bg-gray-50 text-xs text-gray-600">
        <p className="font-semibold mb-2">Official Data Sources:</p>
        <ul className="list-disc list-inside space-y-1 mb-3">
          <li>
            <a href="https://211sandiego.org" className="underline" target="_blank" rel="noopener noreferrer">
              211 San Diego
            </a> - Comprehensive resource directory and referral service (Call 211 or visit online)
          </li>
          <li>
            <a href="https://www.sandiegocounty.gov/content/sdc/hhsa.html" className="underline" target="_blank" rel="noopener noreferrer">
              San Diego County Health & Human Services Agency
            </a> - Official county social services and programs
          </li>
          <li>
            <a href="https://www.sandiegocounty.gov/content/sdc/hhsa/programs/ssp/homeless_services.html" className="underline" target="_blank" rel="noopener noreferrer">
              County Homeless Services
            </a> - Housing and homeless services information
          </li>
          <li>
            <a href="https://www.sandiegofoodbank.org" className="underline" target="_blank" rel="noopener noreferrer">
              San Diego Food Bank
            </a> - Food distribution and pantry locations
          </li>
          <li>
            <a href="https://www.sdmts.com" className="underline" target="_blank" rel="noopener noreferrer">
              San Diego Metropolitan Transit System
            </a> - Public transportation routes and schedules
          </li>
          <li>
            <a href="https://www.sandiego.gov/public-library" className="underline" target="_blank" rel="noopener noreferrer">
              San Diego Public Library
            </a> - Library locations, hours, and services
          </li>
        </ul>
        <p className="mt-3">
          <strong>Note:</strong> This directory uses sample data for demonstration. For the most current and comprehensive 
          resource listings, visit <a href="https://211sandiego.org" className="underline" target="_blank" rel="noopener noreferrer">211sandiego.org</a> 
          or call <strong>211</strong> (24/7).
        </p>
      </div>
    </div>
  );
}

