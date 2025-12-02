'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface Certification {
  id: number;
  title: string;
  issuer: string;
  description: string;
  issue_date: string;
}

export default function CertificationsPage() {
  const { user } = useAuth();
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      window.location.replace('/login');
      return;
    }
    fetchCertifications();
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

  if (!user) return null;

  return (
    <section className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🏆 Certifications & Reviews</h1>
          <p className="text-gray-600 mb-6">Your achievements and employer reviews (Read-only)</p>

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