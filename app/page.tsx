import Link from 'next/link';

const stats = [
  { value: '98.7%', label: 'AI Accuracy', icon: '🎯' },
  { value: '< 30s', label: 'Analysis Time', icon: '⚡' },
  { value: '50K+', label: 'Scans Analysed', icon: '🔬' },
  { value: 'HIPAA', label: 'Compliant', icon: '🔒' },
];

const features = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: 'Secure Authentication',
    desc: 'Role-based access for patients, doctors, and clinics with HIPAA-compliant data handling.',
    color: 'text-brand-400',
    bg: 'bg-brand-500/10 border-brand-500/20',
    button: '/auth',
    buttonText: 'Sign In →'
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
    title: 'Smart Image Upload',
    desc: 'Drag-and-drop X-ray, PNG, JPG, JPEG upload with instant preview and file validation.',
    color: 'text-teal-400',
    bg: 'bg-teal-500/10 border-teal-500/20',
    button: '/upload',
    buttonText: 'Upload →'
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.699-1.388 2.38l-2.064-.486" />
      </svg>
    ),
    title: 'AI Analysis Engine',
    desc: 'Get AI-generated findings with confidence scores, anomaly detection, and clinical notes.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10 border-emerald-400/20',
    button: '/upload',
    buttonText: 'Analyze →'
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
      </svg>
    ),
    title: 'Clinical Reports',
    desc: 'Download structured PDF reports with findings, timestamps, and doctor validation status.',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10 border-amber-400/20',
    button: '/reports',
    buttonText: 'View Sample →'
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    title: 'Doctor Review',
    desc: 'Clinicians can validate AI findings, add notes, and approve reports for clinical use.',
    color: 'text-rose-400',
    bg: 'bg-rose-400/10 border-rose-400/20',
    button: '/dashboard',
    buttonText: 'Doctor Portal →'
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
      </svg>
    ),
    title: 'Scan History',
    desc: 'Track all past scans in a searchable dashboard with status indicators and quick access.',
    color: 'text-brand-300',
    bg: 'bg-brand-300/10 border-brand-300/20',
    button: '/dashboard',
    buttonText: 'View History →'
  },
];

// Advanced features - these are TOOLS within the upload page
const advancedFeatures = [
  {
    icon: '📏',
    title: 'Measurement Tools',
    desc: 'Precise distance, angle, and area measurements with automatic calibration.',
    tooltip: 'Available after uploading an image',
    path: '/upload'
  },
  {
    icon: '🔲',
    title: 'ROI Analysis',
    desc: 'Region of Interest analysis with density measurements and statistics.',
    tooltip: 'Available after uploading an image',
    path: '/upload'
  },
  {
    icon: '🔄',
    title: 'Study Comparison',
    desc: 'Side-by-side, overlay, and linked comparison with prior studies.',
    tooltip: 'Available after uploading an image',
    path: '/upload'
  },
  {
    icon: '🏷️',
    title: 'Anatomical Landmarks',
    desc: 'AI-powered detection of anatomical landmarks with confidence scores.',
    tooltip: 'Available after uploading an image',
    path: '/upload'
  },
  {
    icon: '📷',
    title: 'DICOM Viewer',
    desc: 'Full DICOM support with window leveling and metadata extraction.',
    tooltip: 'Available after uploading an image',
    path: '/upload'
  },
  {
    icon: '🔍',
    title: 'Image Enhancement',
    desc: 'Zoom, pan, brightness, and contrast controls for detailed review.',
    tooltip: 'Available after uploading an image',
    path: '/upload'
  },
];

const recentScans = [
  { id: 'SC-001', type: 'Chest X-Ray', date: '2 hours ago', status: 'Reviewed', confidence: 96 },
  { id: 'SC-002', type: 'Knee MRI', date: '5 hours ago', status: 'Pending', confidence: 88 },
  { id: 'SC-003', type: 'Chest CT', date: '1 day ago', status: 'Reviewed', confidence: 94 },
  { id: 'SC-004', type: 'Shoulder X-Ray', date: '2 days ago', status: 'AI Ready', confidence: 91 },
];

export default function Home() {
  return (
    <main className="min-h-screen text-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pt-20 pb-32">
        {/* Background decorators */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-brand-600/10 blur-3xl" />
          <div className="absolute top-20 -right-20 h-[300px] w-[300px] rounded-full bg-teal-500/8 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full bg-brand-700/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-400" />
            </span>
            AI-Powered Clinical Analysis
          </div>

          <h1 className="font-display text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Medical Imaging,{' '}
            <span className="gradient-text">Reimagined</span> with AI
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 leading-relaxed">
            Upload X-rays, MRIs, and CT scans. Receive AI-assisted findings in seconds.
            Generate clinical-grade reports for doctor validation and patient records.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/upload" className="btn-primary text-base px-6 py-3">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload Your First Scan
            </Link>
            <Link href="/auth" className="btn-outline text-base px-6 py-3">
              Sign In / Register
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <div className="relative mx-auto mt-20 max-w-4xl grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="glass-card rounded-2xl p-5 text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="font-display text-2xl font-bold text-white">{stat.value}</div>
              <div className="mt-1 text-xs text-slate-500 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Advanced Features Section - Tools available AFTER upload */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-300 mb-4">
              🚀 Professional Tools
            </div>
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
              Advanced{' '}
              <span className="gradient-text">Imaging Tools</span>
            </h2>
            <p className="mt-4 text-slate-400 max-w-xl mx-auto">
              Upload an image to unlock these professional medical imaging tools
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {advancedFeatures.map((feature) => (
              <Link
                key={feature.title}
                href={feature.path}
                className="glass-card rounded-2xl p-6 hover:scale-105 transition-transform duration-300 cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="text-4xl">{feature.icon}</div>
                  <span className="text-xs bg-slate-700/50 text-slate-400 px-2 py-1 rounded-full group-hover:bg-brand-500/20 group-hover:text-brand-300 transition">
                    Available after upload
                  </span>
                </div>
                <h3 className="mt-4 font-display font-semibold text-white text-lg group-hover:text-brand-400 transition">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-sm text-slate-500 group-hover:text-brand-400 transition">
                  Upload to use
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
              Everything you need for{' '}
              <span className="gradient-text">clinical AI</span>
            </h2>
            <p className="mt-4 text-slate-400 max-w-xl mx-auto">
              A complete workflow from image upload to validated clinical reports, powered by AI.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="glass-card rounded-2xl p-6 group hover:border-slate-700 transition-all duration-300">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl border ${f.bg} ${f.color}`}>
                  {f.icon}
                </div>
                <h3 className="mt-4 font-display font-semibold text-white text-lg">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                <Link
                  href={f.button}
                  className="mt-4 inline-flex items-center gap-1 text-sm text-slate-400 group-hover:text-brand-400 transition"
                >
                  {f.buttonText}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-5xl">
          <div className="glass-card rounded-3xl p-8">
            <h2 className="text-center font-display text-2xl font-bold text-white mb-8">
              How MedScan AI Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-500/20 flex items-center justify-center text-2xl mb-4">
                  📸
                </div>
                <h3 className="font-semibold text-white mb-2">1. Upload</h3>
                <p className="text-sm text-slate-400">Drag & drop any medical image</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-500/20 flex items-center justify-center text-2xl mb-4">
                  🧠
                </div>
                <h3 className="font-semibold text-white mb-2">2. Analyze</h3>
                <p className="text-sm text-slate-400">AI processes in under 30 seconds</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-500/20 flex items-center justify-center text-2xl mb-4">
                  📋
                </div>
                <h3 className="font-semibold text-white mb-2">3. Report</h3>
                <p className="text-sm text-slate-400">Get structured clinical findings</p>
              </div>
            </div>

            {/* Tooltip note */}
            <div className="mt-8 text-center">
              <p className="text-xs text-slate-500">
                💡 After uploading, you'll have access to: Measurement Tools, ROI Analysis, Study Comparison, Anatomical Landmarks, and more
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Scans Preview */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-4xl">
          <div className="glass rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-xl font-semibold text-white">Recent Scans</h2>
                <p className="mt-1 text-sm text-slate-500">Demo scan history</p>
              </div>
              <Link href="/dashboard" className="btn-outline text-sm py-1.5 px-4">
                View all
              </Link>
            </div>

            <div className="space-y-3">
              {recentScans.map((scan) => (
                <div key={scan.id} className="flex items-center justify-between rounded-xl bg-slate-900/60 px-5 py-4 border border-slate-800/60 hover:border-slate-700/60 transition">
                  <div className="flex items-center gap-4">
                    <div className="h-9 w-9 rounded-lg bg-brand-500/15 border border-brand-500/20 flex items-center justify-center">
                      <svg className="h-4 w-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-200">{scan.type}</div>
                      <div className="text-xs text-slate-500">{scan.id} · {scan.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <div className="text-xs text-slate-500 mb-1">AI Confidence</div>
                      <div className="text-sm font-semibold text-slate-200">{scan.confidence}%</div>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      scan.status === 'Reviewed'
                        ? 'bg-emerald-400/15 text-emerald-400 border border-emerald-400/20'
                        : scan.status === 'Pending'
                        ? 'bg-amber-400/15 text-amber-400 border border-amber-400/20'
                        : 'bg-brand-500/15 text-brand-300 border border-brand-500/20'
                    }`}>
                      {scan.status}
                    </span>
                    <Link href={`/reports/${scan.id}`} className="text-slate-500 hover:text-slate-300 transition">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="glass rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-600/10 to-teal-500/5 pointer-events-none" />
            <h2 className="relative font-display text-3xl font-bold text-white">
              Ready to transform your imaging workflow?
            </h2>
            <p className="relative mt-4 text-slate-400">
              Join thousands of healthcare professionals using MedScan AI.
            </p>
            <div className="relative mt-8 flex flex-wrap gap-4 justify-center">
              <Link href="/upload" className="btn-primary text-base px-8 py-3">
                Get Started — It's Free
              </Link>
              <Link href="/reports" className="btn-outline text-base px-8 py-3">
                View Sample Report
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 px-6 py-10">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <span className="font-display font-semibold text-slate-400">MedScan AI</span>
            <span>·</span>
            <span>© 2026</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link href="/auth" className="hover:text-slate-300 transition">Privacy</Link>
            <Link href="/auth" className="hover:text-slate-300 transition">Terms</Link>
            <Link href="/auth" className="hover:text-slate-300 transition">Contact</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}