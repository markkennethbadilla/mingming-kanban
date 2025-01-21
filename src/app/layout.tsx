import React from 'react';
import Navbar from '../components/Navbar';
import '@/styles/global.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="h-full bg-gray-50 text-gray-800 flex flex-col">
        <Navbar />
        <main className="flex-grow">{children}</main>
      </body>
    </html> 
  );
}
