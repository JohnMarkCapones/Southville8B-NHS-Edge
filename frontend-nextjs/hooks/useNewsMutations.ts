/**
 * useNewsMutations Hook
 *
 * React Query mutation hooks for news CRUD operations
 * Handles create, update, delete, restore, and image upload with optimistic updates
 *
 * @module hooks/useNewsMutations
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { newsApi, CreateNewsDto, UpdateNewsDto, UploadImageResponse } from '@/lib/api/endpoints/news';
import { NewsArticle } from '@/types/news';
import { newsQueryKeys } from './useNews';

/**
 * Hook to create a new news article
 */
export function useCreateNews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateNewsDto) => newsApi.createNews(data),
    onSuccess: () => {
      // Invalidate all news lists to refetch
      queryClient.invalidateQueries({ queryKey: newsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: newsQueryKeys.all });
    },
    onError: (error) => {
      console.error('[useCreateNews] Error creating article:', error);
    },
  });
}

/**
 * Hook to update an existing news article
 */
export function useUpdateNews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNewsDto }) =>
      newsApi.updateNews(id, data),
    onSuccess: (updatedArticle) => {
      // Invalidate the specific article detail
      queryClient.invalidateQueries({ queryKey: newsQueryKeys.detail(updatedArticle.slug) });

      // Invalidate all lists
      queryClient.invalidateQueries({ queryKey: newsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: newsQueryKeys.all });
    },
    onError: (error) => {
      console.error('[useUpdateNews] Error updating article:', error);
    },
  });
}

/**
 * Hook to delete a news article (soft delete)
 */
export function useDeleteNews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => newsApi.deleteNews(id),
    onSuccess: () => {
      // Invalidate all lists to refetch
      queryClient.invalidateQueries({ queryKey: newsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: newsQueryKeys.all });
    },
    onError: (error) => {
      console.error('[useDeleteNews] Error deleting article:', error);
    },
  });
}

/**
 * Hook to restore a deleted news article
 */
export function useRestoreNews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => newsApi.restoreNews(id),
    onSuccess: () => {
      // Invalidate all lists to refetch
      queryClient.invalidateQueries({ queryKey: newsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: newsQueryKeys.all });
    },
    onError: (error) => {
      console.error('[useRestoreNews] Error restoring article:', error);
    },
  });
}

/**
 * Hook to upload an image for Tiptap editor
 */
export function useUploadNewsImage() {
  return useMutation({
    mutationFn: (file: File) => newsApi.uploadImage(file),
    onError: (error) => {
      console.error('[useUploadNewsImage] Error uploading image:', error);
    },
  });
}

/**
 * Hook to submit article for approval
 */
export function useSubmitForApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => newsApi.submitForApproval(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: newsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: newsQueryKeys.all });
    },
    onError: (error) => {
      console.error('[useSubmitForApproval] Error submitting article:', error);
    },
  });
}

/**
 * Hook to approve an article
 */
export function useApproveNews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, message }: { id: string; message?: string }) =>
      newsApi.approveNews(id, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: newsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: newsQueryKeys.all });
    },
    onError: (error) => {
      console.error('[useApproveNews] Error approving article:', error);
    },
  });
}

/**
 * Hook to reject an article
 */
export function useRejectNews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      newsApi.rejectNews(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: newsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: newsQueryKeys.all });
    },
    onError: (error) => {
      console.error('[useRejectNews] Error rejecting article:', error);
    },
  });
}

/**
 * Combined mutations hook for convenience
 * Returns all news mutation hooks in one object
 */
export function useNewsMutations() {
  return {
    create: useCreateNews(),
    update: useUpdateNews(),
    delete: useDeleteNews(),
    restore: useRestoreNews(),
    uploadImage: useUploadNewsImage(),
    submitForApproval: useSubmitForApproval(),
    approve: useApproveNews(),
    reject: useRejectNews(),
  };
}
