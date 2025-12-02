"use client";
import { useEffect, useState } from "react";
import type { AffordableGrocery } from "@/lib/store";

export default function AffordableFoodPage() {
  const [groceries, setGroceries] = useState<AffordableGrocery[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    fetchGroceries();
    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      fetchGroceries();
      setLastRefresh(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  function fetchGroceries() {
    fetch("/api/affordable-groceries")
      .then(r => r.json())
      .then(data => {
        setGroceries(data.groceries || []);
        setLoading(false);
      });
  }

  return (
    <div className="grid gap-6">
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="h1">Affordable Food Stores</h1>
            <p className="mt-2 text-sm text-gray-600">
              Grocery stores and markets designed with affordable pricing for low-income individuals, single mothers, 
              and families. These stores accept EBT, WIC, SNAP, and other assistance programs.
            </p>
          </div>
          <div className="text-xs text-gray-500 text-right">
            <div>Auto-refreshing...</div>
            <div>Last updated: {lastRefresh.toLocaleTimeString()}</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card text-center">Loading affordable food stores...</div>
      ) : groceries.length === 0 ? (
        <div className="card">No stores found.</div>
      ) : (
        <div className="grid gap-4">
          {groceries.map((store) => (
            <div key={store.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="h2">{store.name}</h2>
                  <p className="text-sm text-gray-600 mt-1">{store.address}</p>
                  
                  {store.description && (
                    <p className="text-sm mt-2">{store.description}</p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2">
                    {store.acceptsEBT && (
                      <span className="badge bg-green-100">✅ EBT Accepted</span>
                    )}
                    {store.acceptsWIC && (
                      <span className="badge bg-blue-100">✅ WIC Accepted</span>
                    )}
                    {store.acceptsSNAP && (
                      <span className="badge bg-purple-100">✅ SNAP Accepted</span>
                    )}
                    {store.acceptsSunBucks && (
                      <span className="badge bg-orange-100">✅ SunBucks Accepted</span>
                    )}
                  </div>

                  {store.specialPrograms && store.specialPrograms.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium mb-1">Special Programs:</p>
                      <div className="flex flex-wrap gap-2">
                        {store.specialPrograms.map((program, idx) => (
                          <span key={idx} className="badge bg-yellow-100 text-yellow-800">
                            {program}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Hours:</span> {store.hours}
                    </div>
                    {store.walkingDistance && (
                      <div>
                        <span className="font-medium">Walking:</span> {store.walkingDistance}
                      </div>
                    )}
                  </div>

                  {store.phone && (
                    <div className="mt-2">
                      <a href={`tel:${store.phone}`} className="text-sm text-blue-600 hover:underline">
                        📞 {store.phone}
                      </a>
                    </div>
                  )}
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.name + " " + store.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary ml-4"
                >
                  Find Store
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card bg-green-50 border-green-200">
        <h2 className="h2 text-green-900">About Affordable Food Stores</h2>
        <p className="mt-2 text-sm text-green-800">
          These grocery stores are specifically designed to serve low-income individuals and families with affordable pricing. 
          Many offer personalized service, fresh produce, and accept various assistance programs including EBT, WIC, SNAP, and SunBucks.
        </p>
        <p className="mt-2 text-sm text-green-800">
          <strong>No Judgment Policy:</strong> These stores are committed to providing a welcoming, family-friendly atmosphere 
          where everyone feels comfortable shopping, regardless of their financial situation.
        </p>
        <p className="mt-2 text-sm text-green-800">
          <strong>Special Programs:</strong> Many stores offer additional programs like eWIC, milk vouchers, and produce incentives 
          to help stretch your food budget further.
        </p>
      </div>

      <div className="card bg-blue-50 border-blue-200">
        <h2 className="h2 text-blue-900">Food Assistance Programs</h2>
        <ul className="mt-2 space-y-2 text-sm text-blue-800">
          <li>
            <strong>EBT (Electronic Benefit Transfer):</strong> Use your CalFresh/SNAP benefits at participating stores
          </li>
          <li>
            <strong>WIC (Women, Infants, and Children):</strong> Special nutrition program for pregnant women, new mothers, and children under 5
          </li>
          <li>
            <strong>SNAP (Supplemental Nutrition Assistance Program):</strong> Federal nutrition assistance program
          </li>
          <li>
            <strong>SunBucks:</strong> California's summer food assistance program for children
          </li>
          <li>
            <strong>CalFresh:</strong> California's version of SNAP - apply at <a href="https://www.getcalfresh.org" className="underline" target="_blank" rel="noopener noreferrer">getcalfresh.org</a>
          </li>
        </ul>
      </div>

      <div className="card bg-gray-50 text-xs text-gray-600">
        <p className="font-semibold mb-2">Official Data Sources:</p>
        <ul className="list-disc list-inside space-y-1 mb-3">
          <li>
            <a href="https://mothersnc.com" className="underline" target="_blank" rel="noopener noreferrer">
              Mother's Nutritional Center
            </a> - Affordable grocery stores designed for low-income individuals and families (Multiple San Diego locations)
          </li>
          <li>
            <a href="https://www.cdss.ca.gov/food-nutrition/calfresh" className="underline" target="_blank" rel="noopener noreferrer">
              CalFresh Program
            </a> - California's food assistance program information
          </li>
          <li>
            <a href="https://www.cdss.ca.gov/food-nutrition/wic" className="underline" target="_blank" rel="noopener noreferrer">
              WIC Program
            </a> - Women, Infants, and Children nutrition program
          </li>
          <li>
            <a href="https://211sandiego.org" className="underline" target="_blank" rel="noopener noreferrer">
              211 San Diego
            </a> - Comprehensive food resource directory (Call 211 or visit online)
          </li>
        </ul>
        <p className="mt-3">
          <strong>Note:</strong> This directory uses sample data for demonstration. For current store locations, hours, and 
          program availability, visit store websites or call <strong>211</strong> (24/7). Store locations and hours may vary.
        </p>
      </div>
    </div>
  );
}


