'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/app/context/AdminAuthContext';

export default function ManageAdmins() {
  const { admin } = useAdminAuth();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    org_id: 2,
    email: '',
    phone: '',
    password: '',
    role: 'ADMIN'
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!admin) {
      router.push('/admin/login');
      return;
    }
    loadAdmins();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin]);

  const loadAdmins = () => {
    fetch('http://localhost:8000/api/v1/admin/users')
      .then(res => res.json())
      .then(data => {
        const filtered = Array.isArray(data) ? data.filter((a: any) => a.id !== admin?.id) : [];
        setAdmins(filtered);
      })
      .catch(() => setAdmins([]));
  };

  const [admins, setAdmins] = useState<any[]>([]);

  if (!admin) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/v1/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setMessage('Admin user created successfully!');
        setShowModal(false);
        setFormData({ org_id: 2, email: '', phone: '', password: '', role: 'ADMIN' });
        loadAdmins();
        setTimeout(() => setMessage(''), 3000);
      } else {
        const data = await res.json();
        setMessage(data.detail || 'Failed to create admin');
      }
    } catch (error) {
      setMessage('Network error');
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">Manage Admins</h1>
            <div className="flex gap-3">
              <button onClick={() => setShowModal(true)} className="px-4 py-2 text-white rounded-lg transition" style={{ backgroundColor: 'rgba(0, 0, 58, 0.95)' }}>
                + Add Admin
              </button>
              <button onClick={() => router.push('/admin/dashboard')} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">
                Back
              </button>
            </div>
          </div>
        </div>

        {message && (
          <div className={`mb-4 p-4 rounded-lg ${message.includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Current Admins</h2>
          {admins.length === 0 ? (
            <p className="text-gray-600">No other admin users</p>
          ) : (
            <div className="space-y-3">
              {admins.map((a: any) => (
                <div key={a.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-800">{a.email}</p>
                    <p className="text-sm text-gray-600">Role: {a.role}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    a.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {a.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Add Admin User</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900"
                  />
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
