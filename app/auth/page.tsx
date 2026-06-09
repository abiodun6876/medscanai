'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerUser, signIn, signInWithGoogle, UserRole } from '../../lib/firebaseAuth';

type Tab = 'login' | 'register';

export default function AuthPage() {
  const router = useRouter();
  const [tab,      setTab]      = useState<Tab>('login');
  const [role,     setRole]     = useState<UserRole>('patient');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [name,     setName]     = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState(false);

  const clearError = () => setError('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (tab === 'register') {
        await registerUser(email, password, name, role);
      } else {
        await signIn(email, password);
      }
      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 1200);
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Something went wrong';
      // Make Firebase error messages friendlier
      if (msg.includes('email-already-in-use'))  setError('An account with this email already exists.');
      else if (msg.includes('wrong-password') || msg.includes('invalid-credential'))
        setError('Incorrect email or password.');
      else if (msg.includes('user-not-found'))  setError('No account found with this email.');
      else if (msg.includes('weak-password'))   setError('Password must be at least 6 characters.');
      else                                      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 1200);
    } catch (err: unknown) {
      setError((err as { message?: string })?.message ?? 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const roles: { id: UserRole; label: string; icon: string; desc: string }[] = [
    { id: 'patient', label: 'Patient',  icon: '🧑‍🦰', desc: 'Upload & view your own scans' },
    { id: 'doctor',  label: 'Doctor',   icon: '🩺',   desc: 'Review & validate AI findings' },
    { id: 'clinic',  label: 'Clinic',   icon: '🏥',   desc: 'Manage multiple patients' },
  ];

  return (
    <main className="min-h-screen px-6 py-16 text-slate-100">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-brand-700/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 transition text-sm mb-6">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to home
          </Link>
          <h1 className="font-display text-3xl font-bold text-white">
            {tab === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="mt-2 text-slate-400 text-sm">
            {tab === 'login' ? 'Sign in to access your medical dashboard' : 'Join MedScan AI to get started'}
          </p>
        </div>

        <div className="glass rounded-2xl p-8">
          {success ? (
            <div className="text-center py-8">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center text-3xl">
                ✓
              </div>
              <h3 className="font-display text-xl font-semibold text-white">
                {tab === 'login' ? 'Signed in!' : 'Account created!'}
              </h3>
              <p className="mt-2 text-sm text-slate-400">Redirecting to your dashboard…</p>
            </div>
          ) : (
            <>
              {/* Tab Toggle */}
              <div className="flex rounded-xl bg-slate-900/60 border border-slate-800 p-1 mb-6">
                {(['login', 'register'] as Tab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTab(t); clearError(); }}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                      tab === t ? 'bg-brand-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {t === 'login' ? 'Sign In' : 'Register'}
                  </button>
                ))}
              </div>

              {/* Error banner */}
              {error && (
                <div className="mb-4 rounded-xl bg-rose-400/10 border border-rose-400/20 px-4 py-3 text-sm text-rose-300 flex items-start gap-2">
                  <svg className="h-4 w-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Role picker (register only) */}
                {tab === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Account type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {roles.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setRole(r.id)}
                          className={`rounded-xl border p-3 text-center transition-all ${
                            role === r.id
                              ? 'border-brand-500/50 bg-brand-500/10 text-white'
                              : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <div className="text-xl mb-1">{r.icon}</div>
                          <div className="text-xs font-medium">{r.label}</div>
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-slate-500 text-center">
                      {roles.find((r) => r.id === role)?.desc}
                    </p>
                  </div>
                )}

                {tab === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                      placeholder="Dr. Jane Smith" className="form-input" required />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" className="form-input" required />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                    {tab === 'login' && (
                      <button type="button" className="text-xs text-brand-400 hover:text-brand-300 transition">
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" className="form-input" required minLength={6} />
                </div>

                {tab === 'register' && (
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" required
                      className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-900 accent-brand-500" />
                    <span className="text-xs text-slate-500 leading-relaxed">
                      I agree to the{' '}
                      <span className="text-brand-400 hover:text-brand-300">Terms of Service</span>
                      {' '}and{' '}
                      <span className="text-brand-400 hover:text-brand-300">Privacy Policy</span>
                    </span>
                  </label>
                )}

                <button type="submit" disabled={loading}
                  className="btn-primary w-full justify-center py-3 rounded-xl mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
                  {loading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {tab === 'login' ? 'Signing in…' : 'Creating account…'}
                    </>
                  ) : (
                    tab === 'login' ? 'Sign In' : 'Create Account'
                  )}
                </button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-slate-950 px-3 text-slate-600">or continue with</span>
                </div>
              </div>

              <button
                onClick={handleGoogle}
                disabled={loading}
                className="btn-outline w-full justify-center py-2.5 text-sm rounded-xl disabled:opacity-60"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          Protected by Firebase Authentication · Data encrypted at rest and in transit
        </p>
      </div>
    </main>
  );
}
