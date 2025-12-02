export default function AdminHeader({ trail }: { trail: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <nav className="text-sm text-gray-600">{trail}</nav>
      <a href="/admin/logout" className="text-sm underline">Log out</a>
    </div>
  );
}
