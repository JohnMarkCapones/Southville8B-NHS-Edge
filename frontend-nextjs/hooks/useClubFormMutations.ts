/**
 * useClubFormMutations Hook
 *
 * React Query mutations for club form operations:
 * - Create/update/delete forms
 * - Add/update/delete questions
 *
 * Usage:
 * ```tsx
 * const mutations = useClubFormMutations(clubId);
 * await mutations.createForm.mutateAsync({ name: 'Application Form' });
 * await mutations.addQuestion.mutateAsync({ formId, data: {...} });
 * ```
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createClubFormForClub,
  updateClubForm,
  deleteClubForm,
  addFormQuestion,
  updateFormQuestion,
  deleteFormQuestion,
  type CreateClubFormDto,
  type UpdateClubFormDto,
  type CreateFormQuestionDto,
  type UpdateFormQuestionDto,
} from '@/lib/api/endpoints/club-forms';
import { useToast } from '@/hooks/use-toast';

export function useClubFormMutations(clubId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // ============================================================================
  // FORM MUTATIONS
  // ============================================================================

  /**
   * Create a new form
   */
  const createForm = useMutation({
    mutationFn: (data: CreateClubFormDto) => createClubFormForClub(clubId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['club-forms', clubId] });
      toast({
        title: 'Success',
        description: 'Form created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to create form',
        variant: 'destructive',
      });
    },
  });

  /**
   * Update an existing form
   */
  const updateForm = useMutation({
    mutationFn: ({ formId, data }: { formId: string; data: UpdateClubFormDto }) =>
      updateClubForm(clubId, formId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['club-forms', clubId] });
      queryClient.invalidateQueries({ queryKey: ['club-form', clubId, variables.formId] });
      toast({
        title: 'Success',
        description: 'Form updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to update form',
        variant: 'destructive',
      });
    },
  });

  /**
   * Delete a form
   */
  const deleteForm = useMutation({
    mutationFn: (formId: string) => deleteClubForm(clubId, formId),
    throwOnError: false,
    onMutate: async (formId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['club-forms', clubId] });

      // Snapshot previous value
      const previousForms = queryClient.getQueryData(['club-forms', clubId]);

      // Optimistically remove form
      queryClient.setQueryData(['club-forms', clubId], (old: any) => {
        if (!old) return old;
        return old.filter((f: any) => f.id !== formId);
      });

      return { previousForms };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['club-forms', clubId] });
      toast({
        title: 'Success',
        description: 'Form deleted successfully',
      });
    },
    onError: (error: any, formId, context) => {
      // Rollback on error
      if (context?.previousForms) {
        queryClient.setQueryData(['club-forms', clubId], context.previousForms);
      }

      toast({
        title: 'Error',
        description: error?.message || 'Failed to delete form',
        variant: 'destructive',
      });
    },
  });

  // ============================================================================
  // QUESTION MUTATIONS
  // ============================================================================

  /**
   * Add a question to a form
   */
  const addQuestion = useMutation({
    mutationFn: ({ formId, data }: { formId: string; data: CreateFormQuestionDto }) =>
      addFormQuestion(clubId, formId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['club-form', clubId, variables.formId] });
      toast({
        title: 'Success',
        description: 'Question added successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to add question',
        variant: 'destructive',
      });
    },
  });

  /**
   * Update a question
   */
  const updateQuestion = useMutation({
    mutationFn: ({
      formId,
      questionId,
      data,
    }: {
      formId: string;
      questionId: string;
      data: UpdateFormQuestionDto;
    }) => updateFormQuestion(clubId, formId, questionId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['club-form', clubId, variables.formId] });
      toast({
        title: 'Success',
        description: 'Question updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to update question',
        variant: 'destructive',
      });
    },
  });

  /**
   * Delete a question
   */
  const deleteQuestion = useMutation({
    mutationFn: ({ formId, questionId }: { formId: string; questionId: string }) =>
      deleteFormQuestion(clubId, formId, questionId),
    throwOnError: false,
    onMutate: async ({ formId, questionId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['club-form', clubId, formId] });

      // Snapshot previous value
      const previousForm = queryClient.getQueryData(['club-form', clubId, formId]);

      // Optimistically remove question
      queryClient.setQueryData(['club-form', clubId, formId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          questions: old.questions?.filter((q: any) => q.id !== questionId),
        };
      });

      return { previousForm };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['club-form', clubId, variables.formId] });
      toast({
        title: 'Success',
        description: 'Question deleted successfully',
      });
    },
    onError: (error: any, variables, context) => {
      // Rollback on error
      if (context?.previousForm) {
        queryClient.setQueryData(['club-form', clubId, variables.formId], context.previousForm);
      }

      toast({
        title: 'Error',
        description: error?.message || 'Failed to delete question',
        variant: 'destructive',
      });
    },
  });

  return {
    createForm,
    updateForm,
    deleteForm,
    addQuestion,
    updateQuestion,
    deleteQuestion,
  };
}
