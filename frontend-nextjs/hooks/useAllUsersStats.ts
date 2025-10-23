/**
 * useAllUsersStats Hook
 *
 * React hook for fetching all users statistics for the SuperAdmin all-users page.
 * Calculates total users, active/inactive breakdown, and new users this month.
 *
 * @module hooks/useAllUsersStats
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAllUsersStats } from '@/lib/api/endpoints/users';

/**
 * All users statistics structure
 */
export interface AllUsersStats {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  newThisMonth: number;
}

/**
 * Hook options
 */
export interface UseAllUsersStatsOptions {
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
export interface UseAllUsersStatsReturn {
  /** User statistics data */
  stats: AllUsersStats | null;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Refetch function */
  refetch: () => Promise<void>;
  /** Whether data is from cache */
  isFromCache: boolean;
}

const CACHE_KEY = 'superadmin_all_users_stats';
const DEFAULT_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes
const DEFAULT_REFETCH_INTERVAL = 2 * 60 * 1000; // 2 minutes

/**
 * Cached data structure
 */
interface CachedData {
  data: AllUsersStats;
  timestamp: number;
}

/**
 * Custom hook for fetching all users statistics with caching and auto-refresh
 *
 * @param options - Hook configuration options
 * @returns All users statistics, loading state, and refetch function
 *
 * @example
 * ```typescript
 * const { stats, loading, error, refetch } = useAllUsersStats();
 *
 * if (loading) return <Spinner />;
 * if (error) return <Error message={error.message} />;
 *
 * return (
 *   <div>
 *     <p>Total Users: {stats?.total}</p>
 *     <p>Active Users: {stats?.active}</p>
 *     <p>New This Month: {stats?.newThisMonth}</p>
 *   </div>
 * );
 * ```
 */
export function useAllUsersStats(options: UseAllUsersStatsOptions = {}): UseAllUsersStatsReturn {
  const {
    enabled = true,
    refetchInterval = DEFAULT_REFETCH_INTERVAL,
    enableCache = true,
    cacheDuration = DEFAULT_CACHE_DURATION,
  } = options;

  const [stats, setStats] = useState<AllUsersStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  /**
   * Load cached data from sessionStorage
   */
  const loadFromCache = useCallback((): AllUsersStats | null => {
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
        console.log('[useAllUsersStats] Loading data from cache');
        return parsedCache.data;
      }

      // Cache expired, remove it
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    } catch (err) {
      console.error('[useAllUsersStats] Error loading cache:', err);
      return null;
    }
  }, [enableCache, cacheDuration]);

  /**
   * Save data to cache
   */
  const saveToCache = useCallback((data: AllUsersStats) => {
    if (!enableCache || typeof window === 'undefined') {
      return;
    }

    try {
      const cacheData: CachedData = {
        data,
        timestamp: Date.now(),
      };
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      console.log('[useAllUsersStats] Data saved to cache');
    } catch (err) {
      console.error('[useAllUsersStats] Error saving to cache:', err);
    }
  }, [enableCache]);

  /**
   * Fetch all users statistics from API
   */
  const fetchStats = useCallback(async () => {
    // Check cache first
    const cachedData = loadFromCache();
    if (cachedData) {
      setStats(cachedData);
      setIsFromCache(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setIsFromCache(false);

    try {
      console.log('[useAllUsersStats] Fetching all users stats from API...');

      const userStats = await getAllUsersStats();

      setStats(userStats);
      saveToCache(userStats);

      console.log('[useAllUsersStats] Stats fetched successfully:', userStats);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to fetch all users stats');
      console.error('[useAllUsersStats] Error fetching stats:', errorObj);
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
    await fetchStats();
  }, [fetchStats, enableCache]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchStats();
    }
  }, [enabled, fetchStats]);

  // Auto-refetch interval
  useEffect(() => {
    if (!enabled || !refetchInterval) {
      return;
    }

    const intervalId = setInterval(() => {
      console.log('[useAllUsersStats] Auto-refreshing all users stats...');
      fetchStats();
    }, refetchInterval);

    return () => clearInterval(intervalId);
  }, [enabled, refetchInterval, fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch,
    isFromCache,
  };
}
