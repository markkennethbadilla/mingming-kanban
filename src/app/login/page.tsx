"use client";

import React, { useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";

// Validation schema using zod
const validationSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof validationSchema>;

const LoginPage: React.FC = () => {
  const { control, handleSubmit } = useForm<LoginFormData>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const toast = useRef<any>(null);
  const [showPassword, setShowPassword] = useState(false);

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
        throw new Error(result.message || "Invalid credentials");
      }

      localStorage.setItem("authToken", result.token);
      window.location.href = "/dashboard";
    } catch (error) {
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
        height: "88vh",
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
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "grid", gap: "16px" }}>
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
              render={({ field, fieldState }) => (
                <InputText
                  id="email"
                  type="email"
                  {...field}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: `1px solid ${
                      fieldState.invalid ? "var(--secondary-color)" : "var(--neutral-color)"
                    }`,
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
            <div style={{ position: "relative" }}>
              <Controller
                name="password"
                control={control}
                render={({ field, fieldState }) => (
                  <InputText
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...field}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: `1px solid ${
                        fieldState.invalid ? "var(--secondary-color)" : "var(--neutral-color)"
                      }`,
                    }}
                  />
                )}
              />
              <Button
                type="button"
                icon={showPassword ? "pi pi-eye-slash" : "pi pi-eye"}
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  top: "50%",
                  right: "10px",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--neutral-color)",
                }}
              />
            </div>
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
      </div>
    </div>
  );
};

export default LoginPage;
