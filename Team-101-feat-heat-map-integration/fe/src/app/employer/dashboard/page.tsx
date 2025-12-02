'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEmployerAuth } from '@/app/context/EmployerAuthContext';

export default function EmployerDashboard() {
  const { employer, loading, logout } = useEmployerAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !employer) {
      router.push('/employer/login');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employer, loading]);

  if (loading || !employer) return null;

  return (
    <section className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Employer Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome, {employer.company_name}</p>
        </div>

        <div className="grid md:grid-cols-1 gap-6">
          <Link href="/participant/login">
            <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition cursor-pointer group">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Enter Individual</h2>
              <p className="text-gray-600 text-sm">View individual profile and credentials</p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
