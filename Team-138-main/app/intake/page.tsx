"use client";
import { useState } from "react";
import { Consent } from "@/components/Consent";

export default function IntakePage() {
  const [accepted, setAccepted] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/intake", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, phone }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start intake");
      // Save clientId to localStorage for shelter check-ins
      localStorage.setItem("clientId", data.clientId);
      window.location.href = "/triage?clientId=" + data.clientId;
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (!accepted) return <Consent onAccept={() => setAccepted(true)} />;

  return (
    <div className="card grid gap-3">
      <h2 className="h2">Quick Intake</h2>
      <label className="text-sm">Name or alias</label>
      <input className="input" value={name} onChange={(e)=>setName(e.target.value)} placeholder="e.g., Alex" />
      <label className="text-sm">Phone (optional, for SMS reminders)</label>
      <input className="input" value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="(###) ###-####" />
      {error && <div className="text-sm text-red-600">{error}</div>}
      <button className="btn btn-primary" onClick={submit} disabled={!name || loading}>{loading ? "Starting..." : "Continue"}</button>
    </div>
  );
}

