import React, { useState } from 'react';
import { MedicationSuggestion } from '../lib/firebaseDb';
import Link from 'next/link';

export function MedicationCard({ med }: { med: MedicationSuggestion }) {
  const [expanded, setExpanded] = useState(false);

  const typeColor = 
    med.type.toLowerCase().includes('prescription') ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
    med.type.toLowerCase().includes('natural') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
    'bg-brand-500/10 text-brand-400 border-brand-500/20'; // OTC

  return (
    <div className="glass-card rounded-xl p-4 border border-slate-700/50 hover:border-slate-600/50 transition">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xl shadow-inner">💊</div>
          <div>
            <h4 className="font-semibold text-slate-200">{med.name}</h4>
            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${typeColor} inline-block mt-1`}>
              {med.type}
            </span>
          </div>
        </div>
        <button 
          onClick={() => setExpanded(!expanded)}
          className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800/50 transition"
        >
          <svg className={`w-5 h-5 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div className="bg-slate-900/60 rounded-lg p-2 border border-slate-800/50">
          <span className="block text-[10px] uppercase text-slate-500 mb-0.5 tracking-wider">Dosage</span>
          <span className="text-slate-300 font-medium">{med.dosage}</span>
        </div>
        <div className="bg-slate-900/60 rounded-lg p-2 border border-slate-800/50">
          <span className="block text-[10px] uppercase text-slate-500 mb-0.5 tracking-wider">Frequency</span>
          <span className="text-slate-300 font-medium">{med.frequency}</span>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 space-y-4 border-t border-slate-700/50 pt-4 animate-fade-in-up">
          {med.duration && (
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Duration
              </span>
              <p className="text-sm text-slate-300 mt-1 bg-slate-900/30 p-2 rounded border border-slate-800/30">{med.duration}</p>
            </div>
          )}
          {med.notes && (
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Instructions
              </span>
              <p className="text-sm text-slate-300 mt-1 bg-slate-900/30 p-2 rounded border border-slate-800/30">{med.notes}</p>
            </div>
          )}
          {med.sideEffects && med.sideEffects.length > 0 && (
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Common Side Effects</span>
              <ul className="list-disc list-inside text-sm text-slate-300 mt-1.5 grid grid-cols-2 gap-1 pl-1">
                {med.sideEffects.map((effect, i) => <li key={i} className="truncate" title={effect}>{effect}</li>)}
              </ul>
            </div>
          )}
          {med.warnings && med.warnings.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                Warnings
              </span>
              <ul className="list-disc list-inside text-xs text-amber-200/80 space-y-0.5">
                {med.warnings.map((warning, i) => <li key={i}>{warning}</li>)}
              </ul>
            </div>
          )}
          <div className="pt-2">
            <Link href="/chat" className="text-sm text-brand-400 hover:text-brand-300 flex items-center justify-center gap-2 transition bg-brand-500/10 border border-brand-500/20 py-2 rounded-lg hover:bg-brand-500/20">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              Discuss with Doctor
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
