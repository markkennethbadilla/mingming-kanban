'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import TaskForm from '@/components/TaskForm';
import { ToastProvider, useToast } from '@/context/ToastContext';
import Loader from '@/components/Loader';
import { PawPrint } from '@/components/pixel-cats';
import { ArrowLeft } from 'lucide-react';

const EditTaskInner: React.FC = () => {
  const [initialData, setInitialData] = useState(null);
  const [error, setError] = useState('');
  const { showToast } = useToast();
  const params = useParams();
  const router = useRouter();
  const taskId = params.taskId;

  const checkSession = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/session', { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } });
      if (!res.ok) { window.location.href = '/'; return false; }
      return true;
    } catch { window.location.href = '/'; return false; }
  };

  useEffect(() => {
    const fetchTask = async () => {
      const valid = await checkSession();
      if (!valid) return;
      try {
        const res = await fetch(`/api/tasks/${taskId}`, { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } });
        if (!res.ok) {
          if (res.status === 404) { setError('Task not found.'); return; }
          throw new Error('Failed to fetch task.');
        }
        const data = await res.json();
        setInitialData(data.task);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Something went wrong.');
      }
    };
    fetchTask();
  }, [taskId]);

  const handleSubmit = async (data: Record<string, unknown>) => {
    const valid = await checkSession();
    if (!valid) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update task.');
      showToast({ severity: 'success', summary: 'Updated', detail: 'Task updated successfully.', life: 3000 });
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err: unknown) {
      showToast({ severity: 'error', summary: 'Error', detail: err instanceof Error ? err.message : 'Failed to update.', life: 3000 });
    }
  };

  const handleDelete = async () => {
    const valid = await checkSession();
    if (!valid) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } });
      if (!res.ok) throw new Error('Failed to delete task.');
      showToast({ severity: 'success', summary: 'Deleted', detail: 'Task deleted successfully.', life: 3000 });
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err: unknown) {
      showToast({ severity: 'error', summary: 'Error', detail: err instanceof Error ? err.message : 'Failed to delete.', life: 3000 });
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] text-center" data-page="edit-task-error">
        <p className="text-[var(--yarn-red)] text-lg font-bold mb-4">{error}</p>
        <button onClick={() => router.back()} className="btn-yarn px-4 py-2">Back</button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4 py-6" style={{ backgroundColor: 'var(--background)' }} data-page="edit-task">
      {initialData ? (
        <div className="w-full max-w-2xl">
          <button onClick={() => router.back()} className="inline-flex items-center gap-1 text-sm font-bold text-[var(--primary)] hover:underline mb-4" data-action="go-back">
            <ArrowLeft size={16} /> Back
          </button>
          <div className="flex items-center justify-center gap-2 mb-4">
            <PawPrint size={20} />
            <h2 className="text-2xl font-extrabold text-[var(--text)]">Edit Task</h2>
          </div>
          <TaskForm onSubmit={handleSubmit} onDelete={handleDelete} initialData={initialData} />
        </div>
      ) : (
        <Loader />
      )}
    </div>
  );
};

const EditTaskPage: React.FC = () => (
  <ToastProvider><EditTaskInner /></ToastProvider>
);
export default EditTaskPage;
