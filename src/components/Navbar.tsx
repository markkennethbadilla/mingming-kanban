'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { PixelCatIdle } from '@/components/pixel-cats';
import {
  Home,
  User,
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

  const authRoutes = ['/login', '/register', '/forgot-password', '/update-password'];
  const isAuthPage = authRoutes.includes(pathname);

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
        { label: 'Home', href: '/home', icon: Home },
        { label: 'Profile', href: '/profile', icon: User },
      ]
    : [
        { label: 'Log In', href: '/login', icon: LogIn },
        { label: 'Sign Up', href: '/register', icon: UserPlus },
      ];

  if (isAuthPage) return null;

  return (
    <nav
      id="navbar-root"
      data-nav="main"
      className="sticky top-0 z-50 w-full border-b-2 border-[var(--border)] px-4 sm:px-6"
      style={{ backgroundColor: 'var(--card-bg)' }}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between h-14">
        {/* Logo */}
        <Link
          href={isLoggedIn ? '/home' : '/'}
          className="flex items-center gap-2 group"
          data-nav="home"
        >
          <PixelCatIdle size={28} />
          <span className="font-extrabold text-[var(--primary)] text-lg tracking-tight">
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-[var(--primary)] text-white shadow-card'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-alt)]'
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--surface-alt)] transition-all ml-1"
            >
              <LogOut size={16} />
            </button>
          )}
          <button
            onClick={toggleTheme}
            data-action="toggle-theme"
            className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--surface-alt)] transition-all ml-1"
            aria-label="Toggle theme"
          >
            {mounted && (theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />)}
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-xl hover:bg-[var(--surface-alt)] transition-colors"
          data-action="toggle-menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t-2 border-[var(--border)] py-2 animate-fade-in">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all rounded-xl mx-2 ${
                  isActive
                    ? 'bg-[var(--primary)] text-white'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-alt)]'
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
              className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--surface-alt)] w-full text-left transition-all rounded-xl mx-2"
            >
              <LogOut size={18} />
              Logout
            </button>
          )}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--surface-alt)] w-full text-left transition-all rounded-xl mx-2"
          >
            {mounted && (theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />)}
            {mounted && (theme === 'dark' ? 'Light Mode' : 'Dark Mode')}
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

