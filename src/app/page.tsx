'use client';

import React, { useEffect, useState, useLayoutEffect } from 'react';
import { Button } from 'primereact/button';

const LandingPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [navbarHeight, setNavbarHeight] = useState(64); // default fallback

  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setIsLoggedIn(false);
        return;
      }
      try {
        const response = await fetch('/api/session', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch {
        setIsLoggedIn(false);
      }
    };
    checkSession();
  }, []);

  useLayoutEffect(() => {
    const updateHeights = () => {
      const navbar = document.getElementById('navbar-root');
      const navHeight = navbar ? navbar.offsetHeight : 64;
      setNavbarHeight(navHeight);
    };
    updateHeights();
    window.addEventListener('resize', updateHeights);
    return () => window.removeEventListener('resize', updateHeights);
  }, []);

  return (
    <div
      className="flex items-center justify-center bg-[var(--background-color)] bg-cover bg-center bg-no-repeat text-center p-1"
      style={{
        backgroundImage: "url('/background-image.png')",
        minHeight: `calc(95vh - ${navbarHeight}px)`,
        maxHeight: `calc(95vh - ${navbarHeight}px)`,
        height: `calc(95vh - ${navbarHeight}px)`,
        overflow: 'hidden',
      }}
    >
      <div
        className="container mx-auto w-full max-w-xs sm:max-w-sm md:max-w-md bg-white bg-opacity-90 rounded-lg shadow-lg flex flex-col justify-center overflow-y-auto"
        style={{
          minHeight: '320px',
          maxHeight: '600px',
          padding: '1rem',
          gap: '0.5rem',
        }}
      >
        <h1 className="text-base sm:text-lg md:text-xl font-extrabold text-[var(--primary-color)] mb-1">
          Discover Your Productivity
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-[var(--text-color)] mb-1 leading-relaxed">
          Welcome to <strong>Mingming Kanban</strong>, your personal
          companion for staying organized and motivated. Break down your goals
          into manageable tasks, and let us help you achieve greatness.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-1 w-full mb-1">
          {isLoggedIn ? (
            <form action="/dashboard" method="get" className="w-full">
              <Button
                label="Go to Dashboard"
                className="p-2 rounded-lg bg-[var(--primary-color)] text-white font-bold text-xs sm:text-sm md:text-lg w-full"
                type="submit"
              />
            </form>
          ) : (
            <div className="flex flex-col sm:flex-row gap-1 w-full">
              <form action="/login" method="get" className="w-full sm:w-1/2">
                <Button
                  label="Log In"
                  className="p-2 rounded-lg bg-[var(--primary-color)] text-white font-bold text-xs sm:text-sm md:text-lg w-full"
                  type="submit"
                />
              </form>
              <form action="/register" method="get" className="w-full sm:w-1/2">
                <Button
                  label="Sign Up"
                  className="p-2 rounded-lg bg-[var(--secondary-color)] text-white font-bold text-xs sm:text-sm md:text-lg w-full"
                  type="submit"
                />
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
