/**
 * ========================================
 * ANNOUNCEMENTS REACT QUERY HOOKS
 * ========================================
 * Custom hooks for managing announcement data with React Query.
 * 
 * Features:
 * - Automatic caching and background refetching
 * - Optimistic updates for mutations
 * - Deduplication of requests
 * - Error handling and retry logic
 * 
 * Usage:
 * ```tsx
 * const { data: announcements, isLoading } = useAnnouncements({ page: 1 });
 * const createMutation = useCreateAnnouncement();
 * ```
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import {
  getAnnouncements,
  getMyAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getTags,
  createTag,
  updateTag,
  deleteTag,
} from '@/lib/api/endpoints/announcements';
import type {
  AnnouncementListResponse,
  AnnouncementResponse,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
  AnnouncementQueryParams,
  MyAnnouncementsQueryParams,
  TagListResponse,
  CreateTagRequest,
  UpdateTagRequest,
  DeleteResponse,
} from '@/lib/api/types/announcements';

// ========================================
// QUERY KEYS
// ========================================
// Centralized query keys for cache invalidation and management

export const announcementKeys = {
  // Base key for all announcement-related queries
  all: ['announcements'] as const,
  
  // List queries (with different filters)
  lists: () => [...announcementKeys.all, 'list'] as const,
  list: (params?: AnnouncementQueryParams) => [...announcementKeys.lists(), params] as const,
  
  // User-specific announcements
  myAnnouncements: (params?: MyAnnouncementsQueryParams) => 
    [...announcementKeys.all, 'my-announcements', params] as const,
  
  // Single announcement details
  details: () => [...announcementKeys.all, 'detail'] as const,
  detail: (id: string) => [...announcementKeys.details(), id] as const,
  
  // Tags
  tags: () => [...announcementKeys.all, 'tags'] as const,
};

// ========================================
// QUERY HOOKS (Read Operations)
// ========================================

/**
 * Fetch all announcements with pagination and filtering
 * 
 * Features:
 * - Cached for 5 minutes (staleTime)
 * - Automatically refetches when window regains focus
 * - Retries failed requests up to 3 times
 * 
 * @param params - Query parameters for filtering and pagination
 * @param options - Additional React Query options
 * 
 * @example
 * ```tsx
 * function AnnouncementsList() {
 *   const { data, isLoading, error } = useAnnouncements({
 *     page: 1,
 *     limit: 10,
 *     visibility: 'public'
 *   });
 * 
 *   if (isLoading) return <LoadingSpinner />;
 *   if (error) return <ErrorMessage error={error} />;
 * 
 *   return (
 *     <div>
 *       {data?.data.map(announcement => (
 *         <AnnouncementCard key={announcement.id} announcement={announcement} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useAnnouncements(
  params?: AnnouncementQueryParams,
  options?: UseQueryOptions<AnnouncementListResponse, Error>
) {
  return useQuery<AnnouncementListResponse, Error>({
    queryKey: announcementKeys.list(params),
    queryFn: () => getAnnouncements(params),
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: true, // Re-fetch when user returns to tab
    retry: 3, // Retry failed requests 3 times
    ...options,
  });
}

/**
 * Fetch announcements specific to the current user's role
 * 
 * This hook is useful for personalized announcement feeds that
 * only show announcements relevant to the authenticated user.
 * 
 * @param params - Query parameters for pagination
 * @param options - Additional React Query options
 * 
 * @example
 * ```tsx
 * function MyAnnouncementsFeed() {
 *   const { data, isLoading } = useMyAnnouncements({
 *     page: 1,
 *     limit: 5,
 *     includeExpired: false
 *   });
 * 
 *   return (
 *     <div>
 *       <h2>Your Announcements</h2>
 *       {data?.data.map(announcement => (
 *         <AnnouncementItem key={announcement.id} announcement={announcement} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useMyAnnouncements(
  params?: MyAnnouncementsQueryParams,
  options?: UseQueryOptions<AnnouncementListResponse, Error>
) {
  return useQuery<AnnouncementListResponse, Error>({
    queryKey: announcementKeys.myAnnouncements(params),
    queryFn: () => getMyAnnouncements(params),
    staleTime: 3 * 60 * 1000, // Shorter stale time for user-specific data
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 3,
    ...options,
  });
}

/**
 * Fetch a single announcement by ID
 * 
 * Useful for detail pages showing full announcement content.
 * 
 * @param id - Announcement UUID
 * @param options - Additional React Query options
 * 
 * @example
 * ```tsx
 * function AnnouncementDetailPage({ announcementId }: { announcementId: string }) {
 *   const { data: announcement, isLoading } = useAnnouncementById(announcementId);
 * 
 *   if (isLoading) return <LoadingSpinner />;
 * 
 *   return (
 *     <div>
 *       <h1>{announcement?.title}</h1>
 *       <div dangerouslySetInnerHTML={{ __html: announcement?.content || '' }} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useAnnouncementById(
  id: string,
  options?: UseQueryOptions<AnnouncementResponse, Error>
) {
  return useQuery<AnnouncementResponse, Error>({
    queryKey: announcementKeys.detail(id),
    queryFn: () => getAnnouncementById(id),
    staleTime: 10 * 60 * 1000, // Single announcements stay fresh longer
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false, // Don't refetch detail pages on focus
    retry: 3,
    enabled: !!id, // Only run query if ID is provided
    ...options,
  });
}

/**
 * Fetch all available tags
 * 
 * Tags are used for categorizing announcements.
 * 
 * @param options - Additional React Query options
 * 
 * @example
 * ```tsx
 * function TagFilter() {
 *   const { data: tags } = useTags();
 * 
 *   return (
 *     <div>
 *       {tags?.map(tag => (
 *         <Badge key={tag.id} style={{ backgroundColor: tag.color }}>
 *           {tag.name}
 *         </Badge>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useTags(options?: UseQueryOptions<TagListResponse, Error>) {
  return useQuery<TagListResponse, Error>({
    queryKey: announcementKeys.tags(),
    queryFn: getTags,
    staleTime: 30 * 60 * 1000, // Tags change infrequently, cache for 30 minutes
    gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
    refetchOnWindowFocus: false,
    retry: 3,
    ...options,
  });
}

// ========================================
// MUTATION HOOKS (Write Operations)
// ========================================

/**
 * Create a new announcement
 * 
 * Automatically invalidates announcement list cache on success.
 * 
 * **Permissions**: Admin, Teacher only
 * 
 * @example
 * ```tsx
 * function CreateAnnouncementForm() {
 *   const createMutation = useCreateAnnouncement();
 * 
 *   const handleSubmit = async (data: CreateAnnouncementRequest) => {
 *     try {
 *       const newAnnouncement = await createMutation.mutateAsync(data);
 *       toast.success('Announcement created successfully!');
 *       router.push(`/announcements/${newAnnouncement.id}`);
 *     } catch (error) {
 *       toast.error('Failed to create announcement');
 *     }
 *   };
 * 
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       {/* form fields *\/}
 *       <Button type="submit" disabled={createMutation.isPending}>
 *         {createMutation.isPending ? 'Creating...' : 'Create'}
 *       </Button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useCreateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation<AnnouncementResponse, Error, CreateAnnouncementRequest>({
    mutationFn: createAnnouncement,
    onSuccess: () => {
      // Invalidate all announcement lists to refetch with new data
      queryClient.invalidateQueries({ queryKey: announcementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: announcementKeys.all });
    },
  });
}

/**
 * Update an existing announcement
 * 
 * Performs optimistic update for better UX.
 * 
 * **Permissions**: Admin (all), Teacher (own only)
 * 
 * @example
 * ```tsx
 * function EditAnnouncementForm({ announcement }: { announcement: Announcement }) {
 *   const updateMutation = useUpdateAnnouncement();
 * 
 *   const handleSubmit = async (updates: UpdateAnnouncementRequest) => {
 *     try {
 *       await updateMutation.mutateAsync({
 *         id: announcement.id,
 *         data: updates
 *       });
 *       toast.success('Announcement updated!');
 *     } catch (error) {
 *       toast.error('Failed to update announcement');
 *     }
 *   };
 * 
 *   return <form onSubmit={handleSubmit}>{/* form fields *\/}</form>;
 * }
 * ```
 */
export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation<
    AnnouncementResponse,
    Error,
    { id: string; data: UpdateAnnouncementRequest }
  >({
    mutationFn: ({ id, data }) => updateAnnouncement(id, data),
    // Optimistic update
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: announcementKeys.detail(id) });

      // Snapshot previous value
      const previousAnnouncement = queryClient.getQueryData<AnnouncementResponse>(
        announcementKeys.detail(id)
      );

      // Optimistically update cache
      if (previousAnnouncement) {
        queryClient.setQueryData<AnnouncementResponse>(
          announcementKeys.detail(id),
          { ...previousAnnouncement, ...data }
        );
      }

      return { previousAnnouncement };
    },
    // Rollback on error
    onError: (_err, { id }, context) => {
      if (context?.previousAnnouncement) {
        queryClient.setQueryData(
          announcementKeys.detail(id),
          context.previousAnnouncement
        );
      }
    },
    // Refetch on success
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: announcementKeys.lists() });
    },
  });
}

/**
 * Delete an announcement
 * 
 * Removes announcement from cache immediately on success.
 * 
 * **Permissions**: Admin only
 * 
 * @example
 * ```tsx
 * function DeleteAnnouncementButton({ announcementId }: { announcementId: string }) {
 *   const deleteMutation = useDeleteAnnouncement();
 * 
 *   const handleDelete = async () => {
 *     if (confirm('Are you sure you want to delete this announcement?')) {
 *       try {
 *         await deleteMutation.mutateAsync(announcementId);
 *         toast.success('Announcement deleted');
 *         router.push('/announcements');
 *       } catch (error) {
 *         toast.error('Failed to delete announcement');
 *       }
 *     }
 *   };
 * 
 *   return (
 *     <Button onClick={handleDelete} variant="destructive">
 *       Delete
 *     </Button>
 *   );
 * }
 * ```
 */
export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation<DeleteResponse, Error, string>({
    mutationFn: deleteAnnouncement,
    onSuccess: (_data, announcementId) => {
      // Remove announcement from cache
      queryClient.removeQueries({ queryKey: announcementKeys.detail(announcementId) });
      
      // Invalidate lists to remove deleted item
      queryClient.invalidateQueries({ queryKey: announcementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: announcementKeys.all });
    },
  });
}

// ========================================
// TAG MUTATION HOOKS
// ========================================

/**
 * Create a new tag
 * 
 * **Permissions**: Admin only
 */
export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation<any, Error, CreateTagRequest>({
    mutationFn: createTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.tags() });
    },
  });
}

/**
 * Update an existing tag
 * 
 * **Permissions**: Admin only
 */
export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation<any, Error, { id: string; data: UpdateTagRequest }>({
    mutationFn: ({ id, data }) => updateTag(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.tags() });
    },
  });
}

/**
 * Delete a tag
 * 
 * **Permissions**: Admin only
 */
export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation<DeleteResponse, Error, string>({
    mutationFn: deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.tags() });
    },
  });
}

