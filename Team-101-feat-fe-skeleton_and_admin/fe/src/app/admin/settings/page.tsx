"use client";
import { useState } from "react";

export default function AdminSettingsPage() {
  const [email, setEmail] = useState("");  // identify which account to edit
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault(); setMsg(null); setErr(null);
    if (!email) { setErr("Email is required"); return; }
    const r = await fetch("/api/admin/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, phone }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) { setErr(data?.error || data?.detail || "Failed to update profile"); return; }
    setMsg("Profile updated");
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault(); setMsg(null); setErr(null);
    if (!email || !oldPwd || !newPwd) { setErr("Email, old and new password are required"); return; }
    if (newPwd !== confirmPwd) { setErr("New passwords do not match"); return; }
    const r = await fetch("/api/admin/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, old_password: oldPwd, new_password: newPwd }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) { setErr(data?.error || data?.detail || "Failed to change password"); return; }
    setMsg("Password changed");
    setOldPwd(""); setNewPwd(""); setConfirmPwd("");
  }

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <nav className="text-sm text-gray-600">
          <a className="underline" href="/admin">Admin</a>
          <span className="mx-2">/</span>
          <span>Settings</span>
        </nav>
        <a href="/admin/logout" className="text-sm underline">Log out</a>
      </div>

      <h1 className="text-2xl font-semibold">Settings</h1>

      <section className="bg-white rounded-xl shadow p-4 space-y-3">
        <h2 className="font-medium">Profile</h2>
        <form className="grid grid-cols-1 md:grid-cols-3 gap-3" onSubmit={saveProfile}>
          <input className="border rounded px-3 py-2" placeholder="Your account email"
                 value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="border rounded px-3 py-2" placeholder="Phone"
                 value={phone} onChange={(e) => setPhone(e.target.value)} />
          <button className="bg-black text-white rounded px-4 py-2">Save</button>
        </form>
      </section>

      <section className="bg-white rounded-xl shadow p-4 space-y-3">
        <h2 className="font-medium">Change Password</h2>
        <form className="grid grid-cols-1 md:grid-cols-4 gap-3" onSubmit={changePassword}>
          <input className="border rounded px-3 py-2" placeholder="Your account email"
                 value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="border rounded px-3 py-2" placeholder="Old password" type="password"
                 value={oldPwd} onChange={(e) => setOldPwd(e.target.value)} />
          <input className="border rounded px-3 py-2" placeholder="New password" type="password"
                 value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
          <input className="border rounded px-3 py-2" placeholder="Confirm new password" type="password"
                 value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} />
          <button className="bg-black text-white rounded px-4 py-2 md:col-span-1">Update</button>
        </form>
      </section>

      {err && <p className="text-sm text-red-600">{err}</p>}
      {msg && <p className="text-sm text-green-700">{msg}</p>}
    </main>
  );
}
