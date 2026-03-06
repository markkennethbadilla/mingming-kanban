import React from 'react';
import { ThemeProvider } from 'next-themes';
import Navbar from '../components/Navbar';
import '@/styles/global.css';

export const metadata = {
  title: 'MingMing',
  description: 'Your AI cat companion that manages your life, speaks to you, and keeps you on track.',
  icons: { icon: '/logo.svg' },
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
          <main className="flex-1">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
