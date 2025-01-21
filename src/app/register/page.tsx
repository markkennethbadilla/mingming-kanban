"use client";

import React, { useRef, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Password } from "primereact/password";

// Validation schema using zod
const validationSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterFormData = z.infer<typeof validationSchema>;

const RegisterPage: React.FC = () => {
  const { control, handleSubmit, formState } = useForm<RegisterFormData>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const toast = useRef<any>(null);

  // Show validation errors as Toast messages
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

  // Check if the user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;

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

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Registration failed");
      }

      toast.current.show({
        severity: "success",
        summary: "Registration Successful",
        detail: "Your account has been created.",
        life: 3000,
      });

      window.location.href = "/login"; // Redirect to login on successful registration
    } catch (error: any) {
      toast.current.show({
        severity: "error",
        summary: "Registration Failed",
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
            color: "var(--secondary-color)",
            marginBottom: "24px",
          }}
        >
          Sign Up
        </h2>
        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{ display: "grid", gap: "16px" }}
        >
          {/* Username Field */}
          <div>
            <label
              htmlFor="username"
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "1rem",
                color: "var(--text-color)",
                fontWeight: "500",
              }}
            >
              Username
            </label>
            <Controller
              name="username"
              control={control}
              render={({ field }) => (
                <InputText
                  id="username"
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
                  toggleMask
                  feedback={true}
                  inputStyle={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid var(--neutral-color)",
                  }}
                />
              )}
            />
          </div>

          {/* Submit Button */}
          <Button
            label="Sign Up"
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              backgroundColor: "var(--secondary-color)",
              color: "#fff",
              fontWeight: "600",
              fontSize: "1rem",
            }}
          />
        </form>

        {/* Already Have Account Links */}
        <div
          style={{
            marginTop: "16px",
            display: "flex",
            justifyContent: "center",
            fontSize: "0.9rem",
            color: "var(--neutral-color)",
          }}
        >
          <a
            href="/login"
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
            Already have an account?
          </a>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
