/**
 * useAllTeachers Hook
 *
 * React hook for fetching paginated teachers list with filters for Teacher Management page.
 * Includes support for department filtering, status filtering, search, sorting, and pagination.
 *
 * @module hooks/useAllTeachers
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { getUsers, type PaginatedUsersResponse, type UserFilters, type User } from '@/lib/api/endpoints/users';

/**
 * Teacher with enriched data from backend
 */
export interface TeacherData {
  id: string;
  email: string;
  full_name: string;
  status: string;
  created_at: string;
  last_login_at?: string;
  // Teacher-specific data
  teacher?: {
    id: string;
    user_id: string;
    first_name: string;
    last_name: string;
    middle_name?: string;
    age?: number;
    birthday?: string;
    subject_specialization_id?: string;
    department_id?: string;
    advisory_section_id?: string;
    // Joined data from backend
    subject_specialization?: {
      id: string;
      subject_name: string;
    };
    department?: {
      id: string;
      department_name: string;
    };
    advisory_section?: {
      id: string;
      name: string;
      grade_level: string;
    };
  };
}

/**
 * Hook options
 */
export interface UseAllTeachersOptions {
  /** Whether to fetch data on mount (default: true) */
  enabled?: boolean;
  /** Initial page number (default: 1) */
  initialPage?: number;
  /** Items per page (default: 20) */
  limit?: number;
  /** Initial department filter */
  initialDepartment?: string;
  /** Initial status filter */
  initialStatus?: 'Active' | 'Inactive' | 'Suspended';
  /** Initial search query */
  initialSearch?: string;
  /** Sort field (default: 'created_at') */
  sortBy?: UserFilters['sortBy'];
  /** Sort order (default: 'desc') */
  sortOrder?: UserFilters['sortOrder'];
  /** Refetch interval in milliseconds (default: disabled) */
  refetchInterval?: number;
}

/**
 * Hook return type
 */
export interface UseAllTeachersReturn {
  /** Teachers data */
  teachers: TeacherData[];
  /** Pagination info */
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Current filters */
  filters: UserFilters;
  /** Update filters */
  setFilters: (filters: Partial<UserFilters>) => void;
  /** Search query */
  searchQuery: string;
  /** Update search query */
  setSearchQuery: (query: string) => void;
  /** Current page */
  currentPage: number;
  /** Go to specific page */
  goToPage: (page: number) => void;
  /** Go to next page */
  nextPage: () => void;
  /** Go to previous page */
  previousPage: () => void;
  /** Refetch function */
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching paginated teachers with filtering and sorting
 *
 * @param options - Hook configuration options
 * @returns Teachers data, pagination, filters, and control functions
 *
 * @example
 * ```typescript
 * const {
 *   teachers,
 *   pagination,
 *   loading,
 *   error,
 *   searchQuery,
 *   setSearchQuery,
 * } = useAllTeachers({
 *   initialPage: 1,
 *   limit: 20,
 *   sortBy: 'full_name',
 *   sortOrder: 'asc'
 * });
 * ```
 */
export function useAllTeachers(options: UseAllTeachersOptions = {}): UseAllTeachersReturn {
  const {
    enabled = true,
    initialPage = 1,
    limit = 20,
    initialDepartment,
    initialStatus,
    initialSearch = '',
    sortBy = 'created_at',
    sortOrder = 'desc',
    refetchInterval,
  } = options;

  // State
  const [teachers, setTeachers] = useState<TeacherData[]>([]);
  const [pagination, setPagination] = useState<{
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [filters, setFiltersState] = useState<UserFilters>({
    page: initialPage,
    limit,
    role: 'Teacher', // ✅ Always filter for Teacher role
    status: initialStatus,
    search: initialSearch,
    sortBy,
    sortOrder,
  });

  /**
   * Update filters and reset to page 1
   */
  const setFilters = useCallback((newFilters: Partial<UserFilters>) => {
    setFiltersState((prev) => ({
      ...prev,
      ...newFilters,
      role: 'Teacher', // ✅ Ensure we always fetch teachers
      page: 1, // Reset to page 1 when filters change
    }));
    setCurrentPage(1);
  }, []);

  /**
   * Update search query
   */
  const handleSetSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
    setFiltersState((prev) => ({
      ...prev,
      search: query,
      page: 1,
    }));
    setCurrentPage(1);
  }, []);

  /**
   * Fetch teachers from API
   */
  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('[useAllTeachers] Fetching teachers with filters:', filters);

      const response: PaginatedUsersResponse = await getUsers(filters);

      // Filter to ensure we only get teachers (extra safety check)
      const teacherData = response.data.filter(user => user.role?.name === 'Teacher') as TeacherData[];

      setTeachers(teacherData);
      setPagination(response.pagination);

      console.log('[useAllTeachers] Teachers fetched successfully:', {
        count: teacherData.length,
        total: response.pagination.total,
        page: response.pagination.page,
      });
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to fetch teachers');
      console.error('[useAllTeachers] Error fetching teachers:', errorObj);
      setError(errorObj);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * Refetch function
   */
  const refetch = useCallback(async () => {
    await fetchTeachers();
  }, [fetchTeachers]);

  /**
   * Go to specific page
   */
  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
    setFiltersState((prev) => ({
      ...prev,
      page,
    }));
  }, []);

  /**
   * Go to next page
   */
  const nextPage = useCallback(() => {
    if (pagination && currentPage < pagination.totalPages) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, pagination, goToPage]);

  /**
   * Go to previous page
   */
  const previousPage = useCallback(() => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, goToPage]);

  // Initial fetch and refetch on filter changes
  useEffect(() => {
    if (enabled) {
      fetchTeachers();
    }
  }, [enabled, fetchTeachers]);

  // Auto-refetch interval (optional)
  useEffect(() => {
    if (!enabled || !refetchInterval) {
      return;
    }

    const intervalId = setInterval(() => {
      console.log('[useAllTeachers] Auto-refreshing teachers...');
      fetchTeachers();
    }, refetchInterval);

    return () => clearInterval(intervalId);
  }, [enabled, refetchInterval, fetchTeachers]);

  return {
    teachers,
    pagination,
    loading,
    error,
    filters,
    setFilters,
    searchQuery,
    setSearchQuery: handleSetSearchQuery,
    currentPage,
    goToPage,
    nextPage,
    previousPage,
    refetch,
  };
}
