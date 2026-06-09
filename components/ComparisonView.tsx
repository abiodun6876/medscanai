'use client';

import { useState } from 'react';
import { ImageViewer } from './ImageViewer';

interface ComparisonViewProps {
  currentImage: string;
  priorImage?: string;
  currentLabel?: string;
  priorLabel?: string;
}

export function ComparisonView({
  currentImage,
  priorImage,
  currentLabel = 'Current Study',
  priorLabel = 'Prior Study',
}: ComparisonViewProps) {
  const [view, setView] = useState<'side-by-side' | 'overlay' | 'linked'>('side-by-side');
  const [opacity, setOpacity] = useState(50);
  const [linkedZoom, setLinkedZoom] = useState(1);

  const handleZoomChange = (zoom: number) => {
    setLinkedZoom(zoom);
  };

  if (!priorImage) {
    return (
      <div className="bg-slate-800 rounded-lg p-8 text-center">
        <p className="text-slate-400">No prior study available for comparison</p>
        <p className="text-sm text-slate-500 mt-2">Upload a previous scan to enable comparison</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Comparison Mode Toggle */}
      <div className="flex gap-2 bg-slate-800 rounded-lg p-1">
        <button
          onClick={() => setView('side-by-side')}
          className={`flex-1 px-4 py-2 rounded-lg transition ${
            view === 'side-by-side'
              ? 'bg-brand-500 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Side by Side
        </button>
        <button
          onClick={() => setView('overlay')}
          className={`flex-1 px-4 py-2 rounded-lg transition ${
            view === 'overlay'
              ? 'bg-brand-500 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Overlay
        </button>
        <button
          onClick={() => setView('linked')}
          className={`flex-1 px-4 py-2 rounded-lg transition ${
            view === 'linked'
              ? 'bg-brand-500 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Linked Pan/Zoom
        </button>
      </div>

      {/* Side by Side View */}
      {view === 'side-by-side' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-300">{currentLabel}</div>
            <ImageViewer src={currentImage} alt="Current scan" />
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-300">{priorLabel}</div>
            <ImageViewer src={priorImage} alt="Prior scan" />
          </div>
        </div>
      )}

      {/* Overlay View */}
      {view === 'overlay' && (
        <div className="space-y-4">
          <div className="relative">
            <img src={currentImage} alt="Current" className="w-full rounded-lg" />
            <img
              src={priorImage}
              alt="Prior"
              className="absolute top-0 left-0 w-full rounded-lg"
              style={{ opacity: opacity / 100 }}
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">Prior Opacity</span>
            <input
              type="range"
              min="0"
              max="100"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm text-slate-400">{opacity}%</span>
          </div>
        </div>
      )}

      {/* Linked View */}
      {view === 'linked' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-300">{currentLabel}</div>
            <ImageViewer src={currentImage} alt="Current" onZoomChange={handleZoomChange} />
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-300">{priorLabel}</div>
            <div className="relative w-full h-full bg-slate-900 rounded-lg overflow-hidden">
              <div
                className="w-full h-full transition-transform duration-200"
                style={{ transform: `scale(${linkedZoom})` }}
              >
                <img src={priorImage} alt="Prior" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Difference Highlighting */}
      <div className="bg-slate-800 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-white mb-2">Change Detection</h4>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-slate-400">New finding</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-slate-400">Progressing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-slate-400">Resolved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-slate-400">Unchanged</span>
          </div>
        </div>
      </div>
    </div>
  );
}