'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import TaskCard from '../../components/TaskCard';
import Loader from '../../components/Loader';
import quotes from '../../data/quotes.json';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ToastProvider } from '@/context/ToastContext';
import { Plus, SlidersHorizontal } from 'lucide-react';

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
  if (error) return <p className="text-red-500 text-center py-10">{error}</p>;

  return (
    <ToastProvider>
      <DndProvider backend={HTML5Backend}>
        <div className="min-h-screen bg-[var(--surface)] px-4 py-6" data-page="dashboard">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[var(--text)]">
                  Welcome, {user?.username || 'User'}!
                </h2>
                <p className="text-sm text-[var(--text-muted)] italic mt-1">&quot;{quote}&quot;</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-[var(--text-muted)]" />
                  <select
                    id="filter"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-1.5 text-sm rounded-lg border border-[var(--border)] bg-[var(--card-bg)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-primary/30"
                    data-action="filter-tasks"
                  >
                    <option value="date">By Date</option>
                    <option value="priority">By Priority</option>
                  </select>
                </div>
                <a
                  href="/tasks/create"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors"
                  data-action="create-task"
                >
                  <Plus size={16} /> New Task
                </a>
              </div>
            </div>

            {/* Kanban columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {(['TO_DO', 'IN_PROGRESS', 'DONE'] as const).map((status) => {
                const meta = columnMeta[status];
                const columnTasks = grouped[status];
                return (
                  <div key={status} className="flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className={`text-base font-semibold ${meta.color}`}>{meta.label}</h3>
                      <span className="text-xs bg-[var(--border)]/50 text-[var(--text-muted)] px-2 py-0.5 rounded-full font-medium">
                        {columnTasks.length}
                      </span>
                    </div>
                    <Column status={status} onDrop={handleStatusChange}>
                      {columnTasks.length > 0 ? (
                        columnTasks.map((task) => (
                          <TaskCard key={task.id} {...task} onStatusChange={handleStatusChange} onDelete={handleDelete} />
                        ))
                      ) : (
                        <p className="text-sm text-[var(--text-muted)] py-8 text-center">{meta.emptyText}</p>
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
