/**
 * useEntityCounts Hook
 *
 * React hook for fetching entity counts (departments, clubs, sections, modules, events).
 * Implements caching, error handling, and automatic retries.
 *
 * @module hooks/useEntityCounts
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getAllEntityCounts,
  getDepartmentCount,
  getClubCount,
  getSectionCount,
  getModuleCount,
  getEventCount,
} from '@/lib/api/endpoints/entities';
import type { AllEntityCounts, EntityCountResponse } from '@/lib/api/endpoints/entities';

/**
 * Hook options
 */
export interface UseEntityCountsOptions {
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
export interface UseEntityCountsReturn {
  /** Entity counts data */
  counts: AllEntityCounts;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Refetch function */
  refetch: () => Promise<void>;
  /** Whether data is from cache */
  isFromCache: boolean;
}

const CACHE_KEY = 'superadmin_entity_counts';
const DEFAULT_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes
const DEFAULT_REFETCH_INTERVAL = 2 * 60 * 1000; // 2 minutes

/**
 * Cached data structure
 */
interface CachedData {
  data: AllEntityCounts;
  timestamp: number;
}

/**
 * Custom hook for fetching entity counts with caching and auto-refresh
 *
 * @param options - Hook configuration options
 * @returns Entity counts data, loading state, and refetch function
 *
 * @example
 * ```typescript
 * const { counts, loading, error, refetch } = useEntityCounts();
 *
 * if (loading) return <Spinner />;
 * if (error) return <Error message={error.message} />;
 *
 * return (
 *   <div>
 *     <p>Total Departments: {counts.departments?.total}</p>
 *     <p>Total Clubs: {counts.clubs?.total}</p>
 *     <p>Total Sections: {counts.sections?.total}</p>
 *   </div>
 * );
 * ```
 */
export function useEntityCounts(options: UseEntityCountsOptions = {}): UseEntityCountsReturn {
  const {
    enabled = true,
    refetchInterval = DEFAULT_REFETCH_INTERVAL,
    enableCache = true,
    cacheDuration = DEFAULT_CACHE_DURATION,
  } = options;

  const [counts, setCounts] = useState<AllEntityCounts>({
    departments: null,
    clubs: null,
    sections: null,
    modules: null,
    events: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  /**
   * Load cached data from sessionStorage
   */
  const loadFromCache = useCallback((): AllEntityCounts | null => {
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
        console.log('[useEntityCounts] Loading data from cache');
        return parsedCache.data;
      }

      // Cache expired, remove it
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    } catch (err) {
      console.error('[useEntityCounts] Error loading cache:', err);
      return null;
    }
  }, [enableCache, cacheDuration]);

  /**
   * Save data to cache
   */
  const saveToCache = useCallback((data: AllEntityCounts) => {
    if (!enableCache || typeof window === 'undefined') {
      return;
    }

    try {
      const cacheData: CachedData = {
        data,
        timestamp: Date.now(),
      };
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      console.log('[useEntityCounts] Data saved to cache');
    } catch (err) {
      console.error('[useEntityCounts] Error saving to cache:', err);
    }
  }, [enableCache]);

  /**
   * Fetch entity counts from API
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
      console.log('[useEntityCounts] Fetching entity counts from API...');

      // Fetch all counts in parallel
      const allCounts = await getAllEntityCounts();

      setCounts(allCounts);
      saveToCache(allCounts);

      console.log('[useEntityCounts] Entity counts fetched successfully:', allCounts);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to fetch entity counts');
      console.error('[useEntityCounts] Error fetching entity counts:', errorObj);
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
      console.log('[useEntityCounts] Auto-refreshing entity counts...');
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
 * Hook for fetching only department count
 */
export function useDepartmentCount(options: Omit<UseEntityCountsOptions, 'refetchInterval'> = {}) {
  const { enabled = true } = options;

  const [count, setCount] = useState<EntityCountResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDepartmentCount = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const departmentCount = await getDepartmentCount();
      setCount(departmentCount);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to fetch department count');
      setError(errorObj);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      fetchDepartmentCount();
    }
  }, [enabled, fetchDepartmentCount]);

  return {
    count,
    loading,
    error,
    refetch: fetchDepartmentCount,
  };
}

/**
 * Hook for fetching only club count
 */
export function useClubCount(options: Omit<UseEntityCountsOptions, 'refetchInterval'> = {}) {
  const { enabled = true } = options;

  const [count, setCount] = useState<EntityCountResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchClubCount = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const clubCount = await getClubCount();
      setCount(clubCount);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to fetch club count');
      setError(errorObj);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      fetchClubCount();
    }
  }, [enabled, fetchClubCount]);

  return {
    count,
    loading,
    error,
    refetch: fetchClubCount,
  };
}

/**
 * Hook for fetching only section count
 */
export function useSectionCount(options: Omit<UseEntityCountsOptions, 'refetchInterval'> = {}) {
  const { enabled = true } = options;

  const [count, setCount] = useState<EntityCountResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSectionCount = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const sectionCount = await getSectionCount();
      setCount(sectionCount);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to fetch section count');
      setError(errorObj);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      fetchSectionCount();
    }
  }, [enabled, fetchSectionCount]);

  return {
    count,
    loading,
    error,
    refetch: fetchSectionCount,
  };
}

/**
 * Hook for fetching only module count
 */
export function useModuleCount(options: Omit<UseEntityCountsOptions, 'refetchInterval'> = {}) {
  const { enabled = true } = options;

  const [count, setCount] = useState<EntityCountResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchModuleCount = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const moduleCount = await getModuleCount();
      setCount(moduleCount);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to fetch module count');
      setError(errorObj);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      fetchModuleCount();
    }
  }, [enabled, fetchModuleCount]);

  return {
    count,
    loading,
    error,
    refetch: fetchModuleCount,
  };
}

/**
 * Hook for fetching only event count
 */
export function useEventCount(options: Omit<UseEntityCountsOptions, 'refetchInterval'> = {}) {
  const { enabled = true } = options;

  const [count, setCount] = useState<EntityCountResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEventCount = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const eventCount = await getEventCount();
      setCount(eventCount);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to fetch event count');
      setError(errorObj);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      fetchEventCount();
    }
  }, [enabled, fetchEventCount]);

  return {
    count,
    loading,
    error,
    refetch: fetchEventCount,
  };
}
