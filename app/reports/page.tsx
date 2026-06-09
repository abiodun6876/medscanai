'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getUserScans, ScanRecord } from '../../lib/firebaseDb';
import { subscribeToAuth } from '../../lib/firebaseAuth';
import { ScanCard } from '../../components/ScanCard';
import { User } from 'firebase/auth';

const DEMO_SCANS: ScanRecord[] = [
  {
    id: 'd1', uid: '', type: 'Chest X-Ray (PA)', imageURL: '', status: 'Reviewed',
    findings: [
      { label: 'Pulmonary consolidation', confidence: 96, severity: 'medium', notes: 'Right lower lobe opacification consistent with lobar pneumonia.', region: 'Right lower lobe' },
      { label: 'No pneumothorax', confidence: 98, severity: 'normal', notes: 'Lung fields clear bilaterally.', region: 'Bilateral lung fields' },
    ],
    summary: 'Right lower lobe consolidation consistent with lobar pneumonia. No pleural effusion or pneumothorax.',
    recommendation: 'Antibiotic therapy. Follow-up CXR in 4–6 weeks.',
    validated: true, doctorNote: 'Patient started on amoxicillin.',
    createdAt: null, updatedAt: null,
  },
  {
    id: 'd2', uid: '', type: 'Right Knee MRI (Sagittal T2)', imageURL: '', status: 'Pending',
    findings: [
      { label: 'Medial meniscal tear', confidence: 88, severity: 'medium', notes: 'Posterior horn tear, Grade 3 signal intensity.', region: 'Medial meniscus' },
      { label: 'Joint effusion', confidence: 82, severity: 'low', notes: 'Moderate suprapatellar effusion.', region: 'Suprapatellar bursa' },
    ],
    summary: 'Medial meniscal tear with moderate joint effusion. ACL and PCL intact.',
    recommendation: 'Orthopaedic referral. Consider arthroscopy.',
    createdAt: null, updatedAt: null,
  },
  {
    id: 'd3', uid: '', type: 'Abdominal CT (Axial)', imageURL: '', status: 'Reviewed',
    findings: [{ label: 'Normal study', confidence: 95, severity: 'normal', notes: 'No acute abdominal pathology identified.', region: 'Abdomen' }],
    summary: 'No acute abdominal pathology. Normal-appearing liver, spleen, pancreas, kidneys, and bowel.',
    recommendation: 'No further imaging required at this time.',
    createdAt: null, updatedAt: null,
  },
  {
    id: 'd4', uid: '', type: 'Left Shoulder X-Ray (AP)', imageURL: '', status: 'AI Ready',
    findings: [
      { label: 'AC joint separation', confidence: 91, severity: 'low', notes: 'Grade I acromioclavicular separation with mild soft tissue swelling.', region: 'AC joint' },
    ],
    summary: 'Grade I AC joint separation identified. No fracture or dislocation.',
    recommendation: 'Conservative management with sling and analgesia. Follow-up in 6 weeks.',
    createdAt: null, updatedAt: null,
  },
];

type SortOption = 'newest' | 'oldest' | 'confidence';

export default function ReportsPage() {
  const [user,    setUser]    = useState<User | null>(null);
  const [scans,   setScans]   = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [sort,    setSort]    = useState<SortOption>('newest');

  useEffect(() => {
    const unsub = subscribeToAuth(async (u) => {
      setUser(u);
      if (u) {
        try {
          const data = await getUserScans();
          setScans(data.length ? data : DEMO_SCANS);
        } catch {
          setScans(DEMO_SCANS);
        }
      } else {
        setScans(DEMO_SCANS);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Filter by search
  const filtered = scans
    .filter((s) =>
      search === '' ||
      s.type.toLowerCase().includes(search.toLowerCase()) ||
      s.status.toLowerCase().includes(search.toLowerCase()) ||
      s.summary?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === 'confidence') {
        const ca = a.findings[0]?.confidence ?? 0;
        const cb = b.findings[0]?.confidence ?? 0;
        return cb - ca;
      }
      const ta = a.createdAt ? (a.createdAt as unknown as { seconds: number }).seconds : 0;
      const tb = b.createdAt ? (b.createdAt as unknown as { seconds: number }).seconds : 0;
      return sort === 'newest' ? tb - ta : ta - tb;
    });

  const totalReviewed = scans.filter((s) => s.status === 'Reviewed').length;
  const totalPending  = scans.filter((s) => s.status !== 'Reviewed').length;

  return (
    <main className="min-h-screen px-6 py-12 text-slate-100">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">Reports</h1>
            <p className="mt-1 text-slate-400 text-sm">
              {user
                ? `${scans.length} clinical report${scans.length !== 1 ? 's' : ''} · ${totalReviewed} reviewed · ${totalPending} pending`
                : 'Sign in to see your real reports'}
            </p>
          </div>
          <Link href="/upload" className="btn-primary text-sm self-start sm:self-auto">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Scan
          </Link>
        </div>

        {/* Guest notice */}
        {!user && !loading && (
          <div className="mb-6 rounded-2xl bg-brand-500/8 border border-brand-500/20 px-6 py-4 text-sm text-brand-300 flex items-center gap-3">
            <span className="text-xl">👋</span>
            Viewing demo reports.{' '}
            <Link href="/auth" className="underline hover:text-white">Sign in</Link>{' '}
            to access your real scan history.
          </div>
        )}

        {/* Search + Sort bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              id="reports-search"
              type="text"
              placeholder="Search by type, status, or summary…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input pl-10 text-sm"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="form-input text-sm w-auto min-w-[160px] cursor-pointer"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="confidence">Highest confidence</option>
          </select>
        </div>

        {/* Summary ribbon */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Reports',  value: scans.length,    color: 'text-brand-400',   icon: '📋' },
            { label: 'Reviewed',       value: totalReviewed,   color: 'text-emerald-400', icon: '✓' },
            { label: 'Awaiting Review',value: totalPending,    color: 'text-amber-400',   icon: '⏳' },
          ].map((s) => (
            <div key={s.label} className="glass-card rounded-2xl p-4 text-center">
              <div className="text-lg mb-1">{s.icon}</div>
              <div className={`font-display text-xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Reports Grid */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-40 rounded-2xl shimmer" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">{search ? '🔍' : '📂'}</div>
            <h3 className="font-display text-xl font-semibold text-white mb-2">
              {search ? 'No reports match your search' : 'No reports yet'}
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              {search ? 'Try a different keyword.' : 'Upload your first scan to generate an AI report.'}
            </p>
            {!search && (
              <Link href="/upload" className="btn-primary">Upload Your First Scan</Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((scan) => (
              <ScanCard key={scan.id} scan={scan} variant="card" />
            ))}
          </div>
        )}

        {/* Info footer */}
        <div className="mt-10 text-center">
          <p className="text-xs text-slate-600">
            ⚠ All reports are AI pre-screening only — not a substitute for clinical diagnosis.
          </p>
        </div>
      </div>
    </main>
  );
}
