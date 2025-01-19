"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import TaskForm from "@/components/TaskForm";

const CreateTaskPage: React.FC = () => {
  const [error, setError] = useState("");
  const router = useRouter();

  const handleTaskSubmit = async (data: any) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create task.");
      }

      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      setError(error.message || "Something went wrong.");
    }
  };

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          textAlign: "center",
        }}
      >
        <p style={{ color: "var(--secondary-color)", fontSize: "1rem" }}>{error}</p>
        <button
          style={{
            marginTop: "16px",
            padding: "10px 16px",
            backgroundColor: "var(--primary-color)",
            color: "#fff",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "1rem",
            border: "none",
            transition: "background-color 0.2s",
          }}
          onClick={() => router.push("/dashboard")}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--primary-color-light)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--primary-color)")}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--background-color)",
        padding: "24px 0",
        height: "87vh"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "800px",
          backgroundColor: "#fff",
          borderRadius: "8px",
          padding: "24px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <a
          style={{
            display: "inline-block",
            marginBottom: "16px",
            fontSize: "0.875rem",
            color: "var(--primary-color)",
            cursor: "pointer",
            textDecoration: "none",
          }}
          onClick={() => router.push("/dashboard")}
          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
        >
          &larr; Back to Dashboard
        </a>

        {/* Page Header */}
        <h2
          style={{
            textAlign: "center",
            color: "var(--primary-color)",
            fontSize: "1.5rem",
            fontWeight: "600",
            marginBottom: "32px"
          }}
        >
          Create Task
        </h2>

        {/* Task Form */}
        <TaskForm onSubmit={handleTaskSubmit} />
      </div>
    </div>
  );
};

export default CreateTaskPage;
