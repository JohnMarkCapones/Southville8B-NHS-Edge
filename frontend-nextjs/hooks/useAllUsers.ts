/**
 * useAllUsers Hook
 *
 * React hook for fetching paginated users list with filters for the SuperAdmin all-users table.
 * Includes support for role filtering, status filtering, search, sorting, and pagination.
 *
 * @module hooks/useAllUsers
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { getUsers, type PaginatedUsersResponse, type UserFilters, type User } from '@/lib/api/endpoints/users';

/**
 * Hook options
 */
export interface UseAllUsersOptions {
  /** Whether to fetch data on mount (default: true) */
  enabled?: boolean;
  /** Initial page number (default: 1) */
  initialPage?: number;
  /** Items per page (default: 10) */
  limit?: number;
  /** Initial role filter */
  initialRole?: UserFilters['role'];
  /** Initial status filter */
  initialStatus?: UserFilters['status'];
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
export interface UseAllUsersReturn {
  /** Users data */
  users: User[];
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
 * Custom hook for fetching paginated users with filtering and sorting
 *
 * @param options - Hook configuration options
 * @returns Users data, pagination, filters, and control functions
 *
 * @example
 * ```typescript
 * const {
 *   users,
 *   pagination,
 *   loading,
 *   error,
 *   searchQuery,
 *   setSearchQuery,
 *   filters,
 *   setFilters,
 *   currentPage,
 *   goToPage
 * } = useAllUsers({
 *   initialPage: 1,
 *   limit: 10,
 *   sortBy: 'created_at',
 *   sortOrder: 'desc'
 * });
 *
 * if (loading) return <Spinner />;
 * if (error) return <Error message={error.message} />;
 *
 * return (
 *   <div>
 *     <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
 *     <Table>
 *       {users.map(user => (
 *         <TableRow key={user.id}>
 *           <TableCell>{user.full_name}</TableCell>
 *           <TableCell>{user.email}</TableCell>
 *           <TableCell>{user.role?.name}</TableCell>
 *           <TableCell>{user.primary_domain_role?.role_name || '-'}</TableCell>
 *           <TableCell>
 *             {user.last_login_at
 *               ? new Date(user.last_login_at).toLocaleString()
 *               : 'Never'}
 *           </TableCell>
 *         </TableRow>
 *       ))}
 *     </Table>
 *     <Pagination
 *       currentPage={currentPage}
 *       totalPages={pagination?.totalPages || 1}
 *       onPageChange={goToPage}
 *     />
 *   </div>
 * );
 * ```
 */
export function useAllUsers(options: UseAllUsersOptions = {}): UseAllUsersReturn {
  const {
    enabled = true,
    initialPage = 1,
    limit = 10,
    initialRole,
    initialStatus,
    initialSearch = '',
    sortBy = 'created_at',
    sortOrder = 'desc',
    refetchInterval,
  } = options;

  // State
  const [users, setUsers] = useState<User[]>([]);
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
    role: initialRole,
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
      page: 1, // Reset to page 1 when filters change
    }));
    setCurrentPage(1);
  }, []);

  /**
   * Update search query with debouncing handled by component
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
   * Fetch users from API
   */
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('[useAllUsers] Fetching users with filters:', filters);

      const response: PaginatedUsersResponse = await getUsers(filters);

      setUsers(response.data);
      setPagination(response.pagination);

      console.log('[useAllUsers] Users fetched successfully:', {
        count: response.data.length,
        total: response.pagination.total,
        page: response.pagination.page,
      });
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to fetch users');
      console.error('[useAllUsers] Error fetching users:', errorObj);
      setError(errorObj);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * Refetch function
   */
  const refetch = useCallback(async () => {
    await fetchUsers();
  }, [fetchUsers]);

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
      fetchUsers();
    }
  }, [enabled, fetchUsers]);

  // Auto-refetch interval (optional)
  useEffect(() => {
    if (!enabled || !refetchInterval) {
      return;
    }

    const intervalId = setInterval(() => {
      console.log('[useAllUsers] Auto-refreshing users...');
      fetchUsers();
    }, refetchInterval);

    return () => clearInterval(intervalId);
  }, [enabled, refetchInterval, fetchUsers]);

  return {
    users,
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
