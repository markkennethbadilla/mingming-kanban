import React from 'react';
import { Button } from 'primereact/button';
import { cookies } from 'next/headers';

async function getSessionStatus() {
  // Try to get the auth token from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get('authToken')?.value;
  if (!token) return false;

  // Optionally, validate token with your API
  try {
    const res = await fetch(`${process.env.URL || ''}/api/session`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.success;
  } catch {
    return false;
  }
}

export default async function LandingPage() {
  const isLoggedIn = await getSessionStatus();

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[var(--background-color)] bg-cover bg-center bg-no-repeat text-center p-2"
      style={{ backgroundImage: "url('/background-image.png')" }}
    >
      <div
        className="container mx-auto w-full max-w-xs sm:max-w-sm md:max-w-md p-2 sm:p-4 md:p-6 bg-white bg-opacity-90 rounded-lg shadow-lg mt-2 sm:mt-8 md:mt-16 flex flex-col gap-2 sm:gap-4 md:gap-6 overflow-y-auto h-full"
        style={{ maxHeight: '95vh' }}
      >
        <h1 className="text-base sm:text-lg md:text-2xl font-extrabold text-[var(--primary-color)] mb-1 sm:mb-2 md:mb-4">
          Discover Your Productivity
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-[var(--text-color)] mb-1 sm:mb-2 md:mb-4 leading-relaxed">
          Welcome to <strong>Mingming Task Manager</strong>, your personal
          companion for staying organized and motivated. Break down your goals
          into manageable tasks, and let us help you achieve greatness.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-1 sm:gap-2 md:gap-4 flex-wrap mb-1 sm:mb-2 md:mb-4 w-full">
          {isLoggedIn ? (
            <form action="/dashboard" method="get" className="w-full">
              <Button
                label="Go to Dashboard"
                className="p-2 sm:p-3 md:p-4 rounded-lg bg-[var(--primary-color)] text-white font-bold text-xs sm:text-sm md:text-lg w-full"
                type="submit"
              />
            </form>
          ) : (
            <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 md:gap-4 w-full">
              <form action="/login" method="get" className="w-full sm:w-1/2">
                <Button
                  label="Log In"
                  className="p-2 sm:p-3 md:p-4 rounded-lg bg-[var(--primary-color)] text-white font-bold text-xs sm:text-sm md:text-lg w-full"
                  type="submit"
                />
              </form>
              <form action="/register" method="get" className="w-full sm:w-1/2">
                <Button
                  label="Sign Up"
                  className="p-2 sm:p-3 md:p-4 rounded-lg bg-[var(--secondary-color)] text-white font-bold text-xs sm:text-sm md:text-lg w-full"
                  type="submit"
                />
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
