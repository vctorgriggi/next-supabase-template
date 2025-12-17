'use client';

import { useQuery } from '@tanstack/react-query';

import { profileKeys } from '@/lib/query/keys/profile';
import type { Profile } from '@/lib/supabase/types';

export function useProfile(userId: string | undefined) {
  const query = useQuery<Profile | null>({
    queryKey: userId ? profileKeys.detail(userId) : profileKeys.all,
    enabled: !!userId,
  });

  return { profile: query.data, isLoading: query.isLoading, error: query.error };
}
