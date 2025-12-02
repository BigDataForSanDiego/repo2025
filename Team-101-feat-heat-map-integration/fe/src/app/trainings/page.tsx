'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface Training {
  id: number;
  training_session_id?: number;
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
  const [upcomingTrainings, setUpcomingTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'completed' | 'registered' | 'upcoming'>('registered');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);

  useEffect(() => {
    if (user) {
      fetchTrainings();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchTrainings = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/trainings/participant/${user.id}`);
      let userData: Training[] = [];
      if (response.ok) {
        userData = await response.json();
        setTrainings(userData);
      }
      
      const upcomingResponse = await fetch(`http://localhost:8000/api/v1/trainings/sessions/available/${user.id}`);
      if (upcomingResponse.ok) {
        const availableSessions = await upcomingResponse.json();
        setUpcomingTrainings(availableSessions);
      }
    } catch (error) {
      console.error('Failed to load trainings');
    } finally {
      setLoading(false);
    }
  };

  const openRegisterModal = (training: Training) => {
    setSelectedTraining(training);
    setShowRegisterModal(true);
  };

  const handleRegister = async () => {
    if (!user || !selectedTraining) return;
    setRegistering(selectedTraining.id);
    try {
      const response = await fetch('http://localhost:8000/api/v1/trainings/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participant_id: user.id,
          training_session_id: selectedTraining.id
        })
      });

      if (response.ok) {
        setShowRegisterModal(false);
        fetchTrainings();
      }
    } catch (error) {
      console.error('Failed to register');
    } finally {
      setRegistering(null);
    }
  };

  if (!user) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 py-12 px-4">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Please Login</h1>
          <p className="text-gray-600 mb-6">You need to login to access trainings</p>
          <a href="/login" className="inline-block py-3 px-6 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition">
            Go to Login
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🎓 Training & Workshops</h1>
          <p className="text-gray-600 mb-6">Your registered trainings, workshops, and camps</p>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-6 py-3 font-semibold transition ${
                activeTab === 'completed'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              ✓ Completed
            </button>
            <button
              onClick={() => setActiveTab('registered')}
              className={`px-6 py-3 font-semibold transition ${
                activeTab === 'registered'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📝 Registered
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-6 py-3 font-semibold transition ${
                activeTab === 'upcoming'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🎯 Upcoming
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-12 w-12 border-4 border-green-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading...</p>
            </div>
          ) : (
            <div>
              {/* Completed Tab */}
              {activeTab === 'completed' && (
                <div>
                  {trainings.filter(t => t.status === 'COMPLETED').length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {trainings.filter(t => t.status === 'COMPLETED').map(training => (
                        <div key={training.id} className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2 border-purple-200">
                          <h3 className="font-bold text-gray-800 mb-1">{training.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{training.description}</p>
                          <div className="text-xs text-gray-500 space-y-1">
                            <p>📍 {training.location}</p>
                            <p>📅 {new Date(training.training_date).toLocaleDateString()}</p>
                          </div>
                          <span className="inline-block mt-2 px-2 py-1 rounded-full text-xs font-semibold bg-purple-200 text-purple-800">
                            ✓ Completed
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <p>No completed trainings yet</p>
                    </div>
                  )}
                </div>
              )}

              {/* Registered Tab */}
              {activeTab === 'registered' && (
                <div>
                  {trainings.filter(t => t.status === 'REGISTERED').length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {trainings.filter(t => t.status === 'REGISTERED').map(training => (
                        <div key={training.id} className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
                          <h3 className="font-bold text-gray-800 mb-1">{training.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{training.description}</p>
                          <div className="text-xs text-gray-500 space-y-1">
                            <p>📍 {training.location}</p>
                            <p>📅 {new Date(training.training_date).toLocaleDateString()}</p>
                          </div>
                          <span className="inline-block mt-2 px-2 py-1 rounded-full text-xs font-semibold bg-blue-200 text-blue-800">
                            📝 Registered
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <p>No registered trainings yet</p>
                    </div>
                  )}
                </div>
              )}

              {/* Upcoming Tab */}
              {activeTab === 'upcoming' && (
                <div>
                  {upcomingTrainings.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {upcomingTrainings.map(training => (
                        <div key={training.id} className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-4 border-2 border-green-200">
                          <h3 className="font-bold text-gray-800 mb-1">{training.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{training.description}</p>
                          <div className="text-xs text-gray-500 space-y-1 mb-3">
                            <p>📍 {training.location}</p>
                            <p>📅 {new Date(training.training_date).toLocaleDateString()}</p>
                          </div>
                          <button
                            onClick={() => openRegisterModal(training)}
                            className="w-full py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 text-sm"
                          >
                            Register
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <p>No upcoming trainings available</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Register Confirmation Modal */}
      {showRegisterModal && selectedTraining && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Confirm Registration</h3>
            <div className="bg-green-50 rounded-xl p-4 mb-6 border border-green-200">
              <h4 className="font-bold text-gray-800 mb-2">{selectedTraining.title}</h4>
              <p className="text-sm text-gray-600 mb-3">{selectedTraining.description}</p>
              <div className="text-sm text-gray-600 space-y-1">
                <p>📍 {selectedTraining.location}</p>
                <p>📅 {new Date(selectedTraining.training_date).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                })}</p>
              </div>
            </div>
            <p className="text-gray-600 mb-6">Are you sure you want to register for this training?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRegisterModal(false)}
                disabled={registering === selectedTraining.id}
                className="flex-1 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRegister}
                disabled={registering === selectedTraining.id}
                className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
              >
                {registering === selectedTraining.id ? 'Registering...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}