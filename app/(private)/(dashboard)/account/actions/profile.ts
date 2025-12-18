'use server';

import { revalidatePath } from 'next/cache';

import { getCurrentUser } from '@/lib/supabase/auth';
import { fetchProfile, updateProfileDB } from '@/lib/supabase/profile.server';
import { getServerClient } from '@/lib/supabase/server';
import type { Result } from '@/lib/types/result';
import { failure, success } from '@/lib/types/result';
import { accountSchema } from '@/lib/validators/account';

export async function updateProfile(data: unknown): Promise<Result<boolean>> {
  try {
    const parsed = accountSchema.safeParse(data);
    if (!parsed.success) {
      console.error('[updateProfile] Validation failed:', parsed.error.issues);
      return failure('Invalid input data');
    }

    const user = await getCurrentUser();
    if (!user) return failure('User is not authenticated');

    const supabase = await getServerClient();

    // fetch current profile to compare avatar URLs
    const current = await fetchProfile(user.id);
    if (!current.success) {
      return failure('Could not fetch current profile');
    }

    const previousAvatar = current.data.avatar_url;
    const nextAvatar = parsed.data.avatar_url;

    // update profile in database
    const update = await updateProfileDB(user.id, parsed.data);
    if (!update.success) {
      return failure('Could not update profile');
    }

    // remove previous avatar from storage if it has changed (best effort)
    if (previousAvatar && previousAvatar !== nextAvatar) {
      supabase.storage
        .from('avatars')
        .remove([previousAvatar])
        .catch(() => {
          // do not break flow due to cleanup failure
        });
    }

    revalidatePath('/', 'layout');
    return success(true);
  } catch (error) {
    console.error('[updateProfile] Failure:', error);
    return failure('Internal server error');
  }
}
