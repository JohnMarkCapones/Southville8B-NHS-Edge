import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getEvents,
  getEventById,
  getEventsByClubId,
  createEvent,
  updateEvent,
  deleteEvent,
  archiveEvent,
  getArchivedEvents,
  restoreEvent,
  addEventAdditionalInfo,
  updateEventAdditionalInfo,
  removeEventAdditionalInfo,
  addEventHighlight,
  updateEventHighlight,
  removeEventHighlight,
  addEventScheduleItem,
  updateEventScheduleItem,
  removeEventScheduleItem,
  addEventFaq,
  updateEventFaq,
  removeEventFaq,
} from '@/lib/api/endpoints/events'
import type {
  Event,
  EventQueryParams,
  CreateEventRequest,
  UpdateEventRequest,
  CreateEventAdditionalInfoRequest,
  UpdateEventAdditionalInfoRequest,
  CreateEventHighlightRequest,
  UpdateEventHighlightRequest,
  CreateEventScheduleRequest,
  UpdateEventScheduleRequest,
  CreateEventFaqRequest,
  UpdateEventFaqRequest,
} from '@/lib/api/types/events'
import { EventStatus, EventVisibility } from '@/lib/api/types/events'
import { useToast } from './use-toast'

// Query keys for consistent caching
export const eventsQueryKeys = {
  all: ['events'] as const,
  lists: () => [...eventsQueryKeys.all, 'list'] as const,
  list: (params: EventQueryParams) => [...eventsQueryKeys.lists(), params] as const,
  details: () => [...eventsQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...eventsQueryKeys.details(), id] as const,
  featured: () => [...eventsQueryKeys.all, 'featured'] as const,
  upcoming: () => [...eventsQueryKeys.all, 'upcoming'] as const,
}

/**
 * Hook to fetch events with filtering and pagination
 */
export function useEvents(params: EventQueryParams = {}) {
  return useQuery({
    queryKey: eventsQueryKeys.list(params),
    queryFn: () => getEvents(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404 or client errors
      if (error instanceof Error && 'status' in error) {
        const status = (error as any).status
        if (status >= 400 && status < 500) {
          return false
        }
      }
      return failureCount < 2
    },
    throwOnError: false,
  })
}

/**
 * Hook to fetch a specific event by ID
 */
export function useEventById(id: string) {
  return useQuery({
    queryKey: eventsQueryKeys.detail(id),
    queryFn: () => getEventById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404
      if (error instanceof Error && 'status' in error) {
        const status = (error as any).status
        if (status === 404) {
          return false
        }
      }
      return failureCount < 2
    },
    throwOnError: false,
  })
}

/**
 * Hook to fetch events by club ID
 */
export function useEventsByClubId(
  clubId: string,
  params?: {
    page?: number;
    limit?: number;
    status?: string;
    visibility?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }
) {
  return useQuery({
    queryKey: ['events', 'club', clubId, params],
    queryFn: () => getEventsByClubId(clubId, params),
    enabled: !!clubId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404 or client errors
      if (error instanceof Error && 'status' in error) {
        const status = (error as any).status
        if (status >= 400 && status < 500) {
          return false
        }
      }
      return failureCount < 2
    },
    throwOnError: false,
  })
}

/**
 * Hook to fetch featured events
 */
export function useFeaturedEvents(limit: number = 3) {
  return useQuery({
    queryKey: [...eventsQueryKeys.featured(), limit],
    queryFn: async () => {
      const response = await getEvents({
        limit: 50, // Get more to filter featured
        status: EventStatus.PUBLISHED,
        visibility: EventVisibility.PUBLIC
      })
      // Filter for featured events
      const featured = response.data.filter(event => event.is_featured === true)
      return featured.slice(0, limit)
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    throwOnError: false,
  })
}

/**
 * Hook to fetch upcoming events (future dates only)
 */
export function useUpcomingEvents(limit: number = 10) {
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  return useQuery({
    queryKey: [...eventsQueryKeys.upcoming(), limit],
    queryFn: async () => {
      const response = await getEvents({
        limit,
        status: EventStatus.PUBLISHED,
        visibility: EventVisibility.PUBLIC,
        startDate: today, // Only future events
      })
      return response.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    throwOnError: false,
  })
}

/**
 * Hook to prefetch events data
 */
export function usePrefetchEvents() {
  const queryClient = useQueryClient()

  const prefetchEvents = (params: EventQueryParams) => {
    queryClient.prefetchQuery({
      queryKey: eventsQueryKeys.list(params),
      queryFn: () => getEvents(params),
      staleTime: 5 * 60 * 1000,
    })
  }

  const prefetchEventById = (id: string) => {
    queryClient.prefetchQuery({
      queryKey: eventsQueryKeys.detail(id),
      queryFn: () => getEventById(id),
      staleTime: 5 * 60 * 1000,
    })
  }

  return {
    prefetchEvents,
    prefetchEventById,
  }
}

/**
 * Hook to invalidate events cache
 */
export function useInvalidateEvents() {
  const queryClient = useQueryClient()

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: eventsQueryKeys.all })
  }

  const invalidateList = (params?: EventQueryParams) => {
    if (params) {
      queryClient.invalidateQueries({ queryKey: eventsQueryKeys.list(params) })
    } else {
      queryClient.invalidateQueries({ queryKey: eventsQueryKeys.lists() })
    }
  }

  const invalidateEvent = (id: string) => {
    queryClient.invalidateQueries({ queryKey: eventsQueryKeys.detail(id) })
  }

  return {
    invalidateAll,
    invalidateList,
    invalidateEvent,
  }
}

// ========================================
// MUTATION HOOKS
// ========================================

/**
 * Hook to create a new event
 */
export function useCreateEvent() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventsQueryKeys.lists() })
      toast({
        title: 'Event created',
        description: 'The event has been created successfully.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to create event',
        description: error?.message || 'An error occurred while creating the event.',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Hook to update an existing event
 */
export function useUpdateEvent() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEventRequest }) =>
      updateEvent(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: eventsQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: eventsQueryKeys.detail(variables.id) })
      toast({
        title: 'Event updated',
        description: 'The event has been updated successfully.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to update event',
        description: error?.message || 'An error occurred while updating the event.',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Hook to archive an event (soft delete)
 */
export function useArchiveEvent() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: archiveEvent,
    onSuccess: () => {
      // Invalidate all event queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['events'] })
      toast({
        title: 'Event archived',
        description: 'The event has been moved to archived events.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to archive event',
        description: error?.message || 'An error occurred while archiving the event.',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Hook to permanently delete an event (hard delete)
 */
export function useDeleteEvent() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      // Invalidate all event queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['events'] })
      toast({
        title: 'Event deleted',
        description: 'The event has been permanently deleted.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to delete event',
        description: error?.message || 'An error occurred while deleting the event.',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Hook to get archived events
 */
export function useArchivedEvents(params: {
  page?: number
  limit?: number
  search?: string
  category?: string
}) {
  return useQuery({
    queryKey: ['events', 'archived', params],
    queryFn: () => getArchivedEvents(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    throwOnError: false,
  })
}

/**
 * Hook to restore an archived event
 */
export function useRestoreEvent() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: restoreEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventsQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ['events', 'archived'] })
      toast({
        title: 'Event restored',
        description: 'The event has been restored successfully.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to restore event',
        description: error?.message || 'An error occurred while restoring the event.',
        variant: 'destructive',
      })
    },
  })
}

// ========================================
// SUB-ENTITY MUTATION HOOKS
// ========================================

/**
 * Hook to add additional info to an event
 */
export function useAddEventAdditionalInfo() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({
      eventId,
      data,
    }: {
      eventId: string
      data: CreateEventAdditionalInfoRequest
    }) => addEventAdditionalInfo(eventId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: eventsQueryKeys.detail(variables.eventId),
      })
      toast({
        title: 'Additional info added',
        description: 'The additional information has been added successfully.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to add additional info',
        description: error?.message || 'An error occurred.',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Hook to add highlight to an event
 */
export function useAddEventHighlight() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({
      eventId,
      data,
    }: {
      eventId: string
      data: CreateEventHighlightRequest
    }) => addEventHighlight(eventId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: eventsQueryKeys.detail(variables.eventId),
      })
      toast({
        title: 'Highlight added',
        description: 'The highlight has been added successfully.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to add highlight',
        description: error?.message || 'An error occurred.',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Hook to add schedule item to an event
 */
export function useAddEventScheduleItem() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({
      eventId,
      data,
    }: {
      eventId: string
      data: CreateEventScheduleRequest
    }) => addEventScheduleItem(eventId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: eventsQueryKeys.detail(variables.eventId),
      })
      toast({
        title: 'Schedule item added',
        description: 'The schedule item has been added successfully.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to add schedule item',
        description: error?.message || 'An error occurred.',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Hook to add FAQ to an event
 */
export function useAddEventFaq() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({
      eventId,
      data,
    }: {
      eventId: string
      data: CreateEventFaqRequest
    }) => addEventFaq(eventId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: eventsQueryKeys.detail(variables.eventId),
      })
      toast({
        title: 'FAQ added',
        description: 'The FAQ has been added successfully.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to add FAQ',
        description: error?.message || 'An error occurred.',
        variant: 'destructive',
      })
    },
  })
}
