'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/app/context/AdminAuthContext';

export default function AdminTrainings() {
  const { admin } = useAdminAuth();
  const router = useRouter();
  const [trainings, setTrainings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    training_date: ''
  });

  useEffect(() => {
    if (!admin) {
      router.push('/admin/login');
      return;
    }
    loadTrainings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin]);

  const loadTrainings = () => {
    setLoading(true);
    fetch('http://localhost:8000/api/v1/trainings/sessions')
      .then(res => res.json())
      .then(data => {
        setTrainings(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setTrainings([]);
        setLoading(false);
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/v1/trainings/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ title: '', description: '', location: '', training_date: '' });
        loadTrainings();
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (!admin) return null;

  return (
    <section className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">Training Sessions</h1>
            <div className="flex gap-3">
              <button onClick={() => setShowModal(true)} className="px-4 py-2 text-white rounded-lg transition" style={{ backgroundColor: 'rgba(0, 0, 58, 0.95)' }}>
                + Add Training
              </button>
              <button onClick={() => router.push('/admin/dashboard')} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">
                Back
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-12 w-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trainings.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                <p>No training sessions yet</p>
              </div>
            ) : (
              trainings.map((t: any) => (
              <div key={t.id} className="bg-white rounded-xl shadow p-6">
                <h3 className="font-bold text-lg text-gray-800">{t.title}</h3>
                <p className="text-sm text-gray-600 mt-2">{t.description}</p>
                <p className="text-sm text-gray-600 mt-2">📍 {t.location}</p>
                <p className="text-sm text-gray-600">📅 {new Date(t.training_date).toLocaleDateString()}</p>
              </div>
              ))
            )}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Add Training Session</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      value={formData.training_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, training_date: e.target.value }))}
                      required
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
                      style={{ colorScheme: 'light' }}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-purple-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 py-3 text-white font-semibold rounded-lg transition" style={{ backgroundColor: 'rgba(0, 0, 58, 0.95)' }}>
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
