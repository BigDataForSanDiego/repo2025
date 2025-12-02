"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const r = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Login failed");
    } else {
      r.push("/admin");
    }
    setBusy(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-sm bg-white shadow-lg rounded-xl p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Admin Login</h1>
          <p className="text-sm text-gray-500">Sign in to manage ReLink</p>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm" htmlFor="email">Email</label>
            <input id="email" className="w-full border rounded px-3 py-2" value={email}
                   onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm" htmlFor="password">Password</label>
            <input id="password" type="password" className="w-full border rounded px-3 py-2" value={password}
                   onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button disabled={busy} className="w-full bg-black text-white rounded py-2 disabled:opacity-50">
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
