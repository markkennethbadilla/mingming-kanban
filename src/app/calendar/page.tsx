'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Calendar, CalendarDateTemplateEvent } from 'primereact/calendar';
import { Toast } from 'primereact/toast';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import TaskCard from '../../components/TaskCard';
import { Task } from '@/types/task';
import { ToastProvider } from '@/context/ToastContext';
import { Button } from 'primereact/button';

import '@/styles/CalendarPage.css';
import Loader from '@/components/Loader';

const CalendarPage: React.FC = () => {
  const router = useRouter();
  const toast = useRef<Toast>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const normalizeToLocalMidnight = (date: Date): Date => {
    const localMidnight = new Date(date);
    localMidnight.setHours(0, 0, 0, 0);
    return localMidnight;
  };

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
          setUserId(response.data.user.id);
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
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token || !userId) return;

        const response = await axios.get(`/api/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { userId },
        });

        if (response.data.success) {
          const normalizedTasks = response.data.tasks.map((task: Task) => ({
            ...task,
            dueDate: normalizeToLocalMidnight(new Date(task.dueDate)),
          }));

          setTasks(normalizedTasks);

          // Set today's date after loading tasks
          setSelectedDate(normalizeToLocalMidnight(new Date()));

          setLoading(false);
        } else {
          throw new Error('Failed to fetch tasks.');
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch tasks.',
          life: 3000,
        });
        setLoading(false);
      }
    };

    if (userId) fetchTasks();
  }, [userId]);

  const handleDateChange = (days: number) => {
    if (selectedDate) {
      setSelectedDate((prevDate) => {
        const newDate = new Date(prevDate!);
        newDate.setDate(newDate.getDate() + days);
        return normalizeToLocalMidnight(newDate);
      });
    }
  };

  const tasksForSelectedDate =
    selectedDate &&
    tasks.filter((task) => {
      const taskDateLocal = normalizeToLocalMidnight(task.dueDate);
      const selectedDateLocal = normalizeToLocalMidnight(selectedDate);
      return taskDateLocal.getTime() === selectedDateLocal.getTime();
    });

  const dateTemplate = (event: CalendarDateTemplateEvent) => {
    const { day, month, year } = event;
    const reconstructedDate = new Date(year, month, day);
    const dateKey = normalizeToLocalMidnight(reconstructedDate)
      .toISOString()
      .split('T')[0];
    const hasTask = tasks.some(
      (task) =>
        normalizeToLocalMidnight(task.dueDate).toISOString().split('T')[0] ===
        dateKey
    );
    return (
      <div className="calendar-day">
        <span className="day-number">{day}</span>
        {hasTask && <div className="task-dot"></div>}
      </div>
    );
  };

  const handleTaskDelete = async (id: number) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('User is not authenticated.');

      await axios.delete(`/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('User is not authenticated.');

      await axios.put(
        `/api/tasks/${id}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === id
            ? { ...task, status: newStatus as 'TO_DO' | 'IN_PROGRESS' | 'DONE' }
            : task
        )
      );
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to update task status.',
        life: 3000,
      });
    }
  };

  if (loading || !selectedDate) {
    return (
      <>
        <Loader />
      </>
    );
  }

  return (
    <ToastProvider>
      <DndProvider backend={HTML5Backend}>
        <div className="flex flex-col items-center px-6">
          <Toast ref={toast} />
          <h1
            className="text-3xl font-bold"
            style={{ color: 'var(--primary-color)' }}
          >
            Task Calendar
          </h1>

          <div className="flex flex-col lg:flex-row w-full max-w-6xl gap-6">
            {/* Calendar Container */}
            <div className="bg-white rounded-lg shadow p-4 h-fit w-full lg:w-auto">
              <Calendar
                inline
                value={selectedDate}
                onSelect={(e) =>
                  setSelectedDate(normalizeToLocalMidnight(e.value as Date))
                }
                dateTemplate={dateTemplate}
                showWeek
                numberOfMonths={1}
                className="custom-calendar"
              />
            </div>

            {/* Task List Section */}
            <div className="w-full lg:w-96">
              <div className="bg-white rounded-lg shadow p-4">
                {/* Date and Arrows at the top */}
                <div className="flex justify-between items-center mb-4">
                  <Button
                    icon="pi pi-chevron-left"
                    className="p-button-text"
                    onClick={() => handleDateChange(-1)}
                  />
                  <h2 className="text-xl font-semibold text-center">
                    {normalizeToLocalMidnight(selectedDate).toLocaleDateString(
                      'en-US',
                      {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      }
                    )}
                  </h2>
                  <Button
                    icon="pi pi-chevron-right"
                    className="p-button-text"
                    onClick={() => handleDateChange(1)}
                  />
                </div>
                {/* Task List */}
                <div className="flex flex-col">
                  {tasksForSelectedDate && tasksForSelectedDate.length > 0 ? (
                    tasksForSelectedDate.map((task) => (
                      <TaskCard
                        key={task.id}
                        {...task}
                        onDelete={handleTaskDelete}
                        onStatusChange={handleStatusChange}
                      />
                    ))
                  ) : (
                    <p className="text-gray-500 italic text-center">
                      No tasks for this date.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DndProvider>
    </ToastProvider>
  );
};

export default CalendarPage;
