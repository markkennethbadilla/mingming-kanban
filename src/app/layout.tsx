import React from 'react';
import { ThemeProvider } from 'next-themes';
import Navbar from '../components/Navbar';
import '@/styles/global.css';

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
      <body className="min-h-screen bg-[var(--background)] text-[var(--text)] flex flex-col antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t-2 border-[var(--border)] px-4 py-5" style={{ backgroundColor: 'var(--card-bg)' }}>
            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
              <span className="text-sm font-bold text-[var(--text-muted)]">MingMing Kanban</span>
              <span className="text-xs text-[var(--text-muted)]">Made with purrs &amp; pixels</span>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
