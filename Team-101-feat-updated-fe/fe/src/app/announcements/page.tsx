'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface Announcement {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      window.location.replace('/login');
      return;
    }
    fetchAnnouncements();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/announcements');
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data);
      }
    } catch (error) {
      console.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <section className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">📢 Announcements</h1>
          <p className="text-gray-600 mb-6">Stay updated with latest news and updates</p>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-12 w-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading...</p>
            </div>
          ) : announcements.length > 0 ? (
            <div className="space-y-4">
              {announcements.map(announcement => (
                <div key={announcement.id} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{announcement.title}</h3>
                  <p className="text-gray-700 mb-3 whitespace-pre-wrap">{announcement.content}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(announcement.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                    })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
              <p className="text-lg font-medium">No announcements yet</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}