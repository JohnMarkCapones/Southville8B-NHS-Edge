/**
 * ========================================
 * EVENTS API TYPES
 * ========================================
 * TypeScript type definitions for the Events backend API.
 * 
 * Backend Source: core-api-layer/.../src/events/
 * Base URL: http://localhost:3004/api/v1/events
 * 
 * These types match the backend DTOs and entities exactly.
 */

// ========================================
// ENUMS
// ========================================

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum EventVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

// ========================================
// CORE EVENT TYPES
// ========================================

export interface EventTag {
  id: string;
  name: string;
  color?: string;
}

export interface EventAdditionalInfo {
  id: string;
  title: string;
  content: string;
  orderIndex: number;
  createdAt: string;
}

export interface EventHighlight {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  orderIndex: number;
  createdAt: string;
}

export interface EventSchedule {
  id: string;
  activityTime: string;
  activityDescription: string;
  orderIndex: number;
  createdAt: string;
}

export interface EventFaq {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
}

export interface EventOrganizer {
  id: string;
  fullName: string;
  email: string;
  role?: string;
}

export interface Event {
  id: string;
  title: string;
  slug?: string; // Optional slug field for URL-friendly identifiers
  description: string;
  date: string;
  time: string;
  location: string;
  organizerId: string;
  eventImage?: string;
  status: EventStatus;
  visibility: EventVisibility;
  is_featured?: boolean; // Featured event flag
  createdAt: string;
  updatedAt: string;
  deletedAt?: string; // Soft delete timestamp
  deletedBy?: string; // UUID of user who archived the event

  // Relations
  organizer?: EventOrganizer;
  tags?: EventTag[];
  additionalInfo?: EventAdditionalInfo[];
  highlights?: EventHighlight[];
  schedule?: EventSchedule[];
  faq?: EventFaq[];
}

// ========================================
// REQUEST/RESPONSE TYPES
// ========================================

export interface EventListResponse {
  data: Event[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number; // Changed from totalPages to match API response
  };
}

export interface EventResponse {
  data: Event;
}

export interface EventQueryParams {
  page?: number;
  limit?: number;
  status?: EventStatus;
  visibility?: EventVisibility;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  organizerId?: string;
  tagId?: string;
  search?: string;
}

// ========================================
// CREATE/UPDATE DTOs
// ========================================

export interface CreateEventAdditionalInfoRequest {
  title: string;
  content: string;
  orderIndex?: number;
}

export interface CreateEventHighlightRequest {
  title: string;
  content: string;
  imageUrl?: string;
  orderIndex?: number;
}

export interface CreateEventScheduleRequest {
  activityTime: string; // HH:MM format
  activityDescription: string;
  orderIndex?: number;
}

export interface CreateEventFaqRequest {
  question: string;
  answer: string;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  location: string;
  organizerId: string;
  eventImage?: string;
  status: EventStatus;
  visibility: EventVisibility;
  tagIds?: string[];
  additionalInfo?: CreateEventAdditionalInfoRequest[];
  highlights?: CreateEventHighlightRequest[];
  schedule?: CreateEventScheduleRequest[];
  faq?: CreateEventFaqRequest[];
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  date?: string;
  time?: string;
  location?: string;
  eventImage?: string;
  status?: EventStatus;
  visibility?: EventVisibility;
  tagIds?: string[];
}

export interface UpdateEventAdditionalInfoRequest {
  title?: string;
  content?: string;
  orderIndex?: number;
}

export interface UpdateEventHighlightRequest {
  title?: string;
  content?: string;
  imageUrl?: string;
  orderIndex?: number;
}

export interface UpdateEventScheduleRequest {
  activityTime?: string;
  activityDescription?: string;
  orderIndex?: number;
}

export interface UpdateEventFaqRequest {
  question?: string;
  answer?: string;
}

export interface ReorderEventItemsRequest {
  itemIds: string[];
}

// ========================================
// DELETE RESPONSE
// ========================================

export interface DeleteResponse {
  message: string;
  success: boolean;
}

// ========================================
// HELPER TYPES
// ========================================

export interface EventFilters {
  page?: number;
  limit?: number;
  status?: EventStatus;
  visibility?: EventVisibility;
  startDate?: string;
  endDate?: string;
  organizerId?: string;
  tagId?: string;
  search?: string;
}

export interface EventStats {
  total: number;
  published: number;
  draft: number;
  cancelled: number;
  completed: number;
  upcoming: number;
}

// ========================================
// UTILITY TYPES
// ========================================

export type EventWithRelations = Event & {
  organizer: EventOrganizer;
  tags: EventTag[];
  additionalInfo: EventAdditionalInfo[];
  highlights: EventHighlight[];
  schedule: EventSchedule[];
  faq: EventFaq[];
};

export type EventSummary = Pick<Event, 
  'id' | 'title' | 'date' | 'time' | 'location' | 'status' | 'visibility' | 'eventImage'
> & {
  organizer?: Pick<EventOrganizer, 'fullName'>;
  tags?: Pick<EventTag, 'id' | 'name'>[];
};

// ========================================
// FORM TYPES (for UI components)
// ========================================

export interface EventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  eventImage?: string;
  status: EventStatus;
  visibility: EventVisibility;
  tagIds: string[];
  additionalInfo: CreateEventAdditionalInfoRequest[];
  highlights: CreateEventHighlightRequest[];
  schedule: CreateEventScheduleRequest[];
  faq: CreateEventFaqRequest[];
}

export interface EventRegistrationData {
  eventId: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone?: string;
  notes?: string;
  guestCount?: number;
}

// ========================================
// SEARCH AND FILTER TYPES
// ========================================

export interface EventSearchFilters {
  query?: string;
  category?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  location?: string;
  organizer?: string;
  tags?: string[];
  status?: EventStatus[];
  visibility?: EventVisibility[];
}

export interface EventSearchResult {
  events: EventSummary[];
  total: number;
  filters: EventSearchFilters;
  suggestions?: string[];
}
