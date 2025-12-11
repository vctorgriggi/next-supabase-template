import type { SupabaseClient } from '@supabase/supabase-js';

export async function fetchProfileWithClient(
  supabase: SupabaseClient,
  userId: string | null,
) {
  if (!userId) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, username, website, avatar_url')
    .eq('id', userId)
    .single();

  if (error) throw error;

  return {
    full_name: data?.full_name ?? '',
    username: data?.username ?? '',
    website: data?.website ?? null,
    avatar_url: data?.avatar_url ?? null,
  };
}
