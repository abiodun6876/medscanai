'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { saveConditionScan, ScanFinding, MedicationSuggestion } from '../../lib/firebaseDb';
import { auth } from '../../lib/firebase';
import { FindingCard } from '../../components/FindingCard';
import { MedicationCard } from '../../components/MedicationCard';
import { WebcamCapture } from '../../components/WebcamCapture';

const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '';

interface ConditionResult {
  conditionName: string;
  summary: string;
  findings: ScanFinding[];
  recommendation: string;
  medications: MedicationSuggestion[];
}

const SYSTEM_PROMPT = `You are DermaScan AI, an expert dermatology and general practice AI.
Analyze the provided image of a visible medical condition (e.g. skin lesion, rash, wound, infection, swelling).
Respond ONLY with a valid JSON object matching this schema exactly. No markdown, no explanation.

{
  "conditionName": "string — precise suspected condition name",
  "summary": "string — clinical description of the visual presentation",
  "findings": [
    {
      "label": "string",
      "confidence": number,
      "severity": "normal" | "low" | "medium" | "high" | "critical",
      "region": "string — anatomical location",
      "notes": "string"
    }
  ],
  "recommendation": "string — immediate clinical steps or first aid",
  "medications": [
    {
      "name": "string",
      "type": "OTC | Prescription | Natural",
      "dosage": "string",
      "frequency": "string",
      "duration": "string",
      "sideEffects": ["string"],
      "warnings": ["string"],
      "notes": "string"
    }
  ]
}

If no clear condition is visible, report normal skin.`;

export default function ConditionScanPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [stage, setStage] = useState<'idle' | 'analyzing' | 'done' | 'error'>('idle');
  const [result, setResult] = useState<ConditionResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [scanId, setScanId] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const { onAuthStateChanged } = require('firebase/auth');
    const unsub = onAuthStateChanged(auth, (u: any) => setIsLoggedIn(!!u));
    return () => unsub();
  }, []);

  const handleFileSelect = (f: File) => {
    if (!f.type.startsWith('image/')) {
      setErrorMsg('Please select an image file');
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setStage('idle');
    setResult(null);
    setErrorMsg('');
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelect(f);
  }, []);

  const onDragOver = (e: React.DragEvent) => e.preventDefault();

  const runAnalysis = async () => {
    if (!file) return;
    if (!OPENROUTER_API_KEY) {
      setErrorMsg('API key not configured.');
      setStage('error');
      return;
    }
    
    setStage('analyzing');
    setProgress(10);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
      const base64 = btoa(binary);
      
      setProgress(40);
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://medscanai-amber.vercel.app',
          'X-Title': 'ConditionScan AI',
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o',
          max_tokens: 1500,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            {
              role: 'user',
              content: [
                { type: 'text', text: 'Analyze this visible condition.' },
                { type: 'image_url', image_url: { url: `data:${file.type};base64,${base64}` } }
              ]
            }
          ]
        })
      });
      
      setProgress(80);
      
      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      let rawText = data.choices[0].message.content;
      let jsonText = rawText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
      const match = jsonText.match(/\{[\s\S]*\}/);
      if (match) jsonText = match[0];
      
      const parsed = JSON.parse(jsonText) as ConditionResult;
      setResult(parsed);
      setProgress(100);
      
      if (isLoggedIn) {
        try {
          const id = await saveConditionScan({
            type: 'Visual Condition Scan',
            imageURL: preview || '',
            status: 'Reviewed',
            findings: parsed.findings,
            summary: parsed.summary,
            recommendation: parsed.recommendation,
            medications: parsed.medications,
            conditionDetails: { conditionName: parsed.conditionName },
          });
          setScanId(id);
        } catch(e) { console.error(e); }
      }
      
      setStage('done');
    } catch (err: any) {
      setStage('error');
      setErrorMsg(err.message || 'Analysis failed.');
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setStage('idle');
    setResult(null);
    setErrorMsg('');
  };

  return (
    <main className="min-h-screen px-6 py-12 bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-medium text-purple-300 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-purple-400" />
            </span>
            ConditionScan AI
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Visible Symptom Analysis
          </h1>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Upload photos of skin conditions, rashes, wounds, or visible symptoms for instant AI diagnosis and medication suggestions.
          </p>
        </div>

        <div className="grid md:grid-cols-[1fr_1.2fr] gap-8">
          
          {/* Left Column: Upload */}
          <div className="space-y-6">
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onClick={() => !file && !showWebcam && inputRef.current?.click()}
              className={`relative rounded-[2rem] border-2 border-dashed transition-all duration-300 min-h-[400px] flex items-center justify-center overflow-hidden ${
                file ? 'border-purple-500/50 bg-slate-900/50' : showWebcam ? 'border-purple-500 bg-slate-950' : 'border-slate-700 hover:border-purple-500/50 bg-slate-900/30 cursor-pointer'
              }`}
            >
              {showWebcam ? (
                <div className="absolute inset-0 z-10 p-2 bg-slate-950 flex" onClick={e => e.stopPropagation()}>
                  <div className="flex-1 w-full h-full relative">
                    <WebcamCapture 
                      onCapture={(f) => {
                        handleFileSelect(f);
                        setShowWebcam(false);
                      }}
                      onCancel={() => setShowWebcam(false)}
                    />
                  </div>
                </div>
              ) : preview ? (
                <div className="relative w-full h-full p-4 flex flex-col items-center justify-center">
                  <img src={preview} alt="Condition" className="max-h-[350px] w-auto rounded-2xl object-contain shadow-lg" />
                  {stage === 'analyzing' && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center">
                      <div className="w-20 h-20 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-6" />
                      <p className="text-xl text-purple-300 font-semibold mb-2">Analyzing Symptoms...</p>
                      <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden">
                         <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300" style={{width: `${progress}%`}} />
                      </div>
                      <p className="text-xs text-slate-400 mt-3">{progress}% complete</p>
                    </div>
                  )}
                  {stage === 'idle' && (
                    <button onClick={(e) => { e.stopPropagation(); reset(); }} className="absolute top-4 right-4 bg-slate-900/90 border border-slate-700 p-2 rounded-full text-slate-400 hover:text-rose-400 transition hover:bg-slate-800 shadow-xl">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center p-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 animate-float">
                    📸
                  </div>
                  <p className="text-xl font-semibold text-slate-200 mb-2">Take or Upload Photo</p>
                  <p className="text-sm text-slate-400 mb-6">Clear, well-lit photos work best</p>
                  <div className="flex justify-center gap-4 relative z-10">
                    <button onClick={(e) => { e.stopPropagation(); setShowWebcam(true); }} className="px-5 py-2.5 rounded-xl bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 font-medium border border-purple-500/30 flex items-center gap-2 transition hover:scale-105">
                      <span>📷</span> Use Webcam
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }} className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium border border-slate-700 flex items-center gap-2 transition hover:scale-105">
                      <span>📁</span> Upload File
                    </button>
                  </div>
                  <div className="mt-6 flex justify-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-slate-800 text-xs text-slate-400">Skin Lesions</span>
                    <span className="px-3 py-1 rounded-full bg-slate-800 text-xs text-slate-400">Rashes</span>
                    <span className="px-3 py-1 rounded-full bg-slate-800 text-xs text-slate-400">Wounds</span>
                  </div>
                </div>
              )}
              <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
              }} />
            </div>

            {errorMsg && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm flex items-center gap-3">
                <span className="text-xl">⚠️</span> <span className="font-medium">{errorMsg}</span>
              </div>
            )}

            {file && stage === 'idle' && (
              <button onClick={runAnalysis} className="w-full py-5 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-lg font-bold shadow-lg shadow-purple-500/25 transition-all duration-300 transform hover:scale-[1.02]">
                ✨ Analyze Condition
              </button>
            )}
            {stage === 'done' && (
              <button onClick={reset} className="w-full py-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-medium transition-all">
                Upload New Photo
              </button>
            )}
          </div>

          {/* Right Column: Results */}
          <div className="space-y-6">
            {!result && stage !== 'analyzing' && (
              <div className="h-full bg-slate-900/30 border border-slate-800/50 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center">
                <div className="text-6xl mb-6 opacity-40">🔬</div>
                <h3 className="text-2xl font-semibold text-slate-300 mb-3">Awaiting Image</h3>
                <p className="text-slate-500 text-base max-w-sm leading-relaxed">
                  The AI will analyze the visible condition and provide clinical findings, a diagnosis summary, and medication suggestions.
                </p>
              </div>
            )}

            {result && (
              <div className="space-y-6 animate-fade-in-up">
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-[2rem] p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
                  <h2 className="text-3xl font-bold text-white flex items-center gap-3 mb-4">
                    <span className="text-purple-400 text-2xl">📋</span> {result.conditionName}
                  </h2>
                  <p className="text-slate-300 leading-relaxed text-base">
                    {result.summary}
                  </p>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <span className="text-pink-400">🔍</span> Clinical Findings
                  </h3>
                  <div className="space-y-4">
                    {result.findings.map((f, i) => (
                      <FindingCard key={i} finding={f} index={i} darkMode={true} />
                    ))}
                  </div>
                </div>

                {result.medications && result.medications.length > 0 && (
                  <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
                    <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                      <span className="text-brand-400">💊</span> Suggested Treatments
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {result.medications.map((m, i) => (
                        <MedicationCard key={i} med={m} />
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-slate-900/50 border-l-4 border-l-purple-500 rounded-r-3xl p-6 shadow-lg shadow-purple-500/5">
                  <h3 className="font-bold text-purple-400 mb-2 flex items-center gap-2 text-sm uppercase tracking-wider">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Recommendation
                  </h3>
                  <p className="text-slate-300 text-base leading-relaxed">{result.recommendation}</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
