'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TaskCard from '../../components/TaskCard';
import Loader from '../../components/Loader';
import { PixelCatIdle, PixelCatHappy, PawPrint } from '@/components/pixel-cats';
import quotes from '../../data/quotes.json';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ToastProvider } from '@/context/ToastContext';
import { Plus, Send, MessageCircle } from 'lucide-react';

interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'TO_DO' | 'IN_PROGRESS' | 'DONE';
}

const columnMeta: Record<string, { label: string; color: string; emptyText: string }> = {
  TO_DO: { label: 'To Do', color: 'text-amber-500', emptyText: 'No tasks to do yet.' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-blue-500', emptyText: 'No tasks in progress.' },
  DONE: { label: 'Done', color: 'text-emerald-500', emptyText: 'No completed tasks yet.' },
};

const Column: React.FC<{
  status: string;
  onDrop: (id: number, status: string) => void;
  children: React.ReactNode;
}> = ({ status, onDrop, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isOver }, drop] = useDrop({
    accept: 'TASK',
    drop: (item: { id: number }) => onDrop(item.id, status),
    collect: (monitor) => ({ isOver: !!monitor.isOver() }),
  });
  drop(ref);

  return (
    <div
      ref={ref}
      className={`flex flex-col gap-2 max-h-[calc(100vh-180px)] overflow-y-auto scrollbar-thin pr-1 transition-colors rounded-lg ${
        isOver ? 'bg-primary/5 ring-2 ring-primary/20' : ''
      }`}
      data-column={status}
    >
      {children}
    </div>
  );
};

const DashboardPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('date');
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const router = useRouter();
  const [quote, setQuote] = useState('');

  useEffect(() => {
    const fetchUserAndTasks = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) { router.push('/login'); return; }

        const userRes = await fetch('/api/session', { headers: { Authorization: `Bearer ${token}` } });
        if (!userRes.ok) {
          if (userRes.status === 401) { localStorage.removeItem('authToken'); router.push('/'); return; }
          throw new Error('Failed to fetch user data.');
        }
        const userData = await userRes.json();
        setUser(userData.user);

        const tasksRes = await fetch(`/api/tasks?userId=${userData.user.id}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!tasksRes.ok) throw new Error('Failed to fetch tasks.');
        const tasksData = await tasksRes.json();
        setTasks(tasksData.tasks || []);
        setFilteredTasks(tasksData.tasks || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An error occurred.');
      } finally {
        setLoading(false);
      }
    };
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    fetchUserAndTasks();
  }, [router]);

  useEffect(() => {
    const priorityOrder: Record<string, number> = { HIGH: 1, MEDIUM: 2, LOW: 3 };
    const sorted = [...tasks].sort((a, b) => {
      if (filterType === 'priority') {
        const p = (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4);
        if (p !== 0) return p;
      }
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
    setFilteredTasks(sorted);
  }, [filterType, tasks]);

  const handleStatusChange = useCallback(async (id: number, newStatus: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: newStatus as Task['status'] } : t)));
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Not authenticated.');
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status.');
    } catch (err) {
      console.error('Status update failed:', err);
    }
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Not authenticated.');
      await fetch(`/api/tasks/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    } catch (err) {
      console.error('Delete failed:', err);
    }
  }, []);

  const grouped = {
    TO_DO: filteredTasks.filter((t) => t.status === 'TO_DO'),
    IN_PROGRESS: filteredTasks.filter((t) => t.status === 'IN_PROGRESS'),
    DONE: filteredTasks.filter((t) => t.status === 'DONE'),
  };

  if (loading) return <Loader />;
  if (error) return <p className="text-[var(--danger)] text-center py-10">{error}</p>;

  return (
    <ToastProvider>
      <DndProvider backend={HTML5Backend}>
        <div className="min-h-screen px-4 py-5" style={{ backgroundColor: 'var(--background)' }} data-page="dashboard">
          <div className="max-w-5xl mx-auto">

            {/* AI Chat Bar — the main interaction point */}
            <div className="card-cozy p-4 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="cat-wiggle"><PixelCatIdle size={32} /></div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[var(--text)]">
                    Meow, {user?.username || 'friend'}! <span className="text-[var(--text-muted)] font-normal italic">&quot;{quote}&quot;</span>
                  </p>
                </div>
              </div>
              <Link href="/ai" className="flex items-center gap-3 w-full">
                <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] text-sm font-semibold hover:border-[var(--primary)] transition-colors cursor-pointer">
                  <MessageCircle size={16} />
                  Tell MingMing what you need...
                </div>
                <button className="btn-yarn flex items-center gap-1 text-sm shrink-0" type="button">
                  <Send size={14} /> Chat
                </button>
              </Link>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {(['TO_DO', 'IN_PROGRESS', 'DONE'] as const).map((status) => {
                const meta = columnMeta[status];
                const count = grouped[status].length;
                return (
                  <div key={status} className="card-cozy p-3 flex items-center gap-3" data-stat={status}>
                    <span className={`text-2xl font-extrabold ${meta.color}`}>{count}</span>
                    <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">{meta.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <PawPrint size={14} className="text-[var(--paw-pink)]" />
                <span className="text-sm font-bold text-[var(--text)]">Your Tasks</span>
                <span className="text-xs bg-[var(--surface-alt)] text-[var(--text-muted)] px-2 py-0.5 rounded-full font-bold">
                  {tasks.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  id="filter"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-1.5 text-sm rounded-xl border-2 border-[var(--border)] bg-[var(--card-bg)] text-[var(--text)] font-bold focus:outline-none focus:border-[var(--primary)]"
                  data-action="filter-tasks"
                >
                  <option value="date">By Date</option>
                  <option value="priority">By Priority</option>
                </select>
                <Link
                  href="/tasks/create"
                  className="btn-yarn inline-flex items-center gap-1.5 text-sm"
                  data-action="create-task"
                >
                  <Plus size={16} /> New
                </Link>
              </div>
            </div>

            {/* Kanban columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['TO_DO', 'IN_PROGRESS', 'DONE'] as const).map((status) => {
                const meta = columnMeta[status];
                const columnTasks = grouped[status];
                const accentMap: Record<string, string> = {
                  TO_DO: 'border-amber-400',
                  IN_PROGRESS: 'border-blue-400',
                  DONE: 'border-emerald-400',
                };
                return (
                  <div key={status} className={`flex flex-col rounded-2xl border-2 border-[var(--border)] border-t-4 ${accentMap[status]} bg-[var(--surface)] p-3`}>
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className={`text-sm font-extrabold ${meta.color}`}>{meta.label}</h3>
                      <span className="text-xs bg-[var(--surface-alt)] text-[var(--text-muted)] px-2 py-0.5 rounded-full font-bold">
                        {columnTasks.length}
                      </span>
                    </div>
                    <Column status={status} onDrop={handleStatusChange}>
                      {columnTasks.length > 0 ? (
                        columnTasks.map((task) => (
                          <TaskCard key={task.id} {...task} onStatusChange={handleStatusChange} onDelete={handleDelete} />
                        ))
                      ) : (
                        <div className="text-center py-8 text-[var(--text-muted)]">
                          <PixelCatHappy size={28} className="mx-auto mb-2 opacity-30" />
                          <p className="text-xs font-semibold">{meta.emptyText}</p>
                        </div>
                      )}
                    </Column>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DndProvider>
    </ToastProvider>
  );
};

export default DashboardPage;
