'use client';

import React, { useRef, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

// Validation schema using zod
const validationSchema = z.object({
  email: z.string().email('Invalid email format'),
});

type ForgotPasswordFormData = z.infer<typeof validationSchema>;

const ForgotPasswordPage: React.FC = () => {
  const { control, handleSubmit, formState } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      email: '',
    },
  });

  const toast = useRef<any>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        const response = await fetch('/api/session', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          window.location.href = '/dashboard'; // Redirect to dashboard if session is valid
        }
      } catch {}
    };

    checkSession();
  }, []);

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      const response = await fetch('/api/auth/send-reset-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || 'Failed to send password reset email.'
        );
      }

      toast.current.show({
        severity: 'success',
        summary: 'Email Sent',
        detail:
          'If the email exists in our system, a password reset link has been sent. Please check your email (including spam/junk folders).',
        life: 5000,
      });
    } catch (error: any) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Something went wrong. Please try again.',
        life: 5000,
      });
    }
  };

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

  return (
    <>
      <div className="flex flex-col min-h-[87vh] bg-[var(--background-color,#f4f4f4)]">
        <div className="flex-grow"></div>
        <div className="flex justify-center items-center">
          <Toast ref={toast} />
          <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-center text-[var(--primary-color,#007bff)] mb-4">
              Forgot Password
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-lg text-[var(--text-color,#333)]"
                >
                  Enter your email address:
                </label>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <InputText
                      id="email"
                      {...field}
                      placeholder="example@domain.com"
                      className="w-full p-3 rounded-lg border border-[var(--neutral-color,#ccc)]"
                    />
                  )}
                />
              </div>

              <Button
                label="Send Reset Link"
                type="submit"
                disabled={formState.isSubmitting}
                className={`w-full p-3 bg-[var(--primary-color,#007bff)] text-white border-none rounded-lg font-semibold text-lg ${
                  formState.isSubmitting
                    ? 'cursor-not-allowed'
                    : 'cursor-pointer'
                }`}
              />
            </form>
          </div>
        </div>
        <div className="flex-grow"></div>
      </div>
    </>
  );
};

export default ForgotPasswordPage;
