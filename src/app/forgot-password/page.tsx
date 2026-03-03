'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ToastProvider, useToast } from '@/context/ToastContext';
import { Mail } from 'lucide-react';

const schema = z.object({ email: z.string().email('Invalid email format') });
type ForgotData = z.infer<typeof schema>;

const inputClass = 'w-full px-4 py-3 text-sm rounded-lg border border-[var(--border)] bg-[var(--card-bg)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors';

const ForgotForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });
  const { showToast } = useToast();

  useEffect(() => {
    const check = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      const res = await fetch('/api/session', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) window.location.href = '/dashboard';
    };
    check();
  }, []);

  const onSubmit = async (data: ForgotData) => {
    try {
      const res = await fetch('/api/auth/send-reset-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to send reset email.');
      showToast({ severity: 'success', summary: 'Email Sent', detail: 'Check your inbox (and spam) for the reset link.', life: 5000 });
    } catch (err: unknown) {
      showToast({ severity: 'error', summary: 'Error', detail: err instanceof Error ? err.message : 'Something went wrong.', life: 5000 });
    }
  };

  useEffect(() => {
    Object.values(errors).forEach((e) => {
      if (e?.message) showToast({ severity: 'warn', summary: 'Validation', detail: e.message, life: 3000 });
    });
  }, [errors, showToast]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-[var(--surface)] px-4" data-page="forgot-password">
      <div className="w-full max-w-md bg-[var(--card-bg)] p-8 rounded-xl border border-[var(--border)] shadow-card">
        <h2 className="text-center text-2xl font-bold text-[var(--text)] mb-6">Forgot Password</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" data-form="forgot-password">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[var(--text)] mb-1">Email address</label>
            <input id="email" type="email" placeholder="example@domain.com" {...register('email')} className={inputClass} />
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2" data-action="send-reset">
            <Mail size={18} /> {isSubmitting ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        <div className="mt-4 flex justify-center text-sm">
          <a href="/login" className="text-primary hover:underline">Back to Login</a>
        </div>
      </div>
    </div>
  );
};

const ForgotPasswordPage: React.FC = () => (
  <ToastProvider><ForgotForm /></ToastProvider>
);
export default ForgotPasswordPage;
