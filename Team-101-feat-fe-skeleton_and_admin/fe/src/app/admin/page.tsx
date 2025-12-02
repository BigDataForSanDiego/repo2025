import { cookies } from "next/headers";
import AdminHeaderRow from "@/components/AdminHeaderRow";

export default async function AdminHome() {
  const cookieStore = await cookies();
  const token = cookieStore.get(process.env.SESSION_COOKIE_NAME ?? "relink_session");

  if (!token) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <p className="mb-3">You’re not signed in.</p>
        <a className="underline" href="/admin/login">Go to Admin Login</a>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <AdminHeaderRow
        crumbs={[
          { label: "Admin" },                      // label only
          { label: "Dashboard", href: "/admin" },  // click goes to /admin
        ]}
      />

      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a href="/admin/users" className="rounded-xl bg-white p-5 shadow hover:shadow-md transition">
          <h2 className="font-medium">Manage Users →</h2>
          <p className="text-sm text-gray-600">Admins, Individuals, Employers</p>
        </a>
        <a href="/admin/organizations" className="rounded-xl bg-white p-5 shadow hover:shadow-md transition">
          <h2 className="font-medium">Manage Organizations →</h2>
          <p className="text-sm text-gray-600">Create and view organizations</p>
        </a>
      </div>
    </main>
  );
}
