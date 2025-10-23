/**
 * ========================================
 * ANNOUNCEMENTS API TYPES
 * ========================================
 * TypeScript types for the Announcements API endpoints.
 * These types match the backend NestJS DTOs and entities.
 * 
 * Backend Source: core-api-layer/southville-nhs-school-portal-api-layer/src/announcements/
 */

// ========================================
// ENUMS
// ========================================

/**
 * Announcement visibility options
 * - public: Visible to all users
 * - private: Restricted visibility based on roles
 */
export enum AnnouncementVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

/**
 * Announcement categories for filtering and organization
 */
export type AnnouncementCategory = 'urgent' | 'academic' | 'event' | 'general';

// ========================================
// ENTITY TYPES (What we get from the backend)
// ========================================

/**
 * Tag entity - used for categorizing announcements
 */
export type Tag = {
  id: string;
  name: string;
  color?: string;
  created_at?: string;
  updated_at?: string;
};

/**
 * Role entity - represents user roles
 */
export type Role = {
  id: string;
  name: string;
};

/**
 * User info embedded in announcements
 */
export type AnnouncementUser = {
  id: string;
  fullName: string;
  email: string;
};

/**
 * Main Announcement entity
 * Represents the complete announcement object from the backend
 */
export type Announcement = {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  type?: string;
  visibility: AnnouncementVisibility;
  
  // Relations (populated by backend)
  user?: AnnouncementUser;
  tags?: Tag[];
  targetRoles?: Role[];
};

// ========================================
// REQUEST TYPES (What we send to the backend)
// ========================================

/**
 * DTO for creating a new announcement
 * Admin and Teacher roles only
 */
export type CreateAnnouncementRequest = {
  title: string;                     // Min: 3, Max: 255 chars
  content: string;                   // Min: 10, Max: 10,000 chars (HTML allowed)
  expiresAt?: string;               // ISO date string, must be future date (max 1 year)
  type?: string;                    // Max: 50 chars (e.g., 'event', 'urgent', 'academic')
  visibility: AnnouncementVisibility; // 'public' or 'private'
  targetRoleIds: string[];          // Array of role UUIDs (min: 1, max: 10)
  tagIds?: string[];                // Array of tag UUIDs (max: 10)
};

/**
 * DTO for updating an existing announcement
 * All fields are optional (partial update)
 */
export type UpdateAnnouncementRequest = Partial<CreateAnnouncementRequest>;

/**
 * DTO for creating a new tag
 * Admin only
 */
export type CreateTagRequest = {
  name: string;                     // Tag name
  color?: string;                   // Hex color code (e.g., '#FF5733')
};

/**
 * DTO for updating a tag
 * Admin only
 */
export type UpdateTagRequest = Partial<CreateTagRequest>;

// ========================================
// RESPONSE TYPES (What we get from the backend)
// ========================================

/**
 * Paginated response for announcements list
 */
export type AnnouncementListResponse = {
  data: Announcement[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

/**
 * Single announcement response
 */
export type AnnouncementResponse = Announcement;

/**
 * Tag list response
 */
export type TagListResponse = Tag[];

/**
 * Delete response
 */
export type DeleteResponse = {
  message: string;
};

// ========================================
// QUERY PARAMETERS
// ========================================

/**
 * Query parameters for fetching announcements
 * Used with GET /api/announcements
 */
export type AnnouncementQueryParams = {
  page?: number;                    // Page number (default: 1)
  limit?: number;                   // Items per page (default: 10)
  visibility?: AnnouncementVisibility; // Filter by visibility
  type?: string;                    // Filter by type
  roleId?: string;                  // Filter by target role
  includeExpired?: boolean;         // Include expired announcements (default: false)
};

/**
 * Query parameters for fetching user-specific announcements
 * Used with GET /api/announcements/my-announcements
 */
export type MyAnnouncementsQueryParams = {
  page?: number;                    // Page number (default: 1)
  limit?: number;                   // Items per page (default: 10)
  includeExpired?: boolean;         // Include expired announcements (default: false)
};

// ========================================
// FRONTEND-SPECIFIC TYPES
// ========================================

/**
 * Extended announcement type with computed properties for frontend use
 */
export type AnnouncementWithMeta = Announcement & {
  isExpired: boolean;               // Computed: check if announcement has expired
  isUrgent: boolean;                // Computed: check if type is 'urgent'
  daysUntilExpiry?: number;         // Computed: days until expiration
  categoryIcon?: string;            // Frontend icon mapping
  categoryColor?: string;           // Frontend color mapping
};

/**
 * Announcement filters for frontend UI
 */
export type AnnouncementFilters = {
  category?: AnnouncementCategory;
  visibility?: AnnouncementVisibility;
  searchQuery?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  tags?: string[];
};

