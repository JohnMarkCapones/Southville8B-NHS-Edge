/**
 * useSchedules Hook
 *
 * React Query hook for fetching student schedules
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { getMySchedule } from '@/lib/api/endpoints/schedules';
import type { Schedule } from '@/lib/api/types/schedules';

/**
 * Hook to fetch current student's schedule
 */
export function useMySchedule() {
  return useQuery<Schedule[], Error>({
    queryKey: ['schedules', 'my-schedule'],
    queryFn: getMySchedule,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}
