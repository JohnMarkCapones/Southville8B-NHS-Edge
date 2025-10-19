/**
 * ========================================
 * ANNOUNCEMENTS API ENDPOINTS
 * ========================================
 * API client functions for interacting with the Announcements backend.
 * 
 * Backend Source: core-api-layer/.../src/announcements/announcements.controller.ts
 * Base URL: http://localhost:3004/api/v1/announcements
 * 
 * Authentication: All endpoints require JWT token (except public announcements)
 * Permissions:
 * - GET endpoints: All authenticated users (Admin, Teacher, Student)
 * - POST: Admin, Teacher only
 * - PATCH: Admin, Teacher (owner) only
 * - DELETE: Admin only
 */

import { apiClient } from '../client';
import type {
  Announcement,
  AnnouncementListResponse,
  AnnouncementResponse,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
  AnnouncementQueryParams,
  MyAnnouncementsQueryParams,
  Tag,
  TagListResponse,
  CreateTagRequest,
  UpdateTagRequest,
  DeleteResponse,
} from '../types/announcements';

// ========================================
// ANNOUNCEMENT CRUD OPERATIONS
// ========================================

/**
 * Get all announcements with pagination and filtering
 * 
 * @param params - Query parameters for filtering and pagination
 * @returns Paginated list of announcements
 * 
 * @example
 * ```ts
 * const announcements = await getAnnouncements({
 *   page: 1,
 *   limit: 10,
 *   visibility: 'public',
 *   includeExpired: false
 * });
 * ```
 */
export async function getAnnouncements(
  params?: AnnouncementQueryParams
): Promise<AnnouncementListResponse> {
  // Build query string from params
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.visibility) queryParams.append('visibility', params.visibility);
  if (params?.type) queryParams.append('type', params.type);
  if (params?.roleId) queryParams.append('roleId', params.roleId);
  if (params?.includeExpired !== undefined) {
    queryParams.append('includeExpired', params.includeExpired.toString());
  }

  const queryString = queryParams.toString();
  const endpoint = `/announcements${queryString ? `?${queryString}` : ''}`;

  return apiClient.get<AnnouncementListResponse>(endpoint);
}

/**
 * Get announcements targeted to current user's role
 * 
 * This endpoint returns announcements specifically relevant to the
 * authenticated user based on their role (Student, Teacher, Admin).
 * 
 * @param params - Query parameters for pagination
 * @returns Paginated list of user-specific announcements
 * 
 * @example
 * ```ts
 * const myAnnouncements = await getMyAnnouncements({
 *   page: 1,
 *   limit: 10,
 *   includeExpired: false
 * });
 * ```
 */
export async function getMyAnnouncements(
  params?: MyAnnouncementsQueryParams
): Promise<AnnouncementListResponse> {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.includeExpired !== undefined) {
    queryParams.append('includeExpired', params.includeExpired.toString());
  }

  const queryString = queryParams.toString();
  const endpoint = `/announcements/my-announcements${queryString ? `?${queryString}` : ''}`;

  return apiClient.get<AnnouncementListResponse>(endpoint);
}

/**
 * Get a single announcement by ID
 * 
 * @param id - Announcement UUID
 * @returns Single announcement with full details
 * 
 * @example
 * ```ts
 * const announcement = await getAnnouncementById('announcement-uuid-123');
 * ```
 */
export async function getAnnouncementById(id: string): Promise<AnnouncementResponse> {
  return apiClient.get<AnnouncementResponse>(`/announcements/${id}`);
}

/**
 * Create a new announcement
 * 
 * **Permissions**: Admin, Teacher only
 * 
 * @param data - Announcement creation data
 * @returns Newly created announcement
 * 
 * @example
 * ```ts
 * const newAnnouncement = await createAnnouncement({
 *   title: 'School Assembly Tomorrow',
 *   content: '<p>All students must attend...</p>',
 *   visibility: 'public',
 *   targetRoleIds: ['student-role-uuid'],
 *   type: 'event'
 * });
 * ```
 */
export async function createAnnouncement(
  data: CreateAnnouncementRequest
): Promise<AnnouncementResponse> {
  return apiClient.post<AnnouncementResponse>('/announcements', data);
}

/**
 * Update an existing announcement
 * 
 * **Permissions**: Admin (all), Teacher (own only)
 * 
 * @param id - Announcement UUID
 * @param data - Partial announcement data to update
 * @returns Updated announcement
 * 
 * @example
 * ```ts
 * const updated = await updateAnnouncement('announcement-uuid-123', {
 *   title: 'Updated Title',
 *   expiresAt: '2025-12-31T23:59:59Z'
 * });
 * ```
 */
export async function updateAnnouncement(
  id: string,
  data: UpdateAnnouncementRequest
): Promise<AnnouncementResponse> {
  return apiClient.patch<AnnouncementResponse>(`/announcements/${id}`, data);
}

/**
 * Delete an announcement
 * 
 * **Permissions**: Admin only
 * 
 * @param id - Announcement UUID
 * @returns Success message
 * 
 * @example
 * ```ts
 * const result = await deleteAnnouncement('announcement-uuid-123');
 * console.log(result.message); // "Announcement deleted successfully"
 * ```
 */
export async function deleteAnnouncement(id: string): Promise<DeleteResponse> {
  return apiClient.delete<DeleteResponse>(`/announcements/${id}`);
}

// ========================================
// TAG MANAGEMENT OPERATIONS
// ========================================

/**
 * Get all available tags
 * 
 * Tags are used to categorize announcements for better organization.
 * 
 * @returns List of all tags
 * 
 * @example
 * ```ts
 * const tags = await getTags();
 * console.log(tags); // [{ id: '...', name: 'Academic', color: '#3B82F6' }, ...]
 * ```
 */
export async function getTags(): Promise<TagListResponse> {
  return apiClient.get<TagListResponse>('/announcements/tags');
}

/**
 * Create a new tag
 * 
 * **Permissions**: Admin only
 * 
 * @param data - Tag creation data
 * @returns Newly created tag
 * 
 * @example
 * ```ts
 * const newTag = await createTag({
 *   name: 'Important',
 *   color: '#EF4444'
 * });
 * ```
 */
export async function createTag(data: CreateTagRequest): Promise<Tag> {
  return apiClient.post<Tag>('/announcements/tags', data);
}

/**
 * Update an existing tag
 * 
 * **Permissions**: Admin only
 * 
 * @param id - Tag UUID
 * @param data - Partial tag data to update
 * @returns Updated tag
 * 
 * @example
 * ```ts
 * const updated = await updateTag('tag-uuid-123', {
 *   color: '#10B981'
 * });
 * ```
 */
export async function updateTag(id: string, data: UpdateTagRequest): Promise<Tag> {
  return apiClient.patch<Tag>(`/announcements/tags/${id}`, data);
}

/**
 * Delete a tag
 * 
 * **Permissions**: Admin only
 * 
 * @param id - Tag UUID
 * @returns Success message
 * 
 * @example
 * ```ts
 * const result = await deleteTag('tag-uuid-123');
 * console.log(result.message); // "Tag deleted successfully"
 * ```
 */
export async function deleteTag(id: string): Promise<DeleteResponse> {
  return apiClient.delete<DeleteResponse>(`/announcements/tags/${id}`);
}

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Check if an announcement has expired
 * 
 * @param announcement - Announcement object
 * @returns true if expired, false otherwise
 * 
 * @example
 * ```ts
 * const isExpired = isAnnouncementExpired(announcement);
 * if (isExpired) {
 *   console.log('This announcement is no longer active');
 * }
 * ```
 */
export function isAnnouncementExpired(announcement: Announcement): boolean {
  if (!announcement.expiresAt) return false;
  return new Date(announcement.expiresAt) < new Date();
}

/**
 * Get days until announcement expires
 * 
 * @param announcement - Announcement object
 * @returns Number of days until expiry, or null if no expiration
 * 
 * @example
 * ```ts
 * const daysLeft = getDaysUntilExpiry(announcement);
 * if (daysLeft !== null && daysLeft < 7) {
 *   console.log(`Expires in ${daysLeft} days`);
 * }
 * ```
 */
export function getDaysUntilExpiry(announcement: Announcement): number | null {
  if (!announcement.expiresAt) return null;
  
  const expiryDate = new Date(announcement.expiresAt);
  const now = new Date();
  const diffTime = expiryDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
}

