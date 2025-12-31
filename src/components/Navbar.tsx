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
    <nav
      id="navbar-root"
      className="w-full flex items-center px-2 sm:px-8 py-2 bg-white shadow-sm"
      style={{ zIndex: 10 }}
    >
      {/* Logo and Title Section */}
      <div
        id="navbar-logo-title"
        onClick={() => router.push(isLoggedIn ? '/dashboard' : '/')}
        className="flex items-center gap-2 cursor-pointer"
        style={{ minWidth: 0, maxWidth: '350px', flexShrink: 0 }}
      >
        <Image
          id="navbar-logo"
          src="/logo.svg"
          alt="Logo"
          width={40}
          height={40}
          style={{ borderRadius: '8px' }}
        />
        <span
          id="navbar-title"
          className="font-bold text-[var(--primary-color)] min-w-0 break-words whitespace-normal text-base sm:text-lg md:text-xl"
          style={{ flexGrow: 1 }}
        >
          Mingming Kanban
        </span>
      </div>

      {/* Menubar Items */}
      <div
        id="navbar-menubar-container"
        className="flex flex-1 flex-wrap justify-end items-center min-w-0"
        style={{ marginLeft: '32px' }}
      >
        <Menubar
          id="navbar-menubar"
          model={items}
          className="w-full sm:w-auto"
          style={{
            background: 'transparent',
            border: 'none',
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
            minWidth: 0,
          }}
        />
      </div>
    </nav>
  );
};

export default Navbar;
