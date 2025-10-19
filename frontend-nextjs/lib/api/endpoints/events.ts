/**
 * ========================================
 * EVENTS API ENDPOINTS
 * ========================================
 * API client functions for interacting with the Events backend.
 * 
 * Backend Source: core-api-layer/.../src/events/events.controller.ts
 * Base URL: http://localhost:3004/api/v1/events
 * 
 * Authentication: Most endpoints require JWT token
 * Permissions:
 * - GET endpoints: All authenticated users (some public)
 * - POST: Admin, Teacher only
 * - PATCH: Admin, Teacher (owner) only
 * - DELETE: Admin only
 */

import { apiClient } from '../client';
import type {
  Event,
  EventListResponse,
  EventResponse,
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
  ReorderEventItemsRequest,
  DeleteResponse,
  EventAdditionalInfo,
  EventHighlight,
  EventSchedule,
  EventFaq,
  EventStats,
} from '../types/events';
import { EventStatus } from '../types/events';

// ========================================
// MAIN EVENT CRUD OPERATIONS
// ========================================

/**
 * Get all events with pagination and filtering
 * 
 * @param params - Query parameters for filtering and pagination
 * @returns Paginated list of events
 * 
 * @example
 * ```ts
 * const events = await getEvents({
 *   page: 1,
 *   limit: 10,
 *   status: 'published',
 *   visibility: 'public',
 *   startDate: '2024-01-01',
 *   endDate: '2024-12-31'
 * });
 * ```
 */
export async function getEvents(
  params?: EventQueryParams
): Promise<EventListResponse> {
  // Build query string from params
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.status) queryParams.append('status', params.status);
  if (params?.visibility) queryParams.append('visibility', params.visibility);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.organizerId) queryParams.append('organizerId', params.organizerId);
  if (params?.tagId) queryParams.append('tagId', params.tagId);
  if (params?.search) queryParams.append('search', params.search);

  const queryString = queryParams.toString();
  const endpoint = `/events${queryString ? `?${queryString}` : ''}`;

  return apiClient.get<EventListResponse>(endpoint, { requiresAuth: false });
}

/**
 * Get upcoming events (no authentication required)
 * 
 * @returns List of upcoming published events
 * 
 * @example
 * ```ts
 * const upcomingEvents = await getUpcomingEvents();
 * ```
 */
export async function getUpcomingEvents(): Promise<Event[]> {
  return apiClient.get<Event[]>('/events/upcoming', {
    requiresAuth: false, // Public endpoint
  });
}

/**
 * Get events by organizer
 * 
 * @param organizerId - Organizer user ID
 * @param params - Pagination parameters
 * @returns Paginated list of organizer's events
 * 
 * @example
 * ```ts
 * const organizerEvents = await getEventsByOrganizer('user-uuid-123', {
 *   page: 1,
 *   limit: 10
 * });
 * ```
 */
export async function getEventsByOrganizer(
  organizerId: string,
  params?: { page?: number; limit?: number }
): Promise<EventListResponse> {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const queryString = queryParams.toString();
  const endpoint = `/events/organizer/${organizerId}${queryString ? `?${queryString}` : ''}`;

  return apiClient.get<EventListResponse>(endpoint);
}

/**
 * Get a single event by ID
 * 
 * @param id - Event UUID
 * @returns Single event with full details
 * 
 * @example
 * ```ts
 * const event = await getEventById('event-uuid-123');
 * ```
 */
export async function getEventById(id: string): Promise<Event> {
  return apiClient.get<Event>(`/events/${id}`);
}

/**
 * Get event by slug (helper function for frontend routing)
 * 
 * @param slug - Event slug
 * @returns Event or null if not found
 * 
 * @example
 * ```ts
 * const event = await getEventBySlug('spring-musical-hamilton');
 * ```
 */
export async function getEventBySlug(slug: string): Promise<Event | null> {
  try {
    // Try to get from upcoming events first (public endpoint)
    const upcomingResult = await getUpcomingEvents();

    // Collect all upcoming events that match the slug and pick the one with most related content
    const matchingUpcoming = upcomingResult.data.filter(ev => {
      const generatedSlug = (ev.slug || ev.title)
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      return generatedSlug === slug;
    });

    const scoreEvent = (ev: Event) =>
      (ev.highlights?.length || 0) +
      (ev.schedule?.length || 0) +
      (ev.faq?.length || 0) +
      (ev.additionalInfo?.length || 0);

    let event = matchingUpcoming.sort((a, b) => scoreEvent(b) - scoreEvent(a))[0];
    
    // If not found in upcoming events, try to get from all events (requires auth)
    if (!event) {
      try {
        const eventsResult = await getEvents({ 
          status: EventStatus.PUBLISHED,
          limit: 100 // Get more events to search through
        });
        // Among all published events, filter by slug and pick the richest one
        const matchingAll = eventsResult.data.filter(ev => {
          const generatedSlug = (ev.slug || ev.title)
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
          return generatedSlug === slug;
        });

        event = matchingAll.sort((a, b) => scoreEvent(b) - scoreEvent(a))[0];
      } catch (authError) {
        console.log('Auth required for full events list, using upcoming events only');
      }
    }
    
    return event || null;
  } catch (error) {
    console.error('Error fetching event by slug:', error);
    return null;
  }
}

/**
 * Create a new event
 * 
 * **Permissions**: Admin, Teacher only
 * 
 * @param data - Event creation data
 * @returns Newly created event
 * 
 * @example
 * ```ts
 * const newEvent = await createEvent({
 *   title: 'Spring Musical: Hamilton',
 *   description: 'Join us for an unforgettable evening...',
 *   date: '2024-04-20',
 *   time: '19:00',
 *   location: 'Main Auditorium',
 *   organizerId: 'user-uuid-123',
 *   status: 'published',
 *   visibility: 'public'
 * });
 * ```
 */
export async function createEvent(
  data: CreateEventRequest
): Promise<Event> {
  return apiClient.post<Event>('/events', data);
}

/**
 * Update an existing event
 * 
 * **Permissions**: Admin (all), Teacher (own only)
 * 
 * @param id - Event UUID
 * @param data - Partial event data to update
 * @returns Updated event
 * 
 * @example
 * ```ts
 * const updated = await updateEvent('event-uuid-123', {
 *   title: 'Updated Event Title',
 *   status: 'published'
 * });
 * ```
 */
export async function updateEvent(
  id: string,
  data: UpdateEventRequest
): Promise<Event> {
  return apiClient.patch<Event>(`/events/${id}`, data);
}

/**
 * Delete an event
 * 
 * **Permissions**: Admin only
 * 
 * @param id - Event UUID
 * @returns Success message
 * 
 * @example
 * ```ts
 * const result = await deleteEvent('event-uuid-123');
 * console.log(result.message); // "Event deleted successfully"
 * ```
 */
export async function deleteEvent(id: string): Promise<DeleteResponse> {
  return apiClient.delete<DeleteResponse>(`/events/${id}`);
}

// ========================================
// ADDITIONAL INFO OPERATIONS
// ========================================

/**
 * Add additional info to an event
 * 
 * **Permissions**: Admin, Teacher only
 * 
 * @param eventId - Event UUID
 * @param data - Additional info data
 * @returns Created additional info
 * 
 * @example
 * ```ts
 * const info = await addEventAdditionalInfo('event-uuid-123', {
 *   title: 'Parking Information',
 *   content: 'Free parking is available in the main lot...',
 *   orderIndex: 0
 * });
 * ```
 */
export async function addEventAdditionalInfo(
  eventId: string,
  data: CreateEventAdditionalInfoRequest
): Promise<EventAdditionalInfo> {
  return apiClient.post<EventAdditionalInfo>(`/events/${eventId}/additional-info`, data);
}

/**
 * Update additional info
 * 
 * **Permissions**: Admin, Teacher only
 * 
 * @param eventId - Event UUID
 * @param infoId - Additional info UUID
 * @param data - Updated info data
 * @returns Updated additional info
 * 
 * @example
 * ```ts
 * const updated = await updateEventAdditionalInfo('event-uuid-123', 'info-uuid-456', {
 *   content: 'Updated parking information...'
 * });
 * ```
 */
export async function updateEventAdditionalInfo(
  eventId: string,
  infoId: string,
  data: UpdateEventAdditionalInfoRequest
): Promise<EventAdditionalInfo> {
  return apiClient.patch<EventAdditionalInfo>(`/events/${eventId}/additional-info/${infoId}`, data);
}

/**
 * Remove additional info
 * 
 * **Permissions**: Admin, Teacher only
 * 
 * @param eventId - Event UUID
 * @param infoId - Additional info UUID
 * @returns Success message
 * 
 * @example
 * ```ts
 * const result = await removeEventAdditionalInfo('event-uuid-123', 'info-uuid-456');
 * ```
 */
export async function removeEventAdditionalInfo(
  eventId: string,
  infoId: string
): Promise<DeleteResponse> {
  return apiClient.delete<DeleteResponse>(`/events/${eventId}/additional-info/${infoId}`);
}

// ========================================
// HIGHLIGHTS OPERATIONS
// ========================================

/**
 * Add highlight to an event
 * 
 * **Permissions**: Admin, Teacher only
 * 
 * @param eventId - Event UUID
 * @param data - Highlight data
 * @returns Created highlight
 * 
 * @example
 * ```ts
 * const highlight = await addEventHighlight('event-uuid-123', {
 *   title: 'Key Speaker',
 *   content: 'Dr. Smith will present on...',
 *   imageUrl: 'https://example.com/speaker.jpg',
 *   orderIndex: 0
 * });
 * ```
 */
export async function addEventHighlight(
  eventId: string,
  data: CreateEventHighlightRequest
): Promise<EventHighlight> {
  return apiClient.post<EventHighlight>(`/events/${eventId}/highlights`, data);
}

/**
 * Update highlight
 * 
 * **Permissions**: Admin, Teacher only
 * 
 * @param eventId - Event UUID
 * @param highlightId - Highlight UUID
 * @param data - Updated highlight data
 * @returns Updated highlight
 * 
 * @example
 * ```ts
 * const updated = await updateEventHighlight('event-uuid-123', 'highlight-uuid-456', {
 *   content: 'Updated speaker information...'
 * });
 * ```
 */
export async function updateEventHighlight(
  eventId: string,
  highlightId: string,
  data: UpdateEventHighlightRequest
): Promise<EventHighlight> {
  return apiClient.patch<EventHighlight>(`/events/${eventId}/highlights/${highlightId}`, data);
}

/**
 * Remove highlight
 * 
 * **Permissions**: Admin, Teacher only
 * 
 * @param eventId - Event UUID
 * @param highlightId - Highlight UUID
 * @returns Success message
 * 
 * @example
 * ```ts
 * const result = await removeEventHighlight('event-uuid-123', 'highlight-uuid-456');
 * ```
 */
export async function removeEventHighlight(
  eventId: string,
  highlightId: string
): Promise<DeleteResponse> {
  return apiClient.delete<DeleteResponse>(`/events/${eventId}/highlights/${highlightId}`);
}

// ========================================
// SCHEDULE OPERATIONS
// ========================================

/**
 * Add schedule item to an event
 * 
 * **Permissions**: Admin, Teacher only
 * 
 * @param eventId - Event UUID
 * @param data - Schedule item data
 * @returns Created schedule item
 * 
 * @example
 * ```ts
 * const scheduleItem = await addEventScheduleItem('event-uuid-123', {
 *   activityTime: '09:00',
 *   activityDescription: 'Registration and welcome',
 *   orderIndex: 0
 * });
 * ```
 */
export async function addEventScheduleItem(
  eventId: string,
  data: CreateEventScheduleRequest
): Promise<EventSchedule> {
  return apiClient.post<EventSchedule>(`/events/${eventId}/schedule`, data);
}

/**
 * Update schedule item
 * 
 * **Permissions**: Admin, Teacher only
 * 
 * @param eventId - Event UUID
 * @param scheduleId - Schedule item UUID
 * @param data - Updated schedule data
 * @returns Updated schedule item
 * 
 * @example
 * ```ts
 * const updated = await updateEventScheduleItem('event-uuid-123', 'schedule-uuid-456', {
 *   activityTime: '09:30',
 *   activityDescription: 'Updated registration time'
 * });
 * ```
 */
export async function updateEventScheduleItem(
  eventId: string,
  scheduleId: string,
  data: UpdateEventScheduleRequest
): Promise<EventSchedule> {
  return apiClient.patch<EventSchedule>(`/events/${eventId}/schedule/${scheduleId}`, data);
}

/**
 * Remove schedule item
 * 
 * **Permissions**: Admin, Teacher only
 * 
 * @param eventId - Event UUID
 * @param scheduleId - Schedule item UUID
 * @returns Success message
 * 
 * @example
 * ```ts
 * const result = await removeEventScheduleItem('event-uuid-123', 'schedule-uuid-456');
 * ```
 */
export async function removeEventScheduleItem(
  eventId: string,
  scheduleId: string
): Promise<DeleteResponse> {
  return apiClient.delete<DeleteResponse>(`/events/${eventId}/schedule/${scheduleId}`);
}

// ========================================
// FAQ OPERATIONS
// ========================================

/**
 * Add FAQ to an event
 * 
 * **Permissions**: Admin, Teacher only
 * 
 * @param eventId - Event UUID
 * @param data - FAQ data
 * @returns Created FAQ
 * 
 * @example
 * ```ts
 * const faq = await addEventFaq('event-uuid-123', {
 *   question: 'What should I bring to the event?',
 *   answer: 'Please bring your ID and confirmation email...'
 * });
 * ```
 */
export async function addEventFaq(
  eventId: string,
  data: CreateEventFaqRequest
): Promise<EventFaq> {
  return apiClient.post<EventFaq>(`/events/${eventId}/faq`, data);
}

/**
 * Update FAQ
 * 
 * **Permissions**: Admin, Teacher only
 * 
 * @param eventId - Event UUID
 * @param faqId - FAQ UUID
 * @param data - Updated FAQ data
 * @returns Updated FAQ
 * 
 * @example
 * ```ts
 * const updated = await updateEventFaq('event-uuid-123', 'faq-uuid-456', {
 *   answer: 'Updated answer with more details...'
 * });
 * ```
 */
export async function updateEventFaq(
  eventId: string,
  faqId: string,
  data: UpdateEventFaqRequest
): Promise<EventFaq> {
  return apiClient.patch<EventFaq>(`/events/${eventId}/faq/${faqId}`, data);
}

/**
 * Remove FAQ
 * 
 * **Permissions**: Admin, Teacher only
 * 
 * @param eventId - Event UUID
 * @param faqId - FAQ UUID
 * @returns Success message
 * 
 * @example
 * ```ts
 * const result = await removeEventFaq('event-uuid-123', 'faq-uuid-456');
 * ```
 */
export async function removeEventFaq(
  eventId: string,
  faqId: string
): Promise<DeleteResponse> {
  return apiClient.delete<DeleteResponse>(`/events/${eventId}/faq/${faqId}`);
}

// ========================================
// REORDER OPERATIONS
// ========================================

/**
 * Reorder event items (additional info, highlights, schedule, FAQ)
 * 
 * **Permissions**: Admin, Teacher only
 * 
 * @param eventId - Event UUID
 * @param entityType - Type of items to reorder ('additional-info', 'highlights', 'schedule', 'faq')
 * @param data - Reorder data with item IDs in new order
 * @returns Success message
 * 
 * @example
 * ```ts
 * const result = await reorderEventItems('event-uuid-123', 'schedule', {
 *   itemIds: ['schedule-1', 'schedule-3', 'schedule-2']
 * });
 * ```
 */
export async function reorderEventItems(
  eventId: string,
  entityType: 'additional-info' | 'highlights' | 'schedule' | 'faq',
  data: ReorderEventItemsRequest
): Promise<DeleteResponse> {
  return apiClient.patch<DeleteResponse>(`/events/${eventId}/reorder/${entityType}`, data);
}

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Check if an event is upcoming
 * 
 * @param event - Event object
 * @returns true if event is in the future
 * 
 * @example
 * ```ts
 * const isUpcoming = isEventUpcoming(event);
 * if (isUpcoming) {
 *   console.log('This event is coming up!');
 * }
 * ```
 */
export function isEventUpcoming(event: Event): boolean {
  const eventDate = new Date(`${event.date}T${event.time}`);
  const now = new Date();
  return eventDate > now;
}

/**
 * Check if an event is published and public
 * 
 * @param event - Event object
 * @returns true if event is visible to public
 * 
 * @example
 * ```ts
 * const isPublic = isEventPublic(event);
 * if (isPublic) {
 *   console.log('This event is visible to everyone');
 * }
 * ```
 */
export function isEventPublic(event: Event): boolean {
  return event.status === 'published' && event.visibility === 'public';
}

/**
 * Get days until event
 * 
 * @param event - Event object
 * @returns Number of days until event, or null if event is in the past
 * 
 * @example
 * ```ts
 * const daysLeft = getDaysUntilEvent(event);
 * if (daysLeft !== null && daysLeft < 7) {
 *   console.log(`Event is in ${daysLeft} days!`);
 * }
 * ```
 */
export function getDaysUntilEvent(event: Event): number | null {
  const eventDate = new Date(`${event.date}T${event.time}`);
  const now = new Date();
  const diffTime = eventDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : null;
}

/**
 * Format event date and time for display
 * 
 * @param event - Event object
 * @returns Formatted date and time string
 * 
 * @example
 * ```ts
 * const formatted = formatEventDateTime(event);
 * console.log(formatted); // "April 20, 2024 at 7:00 PM"
 * ```
 */
export function formatEventDateTime(event: Event): string {
  const eventDate = new Date(`${event.date}T${event.time}`);
  
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };
  
  const dateStr = eventDate.toLocaleDateString('en-US', dateOptions);
  const timeStr = eventDate.toLocaleTimeString('en-US', timeOptions);
  
  return `${dateStr} at ${timeStr}`;
}
