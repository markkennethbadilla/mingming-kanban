"use client";

import React, { useRef, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Password } from "primereact/password";

// Validation schema
const validationSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof validationSchema>;

const LoginPage: React.FC = () => {
  const { control, handleSubmit, formState } = useForm<LoginFormData>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const toast = useRef<any>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return; // No token, user needs to log in

        const response = await fetch("/api/session", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          window.location.href = "/dashboard"; // Redirect to dashboard if session is valid
        }
      } catch (error) {
        console.error("Session validation error:", error);
      }
    };

    checkSession();
  }, []);

  useEffect(() => {
    if (formState.errors) {
      Object.values(formState.errors).forEach((error) => {
        toast.current.show({
          severity: "warn",
          summary: "Validation Error",
          detail: error.message,
          life: 3000,
        });
      });
    }
  }, [formState.errors]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message);
      }

      localStorage.setItem("authToken", result.token);
      window.location.href = "/dashboard"; // Redirect to dashboard on successful login
    } catch (error: any) {
      toast.current.show({
        severity: "error",
        summary: "Login Failed",
        detail: error.message || "An error occurred. Please try again.",
        life: 3000,
      });
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "87vh",
        backgroundColor: "var(--background-color)",
        padding: "20px",
      }}
    >
      <Toast ref={toast} />
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "24px",
          borderRadius: "12px",
          backgroundColor: "#fff",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: "600",
            textAlign: "center",
            color: "var(--primary-color)",
            marginBottom: "24px",
          }}
        >
          Log In
        </h2>
        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{ display: "grid", gap: "16px" }}
        >
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "1rem",
                color: "var(--text-color)",
                fontWeight: "500",
              }}
            >
              Email
            </label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <InputText
                  id="email"
                  type="email"
                  {...field}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid var(--neutral-color)",
                  }}
                />
              )}
            />
          </div>
          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "1rem",
                color: "var(--text-color)",
                fontWeight: "500",
              }}
            >
              Password
            </label>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Password
                  id="password"
                  {...field}
                  feedback={false} // Disable strength meter
                  toggleMask // Show/hide toggle for password
                  inputStyle={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid var(--neutral-color)",
                    boxShadow: "none",
                  }}
                  style={{
                    width: "100%",
                  }}
                />
              )}
            />
          </div>
          {/* Submit Button */}
          <Button
            label="Log In"
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              backgroundColor: "var(--primary-color)",
              color: "#fff",
              fontWeight: "600",
              fontSize: "1rem",
            }}
          />
        </form>
        {/* Forgot Password and No Account Links */}
        <div
          style={{
            marginTop: "16px",
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.9rem",
            color: "var(--neutral-color)",
          }}
        >
          <a
            href="/forgot-password"
            style={{
              color: "var(--primary-color)",
              textDecoration: "none",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.textDecoration = "underline")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.textDecoration = "none")
            }
          >
            Forgot Password?
          </a>
          <a
            href="/register"
            style={{
              color: "var(--primary-color)",
              textDecoration: "none",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.textDecoration = "underline")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.textDecoration = "none")
            }
          >
            Don’t have an account?
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
