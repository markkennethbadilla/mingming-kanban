'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { Task } from '../types/task';

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState('');

  const fetchTasks = async () => {
    try {
      const res = await axios.get('/api/tasks');
      setTasks(res.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        // Now TypeScript knows `err` is of type `AxiosError`
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/tasks/${id}`);
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Task Manager</h1>
      {error && <p className="text-red-500">{error}</p>}
      <div className="mb-4">
        <Link href="/new">
          <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Create New Task
          </button>
        </Link>
      </div>
      <ul>
        {tasks.map((task) => (
          <li
            key={task.id}
            className="mb-2 border p-2 rounded flex justify-between items-center"
          >
            <div>
              <div className="font-semibold">{task.title}</div>
              <div>Start: {task.startTime}</div>
              <div>End: {task.endTime}</div>
            </div>
            <div className="flex space-x-2">
              <Link href={`/edit/${task.id}`}>
                <button className="text-blue-500 hover:text-blue-700">
                  <FaEdit />
                </button>
              </Link>
              <button
                className="text-red-500 hover:text-red-700"
                onClick={() => handleDelete(task.id)}
              >
                <FaTrash />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}