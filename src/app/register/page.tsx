'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ToastProvider, useToast } from '@/context/ToastContext';
import { PixelCatHappy } from '@/components/pixel-cats';
import { UserPlus, Eye, EyeOff } from 'lucide-react';

const schema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type RegisterData = z.infer<typeof schema>;

const inputClass = 'w-full px-4 py-3 text-sm font-semibold rounded-xl border-2 border-[var(--border)] bg-[var(--card-bg)] text-[var(--text)] focus:outline-none focus:border-[var(--primary)] transition-colors';

const RegisterForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterData>({
    resolver: zodResolver(schema),
    defaultValues: { username: '', email: '', password: '' },
  });
  const { showToast } = useToast();
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    const check = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      const res = await fetch('/api/session', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) window.location.href = '/';
    };
    check();
  }, []);

  useEffect(() => {
    Object.values(errors).forEach((e) => {
      if (e?.message) showToast({ severity: 'warn', summary: 'Validation', detail: e.message, life: 3000 });
    });
  }, [errors, showToast]);

  const onSubmit = async (data: RegisterData) => {
    try {
      const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Registration failed');
      showToast({ severity: 'success', summary: 'Success', detail: 'Account created! Redirecting to login...', life: 3000 });
      setTimeout(() => { window.location.href = '/login'; }, 2000);
    } catch (err: unknown) {
      showToast({ severity: 'error', summary: 'Registration Failed', detail: err instanceof Error ? err.message : 'An error occurred.', life: 3000 });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4" style={{ backgroundColor: 'var(--background)' }} data-page="register">
      <div className="w-full max-w-md card-cozy p-8">
        <div className="text-center mb-5">
          <div className="cat-bounce inline-block mb-2"><PixelCatHappy size={48} /></div>
          <h2 className="text-2xl font-extrabold text-[var(--text)]">Join MingMing!</h2>
          <p className="text-sm text-[var(--text-muted)] font-semibold">Create your account</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" data-form="register">
          <div>
            <label htmlFor="username" className="block text-sm font-bold text-[var(--text)] mb-1">Username</label>
            <input id="username" type="text" placeholder="Enter your username" {...register('username')} className={inputClass} />
          </div>
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
          <button type="submit" disabled={isSubmitting} className="btn-yarn w-full py-3 flex items-center justify-center gap-2 disabled:opacity-40" data-action="register">
            <UserPlus size={18} /> {isSubmitting ? 'Creating...' : 'Sign Up'}
          </button>
        </form>
        <div className="mt-4 flex justify-center text-sm">
          <a href="/login" className="text-[var(--secondary)] font-bold hover:underline">Already have an account? Log in</a>
        </div>
      </div>
    </div>
  );
};

const RegisterPage: React.FC = () => (
  <ToastProvider><RegisterForm /></ToastProvider>
);
export default RegisterPage;
