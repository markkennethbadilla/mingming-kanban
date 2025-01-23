'use client';

import React, { useRef, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Password } from 'primereact/password';

// Validation schema
const validationSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof validationSchema>;

const LoginPage: React.FC = () => {
  const { control, handleSubmit, formState } = useForm<LoginFormData>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const toast = useRef<any>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return; // No token, user needs to log in

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

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message);
      }

      localStorage.setItem('authToken', result.token);
      window.location.href = '/dashboard'; // Redirect to dashboard on successful login
    } catch (error: any) {
      toast.current.show({
        severity: 'error',
        summary: 'Login Failed',
        detail: error.message || 'An error occurred. Please try again.',
        life: 3000,
      });
    }
  };

  return (
    <div className="flex flex-col min-h-[87vh] bg-[var(--background-color,#f4f4f4)]">
      <div className="flex-grow"></div>
      <div className="flex justify-center items-center">
        <Toast ref={toast} />
        <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-center text-[var(--primary-color,#007bff)] mb-4">
            Log In
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-lg text-[var(--text-color,#333)]"
              >
                Email
              </label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <InputText
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    {...field}
                    className="w-full p-3 rounded-lg border border-[var(--neutral-color,#ccc)]"
                  />
                )}
              />
            </div>
            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block mb-2 text-lg text-[var(--text-color,#333)]"
              >
                Password
              </label>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Password
                    id="password"
                    placeholder="Enter your password"
                    {...field}
                    feedback={false} // Disable strength meter
                    toggleMask // Show/hide toggle for password
                    inputClassName="w-full p-3 rounded-lg border border-[var(--neutral-color,#ccc)]"
                    className="w-full"
                  />
                )}
              />
            </div>
            {/* Submit Button */}
            <Button
              label="Log In"
              type="submit"
              className={`w-full p-3 bg-[var(--primary-color,#007bff)] text-white border-none rounded-lg font-semibold text-lg ${
                formState.isSubmitting ? 'cursor-not-allowed' : 'cursor-pointer'
              }`}
            />
          </form>
          {/* Forgot Password and No Account Links */}
          <div className="mt-4 flex justify-between text-sm text-[var(--neutral-color,#666)]">
            <a
              href="/forgot-password"
              className="text-[var(--primary-color,#007bff)] hover:underline"
            >
              Forgot Password?
            </a>
            <a
              href="/register"
              className="text-[var(--primary-color,#007bff)] hover:underline"
            >
              Don’t have an account?
            </a>
          </div>
        </div>
      </div>
      <div className="flex-grow"></div>
    </div>
  );
};

export default LoginPage;
