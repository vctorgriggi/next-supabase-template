'use server';

import { revalidatePath } from 'next/cache';

import { updateProfileDB } from '@/lib/supabase/profile.server';
import { getServerClient } from '@/lib/supabase/server';
import type { Result } from '@/lib/types/result';
import { failure, success } from '@/lib/types/result';

export async function confirmAvatar(
  filePath: string | null,
  previousPath?: string | null,
): Promise<Result<string | null>> {
  try {
    const supabase = await getServerClient();
    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser();

    if (getUserError) {
      console.error('[confirmAvatar] Authentication failed', { error: getUserError });
      return failure('Authentication failed');
    }

    if (!user) {
      return failure('User is not authenticated');
    }

    const result = await updateProfileDB(user.id, { avatar_url: filePath });

    if (!result.success) {
      console.error('[confirmAvatar] Avatar update failed', { userId: user.id, error: result.error });
      return failure('Unable to update avatar');
    }

    // cleanup old avatar file (non-blocking)
    if (previousPath && previousPath !== filePath) {
      supabase.storage
        .from('avatars')
        .remove([previousPath])
        .catch((error) => {
          console.warn('[confirmAvatar] Failed to remove old avatar', { previousPath, error });
        });
    }

    // revalidate cache
    revalidatePath('/', 'layout');
    return success(filePath);
  } catch (error) {
    console.error('[confirmAvatar] Unhandled exception', { error });
    return failure('Internal server error');
  }
}
