'use client';

import React, { useEffect, useState } from 'react';
import { Menubar } from 'primereact/menubar';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const Navbar: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
    router.push('/login');
  };

  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('authToken');

      if (!token) {
        setIsLoggedIn(false);
        return;
      }

      try {
        const response = await fetch('/api/session', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setIsLoggedIn(false);
      }
    };

    if (typeof window !== 'undefined') {
      setMounted(true);
      checkSession();
    }
  }, []);

  if (!mounted) return null;

  const items = isLoggedIn
    ? [
        { label: 'Dashboard', icon: 'pi pi-home', url: '/dashboard' },
        { label: 'Calendar', icon: 'pi pi-calendar', url: '/calendar' },
        { label: 'Create Task', icon: 'pi pi-plus', url: '/tasks/create' },
        { label: 'Profile', icon: 'pi pi-user', url: '/profile' },
        { label: 'Cat Chat', icon: 'pi pi-comments', url: '/ai' }, // Added Cat Chat Link
        { label: 'Logout', icon: 'pi pi-sign-out', command: handleLogout },
      ]
    : [
        { label: 'Log In', icon: 'pi pi-sign-in', url: '/login' },
        { label: 'Sign Up', icon: 'pi pi-user-plus', url: '/register' },
      ];

  return (
    <div
      style={{ padding: '0.5rem 2rem', display: 'flex', alignItems: 'center' }}
    >
      {/* Logo and Title Section */}
      <div
        onClick={() => router.push(isLoggedIn ? '/dashboard' : '/')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          cursor: 'pointer',
          flex: '1',
        }}
      >
        <Image
          src="/logo.svg" // Replace with the path to your logo
          alt="Logo"
          width={40}
          height={40}
          style={{ borderRadius: '8px' }}
        />
        <span
          style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: 'var(--primary-color)',
          }}
        >
          Mingming Task Manager
        </span>
      </div>

      {/* Menubar Items */}
      <Menubar
        model={items}
        style={{
          background: 'transparent',
          border: 'none',
          flex: '2',
          justifyContent: 'flex-end',
        }}
      />
    </div>
  );
};

export default Navbar;
