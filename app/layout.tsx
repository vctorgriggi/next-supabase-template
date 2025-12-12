import './globals.css';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import NotificationsProvider from '@/components/ui/notifications-provider';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Next.js Supabase Starter',
  description: 'A starter template for Next.js with Supabase integration.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning={true}>
      <body className={`${inter.variable} h-full antialiased`}>
        {children}
        <NotificationsProvider />
      </body>
    </html>
  );
}
