/**
 * ========================================
 * BANNER NOTIFICATIONS API ENDPOINTS
 * ========================================
 * API client functions for interacting with the Banner Notifications backend.
 *
 * Backend Source: core-api-layer/.../src/banner-notifications/banner-notifications.controller.ts
 * Base URL: http://localhost:3004/api/v1/banner-notifications
 *
 * Authentication: Admin only (except /active endpoint which is public)
 * Permissions:
 * - GET /active: Public (anyone can view active banners)
 * - All other endpoints: Admin only
 */

import { apiClient } from '../client';
import type {
  BannerNotification,
  BannerListResponse,
  BannerResponse,
  CreateBannerRequest,
  UpdateBannerRequest,
  BannerQueryParams,
  DeleteResponse,
} from '../types/banners';

// ========================================
// BANNER CRUD OPERATIONS
// ========================================

/**
 * Get all banners with pagination and filtering (Admin only)
 *
 * @param params - Query parameters for filtering and pagination
 * @returns Paginated list of banners
 *
 * @example
 * ```ts
 * const banners = await getBanners({
 *   page: 1,
 *   limit: 10,
 *   isActive: true
 * });
 * ```
 */
export async function getBanners(
  params?: BannerQueryParams
): Promise<BannerListResponse> {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.isActive !== undefined) {
    queryParams.append('isActive', params.isActive.toString());
  }
  if (params?.type) queryParams.append('type', params.type);

  const queryString = queryParams.toString();
  const endpoint = `/banner-notifications${queryString ? `?${queryString}` : ''}`;

  return apiClient.get<BannerListResponse>(endpoint);
}

/**
 * Get currently active banners (Public endpoint)
 *
 * This endpoint returns all banners that are:
 * - Currently active (is_active = true)
 * - Within the valid date range (now between start_date and end_date)
 *
 * @returns List of active banners
 *
 * @example
 * ```ts
 * const activeBanners = await getActiveBanners();
 * // Display these banners at the top of the page
 * ```
 */
export async function getActiveBanners(): Promise<BannerNotification[]> {
  return apiClient.get<BannerNotification[]>('/banner-notifications/active');
}

/**
 * Get a single banner by ID (Admin only)
 *
 * @param id - Banner UUID
 * @returns Single banner with full details
 *
 * @example
 * ```ts
 * const banner = await getBannerById('banner-uuid-123');
 * ```
 */
export async function getBannerById(id: string): Promise<BannerResponse> {
  return apiClient.get<BannerResponse>(`/banner-notifications/${id}`);
}

/**
 * Create a new banner (Admin only)
 *
 * @param data - Banner creation data
 * @returns Newly created banner
 *
 * @example
 * ```ts
 * const newBanner = await createBanner({
 *   message: '⚠️ Weather Alert: Early dismissal at 2:00 PM due to heavy rain.',
 *   shortMessage: 'Weather Alert: Early dismissal at 2:00 PM',
 *   type: 'warning',
 *   isActive: true,
 *   isDismissible: true,
 *   hasAction: false,
 *   startDate: '2024-01-15T08:00:00Z',
 *   endDate: '2024-01-15T18:00:00Z'
 * });
 * ```
 */
export async function createBanner(
  data: CreateBannerRequest
): Promise<BannerResponse> {
  return apiClient.post<BannerResponse>('/banner-notifications', data);
}

/**
 * Update an existing banner (Admin only)
 *
 * @param id - Banner UUID
 * @param data - Partial banner data to update
 * @returns Updated banner
 *
 * @example
 * ```ts
 * const updated = await updateBanner('banner-uuid-123', {
 *   isActive: false,
 *   endDate: '2024-01-15T14:00:00Z'
 * });
 * ```
 */
export async function updateBanner(
  id: string,
  data: UpdateBannerRequest
): Promise<BannerResponse> {
  return apiClient.patch<BannerResponse>(`/banner-notifications/${id}`, data);
}

/**
 * Toggle banner active status (Admin only)
 *
 * Convenience method to quickly activate/deactivate a banner
 * without needing to send the full update payload.
 *
 * @param id - Banner UUID
 * @returns Updated banner with toggled status
 *
 * @example
 * ```ts
 * const toggled = await toggleBannerStatus('banner-uuid-123');
 * console.log(toggled.isActive); // true if was false, false if was true
 * ```
 */
export async function toggleBannerStatus(id: string): Promise<BannerResponse> {
  return apiClient.patch<BannerResponse>(`/banner-notifications/${id}/toggle`, {});
}

/**
 * Delete a banner (Admin only)
 *
 * @param id - Banner UUID
 * @returns Success message
 *
 * @example
 * ```ts
 * const result = await deleteBanner('banner-uuid-123');
 * console.log(result.message); // "Banner deleted successfully"
 * ```
 */
export async function deleteBanner(id: string): Promise<DeleteResponse> {
  return apiClient.delete<DeleteResponse>(`/banner-notifications/${id}`);
}

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Check if a banner is currently active
 *
 * Checks both the is_active flag and date range
 *
 * @param banner - Banner object
 * @returns true if banner should be displayed, false otherwise
 *
 * @example
 * ```ts
 * const shouldShow = isBannerActive(banner);
 * if (shouldShow) {
 *   // Display banner
 * }
 * ```
 */
export function isBannerActive(banner: BannerNotification): boolean {
  if (!banner.isActive) return false;

  const now = new Date();
  const startDate = new Date(banner.startDate);
  const endDate = new Date(banner.endDate);

  return now >= startDate && now <= endDate;
}

/**
 * Get banner type variant for UI styling
 *
 * Maps backend banner types to UI component variants
 *
 * @param type - Banner type from backend
 * @returns UI variant string
 *
 * @example
 * ```ts
 * const variant = getBannerVariant(banner.type);
 * // Use variant in your Alert/Banner component
 * <Alert variant={variant}>...</Alert>
 * ```
 */
export function getBannerVariant(
  type: string
): 'default' | 'destructive' | 'success' | 'warning' {
  switch (type) {
    case 'destructive':
      return 'destructive';
    case 'success':
      return 'success';
    case 'warning':
      return 'warning';
    case 'info':
    default:
      return 'default';
  }
}

/**
 * Format banner dates for display
 *
 * @param banner - Banner object
 * @returns Formatted date range string
 *
 * @example
 * ```ts
 * const dateRange = formatBannerDateRange(banner);
 * console.log(dateRange); // "Jan 15, 8:00 AM - 6:00 PM"
 * ```
 */
export function formatBannerDateRange(banner: BannerNotification): string {
  const start = new Date(banner.startDate);
  const end = new Date(banner.endDate);

  const dateOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric'
  };
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit'
  };

  const isSameDay = start.toDateString() === end.toDateString();

  if (isSameDay) {
    return `${start.toLocaleDateString('en-US', dateOptions)}, ${start.toLocaleTimeString('en-US', timeOptions)} - ${end.toLocaleTimeString('en-US', timeOptions)}`;
  } else {
    return `${start.toLocaleDateString('en-US', dateOptions)} ${start.toLocaleTimeString('en-US', timeOptions)} - ${end.toLocaleDateString('en-US', dateOptions)} ${end.toLocaleTimeString('en-US', timeOptions)}`;
  }
}
