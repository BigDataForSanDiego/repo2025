'use client';

import "./globals.css";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { EmployerAuthProvider, useEmployerAuth } from './context/EmployerAuthContext';
import React from 'react';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { admin, logout: adminLogout } = useAdminAuth();
  const { employer, logout: employerLogout } = useEmployerAuth();
  const [showDropdown, setShowDropdown] = React.useState(false);
  
  const isAdminRoute = pathname.startsWith('/admin');
  const isEmployerRoute = pathname.startsWith('/employer');
  const isParticipantRoute = pathname.startsWith('/participant');
  const isHomePage = pathname === '/';
  
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo-short.png" />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {!isHomePage && (
          <header className="bg-white shadow-md">
            <nav className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
              <Link href={isAdminRoute ? "/admin/dashboard" : isEmployerRoute ? "/employer/dashboard" : "/participant/announcements"} className="flex items-center">
                <img src="/logo.png" alt="ReLink Logo" className="h-10 w-30" />
              </Link>
              <div className="flex items-center gap-4">
                {isAdminRoute && admin && (
                  <div className="flex items-center gap-2">
                    <Link href="/admin/dashboard" className={`px-4 py-2 font-medium transition rounded-lg ${
                      pathname === '/admin/dashboard' ? 'text-white shadow-md' : 'text-gray-700 hover:bg-gray-50'
                    }`} style={pathname === '/admin/dashboard' ? { backgroundColor: 'rgba(0, 0, 58, 0.95)' } : {}}>
                      Home
                    </Link>
                    <Link href="/admin/profile" className={`px-4 py-2 font-medium transition rounded-lg ${
                      pathname === '/admin/profile' ? 'text-white shadow-md' : 'text-gray-700 hover:bg-gray-50'
                    }`} style={pathname === '/admin/profile' ? { backgroundColor: 'rgba(0, 0, 58, 0.95)' } : {}}>
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        adminLogout();
                        window.location.href = '/';
                      }}
                      className="px-4 py-2 text-white rounded-lg transition"
                      style={{ backgroundColor: 'rgba(145, 20, 35, 0.95)' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(160, 30, 45, 0.9)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(145, 20, 35, 0.95)'}
                    >
                      Logout
                    </button>
                  </div>
                )}

                {isEmployerRoute && employer && (
                  <div className="flex items-center gap-2">
                    <Link href="/employer/dashboard" className={`px-4 py-2 font-medium transition rounded-lg ${
                      pathname === '/employer/dashboard' ? 'text-white shadow-md' : 'text-gray-700 hover:bg-gray-50'
                    }`} style={pathname === '/employer/dashboard' ? { backgroundColor: 'rgba(0, 0, 58, 0.95)' } : {}}>
                      Home
                    </Link>
                    <Link href="/employer/profile" className={`px-4 py-2 font-medium transition rounded-lg ${
                      pathname === '/employer/profile' ? 'text-white shadow-md' : 'text-gray-700 hover:bg-gray-50'
                    }`} style={pathname === '/employer/profile' ? { backgroundColor: 'rgba(0, 0, 58, 0.95)' } : {}}>
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        employerLogout();
                        window.location.href = '/';
                      }}
                      className="px-4 py-2 text-white rounded-lg transition"
                      style={{ backgroundColor: 'rgba(145, 20, 35, 0.95)' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(160, 30, 45, 0.9)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(145, 20, 35, 0.95)'}
                    >
                      Logout
                    </button>
                  </div>
                )}
                
                {isParticipantRoute && user && (
                  <>
                    <div className="flex items-center gap-2">
                      {admin && (
                        <Link href="/admin/dashboard"
                          className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition"
                        >
                          ← Back to Admin
                        </Link>
                      )}
                      {employer && (
                        <Link href="/employer/dashboard"
                          className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition"
                        >
                          ← Back to Employer
                        </Link>
                      )}
                      {user && (
                        <Link href={`/participant/profile/view/${user.id}`} className={`px-4 py-2 font-medium transition rounded-lg ${
                          pathname.startsWith('/participant/profile/view') ? 'text-white shadow-md' : 'text-gray-700 hover:bg-gray-50'
                        }`} style={pathname.startsWith('/participant/profile/view') ? { backgroundColor: 'rgba(0, 0, 58, 0.95)' } : {}}>
                          Profile
                        </Link>
                      )}
                      <Link href="/participant/documents" className={`px-4 py-2 font-medium transition rounded-lg ${
                        pathname === '/participant/documents' ? 'text-white shadow-md' : 'text-gray-700 hover:bg-gray-50'
                      }`} style={pathname === '/participant/documents' ? { backgroundColor: 'rgba(0, 0, 58, 0.95)' } : {}}>
                        Documents
                      </Link>
                      {admin && (
                        <Link href="/participant/announcements" className={`px-4 py-2 font-medium transition rounded-lg ${
                          pathname === '/participant/announcements' ? 'text-white shadow-md' : 'text-gray-700 hover:bg-gray-50'
                        }`} style={pathname === '/participant/announcements' ? { backgroundColor: 'rgba(0, 0, 58, 0.95)' } : {}}>
                          Announcements
                        </Link>
                      )}
                      <Link href="/participant/certifications" className={`px-4 py-2 font-medium transition rounded-lg ${
                        pathname === '/participant/certifications' ? 'text-white shadow-md' : 'text-gray-700 hover:bg-gray-50'
                      }`} style={pathname === '/participant/certifications' ? { backgroundColor: 'rgba(0, 0, 58, 0.95)' } : {}}>
                        Certifications
                      </Link>
                      <Link href="/participant/trainings" className={`px-4 py-2 font-medium transition rounded-lg ${
                        pathname === '/participant/trainings' ? 'text-white shadow-md' : 'text-gray-700 hover:bg-gray-50'
                      }`} style={pathname === '/participant/trainings' ? { backgroundColor: 'rgba(0, 0, 58, 0.95)' } : {}}>
                        Trainings
                      </Link>
                      <Link href="/participant/reviews" className={`px-4 py-2 font-medium transition rounded-lg ${
                        pathname === '/participant/reviews' ? 'text-white shadow-md' : 'text-gray-700 hover:bg-gray-50'
                      }`} style={pathname === '/participant/reviews' ? { backgroundColor: 'rgba(0, 0, 58, 0.95)' } : {}}>
                        Reviews
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </nav>
          </header>
        )}
        <main>{children}</main>
      </body>
    </html>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <EmployerAuthProvider>
      <AdminAuthProvider>
        <AuthProvider>
          <LayoutContent>{children}</LayoutContent>
        </AuthProvider>
      </AdminAuthProvider>
    </EmployerAuthProvider>
  );
}
