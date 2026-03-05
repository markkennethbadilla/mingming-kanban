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

      {/* HERO — split layout */}
      <section className="relative px-4 pt-10 pb-6 sm:pt-16 sm:pb-10">
        <div className="max-w-4xl mx-auto relative z-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-12">
          <div className="cat-bounce shrink-0">
            <PixelCatWave size={120} />
          </div>
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-3xl sm:text-5xl font-black text-[var(--text)] mb-3 leading-tight tracking-tight">
              <span className="text-[var(--primary)]">Meow!</span> I&apos;m MingMing
            </h1>
            <p className="text-base sm:text-lg text-[var(--text-muted)] mb-5 max-w-lg leading-relaxed font-semibold">
              Your AI cat buddy who manages tasks, keeps you on track, and makes productivity actually <em>fun</em>.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              {isLoggedIn ? (
                <Link href="/dashboard" className="btn-yarn text-center">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/register" className="btn-yarn text-center">
                    Start Free &mdash; No Credit Card
                  </Link>
                  <Link href="/login" className="btn-yarn btn-yarn-secondary text-center">
                    I Have an Account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="px-4 py-6">
        <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-center">
          <div className="flex items-center gap-2">
            <PawPrint size={16} className="text-[var(--paw-pink)]" />
            <span className="text-sm font-bold text-[var(--text-muted)]">AI-Powered</span>
          </div>
          <div className="flex items-center gap-2">
            <PawPrint size={16} className="text-[var(--accent)]" />
            <span className="text-sm font-bold text-[var(--text-muted)]">Free Forever</span>
          </div>
          <div className="flex items-center gap-2">
            <PawPrint size={16} className="text-[var(--success)]" />
            <span className="text-sm font-bold text-[var(--text-muted)]">No Sign-up Fees</span>
          </div>
          <div className="flex items-center gap-2">
            <PawPrint size={16} className="text-[var(--fish-blue)]" />
            <span className="text-sm font-bold text-[var(--text-muted)]">Dark &amp; Light Mode</span>
          </div>
        </div>
      </section>

      {/* FEATURES — alternating rows */}
      <section className="px-4 py-10 sm:py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-extrabold text-center text-[var(--text)] mb-2">
            What can MingMing do?
          </h2>
          <p className="text-center text-[var(--text-muted)] text-sm mb-10">
            <PawPrint size={12} className="inline text-[var(--paw-pink)]" /> Everything a purr-fect assistant should
          </p>

          <div className="space-y-6">
            {/* Row 1 */}
            <div className="card-cozy p-6 sm:p-8 flex flex-col sm:flex-row gap-5 items-center">
              <div className="shrink-0 cat-wiggle"><PixelCatType size={56} /></div>
              <div className="text-center sm:text-left flex-1">
                <h3 className="font-extrabold text-lg text-[var(--text)] mb-1">Talk to Me</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  Create tasks, check deadlines, or just chat. I understand you &mdash; type naturally and I&apos;ll figure out the rest!
                </p>
              </div>
            </div>

            {/* Row 2 — reversed */}
            <div className="card-cozy p-6 sm:p-8 flex flex-col sm:flex-row-reverse gap-5 items-center">
              <div className="shrink-0"><PixelCatIdle size={56} /></div>
              <div className="text-center sm:text-right flex-1">
                <h3 className="font-extrabold text-lg text-[var(--text)] mb-1">Kanban Board</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  Drag tasks between columns. I keep things organized so you can focus on what matters.
                </p>
              </div>
            </div>

            {/* Row 3 */}
            <div className="card-cozy p-6 sm:p-8 flex flex-col sm:flex-row gap-5 items-center">
              <div className="shrink-0"><PixelCatHappy size={56} /></div>
              <div className="text-center sm:text-left flex-1">
                <h3 className="font-extrabold text-lg text-[var(--text)] mb-1">Stay Motivated</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  I cheer you on, celebrate wins, and gently nudge deadlines. Purr-ductivity at its finest!
                </p>
              </div>
            </div>

            {/* Row 4 — reversed */}
            <div className="card-cozy p-6 sm:p-8 flex flex-col sm:flex-row-reverse gap-5 items-center">
              <div className="shrink-0"><PixelCatSleep size={56} /></div>
              <div className="text-center sm:text-right flex-1">
                <h3 className="font-extrabold text-lg text-[var(--text)] mb-1">Calendar View</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  See everything at a glance. I&apos;ll nap while you plan your week ahead.
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
    </div>
  );
}

