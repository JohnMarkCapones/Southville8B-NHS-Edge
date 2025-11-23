/**
 * useTopPerformers Hook
 *
 * React hook for managing top performers data and statistics.
 * Provides comprehensive data fetching, filtering, and state management.
 *
 * @module hooks/useTopPerformers
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getTopPerformers,
  getTopPerformersStats,
  getStudentPerformanceDetails,
  validateTopPerformersQuery,
  type TopPerformer,
  type TopPerformersStats,
  type TopPerformersListResponse,
  type StudentPerformanceDetails,
  type TopPerformersQueryParams,
  type StatsQueryParams,
} from '@/lib/api/endpoints/top-performers';

// ==================== HOOK OPTIONS ====================

export interface UseTopPerformersOptions {
  /** Whether to fetch data on mount (default: true) */
  enabled?: boolean;
  /** Initial query parameters */
  initialParams?: TopPerformersQueryParams;
  /** Auto-refetch interval in milliseconds (optional) */
  refetchInterval?: number;
  /** Whether to include statistics in the response */
  includeStats?: boolean;
}

// ==================== HOOK RETURN TYPE ====================

export interface UseTopPerformersReturn {
  // Data
  performers: TopPerformer[];
  stats: TopPerformersStats | null;
  selectedStudent: StudentPerformanceDetails | null;
  
  // Pagination
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  
  // Loading states
  loading: boolean;
  statsLoading: boolean;
  studentDetailsLoading: boolean;
  
  // Error states
  error: string | null;
  statsError: string | null;
  studentDetailsError: string | null;
  
  // Actions
  fetchTopPerformers: (params?: TopPerformersQueryParams) => Promise<void>;
  fetchStats: (params?: StatsQueryParams) => Promise<void>;
  fetchStudentDetails: (studentId: string) => Promise<void>;
  refetch: () => Promise<void>;
  
  // Utilities
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  clearError: () => void;
  clearStudentDetails: () => void;
}

// ==================== HOOK IMPLEMENTATION ====================

export const useTopPerformers = (options: UseTopPerformersOptions = {}): UseTopPerformersReturn => {
  const {
    enabled = true,
    initialParams = {},
    refetchInterval,
    includeStats = true,
  } = options;

  // ==================== STATE ====================
  
  // Data state
  const [performers, setPerformers] = useState<TopPerformer[]>([]);
  const [stats, setStats] = useState<TopPerformersStats | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentPerformanceDetails | null>(null);
  
  // Pagination state
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initialParams.page || 1);
  const [limit, setLimit] = useState(initialParams.limit || 10);
  const [totalPages, setTotalPages] = useState(0);
  
  // Loading state
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [studentDetailsLoading, setStudentDetailsLoading] = useState(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [studentDetailsError, setStudentDetailsError] = useState<string | null>(null);

  // ==================== FETCH FUNCTIONS ====================

  const fetchTopPerformers = useCallback(async (params: TopPerformersQueryParams = {}) => {
    try {
      setLoading(true);
      setError(null);

      const validatedParams = validateTopPerformersQuery({
        ...initialParams,
        ...params,
        page,
        limit,
      });

      const response: TopPerformersListResponse = await getTopPerformers(validatedParams);
      
      setPerformers(response.performers);
      setTotal(response.total);
      setPage(response.page);
      setLimit(response.limit);
      setTotalPages(response.totalPages);
      
      // Update stats if included in response
      if (includeStats && response.stats) {
        setStats(response.stats);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch top performers';
      setError(errorMessage);
      console.error('[useTopPerformers] Error fetching top performers:', err);
    } finally {
      setLoading(false);
    }
  }, [initialParams, page, limit, includeStats]);

  const fetchStats = useCallback(async (params: StatsQueryParams = {}) => {
    try {
      setStatsLoading(true);
      setStatsError(null);

      // Filter out topN from initialParams since stats endpoint doesn't accept it
      const { topN, page, limit, sortBy, sortOrder, ...statsParams } = initialParams;
      
      const response = await getTopPerformersStats({
        ...statsParams,
        ...params,
      });
      
      setStats(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch statistics';
      setStatsError(errorMessage);
      console.error('[useTopPerformers] Error fetching stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, [initialParams]);

  const fetchStudentDetails = useCallback(async (studentId: string) => {
    try {
      setStudentDetailsLoading(true);
      setStudentDetailsError(null);

      const response = await getStudentPerformanceDetails(studentId);
      setSelectedStudent(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch student details';
      setStudentDetailsError(errorMessage);
      console.error('[useTopPerformers] Error fetching student details:', err);
    } finally {
      setStudentDetailsLoading(false);
    }
  }, []);

  // ==================== UTILITY FUNCTIONS ====================

  const refetch = useCallback(async () => {
    await Promise.all([
      fetchTopPerformers(),
      includeStats ? fetchStats() : Promise.resolve(),
    ]);
  }, [fetchTopPerformers, fetchStats, includeStats]);

  const clearError = useCallback(() => {
    setError(null);
    setStatsError(null);
    setStudentDetailsError(null);
  }, []);

  const clearStudentDetails = useCallback(() => {
    setSelectedStudent(null);
    setStudentDetailsError(null);
  }, []);

  // ==================== EFFECTS ====================

  // Initial data fetch
  useEffect(() => {
    if (enabled) {
      fetchTopPerformers();
      if (includeStats) {
        fetchStats();
      }
    }
  }, [enabled, includeStats]); // Remove refetch from dependencies to prevent infinite loop

  // Auto-refetch interval
  useEffect(() => {
    if (refetchInterval && enabled) {
      const interval = setInterval(() => {
        fetchTopPerformers();
        if (includeStats) {
          fetchStats();
        }
      }, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [refetchInterval, enabled, includeStats]); // Remove refetch from dependencies

  // ==================== COMPUTED VALUES ====================

  const computedStats = useMemo(() => {
    if (!stats) return null;
    
    return {
      ...stats,
      // Calculate additional derived stats
      honorRollPercentage: stats.totalHonorStudents > 0 
        ? Math.round((stats.honorRollStudents / stats.totalHonorStudents) * 100)
        : 0,
      perfectGwaPercentage: stats.totalHonorStudents > 0
        ? Math.round((stats.perfectGwaStudents / stats.totalHonorStudents) * 100)
        : 0,
    };
  }, [stats]);

  // ==================== RETURN ====================

  return {
    // Data
    performers,
    stats: computedStats,
    selectedStudent,
    
    // Pagination
    total,
    page,
    limit,
    totalPages,
    
    // Loading states
    loading,
    statsLoading,
    studentDetailsLoading,
    
    // Error states
    error,
    statsError,
    studentDetailsError,
    
    // Actions
    fetchTopPerformers,
    fetchStats,
    fetchStudentDetails,
    refetch,
    
    // Utilities
    setPage,
    setLimit,
    clearError,
    clearStudentDetails,
  };
};
