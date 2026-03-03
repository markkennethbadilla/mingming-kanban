'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, MessageCircle, CalendarDays, Sparkles } from 'lucide-react';

const features = [
  {
    icon: CheckCircle,
    title: 'Kanban Board',
    desc: 'Drag-and-drop tasks across To Do, In Progress, and Done columns.',
  },
  {
    icon: MessageCircle,
    title: 'AI Cat Assistant',
    desc: 'MingMing helps you create, update, and manage tasks through chat.',
  },
  {
    icon: CalendarDays,
    title: 'Calendar View',
    desc: 'See all your deadlines at a glance with the calendar.',
  },
  {
    icon: Sparkles,
    title: 'Smart Defaults',
    desc: 'AI fills in missing task details and keeps you motivated.',
  },
];

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      try {
        const res = await fetch('/api/session', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setIsLoggedIn(true);
      } catch { /* noop */ }
    };
    checkSession();
  }, []);

  return (
    <div className="min-h-[calc(100vh-56px)]" data-page="landing">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-20 sm:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Sparkles size={14} />
            AI-Powered Productivity
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[var(--text)] mb-4 leading-tight">
            Meet <span className="text-primary">MingMing</span>, your
            <br className="hidden sm:block" /> productivity companion
          </h1>
          <p className="text-lg text-[var(--text-muted)] mb-8 max-w-xl mx-auto leading-relaxed">
            A Kanban board powered by a cheerful AI cat who helps you organize
            tasks, stay motivated, and get things done.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors shadow-card hover:shadow-card-hover"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors shadow-card hover:shadow-card-hover"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white text-[var(--text)] font-semibold rounded-xl border border-[var(--border)] hover:bg-gray-50 transition-colors"
                >
                  Log In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-[var(--text)] mb-10">
            Everything you need to stay organized
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-xl p-6 shadow-card hover:shadow-card-hover transition-shadow border border-[var(--border)]"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <f.icon size={20} className="text-primary" />
                </div>
                <h3 className="font-semibold text-[var(--text)] mb-1">{f.title}</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] px-4 py-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="MingMing" width={20} height={20} className="rounded" />
            <span className="text-sm text-[var(--text-muted)]">MingMing Kanban</span>
          </div>
          <span className="text-xs text-[var(--text-muted)]">
            Built with Next.js &middot; AI by OpenRouter
          </span>
        </div>
      </footer>
    </div>
  );
}

