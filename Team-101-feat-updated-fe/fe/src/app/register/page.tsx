'use client';

import { useState, useEffect } from 'react';
import FaceCapture from '../components/FaceCapture';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    org_id: 2,
    display_name: '',
    phone: '',
    email: '',
    preferred_contact: 'NONE',
    face_image: ''
  });
  const [message, setMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [registeredUser, setRegisteredUser] = useState<any>(null);

  const handleFaceCapture = (imageData: string) => {
    setFormData(prev => ({ ...prev, face_image: imageData }));
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.display_name) {
      setMessage('Name is required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://localhost:8000/api/v1/auth/register', {
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

  if (registeredUser) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Registration Successful!</h1>
            <p className="text-gray-500 mt-2">Participant profile created</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{registeredUser.display_name}</h2>
            <div className="space-y-2 text-gray-700 text-sm">
              <p><span className="font-semibold">ID:</span> {registeredUser.id}</p>
              {registeredUser.phone && <p><span className="font-semibold">Phone:</span> {registeredUser.phone}</p>}
              {registeredUser.email && <p><span className="font-semibold">Email:</span> {registeredUser.email}</p>}
            </div>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-xl p-6 text-center">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Your QR Code</h3>
            <div className="bg-white p-4 rounded-lg inline-block">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrCode}`}
                alt="QR Code"
                className="w-48 h-48 mx-auto"
              />
            </div>
            <p className="text-sm text-gray-600 mt-4 font-mono bg-gray-50 p-2 rounded">{qrCode}</p>
            <p className="text-xs text-gray-500 mt-2">Show this QR code to login</p>
          </div>

          <button
            onClick={() => {
              setRegisteredUser(null);
              setQrCode('');
              setFormData({ org_id: 2, display_name: '', phone: '', email: '', preferred_contact: 'NONE', face_image: '' });
            }}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-lg"
          >
            Register Another Participant
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">Register Participant</h1>
          <p className="text-gray-500 mt-2">Create a new participant profile</p>
        </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
          <input
            type="text"
            value={formData.display_name}
            onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900"
            placeholder="(555) 123-4567"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900"
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
              Face captured successfully
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
        >
          {loading ? 'Registering...' : 'Register Participant'}
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

      {showToast && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center animate-slide-in">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
          Face captured successfully!
        </div>
      )}
    </section>
  );
}
