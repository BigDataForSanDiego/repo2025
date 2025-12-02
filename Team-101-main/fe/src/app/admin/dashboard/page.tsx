'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminAuth } from '@/app/context/AdminAuthContext';

export default function AdminDashboard() {
  const { admin, loading, logout } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !admin) {
      router.push('/admin/login');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin, loading]);

  if (loading || !admin) return null;

  return (
    <section className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome, {admin.email}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/admin/heatmap">
            <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition cursor-pointer group">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-red-200 transition">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Heat Map</h2>
              <p className="text-gray-600 text-sm">View homeless population distribution</p>
            </div>
          </Link>

          <Link href="/participant/login">
            <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition cursor-pointer group">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Enter Individual</h2>
              <p className="text-gray-600 text-sm">Access participant portal</p>
            </div>
          </Link>

          <Link href="/admin/participants/register">
            <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition cursor-pointer group">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-200 transition">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Register Individual</h2>
              <p className="text-gray-600 text-sm">Add new individuals to the system</p>
            </div>
          </Link>

          <Link href="/admin/participants">
            <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition cursor-pointer group">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">View Individuals</h2>
              <p className="text-gray-600 text-sm">Manage all registered individuals</p>
            </div>
          </Link>

          <Link href="/admin/trainings">
            <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition cursor-pointer group">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-200 transition">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Training Sessions</h2>
              <p className="text-gray-600 text-sm">Create and manage training programs</p>
            </div>
          </Link>

          <Link href="/admin/admins">
            <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition cursor-pointer group">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-orange-200 transition">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Manage Admins</h2>
              <p className="text-gray-600 text-sm">Add and manage admin users</p>
            </div>
          </Link>

          <Link href="/admin/employers">
            <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition cursor-pointer group">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-teal-200 transition">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Manage Employers</h2>
              <p className="text-gray-600 text-sm">Add and manage employer accounts</p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
