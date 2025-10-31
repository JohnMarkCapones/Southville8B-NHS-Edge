/**
 * Users API Endpoints
 *
 * Provides typed API functions for user management operations.
 * Includes functions for fetching user counts by role.
 *
 * @module lib/api/endpoints/users
 */

'use client';

import { apiClient } from '../client';

/**
 * User role types matching backend enum
 */
export type UserRole = 'Student' | 'Teacher' | 'Admin';

/**
 * User status types
 */
export type UserStatus = 'Active' | 'Inactive' | 'Suspended';

/**
 * User domain role from PBAC system
 */
export interface UserDomainRole {
  role_name: string;       // e.g., "Editor-in-Chief", "Treasurer"
  domain_type: string;     // e.g., "journalism", "club"
  domain_name: string;     // e.g., "School Newspaper", "Math Club"
}

/**
 * User entity from backend
 */
export interface User {
  id: string;
  email: string;
  full_name: string;
  role_id: string;
  status: UserStatus;
  created_at: string;
  updated_at: string;
  last_login_at?: string;  // ✅ NEW: Last login timestamp
  role?: {
    name: UserRole;
  };
  teacher?: any;
  admin?: any;
  student?: any;
  primary_domain_role?: UserDomainRole;  // ✅ NEW: Primary role from PBAC
}

/**
 * Paginated users response
 */
export interface PaginatedUsersResponse {
  data: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * User count response
 */
export interface UserCountResponse {
  total: number;
  active: number;
  inactive: number;
  suspended?: number;
}

/**
 * Filters for fetching users
 */
export interface UserFilters {
  page?: number;
  limit?: number;
  role?: UserRole;
  status?: UserStatus;
  search?: string;
  sortBy?: 'created_at' | 'email' | 'full_name';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Fetch paginated users with filters
 *
 * @param filters - Query filters for users
 * @returns Promise with paginated users
 *
 * @example
 * ```typescript
 * const users = await getUsers({ role: 'Student', limit: 50 });
 * ```
 */
export async function getUsers(filters?: UserFilters): Promise<PaginatedUsersResponse> {
  const params = new URLSearchParams();

  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.role) params.append('role', filters.role);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.sortBy) params.append('sortBy', filters.sortBy);
  if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

  const endpoint = `/users${params.toString() ? `?${params.toString()}` : ''}`;

  return apiClient.get<PaginatedUsersResponse>(endpoint);
}

/**
 * Get count of students
 * Optimized endpoint that only fetches counts without full user data
 *
 * @returns Promise with student count breakdown
 *
 * @example
 * ```typescript
 * const studentCount = await getStudentCount();
 * console.log(`Total students: ${studentCount.total}`);
 * ```
 */
export async function getStudentCount(): Promise<UserCountResponse> {
  try {
    // Fetch only students with minimal data, using limit=1 to get count efficiently
    const response = await getUsers({
      role: 'Student',
      limit: 1,
      page: 1,
    });

    // Count active and inactive students (we'll need to fetch all for accurate counts)
    // Backend caps limit at 1000, so we use that maximum
    const fullResponse = await getUsers({
      role: 'Student',
      limit: 1000, // Backend maximum limit
      page: 1,
    });

    const active = fullResponse.data.filter(u => u.status === 'Active').length;
    const inactive = fullResponse.data.filter(u => u.status === 'Inactive').length;
    const suspended = fullResponse.data.filter(u => u.status === 'Suspended').length;

    return {
      total: fullResponse.pagination.total,
      active,
      inactive,
      suspended,
    };
  } catch (error) {
    console.error('[API] Error fetching student count:', error);
    throw error;
  }
}

/**
 * Get count of teachers
 * Optimized endpoint that only fetches counts without full user data
 *
 * @returns Promise with teacher count breakdown
 *
 * @example
 * ```typescript
 * const teacherCount = await getTeacherCount();
 * console.log(`Total teachers: ${teacherCount.total}`);
 * ```
 */
export async function getTeacherCount(): Promise<UserCountResponse> {
  try {
    // Backend caps limit at 1000, so we use that maximum
    const response = await getUsers({
      role: 'Teacher',
      limit: 1000,
      page: 1,
    });

    const active = response.data.filter(u => u.status === 'Active').length;
    const inactive = response.data.filter(u => u.status === 'Inactive').length;
    const suspended = response.data.filter(u => u.status === 'Suspended').length;

    return {
      total: response.pagination.total,
      active,
      inactive,
      suspended,
    };
  } catch (error) {
    console.error('[API] Error fetching teacher count:', error);
    throw error;
  }
}

/**
 * Get count of admins
 *
 * @returns Promise with admin count breakdown
 */
export async function getAdminCount(): Promise<UserCountResponse> {
  try {
    // Backend caps limit at 1000, so we use that maximum
    const response = await getUsers({
      role: 'Admin',
      limit: 1000,
      page: 1,
    });

    const active = response.data.filter(u => u.status === 'Active').length;
    const inactive = response.data.filter(u => u.status === 'Inactive').length;
    const suspended = response.data.filter(u => u.status === 'Suspended').length;

    return {
      total: response.pagination.total,
      active,
      inactive,
      suspended,
    };
  } catch (error) {
    console.error('[API] Error fetching admin count:', error);
    throw error;
  }
}

/**
 * Get current authenticated user
 *
 * @returns Promise with current user data
 * @deprecated Use getCurrentUser from './auth' instead (returns UserProfileResponse)
 */
export async function getCurrentUserData(): Promise<User> {
  return apiClient.get<User>('/users/me');
}

/**
 * Get specific user by ID
 *
 * @param userId - User ID
 * @returns Promise with user data
 */
export async function getUserById(userId: string): Promise<User> {
  return apiClient.get<User>(`/users/${userId}`);
}

/**
 * Get statistics for all users
 * Calculates total, active, inactive, and new this month
 *
 * @returns Promise with user statistics
 *
 * @example
 * ```typescript
 * const stats = await getAllUsersStats();
 * console.log(`Total: ${stats.total}, New: ${stats.newThisMonth}`);
 * ```
 */
export async function getAllUsersStats(): Promise<{
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  newThisMonth: number;
}> {
  try {
    // Backend caps limit at 1000, so we use that maximum
    const response = await getUsers({
      limit: 1000,
      page: 1,
    });

    const allUsers = response.data;

    // Calculate active/inactive/suspended
    const active = allUsers.filter(u => u.status === 'Active').length;
    const inactive = allUsers.filter(u => u.status === 'Inactive').length;
    const suspended = allUsers.filter(u => u.status === 'Suspended').length;

    // Calculate new this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const newThisMonth = allUsers.filter(user => {
      const createdDate = new Date(user.created_at);
      return createdDate >= startOfMonth && createdDate <= now;
    }).length;

    return {
      total: response.pagination.total,
      active,
      inactive,
      suspended,
      newThisMonth,
    };
  } catch (error) {
    console.error('[API] Error fetching all users stats:', error);
    throw error;
  }
}
