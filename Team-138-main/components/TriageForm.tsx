"use client";
import { useState } from "react";

export type TriageLevel = "green" | "yellow" | "red";

export function TriageForm({ clientId }: { clientId: string }) {
  const [q1, setQ1] = useState(0); // suicidal intent or severe distress
  const [q2, setQ2] = useState(0); // acute but safe
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, answers: { q1, q2 } }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Triage failed");
      if (data.level === "red") {
        window.location.href = "/triage/red?clientId=" + clientId;
        return;
      }
      if (data.level === "yellow") {
        // create a room and go to waiting
        const s = await fetch("/api/sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ clientId })});
        const j = await s.json();
        if (!s.ok) throw new Error(j.error || "Failed to create session");
        window.location.href = `/waiting?roomId=${j.roomId}&clientId=${clientId}`;
        return;
      }
      // green → schedule (mock) then show resources
      window.location.href = "/triage/green?clientId=" + clientId;
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card grid gap-4">
      <h2 className="h2">Quick Triage (30 seconds)</h2>
      <div>
        <label className="block text-sm font-medium">Right now, do you have thoughts about harming yourself or others, a plan, or severe medical distress?</label>
        <select className="input mt-1" value={q1} onChange={(e)=>setQ1(parseInt(e.target.value))}>
          <option value={0}>No</option>
          <option value={1}>Yes</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium">Do you have urgent symptoms that feel unsafe to wait (e.g., severe anxiety, wound needing evaluation)?</label>
        <select className="input mt-1" value={q2} onChange={(e)=>setQ2(parseInt(e.target.value))}>
          <option value={0}>No</option>
          <option value={1}>Yes</option>
        </select>
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <button className="btn btn-primary" onClick={submit} disabled={loading}>{loading ? "Working..." : "Get my next step"}</button>
    </div>
  );
}

