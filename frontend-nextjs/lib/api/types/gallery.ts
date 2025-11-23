/**
 * ========================================
 * GALLERY API TYPES
 * ========================================
 * TypeScript type definitions for the Gallery backend API.
 *
 * Backend Source: core-api-layer/.../src/gallery/
 * Base URL: http://localhost:3004/api/v1/gallery
 *
 * These types match the backend DTOs and entities exactly.
 */

// ========================================
// ENUMS
// ========================================

export enum GalleryMediaType {
  IMAGE = 'image',
  VIDEO = 'video',
}

export enum GallerySortBy {
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
  TITLE = 'title',
  TAKEN_AT = 'taken_at',
  DISPLAY_ORDER = 'display_order',
  VIEWS_COUNT = 'views_count',
  DOWNLOADS_COUNT = 'downloads_count',
}

export enum GallerySortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

// ========================================
// CORE TYPES
// ========================================

export interface GalleryTag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  usage_count?: number;
  created_at?: string;
}

export interface GalleryUploader {
  id: string;
  full_name: string;
  email: string;
}

export interface GalleryItem {
  id: string;

  // Cloudflare Images fields
  cf_image_id: string;
  cf_image_url: string;

  // File metadata
  original_filename: string;
  file_size_bytes: number;
  mime_type: string;
  media_type: GalleryMediaType;

  // Metadata
  title?: string;
  caption?: string;
  alt_text?: string;
  display_order: number;
  is_featured: boolean;

  // Photography info
  photographer_name?: string;
  photographer_credit?: string;
  taken_at?: string;
  location?: string;

  // Analytics
  views_count: number;
  downloads_count: number;

  // Audit
  uploaded_by: string;
  updated_by?: string;
  deleted_by?: string;
  is_deleted: boolean;
  deleted_at?: string;
  created_at: string;
  updated_at: string;

  // Relations (optional)
  uploader?: GalleryUploader;
  tags?: GalleryTag[];
}

// ========================================
// REQUEST/RESPONSE TYPES
// ========================================

export interface GalleryItemsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  media_type?: GalleryMediaType;
  is_featured?: boolean;
  tag_id?: string;
  sortBy?: GallerySortBy;
  sortOrder?: GallerySortOrder;
  includeDeleted?: boolean; // Admin only
}

export interface GalleryItemsResponse {
  items: GalleryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GalleryDownloadResponse {
  downloadUrl: string;
  expiresAt: string;
}

// ========================================
// CREATE/UPDATE DTOs
// ========================================

export interface CreateGalleryItemRequest {
  file: File;
  title?: string;
  caption?: string;
  alt_text?: string;
  display_order?: number;
  is_featured?: boolean;
  photographer_name?: string;
  photographer_credit?: string;
  taken_at?: string;
  location?: string;
}

export interface UpdateGalleryItemRequest {
  title?: string;
  caption?: string;
  alt_text?: string;
  display_order?: number;
  is_featured?: boolean;
  photographer_name?: string;
  photographer_credit?: string;
  taken_at?: string;
  location?: string;
}

export interface CreateGalleryTagRequest {
  name: string;
  slug?: string;
  description?: string;
  color?: string;
}

export interface UpdateGalleryTagRequest {
  name?: string;
  slug?: string;
  description?: string;
  color?: string;
}

export interface AddTagsToItemRequest {
  tag_ids: string[];
}

export interface ReorderGalleryItemsRequest {
  items: Array<{ id: string; display_order: number }>;
}

// ========================================
// TAG QUERY PARAMS
// ========================================

export interface GalleryTagsQueryParams {
  sortBy?: 'name' | 'usage_count' | 'created_at';
  sortOrder?: GallerySortOrder;
}

// ========================================
// UTILITY TYPES
// ========================================

export type GalleryItemWithDetails = GalleryItem & {
  uploader: GalleryUploader;
  tags: GalleryTag[];
};

export type GalleryItemSummary = Pick<GalleryItem,
  'id' | 'cf_image_id' | 'cf_image_url' | 'title' | 'caption' | 'media_type' | 'is_featured'
> & {
  tags?: Pick<GalleryTag, 'id' | 'name' | 'color'>[];
};

// ========================================
// HELPER TYPES FOR FRONTEND
// ========================================

/**
 * Frontend category mapping
 * Maps backend tags to frontend categories
 */
export interface FrontendGalleryCategory {
  name: string;
  slug: string;
  icon: React.ReactNode;
  tagKeywords: string[]; // Keywords to match in tag names
}

export interface FrontendGalleryItem {
  id: string;
  title: string;
  category: string;
  image: string;
  thumbnail?: string;
  description: string;
  mediaType: GalleryMediaType;
  isFeatured: boolean;
  viewsCount: number;
  downloadsCount: number;
  photographer?: string;
  takenAt?: string;
  location?: string;
  tags: GalleryTag[];
}

// ========================================
// DELETE RESPONSE
// ========================================

export interface DeleteResponse {
  message: string;
  success: boolean;
}
