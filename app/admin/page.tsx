'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User } from 'firebase/auth';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { getAllScans, ScanRecord } from '../../lib/firebaseDb';
import { subscribeToAuth, getUserProfile } from '../../lib/firebaseAuth';

interface UserRecord {
  uid: string;
  displayName: string;
  email: string;
  role: string;
  createdAt?: any;
}

interface Stats {
  totalUsers: number;
  totalDoctors: number;
  totalPatients: number;
  totalAdmins: number;
  totalScans: number;
  pendingScans: number;
  reviewedScans: number;
  aiReadyScans: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string>('patient');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentScans, setRecentScans] = useState<ScanRecord[]>([]);
  const [recentUsers, setRecentUsers] = useState<UserRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'scans' | 'users'>('overview');

  useEffect(() => {
    const unsub = subscribeToAuth(async (u) => {
      setUser(u);
      if (u) {
        const profile = await getUserProfile(u.uid);
        const userRole = profile?.role || 'patient';
        setRole(userRole);
        if (userRole !== 'admin') {
          router.push('/dashboard');
          return;
        }

        // Fetch all data in parallel
        const [usersSnap, allScans] = await Promise.all([
          getDocs(collection(db, 'users')),
          getAllScans(),
        ]);

        const users: UserRecord[] = usersSnap.docs.map(d => ({
          uid: d.id,
          ...(d.data() as Omit<UserRecord, 'uid'>),
        }));

        setRecentUsers(users.slice(0, 10));
        setRecentScans(allScans.slice(0, 20));

        const doctors = users.filter(u => u.role === 'doctor' || u.role === 'clinic');
        const patients = users.filter(u => u.role === 'patient');
        const admins = users.filter(u => u.role === 'admin');

        setStats({
          totalUsers: users.length,
          totalDoctors: doctors.length,
          totalPatients: patients.length,
          totalAdmins: admins.length,
          totalScans: allScans.length,
          pendingScans: allScans.filter(s => s.status === 'Pending').length,
          reviewedScans: allScans.filter(s => s.status === 'Reviewed').length,
          aiReadyScans: allScans.filter(s => s.status === 'AI Ready').length,
        });
      } else {
        router.push('/auth');
      }
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full border-2 border-slate-700 border-t-brand-400 animate-spin mb-4" />
          <p className="text-slate-500 text-sm">Loading admin dashboard…</p>
        </div>
      </main>
    );
  }

  if (role !== 'admin') return null;

  const statCards = [
    {
      label: 'Total Users',
      value: stats?.totalUsers ?? 0,
      icon: '👥',
      color: 'border-brand-500',
      sub: `${stats?.totalDoctors ?? 0} doctors • ${stats?.totalPatients ?? 0} patients`,
    },
    {
      label: 'Doctors / Clinics',
      value: stats?.totalDoctors ?? 0,
      icon: '🩺',
      color: 'border-teal-500',
      sub: 'Registered healthcare providers',
    },
    {
      label: 'Total Scans',
      value: stats?.totalScans ?? 0,
      icon: '🔬',
      color: 'border-purple-500',
      sub: `${stats?.pendingScans ?? 0} pending • ${stats?.reviewedScans ?? 0} reviewed`,
    },
    {
      label: 'Pending Review',
      value: stats?.pendingScans ?? 0,
      icon: '⏳',
      color: 'border-amber-500',
      sub: 'Scans awaiting doctor review',
    },
    {
      label: 'AI Ready',
      value: stats?.aiReadyScans ?? 0,
      icon: '🤖',
      color: 'border-indigo-500',
      sub: 'AI-processed scans',
    },
    {
      label: 'Reviewed',
      value: stats?.reviewedScans ?? 0,
      icon: '✅',
      color: 'border-emerald-500',
      sub: 'Doctor-validated scans',
    },
  ];

  return (
    <main className="min-h-screen px-6 py-12 bg-slate-950 text-slate-100">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-300 mb-3">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-400" />
              </span>
              Admin Access
            </div>
            <h1 className="text-4xl font-display font-bold text-white">Platform Dashboard</h1>
            <p className="text-slate-400 mt-1">Real-time overview of MedScan AI activity.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard" className="btn-outline text-sm py-2 px-4">
              ← My Dashboard
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {statCards.map((card) => (
            <div key={card.label} className={`glass-card rounded-2xl p-6 border-l-4 ${card.color} hover:scale-[1.01] transition-transform`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{card.icon}</span>
                <span className="text-sm text-slate-400">{card.label}</span>
              </div>
              <p className="text-4xl font-bold text-white">{card.value.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-2">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-800">
          {(['overview', 'scans', 'users'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-medium capitalize transition border-b-2 -mb-px ${
                activeTab === tab
                  ? 'border-brand-400 text-brand-300'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab === 'overview' ? '📊 Overview' : tab === 'scans' ? '🔬 All Scans' : '👥 All Users'}
            </button>
          ))}
        </div>

        {/* Tab: Overview */}
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* User breakdown */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">User Breakdown</h2>
              <div className="space-y-3">
                {[
                  { label: 'Patients', count: stats?.totalPatients ?? 0, color: 'bg-brand-500', pct: stats ? ((stats.totalPatients / Math.max(stats.totalUsers, 1)) * 100) : 0 },
                  { label: 'Doctors / Clinics', count: stats?.totalDoctors ?? 0, color: 'bg-teal-500', pct: stats ? ((stats.totalDoctors / Math.max(stats.totalUsers, 1)) * 100) : 0 },
                  { label: 'Admins', count: stats?.totalAdmins ?? 0, color: 'bg-rose-500', pct: stats ? ((stats.totalAdmins / Math.max(stats.totalUsers, 1)) * 100) : 0 },
                ].map(row => (
                  <div key={row.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">{row.label}</span>
                      <span className="font-bold text-slate-200">{row.count}</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${row.color} rounded-full transition-all`} style={{ width: `${row.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scan breakdown */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">Scan Status Breakdown</h2>
              <div className="space-y-3">
                {[
                  { label: 'AI Ready', count: stats?.aiReadyScans ?? 0, color: 'bg-indigo-500', pct: stats ? ((stats.aiReadyScans / Math.max(stats.totalScans, 1)) * 100) : 0 },
                  { label: 'Pending Review', count: stats?.pendingScans ?? 0, color: 'bg-amber-500', pct: stats ? ((stats.pendingScans / Math.max(stats.totalScans, 1)) * 100) : 0 },
                  { label: 'Reviewed', count: stats?.reviewedScans ?? 0, color: 'bg-emerald-500', pct: stats ? ((stats.reviewedScans / Math.max(stats.totalScans, 1)) * 100) : 0 },
                ].map(row => (
                  <div key={row.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">{row.label}</span>
                      <span className="font-bold text-slate-200">{row.count}</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${row.color} rounded-full transition-all`} style={{ width: `${row.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Scans */}
        {activeTab === 'scans' && (
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">Recent Scans ({recentScans.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-900/60 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="px-4 py-3">Scan ID</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Findings</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {recentScans.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">No scans found.</td>
                    </tr>
                  ) : recentScans.map((scan) => {
                    const date = scan.createdAt
                      ? new Date((scan.createdAt as any).seconds * 1000).toLocaleDateString()
                      : '—';
                    return (
                      <tr key={scan.id} className="hover:bg-slate-800/30 transition text-sm">
                        <td className="px-4 py-3 font-mono text-slate-500 text-xs">{scan.id?.slice(0, 10)}…</td>
                        <td className="px-4 py-3 font-medium text-slate-200">{scan.type}</td>
                        <td className="px-4 py-3 text-slate-400">{date}</td>
                        <td className="px-4 py-3 text-slate-400">{scan.findings?.length ?? 0}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full border font-medium ${
                            scan.status === 'Reviewed' ? 'bg-emerald-400/10 border-emerald-400/30 text-emerald-400' :
                            scan.status === 'Pending'  ? 'bg-amber-400/10  border-amber-400/30  text-amber-400'  :
                                                         'bg-indigo-400/10 border-indigo-400/30 text-indigo-400'
                          }`}>{scan.status}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/reports/${scan.id}`} className="text-brand-400 hover:text-brand-300 transition text-xs font-medium">
                            View →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Users */}
        {activeTab === 'users' && (
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">All Users ({recentUsers.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-900/60 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">UID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {recentUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-500">No users found.</td>
                    </tr>
                  ) : recentUsers.map((u) => (
                    <tr key={u.uid} className="hover:bg-slate-800/30 transition text-sm">
                      <td className="px-4 py-3 font-medium text-slate-200">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {(u.displayName || u.email || '?')[0].toUpperCase()}
                          </div>
                          {u.displayName || '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full border font-medium capitalize ${
                          u.role === 'admin'   ? 'bg-rose-400/10   border-rose-400/30   text-rose-400'   :
                          u.role === 'doctor' || u.role === 'clinic' ? 'bg-teal-400/10 border-teal-400/30 text-teal-400' :
                                                 'bg-brand-400/10  border-brand-400/30  text-brand-400'
                        }`}>{u.role}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600 text-xs">{u.uid?.slice(0, 12)}…</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
