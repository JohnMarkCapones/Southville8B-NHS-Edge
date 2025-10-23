/**
 * useUserCounts Hook
 *
 * React hook for fetching user counts (students, teachers, admins) from the API.
 * Implements caching, error handling, and automatic retries.
 *
 * @module hooks/useUserCounts
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { getStudentCount, getTeacherCount, getAdminCount } from '@/lib/api/endpoints/users';
import type { UserCountResponse } from '@/lib/api/endpoints/users';

/**
 * User counts data structure
 */
export interface UserCounts {
  students: UserCountResponse | null;
  teachers: UserCountResponse | null;
  admins: UserCountResponse | null;
}

/**
 * Hook options
 */
export interface UseUserCountsOptions {
  /** Whether to fetch data on mount (default: true) */
  enabled?: boolean;
  /** Refetch interval in milliseconds (default: 2 minutes) */
  refetchInterval?: number;
  /** Whether to cache results in sessionStorage (default: true) */
  enableCache?: boolean;
  /** Cache duration in milliseconds (default: 2 minutes) */
  cacheDuration?: number;
}

/**
 * Hook return type
 */
export interface UseUserCountsReturn {
  /** User counts data */
  counts: UserCounts;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Refetch function */
  refetch: () => Promise<void>;
  /** Whether data is from cache */
  isFromCache: boolean;
}

const CACHE_KEY = 'superadmin_user_counts';
const DEFAULT_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes
const DEFAULT_REFETCH_INTERVAL = 2 * 60 * 1000; // 2 minutes

/**
 * Cached data structure
 */
interface CachedData {
  data: UserCounts;
  timestamp: number;
}

/**
 * Custom hook for fetching user counts with caching and auto-refresh
 *
 * @param options - Hook configuration options
 * @returns User counts data, loading state, and refetch function
 *
 * @example
 * ```typescript
 * const { counts, loading, error, refetch } = useUserCounts();
 *
 * if (loading) return <Spinner />;
 * if (error) return <Error message={error.message} />;
 *
 * return (
 *   <div>
 *     <p>Total Students: {counts.students?.total}</p>
 *     <p>Active Teachers: {counts.teachers?.active}</p>
 *   </div>
 * );
 * ```
 */
export function useUserCounts(options: UseUserCountsOptions = {}): UseUserCountsReturn {
  const {
    enabled = true,
    refetchInterval = DEFAULT_REFETCH_INTERVAL,
    enableCache = true,
    cacheDuration = DEFAULT_CACHE_DURATION,
  } = options;

  const [counts, setCounts] = useState<UserCounts>({
    students: null,
    teachers: null,
    admins: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  /**
   * Load cached data from sessionStorage
   */
  const loadFromCache = useCallback((): UserCounts | null => {
    if (!enableCache || typeof window === 'undefined') {
      return null;
    }

    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const parsedCache: CachedData = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is still valid
      if (now - parsedCache.timestamp < cacheDuration) {
        console.log('[useUserCounts] Loading data from cache');
        return parsedCache.data;
      }

      // Cache expired, remove it
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    } catch (err) {
      console.error('[useUserCounts] Error loading cache:', err);
      return null;
    }
  }, [enableCache, cacheDuration]);

  /**
   * Save data to cache
   */
  const saveToCache = useCallback((data: UserCounts) => {
    if (!enableCache || typeof window === 'undefined') {
      return;
    }

    try {
      const cacheData: CachedData = {
        data,
        timestamp: Date.now(),
      };
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      console.log('[useUserCounts] Data saved to cache');
    } catch (err) {
      console.error('[useUserCounts] Error saving to cache:', err);
    }
  }, [enableCache]);

  /**
   * Fetch user counts from API
   */
  const fetchCounts = useCallback(async () => {
    // Check cache first
    const cachedData = loadFromCache();
    if (cachedData) {
      setCounts(cachedData);
      setIsFromCache(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setIsFromCache(false);

    try {
      console.log('[useUserCounts] Fetching user counts from API...');

      // Fetch all counts in parallel for better performance
      const [students, teachers, admins] = await Promise.all([
        getStudentCount(),
        getTeacherCount(),
        getAdminCount(),
      ]);

      const newCounts: UserCounts = {
        students,
        teachers,
        admins,
      };

      setCounts(newCounts);
      saveToCache(newCounts);

      console.log('[useUserCounts] User counts fetched successfully:', newCounts);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to fetch user counts');
      console.error('[useUserCounts] Error fetching user counts:', errorObj);
      setError(errorObj);
    } finally {
      setLoading(false);
    }
  }, [loadFromCache, saveToCache]);

  /**
   * Refetch function (clears cache and fetches fresh data)
   */
  const refetch = useCallback(async () => {
    if (enableCache && typeof window !== 'undefined') {
      sessionStorage.removeItem(CACHE_KEY);
    }
    await fetchCounts();
  }, [fetchCounts, enableCache]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchCounts();
    }
  }, [enabled, fetchCounts]);

  // Auto-refetch interval
  useEffect(() => {
    if (!enabled || !refetchInterval) {
      return;
    }

    const intervalId = setInterval(() => {
      console.log('[useUserCounts] Auto-refreshing user counts...');
      fetchCounts();
    }, refetchInterval);

    return () => clearInterval(intervalId);
  }, [enabled, refetchInterval, fetchCounts]);

  return {
    counts,
    loading,
    error,
    refetch,
    isFromCache,
  };
}

/**
 * Hook for fetching only student count
 * Lightweight alternative when only student data is needed
 */
export function useStudentCount(options: Omit<UseUserCountsOptions, 'refetchInterval'> = {}) {
  const { enabled = true, enableCache = true, cacheDuration = DEFAULT_CACHE_DURATION } = options;

  const [count, setCount] = useState<UserCountResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStudentCount = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const studentCount = await getStudentCount();
      setCount(studentCount);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to fetch student count');
      setError(errorObj);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      fetchStudentCount();
    }
  }, [enabled, fetchStudentCount]);

  return {
    count,
    loading,
    error,
    refetch: fetchStudentCount,
  };
}

/**
 * Hook for fetching only teacher count
 * Lightweight alternative when only teacher data is needed
 */
export function useTeacherCount(options: Omit<UseUserCountsOptions, 'refetchInterval'> = {}) {
  const { enabled = true, enableCache = true, cacheDuration = DEFAULT_CACHE_DURATION } = options;

  const [count, setCount] = useState<UserCountResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTeacherCount = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const teacherCount = await getTeacherCount();
      setCount(teacherCount);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to fetch teacher count');
      setError(errorObj);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      fetchTeacherCount();
    }
  }, [enabled, fetchTeacherCount]);

  return {
    count,
    loading,
    error,
    refetch: fetchTeacherCount,
  };
}
