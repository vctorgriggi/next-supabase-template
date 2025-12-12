import type { QueryClient } from '@tanstack/react-query';

import type { Result } from '@/lib/types/result';
import { failure, success } from '@/lib/types/result';

import { getServerClient } from './server';
import type { Profile, ProfileUpdate } from './types';

export async function fetchProfile(userId: string): Promise<Result<Profile>> {
  if (!userId) {
    return failure('user ID is required');
  }

  const supabase = await getServerClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, username, website, avatar_url')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('error fetching profile:', error);
    return failure(error.message);
  }

  if (!data) {
    return failure('profile not found');
  }

  return success({
    full_name: data.full_name ?? '',
    username: data.username ?? '',
    website: data.website ?? null,
    avatar_url: data.avatar_url ?? null,
  });
}

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
    console.warn('failed to prefetch profile:', error);
  }
}

export async function updateProfile(
  userId: string,
  updates: ProfileUpdate,
): Promise<Result<boolean>> {
  if (!userId) {
    return failure('user ID is required');
  }

  const supabase = await getServerClient();

  const { error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) {
    console.error('error updating profile:', error);
    return failure(error.message);
  }

  return success(true);
}
