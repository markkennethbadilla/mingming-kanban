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
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: 'var(--background-color, #f4f4f4)',
      }}
    >
      <Toast ref={toast} />
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: '#fff',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h2
          style={{
            textAlign: 'center',
            color: 'var(--primary-color, #007bff)',
            marginBottom: '16px',
          }}
        >
          Reset Your Password
        </h2>
        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{ display: 'grid', gap: '16px' }}
        >
          {/* New Password Field */}
          <div>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '1rem',
                color: 'var(--text-color, #333)',
                fontWeight: '500',
              }}
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
                  style={{
                    width: '100%',
                    borderRadius: '8px',
                    border: '1px solid var(--neutral-color, #ccc)',
                  }}
                />
              )}
            />
          </div>

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="confirmPassword"
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '1rem',
                color: 'var(--text-color, #333)',
                fontWeight: '500',
              }}
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
                  style={{
                    width: '100%',
                    borderRadius: '8px',
                    border: '1px solid var(--neutral-color, #ccc)',
                  }}
                />
              )}
            />
          </div>

          {/* Submit Button */}
          <Button
            label={formState.isSubmitting ? 'Updating...' : 'Reset Password'}
            type="submit"
            disabled={formState.isSubmitting}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: 'var(--primary-color, #007bff)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '1rem',
              cursor: formState.isSubmitting ? 'not-allowed' : 'pointer',
            }}
          />
        </form>
      </div>
    </div>
  );
};

export default UpdatePasswordPage;
