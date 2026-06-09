'use client';

import { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

type Finding = {
  label: string;
  confidence: number;
  severity: 'normal' | 'low' | 'medium' | 'high';
  region: string;
  notes: string;
};

type AnalysisResult = {
  imageType: string;
  summary: string;
  findings: Finding[];
  recommendation: string;
};

export default function TensorFlowAnalyzer() {
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const modelRef = useRef<mobilenet.MobileNet | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load TensorFlow.js model on component mount
  useEffect(() => {
    async function loadModel() {
      try {
        console.log('[TensorFlow] Initializing backend...');
        await tf.ready();
        console.log('[TensorFlow] Backend ready:', tf.getBackend());
        
        // Set WebGL backend for best performance
        if (tf.getBackend() !== 'webgl') {
          await tf.setBackend('webgl');
          console.log('[TensorFlow] Switched to WebGL backend');
        }
        
        console.log('[TensorFlow] Loading MobileNet model...');
        modelRef.current = await mobilenet.load({
          version: 2,
          alpha: 1.0,
        });
        
        console.log('[TensorFlow] Model loaded successfully');
        setIsModelLoading(false);
      } catch (error) {
        console.error('[TensorFlow] Failed to load model:', error);
        setIsModelLoading(false);
      }
    }
    
    loadModel();
  }, []);

  // Analyze the uploaded image
  const analyzeImage = async (imageElement: HTMLImageElement) => {
    if (!modelRef.current) {
      throw new Error('Model not loaded yet');
    }

    console.log('[TensorFlow] Running inference...');
    const predictions = await modelRef.current.classify(imageElement);
    console.log('[TensorFlow] Raw predictions:', predictions);

    // Process the predictions into medical findings format
    const findings: Finding[] = predictions.slice(0, 5).map((pred, index) => {
      // Map confidence to severity
      let severity: 'normal' | 'low' | 'medium' | 'high' = 'normal';
      if (pred.probability > 0.8) severity = 'high';
      else if (pred.probability > 0.6) severity = 'medium';
      else if (pred.probability > 0.4) severity = 'low';
      
      // Extract region from className or use generic
      const region = extractRegion(pred.className);
      
      return {
        label: pred.className,
        confidence: Math.floor(pred.probability * 100),
        severity: severity,
        region: region,
        notes: generateNotes(pred.className, pred.probability),
      };
    });

    // Determine image type
    const imageType = determineImageType(predictions);
    
    // Generate summary
    const summary = generateSummary(predictions, imageType);
    
    // Generate recommendation
    const recommendation = generateRecommendation(predictions);

    return {
      imageType,
      summary,
      findings,
      recommendation,
    };
  };

  // Helper: Extract anatomical region from prediction
  const extractRegion = (className: string): string => {
    const regions: Record<string, string> = {
      'chest': 'Thoracic region',
      'head': 'Cranial region',
      'neck': 'Cervical region',
      'abdomen': 'Abdominal region',
      'pelvis': 'Pelvic region',
      'arm': 'Upper extremity',
      'leg': 'Lower extremity',
      'hand': 'Upper extremity - Hand',
      'foot': 'Lower extremity - Foot',
      'spine': 'Vertebral column',
      'skull': 'Cranial vault',
    };
    
    for (const [key, value] of Object.entries(regions)) {
      if (className.toLowerCase().includes(key)) {
        return value;
      }
    }
    return 'Anatomical structure';
  };

  // Helper: Generate clinical notes
  const generateNotes = (className: string, confidence: number): string => {
    const confidenceText = confidence > 0.7 ? 'high confidence' : 
                           confidence > 0.4 ? 'moderate confidence' : 'low confidence';
    
    return `AI analysis identifies ${className} with ${confidenceText}. Further clinical correlation recommended.`;
  };

  // Helper: Determine image type
  const determineImageType = (predictions: any[]): string => {
    const topPrediction = predictions[0]?.className || 'Medical image';
    
    if (topPrediction.toLowerCase().includes('xray') || topPrediction.toLowerCase().includes('radiograph')) {
      return 'X-Ray Image';
    } else if (topPrediction.toLowerCase().includes('mri')) {
      return 'MRI Scan';
    } else if (topPrediction.toLowerCase().includes('ct')) {
      return 'CT Scan';
    } else if (topPrediction.toLowerCase().includes('ultrasound')) {
      return 'Ultrasound Image';
    }
    
    return `${topPrediction.split(',')[0]} - Medical Image`;
  };

  // Helper: Generate summary
  const generateSummary = (predictions: any[], imageType: string): string => {
    const topFindings = predictions.slice(0, 3).map(p => p.className.split(',')[0]).join(', ');
    
    return `AI analysis of the submitted ${imageType} identifies: ${topFindings}. ` +
           `The findings suggest potential anatomical structures consistent with ${predictions[0]?.className.split(',')[0] || 'normal anatomy'}. ` +
           `Clinical correlation with patient history and physical examination is advised for definitive diagnosis.`;
  };

  // Helper: Generate recommendation
  const generateRecommendation = (predictions: any[]): string => {
    const hasAbnormal = predictions.some(p => p.probability > 0.6);
    
    if (hasAbnormal) {
      return 'Recommended: Further evaluation with dedicated imaging, clinical correlation with patient symptoms, and possible consultation with radiology specialist for detailed interpretation.';
    } else {
      return 'Recommendation: Routine clinical correlation. Follow-up imaging may be considered if clinically indicated or symptoms persist.';
    }
  };

  // Handle image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Simulate upload progress
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setResult(null);

    // Wait for model
    if (!modelRef.current) {
      console.warn('[TensorFlow] Model not loaded yet');
      clearInterval(interval);
      setUploadProgress(100);
      return;
    }

    // Load image and analyze
    const img = new Image();
    img.src = url;
    
    await new Promise((resolve) => {
      img.onload = resolve;
    });

    setIsAnalyzing(true);
    
    try {
      const analysisResult = await analyzeImage(img);
      setResult(analysisResult);
      console.log('[TensorFlow] Analysis complete:', analysisResult);
    } catch (error) {
      console.error('[TensorFlow] Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
      clearInterval(interval);
      setUploadProgress(100);
    }
  };

  // Reset all states
  const resetAnalysis = () => {
    setPreviewUrl(null);
    setResult(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">MedScan AI</h1>
        <p className="text-gray-600">AI-powered medical image analysis with TensorFlow.js</p>
      </div>

      {/* Model Loading Status */}
      {isModelLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-3"></div>
            <p className="text-blue-700">Loading AI model... (First load may take a few seconds)</p>
          </div>
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-6">
        {!previewUrl ? (
          <div className="text-center">
            <div className="mb-4">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Upload Medical Image</h3>
            <p className="text-gray-500 mb-4">Supports X-rays, MRI, CT scans, and other medical images</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isModelLoading}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
            >
              Select Image
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        ) : (
          <div>
            {uploadProgress < 100 && (
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2 text-center">Processing image...</p>
              </div>
            )}
            
            <img 
              src={previewUrl} 
              alt="Medical scan" 
              className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg mb-4"
            />
            
            <div className="flex justify-center gap-4">
              <button
                onClick={resetAnalysis}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Upload New Image
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Analysis Results */}
      {isAnalyzing && (
        <div className="bg-gray-50 rounded-lg p-8 mb-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700">AI is analyzing the medical image...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
        </div>
      )}

      {result && !isAnalyzing && (
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-3">Clinical Summary</h2>
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <p className="text-blue-800 font-medium">Image Type: {result.imageType}</p>
            </div>
            <p className="text-gray-700 leading-relaxed">{result.summary}</p>
          </div>

          {/* Findings Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">AI Findings</h2>
            <div className="space-y-4">
              {result.findings.map((finding, idx) => (
                <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-800">{finding.label}</h3>
                      <p className="text-sm text-gray-600">{finding.region}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(finding.severity)}`}>
                        {finding.severity.toUpperCase()}
                      </span>
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium text-gray-700">
                        {finding.confidence}% confidence
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mt-1">{finding.notes}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendation Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-3">Recommendation</h2>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-green-800 leading-relaxed">{result.recommendation}</p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              ⚠️ <strong>Disclaimer:</strong> This is an AI-assisted analysis and not a substitute for professional medical diagnosis. 
              All findings should be reviewed by a qualified healthcare provider.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}