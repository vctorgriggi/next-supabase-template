'use server';

import { revalidatePath } from 'next/cache';

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
      console.error('get user failed:', getUserError);
      return failure('failed to get user');
    }

    if (!user) {
      return failure('not authenticated');
    }

    // if filePath is null, remove the avatar
    if (filePath === null) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (updateError) {
        console.error('update error:', updateError);
        return failure(updateError.message);
      }

      if (previousPath) {
        await supabase.storage
          .from('avatars')
          .remove([previousPath])
          .catch((e) => console.warn('failed to delete previous avatar:', e));
      }

      revalidatePath('/', 'layout');
      return success(null);
    }

    // update the profile with the new avatar URL and remove the previous one if exists
    const { error: updateError } = await supabase.from('profiles').upsert({
      id: user.id,
      avatar_url: filePath,
      updated_at: new Date().toISOString(),
    });

    if (updateError) {
      console.error('update error:', updateError);
      return failure(updateError.message);
    }

    if (previousPath && previousPath !== filePath) {
      await supabase.storage
        .from('avatars')
        .remove([previousPath])
        .catch((e) => console.warn('Failed to remove old avatar:', e));
    }

    revalidatePath('/', 'layout');
    return success(filePath);
  } catch (err) {
    console.error('avatar confirm error:', err);
    return failure((err as Error)?.message ?? 'server error');
  }
}
