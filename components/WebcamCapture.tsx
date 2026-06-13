'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';

interface WebcamCaptureProps {
  onCapture: (file: File) => void;
  onCancel: () => void;
}

export function WebcamCapture({ onCapture, onCancel }: WebcamCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [isReady, setIsReady] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: 'environment'
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err: any) {
      console.error("Camera error:", err);
      setError(err.message || 'Failed to access camera.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const handleCanPlay = () => {
    setIsReady(true);
    if (videoRef.current) {
      videoRef.current.play().catch(console.error);
    }
  };

  const takeSnapshot = () => {
    if (!videoRef.current || !isReady) return;
    
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1920;
    canvas.height = video.videoHeight || 1080;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      if (!blob) {
        setError('Failed to process image');
        return;
      }
      const file = new File([blob], `webcam-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
      stopCamera();
      onCapture(file);
    }, 'image/jpeg', 0.95);
  };

  return (
    <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video flex flex-col items-center justify-center border-2 border-slate-800">
      {error ? (
        <div className="p-6 text-center">
          <p className="text-rose-400 mb-4">{error}</p>
          <button 
            onClick={startCamera}
            className="px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition"
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            onCanPlay={handleCanPlay}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transition-opacity duration-300 ${isReady ? 'opacity-100' : 'opacity-0'}`}
          />
          {!isReady && !error && (
             <div className="absolute inset-0 flex items-center justify-center text-slate-400">
               <div className="w-8 h-8 border-4 border-slate-700 border-t-brand-500 rounded-full animate-spin" />
             </div>
          )}
          
          <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-6">
            <button
              onClick={onCancel}
              className="w-12 h-12 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-slate-800 backdrop-blur transition"
              title="Cancel"
            >
              ✕
            </button>
            <button
              onClick={takeSnapshot}
              disabled={!isReady}
              className="w-16 h-16 rounded-full border-4 border-white/50 flex items-center justify-center hover:scale-105 hover:border-white transition group disabled:opacity-50 disabled:hover:scale-100"
              title="Take Photo"
            >
              <div className="w-12 h-12 bg-white rounded-full group-active:scale-95 transition" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
