/**
 * useUser Hook
 * 
 * React Query hook for fetching and caching the current user's profile.
 * Automatically refreshes on window focus and retries on failure.
 * 
 * Usage:
 * ```tsx
 * const { user, isLoading, isError, error } = useUser();
 * ```
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/lib/api/endpoints';
import type { UserProfileResponse } from '@/lib/api/types';

/**
 * Query key for user data
 */
export const USER_QUERY_KEY = ['user', 'me'];

/**
 * Hook to fetch current authenticated user profile
 * 
 * Features:
 * - Automatic caching (5 minutes stale time)
 * - Auto-refetch on window focus
 * - Retry on failure (3 attempts)
 * - Suspense-ready
 */
export function useUser() {
  return useQuery<UserProfileResponse, Error>({
    queryKey: USER_QUERY_KEY,
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 3,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

/**
 * Hook options for manual refetch and cache invalidation
 */
export { useQueryClient } from '@tanstack/react-query';

