'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface Training {
  id: number;
  title: string;
  description: string;
  location: string;
  training_date: string;
  status: string;
}

const STATUS_COLORS = {
  REGISTERED: 'bg-blue-100 text-blue-800 border-blue-300',
  ATTENDED: 'bg-green-100 text-green-800 border-green-300',
  COMPLETED: 'bg-purple-100 text-purple-800 border-purple-300',
  CANCELLED: 'bg-red-100 text-red-800 border-red-300'
};

export default function TrainingsPage() {
  const { user } = useAuth();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      window.location.replace('/login');
      return;
    }
    fetchTrainings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchTrainings = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/trainings/participant/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setTrainings(data);
      }
    } catch (error) {
      console.error('Failed to load trainings');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <section className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🎓 Training & Workshops</h1>
          <p className="text-gray-600 mb-6">Your registered trainings, workshops, and camps</p>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-12 w-12 border-4 border-green-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading...</p>
            </div>
          ) : trainings.length > 0 ? (
            <div className="space-y-4">
              {trainings.map(training => (
                <div key={training.id} className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6 border-2 border-green-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-4xl">📚</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{training.title}</h3>
                        {training.description && (
                          <p className="text-gray-700 text-sm mb-3">{training.description}</p>
                        )}
                        <div className="space-y-1 text-sm text-gray-600">
                          {training.location && (
                            <p className="flex items-center gap-2">
                              <span>📍</span>
                              <span>{training.location}</span>
                            </p>
                          )}
                          <p className="flex items-center gap-2">
                            <span>📅</span>
                            <span>{new Date(training.training_date).toLocaleDateString('en-US', { 
                              year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                            })}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[training.status as keyof typeof STATUS_COLORS]}`}>
                      {training.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-lg font-medium">No trainings registered yet</p>
              <p className="text-sm">Your registered workshops and training programs will appear here</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}