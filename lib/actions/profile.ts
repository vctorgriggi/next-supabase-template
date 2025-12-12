'use server';

import { revalidatePath } from 'next/cache';

import { getServerClient } from '@/lib/supabase/server';
import type { ProfileUpdate } from '@/lib/supabase/types';
import type { Result } from '@/lib/types/result';
import { failure, success } from '@/lib/types/result';

export async function updateProfile(
  updates: ProfileUpdate,
): Promise<Result<boolean>> {
  try {
    const supabase = await getServerClient();
    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser();

    if (getUserError) {
      console.error('getUser failed:', getUserError);
      return failure('failed to get user');
    }

    if (!user) {
      return failure('not authenticated');
    }

    if (!updates.username || updates.username.length < 3) {
      return failure('username must be at least 3 characters long');
    }

    if (!updates.full_name || updates.full_name.length < 1) {
      return failure('full name is required');
    }

    const { error: updateError } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: updates.full_name,
      username: updates.username,
      website: updates.website || null,
      avatar_url: updates.avatar_url,
      updated_at: new Date().toISOString(),
    });

    if (updateError) {
      console.error('update error:', updateError);
      return failure(updateError.message);
    }

    revalidatePath('/', 'layout');
    return success(true);
  } catch (err) {
    console.error('profile update error:', err);
    return failure((err as Error)?.message ?? 'server error');
  }
}
