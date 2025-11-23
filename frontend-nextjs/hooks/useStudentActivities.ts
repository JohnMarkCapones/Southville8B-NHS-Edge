/**
 * useStudentActivities Hook
 *
 * React Query hook for fetching and managing student activity timeline.
 * Provides activity data with caching, pagination, and real-time updates.
 *
 * Usage:
 * ```tsx
 * const { data, isLoading, error } = useStudentActivities({ limit: 20 });
 * ```
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMyActivities,
  getMyActivityStatistics,
  updateActivityVisibility,
  getRecentActivities,
  getHighlightedActivities,
  type StudentActivityFilters,
  type PaginatedActivitiesResponse,
  type ActivityStatistics,
  type StudentActivity,
} from '@/lib/api/endpoints/student-activities';

/**
 * Query key factory for student activities
 */
export const STUDENT_ACTIVITIES_QUERY_KEYS = {
  all: ['student-activities'] as const,
  lists: () => [...STUDENT_ACTIVITIES_QUERY_KEYS.all, 'list'] as const,
  list: (filters?: StudentActivityFilters) =>
    [...STUDENT_ACTIVITIES_QUERY_KEYS.lists(), filters] as const,
  recent: () => [...STUDENT_ACTIVITIES_QUERY_KEYS.all, 'recent'] as const,
  highlighted: () => [...STUDENT_ACTIVITIES_QUERY_KEYS.all, 'highlighted'] as const,
  statistics: () => [...STUDENT_ACTIVITIES_QUERY_KEYS.all, 'statistics'] as const,
  detail: (id: string) => [...STUDENT_ACTIVITIES_QUERY_KEYS.all, 'detail', id] as const,
};

/**
 * Hook to fetch student activities with filters and pagination
 *
 * Features:
 * - Automatic caching (2 minutes stale time)
 * - Pagination support
 * - Filtering by activity type, date range, etc.
 * - Auto-refetch on window focus
 *
 * @param filters - Activity filters
 * @returns Query result with activities data
 */
export function useStudentActivities(filters?: StudentActivityFilters) {
  return useQuery<PaginatedActivitiesResponse, Error>({
    queryKey: STUDENT_ACTIVITIES_QUERY_KEYS.list(filters),
    queryFn: () => getMyActivities(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook to fetch recent activities (last 7 days)
 *
 * @returns Query result with recent activities
 */
export function useRecentActivities() {
  return useQuery<PaginatedActivitiesResponse, Error>({
    queryKey: STUDENT_ACTIVITIES_QUERY_KEYS.recent(),
    queryFn: getRecentActivities,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch highlighted/important activities
 *
 * @returns Query result with highlighted activities
 */
export function useHighlightedActivities() {
  return useQuery<PaginatedActivitiesResponse, Error>({
    queryKey: STUDENT_ACTIVITIES_QUERY_KEYS.highlighted(),
    queryFn: getHighlightedActivities,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch activity statistics
 *
 * @returns Query result with activity statistics
 */
export function useActivityStatistics() {
  return useQuery<ActivityStatistics, Error>({
    queryKey: STUDENT_ACTIVITIES_QUERY_KEYS.statistics(),
    queryFn: getMyActivityStatistics,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}

/**
 * Hook to update activity visibility (hide/show)
 *
 * Automatically invalidates related queries on success
 *
 * @returns Mutation object with mutate function
 *
 * @example
 * ```tsx
 * const { mutate: hideActivity } = useUpdateActivityVisibility();
 * hideActivity({ activityId: 'abc-123', isVisible: false });
 * ```
 */
export function useUpdateActivityVisibility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      activityId,
      isVisible,
    }: {
      activityId: string;
      isVisible: boolean;
    }) => updateActivityVisibility(activityId, isVisible),
    onSuccess: () => {
      // Invalidate all activity queries to refetch with updated data
      queryClient.invalidateQueries({
        queryKey: STUDENT_ACTIVITIES_QUERY_KEYS.all,
      });
    },
    onError: (error) => {
      console.error('[useUpdateActivityVisibility] Error:', error);
    },
  });
}

/**
 * Hook to prefetch activities (useful for optimistic loading)
 *
 * @param filters - Activity filters to prefetch
 *
 * @example
 * ```tsx
 * const prefetchActivities = usePrefetchActivities();
 * prefetchActivities({ page: 2 }); // Prefetch next page
 * ```
 */
export function usePrefetchActivities() {
  const queryClient = useQueryClient();

  return (filters?: StudentActivityFilters) => {
    queryClient.prefetchQuery({
      queryKey: STUDENT_ACTIVITIES_QUERY_KEYS.list(filters),
      queryFn: () => getMyActivities(filters),
      staleTime: 2 * 60 * 1000,
    });
  };
}
