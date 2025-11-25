/**
 * ========================================
 * BANNER NOTIFICATIONS TYPES
 * ========================================
 * TypeScript types for Banner Notifications API
 */

// ========================================
// ENUMS
// ========================================

export type BannerType = 'info' | 'success' | 'warning' | 'destructive';

// ========================================
// ENTITIES
// ========================================

export interface BannerNotification {
  id: string;
  message: string;
  shortMessage: string;
  type: BannerType;
  isActive: boolean;
  isDismissible: boolean;
  hasAction: boolean;
  actionLabel?: string;
  actionUrl?: string;
  startDate: string; // ISO 8601 date string
  endDate: string; // ISO 8601 date string
  createdBy: string; // User UUID
  template?: string;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    fullName: string;
    email: string;
  };
}

// ========================================
// REQUEST TYPES
// ========================================

export interface CreateBannerRequest {
  message: string;
  shortMessage: string;
  type: BannerType;
  isActive?: boolean;
  isDismissible?: boolean;
  hasAction?: boolean;
  actionLabel?: string;
  actionUrl?: string;
  startDate: string; // ISO 8601 date string
  endDate: string; // ISO 8601 date string
  template?: string;
}

export interface UpdateBannerRequest {
  message?: string;
  shortMessage?: string;
  type?: BannerType;
  isActive?: boolean;
  isDismissible?: boolean;
  hasAction?: boolean;
  actionLabel?: string;
  actionUrl?: string;
  startDate?: string;
  endDate?: string;
  template?: string;
}

// ========================================
// QUERY PARAMS
// ========================================

export interface BannerQueryParams {
  page?: number;
  limit?: number;
  isActive?: boolean;
  type?: BannerType;
}

// ========================================
// RESPONSE TYPES
// ========================================

export interface BannerListResponse {
  data: BannerNotification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type BannerResponse = BannerNotification;

export interface DeleteResponse {
  message: string;
}
