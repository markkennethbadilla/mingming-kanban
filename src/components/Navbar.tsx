'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  LayoutDashboard,
  CalendarDays,
  PlusCircle,
  User,
  MessageCircle,
  LogIn,
  UserPlus,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
} from 'lucide-react';

const Navbar: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
    setMenuOpen(false);
    router.push('/login');
  };

  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) { setIsLoggedIn(false); return; }
      try {
        const response = await fetch('/api/session', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsLoggedIn(response.ok);
      } catch {
        setIsLoggedIn(false);
      }
    };
    if (typeof window !== 'undefined') {
      setMounted(true);
      checkSession();
    }
  }, []);

  if (!mounted) return null;

  const navItems = isLoggedIn
    ? [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Calendar', href: '/calendar', icon: CalendarDays },
        { label: 'New Task', href: '/tasks/create', icon: PlusCircle },
        { label: 'Profile', href: '/profile', icon: User },
        { label: 'MingMing', href: '/ai', icon: MessageCircle },
      ]
    : [
        { label: 'Log In', href: '/login', icon: LogIn },
        { label: 'Sign Up', href: '/register', icon: UserPlus },
      ];

  return (
    <nav
      id="navbar-root"
      data-nav="main"
      className="sticky top-0 z-50 w-full bg-[var(--card-bg)]/80 backdrop-blur-md border-b border-[var(--border)] px-4 sm:px-6"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between h-14">
        {/* Logo */}
        <Link
          href={isLoggedIn ? '/dashboard' : '/'}
          className="flex items-center gap-2.5 group"
          data-nav="home"
        >
          <Image src="/logo.svg" alt="MingMing" width={32} height={32} className="rounded-lg" />
          <span className="font-bold text-primary text-lg tracking-tight group-hover:text-primary-dark transition-colors">
            MingMing
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                data-nav={item.label.toLowerCase().replace(/\s/g, '-')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)]/40'
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            );
          })}
          {isLoggedIn && (
            <button
              onClick={handleLogout}
              data-action="logout"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-[var(--text-muted)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all ml-1"
            >
              <LogOut size={16} />
              Logout
            </button>
          )}
          <button
            onClick={toggleTheme}
            data-action="toggle-theme"
            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)]/40 transition-all ml-1"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-[var(--border)]/40 transition-colors"
          data-action="toggle-menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-[var(--border)] py-2 animate-fade-in">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)]/40'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
          {isLoggedIn && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[var(--text-muted)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 w-full text-left transition-all"
            >
              <LogOut size={18} />
              Logout
            </button>
          )}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)]/40 w-full text-left transition-all"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

