'use server';

import { revalidatePath } from 'next/cache';

import { getServerClient } from '@/lib/supabase/server';
import type { Result } from '@/lib/types/result';
import { failure, success } from '@/lib/types/result';

import { accountSchema } from '../validators/account';

export async function updateProfile(data: unknown): Promise<Result<boolean>> {
  try {
    const parsed = accountSchema.safeParse(data);
    if (!parsed.success) {
      return failure('bad request');
    }

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

    const { error: updateError } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: parsed.data.full_name,
      username: parsed.data.username,
      website: parsed.data.website,
      avatar_url: parsed.data.avatar_url,
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
