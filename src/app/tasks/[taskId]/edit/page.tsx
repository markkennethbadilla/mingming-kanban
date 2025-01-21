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
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '87vh',
          textAlign: 'center',
        }}
      >
        <p style={{ color: 'var(--secondary-color)', fontSize: '1rem' }}>
          {error}
        </p>
        <button
          style={{
            marginTop: '16px',
            padding: '10px 16px',
            backgroundColor: 'var(--primary-color)',
            color: '#fff',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            border: 'none',
            transition: 'background-color 0.2s',
          }}
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
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--background-color)',
        padding: '24px 0',
        height: '87vh',
      }}
    >
      <Toast ref={toast} />
      {initialData ? (
        <div
          style={{
            width: '100%',
            maxWidth: '800px',
            backgroundColor: '#fff',
            borderRadius: '8px',
            padding: '24px',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          }}
        >
          <a
            style={{
              display: 'inline-block',
              marginBottom: '16px',
              fontSize: '0.875rem',
              color: 'var(--primary-color)',
              cursor: 'pointer',
              textDecoration: 'none',
            }}
            onClick={() => router.back()}
            onMouseEnter={(e) =>
              (e.currentTarget.style.textDecoration = 'underline')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.textDecoration = 'none')
            }
          >
            &larr; Back
          </a>
          {/* Page Header */}
          <h2
            style={{
              textAlign: 'center',
              color: 'var(--primary-color)',
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '32px',
            }}
          >
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
