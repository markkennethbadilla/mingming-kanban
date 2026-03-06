'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PixelCatWave, PixelCatType, PixelCatHappy, PixelCatSleep, FloatingCats, PawPrint } from '@/components/pixel-cats';

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
    <div className="min-h-[calc(100dvh-56px)] relative overflow-y-auto overflow-x-hidden" data-page="landing">
      <FloatingCats count={5} />

      {/* HERO — AI Life Manager */}
      <section className="relative px-4 pt-10 pb-6 sm:pt-16 sm:pb-10">
        <div className="max-w-4xl mx-auto relative z-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-12">
          <div className="cat-bounce shrink-0">
            <PixelCatWave size={120} />
          </div>
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-3xl sm:text-5xl font-black text-[var(--text)] mb-3 leading-tight tracking-tight">
              <span className="text-[var(--primary)]">Hey!</span> I&apos;m MingMing
            </h1>
            <p className="text-base sm:text-lg text-[var(--text-muted)] mb-5 max-w-lg leading-relaxed font-semibold">
              Your AI cat companion that <em>talks to you</em>, manages your life, and keeps you on track &mdash; without being annoying about it.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              {isLoggedIn ? (
                <Link href="/dashboard" className="btn-yarn text-center">
                  Go to Board
                </Link>
              ) : (
                <>
                  <Link href="/register" className="btn-yarn text-center">
                    Meet MingMing &mdash; It&apos;s Free
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
            <span className="text-sm font-bold text-[var(--text-muted)]">Speaks to You</span>
          </div>
          <div className="flex items-center gap-2">
            <PawPrint size={16} className="text-[var(--accent)]" />
            <span className="text-sm font-bold text-[var(--text-muted)]">Proactive Reminders</span>
          </div>
          <div className="flex items-center gap-2">
            <PawPrint size={16} className="text-[var(--success)]" />
            <span className="text-sm font-bold text-[var(--text-muted)]">Free &amp; Open</span>
          </div>
          <div className="flex items-center gap-2">
            <PawPrint size={16} className="text-[var(--fish-blue)]" />
            <span className="text-sm font-bold text-[var(--text-muted)]">Desktop Ready</span>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-4 py-10 sm:py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-extrabold text-center text-[var(--text)] mb-2">
            Not just a to-do app.
          </h2>
          <p className="text-center text-[var(--text-muted)] text-sm mb-10">
            <PawPrint size={12} className="inline text-[var(--paw-pink)]" /> MingMing lives with you
          </p>

          <div className="space-y-6">
            <div className="card-cozy p-6 sm:p-8 flex flex-col sm:flex-row gap-5 items-center">
              <div className="shrink-0 cat-wiggle"><PixelCatType size={56} /></div>
              <div className="text-center sm:text-left flex-1">
                <h3 className="font-extrabold text-lg text-[var(--text)] mb-1">Talks, Not Beeps</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  MingMing speaks to you out loud. Morning briefings, deadline warnings, and gentle check-ins &mdash; all by voice, not notification spam.
                </p>
              </div>
            </div>

            <div className="card-cozy p-6 sm:p-8 flex flex-col sm:flex-row-reverse gap-5 items-center">
              <div className="shrink-0"><PixelCatHappy size={56} /></div>
              <div className="text-center sm:text-right flex-1">
                <h3 className="font-extrabold text-lg text-[var(--text)] mb-1">Proactive, Not Pushy</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  Morning briefings, deadline alerts, evening wrap-ups. MingMing knows when to speak up and when to let you focus.
                </p>
              </div>
            </div>

            <div className="card-cozy p-6 sm:p-8 flex flex-col sm:flex-row gap-5 items-center">
              <div className="shrink-0"><PixelCatSleep size={56} /></div>
              <div className="text-center sm:text-left flex-1">
                <h3 className="font-extrabold text-lg text-[var(--text)] mb-1">Lives on Your Desktop</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  Works in your browser or as a native desktop app. System notifications, alarms, and always-on presence &mdash; your cat companion is always there.
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
          <h2 className="text-lg font-extrabold text-[var(--text)] mb-2">Ready to meet your companion?</h2>
          <p className="text-sm text-[var(--text-muted)] mb-5">
            MingMing is free, speaks your language, and actually cares.
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
