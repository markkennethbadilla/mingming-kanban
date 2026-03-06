'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ToastProvider, useToast } from '@/context/ToastContext';
import { PixelCatWave } from '@/components/pixel-cats';
import Link from 'next/link';
import { LogIn, Eye, EyeOff } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type LoginData = z.infer<typeof schema>;

const inputClass = 'w-full px-4 py-3 text-sm font-semibold rounded-xl border-2 border-[var(--border)] bg-[var(--card-bg)] text-[var(--text)] focus:outline-none focus:border-[var(--primary)] transition-colors';

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
      if (res.ok) window.location.href = '/home';
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
      window.location.href = '/home';
    } catch (err: unknown) {
      showToast({ severity: 'error', summary: 'Login Failed', detail: err instanceof Error ? err.message : 'An error occurred.', life: 3000 });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 md:px-8" style={{ backgroundColor: 'var(--background)' }} data-page="login">
      <div className="w-full max-w-4xl flex flex-col md:flex-row md:items-center md:gap-16">
        <div className="text-center md:text-left md:flex-1 mb-6 md:mb-0">
          <div className="cat-bounce inline-block mb-3"><PixelCatWave size={72} className="md:w-24 md:h-24" /></div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-[var(--text)]">Welcome back!</h2>
          <p className="text-sm md:text-base text-[var(--text-muted)] font-semibold mt-1 md:mt-3">MingMing missed you</p>
        </div>
        <div className="w-full md:flex-1 md:max-w-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5" data-form="login">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-[var(--text)] mb-1">Email</label>
              <input id="email" type="email" placeholder="Enter your email" {...register('email')} className={inputClass} />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-[var(--text)] mb-1">Password</label>
              <div className="relative">
                <input id="password" type={showPw ? 'text' : 'password'} placeholder="Enter your password" {...register('password')} className={inputClass} />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-yarn w-full py-3 flex items-center justify-center gap-2 disabled:opacity-40" data-action="login">
              <LogIn size={18} /> {isSubmitting ? 'Logging in...' : 'Log In'}
            </button>
          </form>
          <div className="mt-5 flex justify-between text-sm">
            <Link href="/forgot-password" className="text-[var(--primary)] font-bold hover:underline">Forgot Password?</Link>
            <Link href="/register" className="text-[var(--secondary)] font-bold hover:underline">Sign Up</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoginPage: React.FC = () => (
  <ToastProvider><LoginForm /></ToastProvider>
);
export default LoginPage;
