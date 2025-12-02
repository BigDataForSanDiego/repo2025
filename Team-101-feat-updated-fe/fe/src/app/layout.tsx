'use client';

import "./globals.css";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { AuthProvider, useAuth } from './context/AuthContext';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <header className="bg-white shadow-md">
          <nav className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
            <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition">
              ReLink
            </Link>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
              <Link href="/" className={`px-4 py-2 font-medium transition rounded-lg ${
                pathname === '/' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
              }`}>
                Home
              </Link>
              {!user && (
                <>
                  <Link href="/register" className={`px-4 py-2 font-medium transition rounded-lg ${
                    pathname === '/register' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  }`}>
                    Register
                  </Link>
                  <Link href="/login" className={`px-4 py-2 font-medium transition rounded-lg ${
                    pathname === '/login' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  }`}>
                    Login
                  </Link>
                </>
              )}
              {user && (
                <>
                  <Link href="/documents" className={`px-4 py-2 font-medium transition rounded-lg ${
                    pathname === '/documents' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  }`}>
                    Documents
                  </Link>
                  <Link href="/announcements" className={`px-4 py-2 font-medium transition rounded-lg ${
                    pathname === '/announcements' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  }`}>
                    Announcements
                  </Link>
                  <Link href="/certifications" className={`px-4 py-2 font-medium transition rounded-lg ${
                    pathname === '/certifications' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  }`}>
                    Certifications
                  </Link>
                  <Link href="/trainings" className={`px-4 py-2 font-medium transition rounded-lg ${
                    pathname === '/trainings' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  }`}>
                    Trainings
                  </Link>
                </>
              )}
              <Link href="/dashboard" className={`px-4 py-2 font-medium transition rounded-lg ${
                pathname === '/dashboard' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
              }`}>
                Dashboard
              </Link>
              </div>
              
              {user && (
                <div className="flex items-center gap-3 border-l pl-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {user.display_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-sm">
                      <p className="font-semibold text-gray-800">{user.display_name}</p>
                      <p className="text-xs text-gray-500">ID: {user.id}</p>
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LayoutContent>{children}</LayoutContent>
    </AuthProvider>
  );
}
