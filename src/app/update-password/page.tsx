'use client';

import React, { useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Password } from 'primereact/password';

// Validation schema using zod
const validationSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z
      .string()
      .min(6, 'Confirm Password must be at least 6 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'], // Path of the field causing the issue
  });

type UpdatePasswordFormData = z.infer<typeof validationSchema>;

const UpdatePasswordPage: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UpdatePasswordForm />
    </Suspense>
  );
};

const UpdatePasswordForm: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const toast = useRef<any>(null);

  const { control, handleSubmit, formState } = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  // Show validation errors as Toast messages
  useEffect(() => {
    if (formState.errors) {
      Object.values(formState.errors).forEach((error) => {
        toast.current.show({
          severity: 'warn',
          summary: 'Validation Error',
          detail: error.message,
          life: 3000,
        });
      });
    }
  }, [formState.errors]);

  // Check if the user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) return;

        const response = await fetch('/api/session', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (response.ok) {
          router.push(document.referrer);
        }
      } catch {}
    };

    checkSession();
  }, [router]);

  const onSubmit = async (data: UpdatePasswordFormData) => {
    if (!token) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Invalid or missing token.',
        life: 3000,
      });
      return;
    }

    try {
      const response = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password: data.password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to reset password.');
      }

      toast.current.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Password updated successfully. Redirecting to login...',
        life: 3000,
      });

      setTimeout(() => router.push('/login'), 3000);
    } catch (error: any) {
      toast.current.show({
        severity: 'error',
        summary: 'Reset Failed',
        detail: error.message || 'Something went wrong. Please try again.',
        life: 3000,
      });
    }
  };

  return (
    <div className="flex items-center justify-center bg-[var(--background-color,#f4f4f4)] py-6 min-h-[87vh]">
      <Toast ref={toast} />
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-center text-2xl font-semibold text-[var(--primary-color,#007bff)] mb-4">
          Reset Your Password
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          {/* New Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block mb-2 text-lg text-[var(--text-color,#333)] font-medium"
            >
              New Password
            </label>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Password
                  id="password"
                  {...field}
                  feedback={true}
                  toggleMask
                  className="w-full p-3 rounded-lg border border-[var(--neutral-color,#ccc)]"
                />
              )}
            />
          </div>

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block mb-2 text-lg text-[var(--text-color,#333)] font-medium"
            >
              Confirm New Password
            </label>
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <Password
                  id="confirmPassword"
                  {...field}
                  feedback={false}
                  toggleMask
                  className="w-full p-3 rounded-lg border border-[var(--neutral-color,#ccc)]"
                />
              )}
            />
          </div>

          {/* Submit Button */}
          <Button
            label={formState.isSubmitting ? 'Updating...' : 'Reset Password'}
            type="submit"
            disabled={formState.isSubmitting}
            className="w-full p-3 bg-[var(--primary-color,#007bff)] text-white border-none rounded-lg font-semibold text-lg"
          />
        </form>
      </div>
    </div>
  );
};

export default UpdatePasswordPage;
