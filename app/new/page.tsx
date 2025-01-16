'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import TaskForm from '@/components/TaskForm';
import { Task } from '@/types/task';

export default function NewTaskPage() {
  const router = useRouter();
  const [message, setMessage] = useState('');

  const handleTaskCreated = (task: Task) => {
    setMessage(`Task "${task.title}" created successfully!`);
    setTimeout(() => router.push('/'), 1500);
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create a New Task</h1>
      <TaskForm onTaskCreated={handleTaskCreated} />
      {message && <p className="text-green-500 mt-4">{message}</p>}
    </div>
  );
}