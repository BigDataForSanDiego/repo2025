"use client";
import { useEffect, useState } from "react";
import AdminHeaderRow from "@/components/AdminHeaderRow";

type AdminUser = {
  id: number;
  org_id: number;
  email: string;
  phone?: string;
  role: string;
  is_active: boolean;
};
type Participant = {
  id?: number;
  org_id: number;
  display_name: string;
  phone: string;
  email: string;
  preferred_contact: "EMAIL" | "SMS";
  qr_uid?: string;
};

type Tab = "admins" | "individuals" | "employers";

export default function AdminUsersPage() {
  const [tab, setTab] = useState<Tab>("admins");

  // --- Admins state ---
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [adminsError, setAdminsError] = useState<string | null>(null);
  const [adminForm, setAdminForm] = useState({
    email: "",
    phone: "",
    password: "",
    org_id: "",
  });

  // --- Individuals (participants) state ---
  const [people, setPeople] = useState<Participant[]>([]);
  const [peopleLoading, setPeopleLoading] = useState(false);
  const [peopleError, setPeopleError] = useState<string | null>(null);
  const [personForm, setPersonForm] = useState({
    display_name: "",
    phone: "",
    email: "",
    preferred_contact: "EMAIL" as "EMAIL" | "SMS",
    org_id: "",
  });

  // --- Employers (stub) ---
  const [employers] = useState<any[]>([]);

  // Load admins from backend
  async function loadAdmins() {
    setAdminsLoading(true);
    setAdminsError(null);
    try {
      const res = await fetch("/api/admin/admins", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAdminsError(data?.error || "Failed to load admins");
        setAdmins([]);
      } else {
        const list = Array.isArray(data) ? data : data.items;
        setAdmins(Array.isArray(list) ? list : []);
      }
    } catch (e: any) {
      setAdminsError(e?.message || "Failed to load admins");
      setAdmins([]);
    } finally {
      setAdminsLoading(false);
    }
  }

  // Participants list – backend may not have GET yet, so show only newly created for now
  async function loadPeople() {
    setPeopleLoading(true);
    setPeopleError(null);
    try {
      const res = await fetch("/api/admin/participants", { cache: "no-store" });
      if (!res.ok) {
        // graceful: backend GET not implemented yet
        setPeople([]);
      } else {
        const data = await res.json().catch(() => ({}));
        const list = Array.isArray(data) ? data : data.items;
        setPeople(Array.isArray(list) ? list : []);
      }
    } catch {
      setPeople([]);
    } finally {
      setPeopleLoading(false);
    }
  }

  useEffect(() => {
    if (tab === "admins") loadAdmins();
    if (tab === "individuals") loadPeople();
  }, [tab]);

  async function createAdmin(e: React.FormEvent) {
    e.preventDefault();
    setAdminsError(null);
    if (!adminForm.email || !adminForm.password || !adminForm.org_id) {
      setAdminsError("Email, Password, and Org ID are required");
      return;
    }
    const payload = {
      email: adminForm.email.trim(),
      phone: adminForm.phone.trim() || undefined,
      password: adminForm.password,
      org_id: Number(adminForm.org_id),
    };
    const res = await fetch("/api/admin/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setAdminsError(data?.error || "Failed to create admin");
      return;
    }
    await loadAdmins();
    setAdminForm({
      email: "",
      phone: "",
      password: "",
      org_id: adminForm.org_id,
    });
  }

  async function createPerson(e: React.FormEvent) {
    e.preventDefault();
    setPeopleError(null);
    if (
      !personForm.display_name ||
      !personForm.email ||
      !personForm.phone ||
      !personForm.org_id
    ) {
      setPeopleError("Name, Email, Phone, and Org ID are required");
      return;
    }
    const payload: Participant = {
      display_name: personForm.display_name.trim(),
      phone: personForm.phone.trim(),
      email: personForm.email.trim(),
      preferred_contact: personForm.preferred_contact,
      org_id: Number(personForm.org_id),
    };
    const res = await fetch("/api/admin/participants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setPeopleError(data?.error || "Failed to create individual");
      return;
    }

    // If GET isn’t available, append just-created row so it shows up
    setPeople((prev) => [
      { ...payload, id: data?.id ?? Math.random() * 1e6, qr_uid: data?.qr_uid },
      ...prev,
    ]);
    setPersonForm({
      display_name: "",
      phone: "",
      email: "",
      preferred_contact: personForm.preferred_contact,
      org_id: personForm.org_id,
    });
  }

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <AdminHeaderRow
  crumbs={[
    { label: "Admin" },
    { label: "Dashboard", href: "/admin" },
    { label: "Manage Users" },
  ]}
/>
      <h1 className="text-2xl font-semibold">Manage Users</h1>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("admins")}
          className={`px-3 py-2 rounded ${
            tab === "admins" ? "bg-black text-white" : "bg-white shadow"
          }`}
        >
          Admins
        </button>
        <button
          onClick={() => setTab("individuals")}
          className={`px-3 py-2 rounded ${
            tab === "individuals" ? "bg-black text-white" : "bg-white shadow"
          }`}
        >
          Individuals
        </button>
        <button
          onClick={() => setTab("employers")}
          className={`px-3 py-2 rounded ${
            tab === "employers" ? "bg-black text-white" : "bg-white shadow"
          }`}
        >
          Employers
        </button>
      </div>

      {/* Admins */}
      {tab === "admins" && (
        <>
          <section className="bg-white rounded-xl shadow p-4 space-y-3">
            <h2 className="font-medium">Add Admin</h2>
            <form
              className="grid grid-cols-1 md:grid-cols-5 gap-3"
              onSubmit={createAdmin}
            >
              <input
                className="border rounded px-3 py-2"
                placeholder="Email"
                value={adminForm.email}
                onChange={(e) =>
                  setAdminForm({ ...adminForm, email: e.target.value })
                }
              />
              <input
                className="border rounded px-3 py-2"
                placeholder="Phone"
                value={adminForm.phone}
                onChange={(e) =>
                  setAdminForm({ ...adminForm, phone: e.target.value })
                }
              />
              <input
                className="border rounded px-3 py-2"
                placeholder="Password"
                type="password"
                value={adminForm.password}
                onChange={(e) =>
                  setAdminForm({ ...adminForm, password: e.target.value })
                }
              />
              <input
                className="border rounded px-3 py-2"
                placeholder="Org ID (e.g., 2)"
                inputMode="numeric"
                value={adminForm.org_id}
                onChange={(e) =>
                  setAdminForm({ ...adminForm, org_id: e.target.value })
                }
              />
              <button className="bg-black text-white rounded py-2 px-4 md:col-span-1">
                Create
              </button>
            </form>
            {adminsError && (
              <p className="text-sm text-red-600">{adminsError}</p>
            )}
          </section>

          <section className="bg-white rounded-xl shadow p-4">
            <h2 className="font-medium mb-2">Existing Admins</h2>
            {adminsLoading ? (
              <p>Loading…</p>
            ) : admins.length === 0 ? (
              <p>No admins yet.</p>
            ) : (
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2">ID</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Org</th>
                      <th>Role</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map((a) => (
                      <tr key={a.id} className="border-b last:border-0">
                        <td className="py-2">{a.id}</td>
                        <td>{a.email}</td>
                        <td>{a.phone || "-"}</td>
                        <td>{a.org_id}</td>
                        <td>{a.role}</td>
                        <td>{a.is_active ? "Active" : "Inactive"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {/* Individuals */}
      {tab === "individuals" && (
        <>
          <section className="bg-white rounded-xl shadow p-4 space-y-3">
            <h2 className="font-medium">Add Individual</h2>
            <form
              className="grid grid-cols-1 md:grid-cols-6 gap-3"
              onSubmit={createPerson}
            >
              <input
                className="border rounded px-3 py-2"
                placeholder="Display Name"
                value={personForm.display_name}
                onChange={(e) =>
                  setPersonForm({ ...personForm, display_name: e.target.value })
                }
              />
              <input
                className="border rounded px-3 py-2"
                placeholder="Email"
                value={personForm.email}
                onChange={(e) =>
                  setPersonForm({ ...personForm, email: e.target.value })
                }
              />
              <input
                className="border rounded px-3 py-2"
                placeholder="Phone"
                value={personForm.phone}
                onChange={(e) =>
                  setPersonForm({ ...personForm, phone: e.target.value })
                }
              />
              <select
                className="border rounded px-3 py-2"
                value={personForm.preferred_contact}
                onChange={(e) =>
                  setPersonForm({
                    ...personForm,
                    preferred_contact: e.target.value as "EMAIL" | "SMS",
                  })
                }
              >
                <option value="EMAIL">Preferred: Email</option>
                <option value="SMS">Preferred: SMS</option>
              </select>
              <input
                className="border rounded px-3 py-2"
                placeholder="Org ID (e.g., 2)"
                inputMode="numeric"
                value={personForm.org_id}
                onChange={(e) =>
                  setPersonForm({ ...personForm, org_id: e.target.value })
                }
              />
              <button className="bg-black text-white rounded py-2 px-4 md:col-span-1">
                Create
              </button>
            </form>
            {peopleError && (
              <p className="text-sm text-red-600">{peopleError}</p>
            )}
          </section>

          <section className="bg-white rounded-xl shadow p-4">
            <h2 className="font-medium mb-2">Individuals</h2>
            {peopleLoading ? (
              <p>Loading…</p>
            ) : people.length === 0 ? (
              <p>No individuals yet.</p>
            ) : (
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2">ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Preferred</th>
                      <th>Org</th>
                      <th>QR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {people.map((p) => (
                      <tr
                        key={p.id ?? `${p.email}-${p.phone}`}
                        className="border-b last:border-0"
                      >
                        <td className="py-2">{p.id ?? "—"}</td>
                        <td>{p.display_name}</td>
                        <td>{p.email}</td>
                        <td>{p.phone}</td>
                        <td>{p.preferred_contact}</td>
                        <td>{p.org_id}</td>
                        <td>
                          {p?.qr_uid ? (
                            <a
                              className="underline"
                              href={`/api/admin/participants/${p.id}/qr.png`}
                              target="_blank"
                            >
                              QR
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {/* Employers (stub) */}
      {tab === "employers" && (
        <section className="bg-white rounded-xl shadow p-4">
          <h2 className="font-medium mb-2">Employers</h2>
          <p className="text-gray-600">
            Employer management will be available once the backend endpoint is
            ready.
          </p>
        </section>
      )}
    </main>
  );
}
