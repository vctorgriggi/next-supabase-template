'use client';

import React from 'react';

import { getBrowserClient } from '@/lib/supabase/client';

interface AvatarState {
  url: string | null;
  error: string | null;
  isLoading: boolean;
}

/**
 * Hook to resolve a user's profile avatar URL.
 * Handles external URLs, blob URLs, and Supabase Storage paths.
 */
export function useProfileAvatar(avatarUrl: string | null | undefined) {
  const [state, setState] = React.useState<AvatarState>({
    url: null,
    error: null,
    isLoading: true,
  });

  React.useEffect(() => {
    let mounted = true;

    async function resolveAvatar() {
      setState({ url: null, error: null, isLoading: true });

      if (!avatarUrl) {
        if (mounted) setState({ url: null, error: null, isLoading: false });
        return;
      }

      if (/^(https?:\/\/|blob:)/i.test(avatarUrl)) {
        if (mounted) {
          setState({ url: avatarUrl, error: null, isLoading: false });
        }
        return;
      }

      try {
        const supabase = getBrowserClient();
        const { data } = supabase.storage
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
  }, [avatarUrl]);

  return state;
}
