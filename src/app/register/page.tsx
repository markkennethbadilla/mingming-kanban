'use client';

import React, { useRef, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Password } from 'primereact/password';

// Validation schema using zod
const validationSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterFormData = z.infer<typeof validationSchema>;

const RegisterPage: React.FC = () => {
  const { control, handleSubmit, formState } = useForm<RegisterFormData>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  const toast = useRef<any>(null);

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
        const token = localStorage.getItem('authToken');
        if (!token) return;

        const response = await fetch('/api/session', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          window.location.href = '/'; // Redirect if session is valid
        }
      } catch {}
    };

    checkSession();
  }, []);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }

      toast.current.show({
        severity: 'success',
        summary: 'Registration Successful',
        detail: 'Your account has been created.',
        life: 3000,
      });

      window.location.href = '/login'; // Redirect to login on successful registration
    } catch (error: any) {
      toast.current.show({
        severity: 'error',
        summary: 'Registration Failed',
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
          <h2 className="text-center text-2xl font-semibold text-[var(--secondary-color)] mb-4">
            Sign Up
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            {/* Username Field */}
            <div>
              <label
                htmlFor="username"
                className="block mb-2 text-lg text-[var(--text-color)] font-medium"
              >
                Username
              </label>
              <Controller
                name="username"
                control={control}
                render={({ field }) => (
                  <InputText
                    id="username"
                    {...field}
                    placeholder="Enter your username"
                    className="w-full p-3 rounded-lg border border-[var(--neutral-color,#ccc)]"
                  />
                )}
              />
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-lg text-[var(--text-color)] font-medium"
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
                    {...field}
                    placeholder="Enter your email"
                    className="w-full p-3 rounded-lg border border-[var(--neutral-color,#ccc)]"
                  />
                )}
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block mb-2 text-lg text-[var(--text-color)] font-medium"
              >
                Password
              </label>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Password
                    id="password"
                    {...field}
                    placeholder="Enter your password"
                    toggleMask
                    feedback={true}
                    inputClassName="w-full p-3 rounded-lg border border-[var(--neutral-color,#ccc)]"
                  />
                )}
              />
            </div>

            {/* Submit Button */}
            <Button
              label="Sign Up"
              type="submit"
              className="w-full p-3 rounded-lg bg-[var(--secondary-color)] text-white font-semibold text-lg"
            />
          </form>

          {/* Already Have Account Links */}
          <div className="mt-4 flex justify-center text-sm text-[var(--neutral-color,#666)]">
            <a
              href="/login"
              className="text-[var(--primary-color,#007bff)] hover:underline"
            >
              Already have an account?
            </a>
          </div>
        </div>
      </div>
      <div className="flex-grow"></div>
    </div>
  );
};

export default RegisterPage;
