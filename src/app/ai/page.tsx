'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import TaskCard from '@/components/TaskCard';
import { ToastProvider } from '@/context/ToastContext';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Loader from '@/components/Loader';
import { PixelCatType, PixelCatIdle, PawPrint } from '@/components/pixel-cats';
import { Send, Trash2, Mic, MicOff } from 'lucide-react';

interface ChatMessage {
  type: 'user' | 'ai';
  text: string;
  tasks?: Array<{ id: number; title: string; description: string; dueDate: string; priority: 'LOW' | 'MEDIUM' | 'HIGH'; status: 'TO_DO' | 'IN_PROGRESS' | 'DONE' }>;
}

// TODO: ChatPage component

const ChatPage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [sending, setSending] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // TODO: effects

  // Load persisted messages
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const stored = localStorage.getItem('chatMessages_' + token);
      if (stored) setMessages(JSON.parse(stored));
    }
  }, []);

  // Persist messages
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      localStorage.setItem('chatMessages_' + token, JSON.stringify(messages));
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Validate session
  useEffect(() => {
    const validate = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) { router.push('/'); return; }
        const res = await fetch('/api/session', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) { setUserId(data.user.id); setIsValid(true); }
        else router.push('/');
      } catch { router.push('/'); }
    };
    validate();
  }, [router]);
  // TODO: sendMessage

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const userMsg: ChatMessage = { type: 'user', text: input };
    const updated = [...messages, userMsg];
    setInput('');
    setMessages(updated);
    setSending(true);
    const history = updated.map((m) => (m.type === 'user' ? 'User' : 'AI') + ': ' + m.text);
    try {
      const res = await fetch('/api/ai/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input, userId, conversationHistory: history }),
      });
      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) => [...prev, { type: 'ai', text: data.message, tasks: data.tasks || [] }]);
      }
    } catch { console.error('AI request failed.'); }
    finally { setSending(false); }
  };
  // TODO: voice

  const toggleVoice = () => {
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { alert('Voice not supported in this browser.'); return; }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? prev + ' ' : '') + transcript);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.3;
    window.speechSynthesis.speak(utterance);
  };
  // TODO: handlers

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const clearChat = () => {
    setMessages([]);
    const token = localStorage.getItem('authToken');
    if (token) localStorage.removeItem('chatMessages_' + token);
  };

  const handleTaskDelete = (taskId: number) => {
    setMessages((prev) => prev.map((m) => m.tasks ? { ...m, tasks: m.tasks.filter((t) => t.id !== taskId) } : m));
  };

  const handleTaskUpdate = (taskId: number, fields: Record<string, unknown>) => {
    setMessages((prev) => prev.map((m) => m.tasks ? { ...m, tasks: m.tasks.map((t) => t.id === taskId ? { ...t, ...fields } : t) } : m));
  };
  // TODO: render

  if (!isValid) return <Loader />;

  return (
    <DndProvider backend={HTML5Backend}>
      <ToastProvider>
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-3 sm:p-4" style={{ backgroundColor: 'var(--background)' }} data-page="ai-chat">
          <div className="w-full max-w-2xl card-cozy flex flex-col" style={{ height: 'calc(100vh - 88px)' }}>
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b-2 border-[var(--border)]">
              <div className="cat-wiggle"><PixelCatType size={28} /></div>
              <div className="flex-1">
                <h2 className="text-sm font-extrabold text-[var(--text)]">Chat with MingMing</h2>
                <p className="text-xs text-[var(--text-muted)] font-semibold">Type or use voice &mdash; I&apos;m all ears!</p>
              </div>
              <button onClick={clearChat} className="text-xs text-[var(--text-muted)] hover:text-[var(--danger)] flex items-center gap-1 transition-colors font-bold" data-action="clear-chat">
                <Trash2 size={14} /> Clear
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3" data-region="chat-messages">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="cat-bounce mb-3"><PixelCatIdle size={56} /></div>
                  <p className="text-[var(--text)] text-sm font-bold mb-1">Meow! I&apos;m ready to help!</p>
                  <p className="text-[var(--text-muted)] text-xs font-semibold max-w-xs">
                    Ask me to create tasks, check deadlines, or just chat.<br />
                    Try: &quot;Add a task to buy cat food by Friday&quot;
                  </p>
                  <div className="flex gap-1 mt-3">
                    <PawPrint size={10} className="text-[var(--paw-pink)] opacity-40" />
                    <PawPrint size={10} className="text-[var(--paw-pink)] opacity-60" />
                    <PawPrint size={10} className="text-[var(--paw-pink)] opacity-80" />
                  </div>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex items-start gap-2 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.type === 'ai' && <div className="shrink-0 mt-1"><PixelCatIdle size={24} /></div>}
                  <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm font-semibold ${
                    msg.type === 'user'
                      ? 'bg-[var(--primary)] text-white rounded-br-sm shadow-card'
                      : 'bg-[var(--surface-alt)] text-[var(--text)] rounded-bl-sm border-2 border-[var(--border)]'
                  }`}>
                    <span className="whitespace-pre-wrap break-words">{msg.text}</span>
                    {msg.type === 'ai' && (
                      <button onClick={() => speakText(msg.text)} className="ml-2 text-xs opacity-50 hover:opacity-100" title="Listen">🔊</button>
                    )}
                    {msg.tasks && msg.tasks.length > 0 && (
                      <div className="grid grid-cols-1 gap-2 mt-3">
                        {msg.tasks.map((task) => (
                          <TaskCard key={task.id} {...task} onDelete={handleTaskDelete} onStatusChange={(id, s) => handleTaskUpdate(id, { status: s })} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex items-center gap-2">
                  <div className="cat-type"><PixelCatType size={24} /></div>
                  <span className="text-xs text-[var(--text-muted)] font-bold">MingMing is typing...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            {/* Input + Voice */}
            <div className="border-t-2 border-[var(--border)] p-3" data-region="chat-input">
              <div className="flex gap-2 items-end">
                <button onClick={toggleVoice} className={`p-2.5 rounded-xl border-2 transition-all font-bold ${
                  listening
                    ? 'bg-[var(--danger)] text-white border-[var(--danger)] animate-pulse'
                    : 'bg-[var(--surface-alt)] text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--primary)] hover:border-[var(--primary)]'
                }`} title={listening ? 'Stop listening' : 'Voice input'} data-action="toggle-voice">
                  {listening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
                <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} rows={2}
                  placeholder={listening ? 'Listening... speak now!' : 'Tell MingMing something...'}
                  className="flex-1 px-3 py-2.5 text-sm rounded-xl border-2 border-[var(--border)] bg-[var(--card-bg)] text-[var(--text)] focus:outline-none focus:border-[var(--primary)] resize-none font-semibold placeholder:font-normal"
                  data-input="chat-message" />
                <button onClick={sendMessage} disabled={sending || !input.trim()} className="btn-yarn self-end flex items-center gap-1.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed" data-action="send-message">
                  <Send size={14} /> {sending ? '...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </ToastProvider>
    </DndProvider>
  );
};

export default ChatPage;