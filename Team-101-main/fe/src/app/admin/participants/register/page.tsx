'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/app/context/AdminAuthContext';
import FaceCapture from '@/app/components/FaceCapture';
import BackButton from '@/app/components/BackButton';

export default function RegisterParticipant() {
  const { admin } = useAdminAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    org_id: 2,
    display_name: '',
    phone: '',
    email: '',
    preferred_contact: 'NONE',
    face_image: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [registeredUser, setRegisteredUser] = useState<any>(null);

  useEffect(() => {
    if (!admin) {
      router.push('/admin/login');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin]);

  if (!admin) return null;

  const handleFaceCapture = (imageData: string) => {
    setFormData(prev => ({ ...prev, face_image: imageData }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.display_name) {
      setMessage('Name is required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setRegisteredUser(result.participant);
        setQrCode(result.participant.qr_uid);
        setMessage('Registration successful!');
      } else {
        setMessage(result.message || 'Registration failed');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <BackButton href="/admin/dashboard" label="Back to Dashboard" />
        <h1 className="text-3xl font-bold text-gray-800">Register Individual</h1>
      
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
            <input
              type="text"
              value={formData.display_name}
              onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="Enter full name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="(555) 123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="email@example.com"
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Face ID Registration</label>
            <FaceCapture onCapture={handleFaceCapture} buttonText="Register Face" />
            {formData.face_image && (
              <div className="mt-3 flex items-center text-green-600 text-sm font-medium">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                Face captured
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-white font-semibold rounded-lg disabled:opacity-50 transition"
            style={{ backgroundColor: 'rgba(0, 0, 58, 0.95)' }}
          >
            {loading ? 'Registering...' : 'Register Individual'}
          </button>

          {message && (
            <div className={`p-4 rounded-lg text-sm font-medium ${
              message.includes('successful') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}
        </form>
      </div>

      {registeredUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Individual Registered!</h2>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">{registeredUser.display_name}</h3>
              <div className="space-y-2 text-gray-700 text-sm">
                <p><span className="font-semibold">ID:</span> {registeredUser.id}</p>
                {registeredUser.phone && <p><span className="font-semibold">Phone:</span> {registeredUser.phone}</p>}
                {registeredUser.email && <p><span className="font-semibold">Email:</span> {registeredUser.email}</p>}
              </div>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 text-center">
              <h4 className="text-lg font-bold text-gray-800 mb-4">QR Code</h4>
              <div className="bg-white p-4 rounded-lg inline-block">
                <img 
                  src={`http://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrCode}`}
                  alt="QR Code"
                  className="w-48 h-48 mx-auto"
                />
              </div>
              <p className="text-sm text-gray-600 mt-4 font-mono bg-gray-50 p-2 rounded">{qrCode}</p>
            </div>

            <button
              onClick={() => {
                setRegisteredUser(null);
                setQrCode('');
                setFormData({ org_id: 2, display_name: '', phone: '', email: '', preferred_contact: 'NONE', face_image: '' });
              }}
              className="w-full py-3 text-white font-semibold rounded-lg transition"
              style={{ backgroundColor: 'rgba(0, 0, 58, 0.95)' }}
            >
              Register Another
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
