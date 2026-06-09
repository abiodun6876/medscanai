'use client';

import { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

type Prediction = {
  className: string;
  probability: number;
};

export default function ImageAnalyzer() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const modelRef = useRef<mobilenet.MobileNet | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load the MobileNet model when component mounts
  useEffect(() => {
    async function loadModel() {
      try {
        // Initialize TensorFlow.js backend
        await tf.ready();
        console.log('[TensorFlow] Backend ready:', tf.getBackend());
        
        // Load MobileNet model (version 2, alpha 1.0 for best accuracy)
        modelRef.current = await mobilenet.load({
          version: 2,
          alpha: 1.0
        });
        console.log('[TensorFlow] MobileNet model loaded successfully');
        setIsModelLoading(false);
      } catch (error) {
        console.error('[TensorFlow] Failed to load model:', error);
        setIsModelLoading(false);
      }
    }
    
    loadModel();
  }, []);

  // Handle image upload and analysis
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setPredictions([]);

    // Wait for model to be ready
    if (!modelRef.current) {
      console.warn('[TensorFlow] Model not loaded yet');
      return;
    }

    setIsAnalyzing(true);

    try {
      // Create an image element and wait for it to load
      const img = new Image();
      img.src = url;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Run inference
      const results = await modelRef.current.classify(img);
      console.log('[TensorFlow] Analysis results:', results);
      
      // Format predictions for display (show top 5)
      setPredictions(results.slice(0, 5));
    } catch (error) {
      console.error('[TensorFlow] Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Get confidence level color
  const getConfidenceColor = (probability: number) => {
    if (probability > 0.7) return 'bg-green-500';
    if (probability > 0.4) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">MedScan AI - Image Analysis</h1>
      
      {/* Model Loading Status */}
      {isModelLoading && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          Loading AI model... This may take a few seconds on first load.
        </div>
      )}
      
      {/* Upload Section */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6 text-center">
        {!previewUrl ? (
          <>
            <div className="text-gray-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-600 mb-4">Upload a medical image (X-ray, MRI, CT scan)</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              disabled={isModelLoading}
            >
              Select Image
            </button>
          </>
        ) : (
          <div>
            <img src={previewUrl} alt="Preview" className="max-w-full max-h-96 mx-auto mb-4 rounded" />
            <button
              onClick={() => {
                setPreviewUrl(null);
                setPredictions([]);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Upload Different Image
            </button>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      {/* Analysis Results */}
      {isAnalyzing && (
        <div className="bg-gray-100 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
            <p className="text-gray-700">Analyzing image with AI...</p>
          </div>
        </div>
      )}

      {predictions.length > 0 && !isAnalyzing && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
          <div className="space-y-3">
            {predictions.map((pred, idx) => (
              <div key={idx} className="border-b pb-3 last:border-0">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-800">{pred.className}</span>
                  <span className="text-sm text-gray-600">
                    {(pred.probability * 100).toFixed(1)}% confidence
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${getConfidenceColor(pred.probability)} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${pred.probability * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Note: This is a general image classifier. For medical diagnosis, please consult a healthcare professional.
          </p>
        </div>
      )}
    </div>
  );
}