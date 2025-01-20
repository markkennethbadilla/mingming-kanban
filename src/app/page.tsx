"use client";

import React, { useEffect, useState } from "react";
import { Button } from "primereact/button";

const LandingPage: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsLoggedIn(!!token); // Set logged-in state based on the presence of the auth token
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "87vh",
        backgroundColor: "var(--background-color)",
        backgroundImage: "url('/background-image.png')", // Replace with the path to your background image
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "650px",
          padding: "32px 24px", // Increased top and bottom padding for balance
          borderRadius: "12px",
          backgroundColor: "rgba(255, 255, 255, 0.9)", // Semi-transparent white background for readability
          boxShadow: "0 6px 16px rgba(0, 0, 0, 0.15)",
        }}
      >
        <h1
          style={{
            fontSize: "3rem",
            fontWeight: "800",
            color: "var(--primary-color)",
          }}
        >
          Discover Your Productivity
        </h1>
        <p
          style={{
            fontSize: "1.25rem",
            color: "var(--text-color)",
            marginBottom: "32px", // Consistent spacing below the paragraph
            lineHeight: "1.6",
          }}
        >
          Welcome to <strong>Mingming Task Manager</strong>, your personal
          companion for staying organized and motivated. Break down your goals
          into manageable tasks, and let us help you achieve greatness.
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          {isLoggedIn ? (
            <Button
              label="Go to Dashboard"
              style={{
                padding: "12px 32px",
                borderRadius: "8px",
                backgroundColor: "var(--primary-color)",
                color: "#fff",
                fontWeight: "700",
                fontSize: "1rem",
              }}
              onClick={() => (window.location.href = "/dashboard")}
            />
          ) : (
            <>
              <Button
                label="Log In"
                style={{
                  padding: "12px 32px",
                  borderRadius: "8px",
                  backgroundColor: "var(--primary-color)",
                  color: "#fff",
                  fontWeight: "700",
                  fontSize: "1rem",
                }}
                onClick={() => (window.location.href = "/login")}
              />
              <Button
                label="Sign Up"
                style={{
                  padding: "12px 32px",
                  borderRadius: "8px",
                  backgroundColor: "var(--secondary-color)",
                  color: "#fff",
                  fontWeight: "700",
                  fontSize: "1rem",
                }}
                onClick={() => (window.location.href = "/register")}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
