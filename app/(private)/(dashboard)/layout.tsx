import { dehydrate } from '@tanstack/react-query';

import SidebarWithHeader from '@/components/dashboard/sidebar-with-header';
import { createQueryClient } from '@/components/providers/query-client';
import { SsrQueryProvider } from '@/components/providers/ssr-query-provider';
import { hydrateProfileQuery } from '@/lib/query/hydrate/profile';
import { getCurrentUser } from '@/lib/supabase/auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const queryClient = createQueryClient();

  await hydrateProfileQuery(queryClient, user.id);

  return (
    <SsrQueryProvider dehydratedState={dehydrate(queryClient)}>
      <SidebarWithHeader user={user}>{children}</SidebarWithHeader>
    </SsrQueryProvider>
  );
}
