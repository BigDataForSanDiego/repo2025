'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/app/context/AdminAuthContext';
import { useRouter } from 'next/navigation';
import Toast from '@/app/components/Toast';

export default function AdminProfilePage() {
  const { admin } = useAdminAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    if (!admin) {
      router.push('/admin/login');
      return;
    }
    
    fetch(`http://localhost:8000/api/v1/profile/admin/${admin.id}`)
      .then(res => res.json())
      .then(data => {
        setFormData({ email: data.email, phone: data.phone || '' });
        setLoading(false);
      });
  }, [admin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`http://localhost:8000/api/v1/profile/admin/${admin?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setToast({ message: 'Profile updated successfully!', type: 'success' });
        setTimeout(() => router.push('/admin/dashboard'), 1000);
      } else {
        setToast({ message: 'Failed to update profile', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Failed to update profile', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <section className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-12 px-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">My Profile</h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 text-white font-semibold rounded-lg transition disabled:opacity-50"
              style={{ backgroundColor: 'rgba(0, 0, 58, 0.95)' }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
