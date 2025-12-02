'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminAuth } from '@/app/context/AdminAuthContext';

export default function ViewParticipants() {
  const { admin } = useAdminAuth();
  const router = useRouter();
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!admin) {
      router.push('/admin/login');
      return;
    }
    
    fetch('http://localhost:8000/api/v1/admin/participants')
      .then(res => res.json())
      .then(data => {
        setParticipants(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setParticipants([]);
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin]);

  if (!admin) return null;

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">Individuals</h1>
            <div className="flex gap-3">
              <Link href="/admin/participants/register" className="px-4 py-2 text-white rounded-lg transition" style={{ backgroundColor: 'rgba(0, 0, 58, 0.95)' }}>
                + Add Individual
              </Link>
              <button onClick={() => router.push('/admin/dashboard')} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">
                Back
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {participants.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                <p>No individuals registered yet</p>
              </div>
            ) : (
              participants.map((p: any) => (
                <div key={p.id} className="bg-white rounded-xl shadow p-6">
                  <h3 className="font-bold text-lg text-gray-800">{p.display_name}</h3>
                  <p className="text-sm text-gray-600 mt-2">ID: {p.id}</p>
                  {p.phone && <p className="text-sm text-gray-600">Phone: {p.phone}</p>}
                  {p.email && <p className="text-sm text-gray-600">Email: {p.email}</p>}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
}
