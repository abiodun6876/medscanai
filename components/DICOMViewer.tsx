'use client';

import { useState, useEffect } from 'react';

interface DICOMTags {
  PatientName?: string;
  PatientID?: string;
  StudyDate?: string;
  Modality?: string;
  SeriesDescription?: string;
  SliceThickness?: string;
  PixelSpacing?: string;
  WindowCenter?: string;
  WindowWidth?: string;
}

interface DICOMViewerProps {
  file: File;
  onLoad?: (tags: DICOMTags) => void;
}

export function DICOMViewer({ file, onLoad }: DICOMViewerProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [tags, setTags] = useState<DICOMTags>({});
  const [windowLevel, setWindowLevel] = useState({ center: 40, width: 400 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const parseDICOM = async () => {
      setIsLoading(true);
      
      // For now, we'll simulate DICOM parsing
      // In production, use a proper DICOM library like cornerstone
      
      // Simulate DICOM metadata extraction
      const mockTags: DICOMTags = {
        PatientName: "Anonymous",
        PatientID: "ANON-001",
        StudyDate: new Date().toLocaleDateString(),
        Modality: file.name.toLowerCase().includes('ct') ? 'CT' : 
                  file.name.toLowerCase().includes('mr') ? 'MR' : 'DX',
        SeriesDescription: "Clinical Series",
        SliceThickness: "1.25 mm",
        PixelSpacing: "0.5 x 0.5 mm",
        WindowCenter: "40",
        WindowWidth: "400",
      };
      
      setTags(mockTags);
      
      // Create image URL (in production, render DICOM pixel data)
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      
      onLoad?.(mockTags);
      setIsLoading(false);
    };
    
    parseDICOM();
    
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [file]);

  const applyWindowLevel = () => {
    // In production, this would adjust the DICOM image rendering
    console.log(`Applying window: center=${windowLevel.center}, width=${windowLevel.width}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-800 rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        <span className="ml-3 text-slate-400">Loading DICOM...</span>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden">
      {/* DICOM Header */}
      <div className="bg-slate-900 p-4 border-b border-slate-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-slate-400 block text-xs">Modality</span>
            <span className="text-white font-medium">{tags.Modality || 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-xs">Study Date</span>
            <span className="text-white font-medium">{tags.StudyDate || 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-xs">Patient ID</span>
            <span className="text-white font-medium">{tags.PatientID || 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-xs">Slice Thickness</span>
            <span className="text-white font-medium">{tags.SliceThickness || 'N/A'}</span>
          </div>
        </div>
      </div>
      
      {/* DICOM Image */}
      {imageUrl && (
        <div className="relative">
          <img src={imageUrl} alt="DICOM" className="w-full rounded-lg" />
          
          {/* Window Level Controls (for CT/MR) */}
          {(tags.Modality === 'CT' || tags.Modality === 'MR') && (
            <div className="absolute bottom-4 left-4 right-4 bg-black/70 rounded-lg p-3 backdrop-blur-sm">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs text-white block mb-1">Window Center</label>
                  <input
                    type="range"
                    min="-1000"
                    max="2000"
                    value={windowLevel.center}
                    onChange={(e) => {
                      setWindowLevel({ ...windowLevel, center: Number(e.target.value) });
                      applyWindowLevel();
                    }}
                    className="w-full"
                  />
                  <span className="text-xs text-slate-400">{windowLevel.center}</span>
                </div>
                <div className="flex-1">
                  <label className="text-xs text-white block mb-1">Window Width</label>
                  <input
                    type="range"
                    min="1"
                    max="4000"
                    value={windowLevel.width}
                    onChange={(e) => {
                      setWindowLevel({ ...windowLevel, width: Number(e.target.value) });
                      applyWindowLevel();
                    }}
                    className="w-full"
                  />
                  <span className="text-xs text-slate-400">{windowLevel.width}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Preset Window Levels */}
      {(tags.Modality === 'CT' || tags.Modality === 'MR') && (
        <div className="p-4 border-t border-slate-700">
          <h4 className="text-xs text-slate-400 mb-2">Quick Presets</h4>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setWindowLevel({ center: 40, width: 400 })}
              className="px-3 py-1 bg-slate-700 rounded text-xs text-slate-300 hover:bg-slate-600 transition"
            >
              Soft Tissue
            </button>
            <button
              onClick={() => setWindowLevel({ center: 600, width: 2000 })}
              className="px-3 py-1 bg-slate-700 rounded text-xs text-slate-300 hover:bg-slate-600 transition"
            >
              Bone
            </button>
            <button
              onClick={() => setWindowLevel({ center: -500, width: 1500 })}
              className="px-3 py-1 bg-slate-700 rounded text-xs text-slate-300 hover:bg-slate-600 transition"
            >
              Lung
            </button>
            <button
              onClick={() => setWindowLevel({ center: 100, width: 150 })}
              className="px-3 py-1 bg-slate-700 rounded text-xs text-slate-300 hover:bg-slate-600 transition"
            >
              Brain
            </button>
          </div>
        </div>
      )}
    </div>
  );
}