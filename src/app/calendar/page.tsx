'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ToastProvider, useToast } from '@/context/ToastContext';
import TaskCard from '@/components/TaskCard';
import Loader from '@/components/Loader';
import { PixelCatSleep, PawPrint } from '@/components/pixel-cats';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: Date;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'TO_DO' | 'IN_PROGRESS' | 'DONE';
}

// TODO: CalendarInner component

/* eslint-disable react-hooks/rules-of-hooks */
function CalendarInner() {
  const router = useRouter();
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);

  // TODO: fetch effects

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) { router.push('/login'); return; }
        const res = await fetch('/api/session', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) setUserId(data.user.id);
        else throw new Error('Session invalid');
      } catch { localStorage.removeItem('authToken'); router.push('/'); }
    };
    fetchSession();
  }, [router]);

  useEffect(() => {
    if (!userId) return;
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        const res = await fetch('/api/tasks?userId=' + userId, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) {
          setTasks(data.tasks.map((t: Task) => ({ ...t, dueDate: new Date(t.dueDate) })));
        }
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
        showToast({ severity: 'error', summary: 'Error', detail: 'Failed to fetch tasks.', life: 3000 });
      } finally { setLoading(false); }
    };
    fetchTasks();
  }, [userId, showToast]);
  // TODO: handlers

  const handleDelete = useCallback(async (id: number) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Not authenticated');
      await fetch('/api/tasks/' + id, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) { console.error('Delete failed:', err); }
  }, []);

  const handleStatusChange = useCallback(async (id: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Not authenticated');
      await fetch('/api/tasks/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status: newStatus as Task['status'] } : t));
    } catch (err) {
      console.error('Status update failed:', err);
      showToast({ severity: 'error', summary: 'Error', detail: 'Failed to update status.', life: 3000 });
    }
  }, [showToast]);
  // TODO: calendar grid logic

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days: Date[] = [];
  let day = calStart;
  while (day <= calEnd) { days.push(day); day = addDays(day, 1); }
  const hasTaskOnDay = (d: Date) => tasks.some((t) => isSameDay(t.dueDate, d));
  const tasksForSelected = tasks.filter((t) => isSameDay(t.dueDate, selectedDate));
  // TODO: render

  if (loading) return <Loader />;

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-6" style={{ backgroundColor: 'var(--background)' }} data-page="calendar">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <PawPrint size={20} />
          <h1 className="text-2xl font-extrabold text-[var(--text)]">Task Calendar</h1>
        </div>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Calendar grid */}
          <div className="card-cozy p-4 lg:flex-1">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1.5 hover:bg-[var(--surface-alt)] rounded-xl transition-colors" data-action="prev-month">
                <ChevronLeft size={20} className="text-[var(--text-muted)]" />
              </button>
              <h2 className="text-lg font-extrabold text-[var(--text)]">{format(currentMonth, 'MMMM yyyy')}</h2>
              <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1.5 hover:bg-[var(--surface-alt)] rounded-xl transition-colors" data-action="next-month">
                <ChevronRight size={20} className="text-[var(--text-muted)]" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="text-center text-xs font-bold text-[var(--text-muted)] py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((d, i) => {
                const isCurrentMonth = isSameMonth(d, currentMonth);
                const isSelected = isSameDay(d, selectedDate);
                const isToday = isSameDay(d, new Date());
                const hasTask = hasTaskOnDay(d);
                return (
                  <button key={i} onClick={() => setSelectedDate(d)} className={`relative flex flex-col items-center justify-center py-2 rounded-xl text-sm font-semibold transition-colors ${
                    isSelected ? 'bg-[var(--primary)] text-white' :
                    isToday ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-extrabold' :
                    isCurrentMonth ? 'text-[var(--text)] hover:bg-[var(--surface-alt)]' :
                    'text-[var(--text-muted)] opacity-40'
                  }`} data-day={format(d, 'yyyy-MM-dd')}>
                    {format(d, 'd')}
                    {hasTask && <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-[var(--primary)]'}`} />}
                  </button>
                );
              })}
            </div>
          </div>
          {/* Selected date tasks */}
          <div className="lg:w-96">
            <div className="card-cozy p-4">
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => setSelectedDate(addDays(selectedDate, -1))} className="p-1 hover:bg-[var(--surface-alt)] rounded-xl transition-colors">
                  <ChevronLeft size={18} className="text-[var(--text-muted)]" />
                </button>
                <h3 className="text-sm font-bold text-[var(--text)]">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</h3>
                <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} className="p-1 hover:bg-[var(--surface-alt)] rounded-xl transition-colors">
                  <ChevronRight size={18} className="text-[var(--text-muted)]" />
                </button>
              </div>
              <div className="flex flex-col gap-2" data-region="day-tasks">
                {tasksForSelected.length > 0 ? (
                  tasksForSelected.map((task) => (
                    <TaskCard key={task.id} {...task} dueDate={task.dueDate.toISOString()} onDelete={handleDelete} onStatusChange={handleStatusChange} />
                  ))
                ) : (
                  <p className="text-sm text-[var(--text-muted)] font-semibold text-center py-6">
                    <span className="inline-block cat-wiggle mb-1"><PixelCatSleep size={32} /></span><br />
                    No tasks for this date.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// CalendarPage wrapper

export default function CalendarPage() {
  return (
    <ToastProvider>
      <DndProvider backend={HTML5Backend}>
        <CalendarInner />
      </DndProvider>
    </ToastProvider>
  );
}