'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { BrowserQRCodeReader } from '@zxing/library';

interface QRScannerProps {
  onScan: (qrCode: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const codeReaderRef = useRef<BrowserQRCodeReader | null>(null);

  const startScanner = useCallback(async () => {
    try {
      setError('');
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Camera not supported in this browser');
        return;
      }
      
      const codeReader = new BrowserQRCodeReader();
      codeReaderRef.current = codeReader;
      
      setIsScanning(true);
      
      // Start decoding from video device
      codeReader.decodeFromVideoDevice(
        undefined, // Use default camera
        videoRef.current!,
        (result, error) => {
          if (result) {
            const qrText = result.getText();
            onScan(qrText);
            stopScanner();
          }
          if (error && !(error.name === 'NotFoundException')) {
            console.error('QR Scan error:', error);
          }
        }
      );
    } catch (err) {
      setError('Camera access denied or QR scanner failed');
      console.error('Camera error:', err);
    }
  }, [onScan]);

  const stopScanner = useCallback(() => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
      codeReaderRef.current = null;
    }
    setIsScanning(false);
    onClose();
  }, [onClose]);
  
  useEffect(() => {
    return () => {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">Scan QR Code</h3>
          <button
            type="button"
            onClick={stopScanner}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="text-red-800 text-sm bg-red-50 border border-red-200 p-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="relative">
          <video
            ref={videoRef}
            className={`w-full rounded-lg border-2 border-gray-300 ${isScanning ? 'block' : 'hidden'}`}
          />
          {!isScanning && (
            <div className="bg-gray-100 rounded-lg p-12 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              <p className="text-gray-600">Camera not started</p>
            </div>
          )}
          {isScanning && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 border-4 border-blue-500 rounded-lg shadow-lg">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-600"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-600"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-600"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-600"></div>
              </div>
            </div>
          )}
        </div>

        {!isScanning ? (
          <button
            type="button"
            onClick={startScanner}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-md"
          >
            📷 Start Camera
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-600 text-center font-medium">
              📱 Position the QR code within the frame
            </p>
            <p className="text-xs text-gray-500 text-center">
              The scanner will automatically detect and read the QR code
            </p>
            <button
              type="button"
              onClick={stopScanner}
              className="w-full py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}