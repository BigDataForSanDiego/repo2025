'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useEmployerAuth } from '@/app/context/EmployerAuthContext';
import { useAdminAuth } from '@/app/context/AdminAuthContext';

export default function ReviewsPage() {
  const { user } = useAuth();
  const { employer } = useEmployerAuth();
  const { admin } = useAdminAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    review_text: ''
  });

  useEffect(() => {
    if (user) {
      loadReviews();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadReviews = () => {
    if (!user) return;
    fetch(`http://localhost:8000/api/v1/reviews/participant/${user.id}`)
      .then(res => res.json())
      .then(data => {
        setReviews(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setReviews([]);
        setLoading(false);
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !employer) return;

    try {
      const res = await fetch('http://localhost:8000/api/v1/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participant_id: user.id,
          employer_id: employer.id,
          rating: formData.rating,
          review_text: formData.review_text
        })
      });

      if (res.ok) {
        setShowModal(false);
        setFormData({ rating: 5, review_text: '' });
        loadReviews();
      }
    } catch (error) {
      console.error('Failed to submit review');
    }
  };

  if (!user) return null;

  return (
    <section className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">⭐ Reviews</h1>
              <p className="text-gray-600 mt-1">Employer testimonials and feedback</p>
            </div>
            {employer && !admin && (
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 text-white rounded-lg transition"
                style={{ backgroundColor: 'rgba(0, 0, 58, 0.95)' }}
              >
                + Add Review
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-12 w-12 border-4 border-yellow-600 border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No reviews yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review: any) => (
                <div key={review.id} className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-800">{review.employer_name || 'Employer'}</h3>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-5 h-5 ${i < review.rating ? 'text-yellow-500' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-700">{review.review_text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Add Review</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                      className="focus:outline-none"
                    >
                      <svg className={`w-8 h-8 ${star <= formData.rating ? 'text-yellow-500' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Review</label>
                <textarea
                  value={formData.review_text}
                  onChange={(e) => setFormData(prev => ({ ...prev, review_text: e.target.value }))}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 text-gray-900"
                  placeholder="Share your experience working with this individual..."
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 text-white font-semibold rounded-lg transition" style={{ backgroundColor: 'rgba(0, 0, 58, 0.95)' }}>
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
