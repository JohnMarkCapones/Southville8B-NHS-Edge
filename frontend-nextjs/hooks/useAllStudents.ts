/**
 * useAllStudents Hook
 *
 * React hook for fetching paginated students list with filters for Student Management page.
 * Includes support for grade filtering, status filtering, search, sorting, and pagination.
 *
 * @module hooks/useAllStudents
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api/client';

/**
 * Student from API with section data
 */
export interface Student {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  student_id: string;
  lrn_id: string;
  grade_level?: string;
  enrollment_year?: number;
  honor_status?: string;
  rank?: number;
  section_id?: string;
  age?: number;
  birthday?: string;
  deleted_at?: string;
  // Related data
  section?: {
    id: string;
    name: string;
    grade_level: string;
  };
  user?: {
    id: string;
    email: string;
    full_name: string;
    status: string;
  };
}

/**
 * Paginated students response
 */
export interface PaginatedStudentsResponse {
  data: Student[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Filters for fetching students
 */
export interface StudentFilters {
  page?: number;
  limit?: number;
  search?: string;
  gradeLevel?: string;
  sectionId?: string;
  sortBy?: 'created_at' | 'first_name' | 'last_name' | 'student_id';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Hook options
 */
export interface UseAllStudentsOptions {
  /** Whether to fetch data on mount (default: true) */
  enabled?: boolean;
  /** Initial page number (default: 1) */
  initialPage?: number;
  /** Items per page (default: 20) */
  limit?: number;
  /** Initial grade filter */
  initialGradeLevel?: string;
  /** Initial search query */
  initialSearch?: string;
  /** Sort field (default: 'created_at') */
  sortBy?: StudentFilters['sortBy'];
  /** Sort order (default: 'desc') */
  sortOrder?: StudentFilters['sortOrder'];
  /** Refetch interval in milliseconds (default: disabled) */
  refetchInterval?: number;
}

/**
 * Hook return type
 */
export interface UseAllStudentsReturn {
  /** Students data */
  students: Student[];
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
  filters: StudentFilters;
  /** Update filters */
  setFilters: (filters: Partial<StudentFilters>) => void;
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
 * Custom hook for fetching paginated students with filtering and sorting
 *
 * @param options - Hook configuration options
 * @returns Students data, pagination, filters, and control functions
 *
 * @example
 * ```typescript
 * const {
 *   students,
 *   pagination,
 *   loading,
 *   error,
 *   searchQuery,
 *   setSearchQuery,
 *   filters,
 *   setFilters,
 * } = useAllStudents({
 *   initialPage: 1,
 *   limit: 20,
 *   sortBy: 'first_name',
 *   sortOrder: 'asc'
 * });
 * ```
 */
export function useAllStudents(options: UseAllStudentsOptions = {}): UseAllStudentsReturn {
  const {
    enabled = true,
    initialPage = 1,
    limit = 20,
    initialGradeLevel,
    initialSearch = '',
    sortBy = 'student_id',
    sortOrder = 'asc',
    refetchInterval,
  } = options;

  // State
  const [students, setStudents] = useState<Student[]>([]);
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
  const [filters, setFiltersState] = useState<StudentFilters>({
    page: initialPage,
    limit,
    gradeLevel: initialGradeLevel,
    search: initialSearch,
    sortBy,
    sortOrder,
  });

  /**
   * Update filters and reset to page 1
   */
  const setFilters = useCallback((newFilters: Partial<StudentFilters>) => {
    setFiltersState((prev) => ({
      ...prev,
      ...newFilters,
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
   * Fetch students from API
   */
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('[useAllStudents] Fetching students with filters:', filters);

      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.gradeLevel) params.append('gradeLevel', filters.gradeLevel);
      if (filters.sectionId) params.append('sectionId', filters.sectionId);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

      const endpoint = `/students${params.toString() ? `?${params.toString()}` : ''}`;
      const response: PaginatedStudentsResponse = await apiClient.get<PaginatedStudentsResponse>(endpoint);

      setStudents(response.data);
      setPagination(response.pagination);

      console.log('[useAllStudents] Students fetched successfully:', {
        count: response.data.length,
        total: response.pagination.total,
        page: response.pagination.page,
      });
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to fetch students');
      console.error('[useAllStudents] Error fetching students:', errorObj);
      setError(errorObj);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * Refetch function
   */
  const refetch = useCallback(async () => {
    await fetchStudents();
  }, [fetchStudents]);

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
      fetchStudents();
    }
  }, [enabled, fetchStudents]);

  // Auto-refetch interval (optional)
  useEffect(() => {
    if (!enabled || !refetchInterval) {
      return;
    }

    const intervalId = setInterval(() => {
      console.log('[useAllStudents] Auto-refreshing students...');
      fetchStudents();
    }, refetchInterval);

    return () => clearInterval(intervalId);
  }, [enabled, refetchInterval, fetchStudents]);

  return {
    students,
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
