'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PixelCatWave, PixelCatIdle, PixelCatHappy, PixelCatType, PixelCatSleep, FloatingCats, PawPrint } from '@/components/pixel-cats';

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const check = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      try {
        const res = await fetch('/api/session', { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setIsLoggedIn(true);
      } catch { /* noop */ }
    };
    check();
  }, []);

  return (
    <div className="min-h-[calc(100vh-56px)] relative overflow-hidden" data-page="landing">
      <FloatingCats count={5} />

      {/* HERO */}
      <section className="relative px-4 pt-12 pb-8 sm:pt-20 sm:pb-14">
        <div className="max-w-2xl mx-auto text-center relative z-10">
          {/* Cat mascot */}
          <div className="cat-bounce inline-block mb-4">
            <PixelCatWave size={80} />
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[var(--text)] mb-3 leading-tight tracking-tight">
            <span className="text-[var(--primary)]">Meow!</span> I&apos;m MingMing
          </h1>
          <p className="text-base sm:text-lg text-[var(--text-muted)] mb-6 max-w-md mx-auto leading-relaxed font-semibold">
            Your AI cat buddy who manages tasks, keeps you on track, and makes productivity actually <em>fun</em>.
          </p>
          <p className="text-sm text-[var(--text-muted)] mb-6 flex items-center justify-center gap-2">
            <PawPrint size={14} className="text-[var(--paw-pink)]" />
            Just tell me what to do &mdash; I&apos;ll handle the rest!
            <PawPrint size={14} className="text-[var(--paw-pink)]" />
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {isLoggedIn ? (
              <Link href="/dashboard" className="btn-yarn text-center">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/register" className="btn-yarn text-center">
                  Start Free &mdash; No Credit Card
                </Link>
                <Link href="/login"
                  className="btn-yarn btn-yarn-secondary text-center">
                  I Have an Account
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-4 py-10 sm:py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-extrabold text-center text-[var(--text)] mb-2">
            What can MingMing do?
          </h2>
          <p className="text-center text-[var(--text-muted)] text-sm mb-8">
            <PawPrint size={12} className="inline text-[var(--paw-pink)]" /> Everything a purr-fect assistant should
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card-cozy p-5 flex gap-4 items-start">
              <div className="shrink-0 cat-wiggle"><PixelCatType size={40} /></div>
              <div>
                <h3 className="font-bold text-[var(--text)] mb-1">Talk to Me</h3>
                <p className="text-sm text-[var(--text-muted)]">
                  Create tasks, check deadlines, or just chat. I understand you — type or use voice!
                </p>
              </div>
            </div>
            <div className="card-cozy p-5 flex gap-4 items-start">
              <div className="shrink-0"><PixelCatIdle size={40} /></div>
              <div>
                <h3 className="font-bold text-[var(--text)] mb-1">Kanban Board</h3>
                <p className="text-sm text-[var(--text-muted)]">
                  Drag tasks between columns. I keep things organized while you focus.
                </p>
              </div>
            </div>
            <div className="card-cozy p-5 flex gap-4 items-start">
              <div className="shrink-0"><PixelCatHappy size={40} /></div>
              <div>
                <h3 className="font-bold text-[var(--text)] mb-1">Stay Motivated</h3>
                <p className="text-sm text-[var(--text-muted)]">
                  I cheer you on, celebrate wins, and gently nudge deadlines. Purr-ductivity!
                </p>
              </div>
            </div>
            <div className="card-cozy p-5 flex gap-4 items-start">
              <div className="shrink-0"><PixelCatSleep size={40} /></div>
              <div>
                <h3 className="font-bold text-[var(--text)] mb-1">Calendar View</h3>
                <p className="text-sm text-[var(--text-muted)]">
                  See everything at a glance. I&apos;ll nap while you plan your week.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-10 sm:py-14">
        <div className="max-w-md mx-auto text-center card-cozy p-8">
          <div className="cat-bounce inline-block mb-3">
            <PixelCatHappy size={56} />
          </div>
          <h2 className="text-lg font-extrabold text-[var(--text)] mb-2">Ready to be purr-ductive?</h2>
          <p className="text-sm text-[var(--text-muted)] mb-5">
            MingMing is free, fun, and waiting to help.
          </p>
          {!isLoggedIn && (
            <Link href="/register" className="btn-yarn inline-block">
              Let&apos;s Go!
            </Link>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t-2 border-[var(--border)] px-4 py-5">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <PixelCatIdle size={20} />
            <span className="text-sm font-bold text-[var(--text-muted)]">MingMing Kanban</span>
          </div>
          <span className="text-xs text-[var(--text-muted)]">
            Made with purrs &amp; pixels
          </span>
        </div>
      </footer>
    </div>
  );
}

