'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useAdminAuth } from '@/app/context/AdminAuthContext';

interface Certification {
  id: number;
  title: string;
  issuer: string;
  description: string;
  issue_date: string;
}

export default function CertificationsPage() {
  const { user } = useAuth();
  const { admin } = useAdminAuth();
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddCert, setShowAddCert] = useState(false);
  const [newCert, setNewCert] = useState({ title: '', issuer: '', description: '', issue_date: '' });
  const [certLoading, setCertLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCertifications();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchCertifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/certifications/participant/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setCertifications(data);
      }
    } catch (error) {
      console.error('Failed to load certifications');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCertification = async (e: React.FormEvent) => {
    e.preventDefault();
    setCertLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/certifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newCert, participant_id: user.id })
      });
      if (response.ok) {
        setNewCert({ title: '', issuer: '', description: '', issue_date: '' });
        setShowAddCert(false);
        fetchCertifications();
      }
    } catch (error) {
      console.error('Failed to add certification');
    } finally {
      setCertLoading(false);
    }
  };

  if (!user) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 py-12 px-4">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Please Login</h1>
          <p className="text-gray-600 mb-6">You need to login to access certifications</p>
          <a href="/login" className="inline-block py-3 px-6 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition">
            Go to Login
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">🏆 Certifications</h1>
              <p className="text-gray-600">Your achievements</p>
            </div>
            {admin && (
              <button
                onClick={() => setShowAddCert(!showAddCert)}
                className="px-4 py-2 text-white rounded-lg transition"
                style={{ backgroundColor: showAddCert ? 'rgba(145, 20, 35, 0.95)' : 'rgba(34, 197, 94, 1)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = showAddCert ? 'rgba(160, 30, 45, 0.9)' : 'rgba(22, 163, 74, 1)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = showAddCert ? 'rgba(145, 20, 35, 0.95)' : 'rgba(34, 197, 94, 1)'}
              >
                {showAddCert ? 'Cancel' : '+ Add Certification'}
              </button>
            )}
          </div>

          {showAddCert && (
            <form onSubmit={handleAddCertification} className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={newCert.title}
                    onChange={(e) => setNewCert({ ...newCert, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issuer *</label>
                  <input
                    type="text"
                    value={newCert.issuer}
                    onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date *</label>
                  <input
                    type="date"
                    value={newCert.issue_date}
                    onChange={(e) => setNewCert({ ...newCert, issue_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={newCert.description}
                    onChange={(e) => setNewCert({ ...newCert, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={certLoading}
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                {certLoading ? 'Adding...' : 'Add Certification'}
              </button>
            </form>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-12 w-12 border-4 border-orange-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading...</p>
            </div>
          ) : certifications.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {certifications.map(cert => (
                <div key={cert.id} className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border-2 border-orange-200">
                  <div className="flex items-start gap-4">
                    <div className="text-5xl">🏅</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">{cert.title}</h3>
                      <p className="text-sm font-semibold text-orange-600 mb-2">Issued by: {cert.issuer}</p>
                      {cert.description && (
                        <p className="text-gray-700 text-sm mb-3">{cert.description}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        📅 {new Date(cert.issue_date).toLocaleDateString('en-US', { 
                          year: 'numeric', month: 'long', day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <p className="text-lg font-medium">No certifications yet</p>
              <p className="text-sm">Certifications and reviews from employers will appear here</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}