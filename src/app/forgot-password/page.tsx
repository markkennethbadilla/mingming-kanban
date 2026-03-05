'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ToastProvider, useToast } from '@/context/ToastContext';
import { PixelCatSleep } from '@/components/pixel-cats';
import { Mail } from 'lucide-react';

const schema = z.object({ email: z.string().email('Invalid email format') });
type ForgotData = z.infer<typeof schema>;

const inputClass = 'w-full px-4 py-3 text-sm font-semibold rounded-xl border-2 border-[var(--border)] bg-[var(--card-bg)] text-[var(--text)] focus:outline-none focus:border-[var(--primary)] transition-colors';

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
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4" style={{ backgroundColor: 'var(--background)' }} data-page="forgot-password">
      <div className="w-full max-w-md card-cozy p-8">
        <div className="text-center mb-5">
          <div className="cat-bounce inline-block mb-2"><PixelCatSleep size={48} /></div>
          <h2 className="text-2xl font-extrabold text-[var(--text)]">Forgot Password?</h2>
          <p className="text-sm text-[var(--text-muted)] font-semibold">MingMing will help you reset it</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" data-form="forgot-password">
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-[var(--text)] mb-1">Email address</label>
            <input id="email" type="email" placeholder="example@domain.com" {...register('email')} className={inputClass} />
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-yarn w-full py-3 flex items-center justify-center gap-2 disabled:opacity-40" data-action="send-reset">
            <Mail size={18} /> {isSubmitting ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        <div className="mt-4 flex justify-center text-sm">
          <Link href="/login" className="text-[var(--secondary)] font-bold hover:underline">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

const ForgotPasswordPage: React.FC = () => (
  <ToastProvider><ForgotForm /></ToastProvider>
);
export default ForgotPasswordPage;
