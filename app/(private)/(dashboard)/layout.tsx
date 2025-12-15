import { dehydrate, QueryClient } from '@tanstack/react-query';

import SidebarWithHeader from '@/components/dashboard/sidebar-with-header';
import QueryProvider from '@/components/providers/query-provider';
import { getCurrentUser } from '@/lib/supabase/auth';
import { prefetchProfile } from '@/lib/supabase/profile.server';

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  const queryClient = new QueryClient();
  await prefetchProfile(queryClient, user!.id);

  return (
    <QueryProvider dehydratedState={dehydrate(queryClient)}>
      <SidebarWithHeader user={user}>{children}</SidebarWithHeader>
    </QueryProvider>
  );
}
