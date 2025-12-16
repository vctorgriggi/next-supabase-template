import { QueryClient } from '@tanstack/react-query';

import { profileKeys } from '@/lib/query-keys/profile';
import { fetchProfile } from '@/lib/supabase/profile.server';

/**
 * Prefetches a user profile for React Query cache
 */
export async function prefetchProfile(
  queryClient: QueryClient,
  userId: string,
): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey: profileKeys.detail(userId),
    queryFn: async () => {
      const result = await fetchProfile(userId);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
