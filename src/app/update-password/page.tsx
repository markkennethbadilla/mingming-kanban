'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ToastProvider, useToast } from '@/context/ToastContext';
import { PixelCatIdle } from '@/components/pixel-cats';
import { KeyRound, Eye, EyeOff } from 'lucide-react';

const schema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
}).refine((d) => d.password === d.confirmPassword, { message: 'Passwords must match', path: ['confirmPassword'] });
type UpdateData = z.infer<typeof schema>;

const inputClass = 'w-full px-4 py-3 text-sm font-semibold rounded-xl border-2 border-[var(--border)] bg-[var(--card-bg)] text-[var(--text)] focus:outline-none focus:border-[var(--primary)] transition-colors';

const UpdateForm: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const { showToast } = useToast();
  const [showPw, setShowPw] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<UpdateData>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  useEffect(() => {
    Object.values(errors).forEach((e) => {
      if (e?.message) showToast({ severity: 'warn', summary: 'Validation', detail: e.message, life: 3000 });
    });
  }, [errors, showToast]);

  useEffect(() => {
    const check = async () => {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) return;
      const res = await fetch('/api/session', { headers: { Authorization: `Bearer ${authToken}` } });
      if (res.ok) router.back();
    };
    check();
  }, [router]);

  const onSubmit = async (data: UpdateData) => {
    if (!token) {
      showToast({ severity: 'error', summary: 'Error', detail: 'Invalid or missing token.', life: 3000 });
      return;
    }
    try {
      const res = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: data.password }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to reset password.');
      showToast({ severity: 'success', summary: 'Success', detail: 'Password updated. Redirecting to login...', life: 3000 });
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: unknown) {
      showToast({ severity: 'error', summary: 'Reset Failed', detail: err instanceof Error ? err.message : 'Something went wrong.', life: 3000 });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 md:px-8" style={{ backgroundColor: 'var(--background)' }} data-page="update-password">
      <div className="w-full max-w-4xl flex flex-col md:flex-row md:items-center md:gap-16">
        <div className="text-center md:text-left md:flex-1 mb-6 md:mb-0">
          <div className="cat-bounce inline-block mb-3"><PixelCatIdle size={72} className="md:w-24 md:h-24" /></div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-[var(--text)]">Reset Your Password</h2>
          <p className="text-sm md:text-base text-[var(--text-muted)] font-semibold mt-1 md:mt-3">Choose a new password</p>
        </div>
        <div className="w-full md:flex-1 md:max-w-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5" data-form="update-password">
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-[var(--text)] mb-1">New Password</label>
              <div className="relative">
                <input id="password" type={showPw ? 'text' : 'password'} placeholder="New password" {...register('password')} className={inputClass} />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-bold text-[var(--text)] mb-1">Confirm Password</label>
              <input id="confirmPassword" type={showPw ? 'text' : 'password'} placeholder="Confirm password" {...register('confirmPassword')} className={inputClass} />
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-yarn w-full py-3 flex items-center justify-center gap-2 disabled:opacity-40" data-action="reset-password">
              <KeyRound size={18} /> {isSubmitting ? 'Updating...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const UpdatePasswordPage: React.FC = () => (
  <ToastProvider>
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-[var(--text-muted)]">Loading...</div>}>
      <UpdateForm />
    </Suspense>
  </ToastProvider>
);
export default UpdatePasswordPage;
