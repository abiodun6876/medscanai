'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { subscribeToAuth, signOut, getUserProfile } from '../lib/firebaseAuth';

const navLinks = [
  { href: '/',          label: 'Home'      },
  { href: '/upload',    label: 'Upload'    },
  { href: '/condition-scan', label: 'Condition Scan' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/reports',   label: 'Reports'   },
  { href: '/chat',      label: 'Chat'      },
  { href: '/learn',     label: 'Learn'     },
];

export function NavBar() {
  const pathname    = usePathname();
  const router      = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user,       setUser]       = useState<User | null>(null);
  const [role,       setRole]       = useState<string>('patient');
  const [scrolled,   setScrolled]   = useState(false);

  useEffect(() => {
    const unsub = subscribeToAuth(async (u) => {
      setUser(u);
      if (u) {
        const profile = await getUserProfile(u.uid);
        setRole(profile?.role || 'patient');
      } else {
        setRole('patient');
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <nav className={`sticky top-0 z-50 border-b transition-all duration-300 ${
      scrolled
        ? 'border-slate-800/80 bg-slate-950/90 backdrop-blur-2xl shadow-lg shadow-black/20'
        : 'border-slate-800/40 bg-slate-950/70 backdrop-blur-xl'
    }`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative h-8 w-8 flex-shrink-0">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-brand-500 to-teal-500 opacity-90 group-hover:opacity-100 transition-all group-hover:shadow-md group-hover:shadow-brand-500/30" />
            <svg className="relative z-10 h-8 w-8 p-1.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
            </svg>
          </div>
          <span className="font-display font-bold text-white text-lg tracking-tight">
            MedScan <span className="gradient-text">AI</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                pathname === link.href
                  ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {role === 'admin' && (
            <Link
              href="/admin"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                pathname === '/admin'
                  ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                  : 'text-rose-400/80 hover:text-rose-300 hover:bg-slate-800/60'
              }`}
            >
              Admin
            </Link>
          )}
        </div>

        {/* Auth area */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              {/* User avatar + name */}
              <Link
                href="/settings"
                className="flex items-center gap-2.5 rounded-full border border-slate-700/50 bg-slate-800/40 px-3 py-1.5 hover:border-brand-500/40 hover:bg-brand-500/5 transition-all group"
              >
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-brand-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {(user.displayName ?? user.email ?? '?')[0].toUpperCase()}
                </div>
                <span className="text-sm text-slate-300 group-hover:text-white transition max-w-[120px] truncate">
                  {user.displayName ?? user.email}
                </span>
                <svg className="h-3.5 w-3.5 text-slate-500 group-hover:text-slate-300 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </Link>
              <button onClick={handleSignOut} className="btn-outline text-sm py-2 px-4">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth" className="btn-outline text-sm py-2 px-4">Sign in</Link>
              <Link href="/upload" className="btn-primary text-sm py-2 px-4">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload Scan
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-800/60 px-6 py-4 space-y-1 bg-slate-950/95 backdrop-blur-xl animate-fade-in-up">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                pathname === link.href
                  ? 'bg-brand-500/15 text-brand-300'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {role === 'admin' && (
            <Link
              href="/admin"
              className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                pathname === '/admin'
                  ? 'bg-rose-500/15 text-rose-300'
                  : 'text-rose-400/80 hover:text-rose-300 hover:bg-slate-800/60'
              }`}
            >
              Admin Dashboard
            </Link>
          )}
          <div className="pt-3 flex flex-col gap-2 border-t border-slate-800/60">
            {user ? (
              <>
                <Link href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-300 hover:bg-slate-800/60 transition">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-brand-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                    {(user.displayName ?? user.email ?? '?')[0].toUpperCase()}
                  </div>
                  <span className="truncate">{user.displayName ?? user.email}</span>
                </Link>
                <button
                  onClick={() => { setMobileOpen(false); handleSignOut(); }}
                  className="btn-outline text-sm justify-center"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth" className="btn-outline text-sm justify-center">Sign in</Link>
                <Link href="/upload" className="btn-primary text-sm justify-center">Upload Scan</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
