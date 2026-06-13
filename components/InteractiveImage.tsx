'use client';

import React, { useState, useRef, MouseEvent } from 'react';

interface Point {
  x: number;
  y: number;
}

interface InteractiveImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function InteractiveImage({ src, alt, className = '' }: InteractiveImageProps) {
  const [points, setPoints] = useState<Point[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  const handleImageClick = (e: MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    
    // If we already have 2 points, reset on next click
    if (points.length >= 2) {
      setPoints([]);
      return;
    }

    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setPoints(prev => [...prev, { x, y }]);
  };

  const handleReset = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setPoints([]);
  };

  let distanceText = '';
  if (points.length === 2) {
    const dx = points[1].x - points[0].x;
    const dy = points[1].y - points[0].y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    // arbitrary scaling factor for demo (e.g. 1px = 0.26mm approximately for typical screens)
    distanceText = `${(dist * 0.26).toFixed(1)} mm`;
  }

  return (
    <div className={`relative group ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="w-full object-contain block select-none pointer-events-none"
      />
      
      {/* SVG Overlay for drawing and interaction */}
      <svg
        ref={svgRef}
        onClick={handleImageClick}
        className="absolute inset-0 w-full h-full cursor-crosshair"
      >
        {/* Draw Line */}
        {points.length === 2 && (
          <line
            x1={points[0].x}
            y1={points[0].y}
            x2={points[1].x}
            y2={points[1].y}
            stroke="#fb923c"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
        )}
        
        {/* Draw Points */}
        {points.map((pt, i) => (
          <circle
            key={i}
            cx={pt.x}
            cy={pt.y}
            r="4"
            fill="#fb923c"
            className="animate-pulse"
          />
        ))}

        {/* Distance Badge */}
        {points.length === 2 && (
          <foreignObject
            x={(points[0].x + points[1].x) / 2 - 40}
            y={(points[0].y + points[1].y) / 2 - 30}
            width="80"
            height="30"
            className="overflow-visible"
          >
            <div className="bg-slate-900/90 border border-orange-400/50 text-orange-400 text-xs font-bold px-2 py-1 rounded shadow-lg flex items-center justify-center whitespace-nowrap">
              {distanceText}
            </div>
          </foreignObject>
        )}
      </svg>

      {/* Toolbar overlay */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleReset}
          className="bg-slate-900/80 hover:bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700/50 shadow flex items-center gap-1 backdrop-blur"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reset Tool
        </button>
      </div>

      {points.length === 0 && (
        <div className="absolute bottom-2 left-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-slate-900/80 text-slate-300 text-[10px] px-2 py-1 rounded border border-slate-700/50 backdrop-blur">
            Click two points to measure distance
          </div>
        </div>
      )}
    </div>
  );
}
