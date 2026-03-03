import React from 'react';
import Navbar from '../components/Navbar';
import '@/styles/global.css';

export const metadata = {
  title: 'MingMing Kanban',
  description: 'AI-powered Kanban board with MingMing, your cheerful cat productivity assistant.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-[var(--text)] flex flex-col antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
