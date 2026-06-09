'use client';

import { useState, useRef, useCallback, WheelEvent } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

interface ImageViewerProps {
  src: string;
  alt: string;
  onZoomChange?: (zoom: number) => void;
}

export function ImageViewer({ src, alt, onZoomChange }: ImageViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);

  const handleZoomChange = (ref: any) => {
    const newZoom = ref.state.scale;
    setZoom(newZoom);
    onZoomChange?.(newZoom);
  };

  return (
    <div className="relative w-full h-full bg-slate-900 rounded-lg overflow-hidden">
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={4}
        onZoom={(ref) => handleZoomChange(ref)}
        centerOnInit
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {/* Toolbar */}
            <div className="absolute top-4 right-4 z-10 flex gap-2 bg-black/50 rounded-lg p-2 backdrop-blur-sm">
              <button
                onClick={() => zoomIn()}
                className="p-2 bg-white/10 hover:bg-white/20 rounded text-white transition"
                title="Zoom In"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <button
                onClick={() => zoomOut()}
                className="p-2 bg-white/10 hover:bg-white/20 rounded text-white transition"
                title="Zoom Out"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <button
                onClick={() => resetTransform()}
                className="p-2 bg-white/10 hover:bg-white/20 rounded text-white transition"
                title="Reset"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>

            {/* Brightness/Contrast Controls */}
            <div className="absolute bottom-4 left-4 right-4 z-10 bg-black/50 rounded-lg p-3 backdrop-blur-sm">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs text-white block mb-1">Brightness</label>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-white block mb-1">Contrast</label>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <TransformComponent>
              <div className="w-full h-full flex items-center justify-center">
                <img
                  src={src}
                  alt={alt}
                  className="max-w-full max-h-full object-contain transition-all duration-200"
                  style={{
                    filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                  }}
                />
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}