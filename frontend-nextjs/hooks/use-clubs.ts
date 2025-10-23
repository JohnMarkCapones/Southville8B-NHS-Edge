/**
 * ========================================
 * CLUBS REACT QUERY HOOKS
 * ========================================
 * Custom hooks for fetching and mutating clubs data
 * Uses React Query for caching, loading states, and optimistic updates
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getClubs,
  getClubById,
  getClubsWithMemberCounts,
  createClub,
  updateClub,
  deleteClub,
  getAllClubMemberships,
} from '@/lib/api/endpoints/clubs';
import {
  transformClubsToTableRows,
  transformClubToTableRow,
  type ClubTableRow,
} from '@/lib/api/adapters/clubs.adapter';
import type { CreateClubDto, UpdateClubDto, Club } from '@/lib/api/types/clubs';

// ========================================
// QUERY KEYS
// ========================================

export const clubKeys = {
  all: ['clubs'] as const,
  lists: () => [...clubKeys.all, 'list'] as const,
  list: (filters: string) => [...clubKeys.lists(), { filters }] as const,
  details: () => [...clubKeys.all, 'detail'] as const,
  detail: (id: string) => [...clubKeys.details(), id] as const,
  members: (id: string) => [...clubKeys.detail(id), 'members'] as const,
  memberships: ['club-memberships'] as const,
};

// ========================================
// QUERY HOOKS
// ========================================

/**
 * Fetch all clubs with member counts for table display
 * Returns transformed data ready for UI consumption
 */
export function useClubsTable() {
  return useQuery({
    queryKey: clubKeys.lists(),
    queryFn: async () => {
      const { clubs, memberships } = await getClubsWithMemberCounts();

      // Transform to table-friendly format
      return transformClubsToTableRows(clubs, memberships);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
  });
}

/**
 * Fetch all clubs (raw data without transformations)
 */
export function useClubs() {
  return useQuery({
    queryKey: clubKeys.all,
    queryFn: () => getClubs(),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Fetch a single club by ID
 */
export function useClub(id: string, enabled = true) {
  return useQuery({
    queryKey: clubKeys.detail(id),
    queryFn: () => getClubById(id),
    enabled: !!id && enabled,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Fetch members for a specific club
 */
export function useClubMembers(clubId: string, enabled = true) {
  return useQuery({
    queryKey: clubKeys.members(clubId),
    queryFn: () => getAllClubMemberships(clubId),
    enabled: !!clubId && enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes (members change frequently)
  });
}

/**
 * Fetch all club memberships
 */
export function useClubMemberships(clubId?: string) {
  return useQuery({
    queryKey: clubId ? [...clubKeys.memberships, clubId] : clubKeys.memberships,
    queryFn: () => getAllClubMemberships(clubId),
    staleTime: 1000 * 60 * 2,
  });
}

// ========================================
// MUTATION HOOKS
// ========================================

/**
 * Create a new club
 */
export function useCreateClub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClubDto) => createClub(data),
    onSuccess: () => {
      // Invalidate and refetch clubs list
      queryClient.invalidateQueries({ queryKey: clubKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clubKeys.all });
    },
    onError: (error) => {
      console.error('Error creating club:', error);
    },
  });
}

/**
 * Update an existing club
 */
export function useUpdateClub(clubId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateClubDto) => updateClub(clubId, data),
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: clubKeys.detail(clubId) });

      // Snapshot previous value
      const previousClub = queryClient.getQueryData(clubKeys.detail(clubId));

      // Optimistically update to new value
      queryClient.setQueryData(clubKeys.detail(clubId), (old: any) => ({
        ...old,
        ...newData,
      }));

      return { previousClub };
    },
    onError: (err, newData, context) => {
      // Rollback to previous value on error
      if (context?.previousClub) {
        queryClient.setQueryData(clubKeys.detail(clubId), context.previousClub);
      }
      console.error('Error updating club:', err);
    },
    onSettled: () => {
      // Refetch after error or success
      queryClient.invalidateQueries({ queryKey: clubKeys.detail(clubId) });
      queryClient.invalidateQueries({ queryKey: clubKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clubKeys.all });
    },
  });
}

/**
 * Delete a club
 */
export function useDeleteClub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clubId: string) => deleteClub(clubId),
    onMutate: async (clubId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: clubKeys.lists() });

      // Snapshot previous value
      const previousClubs = queryClient.getQueryData(clubKeys.lists());

      // Optimistically remove from list
      queryClient.setQueryData(clubKeys.lists(), (old: ClubTableRow[] | undefined) => {
        if (!old) return [];
        return old.filter(club => club.id !== clubId);
      });

      return { previousClubs };
    },
    onError: (err, clubId, context) => {
      // Rollback on error
      if (context?.previousClubs) {
        queryClient.setQueryData(clubKeys.lists(), context.previousClubs);
      }
      console.error('Error deleting club:', err);
    },
    onSettled: () => {
      // Refetch after error or success
      queryClient.invalidateQueries({ queryKey: clubKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clubKeys.all });
    },
  });
}

// ========================================
// UTILITY HOOKS
// ========================================

/**
 * Check if clubs data is loading
 */
export function useClubsLoading() {
  const { isLoading: isLoadingClubs } = useClubs();
  const { isLoading: isLoadingMemberships } = useClubMemberships();

  return isLoadingClubs || isLoadingMemberships;
}

/**
 * Prefetch club data (useful for hover states, navigation)
 */
export function usePrefetchClub() {
  const queryClient = useQueryClient();

  return (clubId: string) => {
    queryClient.prefetchQuery({
      queryKey: clubKeys.detail(clubId),
      queryFn: () => getClubById(clubId),
      staleTime: 1000 * 60 * 5,
    });
  };
}
