'use client';

import { useEffect, useRef, useCallback } from 'react';
import { speak, notify } from '@/lib/platform';

interface Task {
  id: number;
  title: string;
  dueDate: string;
  priority: string;
  status: string;
}

type CheckInType = 'morning' | 'deadline' | 'idle' | 'evening';

interface CheckIn {
  type: CheckInType;
  message: string;
  spoken: string;
}

function getTimeBasedCheckIn(tasks: Task[]): CheckIn | null {
  const now = new Date();
  const hour = now.getHours();
  const activeTasks = tasks.filter((t) => t.status !== 'DONE');
  const today = now.toISOString().split('T')[0];
  const dueTodayCount = activeTasks.filter(
    (t) => t.dueDate.split('T')[0] === today
  ).length;

  // Morning briefing (7-9 AM, once per day)
  if (hour >= 7 && hour <= 9) {
    const briefedToday = localStorage.getItem('mingming-morning-briefing');
    if (briefedToday === today) return null;
    localStorage.setItem('mingming-morning-briefing', today);

    if (activeTasks.length === 0) {
      return {
        type: 'morning',
        message: 'Good morning! Your day is clear. Want to plan something?',
        spoken: 'Good morning! Your day is clear. Want to plan something?',
      };
    }
    return {
      type: 'morning',
      message: `Good morning! You have ${activeTasks.length} active task${activeTasks.length > 1 ? 's' : ''}${dueTodayCount > 0 ? `, ${dueTodayCount} due today` : ''}. Let's make it a great day!`,
      spoken: `Good morning! You have ${activeTasks.length} active tasks. ${dueTodayCount > 0 ? `${dueTodayCount} are due today.` : ''} Let's make it a great day!`,
    };
  }

  // Evening wrap-up (8-10 PM, once per day)
  if (hour >= 20 && hour <= 22) {
    const wrappedToday = localStorage.getItem('mingming-evening-wrap');
    if (wrappedToday === today) return null;
    localStorage.setItem('mingming-evening-wrap', today);

    const doneToday = tasks.filter(
      (t) => t.status === 'DONE'
    ).length;
    return {
      type: 'evening',
      message: `Nice work today! You completed ${doneToday} task${doneToday !== 1 ? 's' : ''}. ${activeTasks.length > 0 ? `${activeTasks.length} still on your plate for tomorrow.` : 'All clear!'} Rest up!`,
      spoken: `Nice work today! You completed ${doneToday} tasks. Rest up!`,
    };
  }

  return null;
}

function getDeadlineAlerts(tasks: Task[]): CheckIn | null {
  const now = new Date();
  const thirtyMinFromNow = new Date(now.getTime() + 30 * 60 * 1000);
  const alertedKey = 'mingming-deadline-alerted';
  const alerted: string[] = JSON.parse(localStorage.getItem(alertedKey) || '[]');

  const upcoming = tasks.filter((t) => {
    if (t.status === 'DONE') return false;
    const due = new Date(t.dueDate);
    return due > now && due <= thirtyMinFromNow && !alerted.includes(String(t.id));
  });

  if (upcoming.length === 0) return null;

  const task = upcoming[0];
  alerted.push(String(task.id));
  localStorage.setItem(alertedKey, JSON.stringify(alerted));

  return {
    type: 'deadline',
    message: `Heads up! "${task.title}" is due in less than 30 minutes.`,
    spoken: `Heads up! ${task.title} is due soon.`,
  };
}

export function useProactive(
  tasks: Task[],
  onCheckIn: (checkIn: CheckIn) => void
) {
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  const check = useCallback(() => {
    const currentTasks = tasksRef.current;

    // Check deadline alerts first (more urgent)
    const deadline = getDeadlineAlerts(currentTasks);
    if (deadline) {
      speak(deadline.spoken);
      notify('MingMing', deadline.message);
      onCheckIn(deadline);
      return;
    }

    // Then time-based check-ins
    const timeBased = getTimeBasedCheckIn(currentTasks);
    if (timeBased) {
      speak(timeBased.spoken);
      notify('MingMing', timeBased.message);
      onCheckIn(timeBased);
    }
  }, [onCheckIn]);

  useEffect(() => {
    // Run once on mount
    const timeout = setTimeout(check, 3000);
    // Then every 5 minutes
    const interval = setInterval(check, 5 * 60 * 1000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [check]);
}