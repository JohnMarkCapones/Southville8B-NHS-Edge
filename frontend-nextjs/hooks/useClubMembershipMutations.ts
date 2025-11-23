/**
 * useClubMembershipMutations Hook
 *
 * React Query mutations for club membership operations:
 * - Add single member
 * - Add multiple members (bulk)
 * - Update member (change position)
 * - Remove member
 *
 * Usage:
 * ```tsx
 * const { addMember, addMembersBulk, updateMember, removeMember } = useClubMembershipMutations(clubId);
 * ```
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  addClubMember,
  addClubMembersBulk,
  updateClubMembership,
  removeClubMember,
  type CreateClubMembershipDto,
  type UpdateClubMembershipDto,
} from '@/lib/api/endpoints/clubs';
import { useToast } from '@/hooks/use-toast';

export function useClubMembershipMutations(clubId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Add single member
  const addMember = useMutation({
    mutationFn: (data: CreateClubMembershipDto) => addClubMember(data),
    onSuccess: () => {
      // Invalidate club memberships query to refetch
      queryClient.invalidateQueries({ queryKey: ['club-memberships', clubId] });
      toast({
        title: 'Success',
        description: 'Member added successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to add member',
        variant: 'destructive',
      });
    },
  });

  // Add multiple members (bulk)
  const addMembersBulk = useMutation({
    mutationFn: (members: CreateClubMembershipDto[]) => addClubMembersBulk(members),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['club-memberships', clubId] });
      toast({
        title: 'Success',
        description: `${data.length} member${data.length !== 1 ? 's' : ''} added successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to add members',
        variant: 'destructive',
      });
    },
  });

  // Update member (change position)
  const updateMember = useMutation({
    mutationFn: ({
      membershipId,
      data,
    }: {
      membershipId: string;
      data: UpdateClubMembershipDto;
    }) => updateClubMembership(membershipId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['club-memberships', clubId] });
      toast({
        title: 'Success',
        description: 'Member updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to update member',
        variant: 'destructive',
      });
    },
  });

  // Remove member
  const removeMember = useMutation({
    mutationFn: (membershipId: string) => removeClubMember(membershipId),
    // Don't throw errors in the component
    throwOnError: false,
    onMutate: async (membershipId) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['club-memberships', clubId] });

      // Snapshot the previous value
      const previousMembers = queryClient.getQueryData(['club-memberships', clubId]);

      // Optimistically update by removing the member from cache
      queryClient.setQueryData(['club-memberships', clubId], (old: any) => {
        if (!old) return old;
        return old.filter((m: any) => m.id !== membershipId);
      });

      // Return context with previous data for rollback
      return { previousMembers };
    },
    onSuccess: () => {
      // Refetch to ensure we're in sync with server
      queryClient.invalidateQueries({ queryKey: ['club-memberships', clubId] });
      toast({
        title: 'Success',
        description: 'Member removed successfully',
      });
    },
    onError: (error: any, membershipId, context) => {
      // Rollback to previous state on error
      if (context?.previousMembers) {
        queryClient.setQueryData(['club-memberships', clubId], context.previousMembers);
      }

      // Show appropriate error message
      const errorMessage = error?.message || 'Failed to remove member';
      const is404 = errorMessage.includes('not found') || errorMessage.includes('404');

      toast({
        title: 'Error',
        description: is404
          ? 'This member has already been removed'
          : errorMessage,
        variant: 'destructive',
      });
    },
  });

  return {
    addMember,
    addMembersBulk,
    updateMember,
    removeMember,
  };
}
