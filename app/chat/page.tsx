'use client';

import React, { useState, useEffect, useRef } from 'react';
import { auth } from '../../lib/firebase';
import {
  Conversation, ChatMessage, ChatParticipant,
  subscribeToConversations, subscribeToMessages,
  sendMessage, createConversation, markAsRead, getAvailableDoctors
} from '../../lib/firebaseChat';
import { Timestamp } from 'firebase/firestore';
import { WebcamCapture } from '../../components/WebcamCapture';

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [doctors, setDoctors] = useState<ChatParticipant[]>([]);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUserUid = auth.currentUser?.uid;

  useEffect(() => {
    const { onAuthStateChanged } = require('firebase/auth');
    const unsub = onAuthStateChanged(auth, (u: any) => {
      setIsLoggedIn(!!u);
      if (u) {
        getAvailableDoctors().then(setDoctors);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    const unsub = subscribeToConversations(setConversations);
    return () => unsub();
  }, [isLoggedIn]);

  useEffect(() => {
    if (!activeConvId) {
      setMessages([]);
      return;
    }
    const unsub = subscribeToMessages(activeConvId, setMessages);
    markAsRead(activeConvId);
    return () => unsub();
  }, [activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeConvId) return;
    const text = input.trim();
    setInput('');
    await sendMessage(activeConvId, text, 'text');
  };

  const startConversation = async (doctor: ChatParticipant) => {
    const convId = await createConversation(doctor);
    setActiveConvId(convId);
    setShowDoctorModal(false);
  };

  const formatTime = (ts: Timestamp | null) => {
    if (!ts) return '';
    return new Date(ts.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="text-center">
          <div className="text-4xl mb-4">💬</div>
          <h1 className="text-2xl font-bold mb-2">Medical Chat</h1>
          <p className="text-slate-400">Please sign in to access the chat platform.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-[72px] bg-slate-950 text-slate-100 flex">
      <div className="max-w-7xl mx-auto w-full h-[calc(100vh-72px)] flex bg-slate-900/50 border-x border-slate-800">
        
        {/* Sidebar */}
        <div className="w-80 border-r border-slate-800 flex flex-col bg-slate-900/80">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Messages</h2>
            <button 
              onClick={() => setShowDoctorModal(true)}
              className="p-2 rounded-full bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition"
              title="New Chat"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">
                No conversations yet. Start a chat with a doctor.
              </div>
            ) : (
              conversations.map(conv => {
                const otherUid = conv.participants.find(p => p !== currentUserUid);
                const otherUser = otherUid ? conv.participantInfo[otherUid] : null;
                const unread = currentUserUid ? conv.unreadCount[currentUserUid] || 0 : 0;
                
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id || null)}
                    className={`w-full text-left p-4 border-b border-slate-800/50 hover:bg-slate-800/50 transition flex items-center gap-3 ${activeConvId === conv.id ? 'bg-slate-800/80 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'}`}
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-lg font-bold flex-shrink-0">
                      {otherUser?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-medium text-slate-200 truncate">{otherUser?.name || 'Unknown'}</h3>
                        <span className="text-[10px] text-slate-500">{formatTime(conv.lastMessageTime)}</span>
                      </div>
                      <p className={`text-sm truncate ${unread > 0 ? 'text-white font-medium' : 'text-slate-400'}`}>
                        {conv.lastMessage}
                      </p>
                    </div>
                    {unread > 0 && (
                      <div className="w-5 h-5 rounded-full bg-blue-500 text-[10px] flex items-center justify-center font-bold text-white">
                        {unread}
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-[#0b1120]">
          {activeConvId ? (
            <>
              {/* Chat Header */}
              <div className="h-16 border-b border-slate-800 flex items-center px-6 bg-slate-900/80 backdrop-blur-sm z-10 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-lg font-bold">
                    {conversations.find(c => c.id === activeConvId)?.participants.find(p => p !== currentUserUid)?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-200">
                      {conversations.find(c => c.id === activeConvId)?.participantInfo[
                        conversations.find(c => c.id === activeConvId)?.participants.find(p => p !== currentUserUid) || ''
                      ]?.name || 'Doctor'}
                    </h2>
                    <p className="text-xs text-emerald-400">Online</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg, i) => {
                  const isMe = msg.senderId === currentUserUid;
                  return (
                    <div key={msg.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] ${isMe ? 'chat-bubble-sent' : 'chat-bubble-received'}`}>
                        <div className="text-[10px] font-medium mb-1 opacity-60">
                          {isMe ? 'You' : msg.senderName} • {formatTime(msg.createdAt)}
                        </div>
                        {msg.type === 'text' && <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>}
                        {msg.type === 'image' && msg.imageUrl && (
                          <div className="mt-1">
                            <img src={msg.imageUrl} alt="Shared Image" className="max-w-[200px] rounded-lg border border-white/10" />
                          </div>
                        )}
                        {msg.type === 'scan-share' && (
                          <div className="bg-white/10 rounded-lg p-3 mt-1 border border-white/20">
                            <span className="text-xl">📋</span>
                            <span className="ml-2 font-medium">Shared Scan Report</span>
                            <a href={`/reports/${msg.scanId}`} className="block mt-2 text-xs underline hover:text-white transition">View Report</a>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-slate-900/80 border-t border-slate-800">
                <form onSubmit={handleSend} className="flex gap-2 relative">
                  <button type="button" onClick={() => setShowWebcam(true)} className="p-3 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition" title="Take Photo">
                    📷
                  </button>
                  <button type="button" className="p-3 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition" title="Attach File">
                    📎
                  </button>
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-slate-800 border-none rounded-xl px-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-200"
                  />
                  <button 
                    type="submit"
                    disabled={!input.trim()}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-medium rounded-xl transition flex items-center gap-2"
                  >
                    <span>Send</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
              <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center text-4xl mb-4 border border-slate-800">
                💬
              </div>
              <h2 className="text-xl font-medium text-slate-300">Your Messages</h2>
              <p className="mt-2 text-sm max-w-xs text-center">Select a conversation from the sidebar or start a new one to connect with a healthcare professional.</p>
            </div>
          )}
        </div>
      </div>

      {/* New Doctor Modal */}
      {showDoctorModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-semibold text-lg">Start New Chat</h3>
              <button onClick={() => setShowDoctorModal(false)} className="text-slate-400 hover:text-white p-1">✕</button>
            </div>
            <div className="p-2 max-h-96 overflow-y-auto">
              {doctors.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No doctors currently available.
                </div>
              ) : (
                doctors.map(doc => (
                  <button 
                    key={doc.uid}
                    onClick={() => startConversation(doc)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-slate-800 rounded-xl transition text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold">
                      {doc.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-200">{doc.name}</h4>
                      <p className="text-xs text-slate-500 capitalize">{doc.role}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Webcam Modal */}
      {showWebcam && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-3xl relative">
            <WebcamCapture 
              onCapture={(file) => {
                setShowWebcam(false);
                const img = new Image();
                img.onload = () => {
                  const canvas = document.createElement('canvas');
                  const MAX_WIDTH = 800;
                  const scaleSize = MAX_WIDTH / img.width;
                  canvas.width = MAX_WIDTH;
                  canvas.height = img.height * scaleSize;
                  const ctx = canvas.getContext('2d');
                  ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
                  const resizedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                  if (activeConvId) {
                    sendMessage(activeConvId, '', 'image', { imageUrl: resizedBase64 });
                  }
                };
                img.src = URL.createObjectURL(file);
              }}
              onCancel={() => setShowWebcam(false)}
            />
          </div>
        </div>
      )}
    </main>
  );
}
