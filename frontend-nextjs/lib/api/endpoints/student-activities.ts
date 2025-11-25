/**
 * Student Activities API Endpoints
 *
 * Provides typed API functions for student activity timeline operations.
 * Tracks quiz submissions, club joins, achievements, and more.
 *
 * @module lib/api/endpoints/student-activities
 */

'use client';

import { apiClient } from '../client';

/**
 * Activity types matching backend enum
 */
export enum ActivityType {
  // Club Activities
  CLUB_JOINED = 'club_joined',
  CLUB_LEFT = 'club_left',
  CLUB_POSITION_CHANGED = 'club_position_changed',
  CLUB_EVENT_CREATED = 'club_event_created',
  CLUB_ANNOUNCEMENT_POSTED = 'club_announcement_posted',
  CLUB_MEMBER_ADDED = 'club_member_added',

  // Module Activities
  MODULE_RECEIVED = 'module_received',
  MODULE_UPLOADED_BY_TEACHER = 'module_uploaded_by_teacher',

  // General Activities
  OTHER = 'other',
}

/**
 * Student activity entity
 */
export interface StudentActivity {
  id: string;
  studentUserId: string;
  activityType: ActivityType;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  relatedEntityId?: string;
  relatedEntityType?: string;
  icon?: string;
  color?: string;
  isHighlighted: boolean;
  isVisible: boolean;
  activityTimestamp: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Paginated activities response
 */
export interface PaginatedActivitiesResponse {
  data: StudentActivity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Activity statistics
 */
export interface ActivityStatistics {
  totalActivities: number;
  activitiesByType: Record<string, number>;
  recentActivityCount: number;
  highlightedCount: number;
}

/**
 * Filters for fetching student activities
 */
export interface StudentActivityFilters {
  activityTypes?: ActivityType[];
  relatedEntityType?: string;
  highlightedOnly?: boolean;
  visibleOnly?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

/**
 * Fetch student activities for the current authenticated student
 *
 * @param filters - Query filters for activities
 * @returns Promise with paginated activities
 *
 * @example
 * ```typescript
 * const activities = await getMyActivities({ limit: 20, page: 1 });
 * ```
 */
export async function getMyActivities(
  filters?: StudentActivityFilters
): Promise<PaginatedActivitiesResponse> {
  const params = new URLSearchParams();

  if (filters?.activityTypes && filters.activityTypes.length > 0) {
    filters.activityTypes.forEach((type) => params.append('activityTypes', type));
  }
  if (filters?.relatedEntityType) params.append('relatedEntityType', filters.relatedEntityType);
  if (filters?.highlightedOnly !== undefined) params.append('highlightedOnly', filters.highlightedOnly.toString());
  if (filters?.visibleOnly !== undefined) params.append('visibleOnly', filters.visibleOnly.toString());
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());

  const endpoint = `/student-activities/my-activities${params.toString() ? `?${params.toString()}` : ''}`;

  return apiClient.get<PaginatedActivitiesResponse>(endpoint);
}

/**
 * Fetch activity statistics for the current student
 *
 * @returns Promise with activity statistics
 *
 * @example
 * ```typescript
 * const stats = await getMyActivityStatistics();
 * console.log(`Total activities: ${stats.totalActivities}`);
 * ```
 */
export async function getMyActivityStatistics(): Promise<ActivityStatistics> {
  return apiClient.get<ActivityStatistics>('/student-activities/my-activities/statistics');
}

/**
 * Update visibility of a specific activity
 *
 * @param activityId - Activity ID
 * @param isVisible - New visibility state
 * @returns Promise with updated activity
 *
 * @example
 * ```typescript
 * await updateActivityVisibility('activity-id', false); // Hide activity
 * ```
 */
export async function updateActivityVisibility(
  activityId: string,
  isVisible: boolean
): Promise<StudentActivity> {
  return apiClient.patch<StudentActivity>(
    `/student-activities/${activityId}/visibility`,
    { isVisible }
  );
}

/**
 * Get a single activity by ID
 *
 * @param activityId - Activity ID
 * @returns Promise with activity data
 */
export async function getActivityById(activityId: string): Promise<StudentActivity> {
  return apiClient.get<StudentActivity>(`/student-activities/${activityId}`);
}

/**
 * Get recent activities (last 7 days) for quick access
 *
 * @returns Promise with recent activities
 *
 * @example
 * ```typescript
 * const recent = await getRecentActivities();
 * ```
 */
export async function getRecentActivities(): Promise<PaginatedActivitiesResponse> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return getMyActivities({
    startDate: sevenDaysAgo.toISOString(),
    limit: 10,
    page: 1,
  });
}

/**
 * Get highlighted activities (important activities)
 *
 * @returns Promise with highlighted activities
 *
 * @example
 * ```typescript
 * const important = await getHighlightedActivities();
 * ```
 */
export async function getHighlightedActivities(): Promise<PaginatedActivitiesResponse> {
  return getMyActivities({
    highlightedOnly: true,
    limit: 20,
    page: 1,
  });
}
