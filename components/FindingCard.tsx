'use client';

import { useEffect, useState } from 'react';
import { ScanFinding } from '../lib/firebaseDb';

const sevConfig: Record<string, { label: string; color: string; bg: string; bar: string }> = {
  normal: { label: 'Normal', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', bar: '#34d399' },
  low:    { label: 'Low',    color: 'text-amber-400',   bg: 'bg-amber-400/10 border-amber-400/20',     bar: '#fbbf24' },
  medium: { label: 'Medium', color: 'text-orange-400',  bg: 'bg-orange-400/10 border-orange-400/20',   bar: '#fb923c' },
  high:   { label: 'High',   color: 'text-rose-400',    bg: 'bg-rose-400/10 border-rose-400/20',       bar: '#fb7185' },
};

function ConfidenceBar({ value, color }: { value: number; color: string }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(value), 400);
    return () => clearTimeout(t);
  }, [value]);
  return (
    <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-1000"
        style={{ width: `${w}%`, background: `linear-gradient(90deg,${color}66,${color})` }}
      />
    </div>
  );
}

interface FindingCardProps {
  finding: ScanFinding;
  index:   number;
  compact?: boolean;
}

export function FindingCard({ finding, index, compact = false }: FindingCardProps) {
  const cfg = sevConfig[finding.severity] ?? sevConfig.normal;

  return (
    <div
      className="rounded-xl bg-slate-900/70 border border-slate-800/60 p-4 animate-fade-in-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <span className="text-sm font-semibold text-slate-200">{finding.label}</span>
          {finding.region && (
            <span className="ml-2 text-xs text-slate-500">· {finding.region}</span>
          )}
        </div>
        <span className={`flex-shrink-0 text-xs font-medium px-2.5 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
          {cfg.label}
        </span>
      </div>

      <ConfidenceBar value={finding.confidence} color={cfg.bar} />

      <div className="flex items-center justify-between mt-1.5 gap-3">
        {!compact && (
          <p className="text-xs text-slate-500 leading-relaxed flex-1">{finding.notes}</p>
        )}
        <span className={`text-xs font-bold flex-shrink-0 ${cfg.color}`}>
          {finding.confidence}%
        </span>
      </div>

      {compact && finding.notes && (
        <p className="text-xs text-slate-500 leading-relaxed mt-1">{finding.notes}</p>
      )}
    </div>
  );
}
