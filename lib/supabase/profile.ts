import type { SupabaseClient } from '@supabase/supabase-js';

import type { Result } from '@/lib/types/result';
import { failure, success } from '@/lib/types/result';

import type { Profile, ProfileUpdate } from './types';

export async function fetchProfileWithClient(
  supabase: SupabaseClient,
  userId: string,
): Promise<Result<Profile>> {
  if (!userId) {
    return failure('Missing user ID');
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, username, website, avatar_url')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Failed to fetch profile for user', { userId, error });
    return failure('Failed to fetch user profile');
  }

  if (!data) {
    return failure('User profile could not be found');
  }

  return success({
    full_name: data.full_name ?? '',
    username: data.username ?? '',
    website: data.website ?? null,
    avatar_url: data.avatar_url ?? null,
  });
}

export async function updateProfileWithClient(
  supabase: SupabaseClient,
  userId: string,
  updates: ProfileUpdate,
): Promise<Result<boolean>> {
  if (!userId) {
    return failure('Missing user ID');
  }

  const { error } = await supabase.from('profiles').upsert({
    id: userId,
    ...updates,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Failed to update profile for user', { userId, error });
    return failure('Failed to update user profile');
  }

  return success(true);
}
