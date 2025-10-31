/**
 * ========================================
 * GALLERY API ENDPOINTS
 * ========================================
 * API client functions for interacting with the Gallery backend.
 *
 * Backend Source: core-api-layer/.../src/gallery/gallery.controller.ts
 * Base URL: http://localhost:3004/api/v1/gallery
 *
 * Authentication: Public for read, Admin/Teacher for write
 * Permissions:
 * - GET endpoints: Public (no auth required)
 * - POST/PUT/DELETE: Admin, Teacher only
 */

import { apiClient } from '../client';
import { GalleryMediaType } from '../types/gallery';
import type {
  GalleryItem,
  GalleryTag,
  GalleryItemsQueryParams,
  GalleryItemsResponse,
  GalleryDownloadResponse,
  CreateGalleryItemRequest,
  UpdateGalleryItemRequest,
  CreateGalleryTagRequest,
  UpdateGalleryTagRequest,
  AddTagsToItemRequest,
  GalleryTagsQueryParams,
  DeleteResponse,
  FrontendGalleryItem,
} from '../types/gallery';

// ========================================
// DATA TRANSFORMATION FUNCTIONS
// ========================================

/**
 * Transform backend gallery item to frontend format
 * Maps backend snake_case to camelCase and determines category
 */
function transformBackendItemToFrontend(backendItem: GalleryItem): FrontendGalleryItem {
  // Determine category from tags
  const category = determineCategoryFromTags(backendItem.tags || []);

  return {
    id: backendItem.id,
    title: backendItem.title || backendItem.original_filename || 'Untitled',
    category,
    image: backendItem.file_url,
    thumbnail: backendItem.thumbnail_url,
    description: backendItem.caption || backendItem.alt_text || '',
    mediaType: backendItem.media_type,
    isFeatured: backendItem.is_featured,
    viewsCount: backendItem.views_count,
    downloadsCount: backendItem.downloads_count,
    photographer: backendItem.photographer_name || backendItem.photographer_credit,
    takenAt: backendItem.taken_at,
    location: backendItem.location,
    tags: backendItem.tags || [],
  };
}

/**
 * Determine frontend category from backend tags
 * Maps tag keywords to predefined categories
 */
function determineCategoryFromTags(tags: GalleryTag[]): string {
  const tagNames = tags.map(t => t.name.toLowerCase());

  // Academic category
  if (tagNames.some(t =>
    t.includes('academic') ||
    t.includes('science') ||
    t.includes('math') ||
    t.includes('research') ||
    t.includes('stem') ||
    t.includes('olympiad') ||
    t.includes('competition')
  )) {
    return 'Academic';
  }

  // Sports category
  if (tagNames.some(t =>
    t.includes('sport') ||
    t.includes('athletic') ||
    t.includes('basketball') ||
    t.includes('soccer') ||
    t.includes('football') ||
    t.includes('volleyball') ||
    t.includes('tournament') ||
    t.includes('championship')
  )) {
    return 'Sports';
  }

  // Arts category
  if (tagNames.some(t =>
    t.includes('art') ||
    t.includes('music') ||
    t.includes('drama') ||
    t.includes('theater') ||
    t.includes('performance') ||
    t.includes('exhibition') ||
    t.includes('gallery') ||
    t.includes('painting') ||
    t.includes('drawing')
  )) {
    return 'Arts';
  }

  // Events category
  if (tagNames.some(t =>
    t.includes('event') ||
    t.includes('festival') ||
    t.includes('celebration') ||
    t.includes('ceremony') ||
    t.includes('community') ||
    t.includes('service')
  )) {
    return 'Events';
  }

  // Campus Life category
  if (tagNames.some(t =>
    t.includes('campus') ||
    t.includes('student life') ||
    t.includes('daily') ||
    t.includes('facilities') ||
    t.includes('building')
  )) {
    return 'Campus Life';
  }

  // Default to Campus Life if no match
  return 'Campus Life';
}

// ========================================
// MAIN GALLERY CRUD OPERATIONS
// ========================================

/**
 * Get all gallery items with pagination and filtering
 *
 * @param params - Query parameters for filtering and pagination
 * @returns Paginated list of gallery items
 *
 * @example
 * ```ts
 * const items = await getGalleryItems({
 *   page: 1,
 *   limit: 20,
 *   media_type: GalleryMediaType.IMAGE,
 *   is_featured: true,
 *   sortBy: GallerySortBy.CREATED_AT,
 *   sortOrder: GallerySortOrder.DESC
 * });
 * ```
 */
export async function getGalleryItems(
  params?: GalleryItemsQueryParams
): Promise<GalleryItemsResponse> {
  // Build query string from params
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.media_type) queryParams.append('media_type', params.media_type);
  if (params?.is_featured !== undefined) queryParams.append('is_featured', params.is_featured.toString());
  if (params?.tag_id) queryParams.append('tag_id', params.tag_id);
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  if (params?.includeDeleted !== undefined) queryParams.append('includeDeleted', params.includeDeleted.toString());

  const queryString = queryParams.toString();
  const endpoint = `/gallery${queryString ? `?${queryString}` : ''}`;

  const response = await apiClient.get<GalleryItemsResponse>(endpoint, {
    requiresAuth: false, // Public endpoint
  });

  return response;
}

/**
 * Get featured gallery items (for homepage)
 *
 * @param limit - Maximum number of items to return (default: 10)
 * @returns Array of featured gallery items
 *
 * @example
 * ```ts
 * const featuredItems = await getFeaturedGalleryItems(8);
 * ```
 */
export async function getFeaturedGalleryItems(
  limit?: number
): Promise<GalleryItem[]> {
  const queryParams = new URLSearchParams();
  if (limit) queryParams.append('limit', limit.toString());

  const queryString = queryParams.toString();
  const endpoint = `/gallery/featured${queryString ? `?${queryString}` : ''}`;

  return apiClient.get<GalleryItem[]>(endpoint, {
    requiresAuth: false, // Public endpoint
  });
}

/**
 * Get a single gallery item by ID
 *
 * @param id - Gallery item UUID
 * @returns Single gallery item with full details
 *
 * @example
 * ```ts
 * const item = await getGalleryItemById('item-uuid-123');
 * ```
 */
export async function getGalleryItemById(id: string): Promise<GalleryItem> {
  return apiClient.get<GalleryItem>(`/gallery/${id}`, {
    requiresAuth: false, // Public endpoint
  });
}

/**
 * Upload a new gallery item
 *
 * **Permissions**: Admin, Teacher only
 *
 * @param data - Gallery item creation data with file
 * @returns Newly created gallery item
 *
 * @example
 * ```ts
 * const newItem = await uploadGalleryItem({
 *   file: fileObject,
 *   title: 'Science Fair 2024',
 *   caption: 'Students showcasing innovative projects',
 *   is_featured: true
 * });
 * ```
 */
export async function uploadGalleryItem(
  data: CreateGalleryItemRequest
): Promise<GalleryItem> {
  const formData = new FormData();
  formData.append('file', data.file);

  if (data.title) formData.append('title', data.title);
  if (data.caption) formData.append('caption', data.caption);
  if (data.alt_text) formData.append('alt_text', data.alt_text);
  if (data.display_order !== undefined) formData.append('display_order', data.display_order.toString());
  if (data.is_featured !== undefined) formData.append('is_featured', data.is_featured.toString());
  if (data.photographer_name) formData.append('photographer_name', data.photographer_name);
  if (data.photographer_credit) formData.append('photographer_credit', data.photographer_credit);
  if (data.taken_at) formData.append('taken_at', data.taken_at);
  if (data.location) formData.append('location', data.location);

  return apiClient.post<GalleryItem>('/gallery', formData);
}

/**
 * Update an existing gallery item
 *
 * **Permissions**: Admin, Teacher only
 *
 * @param id - Gallery item UUID
 * @param data - Partial item data to update
 * @returns Updated gallery item
 *
 * @example
 * ```ts
 * const updated = await updateGalleryItem('item-uuid-123', {
 *   title: 'Updated Title',
 *   is_featured: true
 * });
 * ```
 */
export async function updateGalleryItem(
  id: string,
  data: UpdateGalleryItemRequest
): Promise<GalleryItem> {
  return apiClient.put<GalleryItem>(`/gallery/${id}`, data);
}

/**
 * Delete a gallery item (soft delete)
 *
 * **Permissions**: Admin, Teacher only
 *
 * @param id - Gallery item UUID
 * @returns Success message
 *
 * @example
 * ```ts
 * const result = await deleteGalleryItem('item-uuid-123');
 * ```
 */
export async function deleteGalleryItem(id: string): Promise<DeleteResponse> {
  return apiClient.delete<DeleteResponse>(`/gallery/${id}`);
}

/**
 * Restore a soft-deleted gallery item
 *
 * **Permissions**: Admin, Teacher only
 *
 * @param id - Gallery item UUID
 * @returns Success message
 *
 * @example
 * ```ts
 * const result = await restoreGalleryItem('item-uuid-123');
 * ```
 */
export async function restoreGalleryItem(id: string): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>(`/gallery/${id}/restore`, {});
}

/**
 * Generate download URL for a gallery item
 *
 * @param id - Gallery item UUID
 * @returns Download URL and expiration time
 *
 * @example
 * ```ts
 * const { downloadUrl, expiresAt } = await getGalleryItemDownloadUrl('item-uuid-123');
 * window.open(downloadUrl, '_blank');
 * ```
 */
export async function getGalleryItemDownloadUrl(
  id: string
): Promise<GalleryDownloadResponse> {
  return apiClient.post<GalleryDownloadResponse>(`/gallery/${id}/download`, {}, {
    requiresAuth: false, // Public endpoint
  });
}

// ========================================
// GALLERY TAGS OPERATIONS
// ========================================

/**
 * Get all gallery tags
 *
 * @param params - Query parameters for sorting
 * @returns Array of gallery tags
 *
 * @example
 * ```ts
 * const tags = await getGalleryTags({
 *   sortBy: 'usage_count',
 *   sortOrder: GallerySortOrder.DESC
 * });
 * ```
 */
export async function getGalleryTags(
  params?: GalleryTagsQueryParams
): Promise<GalleryTag[]> {
  const queryParams = new URLSearchParams();

  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const queryString = queryParams.toString();
  const endpoint = `/gallery/tags${queryString ? `?${queryString}` : ''}`;

  return apiClient.get<GalleryTag[]>(endpoint, {
    requiresAuth: false, // Public endpoint
  });
}

/**
 * Get a single tag by ID
 *
 * @param id - Tag UUID
 * @returns Gallery tag
 *
 * @example
 * ```ts
 * const tag = await getGalleryTagById('tag-uuid-123');
 * ```
 */
export async function getGalleryTagById(id: string): Promise<GalleryTag> {
  return apiClient.get<GalleryTag>(`/gallery/tags/${id}`, {
    requiresAuth: false, // Public endpoint
  });
}

/**
 * Get a tag by slug
 *
 * @param slug - Tag URL slug
 * @returns Gallery tag
 *
 * @example
 * ```ts
 * const tag = await getGalleryTagBySlug('science-fair');
 * ```
 */
export async function getGalleryTagBySlug(slug: string): Promise<GalleryTag> {
  return apiClient.get<GalleryTag>(`/gallery/tags/slug/${slug}`, {
    requiresAuth: false, // Public endpoint
  });
}

/**
 * Create a new gallery tag
 *
 * **Permissions**: Admin only
 *
 * @param data - Tag creation data
 * @returns Newly created tag
 *
 * @example
 * ```ts
 * const newTag = await createGalleryTag({
 *   name: 'Science Fair',
 *   description: 'Annual science fair events',
 *   color: '#3B82F6'
 * });
 * ```
 */
export async function createGalleryTag(
  data: CreateGalleryTagRequest
): Promise<GalleryTag> {
  return apiClient.post<GalleryTag>('/gallery/tags', data);
}

/**
 * Update an existing gallery tag
 *
 * **Permissions**: Admin only
 *
 * @param id - Tag UUID
 * @param data - Partial tag data to update
 * @returns Updated tag
 *
 * @example
 * ```ts
 * const updated = await updateGalleryTag('tag-uuid-123', {
 *   description: 'Updated description'
 * });
 * ```
 */
export async function updateGalleryTag(
  id: string,
  data: UpdateGalleryTagRequest
): Promise<GalleryTag> {
  return apiClient.put<GalleryTag>(`/gallery/tags/${id}`, data);
}

/**
 * Delete a gallery tag
 *
 * **Permissions**: Admin only
 *
 * @param id - Tag UUID
 * @returns Success message
 *
 * @example
 * ```ts
 * const result = await deleteGalleryTag('tag-uuid-123');
 * ```
 */
export async function deleteGalleryTag(id: string): Promise<DeleteResponse> {
  return apiClient.delete<DeleteResponse>(`/gallery/tags/${id}`);
}

/**
 * Add tags to a gallery item
 *
 * **Permissions**: Admin, Teacher only
 *
 * @param itemId - Gallery item UUID
 * @param data - Tag IDs to add
 * @returns Success (204 No Content)
 *
 * @example
 * ```ts
 * await addTagsToGalleryItem('item-uuid-123', {
 *   tag_ids: ['tag-uuid-1', 'tag-uuid-2']
 * });
 * ```
 */
export async function addTagsToGalleryItem(
  itemId: string,
  data: AddTagsToItemRequest
): Promise<void> {
  return apiClient.post<void>(`/gallery/tags/items/${itemId}/tags`, data);
}

/**
 * Remove a tag from a gallery item
 *
 * **Permissions**: Admin, Teacher only
 *
 * @param itemId - Gallery item UUID
 * @param tagId - Tag UUID to remove
 * @returns Success (204 No Content)
 *
 * @example
 * ```ts
 * await removeTagFromGalleryItem('item-uuid-123', 'tag-uuid-456');
 * ```
 */
export async function removeTagFromGalleryItem(
  itemId: string,
  tagId: string
): Promise<void> {
  return apiClient.delete<void>(`/gallery/tags/items/${itemId}/tags/${tagId}`);
}

/**
 * Get tags for a specific gallery item
 *
 * @param itemId - Gallery item UUID
 * @returns Array of tags for the item
 *
 * @example
 * ```ts
 * const tags = await getGalleryItemTags('item-uuid-123');
 * ```
 */
export async function getGalleryItemTags(itemId: string): Promise<GalleryTag[]> {
  return apiClient.get<GalleryTag[]>(`/gallery/tags/items/${itemId}/tags`, {
    requiresAuth: false, // Public endpoint
  });
}

// ========================================
// HELPER FUNCTIONS FOR FRONTEND
// ========================================

/**
 * Get gallery items for the landing page campus gallery section
 * Fetches featured items and transforms them to frontend format
 *
 * @param limit - Maximum number of items (default: 8)
 * @returns Array of frontend gallery items
 *
 * @example
 * ```ts
 * const campusGalleryItems = await getCampusGalleryItems(8);
 * ```
 */
export async function getCampusGalleryItems(
  limit: number = 8
): Promise<FrontendGalleryItem[]> {
  try {
    // Fetch gallery items (featured first, then by creation date)
    const response = await getGalleryItems({
      limit,
      sortBy: 'display_order',
      sortOrder: 'asc',
      media_type: GalleryMediaType.IMAGE, // Only images for campus gallery
    });

    // Transform backend items to frontend format
    return response.items.map(transformBackendItemToFrontend);
  } catch (error) {
    console.error('Error fetching campus gallery items:', error);
    return [];
  }
}

/**
 * Get gallery items filtered by category
 * Fetches items and filters by tag-based category
 *
 * @param category - Frontend category name ('Academic', 'Sports', etc.)
 * @param limit - Maximum number of items
 * @returns Array of frontend gallery items
 *
 * @example
 * ```ts
 * const sportsItems = await getGalleryItemsByCategory('Sports', 20);
 * ```
 */
export async function getGalleryItemsByCategory(
  category: string,
  limit: number = 20
): Promise<FrontendGalleryItem[]> {
  try {
    const response = await getGalleryItems({
      limit,
      sortBy: 'created_at',
      sortOrder: 'desc',
      media_type: GalleryMediaType.IMAGE,
    });

    const frontendItems = response.items.map(transformBackendItemToFrontend);

    // Filter by category if not 'All'
    if (category === 'All') {
      return frontendItems;
    }

    return frontendItems.filter(item => item.category === category);
  } catch (error) {
    console.error(`Error fetching gallery items for category ${category}:`, error);
    return [];
  }
}
