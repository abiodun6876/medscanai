'use client';

import { useState, useRef, useEffect } from 'react';

interface ROI {
  id: string;
  type: 'rectangle' | 'circle' | 'freehand';
  points: { x: number; y: number }[];
  measurements: {
    area?: number;
    mean?: number;
    min?: number;
    max?: number;
    std?: number;
  };
}

interface ROISelectorProps {
  imageElement: HTMLImageElement | null;
  onROIComplete?: (roi: ROI) => void;
}

export function ROISelector({ imageElement, onROIComplete }: ROISelectorProps) {
  const [rois, setRois] = useState<ROI[]>([]);
  const [activeTool, setActiveTool] = useState<'rectangle' | 'circle' | 'freehand' | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Calculate density/HU measurements from pixel values
  const calculateDensityMeasurements = (imageData: ImageData, roi: ROI): ROI['measurements'] => {
    const values: number[] = [];
    
    // For rectangle ROI
    if (roi.type === 'rectangle' && roi.points.length >= 2) {
      const [p1, p2] = roi.points;
      const minX = Math.min(p1.x, p2.x);
      const maxX = Math.max(p1.x, p2.x);
      const minY = Math.min(p1.y, p2.y);
      const maxY = Math.max(p1.y, p2.y);
      
      for (let y = minY; y < maxY; y++) {
        for (let x = minX; x < maxX; x++) {
          const idx = (y * imageData.width + x) * 4;
          const gray = (imageData.data[idx] + imageData.data[idx + 1] + imageData.data[idx + 2]) / 3;
          values.push(gray);
        }
      }
    }
    
    if (values.length === 0) return {};
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const std = Math.sqrt(variance);
    
    return { area: values.length, mean, min, max, std };
  };

  const getMouseCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = canvasRef.current!.width / rect.width;
    const scaleY = canvasRef.current!.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!activeTool) return;
    setIsDrawing(true);
    const point = getMouseCoordinates(e);
    setCurrentPoints([point]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !activeTool) return;
    const point = getMouseCoordinates(e);
    
    if (activeTool === 'freehand') {
      setCurrentPoints([...currentPoints, point]);
      draw();
    } else if ((activeTool === 'rectangle' || activeTool === 'circle') && currentPoints.length === 1) {
      drawPreview(point);
    }
  };

  const handleMouseUp = async (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !activeTool) return;
    setIsDrawing(false);
    
    const endPoint = getMouseCoordinates(e);
    let finalPoints = [...currentPoints];
    
    if (activeTool === 'rectangle' && currentPoints.length === 1) {
      finalPoints = [currentPoints[0], endPoint];
    } else if (activeTool === 'circle' && currentPoints.length === 1) {
      finalPoints = [currentPoints[0], endPoint];
    }
    
    if (finalPoints.length >= 2) {
      const roi: ROI = {
        id: Date.now().toString(),
        type: activeTool,
        points: finalPoints,
        measurements: {},
      };
      
      // Calculate density measurements if we have image data
      if (imageElement) {
        const tempCanvas = document.createElement('canvas');
        const ctx = tempCanvas.getContext('2d');
        if (ctx && canvasRef.current) {
          tempCanvas.width = canvasRef.current.width;
          tempCanvas.height = canvasRef.current.height;
          ctx.drawImage(imageElement, 0, 0);
          const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
          roi.measurements = calculateDensityMeasurements(imageData, roi);
        }
      }
      
      setRois([...rois, roi]);
      onROIComplete?.(roi);
    }
    
    setCurrentPoints([]);
    draw();
  };

  const draw = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Draw all ROIs
    rois.forEach((roi) => {
      ctx.strokeStyle = '#00ff00';
      ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
      ctx.lineWidth = 2;
      
      if (roi.type === 'rectangle' && roi.points.length >= 2) {
        const [p1, p2] = roi.points;
        const width = p2.x - p1.x;
        const height = p2.y - p1.y;
        ctx.strokeRect(p1.x, p1.y, width, height);
        ctx.fillRect(p1.x, p1.y, width, height);
        
        // Display measurements
        if (roi.measurements.mean) {
          ctx.fillStyle = '#00ff00';
          ctx.font = '12px Arial';
          ctx.fillText(`Mean: ${roi.measurements.mean.toFixed(1)}`, p1.x, p1.y - 5);
          ctx.fillText(`Area: ${roi.measurements.area}px²`, p1.x, p1.y - 20);
        }
      }
      
      else if (roi.type === 'circle' && roi.points.length >= 2) {
        const [center, edge] = roi.points;
        const radius = Math.sqrt(Math.pow(edge.x - center.x, 2) + Math.pow(edge.y - center.y, 2));
        ctx.beginPath();
        ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();
      }
      
      else if (roi.type === 'freehand' && roi.points.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(roi.points[0].x, roi.points[0].y);
        for (let i = 1; i < roi.points.length; i++) {
          ctx.lineTo(roi.points[i].x, roi.points[i].y);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
      }
    });
  };

  const drawPreview = (currentPoint: { x: number; y: number }) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    draw();
    ctx.strokeStyle = '#ffff00';
    ctx.setLineDash([5, 5]);
    
    if (activeTool === 'rectangle' && currentPoints.length === 1) {
      const [start] = currentPoints;
      const width = currentPoint.x - start.x;
      const height = currentPoint.y - start.y;
      ctx.strokeRect(start.x, start.y, width, height);
    }
    
    ctx.setLineDash([]);
  };

  const clearRois = () => {
    setRois([]);
    draw();
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Region of Interest (ROI)</h3>
        <button
          onClick={clearRois}
          className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition"
        >
          Clear All
        </button>
      </div>
      
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => setActiveTool(activeTool === 'rectangle' ? null : 'rectangle')}
          className={`px-4 py-2 rounded-lg transition ${
            activeTool === 'rectangle'
              ? 'bg-brand-500 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          🔲 Rectangle
        </button>
        <button
          onClick={() => setActiveTool(activeTool === 'circle' ? null : 'circle')}
          className={`px-4 py-2 rounded-lg transition ${
            activeTool === 'circle'
              ? 'bg-brand-500 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          ⚪ Circle
        </button>
        <button
          onClick={() => setActiveTool(activeTool === 'freehand' ? null : 'freehand')}
          className={`px-4 py-2 rounded-lg transition ${
            activeTool === 'freehand'
              ? 'bg-brand-500 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          ✏️ Freehand
        </button>
      </div>
      
      <div className="relative">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="absolute top-0 left-0 w-full h-full cursor-crosshair"
        />
      </div>
      
      {/* ROI Statistics */}
      {rois.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <h4 className="text-sm font-semibold text-white mb-2">ROI Statistics</h4>
          <div className="space-y-2">
            {rois.map((roi, idx) => (
              <div key={roi.id} className="bg-slate-700/50 rounded p-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">ROI #{idx + 1} ({roi.type})</span>
                  {roi.measurements.mean && (
                    <span className="text-brand-400">Mean: {roi.measurements.mean.toFixed(1)} HU</span>
                  )}
                </div>
                {roi.measurements.min !== undefined && (
                  <div className="text-xs text-slate-400 mt-1">
                    Min: {roi.measurements.min.toFixed(1)} | Max: {roi.measurements.max?.toFixed(1)} | SD: {roi.measurements.std?.toFixed(1)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}