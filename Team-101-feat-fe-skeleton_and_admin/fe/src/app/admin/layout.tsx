// fe/src/app/admin/layout.tsx (optional, minimal)
import "../globals.css";

export const metadata = { title: "ReLink — Admin" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <main className="mx-auto max-w-5xl px-6 py-6">{children}</main>
      </body>
    </html>
  );
}
