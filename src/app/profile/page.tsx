'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { InputSwitch } from 'primereact/inputswitch';
import { useRouter } from 'next/navigation';
import Loader from '@/components/Loader';
import axios from 'axios';

// Validation schema
const validationSchema = (enablePasswordChange: boolean) =>
  z
    .object({
      username: z.string().nonempty('Username is required'),
      email: z.string().email('Invalid email format'),
      password: enablePasswordChange
        ? z.string().min(6, 'Password must be at least 6 characters')
        : z.string().optional(),
      confirmPassword: enablePasswordChange
        ? z.string().min(6, 'Confirm Password must be at least 6 characters')
        : z.string().optional(),
    })
    .refine(
      (data) => !enablePasswordChange || data.password === data.confirmPassword,
      {
        message: 'Passwords must match',
        path: ['confirmPassword'],
      }
    );

type ProfileFormData = z.infer<ReturnType<typeof validationSchema>>;

const ProfilePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [enablePasswordChange, setEnablePasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState(''); // State for the current password
  const [isDialogVisible, setIsDialogVisible] = useState(false); // Dialog visibility
  const toast = useRef<Toast>(null);
  const router = useRouter();

  const {
    control,
    handleSubmit,
    setValue,
    trigger,
    getValues,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(validationSchema(enablePasswordChange)),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await axios.get('/api/session', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
        } else {
          throw new Error('Failed to fetch user session.');
        }
      } catch (error) {
        console.error('Error fetching user session:', error);
        toast.current?.show({
          severity: 'error',
          summary: 'Session Error',
          detail: 'Unable to fetch user session. Please log in again.',
          life: 3000,
        });
        localStorage.removeItem('authToken');
        router.push('/');
      }
    };

    fetchUserId();
  }, [router]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('Not authenticated. Please log in.');

        const response = await fetch('/api/session', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401) {
          localStorage.removeItem('authToken');
          toast.current?.show({
            severity: 'warn',
            summary: 'Session Expired',
            detail: 'Your session has expired. Please log in again.',
            life: 3000,
          });
          setTimeout(() => {
            window.location.href = '/';
          }, 3000);
          return;
        }

        if (!response.ok) throw new Error('Failed to fetch profile data.');

        const data = await response.json();
        setValue('username', data.user.username);
        setValue('email', data.user.email);
        setLoading(false);
      } catch (err) {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: err.message || 'An error occurred.',
          life: 3000,
        });
        setLoading(false);
      }
    };

    fetchProfile();
  }, [setValue]);

  useEffect(() => {
    reset(getValues()); // Reset the form with current values to avoid clearing fields
  }, [enablePasswordChange, reset, getValues]);

  const onSubmit = async () => {
    const valid = await trigger(); // Trigger validation
    if (!valid) {
      // Display validation errors as toast notifications
      Object.keys(errors).forEach((field) => {
        const error = errors[field as keyof ProfileFormData]?.message;
        if (error) {
          toast.current?.show({
            severity: 'error',
            summary: 'Validation Error',
            detail: error,
            life: 3000,
          });
        }
      });
      return;
    }

    setIsDialogVisible(true);
  };

  const handleConfirm = async () => {
    const newPassword = getValues('password');

    if (enablePasswordChange && newPassword === currentPassword) {
      toast.current?.show({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'New password cannot be the same as the current password.',
        life: 3000,
      });
      return;
    }

    setIsDialogVisible(false);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found.');
        throw new Error('Not authenticated. Please log in.');
      }

      const payload: Partial<ProfileFormData> = {
        username: getValues('username'),
        email: getValues('email'),
        ...(enablePasswordChange && {
          password: newPassword,
          confirmPassword: getValues('confirmPassword'),
        }),
      };

      const response = await fetch('/api/users/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...payload, currentPassword }),
      });

      if (!response.ok) {
        console.error('Failed to update profile:', response.statusText);
        throw new Error('Failed to update profile.');
      }

      toast.current?.show({
        severity: 'success',
        summary: 'Profile Updated',
        detail: 'Your profile was updated successfully.',
        life: 3000,
      });

      if (enablePasswordChange) {
        setValue('password', ''); // Clear password fields only
        setValue('confirmPassword', '');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Update Failed',
        detail: err.message || 'Something went wrong.',
        life: 3000,
      });
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="flex flex-col min-h-[87vh] bg-[var(--background-color,#f4f4f4)]">
      <div className="flex-grow"></div>
      <div className="flex justify-center items-center">
        <Toast ref={toast} />
        <Dialog
          visible={isDialogVisible}
          header="Confirm Changes"
          modal
          onHide={() => setIsDialogVisible(false)}
          footer={
            <div>
              <Button
                label="Cancel"
                icon="pi pi-times"
                className="p-button-text"
                onClick={() => setIsDialogVisible(false)}
              />
              <Button
                label="Confirm"
                icon="pi pi-check"
                onClick={handleConfirm}
              />
            </div>
          }
        >
          <div className="flex items-center gap-4">
            <i className="pi pi-exclamation-triangle text-2xl text-[var(--warn-color,#f39c12)]" />
            <div className="flex-1">
              <p>Enter your current password to confirm changes:</p>
              <Password
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current Password"
                feedback={false}
                toggleMask
                className="mt-2 w-full"
              />
            </div>
          </div>
        </Dialog>

        <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
          <a
            className="inline-block mb-4 text-sm text-[var(--primary-color)] cursor-pointer hover:underline"
            onClick={() => router.back()}
          >
            &larr; Back
          </a>

          <h2 className="text-center text-2xl font-semibold text-[var(--primary-color)] mb-4">
            Profile Settings
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <Controller
              name="username"
              control={control}
              render={({ field }) => (
                <InputText
                  {...field}
                  placeholder="Enter your username"
                  className="w-full p-3 rounded-lg border border-[var(--neutral-color,#ccc)]"
                />
              )}
            />

            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <InputText
                  {...field}
                  placeholder="Enter your email"
                  className="w-full p-3 rounded-lg border border-[var(--neutral-color,#ccc)]"
                />
              )}
            />

            <div className="flex items-center gap-3">
              <label className="text-[var(--text-color)] font-medium">
                Change Password
              </label>
              <InputSwitch
                checked={enablePasswordChange}
                onChange={(e) => setEnablePasswordChange(e.value)}
              />
            </div>

            {enablePasswordChange && (
              <>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <Password
                      {...field}
                      placeholder="Enter new password"
                      feedback
                      toggleMask
                      className="w-full"
                    />
                  )}
                />
                <Controller
                  name="confirmPassword"
                  control={control}
                  render={({ field }) => (
                    <Password
                      {...field}
                      placeholder="Confirm new password"
                      feedback={false}
                      toggleMask
                      className="w-full"
                    />
                  )}
                />
              </>
            )}

            <Button
              label="Save Changes"
              type="submit"
              className="w-full p-3 rounded-lg bg-[var(--primary-color)] text-white"
            />
          </form>
        </div>
      </div>
      <div className="flex-grow"></div>
    </div>
  );
};

export default ProfilePage;
