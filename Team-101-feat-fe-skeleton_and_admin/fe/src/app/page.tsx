export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold mb-6">Welcome to ReLink</h1>
      <p className="text-gray-600 mb-8">Choose a portal to continue.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <a
          href="/admin/login"
          className="block rounded-2xl bg-white shadow hover:shadow-md transition p-6"
        >
          <h2 className="text-xl font-medium mb-2">Admin Login →</h2>
          <p className="text-sm text-gray-600">
            Manage organizations, admins, and participant onboarding.
          </p>
        </a>

        {/* Coming soon: make it look disabled without any handlers */}
        <a
          href="#"
          aria-disabled="true"
          tabIndex={-1}
          className="block rounded-2xl bg-white shadow p-6 opacity-70 pointer-events-none select-none"
        >
          <h2 className="text-xl font-medium mb-2">Employer Portal (coming soon)</h2>
          <p className="text-sm text-gray-600">Post jobs and verify candidates via ReLink.</p>
        </a>
      </div>
    </main>
  );
}
