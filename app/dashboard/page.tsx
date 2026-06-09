'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { subscribeToUserScans, ScanRecord } from '../../lib/firebaseDb';
import { subscribeToAuth } from '../../lib/firebaseAuth';
import { ScanCard } from '../../components/ScanCard';
import { User } from 'firebase/auth';

const DEMO_SCANS: ScanRecord[] = [
  {
    id: 'd1', uid: '', type: 'Chest X-Ray (PA)',  imageURL: '', status: 'Reviewed',
    findings: [{ label: 'Mild consolidation', confidence: 96, severity: 'medium', notes: 'Right lower lobe opacification consistent with pneumonia.', region: 'Right lower lobe' }],
    summary: 'Mild right lower lobe consolidation identified. No pneumothorax.', createdAt: null, updatedAt: null,
  },
  {
    id: 'd2', uid: '', type: 'Right Knee MRI',    imageURL: '', status: 'Pending',
    findings: [{ label: 'Meniscal tear', confidence: 88, severity: 'medium', notes: 'Posterior horn medial meniscus tear.', region: 'Medial meniscus' }],
    summary: 'Medial meniscal tear noted with mild joint effusion.', createdAt: null, updatedAt: null,
  },
  {
    id: 'd3', uid: '', type: 'Abdominal CT',      imageURL: '', status: 'Reviewed',
    findings: [],
    summary: 'No acute abdominal pathology identified. Normal study.', createdAt: null, updatedAt: null,
  },
  {
    id: 'd4', uid: '', type: 'Shoulder X-Ray',    imageURL: '', status: 'AI Ready',
    findings: [{ label: 'Acromioclavicular separation', confidence: 91, severity: 'low', notes: 'Grade I AC joint separation.', region: 'AC joint' }],
    summary: 'Grade I AC joint separation with mild soft tissue swelling.', createdAt: null, updatedAt: null,
  },
];

type Filter = 'all' | 'AI Ready' | 'Pending' | 'Reviewed';

export default function DashboardPage() {
  const [user,    setUser]    = useState<User | null>(null);
  const [scans,   setScans]   = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState<Filter>('all');

  const loadScans = useCallback((u: User | null) => {
    if (!u) {
      setScans(DEMO_SCANS);
      setLoading(false);
      return () => {};
    }
    // Real-time Firestore listener
    const unsub = subscribeToUserScans((data) => {
      setScans(data.length ? data : DEMO_SCANS);
      setLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    let unsubScans = () => {};
    const unsubAuth = subscribeToAuth((u) => {
      setUser(u);
      setLoading(true);
      unsubScans();
      unsubScans = loadScans(u);
    });
    return () => { unsubAuth(); unsubScans(); };
  }, [loadScans]);

  const reviewed  = scans.filter((s) => s.status === 'Reviewed').length;
  const pending   = scans.filter((s) => s.status === 'Pending').length;
  const aiReady   = scans.filter((s) => s.status === 'AI Ready').length;
  const avgConf   = scans.length
    ? Math.round(scans.reduce((acc, s) => acc + (s.findings[0]?.confidence ?? 90), 0) / scans.length)
    : 0;

  const filtered = filter === 'all' ? scans : scans.filter((s) => s.status === filter);

  const summaryCards = [
    { label: 'Total Scans',    value: String(scans.length), sub: 'All time',        icon: '🔬', color: 'text-brand-400',   bg: 'bg-brand-400/10 border-brand-400/20'   },
    { label: 'Reviewed',       value: String(reviewed),     sub: 'Doctor validated', icon: '✓',  color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
    { label: 'Pending Review', value: String(pending),      sub: 'Awaiting doctors', icon: '⏳', color: 'text-amber-400',   bg: 'bg-amber-400/10 border-amber-400/20'   },
    { label: 'Avg Confidence', value: scans.length ? `${avgConf}%` : '—', sub: 'AI accuracy', icon: '🎯', color: 'text-teal-400', bg: 'bg-teal-400/10 border-teal-400/20' },
  ];

  const filters: { id: Filter; label: string; count: number }[] = [
    { id: 'all',      label: 'All',      count: scans.length },
    { id: 'AI Ready', label: 'AI Ready', count: aiReady },
    { id: 'Pending',  label: 'Pending',  count: pending },
    { id: 'Reviewed', label: 'Reviewed', count: reviewed },
  ];

  return (
    <main className="min-h-screen px-6 py-12 text-slate-100">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">Dashboard</h1>
            <p className="mt-1 text-slate-400 text-sm">
              {user
                ? `Welcome back, ${user.displayName ?? user.email} · ${scans.length} scan${scans.length !== 1 ? 's' : ''} on record`
                : 'Sign in to see your personal scan history'}
            </p>
          </div>
          <div className="flex gap-3">
            {!user && <Link href="/auth" className="btn-outline text-sm">Sign In</Link>}
            <Link href="/upload" className="btn-primary text-sm self-start sm:self-auto">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Scan
            </Link>
          </div>
        </div>

        {/* Guest notice */}
        {!user && !loading && (
          <div className="mb-6 rounded-2xl bg-brand-500/8 border border-brand-500/20 px-6 py-4 text-sm text-brand-300 flex items-center gap-3">
            <span className="text-xl">👋</span>
            Showing demo data.{' '}
            <Link href="/auth" className="underline hover:text-white">Sign in</Link>{' '}
            to see your real scan history.
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
          {summaryCards.map((c) => (
            <div key={c.label} className={`glass-card rounded-2xl p-5 border ${c.bg}`}>
              <div className="text-2xl mb-3">{c.icon}</div>
              <div className={`font-display text-2xl font-bold ${c.color}`}>{c.value}</div>
              <div className="mt-0.5 text-sm font-medium text-slate-300">{c.label}</div>
              <div className="mt-1 text-xs text-slate-600">{c.sub}</div>
            </div>
          ))}
        </div>

        {/* Scans Table */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-display font-semibold text-white">
                Scan History
                {loading && <span className="ml-2 text-xs text-slate-500 font-normal">Loading…</span>}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {user ? 'Your personal medical imaging records' : 'Demo records'}
              </p>
            </div>
            {/* Filters */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {filters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                    filter === f.id
                      ? 'border-brand-500/50 bg-brand-500/15 text-brand-300'
                      : 'border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-300'
                  }`}
                >
                  {f.label}
                  <span className="ml-1.5 opacity-60">{f.count}</span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-16 flex items-center justify-center">
              <div className="h-8 w-8 rounded-full border-2 border-slate-700 border-t-brand-400 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-slate-500 text-sm">No scans match this filter.</p>
            </div>
          ) : (
            <>
              {/* Column headers */}
              <div className="hidden md:grid grid-cols-[1fr_0.6fr_0.6fr_0.5fr_auto] gap-4 px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-800/40">
                <span>Scan</span>
                <span>Status</span>
                <span>Findings</span>
                <span>AI Score</span>
                <span>Actions</span>
              </div>

              <div className="divide-y divide-slate-800/40">
                {filtered.map((scan) => (
                  <ScanCard key={scan.id} scan={scan} variant="row" />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
