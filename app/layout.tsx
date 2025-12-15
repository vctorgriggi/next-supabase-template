import './globals.css';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import NotificationsProvider from '@/components/ui/notifications-provider';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Next.js + Supabase Template',
  description:
    'Production-ready Next.js + Supabase starter with auth, profiles, file uploads, and end-to-end type safety. Opinionated architecture for maintainable apps.',
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
