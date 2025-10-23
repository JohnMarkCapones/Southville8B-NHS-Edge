/**
 * useTeacherClubs Hook
 *
 * React Query hook for fetching clubs where the logged-in teacher is advisor or co-advisor.
 * Automatically filters clubs based on the current user's ID.
 *
 * Usage:
 * ```tsx
 * const { data: clubs, isLoading, isError } = useTeacherClubs();
 * ```
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { getClubs } from '@/lib/api/endpoints/clubs';
import { useUser } from './useUser';
import type { Club } from '@/lib/api/types/clubs';

/**
 * Hook to fetch clubs where the teacher is advisor or co-advisor
 *
 * Features:
 * - Automatic filtering based on logged-in teacher
 * - Caching (5 minutes stale time)
 * - Auto-refetch on window focus
 * - Only fetches when user is loaded
 */
export function useTeacherClubs() {
  const { data: user, isLoading: isLoadingUser } = useUser();

  return useQuery<Club[], Error>({
    queryKey: ['teacher-clubs', user?.id],
    queryFn: async () => {
      // Fetch all clubs from API
      const allClubs = await getClubs();

      // Filter clubs where user is advisor or co-advisor
      if (!user?.id) return [];

      return allClubs.filter(
        (club) =>
          club.advisor_id === user.id ||
          club.co_advisor_id === user.id
      );
    },
    enabled: !!user?.id && !isLoadingUser, // Only run when user is loaded
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    refetchOnWindowFocus: true,
  });
}
