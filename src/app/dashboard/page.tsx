"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TaskCard from "../../components/TaskCard";
import Loader from "../../components/Loader";
import quotes from "../../data/quotes.json";
import { DndProvider, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ToastProvider } from "@/context/ToastContext";

const DashboardPage: React.FC = () => {
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterType, setFilterType] = useState("date");
  const [filteredTasks, setFilteredTasks] = useState([]);
  const router = useRouter();
  const [quote, setQuote] = useState("");

  useEffect(() => {
    const fetchUserAndTasks = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          router.push("/login");
          return;
        }

        const userResponse = await fetch("/api/session", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!userResponse.ok) {
          if (userResponse.status === 401) {
            localStorage.removeItem("authToken");
            router.push("/");
            return;
          }
          throw new Error("Failed to fetch user data.");
        }

        const userData = await userResponse.json();
        setUser(userData.user);

        const tasksResponse = await fetch(
          `/api/tasks?userId=${userData.user.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!tasksResponse.ok) {
          throw new Error("Failed to fetch tasks.");
        }

        const tasksData = await tasksResponse.json();
        setTasks(tasksData.tasks || []);
        setFilteredTasks(tasksData.tasks || []);
      } catch (err: any) {
        setError(err.message || "An error occurred.");
      } finally {
        setLoading(false);
      }
    };

    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    fetchUserAndTasks();
  }, [router]);

  useEffect(() => {
    if (filterType === "date") {
      setFilteredTasks(
        [...tasks].sort(
          (a, b) =>
            new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        )
      );
    } else if (filterType === "priority") {
      setFilteredTasks(
        [...tasks].sort((a, b) => {
          if (a.priority === b.priority) {
            return (
              new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
            );
          }
          return a.priority.localeCompare(b.priority);
        })
      );
    }
  }, [filterType, tasks]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      // Optimistic update
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === id ? { ...task, status: newStatus } : task
        )
      );

      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("User is not authenticated.");

      const response = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task status.");
      }
    } catch (error) {
      console.error("Error updating task status:", error);

      // Revert optimistic update if the API call fails
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === id ? { ...task, status: task.status } : task
        )
      );
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterType(e.target.value);
  };

  const groupedTasks = {
    TO_DO: filteredTasks.filter((task) => task.status === "TO_DO"),
    IN_PROGRESS: filteredTasks.filter((task) => task.status === "IN_PROGRESS"),
    DONE: filteredTasks.filter((task) => task.status === "DONE"),
  };

  const Column: React.FC<{ status: string; children: React.ReactNode }> = ({
    status,
    children,
  }) => {
    const ref = React.useRef<HTMLDivElement>(null);
    const [, drop] = useDrop({
      accept: "TASK",
      drop: (item: { id: number; status: string }) => {
        handleStatusChange(item.id, status);
      },
    });

    drop(ref);

    return (
      <div
        ref={ref}
        style={{
          height: "calc(98vh - 64px)",
          overflowY: "auto",
          scrollbarWidth: "thin",
          scrollbarColor: "var(--neutral-color) var(--background-color)",
        }}
      >
        {children}
      </div>
    );
  };

  if (loading) return <Loader />;
  if (error)
    return (
      <p style={{ color: "var(--secondary-color)", textAlign: "center" }}>
        {error}
      </p>
    );

  return (
    <ToastProvider>
      <DndProvider backend={HTML5Backend}>
        <div
          style={{
            backgroundColor: "var(--background-color)",
            padding: "20px",
            height: "98vh",
          }}
        >
          <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
            {/* Header Section */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: "2rem",
                    fontWeight: "bold",
                    color: "var(--primary-color)",
                  }}
                >
                  Welcome, {user ? user.username : "User"}!
                </h2>
                <p
                  style={{
                    fontSize: "1rem",
                    color: "var(--neutral-color)",
                    fontStyle: "italic",
                  }}
                >
                  &quot;{quote}&quot;
                </p>
              </div>
              <div>
                <label
                  htmlFor="filter"
                  style={{
                    marginRight: "10px",
                    fontSize: "1rem",
                    color: "var(--text-color)",
                  }}
                >
                  Filter by:
                </label>
                <select
                  id="filter"
                  value={filterType}
                  onChange={handleFilterChange}
                  style={{
                    padding: "10px",
                    border: "1px solid var(--neutral-color)",
                    borderRadius: "8px",
                    backgroundColor: "var(--background-color)",
                    color: "var(--text-color)",
                    outline: "none",
                  }}
                >
                  <option value="date">Date</option>
                  <option value="priority">Priority</option>
                </select>
              </div>
            </div>
            {/* Tasks Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "20px",
              }}
            >
              {/* To Do Column */}
              <div>
                <h3
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: "600",
                    color: "var(--secondary-color)",
                  }}
                >
                  To Do
                </h3>
                <Column status="TO_DO">
                  {groupedTasks.TO_DO.length > 0 ? (
                    groupedTasks.TO_DO.map((task) => (
                      <TaskCard
                        key={task.id}
                        {...task}
                        onStatusChange={handleStatusChange}
                        onDelete={(id) => {
                          setTasks((prevTasks) =>
                            prevTasks.filter((task) => task.id !== id)
                          ); // Update UI optimistically
                          try {
                            const token = localStorage.getItem("authToken");
                            if (!token)
                              throw new Error("User not authenticated.");
                            fetch(`/api/tasks/${id}`, {
                              method: "DELETE",
                              headers: { Authorization: `Bearer ${token}` },
                            }).catch((error) =>
                              console.error("Error deleting task:", error)
                            );
                          } catch (error) {
                            console.error("Error deleting task:", error);
                          }
                        }}
                      />
                    ))
                  ) : (
                    <p style={{ color: "var(--text-color)" }}>
                      No tasks to do yet.
                    </p>
                  )}
                </Column>
              </div>
              {/* In Progress Column */}
              <div>
                <h3
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: "600",
                    color: "var(--secondary-color)",
                  }}
                >
                  In Progress
                </h3>
                <Column status="IN_PROGRESS">
                  {groupedTasks.IN_PROGRESS.length > 0 ? (
                    groupedTasks.IN_PROGRESS.map((task) => (
                      <TaskCard
                        key={task.id}
                        {...task}
                        onStatusChange={handleStatusChange}
                        onDelete={(id) => {
                          setTasks((prevTasks) =>
                            prevTasks.filter((task) => task.id !== id)
                          ); // Update UI optimistically
                          try {
                            const token = localStorage.getItem("authToken");
                            if (!token)
                              throw new Error("User not authenticated.");
                            fetch(`/api/tasks/${id}`, {
                              method: "DELETE",
                              headers: { Authorization: `Bearer ${token}` },
                            }).catch((error) =>
                              console.error("Error deleting task:", error)
                            );
                          } catch (error) {
                            console.error("Error deleting task:", error);
                          }
                        }}
                      />
                    ))
                  ) : (
                    <p style={{ color: "var(--text-color)" }}>
                      No tasks in progress.
                    </p>
                  )}
                </Column>
              </div>
              {/* Done Column */}
              <div>
                <h3
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: "600",
                    color: "var(--secondary-color)",
                  }}
                >
                  Done
                </h3>
                <Column status="DONE">
                  {groupedTasks.DONE.length > 0 ? (
                    groupedTasks.DONE.map((task) => (
                      <TaskCard
                        key={task.id}
                        {...task}
                        onStatusChange={handleStatusChange}
                        onDelete={(id) => {
                          setTasks((prevTasks) =>
                            prevTasks.filter((task) => task.id !== id)
                          ); // Update UI optimistically
                          try {
                            const token = localStorage.getItem("authToken");
                            if (!token)
                              throw new Error("User not authenticated.");
                            fetch(`/api/tasks/${id}`, {
                              method: "DELETE",
                              headers: { Authorization: `Bearer ${token}` },
                            }).catch((error) =>
                              console.error("Error deleting task:", error)
                            );
                          } catch (error) {
                            console.error("Error deleting task:", error);
                          }
                        }}
                      />
                    ))
                  ) : (
                    <p style={{ color: "var(--text-color)" }}>
                      No completed tasks yet.
                    </p>
                  )}
                </Column>
              </div>
            </div>
          </div>
        </div>
      </DndProvider>
    </ToastProvider>
  );
};

export default DashboardPage;
