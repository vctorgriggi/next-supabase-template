import type { SupabaseClient } from '@supabase/supabase-js';

import type { Result } from '@/lib/types/result';
import { failure, success } from '@/lib/types/result';

import type { Profile, ProfileUpdate } from './types';

/**
 * Fetches a user profile from the database using the provided Supabase client
 */
export async function fetchProfileWithClient(
  supabase: SupabaseClient,
  userId: string,
): Promise<Result<Profile>> {
  if (!userId) return failure('Missing user ID');

  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, username, website, avatar_url')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Could not load user profile', { userId, error });
    return failure('Failed to load profile');
  }

  if (!data) return failure('Profile not found');

  return success({
    full_name: data.full_name ?? '',
    username: data.username ?? '',
    website: data.website ?? null,
    avatar_url: data.avatar_url ?? null,
  });
}

/**
 * Updates a user profile in the database using the provided Supabase client
 */
export async function updateProfileWithClient(
  supabase: SupabaseClient,
  userId: string,
  updates: ProfileUpdate,
): Promise<Result<boolean>> {
  if (!userId) return failure('Missing user ID');

  const { error } = await supabase.from('profiles').upsert({
    id: userId,
    ...updates,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Could not update user profile', { userId, updates, error });
    return failure('Failed to update profile');
  }

  return success(true);
}
