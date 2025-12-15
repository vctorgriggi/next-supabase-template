import type { QueryClient } from '@tanstack/react-query';

import type { Result } from '@/lib/types/result';

import { fetchProfileWithClient, updateProfileWithClient } from './profile';
import { getServerClient } from './server';
import type { Profile, ProfileUpdate } from './types';

// fetches a user profile using server-side Supabase client
export async function fetchProfile(userId: string): Promise<Result<Profile>> {
  const supabase = await getServerClient();
  return fetchProfileWithClient(supabase, userId);
}

/**
 * Updates a user profile in the database
 * Note: This function does NOT validate input or check authentication
 * Use the Server Action (lib/actions/profile.ts) for user-initiated updates
 */
export async function updateProfileDB(
  userId: string,
  updates: ProfileUpdate,
): Promise<Result<boolean>> {
  const supabase = await getServerClient();
  return updateProfileWithClient(supabase, userId, updates);
}

/**
 * Prefetches a user profile for React Query cache
 */
export async function prefetchProfile(
  queryClient: QueryClient,
  userId: string,
): Promise<void> {
  try {
    await queryClient.prefetchQuery({
      queryKey: ['profile', userId],
      queryFn: async () => {
        const result = await fetchProfile(userId);
        if (!result.success) throw new Error(result.error);
        return result.data;
      },
      staleTime: 1000 * 60 * 5,
    });
  } catch (error) {
    console.warn('Failed to prefetch profile for user', { userId, error });
  }
}
