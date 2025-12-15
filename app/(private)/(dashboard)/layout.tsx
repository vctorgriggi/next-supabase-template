import { dehydrate, QueryClient } from '@tanstack/react-query';

import SidebarWithHeader from '@/components/dashboard/sidebar-with-header';
import QueryProvider from '@/components/providers/query-provider';
import { prefetchProfile } from '@/hooks/use-profile';
import { getCurrentUser } from '@/lib/supabase/auth';

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
