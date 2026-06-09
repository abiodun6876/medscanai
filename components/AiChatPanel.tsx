'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role:    'user' | 'ai';
  content: string;
}

interface AiChatPanelProps {
  scanContext: string; // stringified scan summary + findings
}

export function AiChatPanel({ scanContext }: AiChatPanelProps) {
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role:    'ai',
      content: 'Hi! I\'m MedScan AI. Ask me anything about this scan report — I\'ll explain findings in plain language. ⚠ Remember: always consult your physician for clinical decisions.',
    },
  ]);
  const [input,    setInput]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = async () => {
    const q = input.trim();
    if (!q || loading) return;

    setMessages((m) => [...m, { role: 'user', content: q }]);
    setInput('');
    setLoading(true);

    try {
      const res  = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ question: q, context: scanContext }),
      });
      const data = await res.json() as { answer: string };
      setMessages((m) => [...m, { role: 'ai', content: data.answer }]);
    } catch {
      setMessages((m) => [...m, {
        role:    'ai',
        content: 'Sorry, I couldn\'t connect to the AI. Please try again.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const suggestions = [
    'What does this finding mean?',
    'Is this serious?',
    'What should I do next?',
    'Explain in simple terms',
  ];

  return (
    <>
      {/* Floating chat button */}
      <button
        onClick={() => setOpen(!open)}
        id="ai-chat-toggle"
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-2xl bg-gradient-to-br from-brand-500 to-teal-500 shadow-lg shadow-brand-500/30 flex items-center justify-center text-white transition-all hover:scale-105 hover:shadow-brand-500/50 hover:shadow-xl"
        aria-label="Open AI Chat"
      >
        {open ? (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
          </svg>
        )}
        {/* Pulse indicator */}
        {!open && (
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-teal-400">
            <span className="absolute inset-0 h-3 w-3 rounded-full bg-teal-400 animate-ping opacity-75" />
          </span>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 rounded-2xl glass border border-slate-700/60 shadow-2xl shadow-black/40 flex flex-col overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800/60 bg-slate-900/80">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-brand-500 to-teal-500 flex items-center justify-center flex-shrink-0">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">MedScan AI Assistant</p>
              <p className="text-xs text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
                Online · Powered by Claude AI
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-72">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-brand-500 text-white rounded-tr-sm'
                    : 'bg-slate-800/80 border border-slate-700/60 text-slate-300 rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-bounce [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-bounce [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-bounce" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions (show only on first message) */}
          {messages.length === 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => { setInput(s); }}
                  className="text-xs px-2.5 py-1 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-300 hover:bg-brand-500/20 transition"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-3 border-t border-slate-800/60">
            <div className="flex items-center gap-2 rounded-xl bg-slate-900/80 border border-slate-700/60 px-3 py-2">
              <input
                id="ai-chat-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask about your scan…"
                className="flex-1 bg-transparent text-xs text-slate-200 placeholder-slate-600 outline-none"
                disabled={loading}
              />
              <button
                onClick={send}
                disabled={!input.trim() || loading}
                id="ai-chat-send"
                className="h-7 w-7 rounded-lg bg-brand-500 flex items-center justify-center text-white disabled:opacity-40 hover:bg-brand-400 transition flex-shrink-0"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
