'use client';

import { ScanFinding } from '../lib/firebaseDb';

interface FindingCardProps {
  finding: ScanFinding;
  index: number;
  darkMode?: boolean;  // Add this prop
}

export function FindingCard({ finding, index, darkMode = false }: FindingCardProps) {
  const getSeverityColor = () => {
    switch (finding.severity) {
      case 'high':
        return darkMode 
          ? 'text-red-400 bg-red-500/10 border-red-500/20' 
          : 'text-red-700 bg-red-100 border-red-200';
      case 'medium':
        return darkMode 
          ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' 
          : 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'low':
        return darkMode 
          ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' 
          : 'text-blue-700 bg-blue-100 border-blue-200';
      default:
        return darkMode 
          ? 'text-green-400 bg-green-500/10 border-green-500/20' 
          : 'text-green-700 bg-green-100 border-green-200';
    }
  };

  return (
    <div className={`rounded-xl p-4 transition-all duration-300 ${
      darkMode 
        ? 'bg-slate-800/50 hover:bg-slate-700/50' 
        : 'bg-slate-50 hover:bg-slate-100'
    }`}>
      <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
        <div className="flex-1">
          <h4 className={`font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
            {finding.label}
          </h4>
          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {finding.region}
          </p>
        </div>
        <div className="flex gap-2">
          <span className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor()}`}>
            {finding.severity.toUpperCase()}
          </span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            darkMode 
              ? 'bg-slate-700 text-slate-300' 
              : 'bg-slate-200 text-slate-700'
          }`}>
            {finding.confidence}% confidence
          </span>
        </div>
      </div>
      <p className={`text-sm mt-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
        {finding.notes}
      </p>
    </div>
  );
}