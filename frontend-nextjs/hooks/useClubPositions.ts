/**
 * useClubPositions Hook
 *
 * React Query hook for fetching all club positions.
 * Positions are global and rarely change, so we cache them for a long time.
 *
 * Usage:
 * ```tsx
 * const { data: positions, isLoading } = useClubPositions();
 * ```
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { getClubPositions } from '@/lib/api/endpoints/clubs';

export function useClubPositions() {
  return useQuery({
    queryKey: ['club-positions'],
    queryFn: getClubPositions,
    staleTime: 10 * 60 * 1000, // 10 minutes (positions rarely change)
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 3,
  });
}
