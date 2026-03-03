'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import TaskCard from '@/components/TaskCard';
import { ToastProvider } from '@/context/ToastContext';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Loader from '@/components/Loader';
import { Send, Trash2, Cat } from 'lucide-react';

interface ChatMessage {
  type: 'user' | 'ai';
  text: string;
  tasks?: Array<{ id: number; title: string; description: string; dueDate: string; priority: 'LOW' | 'MEDIUM' | 'HIGH'; status: 'TO_DO' | 'IN_PROGRESS' | 'DONE' }>;
}

const ChatPage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [sending, setSending] = useState(false);
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load persisted messages
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const stored = localStorage.getItem(`chatMessages_${token}`);
      if (stored) setMessages(JSON.parse(stored));
    }
  }, []);

  // Persist messages
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      localStorage.setItem(`chatMessages_${token}`, JSON.stringify(messages));
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

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const userMsg: ChatMessage = { type: 'user', text: input };
    const updated = [...messages, userMsg];
    setInput('');
    setMessages(updated);
    setSending(true);

    const history = updated.map((m) => `${m.type === 'user' ? 'User' : 'AI'}: ${m.text}`);
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const clearChat = () => {
    setMessages([]);
    const token = localStorage.getItem('authToken');
    if (token) localStorage.removeItem(`chatMessages_${token}`);
  };

  const handleTaskDelete = (taskId: number) => {
    setMessages((prev) => prev.map((m) => m.tasks ? { ...m, tasks: m.tasks.filter((t) => t.id !== taskId) } : m));
  };

  const handleTaskUpdate = (taskId: number, fields: Record<string, unknown>) => {
    setMessages((prev) => prev.map((m) => m.tasks ? { ...m, tasks: m.tasks.map((t) => t.id === taskId ? { ...t, ...fields } : t) } : m));
  };

  if (!isValid) return <Loader />;

  return (
    <DndProvider backend={HTML5Backend}>
      <ToastProvider>
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-[var(--surface)] p-4" data-page="ai-chat">
          <div className="w-full max-w-3xl bg-white rounded-xl border border-[var(--border)] shadow-card flex flex-col" style={{ height: 'calc(100vh - 100px)' }}>
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)]">
              <Cat size={20} className="text-primary" />
              <div>
                <h2 className="text-sm font-semibold text-[var(--text)]">MingMing AI</h2>
                <p className="text-xs text-[var(--text-muted)]">Your AI-powered task assistant</p>
              </div>
              <button onClick={clearChat} className="ml-auto text-xs text-[var(--text-muted)] hover:text-red-500 flex items-center gap-1 transition-colors" data-action="clear-chat">
                <Trash2 size={14} /> Clear
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin" data-region="chat-messages">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Cat size={48} className="text-primary/30 mb-3" />
                  <p className="text-[var(--text-muted)] text-sm">Start a conversation with MingMing!</p>
                  <p className="text-[var(--text-muted)] text-xs mt-1">Ask about your tasks, get suggestions, or just say hi.</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex items-start gap-2 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.type === 'ai' && (
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Cat size={16} className="text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm ${
                    msg.type === 'user'
                      ? 'bg-primary text-white rounded-br-sm'
                      : 'bg-gray-100 text-[var(--text)] rounded-bl-sm'
                  }`}>
                    <span className="whitespace-pre-wrap break-words">{msg.text}</span>
                    {msg.tasks && msg.tasks.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 bg-white rounded-lg p-2">
                        {msg.tasks.map((task) => (
                          <TaskCard
                            key={task.id}
                            {...task}
                            onDelete={handleTaskDelete}
                            onStatusChange={(id, s) => handleTaskUpdate(id, { status: s })}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-[var(--border)] p-3" data-region="chat-input">
              <div className="flex gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={2}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-white text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  data-input="chat-message"
                />
                <button
                  onClick={sendMessage}
                  disabled={sending || !input.trim()}
                  className="self-end px-4 py-2 bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-1.5 text-sm font-medium"
                  data-action="send-message"
                >
                  <Send size={16} /> {sending ? '...' : 'Send'}
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
