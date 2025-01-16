'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import { Task } from '@/types/task';

export default function DailyTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [today, setToday] = useState(moment().format('YYYY-MM-DD'));
  const [error, setError] = useState('');

  const fetchTasks = async () => {
    try {
      const res = await axios.get('/api/tasks');
      setTasks(res.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unknown error occurred');
      }
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter((task) => {
    const taskDate = moment(task.startTime).format('YYYY-MM-DD');
    return taskDate === today;
  });

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Tasks for {today}</h1>
      {error && <p className="text-red-500">{error}</p>}
      <div className="mb-4 space-x-2">
        <button
          onClick={() => setToday(moment().format('YYYY-MM-DD'))}
          className="bg-gray-300 px-2 py-1 rounded"
        >
          Today
        </button>
        <button
          onClick={() =>
            setToday(moment().add(1, 'day').format('YYYY-MM-DD'))
          }
          className="bg-gray-300 px-2 py-1 rounded"
        >
          Tomorrow
        </button>
      </div>
      <ul className="mt-4">
        {filteredTasks.map((task) => (
          <li key={task.id} className="mb-2 border p-2 rounded">
            <div className="font-semibold">{task.title}</div>
            <div>Start: {task.startTime}</div>
            <div>End: {task.endTime}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}