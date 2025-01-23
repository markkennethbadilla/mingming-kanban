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
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '87vh',
        backgroundColor: 'var(--background-color)',
        backgroundImage: "url('/background-image.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        textAlign: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          maxWidth: '650px',
          padding: '32px 24px',
          borderRadius: '12px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
          width: '100%', // Make it responsive
        }}
      >
        <h1
          style={{
            fontSize: '3rem',
            fontWeight: '800',
            color: 'var(--primary-color)',
            margin: '0 0 16px 0',
          }}
        >
          Discover Your Productivity
        </h1>
        <p
          style={{
            fontSize: '1.25rem',
            color: 'var(--text-color)',
            marginBottom: '32px',
            lineHeight: '1.6',
          }}
        >
          Welcome to <strong>Mingming Task Manager</strong>, your personal
          companion for staying organized and motivated. Break down your goals
          into manageable tasks, and let us help you achieve greatness.
        </p>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            marginBottom: '32px',
            flexWrap: 'wrap', // Make buttons wrap on smaller screens
          }}
        >
          {isLoggedIn ? (
            <Button
              label="Go to Dashboard"
              style={{
                padding: '12px 32px',
                borderRadius: '8px',
                backgroundColor: 'var(--primary-color)',
                color: '#fff',
                fontWeight: '700',
                fontSize: '1rem',
                flex: '1 1 100%', // Make button full width on small screens
              }}
              onClick={() => (window.location.href = '/dashboard')}
            />
          ) : (
            <>
              <Button
                label="Log In"
                style={{
                  padding: '12px 32px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--primary-color)',
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: '1rem',
                  flex: '1 1 45%', // Make button take 45% width on small screens
                }}
                onClick={() => (window.location.href = '/login')}
              />
              <Button
                label="Sign Up"
                style={{
                  padding: '12px 32px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--secondary-color)',
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: '1rem',
                  flex: '1 1 45%', // Make button take 45% width on small screens
                }}
                onClick={() => (window.location.href = '/register')}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;