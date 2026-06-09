'use client';

import { useState, useEffect } from 'react';

interface Landmark {
  id: string;
  name: string;
  x: number;
  y: number;
  confidence?: number;
}

interface AnatomicalLandmarksProps {
  imageUrl: string;
  modality: 'xray' | 'ct' | 'mri';
  region: 'chest' | 'spine' | 'brain' | 'extremity';
  onLandmarkSelect?: (landmark: Landmark) => void;
}

export function AnatomicalLandmarks({ imageUrl, modality, region, onLandmarkSelect }: AnatomicalLandmarksProps) {
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  const [selectedLandmark, setSelectedLandmark] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);

  // Simulate AI landmark detection
  const detectLandmarks = async () => {
    setIsDetecting(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock landmarks based on region
    const mockLandmarks: Record<string, Landmark[]> = {
      chest: [
        { id: '1', name: 'Trachea', x: 50, y: 20, confidence: 0.95 },
        { id: '2', name: 'Carina', x: 50, y: 35, confidence: 0.92 },
        { id: '3', name: 'Right Main Bronchus', x: 60, y: 38, confidence: 0.88 },
        { id: '4', name: 'Left Main Bronchus', x: 40, y: 38, confidence: 0.87 },
        { id: '5', name: 'Aortic Arch', x: 45, y: 30, confidence: 0.91 },
        { id: '6', name: 'Right Hemidiaphragm', x: 65, y: 75, confidence: 0.89 },
        { id: '7', name: 'Left Hemidiaphragm', x: 35, y: 75, confidence: 0.88 },
        { id: '8', name: 'Heart Border', x: 50, y: 55, confidence: 0.93 },
      ],
      spine: [
        { id: '1', name: 'C1 (Atlas)', x: 50, y: 10, confidence: 0.94 },
        { id: '2', name: 'C7', x: 50, y: 25, confidence: 0.92 },
        { id: '3', name: 'T1', x: 50, y: 30, confidence: 0.91 },
        { id: '4', name: 'T6', x: 50, y: 50, confidence: 0.90 },
        { id: '5', name: 'T12', x: 50, y: 70, confidence: 0.89 },
        { id: '6', name: 'L1', x: 50, y: 75, confidence: 0.88 },
        { id: '7', name: 'L5', x: 50, y: 90, confidence: 0.87 },
      ],
      brain: [
        { id: '1', name: 'Frontal Lobe', x: 50, y: 30, confidence: 0.96 },
        { id: '2', name: 'Parietal Lobe', x: 60, y: 45, confidence: 0.94 },
        { id: '3', name: 'Occipital Lobe', x: 50, y: 65, confidence: 0.93 },
        { id: '4', name: 'Temporal Lobe', x: 35, y: 50, confidence: 0.92 },
        { id: '5', name: 'Cerebellum', x: 50, y: 80, confidence: 0.95 },
        { id: '6', name: 'Brainstem', x: 50, y: 70, confidence: 0.94 },
        { id: '7', name: 'Corpus Callosum', x: 50, y: 45, confidence: 0.91 },
      ],
      extremity: [
        { id: '1', name: 'Proximal Phalanx', x: 50, y: 20, confidence: 0.93 },
        { id: '2', name: 'Middle Phalanx', x: 50, y: 40, confidence: 0.92 },
        { id: '3', name: 'Distal Phalanx', x: 50, y: 60, confidence: 0.91 },
        { id: '4', name: 'Metacarpal', x: 50, y: 75, confidence: 0.94 },
        { id: '5', name: 'Joint Space', x: 50, y: 35, confidence: 0.88 },
      ],
    };
    
    setLandmarks(mockLandmarks[region] || mockLandmarks.chest);
    setIsDetecting(false);
  };

  useEffect(() => {
    detectLandmarks();
  }, [region]);

  const handleLandmarkClick = (landmark: Landmark) => {
    setSelectedLandmark(landmark.id);
    onLandmarkSelect?.(landmark);
  };

  const calculateCobbAngle = () => {
    // Find upper and lower vertebrae for Cobb angle calculation
    const upperVertebra = landmarks.find(l => l.name === 'T1');
    const lowerVertebra = landmarks.find(l => l.name === 'L1');
    
    if (upperVertebra && lowerVertebra) {
      // Simulate angle calculation
      return { angle: 24.5, severity: 'Mild' as const };
    }
    return null;
  };

  const calculateCardiothoracicRatio = () => {
    const heartBorder = landmarks.find(l => l.name === 'Heart Border');
    if (heartBorder) {
      return { ratio: 0.52, interpretation: 'Normal' as const };
    }
    return null;
  };

  const cobbAngle = calculateCobbAngle();
  const ctRatio = calculateCardiothoracicRatio();

  return (
    <div className="bg-slate-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">🏷️ Anatomical Landmarks</h3>
        {isDetecting && (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-500"></div>
            <span className="text-xs text-slate-400">Detecting...</span>
          </div>
        )}
      </div>
      
      {/* Quick Measurements */}
      {(region === 'spine' || region === 'chest') && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          {cobbAngle && (
            <div className="bg-slate-700/50 rounded-lg p-3">
              <div className="text-xs text-slate-400">Cobb Angle</div>
              <div className="text-xl font-bold text-white">{cobbAngle.angle}°</div>
              <div className="text-xs text-yellow-400">{cobbAngle.severity} Scoliosis</div>
            </div>
          )}
          {ctRatio && (
            <div className="bg-slate-700/50 rounded-lg p-3">
              <div className="text-xs text-slate-400">Cardiothoracic Ratio</div>
              <div className="text-xl font-bold text-white">{ctRatio.ratio}</div>
              <div className="text-xs text-green-400">{ctRatio.interpretation}</div>
            </div>
          )}
        </div>
      )}
      
      {/* Landmarks Grid */}
      <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
        {landmarks.map((landmark) => (
          <button
            key={landmark.id}
            onClick={() => handleLandmarkClick(landmark)}
            className={`text-left p-2 rounded-lg transition-all ${
              selectedLandmark === landmark.id
                ? 'bg-brand-500 text-white'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-sm">{landmark.name}</span>
              {landmark.confidence && (
                <span className={`text-xs ${
                  selectedLandmark === landmark.id ? 'text-white/80' : 'text-slate-400'
                }`}>
                  {(landmark.confidence * 100).toFixed(0)}%
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
      
      {/* Note about AI detection */}
      <div className="mt-4 pt-3 border-t border-slate-700">
        <p className="text-xs text-slate-500">
          🔬 AI-detected landmarks with confidence scores. Click any landmark for detailed information.
        </p>
      </div>
    </div>
  );
}