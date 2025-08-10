'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import TaskForm from '@/components/TaskForm';
import { Toast } from 'primereact/toast';
import Loader from '@/components/Loader';

const EditTaskPage: React.FC = () => {
  const [initialData, setInitialData] = useState(null);
  const [error, setError] = useState('');
  const toast = useRef<Toast>(null);
  const params = useParams();
  const router = useRouter();
  const taskId = params.taskId;

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/session', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage = 'Failed to fetch user session.';
        if (response.status === 401) {
          errorMessage =
            errorData.message || 'Unauthorized. Please log in again.';
        } else if (response.status === 404) {
          errorMessage = errorData.message || 'User not found.';
        }
        throw new Error(errorMessage);
      }
      return true; // User session is valid
    } catch (error: any) {
      console.error('Error fetching user session:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Failed to fetch user session.',
        life: 5000,
      });
      window.location.href = '/'; // Redirect to home page
    }
  };

  useEffect(() => {
    const fetchTask = async () => {
      const userSessionValid = await fetchUser(); // Check session before fetching task
      if (!userSessionValid) return; // If session is invalid, do not proceed

      try {
        const response = await fetch(`/api/tasks/${taskId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
        if (!response.ok) {
          if (response.status === 404) {
            setError('Task not found.');
          } else {
            throw new Error('Failed to fetch task data.');
          }
          return;
        }
        const data = await response.json();
        setInitialData(data.task);
      } catch (error) {
        console.error(error);
        setError(error.message || 'Something went wrong.');
      }
    };
    fetchTask();
  }, [taskId]);

  const handleTaskDelete = async () => {
    const userSessionValid = await fetchUser(); // Check session before deleting task
    if (!userSessionValid) return; // If session is invalid, do not proceed

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to delete task.');
      }
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Task deleted successfully.',
        life: 3000,
      });
      setTimeout(() => router.push(document.referrer), 3000);
    } catch (error) {
      console.error(error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Failed to delete task.',
        life: 3000,
      });
    }
  };

  const handleTaskSubmit = async (data: any) => {
    const userSessionValid = await fetchUser(); // Check session before submitting task
    if (!userSessionValid) return; // If session is invalid, do not proceed

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update task.');
      }
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Task updated successfully.',
        life: 3000,
      });
      setTimeout(() => router.push(document.referrer), 3000);
    } catch (error) {
      console.error(error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Failed to update task.',
        life: 3000,
      });
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[87vh] text-center">
        <p className="text-[var(--secondary-color)] text-lg">{error}</p>
        <button
          className="mt-4 px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg cursor-pointer text-lg border-none transition-colors duration-200"
          onClick={() => router.back()}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor =
              'var(--primary-color-light)')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = 'var(--primary-color)')
          }
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center bg-[var(--background-color)]">
      <Toast ref={toast} />
      {initialData ? (
        <div className="w-full max-w-2xl bg-white rounded-lg p-6 shadow-md">
          <a
            className="inline-block text-sm text-[var(--primary-color)] cursor-pointer hover:underline"
            onClick={() => router.back()}
          >
            &larr; Back
          </a>
          {/* Page Header */}
          <h2 className="text-center text-[var(--primary-color)] text-2xl font-semibold">
            Edit Task
          </h2>
          {/* Task Form */}
          <TaskForm
            onSubmit={handleTaskSubmit}
            onDelete={handleTaskDelete}
            initialData={initialData}
          />
        </div>
      ) : (
        <Loader />
      )}
    </div>
  );
};

export default EditTaskPage;
