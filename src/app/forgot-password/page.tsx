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
          Forgot Password
        </h2>
        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{ display: 'grid', gap: '16px' }}
        >
          <div>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '1rem',
                color: 'var(--text-color, #333)',
              }}
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
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--neutral-color, #ccc)',
                  }}
                />
              )}
            />
          </div>

          <Button
            label="Send Reset Link"
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

export default ForgotPasswordPage;
