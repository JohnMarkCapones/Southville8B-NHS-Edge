/**
 * useAvailableQuizzes Hook
 *
 * Fetches available quizzes for the current student from the backend API.
 * Handles loading, error states, pagination, and filtering.
 *
 * @module hooks/useAvailableQuizzes
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { studentQuizApi } from '@/lib/api/endpoints/quiz';
import type { AvailableQuizFilters, AvailableQuizzesResponse } from '@/lib/api/types';
import { ApiError } from '@/lib/api/errors';

interface UseAvailableQuizzesOptions {
  /** Initial page number (default: 1) */
  initialPage?: number;
  /** Items per page (default: 10) */
  limit?: number;
  /** Filter by subject ID */
  subjectId?: string;
  /** Auto-fetch on mount (default: true) */
  autoFetch?: boolean;
  /** Enable polling (fetch at interval) */
  enablePolling?: boolean;
  /** Polling interval in milliseconds (default: 30000 = 30s) */
  pollingInterval?: number;
}

interface UseAvailableQuizzesReturn {
  // Data
  data: AvailableQuizzesResponse | null;
  quizzes: any[];

  // State
  loading: boolean;
  error: ApiError | Error | null;

  // Pagination
  page: number;
  totalPages: number;
  totalQuizzes: number;

  // Actions
  fetchQuizzes: () => Promise<void>;
  refetch: () => Promise<void>;
  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setSubjectFilter: (subjectId: string | undefined) => void;
}

/**
 * Hook to fetch available quizzes for students
 *
 * @example
 * ```tsx
 * function QuizList() {
 *   const { quizzes, loading, error, page, totalPages, nextPage, prevPage } = useAvailableQuizzes({
 *     limit: 10,
 *     autoFetch: true
 *   });
 *
 *   if (loading) return <Skeleton />;
 *   if (error) return <ErrorMessage error={error} />;
 *
 *   return (
 *     <div>
 *       {quizzes.map(quiz => <QuizCard key={quiz.quiz_id} quiz={quiz} />)}
 *       <Pagination page={page} totalPages={totalPages} onNext={nextPage} onPrev={prevPage} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useAvailableQuizzes(
  options: UseAvailableQuizzesOptions = {}
): UseAvailableQuizzesReturn {
  const {
    initialPage = 1,
    limit = 10,
    subjectId: initialSubjectId,
    autoFetch = true,
    enablePolling = false,
    pollingInterval = 30000,
  } = options;

  // State
  const [data, setData] = useState<AvailableQuizzesResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<ApiError | Error | null>(null);
  const [page, setPage] = useState<number>(initialPage);
  const [subjectId, setSubjectId] = useState<string | undefined>(initialSubjectId);

  /**
   * Fetch quizzes from API
   */
  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: AvailableQuizFilters = {
        page,
        limit,
      };

      if (subjectId) {
        filters.subject_id = subjectId;
      }

      const response = await studentQuizApi.getAvailableQuizzes(filters);
      setData(response);
    } catch (err: any) {
      console.error('[useAvailableQuizzes] Error fetching quizzes:', err);
      setError(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [page, limit, subjectId]);

  /**
   * Refetch (alias for fetchQuizzes for clarity)
   */
  const refetch = useCallback(() => {
    return fetchQuizzes();
  }, [fetchQuizzes]);

  /**
   * Navigate to next page
   */
  const nextPage = useCallback(() => {
    if (data && page < data.pagination.totalPages) {
      setPage((prev) => prev + 1);
    }
  }, [data, page]);

  /**
   * Navigate to previous page
   */
  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  }, [page]);

  /**
   * Set subject filter
   */
  const setSubjectFilter = useCallback((newSubjectId: string | undefined) => {
    setSubjectId(newSubjectId);
    setPage(1); // Reset to first page when filter changes
  }, []);

  // Auto-fetch on mount or when dependencies change
  useEffect(() => {
    if (autoFetch) {
      fetchQuizzes();
    }
  }, [autoFetch, fetchQuizzes]);

  // Polling support
  useEffect(() => {
    if (enablePolling && !loading) {
      const interval = setInterval(() => {
        fetchQuizzes();
      }, pollingInterval);

      return () => clearInterval(interval);
    }
  }, [enablePolling, pollingInterval, loading, fetchQuizzes]);

  // Extract quizzes array for convenience
  const quizzes = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;
  const totalQuizzes = data?.pagination?.total || 0;

  return {
    // Data
    data,
    quizzes,

    // State
    loading,
    error,

    // Pagination
    page,
    totalPages,
    totalQuizzes,

    // Actions
    fetchQuizzes,
    refetch,
    setPage,
    nextPage,
    prevPage,
    setSubjectFilter,
  };
}

/**
 * Hook variant with mock data fallback
 *
 * If API fails, falls back to mock data (for demo purposes)
 */
export function useAvailableQuizzesWithFallback(
  options: UseAvailableQuizzesOptions = {}
) {
  const result = useAvailableQuizzes(options);
  const [useMock, setUseMock] = useState(false);

  // If error occurs, switch to mock mode
  useEffect(() => {
    if (result.error && !useMock) {
      console.warn('[useAvailableQuizzesWithFallback] API failed, using mock data');
      setUseMock(true);
    }
  }, [result.error, useMock]);

  // If using mock, return mock data
  if (useMock) {
    // Import mock data (to be created)
    // const mockQuizzes = getMockQuizzes();
    // return { ...result, quizzes: mockQuizzes, loading: false, error: null };
  }

  return result;
}
