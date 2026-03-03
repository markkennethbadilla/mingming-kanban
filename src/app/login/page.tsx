'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ToastProvider, useToast } from '@/context/ToastContext';
import { LogIn, Eye, EyeOff } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type LoginData = z.infer<typeof schema>;

const inputClass = 'w-full px-4 py-3 text-sm rounded-lg border border-[var(--border)] bg-white text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors';

const LoginForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });
  const { showToast } = useToast();
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    const check = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      const res = await fetch('/api/session', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) window.location.href = '/dashboard';
    };
    check();
  }, []);

  useEffect(() => {
    Object.values(errors).forEach((e) => {
      if (e?.message) showToast({ severity: 'warn', summary: 'Validation', detail: e.message, life: 3000 });
    });
  }, [errors, showToast]);

  const onSubmit = async (data: LoginData) => {
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      localStorage.setItem('authToken', result.token);
      window.location.href = '/dashboard';
    } catch (err: unknown) {
      showToast({ severity: 'error', summary: 'Login Failed', detail: err instanceof Error ? err.message : 'An error occurred.', life: 3000 });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-[var(--surface)] px-4" data-page="login">
      <div className="w-full max-w-md bg-white p-8 rounded-xl border border-[var(--border)] shadow-card">
        <h2 className="text-center text-2xl font-bold text-[var(--text)] mb-6">Log In</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" data-form="login">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[var(--text)] mb-1">Email</label>
            <input id="email" type="email" placeholder="Enter your email" {...register('email')} className={inputClass} />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[var(--text)] mb-1">Password</label>
            <div className="relative">
              <input id="password" type={showPw ? 'text' : 'password'} placeholder="Enter your password" {...register('password')} className={inputClass} />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2" data-action="login">
            <LogIn size={18} /> {isSubmitting ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        <div className="mt-4 flex justify-between text-sm">
          <a href="/forgot-password" className="text-primary hover:underline">Forgot Password?</a>
          <a href="/register" className="text-primary hover:underline">Don&apos;t have an account?</a>
        </div>
      </div>
    </div>
  );
};

const LoginPage: React.FC = () => (
  <ToastProvider><LoginForm /></ToastProvider>
);
export default LoginPage;
