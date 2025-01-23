'use client';

import React, { useEffect, useState } from 'react';
import { Button } from 'primereact/button';

const LandingPage: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return; // No token, user needs to log in

        const response = await fetch('/api/session', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setIsLoggedIn(true); // Show the dashboard button if session is valid
        }
      } catch {
        localStorage.removeItem('authToken');
        setIsLoggedIn(false);
      }
    };

    checkSession();
  }, []);

  return (
    <div
      className="flex items-center justify-center min-h-[87vh] bg-[var(--background-color)] bg-cover bg-center bg-no-repeat text-center p-5"
      style={{ backgroundImage: "url('/background-image.png')" }}
    >
      <div className="max-w-lg p-8 bg-white bg-opacity-90 rounded-lg shadow-lg w-full mt-16 sm:mt-0">
        <h1 className="text-4xl font-extrabold text-[var(--primary-color)] mb-4">
          Discover Your Productivity
        </h1>
        <p className="text-lg text-[var(--text-color)] mb-8 leading-relaxed">
          Welcome to <strong>Mingming Task Manager</strong>, your personal
          companion for staying organized and motivated. Break down your goals
          into manageable tasks, and let us help you achieve greatness.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 flex-wrap mb-8">
          {isLoggedIn ? (
            <Button
              label="Go to Dashboard"
              className="p-3 rounded-lg bg-[var(--primary-color)] text-white font-bold text-lg w-full sm:w-auto"
              onClick={() => (window.location.href = '/dashboard')}
            />
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <Button
                label="Log In"
                className="p-3 rounded-lg bg-[var(--primary-color)] text-white font-bold text-lg w-full sm:w-1/2"
                onClick={() => (window.location.href = '/login')}
              />
              <Button
                label="Sign Up"
                className="p-3 rounded-lg bg-[var(--secondary-color)] text-white font-bold text-lg w-full sm:w-1/2"
                onClick={() => (window.location.href = '/register')}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
