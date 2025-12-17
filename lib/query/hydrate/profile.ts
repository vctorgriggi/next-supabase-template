import { QueryClient } from '@tanstack/react-query';

import { profileKeys } from '@/lib/query/keys/profile';
import { fetchProfile } from '@/lib/supabase/profile.server';

/**
 * Hydrates the profile query for the given user ID
 */
export async function hydrateProfileQuery(
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
    staleTime: 1000 * 60 * 5, // when hydrating, set staleTime to 5 minutes
  });
}
