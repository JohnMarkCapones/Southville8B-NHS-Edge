/**
 * useFormResponseMutations Hook
 *
 * React Query mutations for form response operations:
 * - Submit response (student)
 * - Review response - approve/reject (teacher)
 *
 * Usage:
 * ```tsx
 * const mutations = useFormResponseMutations(clubId, formId);
 * await mutations.submitResponse.mutateAsync({ answers: [...] });
 * await mutations.reviewResponse.mutateAsync({ responseId, data: { status: 'approved' } });
 * ```
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  submitFormResponse,
  reviewFormResponse,
  type SubmitFormResponseDto,
  type ReviewFormResponseDto,
} from '@/lib/api/endpoints/club-forms';
import { useToast } from '@/hooks/use-toast';

export function useFormResponseMutations(clubId: string, formId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  /**
   * Submit a form response (student application)
   */
  const submitResponse = useMutation({
    mutationFn: (data: SubmitFormResponseDto) => submitFormResponse(clubId, formId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['form-responses', clubId, formId] });
      toast({
        title: 'Success',
        description: 'Application submitted successfully',
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Failed to submit application';
      const isDuplicate = errorMessage.includes('already exists') || errorMessage.includes('409');

      toast({
        title: 'Error',
        description: isDuplicate
          ? 'You have already submitted an application for this club'
          : errorMessage,
        variant: 'destructive',
      });
    },
  });

  /**
   * Review a form response (approve or reject)
   */
  const reviewResponse = useMutation({
    mutationFn: ({ responseId, data }: { responseId: string; data: ReviewFormResponseDto }) =>
      reviewFormResponse(clubId, formId, responseId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['form-responses', clubId, formId] });
      queryClient.invalidateQueries({
        queryKey: ['form-response', clubId, formId, variables.responseId],
      });

      const action = variables.data.status === 'approved' ? 'approved' : 'rejected';
      toast({
        title: 'Success',
        description: `Application ${action} successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to review application',
        variant: 'destructive',
      });
    },
  });

  /**
   * Bulk review responses (approve or reject multiple)
   */
  const bulkReviewResponses = useMutation({
    mutationFn: async ({
      responseIds,
      status,
      notes,
    }: {
      responseIds: string[];
      status: 'approved' | 'rejected';
      notes?: string;
    }) => {
      // Review each response sequentially
      const results = [];
      for (const responseId of responseIds) {
        try {
          const result = await reviewFormResponse(clubId, formId, responseId, {
            status,
            review_notes: notes,
          });
          results.push({ responseId, success: true, result });
        } catch (error) {
          results.push({ responseId, success: false, error });
        }
      }
      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['form-responses', clubId, formId] });

      const successCount = results.filter((r) => r.success).length;
      const failCount = results.filter((r) => !r.success).length;

      if (failCount === 0) {
        toast({
          title: 'Success',
          description: `${successCount} application(s) reviewed successfully`,
        });
      } else {
        toast({
          title: 'Partial Success',
          description: `${successCount} succeeded, ${failCount} failed`,
          variant: 'destructive',
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to review applications',
        variant: 'destructive',
      });
    },
  });

  return {
    submitResponse,
    reviewResponse,
    bulkReviewResponses,
  };
}
