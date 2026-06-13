'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getScan, validateScan, ScanRecord } from '../../../lib/firebaseDb';
import { subscribeToAuth, getUserProfile } from '../../../lib/firebaseAuth';
import { FindingCard } from '../../../components/FindingCard';
import { AiChatPanel } from '../../../components/AiChatPanel';
import { MedicationCard } from '../../../components/MedicationCard';
import { InteractiveImage } from '../../../components/InteractiveImage';
import { User } from 'firebase/auth';

const sevOrder: Record<string, number> = { high: 0, medium: 1, low: 2, normal: 3 };

function sortedFindings(scan: ScanRecord) {
  return [...scan.findings].sort((a, b) => (sevOrder[a.severity] ?? 4) - (sevOrder[b.severity] ?? 4));
}

export default function ReportPage() {
  const params  = useParams();
  const router  = useRouter();
  const id      = params.id as string;

  const [scan,        setScan]        = useState<ScanRecord | null>(null);
  const [user,        setUser]        = useState<User | null>(null);
  const [userRole,    setUserRole]    = useState<string>('patient');
  const [loading,     setLoading]     = useState(true);
  const [notFound,    setNotFound]    = useState(false);
  const [doctorNote,  setDoctorNote]  = useState('');
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [printing,    setPrinting]    = useState(false);

  useEffect(() => {
    const unsub = subscribeToAuth(async (u) => {
      setUser(u);
      if (u) {
        const profile = await getUserProfile(u.uid);
        setUserRole(profile?.role ?? 'patient');
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!id) return;
    // Demo scans (id starts with 'd')
    if (id.startsWith('d')) {
      const demoMap: Record<string, ScanRecord> = {
        d1: {
          id: 'd1', uid: '', type: 'Chest X-Ray (PA)', imageURL: '', status: 'Reviewed',
          findings: [
            { label: 'Pulmonary consolidation', confidence: 96, severity: 'medium', notes: 'Opacification in right lower lobe consistent with lobar pneumonia. Air bronchograms visible.', region: 'Right lower lobe' },
            { label: 'Cardiomegaly', confidence: 73, severity: 'low', notes: 'Cardiothoracic ratio ~0.52. Borderline enlargement.', region: 'Cardiac silhouette' },
            { label: 'No pneumothorax', confidence: 98, severity: 'normal', notes: 'Visceral pleural line intact bilaterally.', region: 'Bilateral lung fields' },
          ],
          summary: 'Right lower lobe consolidation consistent with lobar pneumonia. Borderline cardiomegaly noted. No pleural effusion or pneumothorax identified.',
          recommendation: 'Antibiotic therapy as per clinical protocol. Follow-up CXR in 4–6 weeks. Echo for cardiac evaluation.',
          doctorNote: 'Patient started on amoxicillin. Follow-up in 2 weeks.', validated: true,
          createdAt: null, updatedAt: null,
        },
        d2: {
          id: 'd2', uid: '', type: 'Right Knee MRI (Sagittal T2)', imageURL: '', status: 'Pending',
          findings: [
            { label: 'Medial meniscal tear', confidence: 88, severity: 'medium', notes: 'Posterior horn medial meniscus tear, likely bucket-handle. Grade 3 signal.', region: 'Medial meniscus' },
            { label: 'Joint effusion', confidence: 82, severity: 'low', notes: 'Moderate suprapatellar effusion noted.', region: 'Suprapatellar bursa' },
            { label: 'ACL intact', confidence: 95, severity: 'normal', notes: 'Anterior cruciate ligament appears intact with normal signal.', region: 'ACL' },
          ],
          summary: 'Posterior horn medial meniscal tear with moderate joint effusion. ACL and PCL intact. No osteochondral lesion identified.',
          recommendation: 'Orthopaedic referral recommended. Consider arthroscopy vs conservative management based on symptom severity.',
          createdAt: null, updatedAt: null,
        },
      };
      const demo = demoMap[id];
      if (demo) { setScan(demo); setDoctorNote(demo.doctorNote ?? ''); }
      else setNotFound(true);
      setLoading(false);
      return;
    }
    getScan(id).then((data) => {
      if (!data) setNotFound(true);
      else {
        // Attempt to load local image fallback if Firebase Storage was bypassed
        let finalImageURL = data.imageURL;
        if (!finalImageURL) {
          try {
            const localImg = localStorage.getItem(`scan_img_${id}`);
            if (localImg) finalImageURL = localImg;
          } catch (e) {
            console.warn('Could not read local storage');
          }
        }
        setScan({ ...data, imageURL: finalImageURL });
        setDoctorNote(data.doctorNote ?? '');
      }
      setLoading(false);
    });
  }, [id]);

  const handleValidate = async (approved: boolean) => {
    if (!scan?.id || scan.id.startsWith('d')) return;
    setSaving(true);
    try {
      await validateScan(scan.id, doctorNote, approved);
      setScan((prev) => prev ? { ...prev, status: 'Reviewed', validated: approved, doctorNote } : prev);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    setPrinting(true);
    setTimeout(() => { window.print(); setPrinting(false); }, 200);
  };

  const scanContextForChat = scan
    ? `Scan Type: ${scan.type}\nSummary: ${scan.summary}\nFindings:\n${scan.findings.map(f => `- ${f.label} (${f.severity}, ${f.confidence}% confidence): ${f.notes}`).join('\n')}\nRecommendation: ${scan.recommendation ?? 'N/A'}`
    : '';

  const dateStr = scan?.createdAt
    ? new Date((scan.createdAt as unknown as { seconds: number }).seconds * 1000).toLocaleDateString('en-GB', {
        weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
      })
    : 'Demo Record';

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full border-2 border-slate-700 border-t-brand-400 animate-spin mb-4" />
          <p className="text-slate-500 text-sm">Loading report…</p>
        </div>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="font-display text-2xl font-bold text-white mb-2">Report not found</h1>
          <p className="text-slate-400 text-sm mb-6">This scan report doesn&apos;t exist or you don&apos;t have access to it.</p>
          <Link href="/dashboard" className="btn-primary">Back to Dashboard</Link>
        </div>
      </main>
    );
  }

  if (!scan) return null;

  const sorted    = sortedFindings(scan);
  const highCount = scan.findings.filter((f) => f.severity === 'high').length;
  const medCount  = scan.findings.filter((f) => f.severity === 'medium').length;
  const isDoctor  = userRole === 'doctor' || userRole === 'clinic';

  return (
    <>
      <main className="min-h-screen px-6 py-12 text-slate-100 print:bg-white print:text-black print:px-8 print:py-6">
        <div className="mx-auto max-w-4xl">

          {/* Breadcrumb — hidden on print */}
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-8 print:hidden">
            <Link href="/" className="hover:text-slate-300 transition">Home</Link>
            <span>›</span>
            <Link href="/dashboard" className="hover:text-slate-300 transition">Dashboard</Link>
            <span>›</span>
            <span className="text-slate-300">Report</span>
          </div>

          {/* ── Report Header ──────────────────────────────────────────────── */}
          <div className="glass rounded-3xl p-8 mb-6 relative overflow-hidden print:border print:border-gray-200 print:rounded-none print:shadow-none">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-600/5 to-teal-500/5 pointer-events-none print:hidden" />

            <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                {/* Title */}
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-500 to-teal-500 flex items-center justify-center flex-shrink-0 print:hidden">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="font-display text-2xl font-bold text-white print:text-black">{scan.type}</h1>
                    <p className="text-sm text-slate-400 print:text-gray-600">MedScan AI Clinical Report · {dateStr}</p>
                  </div>
                </div>

                {/* Status badges */}
                <div className="flex items-center gap-2 flex-wrap mt-3">
                  <span className={`text-xs font-medium px-3 py-1 rounded-full border ${
                    scan.status === 'Reviewed'
                      ? 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400'
                      : scan.status === 'Pending'
                      ? 'bg-amber-400/10 border-amber-400/20 text-amber-400'
                      : 'bg-brand-400/10 border-brand-400/20 text-brand-400'
                  }`}>
                    {scan.status}
                  </span>
                  {scan.validated && (
                    <span className="text-xs font-medium px-3 py-1 rounded-full border bg-emerald-400/10 border-emerald-400/20 text-emerald-400">
                      ✓ Doctor Validated
                    </span>
                  )}
                  {scan.id?.startsWith('d') && (
                    <span className="text-xs font-medium px-3 py-1 rounded-full border bg-amber-400/10 border-amber-400/20 text-amber-400">
                      Demo Report
                    </span>
                  )}
                  {highCount > 0 && (
                    <span className="text-xs font-medium px-3 py-1 rounded-full border bg-rose-400/10 border-rose-400/20 text-rose-400">
                      {highCount} High Severity
                    </span>
                  )}
                  {medCount > 0 && !highCount && (
                    <span className="text-xs font-medium px-3 py-1 rounded-full border bg-orange-400/10 border-orange-400/20 text-orange-400">
                      {medCount} Medium Severity
                    </span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-shrink-0 print:hidden">
                <button
                  onClick={handlePrint}
                  disabled={printing}
                  id="print-report-btn"
                  className="btn-outline text-sm py-2 px-4"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                  </svg>
                  {printing ? 'Preparing…' : 'Print / PDF'}
                </button>
                <Link href="/dashboard" className="btn-primary text-sm py-2 px-4">
                  Dashboard
                </Link>
              </div>
            </div>

            {/* Report ID */}
            {scan.id && !scan.id.startsWith('d') && (
              <p className="relative mt-4 text-xs text-slate-600 font-mono">
                Report ID: {scan.id}
              </p>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            {/* ── Left column ───────────────────────────────────────────────── */}
            <div className="space-y-6">

              {/* AI Summary */}
              <div className="glass-card rounded-2xl p-6 print:border print:border-gray-200 print:rounded-none">
                <h2 className="font-display font-semibold text-white print:text-black flex items-center gap-2 mb-3">
                  <span className="h-5 w-5 rounded bg-brand-500/20 flex items-center justify-center text-brand-400 print:hidden">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  AI Clinical Summary
                  <span className="text-xs font-normal bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 px-2 py-0.5 rounded-full">
                    Claude AI
                  </span>
                </h2>
                <p className="text-sm text-slate-400 leading-relaxed print:text-gray-700">{scan.summary}</p>
              </div>

              {/* Findings */}
              <div className="glass-card rounded-2xl p-6 print:border print:border-gray-200 print:rounded-none">
                <h2 className="font-display font-semibold text-white print:text-black flex items-center gap-2 mb-4">
                  Findings
                  <span className="text-xs font-normal bg-slate-800 text-slate-400 rounded-full px-2 py-0.5">
                    {scan.findings.length}
                  </span>
                </h2>
                <div className="space-y-3">
                  {sorted.map((f, i) => (
                    <FindingCard key={i} finding={f} index={i} />
                  ))}
                  {scan.findings.length === 0 && (
                    <div className="text-center py-6">
                      <div className="text-3xl mb-2">✅</div>
                      <p className="text-sm text-emerald-400 font-medium">No significant findings</p>
                      <p className="text-xs text-slate-500 mt-1">Normal study — no anomalies detected</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recommendation */}
              {scan.recommendation && (
                <div className="glass-card rounded-2xl p-6 border-l-2 border-l-brand-500 print:border print:border-gray-200 print:rounded-none">
                  <h2 className="font-display font-semibold text-white print:text-black flex items-center gap-2 mb-3">
                    <svg className="h-4 w-4 text-brand-400 print:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                    </svg>
                    Clinical Recommendation
                  </h2>
                  <p className="text-sm text-slate-400 leading-relaxed print:text-gray-700">{scan.recommendation}</p>
                  <p className="mt-4 text-xs text-slate-600 print:text-gray-500">
                    ⚠ This is AI-generated pre-screening. Always consult a licensed physician before clinical decisions.
                  </p>
                </div>
              )}

              {/* Medications */}
              {scan.medications && scan.medications.length > 0 && (
                <div className="glass-card rounded-2xl p-6 print:border print:border-gray-200 print:rounded-none">
                  <h2 className="font-display font-semibold text-white print:text-black flex items-center gap-2 mb-4">
                    <span className="text-xl">💊</span> Suggested Medications
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {scan.medications.map((m, i) => (
                      <MedicationCard key={i} med={m} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Right column ──────────────────────────────────────────────── */}
            <div className="space-y-6">

              {/* Scan image */}
              {scan.imageURL && (
                <div className="glass-card rounded-2xl overflow-hidden print:border print:border-gray-200 print:rounded-none relative">
                  <InteractiveImage
                    src={scan.imageURL}
                    alt={`${scan.type} medical scan`}
                    className="w-full bg-black h-64 flex"
                  />
                  <p className="px-4 py-2 text-xs text-slate-600 text-center">{scan.type}</p>
                </div>
              )}

              {/* Confidence Overview */}
              <div className="glass-card rounded-2xl p-5 print:border print:border-gray-200 print:rounded-none">
                <h3 className="font-display font-semibold text-white print:text-black text-sm mb-4">
                  Confidence Overview
                </h3>
                <div className="space-y-3">
                  {sorted.map((f, i) => {
                    const bar = f.severity === 'high' ? '#fb7185' : f.severity === 'medium' ? '#fb923c' : f.severity === 'low' ? '#fbbf24' : '#34d399';
                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-slate-400 truncate max-w-[70%]">{f.label}</span>
                          <span className="text-xs font-bold text-slate-300">{f.confidence}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${f.confidence}%`, background: `linear-gradient(90deg,${bar}66,${bar})` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                {scan.findings.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-800/60">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Average confidence</span>
                      <span className="font-bold text-slate-200">
                        {Math.round(scan.findings.reduce((a, f) => a + f.confidence, 0) / scan.findings.length)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Doctor review — shown if doctor/clinic role */}
              {isDoctor && (
                <div className="glass-card rounded-2xl p-5 border border-teal-500/20 print:border print:border-gray-200 print:rounded-none">
                  <h3 className="font-display font-semibold text-white text-sm mb-1 flex items-center gap-2">
                    🩺 Doctor Review
                    {scan.validated && (
                      <span className="text-xs font-normal bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 px-2 py-0.5 rounded-full">
                        Validated
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 mb-3">Add clinical notes and validate the AI findings for this patient.</p>

                  <textarea
                    value={doctorNote}
                    onChange={(e) => setDoctorNote(e.target.value)}
                    placeholder="Add clinical notes, observations, or corrections…"
                    rows={4}
                    id="doctor-note-input"
                    className="form-input resize-none text-xs mb-3"
                  />

                  {saved && (
                    <div className="mb-3 rounded-xl bg-emerald-400/10 border border-emerald-400/20 px-3 py-2 text-xs text-emerald-400 flex items-center gap-2">
                      ✓ Review saved successfully
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleValidate(true)}
                      disabled={saving}
                      id="validate-approve-btn"
                      className="flex-1 py-2 text-xs font-semibold rounded-xl bg-emerald-400/15 border border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/25 transition disabled:opacity-50"
                    >
                      {saving ? '…' : '✓ Approve'}
                    </button>
                    <button
                      onClick={() => handleValidate(false)}
                      disabled={saving}
                      id="validate-flag-btn"
                      className="flex-1 py-2 text-xs font-semibold rounded-xl bg-rose-400/15 border border-rose-400/30 text-rose-400 hover:bg-rose-400/25 transition disabled:opacity-50"
                    >
                      {saving ? '…' : '⚠ Flag for Review'}
                    </button>
                  </div>
                </div>
              )}

              {/* Doctor note (read-only for patients) */}
              {scan.doctorNote && !isDoctor && (
                <div className="glass-card rounded-2xl p-5 border border-emerald-500/20 print:border print:border-gray-200 print:rounded-none">
                  <h3 className="font-display font-semibold text-white print:text-black text-sm mb-1 flex items-center gap-2">
                    🩺 Doctor&apos;s Note
                    <span className="text-xs font-normal bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 px-2 py-0.5 rounded-full">
                      Validated
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed print:text-gray-700">{scan.doctorNote}</p>
                </div>
              )}

              {/* Metadata */}
              <div className="glass-card rounded-2xl p-5 print:border print:border-gray-200 print:rounded-none">
                <h3 className="font-display font-semibold text-white print:text-black text-sm mb-3">Report Details</h3>
                <dl className="space-y-2 text-xs">
                  {[
                    { label: 'Scan Type',  value: scan.type },
                    { label: 'Date',       value: dateStr },
                    { label: 'Status',     value: scan.status },
                    { label: 'Findings',   value: `${scan.findings.length} finding${scan.findings.length !== 1 ? 's' : ''}` },
                    { label: 'AI Engine',  value: 'Claude 3.7 Sonnet' },
                    ...(scan.id && !scan.id.startsWith('d') ? [{ label: 'Report ID', value: scan.id.slice(0, 12) + '…' }] : []),
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-start justify-between gap-2">
                      <dt className="text-slate-600 flex-shrink-0">{label}</dt>
                      <dd className="text-slate-300 print:text-gray-700 text-right font-medium">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Quick links */}
              <div className="flex gap-2 print:hidden">
                <Link href="/upload" className="flex-1 btn-primary text-sm justify-center py-2.5">
                  New Scan
                </Link>
                <Link href="/dashboard" className="flex-1 btn-outline text-sm justify-center py-2.5">
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* AI Chat Panel — floating */}
      <AiChatPanel scanContext={scanContextForChat} />
    </>
  );
}
