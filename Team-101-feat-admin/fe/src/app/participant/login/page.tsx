'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import QRScanner from '@/app/components/QRScanner';
import FaceCapture from '@/app/components/FaceCapture';

export default function ParticipantLogin() {
  const { login } = useAuth();
  const router = useRouter();
  const [loginMethod, setLoginMethod] = useState<'qr' | 'face'>('qr');
  const [qrCode, setQrCode] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const performLogin = async (code: string) => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_uid: code.trim() })
      });
      
      const result = await response.json();
      
      if (result.success) {
        login(result.participant);
        window.location.href = '/participant/dashboard';
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQRLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrCode.trim()) {
      setMessage('Please enter QR code');
      return;
    }
    await performLogin(qrCode);
  };

  const handleFaceLogin = async (imageData: string) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ face_image: imageData })
      });
      
      const result = await response.json();
      
      if (result.success) {
        login(result.participant);
        window.location.href = '/participant/dashboard';
      } else {
        setMessage(result.message);
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
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">Individual Login</h1>
          <p className="text-gray-500 mt-2">Access your profile</p>
        </div>
      
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setLoginMethod('qr')}
            className={`flex-1 py-3 rounded-lg font-semibold transition ${
              loginMethod === 'qr'
                ? 'text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            style={loginMethod === 'qr' ? { backgroundColor: 'rgba(0, 0, 58, 0.95)' } : {}}
          >
            📱 QR Code
          </button>
          <button
            type="button"
            onClick={() => setLoginMethod('face')}
            className={`flex-1 py-3 rounded-lg font-semibold transition ${
              loginMethod === 'face'
                ? 'text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            style={loginMethod === 'face' ? { backgroundColor: 'rgba(0, 0, 58, 0.95)' } : {}}
          >
            👤 Face ID
          </button>
        </div>

        {loginMethod === 'qr' ? (
          <form onSubmit={handleQRLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Enter QR Code</label>
              <div className="relative">
                <input
                  type="text"
                  value={qrCode}
                  onChange={(e) => setQrCode(e.target.value)}
                  placeholder="Paste or type your QR code here"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowScanner(true)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-white font-semibold rounded-lg disabled:opacity-50 transition"
              style={{ backgroundColor: 'rgba(0, 0, 58, 0.95)' }}
            >
              {loading ? 'Logging in...' : 'Login with QR Code'}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-200">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Face ID Login</h3>
                <p className="text-sm text-gray-600 mt-1">Position your face in the camera</p>
              </div>
              <FaceCapture onCapture={handleFaceLogin} buttonText="Start Face Login" />
            </div>
          </div>
        )}

        {showScanner && (
          <QRScanner 
            onScan={(code) => {
              setQrCode(code);
              setShowScanner(false);
              performLogin(code);
            }}
            onClose={() => setShowScanner(false)}
          />
        )}

        {message && (
          <div className={`p-4 rounded-lg text-sm font-medium ${
            message.includes('successful') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}
      </div>
    </section>
  );
}
