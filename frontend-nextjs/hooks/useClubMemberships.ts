/**
 * useClubMemberships Hook
 *
 * React Query hook for fetching club memberships for a specific club.
 * Used to get the list of members in a club.
 *
 * Usage:
 * ```tsx
 * const { data: memberships, isLoading } = useClubMemberships(clubId);
 * ```
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

export interface ClubMembership {
  id: string;
  student_id: string;
  club_id: string;
  position_id: string;
  status: 'active' | 'pending' | 'inactive';
  joined_at: string;
  created_at: string;
  updated_at: string;
  // Populated relations
  student?: {
    id: string;
    full_name: string;
    email: string;
    student_id: string;
  };
  position?: {
    id: string;
    name: string;
  };
}

/**
 * Fetch club memberships from API
 */
async function getClubMemberships(clubId: string): Promise<ClubMembership[]> {
  return apiClient.get<ClubMembership[]>(
    `/club-memberships?clubId=${clubId}`,
    { requiresAuth: true }
  );
}

/**
 * Hook to fetch club memberships for a specific club
 *
 * Features:
 * - Automatic caching (3 minutes stale time)
 * - Only fetches when clubId is provided
 * - Auto-refetch on window focus
 */
export function useClubMemberships(clubId?: string) {
  return useQuery<ClubMembership[], Error>({
    queryKey: ['club-memberships', clubId],
    queryFn: () => getClubMemberships(clubId!),
    enabled: !!clubId,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    refetchOnWindowFocus: true,
  });
}
