import type { SupabaseClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

interface AvatarState {
  url: string | null;
  error: string | null;
  isLoading: boolean;
}

export function useProfileAvatar(
  avatarUrl: string | null | undefined,
  supabaseClient: SupabaseClient | null,
) {
  const [state, setState] = useState<AvatarState>({
    url: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    let mounted = true;

    async function resolveAvatar() {
      setState({ url: null, error: null, isLoading: true });

      if (!avatarUrl) {
        if (mounted) setState({ url: null, error: null, isLoading: false });
        return;
      }

      // already a full URL (https, http, blob)
      if (/^(https?:\/\/|blob:)/i.test(avatarUrl)) {
        if (mounted)
          setState({ url: avatarUrl, error: null, isLoading: false });
        return;
      }

      // need supabase client to resolve storage path
      if (!supabaseClient) {
        if (mounted) {
          setState({
            url: null,
            error: 'client not initialized',
            isLoading: false,
          });
        }
        return;
      }

      try {
        const { data } = supabaseClient.storage
          .from('avatars')
          .getPublicUrl(avatarUrl);

        if (mounted) {
          setState({ url: data.publicUrl, error: null, isLoading: false });
        }
      } catch (err) {
        if (mounted) {
          setState({
            url: null,
            error:
              err instanceof Error ? err.message : 'failed to resolve avatar',
            isLoading: false,
          });
        }
      }
    }

    resolveAvatar();

    return () => {
      mounted = false;
    };
  }, [avatarUrl, supabaseClient]);

  return state;
}
