/**
 * useAllNews Hook
 *
 * React hook for fetching paginated news articles with filters for News Management page.
 * Includes support for category, status, visibility filtering, search, sorting, and pagination.
 * Also supports fetching archived/deleted articles.
 *
 * @module hooks/useAllNews
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { newsApi, NewsListParams, AdminNewsListResponse } from '@/lib/api/endpoints/news';
import { NewsArticle } from '@/types/news';

/**
 * Filters for fetching news articles
 */
export interface NewsFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  status?: string;
  visibility?: string;
  sortBy?: 'newest' | 'oldest' | 'popular' | 'trending';
  sortOrder?: 'asc' | 'desc';
  includeDeleted?: boolean; // For archived section
}

/**
 * Hook options
 */
export interface UseAllNewsOptions {
  /** Whether to fetch data on mount (default: true) */
  enabled?: boolean;
  /** Initial page number (default: 1) */
  initialPage?: number;
  /** Items per page (default: 20) */
  limit?: number;
  /** Initial category filter */
  initialCategoryId?: string;
  /** Initial status filter */
  initialStatus?: string;
  /** Initial visibility filter */
  initialVisibility?: string;
  /** Initial search query */
  initialSearch?: string;
  /** Sort field (default: 'newest') */
  sortBy?: NewsFilters['sortBy'];
  /** Sort order (default: 'desc') */
  sortOrder?: NewsFilters['sortOrder'];
  /** Include deleted articles (default: false) */
  includeDeleted?: boolean;
  /** Refetch interval in milliseconds (default: disabled) */
  refetchInterval?: number;
}

/**
 * Hook return type
 */
export interface UseAllNewsReturn {
  /** News articles data */
  articles: NewsArticle[];
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
  filters: NewsFilters;
  /** Update filters */
  setFilters: (filters: Partial<NewsFilters>) => void;
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
 * Custom hook for fetching paginated news articles with filtering and sorting
 *
 * @param options - Hook configuration options
 * @returns News data, pagination, filters, and control functions
 *
 * @example
 * ```typescript
 * const {
 *   articles,
 *   pagination,
 *   loading,
 *   error,
 *   searchQuery,
 *   setSearchQuery,
 *   filters,
 *   setFilters,
 * } = useAllNews({
 *   initialPage: 1,
 *   limit: 20,
 *   sortBy: 'newest',
 *   includeDeleted: false
 * });
 * ```
 */
export function useAllNews(options: UseAllNewsOptions = {}): UseAllNewsReturn {
  const {
    enabled = true,
    initialPage = 1,
    limit = 20,
    initialCategoryId,
    initialStatus,
    initialVisibility,
    initialSearch = '',
    sortBy = 'newest',
    sortOrder = 'desc',
    includeDeleted = false,
    refetchInterval,
  } = options;

  // State
  const [articles, setArticles] = useState<NewsArticle[]>([]);
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
  const [filters, setFiltersState] = useState<NewsFilters>({
    page: initialPage,
    limit,
    categoryId: initialCategoryId,
    status: initialStatus,
    visibility: initialVisibility,
    search: initialSearch,
    sortBy,
    sortOrder,
    includeDeleted,
  });

  /**
   * Update filters and reset to page 1
   */
  const setFilters = useCallback((newFilters: Partial<NewsFilters>) => {
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
   * Fetch news articles from API
   */
  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('[useAllNews] Fetching articles with filters:', filters);

      // Build params for API call
      const params: NewsListParams = {
        limit: filters.limit,
        offset: ((filters.page || 1) - 1) * (filters.limit || 20),
        categoryId: filters.categoryId,
        status: filters.status,
        visibility: filters.visibility,
        search: filters.search,
        sortBy: filters.sortBy,
        includeDeleted: filters.includeDeleted,
      };

      const response: AdminNewsListResponse = await newsApi.getAllNews(params);

      setArticles(response.data);
      setPagination(response.pagination);

      console.log('[useAllNews] Articles fetched successfully:', {
        count: response.data.length,
        total: response.pagination.total,
        page: response.pagination.page,
      });
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to fetch news articles');
      console.error('[useAllNews] Error fetching articles:', errorObj);
      setError(errorObj);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * Refetch function
   */
  const refetch = useCallback(async () => {
    await fetchArticles();
  }, [fetchArticles]);

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
      fetchArticles();
    }
  }, [enabled, fetchArticles]);

  // Auto-refetch interval (optional)
  useEffect(() => {
    if (!enabled || !refetchInterval) {
      return;
    }

    const intervalId = setInterval(() => {
      console.log('[useAllNews] Auto-refreshing articles...');
      fetchArticles();
    }, refetchInterval);

    return () => clearInterval(intervalId);
  }, [enabled, refetchInterval, fetchArticles]);

  return {
    articles,
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
