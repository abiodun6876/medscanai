'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, updateProfile } from 'firebase/auth';
import { subscribeToAuth, signOut, getUserProfile, UserRole } from '../../lib/firebaseAuth';
import { auth } from '../../lib/firebase';
import { getUserScans } from '../../lib/firebaseDb';

const roleConfig: Record<UserRole, { label: string; icon: string; color: string; bg: string; desc: string }> = {
  patient: { label: 'Patient',  icon: '🧑‍🦰', color: 'text-brand-400',   bg: 'bg-brand-400/10 border-brand-400/20',   desc: 'Upload & view your own scans' },
  doctor:  { label: 'Doctor',   icon: '🩺',   color: 'text-teal-400',    bg: 'bg-teal-400/10 border-teal-400/20',     desc: 'Review & validate AI findings' },
  clinic:  { label: 'Clinic',   icon: '🏥',   color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', desc: 'Manage multiple patients' },
};

export default function SettingsPage() {
  const router = useRouter();

  const [user,        setUser]        = useState<User | null>(null);
  const [role,        setRole]        = useState<UserRole>('patient');
  const [displayName, setDisplayName] = useState('');
  const [scanCount,   setScanCount]   = useState<number | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [error,       setError]       = useState('');
  const [signOutConf, setSignOutConf] = useState(false);

  useEffect(() => {
    const unsub = subscribeToAuth(async (u) => {
      if (!u) { router.push('/auth'); return; }
      setUser(u);
      setDisplayName(u.displayName ?? '');
      const profile = await getUserProfile(u.uid);
      if (profile?.role) setRole(profile.role as UserRole);
      try {
        const scans = await getUserScans();
        setScanCount(scans.length);
      } catch {
        setScanCount(0);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  const handleSave = async () => {
    if (!auth.currentUser || !displayName.trim()) return;
    setSaving(true);
    setError('');
    try {
      await updateProfile(auth.currentUser, { displayName: displayName.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const createdDate = user?.metadata.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—';

  const lastLogin = user?.metadata.lastSignInTime
    ? new Date(user.metadata.lastSignInTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-slate-700 border-t-brand-400 animate-spin" />
      </main>
    );
  }

  const rCfg = roleConfig[role] ?? roleConfig.patient;

  return (
    <main className="min-h-screen px-6 py-12 text-slate-100">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-brand-700/8 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-2xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-slate-300 transition">Home</Link>
          <span>›</span>
          <span className="text-slate-300">Settings</span>
        </div>

        <h1 className="font-display text-3xl font-bold text-white mb-8">Account Settings</h1>

        {/* Profile Card */}
        <div className="glass rounded-3xl p-8 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-600/5 to-teal-500/5 pointer-events-none" />

          {/* Avatar row */}
          <div className="relative flex items-center gap-5 mb-8">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-500 to-teal-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-brand-500/20 flex-shrink-0">
              {(user?.displayName ?? user?.email ?? '?')[0].toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-semibold text-white">{user?.displayName ?? 'No name set'}</p>
              <p className="text-sm text-slate-400">{user?.email}</p>
              <div className={`inline-flex items-center gap-1.5 mt-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${rCfg.bg} ${rCfg.color}`}>
                {rCfg.icon} {rCfg.label}
              </div>
            </div>
          </div>

          {/* Stats mini row */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Total Scans',  value: scanCount ?? '—', icon: '🔬' },
              { label: 'Account Type', value: rCfg.label,       icon: rCfg.icon },
              { label: 'Member Since', value: createdDate,       icon: '📅' },
            ].map((s) => (
              <div key={s.label} className="glass-card rounded-xl p-4 text-center">
                <div className="text-xl mb-1">{s.icon}</div>
                <div className="text-sm font-bold text-white">{s.value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Edit display name */}
          <div className="space-y-4">
            <div>
              <label htmlFor="display-name" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Display Name
              </label>
              <input
                id="display-name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                className="form-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                value={user?.email ?? ''}
                disabled
                className="form-input opacity-50 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-slate-600">Email cannot be changed here. Contact support if needed.</p>
            </div>

            {error && (
              <div className="rounded-xl bg-rose-400/10 border border-rose-400/20 px-4 py-3 text-sm text-rose-300">
                ⚠ {error}
              </div>
            )}

            {saved && (
              <div className="rounded-xl bg-emerald-400/10 border border-emerald-400/20 px-4 py-3 text-sm text-emerald-400 flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Profile updated successfully!
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={saving || !displayName.trim()}
              id="save-profile-btn"
              className="btn-primary w-full justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving…
                </>
              ) : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Account Info Card */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <h2 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="h-4 w-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
            Account Information
          </h2>
          <dl className="space-y-3">
            {[
              { label: 'User ID',        value: user?.uid?.slice(0, 16) + '…' },
              { label: 'Auth Provider',  value: user?.providerData[0]?.providerId === 'google.com' ? '🔵 Google OAuth' : '📧 Email / Password' },
              { label: 'Account Role',   value: `${rCfg.icon} ${rCfg.label} — ${rCfg.desc}` },
              { label: 'Last Sign In',   value: lastLogin },
              { label: 'Member Since',   value: createdDate },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-start justify-between gap-4">
                <dt className="text-xs text-slate-500 flex-shrink-0 pt-0.5">{label}</dt>
                <dd className="text-xs text-slate-300 font-medium text-right">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Quick Links */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <h2 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="h-4 w-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            Quick Links
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: '/dashboard', label: 'My Dashboard',   icon: '📊' },
              { href: '/reports',   label: 'My Reports',     icon: '📋' },
              { href: '/upload',    label: 'Upload Scan',    icon: '📤' },
              { href: '/',          label: 'Home',           icon: '🏠' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3 text-sm text-slate-300 hover:border-brand-500/30 hover:bg-brand-500/5 hover:text-white transition-all"
              >
                <span className="text-base">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6">
          <h2 className="font-display font-semibold text-rose-400 mb-1 flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            Danger Zone
          </h2>
          <p className="text-xs text-slate-500 mb-4">Signing out will end your session on this device.</p>

          {!signOutConf ? (
            <button
              onClick={() => setSignOutConf(true)}
              id="sign-out-btn"
              className="btn-outline text-sm border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              Sign Out
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm text-rose-300">Are you sure?</span>
              <button
                onClick={handleSignOut}
                id="confirm-sign-out-btn"
                className="text-xs font-semibold px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:bg-rose-500/30 transition"
              >
                Yes, sign out
              </button>
              <button
                onClick={() => setSignOutConf(false)}
                className="text-xs text-slate-500 hover:text-slate-300 transition"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
