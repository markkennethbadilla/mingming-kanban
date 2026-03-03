'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TaskForm from '@/components/TaskForm';
import { ToastProvider, useToast } from '@/context/ToastContext';
import Loader from '@/components/Loader';
import { ArrowLeft } from 'lucide-react';

const CreateTaskInner: React.FC = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) { router.push('/login'); return; }
        const res = await fetch('/api/session', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) setLoading(false);
        else throw new Error('Session invalid');
      } catch {
        localStorage.removeItem('authToken');
        router.push('/');
      }
    };
    check();
  }, [router]);

  const fetchUserId = async (): Promise<number> => {
    const res = await fetch('/api/session', { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } });
    if (!res.ok) { window.location.href = '/'; throw new Error('Session expired'); }
    const { user } = await res.json();
    return user.id;
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    try {
      const userId = await fetchUserId();
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        body: JSON.stringify({ ...data, userId }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to create task.');
      showToast({ severity: 'success', summary: 'Created', detail: 'Task created successfully.', life: 3000 });
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err: unknown) {
      showToast({ severity: 'error', summary: 'Error', detail: err instanceof Error ? err.message : 'An error occurred.', life: 5000 });
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-[var(--surface)] px-4 py-6" data-page="create-task">
      <div className="w-full max-w-2xl">
        <button onClick={() => router.back()} className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-4" data-action="go-back">
          <ArrowLeft size={16} /> Back
        </button>
        <h2 className="text-center text-2xl font-bold text-[var(--text)] mb-4">Create Task</h2>
        <TaskForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

const CreateTaskPage: React.FC = () => (
  <ToastProvider><CreateTaskInner /></ToastProvider>
);
export default CreateTaskPage;
