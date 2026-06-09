'use client';

import { useState, useRef, useEffect } from 'react';

interface Point {
  x: number;
  y: number;
}

interface Measurement {
  id: string;
  type: 'distance' | 'angle' | 'area';
  points: Point[];
  value: string;
  unit: string;
}

interface MeasurementToolsProps {
  imageRef: React.RefObject<HTMLImageElement>;
  onMeasurementComplete?: (measurement: Measurement) => void;
}

export function MeasurementTools({ imageRef, onMeasurementComplete }: MeasurementToolsProps) {
  const [activeTool, setActiveTool] = useState<'distance' | 'angle' | 'area' | null>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Calculate distance between two points
  const calculateDistance = (p1: Point, p2: Point): number => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Calculate angle between three points
  const calculateAngle = (p1: Point, p2: Point, p3: Point): number => {
    const a = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    const b = Math.atan2(p3.y - p2.y, p3.x - p2.x);
    let angle = Math.abs((b - a) * 180 / Math.PI);
    if (angle > 180) angle = 360 - angle;
    return angle;
  };

  // Calculate area of polygon (Shoelace formula)
  const calculateArea = (points: Point[]): number => {
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i].x * points[j].y;
      area -= points[j].x * points[i].y;
    }
    area = Math.abs(area) / 2;
    return area;
  };

  // Get pixel coordinates from mouse event
  const getMouseCoordinates = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = e.currentTarget.width / rect.width;
    const scaleY = e.currentTarget.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  // Draw measurements on canvas
  const drawMeasurements = () => {
    if (!canvasRef) return;
    const ctx = canvasRef.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);
    ctx.strokeStyle = '#00ff00';
    ctx.fillStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.font = 'bold 14px Arial';

    measurements.forEach((measurement) => {
      ctx.beginPath();
      if (measurement.type === 'distance' && measurement.points.length === 2) {
        const [p1, p2] = measurement.points;
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        
        // Draw circles at points
        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p2.x, p2.y, 4, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw measurement text
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        ctx.fillStyle = '#00ff00';
        ctx.fillText(`${measurement.value} ${measurement.unit}`, midX, midY - 5);
      }
      
      else if (measurement.type === 'angle' && measurement.points.length === 3) {
        const [p1, p2, p3] = measurement.points;
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.stroke();
        
        // Draw circles
        [p1, p2, p3].forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
          ctx.fill();
        });
        
        ctx.fillStyle = '#00ff00';
        ctx.fillText(`${measurement.value}°`, p2.x, p2.y - 10);
      }
      
      else if (measurement.type === 'area' && measurement.points.length >= 3) {
        ctx.beginPath();
        ctx.moveTo(measurement.points[0].x, measurement.points[0].y);
        for (let i = 1; i < measurement.points.length; i++) {
          ctx.lineTo(measurement.points[i].x, measurement.points[i].y);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
        ctx.fill();
        
        // Draw circles at points
        measurement.points.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
          ctx.fill();
        });
        
        // Calculate centroid for text
        const centroid = measurement.points.reduce(
          (acc, p) => ({ x: acc.x + p.x / measurement.points.length, y: acc.y + p.y / measurement.points.length }),
          { x: 0, y: 0 }
        );
        ctx.fillStyle = '#00ff00';
        ctx.fillText(`${measurement.value} ${measurement.unit}²`, centroid.x, centroid.y);
      }
    });
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!activeTool) return;
    
    const newPoint = getMouseCoordinates(e);
    const newPoints = [...points, newPoint];
    setPoints(newPoints);
    
    let measurement: Measurement | null = null;
    
    if (activeTool === 'distance' && newPoints.length === 2) {
      const distance = calculateDistance(newPoints[0], newPoints[1]);
      const pixelToCm = 0.026; // Approximate, should be calibrated
      measurement = {
        id: Date.now().toString(),
        type: 'distance',
        points: newPoints,
        value: (distance * pixelToCm).toFixed(2),
        unit: 'cm',
      };
      setPoints([]);
    }
    
    else if (activeTool === 'angle' && newPoints.length === 3) {
      const angle = calculateAngle(newPoints[0], newPoints[1], newPoints[2]);
      measurement = {
        id: Date.now().toString(),
        type: 'angle',
        points: newPoints,
        value: angle.toFixed(1),
        unit: '°',
      };
      setPoints([]);
    }
    
    else if (activeTool === 'area' && newPoints.length >= 3 && e.shiftKey) {
      const area = calculateArea(newPoints);
      const pixelToCm = 0.026;
      measurement = {
        id: Date.now().toString(),
        type: 'area',
        points: newPoints,
        value: (area * pixelToCm * pixelToCm).toFixed(2),
        unit: 'cm',
      };
      setPoints([]);
    }
    
    if (measurement) {
      setMeasurements([...measurements, measurement]);
      onMeasurementComplete?.(measurement);
    }
  };

  // Set up canvas overlay
  useEffect(() => {
    if (!canvasContainerRef.current || !imageRef.current) return;
    
    const container = canvasContainerRef.current;
    const img = imageRef.current;
    
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'auto';
    
    const updateCanvasSize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      drawMeasurements();
    };
    
    container.appendChild(canvas);
    setCanvasRef(canvas);
    
    const resizeObserver = new ResizeObserver(updateCanvasSize);
    resizeObserver.observe(container);
    
    canvas.addEventListener('click', handleCanvasClick as any);
    
    return () => {
      resizeObserver.disconnect();
      canvas.remove();
    };
  }, [measurements, activeTool, points]);

  const clearMeasurements = () => {
    setMeasurements([]);
    setPoints([]);
  };

  const tools = [
    { id: 'distance', name: '📏 Distance', icon: '📏', description: 'Click two points' },
    { id: 'angle', name: '📐 Angle', icon: '📐', description: 'Click three points' },
    { id: 'area', name: '🔲 Area', icon: '🔲', description: 'Click points + Shift to finish' },
  ];

  return (
    <div className="bg-slate-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Measurement Tools</h3>
        <button
          onClick={clearMeasurements}
          className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition"
        >
          Clear All
        </button>
      </div>
      
      <div className="flex gap-3 flex-wrap">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(activeTool === tool.id ? null : tool.id as any)}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTool === tool.id
                ? 'bg-brand-500 text-white shadow-lg scale-105'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <span className="mr-2">{tool.icon}</span>
            {tool.name}
          </button>
        ))}
      </div>
      
      {activeTool && (
        <div className="mt-3 text-xs text-brand-400">
          📐 {tools.find(t => t.id === activeTool)?.description}
        </div>
      )}
      
      {/* Measurements List */}
      {measurements.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <h4 className="text-xs text-slate-400 mb-2">Recent Measurements</h4>
          <div className="space-y-1">
            {measurements.slice(-5).reverse().map((m) => (
              <div key={m.id} className="flex justify-between text-sm text-slate-300">
                <span>
                  {m.type === 'distance' && '📏 Distance'}
                  {m.type === 'angle' && '📐 Angle'}
                  {m.type === 'area' && '🔲 Area'}
                </span>
                <span className="font-mono">{m.value} {m.unit}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div ref={canvasContainerRef} className="relative" />
    </div>
  );
}