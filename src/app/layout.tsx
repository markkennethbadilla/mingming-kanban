import React from 'react';
import { ThemeProvider } from 'next-themes';
import Navbar from '../components/Navbar';
import '@/styles/global.css';

import type { Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata = {
  title: 'MingMing Kanban',
  description: 'AI-powered Kanban board with MingMing, your cheerful cat productivity assistant.',
  icons: { icon: '/logo.svg' },
  openGraph: {
    title: 'MingMing Kanban',
    description: 'AI-powered Kanban board with MingMing, your cheerful cat productivity assistant.',
    url: 'https://mingming-kanban.elunari.uk',
    siteName: 'MingMing Kanban',
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
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7465302364385209"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen bg-[var(--background)] text-[var(--text)] flex flex-col antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Navbar />
          <main className="flex-1">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
