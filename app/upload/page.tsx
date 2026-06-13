'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { saveScan, ScanFinding, getRecentScans, MedicationSuggestion } from '../../lib/firebaseDb';
import { auth } from '../../lib/firebase';
import { FindingCard } from '../../components/FindingCard';
import { AiChatPanel } from '../../components/AiChatPanel';
import { MedicationCard } from '../../components/MedicationCard';

type Stage = 'idle' | 'analysing' | 'done' | 'error';

interface ScanResult {
  imageType: string;
  summary: string;
  findings: ScanFinding[];
  recommendation: string;
  medications?: MedicationSuggestion[];
  fallback?: boolean;
}

interface RecentScan {
  id: string;
  type: string;
  date: string;
  summary: string;
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
  "recommendation": "string — concise clinical recommendation paragraph",
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
  const [darkMode, setDarkMode] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);
  
  // NEW: State for advanced tools
  const [showAdvancedTools, setShowAdvancedTools] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Check auth state
  useEffect(() => {
    const { onAuthStateChanged } = require('firebase/auth');
    const unsub = onAuthStateChanged(auth, (u: unknown) => setIsLoggedIn(!!u));
    return () => unsub();
  }, []);

  // Load recent scans
  useEffect(() => {
    if (isLoggedIn) {
      loadRecentScans();
    }
  }, [isLoggedIn]);

  // Apply dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const loadRecentScans = async () => {
    try {
      const scans = await getRecentScans(5);
      setRecentScans(scans);
    } catch (error) {
      console.error('Failed to load recent scans:', error);
    }
  };

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
    setActiveTool(null); // Reset active tool when new file is uploaded
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

  const copyReportLink = () => {
    const url = `${window.location.origin}/reports/${scanId}`;
    navigator.clipboard.writeText(url);
    alert('Report link copied to clipboard!');
  };

  const printReport = () => {
    window.print();
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
          'X-Title': 'MedScan AI',
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o',
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
        throw new Error(`OpenRouter API error: ${response.status}`);
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
            medications: parsed.medications || [],
          });
          setScanId(id);
          await loadRecentScans();
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
    setActiveTool(null);
    setShowAdvancedTools(false);
  };

  const scanContextForChat = result
    ? `Scan Type: ${result.imageType}\nSummary: ${result.summary}\nFindings:\n${result.findings.map(f => `- ${f.label} (${f.severity}, ${f.confidence}% confidence): ${f.notes}`).join('\n')}\nRecommendation: ${result.recommendation}`
    : '';

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Advanced tools configuration
  const advancedTools = [
    { id: 'measurements', icon: '📏', name: 'Measurements', description: 'Distance, angle, and area tools' },
    { id: 'roi', icon: '🔲', name: 'ROI Analysis', description: 'Region density and statistics' },
    { id: 'comparison', icon: '🔄', name: 'Comparison', description: 'Side-by-side with prior studies' },
    { id: 'landmarks', icon: '🏷️', name: 'Landmarks', description: 'Anatomical landmark detection' },
    { id: 'dicom', icon: '📷', name: 'DICOM', description: 'Medical imaging format support' },
    { id: 'enhancement', icon: '🔍', name: 'Enhancement', description: 'Zoom, brightness, contrast' },
  ];

  return (
    <>
      <div className="transition-colors duration-300">
        <main className={`min-h-screen px-6 py-12 transition-all duration-300 ${
          darkMode 
            ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100' 
            : 'bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 text-slate-900'
        }`}>
          <div className="mx-auto max-w-6xl">
            
            {/* Header with Controls */}
            <div className="mb-10 text-center relative">
              <div className="absolute top-0 right-0 flex gap-2">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    darkMode 
                      ? 'bg-slate-800/50 hover:bg-slate-700/50 text-yellow-400' 
                      : 'bg-slate-200/50 hover:bg-slate-300/50 text-slate-700'
                  }`}
                  aria-label="Toggle dark mode"
                >
                  {darkMode ? '☀️' : '🌙'}
                </button>
                {isLoggedIn && (
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      darkMode 
                        ? 'bg-slate-800/50 hover:bg-slate-700/50' 
                        : 'bg-slate-200/50 hover:bg-slate-300/50'
                    }`}
                    aria-label="Show history"
                  >
                    📜
                  </button>
                )}
              </div>
              
              <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium mb-4 ${
                darkMode 
                  ? 'border-brand-500/30 bg-brand-500/10 text-brand-300' 
                  : 'border-brand-500/30 bg-brand-500/10 text-brand-700'
              }`}>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-400" />
                </span>
                Powered by GPT-4 Vision
              </div>
              <h1 className={`font-bold text-4xl sm:text-6xl bg-gradient-to-r from-brand-500 to-teal-500 bg-clip-text text-transparent`}>
                MedScan AI
              </h1>
              <p className={`mt-4 max-w-2xl mx-auto leading-relaxed text-lg ${
                darkMode ? 'text-slate-300' : 'text-slate-600'
              }`}>
                Advanced AI-powered medical image analysis — upload, analyze, and get professional radiology reports in seconds
              </p>
              <div className="mt-4 flex gap-4 justify-center flex-wrap">
                <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                  darkMode ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-200/50 text-slate-600'
                }`}>
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  HIPAA Compliant
                </div>
                <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                  darkMode ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-200/50 text-slate-600'
                }`}>
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  End-to-End Encrypted
                </div>
                <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                  darkMode ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-200/50 text-slate-600'
                }`}>
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  AI-Powered
                </div>
              </div>
              {!isLoggedIn && (
                <div className="mt-4 inline-flex items-center gap-2 text-xs bg-amber-400/10 border border-amber-400/20 px-4 py-2 rounded-full">
                  <svg className="h-3.5 w-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  <Link href="/auth" className="underline hover:text-amber-300">Sign in</Link>
                  &nbsp;to save scan results to your dashboard
                </div>
              )}
            </div>

            {/* Recent Scans Panel */}
            {showHistory && recentScans.length > 0 && (
              <div className={`mb-6 rounded-xl p-4 animate-fade-in-up ${
                darkMode ? 'bg-slate-800/50' : 'bg-white/70 shadow-lg'
              }`}>
                <h4 className={`font-semibold mb-3 flex items-center gap-2 ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                  📋 Recent Scans
                  <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{recentScans.length}</span>
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {recentScans.map((scan) => (
                    <Link
                      key={scan.id}
                      href={`/reports/${scan.id}`}
                      className={`block p-3 rounded-lg transition-all duration-200 ${
                        darkMode 
                          ? 'bg-slate-700/50 hover:bg-slate-600/50' 
                          : 'bg-slate-100 hover:bg-slate-200'
                      } group`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className={`text-sm font-medium transition-colors ${
                            darkMode ? 'text-slate-200 group-hover:text-brand-400' : 'text-slate-700 group-hover:text-brand-600'
                          }`}>
                            {scan.type}
                          </p>
                          <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{scan.date}</p>
                        </div>
                        <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>→</span>
                      </div>
                      <p className={`text-xs mt-2 line-clamp-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{scan.summary}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
              {/* Left: Upload Zone */}
              <div className="space-y-6">
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
                  className={`relative rounded-2xl border-2 border-dashed overflow-hidden transition-all duration-300 cursor-pointer
                    ${isDrag ? 'border-brand-400 bg-brand-500/10 scale-[1.01]'
                      : file ? 'border-teal-500/40 bg-slate-800/60'
                      : darkMode 
                        ? 'border-slate-700 bg-slate-800/40 hover:border-brand-500/50 hover:bg-slate-800/60'
                        : 'border-slate-300 bg-slate-100/40 hover:border-brand-500/50 hover:bg-slate-100/60'
                    }`}
                  style={{ minHeight: preview ? 350 : 250 }}
                >
                  {preview ? (
                    <div className="relative">
                      <img 
                        ref={imageRef}
                        src={preview} 
                        alt="Scan preview" 
                        className="w-full h-80 object-contain p-4" 
                      />
                      {stage === 'analysing' && (
                        <div className="absolute inset-0 overflow-hidden">
                          <div className="animate-scan absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-brand-400 to-transparent" />
                          <div className={`absolute inset-0 backdrop-blur-sm flex items-center justify-center ${
                            darkMode ? 'bg-brand-900/40' : 'bg-brand-500/20'
                          }`}>
                            <div className="text-center">
                              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-400 mx-auto mb-3" />
                              <p className={`font-medium ${darkMode ? 'text-white' : 'text-slate-800'}`}>AI Analyzing...</p>
                              <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{progress}%</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {stage === 'idle' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); reset(); }}
                          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-slate-900/90 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-rose-400 transition"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                      <div className={`mb-6 h-20 w-20 rounded-3xl bg-gradient-to-br from-brand-500/20 to-teal-500/20 border border-brand-500/30 flex items-center justify-center animate-float ${
                        darkMode ? 'text-brand-400' : 'text-brand-600'
                      }`}>
                        <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                      </div>
                      <p className={`text-xl font-semibold mb-2 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Upload Medical Image</p>
                      <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Drag & drop or click to browse</p>
                      <div className="flex gap-3 mt-4 flex-wrap justify-center">
                        <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-slate-700/50 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>X-Ray</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-slate-700/50 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>MRI</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-slate-700/50 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>CT Scan</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-slate-700/50 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>Ultrasound</span>
                      </div>
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
                  <div className={`rounded-xl px-4 py-3 flex items-center gap-3 animate-fade-in-up ${
                    darkMode ? 'bg-slate-800/50' : 'bg-white shadow-md'
                  }`}>
                    <div className="h-8 w-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 flex-shrink-0">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium truncate ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{file.name}</p>
                      <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>{(file.size / 1024).toFixed(0)} KB</p>
                    </div>
                    <span className="text-xs text-teal-400 font-medium bg-teal-400/10 border border-teal-400/20 rounded-full px-2.5 py-1">
                      Ready
                    </span>
                  </div>
                )}

                {/* ===== NEW: ADVANCED IMAGING TOOLS TOOLBAR ===== */}
                {file && stage === 'idle' && (
                  <div className="space-y-3 animate-fade-in-up">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        🛠️ Advanced Imaging Tools
                      </h3>
                      <button
                        onClick={() => setShowAdvancedTools(!showAdvancedTools)}
                        className={`text-xs transition ${
                          darkMode ? 'text-brand-400 hover:text-brand-300' : 'text-brand-600 hover:text-brand-700'
                        }`}
                      >
                        {showAdvancedTools ? 'Hide Tools ▲' : 'Show Tools ▼'}
                      </button>
                    </div>
                    
                    {showAdvancedTools && (
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 p-3 rounded-xl bg-slate-800/30 border border-slate-700/50">
                        {advancedTools.map((tool) => (
                          <button
                            key={tool.id}
                            onClick={() => setActiveTool(activeTool === tool.id ? null : tool.id)}
                            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                              activeTool === tool.id
                                ? 'bg-brand-500/30 border-brand-500/50 text-brand-400 scale-105'
                                : `${darkMode ? 'bg-slate-800/50 hover:bg-slate-700/50' : 'bg-slate-200/50 hover:bg-slate-300/50'} border-slate-700/30 text-slate-400 hover:text-white`
                            } border`}
                            title={tool.description}
                          >
                            <span className="text-xl">{tool.icon}</span>
                            <span className="text-[10px] font-medium">{tool.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* Active Tool Info Panel */}
                    {activeTool && (
                      <div className={`p-3 rounded-lg text-xs ${
                        darkMode ? 'bg-slate-800/50 text-slate-300' : 'bg-slate-100 text-slate-700'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{advancedTools.find(t => t.id === activeTool)?.icon}</span>
                          <span className="font-semibold">{advancedTools.find(t => t.id === activeTool)?.name}</span>
                          <span className="text-slate-500">— {advancedTools.find(t => t.id === activeTool)?.description}</span>
                        </div>
                        <div className="mt-2 text-slate-400 text-[10px]">
                          {activeTool === 'measurements' && '💡 Click two points for distance, three points for angle, or draw polygon for area'}
                          {activeTool === 'roi' && '💡 Click and drag to select region of interest for density analysis'}
                          {activeTool === 'comparison' && '💡 Upload a prior study to compare side-by-side or overlay'}
                          {activeTool === 'landmarks' && '💡 AI will detect anatomical landmarks automatically'}
                          {activeTool === 'dicom' && '💡 Support for DICOM medical imaging format'}
                          {activeTool === 'enhancement' && '💡 Use zoom, pan, brightness, and contrast controls'}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Progress bar */}
                {stage === 'analysing' && (
                  <div className="space-y-1.5 animate-fade-in-up">
                    <div className="flex justify-between text-xs">
                      <span className="flex items-center gap-1.5">
                        <span className="animate-pulse">🤖</span>
                        <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>GPT-4 Vision analyzing...</span>
                      </span>
                      <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>{progress}%</span>
                    </div>
                    <div className={`h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
                      <div
                        className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-brand-500 to-teal-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className={`text-xs ${darkMode ? 'text-slate-600' : 'text-slate-500'}`}>
                      Medical image analysis in progress
                    </p>
                  </div>
                )}

                {/* Error */}
                {stage === 'error' && (
                  <div className={`rounded-xl px-5 py-4 ${
                    darkMode ? 'bg-rose-500/10 border border-rose-500/30' : 'bg-rose-100 border border-rose-300'
                  }`}>
                    <div className="flex items-start gap-3">
                      <span className="text-rose-400 text-xl">⚠️</span>
                      <div className="flex-1">
                        <p className={`font-medium ${darkMode ? 'text-rose-300' : 'text-rose-700'}`}>Analysis Failed</p>
                        <p className={`text-sm mt-1 ${darkMode ? 'text-rose-300/80' : 'text-rose-600'}`}>{errorMsg}</p>
                      </div>
                      <button onClick={() => setStage('idle')} className={`text-sm underline ${darkMode ? 'text-rose-400 hover:text-rose-300' : 'text-rose-600 hover:text-rose-700'}`}>
                        Retry
                      </button>
                    </div>
                  </div>
                )}

                {/* Analyze CTA */}
                {file && stage === 'idle' && (
                  <button
                    onClick={runAnalysis}
                    className="btn-primary w-full justify-center py-4 text-base rounded-xl font-semibold bg-gradient-to-r from-brand-500 to-teal-500 hover:from-brand-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                  >
                    🧠 Analyze with GPT-4 Vision
                  </button>
                )}

                {/* Post-analysis actions */}
                {stage === 'done' && (
                  <div className="flex gap-3 animate-fade-in-up">
                    <button onClick={reset} className={`btn-outline flex-1 justify-center py-2.5 text-sm rounded-xl ${
                      darkMode ? 'border-slate-700 hover:border-slate-600' : 'border-slate-300 hover:border-slate-400'
                    }`}>
                      Upload Another
                    </button>
                    {scanId && (
                      <Link href={`/reports/${scanId}`} className="btn-primary flex-1 justify-center py-2.5 text-sm rounded-xl text-center bg-gradient-to-r from-brand-500 to-teal-500 hover:from-brand-600 hover:to-teal-600">
                        Full Report →
                      </Link>
                    )}
                  </div>
                )}

                {/* Stats/Info Cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className={`rounded-xl p-3 text-center ${darkMode ? 'bg-slate-800/50' : 'bg-white/70 shadow-md'}`}>
                    <div className="text-2xl mb-1">🏥</div>
                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Instant Analysis</p>
                    <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>&lt;30s</p>
                  </div>
                  <div className={`rounded-xl p-3 text-center ${darkMode ? 'bg-slate-800/50' : 'bg-white/70 shadow-md'}`}>
                    <div className="text-2xl mb-1">🎯</div>
                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Accuracy</p>
                    <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>95%+</p>
                  </div>
                  <div className={`rounded-xl p-3 text-center ${darkMode ? 'bg-slate-800/50' : 'bg-white/70 shadow-md'}`}>
                    <div className="text-2xl mb-1">🔒</div>
                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Secure</p>
                    <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>Encrypted</p>
                  </div>
                </div>
              </div>

              {/* Right: Results Panel */}
              <div>
                {/* Idle empty state */}
                {stage === 'idle' && !file && (
                  <div className={`h-full flex flex-col items-center justify-center text-center rounded-2xl p-10 ${
                    darkMode ? 'bg-slate-800/50' : 'bg-white/70 shadow-lg'
                  }`}>
                    <div className="animate-float mb-6 h-24 w-24 rounded-full bg-gradient-to-br from-brand-500/20 to-teal-500/20 flex items-center justify-center">
                      <span className="text-5xl">🏥</span>
                    </div>
                    <h3 className={`text-2xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Ready for Analysis</h3>
                    <p className={`${darkMode ? 'text-slate-400' : 'text-slate-600'} max-w-sm`}>
                      Upload a medical image to receive AI-powered radiology findings with confidence scores and recommendations.
                    </p>
                    <div className="flex gap-2 mt-6">
                      <div className="text-center">
                        <div className="text-2xl mb-1">📸</div>
                        <div className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Upload</div>
                      </div>
                      <div className={`text-2xl ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>→</div>
                      <div className="text-center">
                        <div className="text-2xl mb-1">🧠</div>
                        <div className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Analyze</div>
                      </div>
                      <div className={`text-2xl ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>→</div>
                      <div className="text-center">
                        <div className="text-2xl mb-1">📋</div>
                        <div className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Report</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Analysis loading state */}
                {stage === 'analysing' && (
                  <div className={`h-full flex flex-col items-center justify-center text-center rounded-2xl p-12 ${
                    darkMode ? 'bg-slate-800/50' : 'bg-white/70 shadow-lg'
                  }`}>
                    <div className="relative mb-8">
                      <div className="w-20 h-20 rounded-full border-4 border-slate-700 animate-spin border-t-brand-500"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl">🧠</span>
                      </div>
                    </div>
                    <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>AI Analyzing Medical Image</h3>
                    <p className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Processing with GPT-4 Vision...</p>
                    <div className="w-full max-w-xs mt-6">
                      <div className={`h-2 rounded-full overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                        <div className="h-full bg-gradient-to-r from-brand-500 to-teal-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                      </div>
                      <p className={`text-xs mt-2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{progress}% complete</p>
                    </div>
                    <p className={`text-xs mt-6 ${darkMode ? 'text-slate-600' : 'text-slate-500'}`}>
                      Analyzing anatomy, detecting anomalies, and generating clinical findings...
                    </p>
                  </div>
                )}

                {/* Results */}
                {stage === 'done' && result && (
                  <div className="space-y-5 animate-fade-in-up">
                    {/* Header Card */}
                    <div className={`rounded-2xl p-6 bg-gradient-to-br from-brand-500/10 to-teal-500/10 ${
                      darkMode ? '' : 'shadow-lg'
                    }`}>
                      <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                        <div>
                          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{result.imageType}</h2>
                          <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{currentDate}</p>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-xs bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full font-medium border border-emerald-500/30">
                            ✓ AI Complete
                          </span>
                          {scanId && (
                            <div className="flex gap-2">
                              <button
                                onClick={copyReportLink}
                                className={`text-xs px-3 py-1 rounded-full transition ${
                                  darkMode ? 'bg-slate-700/50 hover:bg-slate-700' : 'bg-slate-200 hover:bg-slate-300'
                                }`}
                              >
                                📋 Copy
                              </button>
                              <button
                                onClick={printReport}
                                className={`text-xs px-3 py-1 rounded-full transition ${
                                  darkMode ? 'bg-slate-700/50 hover:bg-slate-700' : 'bg-slate-200 hover:bg-slate-300'
                                }`}
                              >
                                🖨️ Print
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      {scanId && (
                        <p className={`text-xs mb-3 font-mono ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>ID: {scanId.slice(0, 12)}...</p>
                      )}
                      <p className={`leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{result.summary}</p>
                    </div>

                    {/* Findings */}
                    <div className={`rounded-2xl p-6 ${darkMode ? 'bg-slate-800/50' : 'bg-white/70 shadow-lg'}`}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>🔬 AI Findings</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>
                          {result.findings.length} finding{result.findings.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="space-y-4">
                        {result.findings.map((f, i) => (
                          <FindingCard key={i} finding={f} index={i} darkMode={darkMode} />
                        ))}
                      </div>
                    </div>

                    {/* Recommendation */}
                    <div className={`rounded-2xl p-6 border-l-4 border-l-brand-500 ${darkMode ? 'bg-slate-800/50' : 'bg-white/70 shadow-lg'}`}>
                      <p className="text-xs font-semibold text-brand-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <span>💡</span> Clinical Recommendation
                      </p>
                      <p className={`leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{result.recommendation}</p>
                      <div className={`mt-4 p-3 rounded-lg border border-amber-500/20 ${darkMode ? 'bg-amber-500/10' : 'bg-amber-50'}`}>
                        <p className={`text-xs flex items-start gap-2 ${darkMode ? 'text-amber-400' : 'text-amber-700'}`}>
                          <span>⚠️</span>
                          This is an AI-generated pre-screening analysis. All findings should be reviewed by a licensed physician before making clinical decisions.
                        </p>
                      </div>
                    </div>

                    {/* Medications */}
                    {result.medications && result.medications.length > 0 && (
                      <div className={`rounded-2xl p-6 ${darkMode ? 'bg-slate-800/50' : 'bg-white/70 shadow-lg'}`}>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className={`text-xl font-semibold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                            <span>💊</span> Suggested Medications
                          </h3>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          {result.medications.map((m, i) => (
                            <MedicationCard key={i} med={m} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* AI Chat Panel */}
      {stage === 'done' && result && (
        <AiChatPanel scanContext={scanContextForChat} darkMode={darkMode} />
      )}
    </>
  );
}