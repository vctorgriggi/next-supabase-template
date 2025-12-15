import { type QueryClient, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { getBrowserClient } from '@/lib/supabase/client';
import { fetchProfileWithClient } from '@/lib/supabase/profile';
import { fetchProfile } from '@/lib/supabase/profile.server';

export const profileKeys = {
  all: ['profile'] as const,
  detail: (userId: string) => ['profile', userId] as const,
};

/**
 * Prefetches a user profile for React Query cache
 */
export async function prefetchProfile(
  queryClient: QueryClient,
  userId: string,
): Promise<void> {
  try {
    await queryClient.prefetchQuery({
      queryKey: profileKeys.detail(userId),
      queryFn: async () => {
        const result = await fetchProfile(userId);
        if (!result.success) throw new Error(result.error);
        return result.data;
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  } catch (error) {
    console.warn('Could not prefetch user profile', { userId, error });
  }
}

/**
 * Fetches user profile data using React Query
 */
export function useProfile(userId: string | undefined) {
  const supabaseClient = useMemo(() => {
    try {
      return getBrowserClient();
    } catch {
      return null;
    }
  }, []);

  const query = useQuery({
    queryKey: userId ? profileKeys.detail(userId) : ['profile', 'null'],
    queryFn: async () => {
      if (!userId || !supabaseClient) return null;
      const result = await fetchProfileWithClient(supabaseClient, userId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    profile: query.data,
    isLoading: query.isLoading,
    error: query.error,
    supabaseClient,
  };
}
