'use client';

import Link from 'next/link';
import { useAuth } from './context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  return (
    <section className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-800 mb-4">ReLink</h1>
          <p className="text-xl text-gray-600 mb-2">Rebuilding Trust, One Digital Identity at a Time</p>
          <p className="text-gray-500">A digital identity platform for unhoused individuals</p>
        </div>

        {!user && (
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Link href="/register">
              <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition cursor-pointer group">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Register</h2>
                <p className="text-gray-600">Create a new participant profile with Face ID authentication</p>
              </div>
            </Link>

            <Link href="/login">
              <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition cursor-pointer group">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Login</h2>
                <p className="text-gray-600">Access your profile using QR code or Face ID</p>
              </div>
            </Link>
          </div>
        )}

        {user && (
          <div className="text-center mb-8">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome back, {user.display_name}!</h2>
              <p className="text-gray-600 mb-4">You are successfully logged in</p>
              <Link href="/dashboard" className="inline-block py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
                Go to Dashboard
              </Link>
            </div>
          </div>
        )}

        <div className="mt-16 bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">About ReLink</h3>
          <p className="text-gray-600 mb-4">
            ReLink is a digital identity and credentialing platform that empowers unhoused and under-documented 
            individuals to access housing, healthcare, and employment by providing them with a secure, verifiable 
            digital profile.
          </p>
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4">
              <div className="text-3xl font-bold text-blue-600 mb-2">🏠</div>
              <p className="text-sm text-gray-600">Access to Housing</p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl font-bold text-green-600 mb-2">💼</div>
              <p className="text-sm text-gray-600">Employment Opportunities</p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl font-bold text-purple-600 mb-2">🏥</div>
              <p className="text-sm text-gray-600">Healthcare Services</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
