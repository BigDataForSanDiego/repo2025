"use client";
import { useEffect, useState } from "react";
import AdminHeaderRow from "@/components/AdminHeaderRow";

type Org = { id: number; name: string; contact_phone?: string; contact_email?: string; created_at?: string };

export default function AdminOrganizationsPage() {
  const [items, setItems] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({ name: "", contact_phone: "", contact_email: "" });

  async function load() {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/admin/orgs", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Failed to load organizations");
        setItems([]);
      } else {
        const list = Array.isArray(data) ? data : data.items;
        setItems(Array.isArray(list) ? list : []);
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load organizations");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function createOrg(e: React.FormEvent) {
    e.preventDefault(); setError(null);
    if (!form.name.trim()) { setError("Name is required"); return; }
    const payload = {
      name: form.name.trim(),
      contact_phone: form.contact_phone.trim() || undefined,
      contact_email: form.contact_email.trim() || undefined,
    };
    const res = await fetch("/api/admin/orgs", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setError(data?.error || "Failed to create organization"); return; }
    setForm({ name: "", contact_phone: "", contact_email: "" });
    await load();
  }

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
     
       <AdminHeaderRow
  crumbs={[
    { label: "Admin" },
    { label: "Dashboard", href: "/admin" },
    { label: "Organizations" },
  ]}
/>


      <h1 className="text-2xl font-semibold">Organizations</h1>

      <section className="bg-white rounded-xl shadow p-4 space-y-3">
        <h2 className="font-medium">Add Organization</h2>
        <form className="grid grid-cols-1 md:grid-cols-4 gap-3" onSubmit={createOrg}>
          <input className="border rounded px-3 py-2" placeholder="Name"
                 value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}/>
          <input className="border rounded px-3 py-2" placeholder="Contact Phone"
                 value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}/>
          <input className="border rounded px-3 py-2" placeholder="Contact Email"
                 value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })}/>
          <button className="bg-black text-white rounded py-2 px-4">Create</button>
        </form>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </section>

      <section className="bg-white rounded-xl shadow p-4">
        <h2 className="font-medium mb-2">Existing Organizations</h2>
        {loading ? <p>Loading…</p> : items.length === 0 ? <p>No organizations yet.</p> : (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">ID</th>
                  <th>Name</th>
                  <th>Contact Phone</th>
                  <th>Contact Email</th>
                </tr>
              </thead>
              <tbody>
                {items.map(o => (
                  <tr key={o.id} className="border-b last:border-0">
                    <td className="py-2">{o.id}</td>
                    <td>{o.name}</td>
                    <td>{o.contact_phone || "—"}</td>
                    <td>{o.contact_email || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
