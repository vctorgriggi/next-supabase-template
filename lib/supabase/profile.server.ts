import type { Result } from '@/lib/types/result';

import { fetchProfileWithClient, updateProfileWithClient } from './profile';
import { getServerClient } from './server';
import type { Profile, ProfileUpdate } from './types';

/**
 * Fetches a user profile from the database
 */
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
