"use client";
import { useEffect, useState } from "react";
import type { MedicalClinic } from "@/lib/store";

export default function MedicalPage() {
  const [clinics, setClinics] = useState<MedicalClinic[]>([]);
  const [filter, setFilter] = useState<"all" | MedicalClinic["type"]>("all");
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    fetchClinics();
    // Auto-refresh every 60 seconds for wait times
    const interval = setInterval(() => {
      fetchClinics();
      setLastRefresh(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, [filter]);

  function fetchClinics() {
    fetch("/api/medical-clinics" + (filter !== "all" ? `?type=${filter}` : ""))
      .then(r => r.json())
      .then(data => {
        setClinics(data.clinics || []);
        setLoading(false);
      });
  }

  const typeLabels: Record<MedicalClinic["type"], string> = {
    urgent_care: "🚨 Urgent Care",
    primary_care: "🏥 Primary Care",
    mental_health: "🧠 Mental Health",
    dental: "🦷 Dental",
    specialty: "⚕️ Specialty",
  };

  function getWaitTimeColor(waitTime?: number): string {
    if (!waitTime) return "text-gray-500";
    if (waitTime <= 30) return "text-green-600";
    if (waitTime <= 60) return "text-yellow-600";
    return "text-red-600";
  }

  return (
    <div className="grid gap-6">
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="h1">Medical Clinics & Walk-In Care</h1>
            <p className="mt-2 text-sm text-gray-600">
              Find medical clinics with walk-in availability, wait times, and services for people experiencing homelessness.
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
          <option value="all">All Clinics</option>
          <option value="urgent_care">Urgent Care</option>
          <option value="primary_care">Primary Care</option>
          <option value="mental_health">Mental Health</option>
          <option value="dental">Dental</option>
          <option value="specialty">Specialty</option>
        </select>
      </div>

      {loading ? (
        <div className="card text-center">Loading medical clinics...</div>
      ) : clinics.length === 0 ? (
        <div className="card">No clinics found.</div>
      ) : (
        <div className="grid gap-4">
          {clinics.map((clinic) => (
            <div key={clinic.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="h2">{clinic.name}</h2>
                    <span className="badge bg-blue-100">{typeLabels[clinic.type]}</span>
                    {clinic.walkInAvailable && (
                      <span className="badge bg-green-100">✅ Walk-In Available</span>
                    )}
                    {!clinic.walkInAvailable && (
                      <span className="badge bg-gray-100">📅 Appointment Only</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{clinic.address}</p>
                  
                  <div className="mt-3 flex flex-wrap gap-2">
                    {clinic.acceptsMediCal && (
                      <span className="badge bg-green-100">✅ Accepts Medi-Cal</span>
                    )}
                    {clinic.acceptsUninsured && (
                      <span className="badge bg-blue-100">✅ Accepts Uninsured</span>
                    )}
                    {clinic.currentWaitTime !== undefined && clinic.walkInAvailable && (
                      <span className={`badge font-semibold ${getWaitTimeColor(clinic.currentWaitTime)}`}>
                        ⏱️ Wait: {clinic.currentWaitTime} min
                      </span>
                    )}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Hours:</span> {clinic.hours}
                    </div>
                    {clinic.walkingDistance && (
                      <div>
                        <span className="font-medium">Walking:</span> {clinic.walkingDistance}
                      </div>
                    )}
                  </div>

                  {clinic.phone && (
                    <div className="mt-2">
                      <a href={`tel:${clinic.phone}`} className="text-sm text-blue-600 hover:underline">
                        📞 {clinic.phone}
                      </a>
                    </div>
                  )}
                </div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${clinic.lat},${clinic.lng}`}
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

      <div className="card bg-red-50 border-red-200">
        <h2 className="h2 text-red-900">Emergency Medical Care</h2>
        <p className="mt-2 text-sm text-red-800">
          For life-threatening emergencies, call <strong>911</strong> immediately. For mental health crises, 
          call <strong>988</strong> (Suicide & Crisis Lifeline) or <strong>(888) 724-7240</strong> (County Crisis Line).
        </p>
      </div>

      <div className="card bg-blue-50 border-blue-200">
        <h2 className="h2 text-blue-900">About Medical Services</h2>
        <p className="mt-2 text-sm text-blue-800">
          Many clinics accept Medi-Cal and provide services to uninsured individuals on a sliding scale. 
          Wait times are updated in real-time. Walk-in availability means you can visit without an appointment, 
          though wait times may vary.
        </p>
        <p className="mt-2 text-sm text-blue-800">
          <strong>Mental Health:</strong> Crisis services are available 24/7. For non-emergency mental health services, 
          contact the County Behavioral Health Services.
        </p>
      </div>

      <div className="card bg-gray-50 text-xs text-gray-600">
        <p className="font-semibold mb-2">Official Data Sources:</p>
        <ul className="list-disc list-inside space-y-1 mb-3">
          <li>
            <a href="https://211sandiego.org" className="underline" target="_blank" rel="noopener noreferrer">
              211 San Diego
            </a> - Comprehensive medical resource directory (Call 211 or visit online)
          </li>
          <li>
            <a href="https://www.sandiegocounty.gov/content/sdc/hhsa/programs/bhs.html" className="underline" target="_blank" rel="noopener noreferrer">
              County Behavioral Health Services
            </a> - Mental health and substance abuse services
          </li>
          <li>
            <a href="https://www.fhcsd.org" className="underline" target="_blank" rel="noopener noreferrer">
              Family Health Centers of San Diego
            </a> - Community health centers accepting Medi-Cal and uninsured
          </li>
          <li>
            <a href="https://www.sandiegocounty.gov/content/sdc/hhsa/programs/ssp/medi-cal.html" className="underline" target="_blank" rel="noopener noreferrer">
              Medi-Cal Enrollment
            </a> - County Medi-Cal enrollment and information
          </li>
        </ul>
        <p className="mt-3">
          <strong>Note:</strong> This directory uses sample data for demonstration. For current clinic locations, 
          wait times, and availability, visit <a href="https://211sandiego.org" className="underline" target="_blank" rel="noopener noreferrer">211sandiego.org</a> 
          or call <strong>211</strong> (24/7).
        </p>
      </div>
    </div>
  );
}

