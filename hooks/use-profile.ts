import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { getBrowserClient } from '@/lib/supabase/client';
import { fetchProfileWithClient } from '@/lib/supabase/profile';

export function useProfile(userId: string | undefined) {
  const supabaseClient = useMemo(() => {
    try {
      return getBrowserClient();
    } catch {
      return null;
    }
  }, []);

  const query = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId || !supabaseClient) return null;

      const result = await fetchProfileWithClient(supabaseClient, userId);
      if (!result.success) {
        throw new Error(result.error);
      }

      return result.data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  return {
    profile: query.data,
    isLoading: query.isLoading,
    error: query.error,
    supabaseClient,
  };
}
