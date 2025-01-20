"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import Loader from "@/components/Loader";
import { useRouter } from "next/navigation";

const validationSchema = z.object({
  username: z.string().nonempty("Username is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

type ProfileFormData = z.infer<typeof validationSchema>;

const ProfilePage: React.FC = () => {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
    resolver: zodResolver(validationSchema),
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const toast = React.useRef<Toast>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("Not authenticated. Please log in.");

        const response = await fetch("/api/session", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401) {
          localStorage.removeItem("authToken");
          toast.current?.show({
            severity: "warn",
            summary: "Session Expired",
            detail: "Your session has expired. Please log in again.",
            life: 3000,
          });
          setTimeout(() => {
            window.location.href = "/landing";
          }, 3000);
          return;
        }

        if (!response.ok) throw new Error("Failed to fetch profile data.");

        const data = await response.json();
        setValue("username", data.user.username);
        setValue("email", data.user.email);
        setLoading(false);
      } catch (err) {
        setError(err.message || "An error occurred.");
        setLoading(false);
      }
    };

    fetchProfile();
  }, [setValue]);

  const onSubmit = async (data: ProfileFormData) => {
    confirmDialog({
      message: "Do you want to save the changes?",
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          const token = localStorage.getItem("authToken");
          if (!token) throw new Error("Not authenticated. Please log in.");

          const response = await fetch("/api/users/update-profile", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
          });

          if (!response.ok) throw new Error("Failed to update profile.");

          toast.current?.show({
            severity: "success",
            summary: "Profile Updated",
            detail: "Your profile was updated successfully.",
            life: 3000,
          });
        } catch (err) {
          toast.current?.show({
            severity: "error",
            summary: "Update Failed",
            detail: err.message || "Something went wrong.",
            life: 3000,
          });
        }
      },
    });
  };

  if (loading) return <Loader />;

  if (error)
    return (
      <p style={{ textAlign: "center", color: "var(--secondary-color)" }}>
        {error}
      </p>
    );

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "var(--background-color)",
        height: "87vh",
      }}
    >
      <Toast ref={toast} />
      <ConfirmDialog />
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          backgroundColor: "#fff",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
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
          onClick={() => router.back()}
          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
        >
          &larr; Back
        </a>

        <h2
          style={{
            textAlign: "center",
            fontSize: "1.5rem",
            fontWeight: "600",
            color: "var(--primary-color)",
            marginBottom: "16px",
          }}
        >
          Profile Settings
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "grid", gap: "16px" }}>
          {/* Username Field */}
          <div>
            <label
              htmlFor="username"
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "1rem",
                color: "var(--text-color)",
                fontWeight: "600",
              }}
            >
              Username
            </label>
            <Controller
              name="username"
              control={control}
              render={({ field }) => (
                <InputText
                  {...field}
                  id="username"
                  placeholder="Enter your username"
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: `1px solid ${errors.username ? "var(--secondary-color)" : "var(--neutral-color)"}`,
                  }}
                />
              )}
            />
            {errors.username && (
              <small style={{ color: "var(--secondary-color)", fontSize: "0.875rem" }}>
                {errors.username.message}
              </small>
            )}
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
                fontWeight: "600",
              }}
            >
              Email
            </label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <InputText
                  {...field}
                  id="email"
                  placeholder="Enter your email"
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: `1px solid ${errors.email ? "var(--secondary-color)" : "var(--neutral-color)"}`,
                  }}
                />
              )}
            />
            {errors.email && (
              <small style={{ color: "var(--secondary-color)", fontSize: "0.875rem" }}>
                {errors.email.message}
              </small>
            )}
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
                fontWeight: "600",
              }}
            >
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <InputText
                    {...field}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: `1px solid ${errors.password ? "var(--secondary-color)" : "var(--neutral-color)"}`,
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
            {errors.password && (
              <small style={{ color: "var(--secondary-color)", fontSize: "0.875rem" }}>
                {errors.password.message}
              </small>
            )}
          </div>

          {/* Submit Button */}
          <div style={{ textAlign: "center" }}>
            <Button
              label="Save Changes"
              type="submit"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                backgroundColor: "var(--primary-color)",
                color: "#fff",
                fontWeight: "600",
              }}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
