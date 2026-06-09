'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { saveScan, ScanFinding } from '../../lib/firebaseDb';
import { auth } from '../../lib/firebase';
import { FindingCard } from '../../components/FindingCard';
import { AiChatPanel } from '../../components/AiChatPanel';

type Stage = 'idle' | 'analysing' | 'done' | 'error';

interface ScanResult {
  imageType: string;
  summary: string;
  findings: ScanFinding[];
  recommendation: string;
  fallback?: boolean;
}

// Use environment variable for API key
const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '';

const SYSTEM_PROMPT = `You are MedScan AI, an expert radiology AI assistant specialising in medical image analysis.
When given a medical image (X-ray, MRI, CT scan, ultrasound, or similar), analyse it thoroughly and respond ONLY with a valid JSON object.

JSON schema (respond ONLY with this — no markdown, no code fences, no explanation):
{
  "imageType": "string — precise scan type e.g. 'Chest X-Ray (PA)', 'Right Knee MRI (Sagittal T2)', 'Abdominal CT (Axial)'",
  "summary": "string — 3-5 sentence clinical summary paragraph suitable for a radiologist",
  "findings": [
    {
      "label":      "string — precise medical finding name",
      "confidence": number — integer 60-99,
      "severity":   "normal" | "low" | "medium" | "high",
      "region":     "string — specific anatomical region/structure",
      "notes":      "string — 1-3 sentence clinical description with relevant measurements where possible"
    }
  ],
  "recommendation": "string — concise clinical recommendation paragraph"
}

Rules:
- Always include at least one finding (include a 'normal' severity finding even if the scan is clear)
- Confidence values must be realistic integers between 60 and 99
- Findings list should be ordered by severity (high → normal)
- Be precise with anatomical terminology
- imageType must be specific, not generic`;

export default function UploadPage() {
  const [stage, setStage] = useState<Stage>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDrag, setIsDrag] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scanId, setScanId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Check auth state
  useEffect(() => {
    const { onAuthStateChanged } = require('firebase/auth');
    const unsub = onAuthStateChanged(auth, (u: unknown) => setIsLoggedIn(!!u));
    return () => unsub();
  }, []);

  const handleFileSelect = (f: File) => {
    if (!f.type.startsWith('image/')) {
      setErrorMsg('Please select an image file');
      return;
    }
    
    setFile(f);
    const previewUrl = URL.createObjectURL(f);
    setPreview(previewUrl);
    setStage('idle');
    setResult(null);
    setErrorMsg('');
    setProgress(0);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelect(f);
  }, []);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDrag(true);
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFileSelect(f);
  };

  const runAnalysis = async () => {
  if (!file) return;
  
  if (!OPENROUTER_API_KEY) {
    setErrorMsg('API key not configured. Please add NEXT_PUBLIC_OPENROUTER_API_KEY to .env.local');
    setStage('error');
    return;
  }
  
  setStage('analysing');
  setErrorMsg('');
  setProgress(0);
  
  try {
    const interval = setInterval(() => {
      setProgress(p => Math.min(p + 10, 90));
    }, 300);
    
    // Convert image to base64
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    
    setProgress(30);
    
    // Call OpenRouter API with working model
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://medscanai-amber.vercel.app',
        'X-Title': 'MedScan AI',  // Changed from X-OpenRouter-Title
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o',  // Working vision model
        max_tokens: 1024,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this medical image. Return ONLY valid JSON matching the schema. No markdown, no explanation, just the JSON object.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${file.type};base64,${base64}`,
                },
              },
            ],
          },
        ],
      }),
    });
    
    setProgress(70);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('API Error:', errorData);
      throw new Error(`OpenRouter API error: ${response.status} - ${errorData}`);
    }
    
    const data = await response.json();
    const rawText = data.choices[0].message.content;
    
    setProgress(85);
    
    console.log('OpenRouter response:', rawText);
    
    // Parse JSON response
    let jsonText = rawText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) jsonText = jsonMatch[0];
    
    const parsed = JSON.parse(jsonText) as ScanResult;
    
    setProgress(100);
    clearInterval(interval);
    
    setResult(parsed);
    
    // Save to Firestore if logged in
    if (isLoggedIn) {
      try {
        const id = await saveScan({
          type: parsed.imageType,
          imageURL: preview || '',
          status: 'AI Ready',
          findings: parsed.findings,
          summary: parsed.summary,
          recommendation: parsed.recommendation,
        });
        setScanId(id);
        if (preview) {
          localStorage.setItem(`scan_img_${id}`, preview);
        }
      } catch (dbError) {
        console.error('Failed to save:', dbError);
      }
    }
    
    setStage('done');
    
  } catch (err: any) {
    console.error('Analysis failed:', err);
    setStage('error');
    setErrorMsg(err.message || 'Analysis failed. Please try again with a different image.');
  }
};

  const reset = () => {
    setStage('idle');
    setFile(null);
    setPreview(null);
    setResult(null);
    setScanId('');
    setErrorMsg('');
    setProgress(0);
  };

  const scanContextForChat = result
    ? `Scan Type: ${result.imageType}\nSummary: ${result.summary}\nFindings:\n${result.findings.map(f => `- ${f.label} (${f.severity}, ${f.confidence}% confidence): ${f.notes}`).join('\n')}\nRecommendation: ${result.recommendation}`
    : '';

  return (
    <>
      <main className="min-h-screen px-6 py-12 text-slate-100">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-300 mb-4">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-400" />
              </span>
              Powered by OpenRouter + GPT-4 Vision
            </div>
            <h1 className="font-display text-4xl font-bold text-white sm:text-5xl">
              Upload <span className="gradient-text">Medical Scan</span>
            </h1>
            <p className="mt-4 text-slate-400 max-w-xl mx-auto leading-relaxed">
              Drop your X-ray, MRI, or CT scan below. Our AI analyzes it and returns
              structured clinical findings — stored securely in your account.
            </p>
            {!isLoggedIn && (
              <div className="mt-4 inline-flex items-center gap-2 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 px-4 py-2 rounded-full">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <Link href="/auth" className="underline hover:text-amber-300">Sign in</Link>
                &nbsp;to save scan results to your dashboard
              </div>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
            {/* Left: Upload Zone - Same as before */}
            <div className="space-y-4">
              {/* Drop zone */}
              <div
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={() => setIsDrag(false)}
                onClick={() => {
                  if (!file && inputRef.current) {
                    inputRef.current.click();
                  }
                }}
                className={`relative rounded-2xl border-2 border-dashed overflow-hidden transition-all cursor-pointer
                  ${isDrag ? 'border-brand-400 bg-brand-500/10 scale-[1.01]'
                    : file ? 'border-teal-500/40 bg-slate-900/60'
                    : 'border-slate-700 bg-slate-900/40 hover:border-brand-500/50 hover:bg-brand-500/5'}`}
                style={{ minHeight: preview ? 300 : 200 }}
              >
                {preview ? (
                  <div className="relative">
                    <img src={preview} alt="Scan preview" className="w-full h-72 object-contain p-4" />
                    {stage === 'analysing' && (
                      <div className="absolute inset-0 overflow-hidden">
                        <div className="animate-scan absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-brand-400 to-transparent" />
                        <div className="absolute inset-0 bg-brand-900/20" />
                      </div>
                    )}
                    {stage === 'idle' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); reset(); }}
                        className="absolute top-3 right-3 h-7 w-7 rounded-full bg-slate-900/80 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-rose-400 transition"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-10 text-center">
                    <div className="mb-4 h-14 w-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 animate-float">
                      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                    </div>
                    <p className="font-semibold text-slate-300">Drop your scan here</p>
                    <p className="mt-1 text-sm text-slate-500">
                      or <span className="text-brand-400 font-medium">browse files</span>
                    </p>
                    <p className="mt-3 text-xs text-slate-600">PNG · JPG · JPEG · Max 50 MB</p>
                  </div>
                )}
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={onFileInputChange}
                  className="hidden"
                />
              </div>

              {/* File info chip */}
              {file && stage === 'idle' && (
                <div className="glass-card rounded-xl px-4 py-3 flex items-center gap-3 animate-fade-in-up">
                  <div className="h-8 w-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 flex-shrink-0">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-200 truncate">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <span className="text-xs text-teal-400 font-medium bg-teal-400/10 border border-teal-400/20 rounded-full px-2.5 py-1 flex-shrink-0">
                    Ready
                  </span>
                </div>
              )}

              {/* Progress bar */}
              {stage === 'analysing' && (
                <div className="space-y-1.5 animate-fade-in-up">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <span className="animate-pulse">🤖</span>
                      GPT-4 Vision analyzing...
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${progress}%`,
                        background: 'linear-gradient(90deg,#14b8a6,#2dd4bf)',
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-600">
                    Medical image analysis in progress
                  </p>
                </div>
              )}

              {/* Error */}
              {stage === 'error' && (
                <div className="rounded-xl bg-rose-400/10 border border-rose-400/20 px-4 py-3 text-sm text-rose-300 flex items-start gap-2 animate-fade-in-up">
                  <svg className="h-4 w-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  <span>{errorMsg}</span>
                  <button onClick={() => setStage('idle')} className="ml-auto text-rose-400 underline hover:text-rose-300 flex-shrink-0">
                    Retry
                  </button>
                </div>
              )}

              {/* Analyze CTA */}
              {file && stage === 'idle' && (
                <button
                  onClick={runAnalysis}
                  className="btn-primary w-full justify-center py-3.5 text-sm rounded-2xl animate-fade-in-up"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5" />
                  </svg>
                  Analyze with GPT-4 Vision
                </button>
              )}

              {/* Post-analysis actions */}
              {stage === 'done' && (
                <div className="flex gap-3 animate-fade-in-up">
                  <button onClick={reset} className="btn-outline flex-1 justify-center py-2.5 text-sm rounded-2xl">
                    Upload Another
                  </button>
                  {scanId && (
                    <Link href={`/reports/${scanId}`} className="btn-primary flex-1 justify-center py-2.5 text-sm rounded-2xl">
                      Full Report →
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Right: Results Panel */}
            <div>
              {/* Idle empty state */}
              {stage === 'idle' && !file && (
                <div className="h-full flex flex-col items-center justify-center text-center glass-card rounded-2xl p-10">
                  <div className="animate-float mb-5 h-20 w-20 rounded-3xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
                    <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.699-1.388 2.38l-2.064-.486" />
                    </svg>
                  </div>
                  <h3 className="font-display text-lg font-semibold text-slate-300">AI Findings Panel</h3>
                  <p className="mt-2 text-sm text-slate-500 max-w-xs leading-relaxed">
                    Upload a medical image and click &quot;Analyze&quot; to receive structured clinical findings with confidence scores and recommendations.
                  </p>
                </div>
              )}

              {/* Analysis loading state */}
              {stage === 'analysing' && (
                <div className="h-full flex flex-col items-center justify-center text-center glass-card rounded-2xl p-10">
                  <div className="relative mb-6 h-16 w-16">
                    <div className="absolute inset-0 rounded-full border-2 border-slate-700" />
                    <div className="absolute inset-0 rounded-full border-2 border-t-brand-400 border-r-teal-400 border-b-transparent border-l-transparent animate-spin" />
                    <div className="absolute inset-2 rounded-full border-2 border-b-brand-400/30 border-l-teal-400/30 border-t-transparent border-r-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-white">
                    GPT-4 Vision reading your scan...
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Analyzing anatomy and detecting anomalies
                  </p>
                </div>
              )}

              {/* Results */}
              {stage === 'done' && result && (
                <div className="space-y-4 animate-fade-in-up">
                  <div className="glass-card rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-display font-bold text-white">{result.imageType}</h3>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                          ✓ AI Complete
                        </span>
                      </div>
                    </div>
                    {scanId && (
                      <p className="text-xs text-slate-500 mb-3">Saved to Firestore · ID: {scanId.slice(0, 10)}…</p>
                    )}
                    <p className="text-sm text-slate-400 leading-relaxed">{result.summary}</p>
                  </div>

                  <div className="glass-card rounded-2xl p-5">
                    <h4 className="font-display font-semibold text-white mb-3 flex items-center gap-2">
                      Findings
                      <span className="text-xs font-normal bg-slate-800 text-slate-400 rounded-full px-2 py-0.5">
                        {result.findings.length}
                      </span>
                    </h4>
                    <div className="space-y-3">
                      {result.findings.map((f, i) => (
                        <FindingCard key={i} finding={f} index={i} />
                      ))}
                    </div>
                  </div>

                  {result.recommendation && (
                    <div className="glass-card rounded-2xl p-4 border-l-2 border-l-brand-500">
                      <p className="text-xs font-semibold text-brand-400 uppercase tracking-wider mb-1">
                        Recommendation
                      </p>
                      <p className="text-sm text-slate-400 leading-relaxed">{result.recommendation}</p>
                      <p className="mt-3 text-xs text-slate-600">
                        ⚠ AI pre-screening only.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {stage === 'done' && result && (
        <AiChatPanel scanContext={scanContextForChat} />
      )}
    </>
  );
}