'use client';

import Link from 'next/link';
import { ScanRecord } from '../lib/firebaseDb';

const statusConfig: Record<string, { color: string; bg: string }> = {
  Reviewed:   { color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
  Pending:    { color: 'text-amber-400',   bg: 'bg-amber-400/10 border-amber-400/20'   },
  'AI Ready': { color: 'text-brand-400',   bg: 'bg-brand-400/10 border-brand-400/20'   },
};

const sevDot: Record<string, string> = {
  normal: 'bg-emerald-400',
  low:    'bg-amber-400',
  medium: 'bg-orange-400',
  high:   'bg-rose-400',
};

interface ScanCardProps {
  scan:    ScanRecord;
  variant?: 'row' | 'card';
}

export function ScanCard({ scan, variant = 'row' }: ScanCardProps) {
  const sCfg    = statusConfig[scan.status] ?? statusConfig['AI Ready'];
  const topSev  = scan.findings[0]?.severity ?? 'normal';
  const topConf = scan.findings[0]?.confidence ?? 0;
  const dateStr = scan.createdAt
    ? new Date((scan.createdAt as unknown as { seconds: number }).seconds * 1000).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
      })
    : 'Demo';

  if (variant === 'card') {
    return (
      <div className="glass-card rounded-2xl p-5 flex flex-col gap-3 hover:border-brand-500/30 transition-all">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="h-5 w-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909" />
              </svg>
              <span className={`absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-slate-950 ${sevDot[topSev]}`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">{scan.type}</p>
              <p className="text-xs text-slate-500">{dateStr}</p>
            </div>
          </div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${sCfg.bg} ${sCfg.color}`}>
            {scan.status}
          </span>
        </div>

        {scan.summary && (
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{scan.summary}</p>
        )}

        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-600 mb-1">AI Confidence</div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-20 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-teal-400" style={{ width: `${topConf}%` }} />
              </div>
              <span className="text-xs font-bold text-slate-300">{topConf}%</span>
            </div>
          </div>
          {scan.id && (
            <Link href={`/reports/${scan.id}`} className="btn-outline text-xs py-1.5 px-3 rounded-lg">
              View Report →
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Row variant (used in dashboard table)
  return (
    <div className="grid md:grid-cols-[1fr_0.6fr_0.6fr_0.5fr_auto] gap-4 items-center px-6 py-4 hover:bg-slate-800/30 transition">
      {/* Scan info */}
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0 h-9 w-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
          <svg className="h-4 w-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909" />
          </svg>
          <span className={`absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full border-2 border-slate-950 ${sevDot[topSev]}`} />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-200">{scan.type}</p>
          <p className="text-xs text-slate-500">{dateStr}</p>
        </div>
      </div>

      {/* Status */}
      <div className="hidden md:block">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${sCfg.bg} ${sCfg.color}`}>
          {scan.status}
        </span>
      </div>

      {/* Findings count */}
      <div className="hidden md:block text-sm text-slate-300 font-medium">
        {scan.findings.length === 0
          ? <span className="text-emerald-400">None</span>
          : `${scan.findings.length} finding${scan.findings.length > 1 ? 's' : ''}`}
      </div>

      {/* AI score */}
      <div className="hidden md:block">
        <div className="text-sm font-semibold text-slate-200">{topConf}%</div>
        <div className="mt-1 h-1.5 w-16 rounded-full bg-slate-800 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-teal-400"
            style={{ width: `${topConf}%` }} />
        </div>
      </div>

      {/* Actions */}
      {scan.id && (
        <Link href={`/reports/${scan.id}`} className="text-xs btn-outline py-1.5 px-3 rounded-lg">
          Report
        </Link>
      )}
    </div>
  );
}
