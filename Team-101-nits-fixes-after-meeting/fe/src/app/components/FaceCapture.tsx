'use client';

import { useRef, useState, useCallback } from 'react';

interface FaceCaptureProps {
  onCapture: (imageData: string) => void;
  buttonText?: string;
  className?: string;
}

export default function FaceCapture({ onCapture, buttonText = "Capture Face", className = "" }: FaceCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string>('');

  const startCamera = useCallback(async () => {
    try {
      setError('');
      
      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Camera not supported in this browser. Please use the upload option.');
        return;
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      setError('Camera access denied or not available. Please use the upload option.');
      console.error('Camera error:', err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  }, []);

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    onCapture(imageData);
    stopCamera();
  }, [onCapture, stopCamera]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onCapture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {error && (
        <div className="text-red-800 text-sm bg-red-50 border border-red-200 p-3 rounded-lg font-medium">
          {error}
        </div>
      )}
      
      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className={`w-full max-w-md mx-auto rounded-lg border-2 border-gray-300 shadow-lg ${isStreaming ? 'block' : 'hidden'}`}
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex flex-col gap-2">
        {!isStreaming ? (
          <>
            <button
              type="button"
              onClick={startCamera}
              className="px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-md"
            >
              📷 Start Camera
            </button>
            <div className="text-center text-sm text-gray-400 font-medium">OR</div>
            <label className="px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 cursor-pointer text-center block transition shadow-md">
              📁 Upload Photo
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </>
        ) : (
          <div className="flex gap-2 justify-center">
            <button
              type="button"
              onClick={captureImage}
              className="px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition shadow-md"
            >
              ✓ {buttonText}
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="px-4 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition shadow-md"
            >
              ✕ Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}