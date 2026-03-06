import React from 'react';
import type { Viewport } from 'next';
import { ThemeProvider } from 'next-themes';
import Navbar from '../components/Navbar';
import '@/styles/global.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#e8805c' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1420' },
  ],
};

export const metadata = {
  title: 'MingMing',
  description: 'Your AI cat companion that manages your life, speaks to you, and keeps you on track.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/logo.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MingMing',
  },
  openGraph: {
    title: 'MingMing',
    description: 'Your AI cat companion that manages your life, speaks to you, and keeps you on track.',
    url: 'https://mingming-kanban.elunari.uk',
    siteName: 'MingMing',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--background)] text-[var(--text)] flex flex-col antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
