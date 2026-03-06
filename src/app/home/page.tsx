'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PixelCatIdle, PixelCatHappy, PixelCatType, PawPrint } from '@/components/pixel-cats';
import { useSpeech } from '@/hooks/useSpeech';
import { useProactive } from '@/hooks/useProactive';
import { requestNotificationPermission } from '@/lib/platform';
import { Send, Volume2, VolumeX, Bell, ChevronRight } from 'lucide-react';

interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'TO_DO' | 'IN_PROGRESS' | 'DONE';
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

// TODO: HomePage component
export default function HomePage() {
  const router = useRouter();
  const { muted, toggleMute, say, supported: speechSupported } = useSpeech();
  const [user, setUser] = useState<{ username: string; id: number } | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch user and tasks
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) { router.push('/login'); return; }
      try {
        const userRes = await fetch('/api/session', { headers: { Authorization: `Bearer ${token}` } });
        if (!userRes.ok) { localStorage.removeItem('authToken'); router.push('/'); return; }
        const userData = await userRes.json();
        setUser(userData.user);

        const tasksRes = await fetch(`/api/tasks?userId=${userData.user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (tasksRes.ok) {
          const tasksData = await tasksRes.json();
          setTasks(tasksData.tasks || []);
        }

        // Request notification permission
        await requestNotificationPermission();
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  // Proactive check-ins
  const handleCheckIn = useCallback((checkIn: { message: string }) => {
    setMessages((prev) => [
      ...prev,
      { role: 'system', content: checkIn.message, timestamp: new Date() },
    ]);
  }, []);

  useProactive(tasks, handleCheckIn);

  // TODO: sendMessage function
  const sendMessage = useCallback(async () => {
    if (!input.trim() || sending || !user) return;
    const userMsg: ChatMessage = { role: 'user', content: input.trim(), timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const token = localStorage.getItem('authToken');
      const conversationHistory = messages.slice(-10).map((m) => ({
        role: m.role === 'system' ? 'assistant' : m.role,
        content: m.content,
      }));
      conversationHistory.push({ role: 'user', content: userMsg.content });

      const res = await fetch('/api/ai/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ prompt: userMsg.content, userId: user.id, conversationHistory }),
      });

      if (!res.ok) throw new Error('AI request failed');
      const data = await res.json();

      let aiText = data.message || 'Meow... I had trouble thinking. Try again?';

      // If AI returned task actions, refresh tasks
      if (data.tasks || data.intent === 'CREATE_TASK' || data.intent === 'DELETE_TASK') {
        const tasksRes = await fetch(`/api/tasks?userId=${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (tasksRes.ok) {
          const tasksData = await tasksRes.json();
          setTasks(tasksData.tasks || []);
        }
      }

      const aiMsg: ChatMessage = { role: 'assistant', content: aiText, timestamp: new Date() };
      setMessages((prev) => [...prev, aiMsg]);

      // Speak the response
      say(aiText);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Mrrow... something went wrong. Let me stretch and try again.', timestamp: new Date() },
      ]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }, [input, sending, user, messages, say]);

  const activeTasks = tasks.filter((t) => t.status !== 'DONE');
  const todayStr = new Date().toISOString().split('T')[0];
  const dueToday = activeTasks.filter((t) => t.dueDate.split('T')[0] === todayStr);
  const overdue = activeTasks.filter((t) => t.dueDate.split('T')[0] < todayStr);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center" data-page="home">
        <div className="text-center">
          <div className="cat-bounce inline-block mb-3"><PixelCatIdle size={48} /></div>
          <p className="text-sm font-bold text-[var(--text-muted)]">MingMing is stretching...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex" data-page="home">
      {/* Sidebar — Today's Overview */}
      <aside className="hidden lg:flex flex-col w-72 border-r-2 border-[var(--border)] bg-[var(--card-bg)] p-4 overflow-y-auto">
        <div className="flex items-center gap-2 mb-4">
          <PawPrint size={16} className="text-[var(--paw-pink)]" />
          <h2 className="text-sm font-extrabold text-[var(--text)]">Today</h2>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="card-cozy p-2 text-center">
            <span className="text-lg font-extrabold text-amber-500">{activeTasks.length}</span>
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Active</p>
          </div>
          <div className="card-cozy p-2 text-center">
            <span className="text-lg font-extrabold text-emerald-500">{tasks.filter((t) => t.status === 'DONE').length}</span>
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Done</p>
          </div>
        </div>

        {/* Overdue */}
        {overdue.length > 0 && (
          <div className="mb-4">
            <h3 className="text-xs font-extrabold text-red-500 uppercase mb-2">Overdue</h3>
            {overdue.map((t) => (
              <div key={t.id} className="card-cozy p-2 mb-1 border-l-4 border-red-400">
                <p className="text-xs font-bold text-[var(--text)] truncate">{t.title}</p>
              </div>
            ))}
          </div>
        )}

        {/* Due today */}
        {dueToday.length > 0 && (
          <div className="mb-4">
            <h3 className="text-xs font-extrabold text-amber-500 uppercase mb-2">Due Today</h3>
            {dueToday.map((t) => (
              <div key={t.id} className="card-cozy p-2 mb-1 border-l-4 border-amber-400">
                <p className="text-xs font-bold text-[var(--text)] truncate">{t.title}</p>
              </div>
            ))}
          </div>
        )}

        {/* Upcoming */}
        {activeTasks.filter((t) => t.dueDate.split('T')[0] > todayStr).length > 0 && (
          <div>
            <h3 className="text-xs font-extrabold text-blue-500 uppercase mb-2">Upcoming</h3>
            {activeTasks.filter((t) => t.dueDate.split('T')[0] > todayStr).slice(0, 5).map((t) => (
              <div key={t.id} className="card-cozy p-2 mb-1 border-l-4 border-blue-400">
                <p className="text-xs font-bold text-[var(--text)] truncate">{t.title}</p>
                <p className="text-[10px] text-[var(--text-muted)]">{new Date(t.dueDate).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b-2 border-[var(--border)] bg-[var(--card-bg)]">
          <div className="flex items-center gap-2">
            <div className="cat-wiggle"><PixelCatIdle size={28} /></div>
            <div>
              <p className="text-sm font-extrabold text-[var(--text)]">MingMing</p>
              <p className="text-[10px] text-[var(--text-muted)] font-semibold">
                {speechSupported ? (muted ? 'Voice off' : 'Voice on') : 'Voice unavailable'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {speechSupported && (
              <button
                onClick={toggleMute}
                className="p-2 rounded-xl hover:bg-[var(--surface-alt)] transition-colors"
                title={muted ? 'Unmute MingMing' : 'Mute MingMing'}
                data-action="toggle-mute"
              >
                {muted ? <VolumeX size={18} className="text-[var(--text-muted)]" /> : <Volume2 size={18} className="text-[var(--primary)]" />}
              </button>
            )}
            <button
              onClick={() => requestNotificationPermission()}
              className="p-2 rounded-xl hover:bg-[var(--surface-alt)] transition-colors"
              title="Enable notifications"
              data-action="enable-notifications"
            >
              <Bell size={18} className="text-[var(--text-muted)]" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="cat-bounce mb-4"><PixelCatHappy size={72} /></div>
              <h2 className="text-xl font-extrabold text-[var(--text)] mb-2">
                Hey{user ? `, ${user.username}` : ''}!
              </h2>
              <p className="text-sm text-[var(--text-muted)] max-w-sm mb-6">
                I&apos;m MingMing, your AI companion. Tell me what you need &mdash; tasks, reminders, or just a chat.
              </p>
              <div className="flex flex-wrap gap-2 justify-center max-w-md">
                {['What\'s my day look like?', 'Add a task for me', 'What\'s overdue?'].map((q) => (
                  <button
                    key={q}
                    onClick={() => { setInput(q); }}
                    className="card-cozy px-3 py-2 text-xs font-bold text-[var(--text)] hover:border-[var(--primary)] transition-colors flex items-center gap-1"
                  >
                    <ChevronRight size={12} className="text-[var(--primary)]" /> {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${
                msg.role === 'user'
                  ? 'bg-[var(--primary)] text-white rounded-2xl rounded-br-md px-4 py-3'
                  : msg.role === 'system'
                    ? 'card-cozy px-4 py-3 border-l-4 border-amber-400'
                    : 'card-cozy px-4 py-3'
              }`}>
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-1.5 mb-1">
                    <PixelCatType size={16} />
                    <span className="text-[10px] font-bold text-[var(--primary)]">MingMing</span>
                  </div>
                )}
                {msg.role === 'system' && (
                  <div className="flex items-center gap-1.5 mb-1">
                    <Bell size={12} className="text-amber-500" />
                    <span className="text-[10px] font-bold text-amber-500">Check-in</span>
                  </div>
                )}
                <p className="text-sm font-semibold whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-white/60' : 'text-[var(--text-muted)]'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex justify-start">
              <div className="card-cozy px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="cat-wiggle"><PixelCatType size={20} /></div>
                  <span className="text-xs font-bold text-[var(--text-muted)] animate-pulse">MingMing is thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input bar */}
        <div className="border-t-2 border-[var(--border)] bg-[var(--card-bg)] px-4 py-3">
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
            className="flex items-center gap-3 max-w-3xl mx-auto"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Talk to MingMing..."
              className="flex-1 px-4 py-3 rounded-xl border-2 border-[var(--border)] bg-[var(--surface)] text-[var(--text)] text-sm font-semibold placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              disabled={sending}
              data-input="chat"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="btn-yarn flex items-center gap-1.5 text-sm shrink-0 disabled:opacity-40"
              data-action="send"
            >
              <Send size={16} /> Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}