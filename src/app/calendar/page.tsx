"use client";

import React, { useState, useEffect, useRef } from "react";
import { Calendar, CalendarDateTemplateEvent } from "primereact/calendar";
import { Toast } from "primereact/toast";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useRouter } from "next/navigation";
import axios from "axios";
import TaskCard from "../../components/TaskCard";
import { Task } from "@/types/task";
import { ToastProvider } from "@/context/ToastContext";
import { Button } from "primereact/button";

const CalendarPage: React.FC = () => {
  const router = useRouter();
  const toast = useRef<Toast>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date()); // Default to today

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await axios.get("/api/session", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          setUserId(response.data.user.id);
        } else {
          throw new Error("Failed to fetch user session.");
        }
      } catch (error) {
        console.error("Error fetching user session:", error);
        toast.current?.show({
          severity: "error",
          summary: "Session Error",
          detail: "Unable to fetch user session. Please log in again.",
          life: 3000,
        });
        localStorage.removeItem("authToken");
        router.push("/");
      }
    };

    fetchUserId();
  }, [router]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token || !userId) return;

        const response = await axios.get(`/api/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { userId },
        });

        if (response.data.success) {
          setTasks(response.data.tasks || []);
        } else {
          throw new Error("Failed to fetch tasks.");
        }
      } catch (error) {
        let errorMessage = "Failed to fetch tasks.";
        if (axios.isAxiosError(error) && error.response) {
          errorMessage = `Error: ${error.response.status} - ${
            error.response.data.message || errorMessage
          }`;
        }
        console.error(errorMessage, error);
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: errorMessage,
          life: 3000,
        });
      }
    };

    if (userId) fetchTasks();
  }, [userId]);

  const formatDate = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    const tomorrow = new Date(today);

    yesterday.setDate(today.getDate() - 1);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      })}`;
    }

    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    };

  const handleDateChange = (days: number) => {
    setSelectedDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + days);
      return newDate;
    });
  };

  const dateTemplate = (event: CalendarDateTemplateEvent) => {
    const { day, month, year } = event;
    const reconstructedDate = new Date(year, month, day);
    const dateKey = reconstructedDate.toISOString().split("T")[0];
    const hasTask = tasks.some(
      (task) => new Date(task.dueDate).toISOString().split("T")[0] === dateKey
    );
    return (
      <div className="calendar-day">
        <span className="day-number">{day}</span>
        {hasTask && <div className="task-dot"></div>} {/* Dot for days with tasks */}
      </div>
    );
  };

  const handleTaskDelete = async (id: number) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("User is not authenticated.");

      await axios.delete(`/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const tasksForSelectedDate =
    selectedDate &&
    tasks.filter(
      (task) =>
        new Date(task.dueDate).toISOString().split("T")[0] ===
        selectedDate.toISOString().split("T")[0]
    );

  return (
    <ToastProvider>
      <DndProvider backend={HTML5Backend}>
        <div className="min-h-screen px-6 flex flex-col items-center" style={{ backgroundColor: "var(--background-color)" }}>
          <Toast ref={toast} />
          <h1 className="text-4xl font-bold my-4" style={{ color: "var(--primary-color)" }}>
            Task Calendar
          </h1>
          <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-6">
            {/* Calendar Section */}
            <div className="bg-white shadow-lg rounded-lg p-4 flex items-center justify-center">
              <Calendar
                inline
                value={selectedDate}
                onSelect={(e) => setSelectedDate(e.value as Date)}
                dateTemplate={dateTemplate}
                showWeek
                numberOfMonths={1}
                className="custom-calendar"
              />
            </div>

            {/* Task Preview Section */}
            <div className="bg-white shadow-lg rounded-lg p-4 flex-grow lg:w-[40%] flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <Button
                  icon="pi pi-chevron-left"
                  className="p-button-text"
                  style={{
                    color: "gray"
                  }}
                  onClick={() => handleDateChange(-1)}
                />
                <h2 className="text-2xl font-semibold text-gray-800">
                  {selectedDate
                    ? `${formatDate(selectedDate)}`
                    : "Select a date"}
                </h2>
                <Button
                  icon="pi pi-chevron-right"
                  className="p-button-text"
                  style={{
                    color: "gray"
                  }}
                  onClick={() => handleDateChange(1)}
                />
              </div>
              <div className="flex-1 overflow-y-auto space-y-4">
                {tasksForSelectedDate && tasksForSelectedDate.length > 0 ? (
                  tasksForSelectedDate.map((task) => (
                    <div key={task.id} className="task-card">
                      <TaskCard
                        {...task}
                        onDelete={handleTaskDelete}
                        onStatusChange={() => {}} // Empty function to satisfy prop
                      />
                    </div>
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
      </DndProvider>
    </ToastProvider>
  );
};

export default CalendarPage;
