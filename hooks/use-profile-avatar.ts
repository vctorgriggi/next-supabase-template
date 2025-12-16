'use client';

import type { SupabaseClient } from '@supabase/supabase-js';
import React from 'react';

interface AvatarState {
  url: string | null;
  error: string | null;
  isLoading: boolean;
}

/**
 * Hook to resolve a user's profile avatar URL.
 * Handles different formats of avatarUrl:
 * - If avatarUrl is a full URL (starts with http(s):// or blob:), use it directly.
 * - If avatarUrl is a storage path, use the Supabase client to get the public URL.
 * - If avatarUrl is null/undefined, return null URL.
 * - If Supabase client is not provided when needed, return an error.
 */
export function useProfileAvatar(
  avatarUrl: string | null | undefined,
  supabaseClient: SupabaseClient | null,
) {
  const [state, setState] = React.useState<AvatarState>({
    url: null,
    error: null,
    isLoading: true,
  });

  React.useEffect(() => {
    let mounted = true;

    async function resolveAvatar() {
      setState({ url: null, error: null, isLoading: true });

      // no avatar URL provided
      if (!avatarUrl) {
        if (mounted) setState({ url: null, error: null, isLoading: false });
        return;
      }

      // avatarUrl is a full URL
      if (/^(https?:\/\/|blob:)/i.test(avatarUrl)) {
        if (mounted)
          setState({ url: avatarUrl, error: null, isLoading: false });
        return;
      }

      // avatarUrl is a storage path but no Supabase client provided
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

      // avatarUrl is a storage path, resolve using Supabase client
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
