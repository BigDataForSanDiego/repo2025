type Crumb = { label: string; href?: string };

export default function AdminHeaderRow({
  crumbs,
}: {
  crumbs: Crumb[]; // e.g. [{label:"Admin"}, {label:"Dashboard", href:"/admin"}, {label:"Manage Users"}]
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      {/* Breadcrumbs (plain background) */}
      <nav className="text-sm text-gray-600">
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <span key={i} className="inline-flex items-center">
              {c.href && !isLast ? (
                <a className="underline" href={c.href}>{c.label}</a>
              ) : (
                <span>{c.label}</span>
              )}
              {!isLast && <span className="mx-2">/</span>}
            </span>
          );
        })}
      </nav>

      {/* Actions (no underline, pill style; also plain background) */}
      <div className="flex items-center gap-3">
        <a
          href="/admin/settings"
          className="inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium px-3 py-1.5 rounded-full transition"
          title="Settings"
        >
          <span aria-hidden>⚙️</span>
          <span>Settings</span>
        </a>
        <a
          href="/admin/logout"
          className="inline-flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium px-3 py-1.5 rounded-full transition"
          title="Logout"
        >
          <span aria-hidden>🚪</span>
          <span>Logout</span>
        </a>
      </div>
    </div>
  );
}
