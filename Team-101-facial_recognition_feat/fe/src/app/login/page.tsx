'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import QRScanner from '../components/QRScanner';
import FaceCapture from '../components/FaceCapture';

export default function LoginPage() {
  const { user } = useAuth();
  const [loginMethod, setLoginMethod] = useState<'qr' | 'face'>('qr');
  const [qrCode, setQrCode] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [participant, setParticipant] = useState<any>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);

  // Redirect if already logged in (only on mount)
  useEffect(() => {
    if (user) {
      window.location.replace('/dashboard');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const performLogin = async (code: string) => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('https://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_uid: code.trim() })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Add smooth transition delay
        await new Promise(resolve => setTimeout(resolve, 800));
        setParticipant(result.participant);
        setMessage(result.message);
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
      const response = await fetch('https://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ face_image: imageData })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setParticipant(result.participant);
        setMessage(result.message);
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setParticipant(null);
    setMessage('');
    setQrCode('');
  };

  useEffect(() => {
    if (participant) {
      localStorage.setItem('user', JSON.stringify(participant));
      // Force page reload to pick up auth context
      setTimeout(() => {
        window.location.replace('/dashboard');
      }, 1500);
    }
  }, [participant]);

  // Don't check user here to avoid loop
  if (participant) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Login Successful</h1>
            <p className="text-gray-500 mt-2">Welcome back!</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Welcome, {participant.display_name}!</h2>
            <div className="space-y-3 text-gray-700">
              <div className="flex items-center">
                <span className="font-semibold w-24">ID:</span>
                <span className="text-gray-600">{participant.id}</span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold w-24">QR Code:</span>
                <span className="text-gray-600 text-sm break-all">{participant.qr_uid}</span>
              </div>
              {participant.phone && (
                <div className="flex items-center">
                  <span className="font-semibold w-24">Phone:</span>
                  <span className="text-gray-600">{participant.phone}</span>
                </div>
              )}
              {participant.email && (
                <div className="flex items-center">
                  <span className="font-semibold w-24">Email:</span>
                  <span className="text-gray-600">{participant.email}</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition shadow-lg"
          >
            Logout
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">Participant Login</h1>
          <p className="text-gray-500 mt-2">Access your profile</p>
        </div>
      
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setLoginMethod('qr')}
            className={`flex-1 py-3 rounded-lg font-semibold transition ${
              loginMethod === 'qr'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            📱 QR Code
          </button>
          <button
            type="button"
            onClick={() => setLoginMethod('face')}
            className={`flex-1 py-3 rounded-lg font-semibold transition ${
              loginMethod === 'face'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
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
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition font-mono text-sm text-gray-900"
                required
              />
              <button
                type="button"
                onClick={() => setShowScanner(true)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                title="Scan QR Code"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">💡 Tip: Copy the code from your registration or click the camera icon to scan</p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
          >
            {loading ? 'Logging in...' : 'Login with QR Code'}
          </button>
        </form>
        ) : (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-200">
            <div className="text-center mb-4">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800">Face ID Login</h3>
              <p className="text-sm text-gray-600 mt-1">Position your face in the camera</p>
            </div>
            <FaceCapture 
              onCapture={handleFaceLogin} 
              buttonText="Start Face Login"
            />
          </div>
        </div>
        )}

        {showScanner && (
          <QRScanner 
            onScan={(code) => {
              setQrCode(code);
              setScanSuccess(true);
              // Show success animation then auto-login
              setTimeout(() => {
                setShowScanner(false);
                setScanSuccess(false);
                // Directly perform login with scanned code
                performLogin(code);
              }, 1000);
            }}
            onClose={() => setShowScanner(false)}
          />
        )}

        {scanSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center space-y-4 animate-scale-in">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              </div>
              <p className="text-lg font-semibold text-gray-800">QR Code Scanned!</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto">
                <svg className="animate-spin h-16 w-16 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="text-lg font-semibold text-gray-800">Logging in...</p>
              <p className="text-sm text-gray-500">Please wait</p>
            </div>
          </div>
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
