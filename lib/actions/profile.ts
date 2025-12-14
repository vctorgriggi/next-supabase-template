'use server';

import { revalidatePath } from 'next/cache';

import { updateProfileDB } from '@/lib/supabase/profile.server';
import type { Result } from '@/lib/types/result';
import { failure, success } from '@/lib/types/result';

import { getCurrentUser } from '../supabase/auth';
import { accountSchema } from '../validators/account';

/**
 * Server Action: Updates user profile with validation and authentication
 * This is the main entry point for profile updates from client components
 */
export async function updateProfile(data: unknown): Promise<Result<boolean>> {
  try {
    const parsed = accountSchema.safeParse(data);
    if (!parsed.success) {
      console.warn('[updateProfile] Validation failed', {
        issues: parsed.error.issues,
      });
      return failure('Invalid input data');
    }

    const user = await getCurrentUser();

    if (!user) {
      return failure('User is not authenticated');
    }

    const result = await updateProfileDB(user.id, parsed.data);

    if (!result.success) {
      console.error('[updateProfile] Profile update failed', {
        userId: user.id,
        error: result.error,
      });
      return failure('Unable to update profile');
    }

    revalidatePath('/', 'layout');
    return success(true);
  } catch (error) {
    console.error('[updateProfile] Unhandled exception', { error });
    return failure('Internal server error');
  }
}
