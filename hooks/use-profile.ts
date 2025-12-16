'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { profileKeys } from '@/lib/query-keys/profile';
import { getBrowserClient } from '@/lib/supabase/client';
import { fetchProfileWithClient } from '@/lib/supabase/profile';

/**
 * Fetches user profile data using React Query
 */
export function useProfile(userId: string | undefined) {
  const supabaseClient = useMemo(() => getBrowserClient(), []);

  const query = useQuery({
    queryKey: userId ? profileKeys.detail(userId) : profileKeys.all,
    queryFn: async () => {
      if (!userId) return null;
      const result = await fetchProfileWithClient(supabaseClient, userId);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    profile: query.data,
    isLoading: query.isLoading,
    error: query.error,
    supabaseClient,
  };
}
