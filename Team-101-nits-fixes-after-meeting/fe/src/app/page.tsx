'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <section className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <img src="/logo.png" alt="ReLink Logo" className="h-20 mx-auto mb-4" />
          <p className="text-xl text-gray-600 mb-2">Rebuilding Trust, One Digital Identity at a Time</p>
          <p className="text-gray-500">A digital identity platform for unhoused individuals</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Link href="/admin/login">
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition cursor-pointer group">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-200 transition">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Admin Login</h2>
              <p className="text-gray-600">Access admin dashboard to manage participants and programs</p>
            </div>
          </Link>

          <Link href="/employer/login">
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition cursor-pointer group">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Employer Login</h2>
              <p className="text-gray-600">Access employer dashboard to view individual profiles</p>
            </div>
          </Link>
        </div>

        <div className="mt-12 bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Inspiration</h3>
          <p className="text-gray-600 leading-relaxed mb-4">
            ReLink was born from a moment that changed everything. At a Social Security office, our team member watched as a homeless individual was turned away, not because he didn't deserve help, but because he couldn't book an appointment online or call a phone number. He had neither a phone nor internet access.
          </p>
          <p className="text-gray-700 leading-relaxed font-medium">
            That day revealed a painful truth: the systems meant to help often require the very resources our most vulnerable neighbors lack. ReLink bridges this gap, providing a digital identity platform that empowers unhoused individuals to access housing, employment, and essential services, without requiring personal devices or internet access. Because dignity and opportunity shouldn't depend on owning a smartphone.
          </p>
        </div>
      </div>
    </section>
  );
}
