'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const CONDITIONS = [
  {
    id: 'hypertension',
    title: 'Hypertension (High Blood Pressure)',
    category: 'Cardiovascular',
    description: 'A condition in which the force of the blood against the artery walls is too high.',
    symptoms: ['Often none', 'Headaches', 'Shortness of breath', 'Nosebleeds'],
    treatments: ['Dietary changes', 'Exercise', 'Medication (ACE inhibitors, beta blockers)'],
    color: 'from-rose-500 to-orange-500',
    icon: '🫀'
  },
  {
    id: 'type2-diabetes',
    title: 'Type 2 Diabetes',
    category: 'Endocrine',
    description: 'A chronic condition that affects the way the body processes blood sugar (glucose).',
    symptoms: ['Increased thirst', 'Frequent urination', 'Fatigue', 'Blurred vision'],
    treatments: ['Insulin therapy', 'Diet management', 'Metformin', 'Exercise'],
    color: 'from-blue-500 to-cyan-500',
    icon: '🩸'
  },
  {
    id: 'asthma',
    title: 'Asthma',
    category: 'Respiratory',
    description: 'A condition in which a person\'s airways become inflamed, narrow and swell.',
    symptoms: ['Shortness of breath', 'Chest tightness', 'Wheezing', 'Coughing attacks'],
    treatments: ['Inhaled corticosteroids', 'Rescue inhalers (Albuterol)', 'Trigger avoidance'],
    color: 'from-teal-500 to-emerald-500',
    icon: '🫁'
  },
  {
    id: 'eczema',
    title: 'Eczema (Atopic Dermatitis)',
    category: 'Dermatology',
    description: 'A condition that makes your skin red and itchy.',
    symptoms: ['Dry skin', 'Itching', 'Red to brownish-gray patches', 'Small, raised bumps'],
    treatments: ['Moisturizers', 'Corticosteroid creams', 'Antihistamines'],
    color: 'from-purple-500 to-indigo-500',
    icon: '🧴'
  },
  {
    id: 'migraine',
    title: 'Migraine',
    category: 'Neurology',
    description: 'A headache that can cause severe throbbing pain or a pulsing sensation.',
    symptoms: ['Throbbing pain', 'Sensitivity to light/sound', 'Nausea', 'Aura'],
    treatments: ['Pain relievers', 'Triptans', 'Preventive medications', 'Rest in dark room'],
    color: 'from-fuchsia-500 to-pink-500',
    icon: '🧠'
  },
  {
    id: 'osteoarthritis',
    title: 'Osteoarthritis',
    category: 'Rheumatology',
    description: 'The most common form of arthritis, occurring when protective cartilage wears down.',
    symptoms: ['Joint pain', 'Stiffness', 'Tenderness', 'Loss of flexibility'],
    treatments: ['Acetaminophen', 'NSAIDs', 'Physical therapy', 'Joint replacement'],
    color: 'from-amber-500 to-yellow-500',
    icon: '🦴'
  }
];

export default function LearnPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(CONDITIONS.map(c => c.category)));

  const filteredConditions = CONDITIONS.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory ? c.category === activeCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen px-6 py-12 bg-slate-950 text-slate-100">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto pt-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-300 mb-4">
            <span className="text-indigo-400">📚</span> Educational Resources
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent pb-2">
            MedLearn Hub
          </h1>
          <p className="mt-6 text-slate-400 text-lg leading-relaxed">
            Empower yourself with trusted medical knowledge. Explore our interactive library of conditions, symptoms, and evidence-based treatments.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 max-w-4xl mx-auto backdrop-blur-sm shadow-xl shadow-indigo-500/5">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search conditions, symptoms, or treatments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
            />
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-2 rounded-full text-sm transition-all ${
                activeCategory === null 
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 font-medium' 
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              All Categories
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  activeCategory === category 
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 font-medium' 
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Health Tip Banner */}
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-teal-500/20 rounded-3xl p-6 md:p-8 flex items-center gap-6 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-teal-500/20 rounded-full blur-3xl"></div>
          <div className="text-5xl hidden md:block">💡</div>
          <div>
            <h3 className="text-xl font-bold text-teal-400 mb-2">Daily Health Tip</h3>
            <p className="text-slate-300 leading-relaxed">
              Staying hydrated is crucial for joint lubrication, temperature regulation, and delivering nutrients to cells. Aim for at least 8 glasses (2 liters) of water a day, adjusting for climate and physical activity.
            </p>
          </div>
        </div>

        {/* Conditions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {filteredConditions.map(condition => (
            <div key={condition.id} className="condition-card bg-slate-900/40 border border-slate-800 flex flex-col h-full group">
              <div className="mb-4 flex justify-between items-start">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${condition.color} flex items-center justify-center text-2xl shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                  {condition.icon}
                </div>
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {condition.category}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                {condition.title}
              </h3>
              
              <p className="text-slate-400 text-sm mb-6 flex-1 line-clamp-3">
                {condition.description}
              </p>
              
              <div className="space-y-4 relative z-20">
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Common Symptoms</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {condition.symptoms.slice(0, 3).map((sym, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded bg-slate-800/80 text-slate-300 border border-slate-700/50">
                        {sym}
                      </span>
                    ))}
                    {condition.symptoms.length > 3 && (
                      <span className="text-xs px-2 py-1 rounded bg-slate-800/80 text-slate-500 border border-slate-700/50">
                        +{condition.symptoms.length - 3}
                      </span>
                    )}
                  </div>
                </div>
                
                <button className="w-full py-3 rounded-xl bg-slate-800 hover:bg-indigo-600 text-white font-medium transition-colors text-sm border border-slate-700 hover:border-indigo-500 flex items-center justify-center gap-2">
                  <span>Read Full Guide</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredConditions.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4 opacity-50">🔍</div>
            <h3 className="text-xl font-medium text-slate-300">No results found</h3>
            <p className="text-slate-500 mt-2">Try adjusting your search or category filter.</p>
          </div>
        )}

      </div>
    </main>
  );
}
