'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter, useParams } from 'next/navigation';
import TaskForm from '@/components/TaskForm';
import { Task } from '@/types/task';

export default function EditTaskPage() {
  const router = useRouter();
  const params = useParams();
  const [initialValues, setInitialValues] = useState<Task | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) {
      axios
        .get(`/api/tasks/${params.id}`)
        .then((res) => setInitialValues(res.data))
        .catch((err) => setError(err.message));
    }
  }, [params.id]);

  const handleTaskUpdated = () => {
    setMessage('Task updated successfully!');
    setTimeout(() => router.push('/'), 1500);
  };

  if (error) {
    return <p className="p-6 text-red-500">{error}</p>;
  }
  if (!initialValues) {
    return <p className="p-6">Loading...</p>;
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Task</h1>
      <TaskForm
        editMode
        initialValues={initialValues}
        onTaskUpdated={handleTaskUpdated}
      />
      {message && <p className="text-green-500 mt-4">{message}</p>}
    </div>
  );
}
