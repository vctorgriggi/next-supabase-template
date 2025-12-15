import { requireAuth } from '@/lib/supabase/auth';

export default async function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAuth();

  return children;
}
