"use client"

import useSWR, { type SWRConfiguration } from 'swr'

/**
 * Custom hook for fetching data with aggressive caching
 * Perfect for data that doesn't change often
 */
export function useCachedData<T>(
  key: string | null,
  options?: SWRConfiguration
) {
  return useSWR<T>(key, {
    // Disable revalidation on focus
    revalidateOnFocus: false,
    // Enable revalidation on reconnect
    revalidateOnReconnect: true,
    // Dedupe requests within 2 minutes
    dedupingInterval: 120000,
    // Refresh every 10 minutes
    refreshInterval: 600000,
    // Don't retry on error
    shouldRetryOnError: false,
    ...options,
  })
}

/**
 * Hook for frequently changing data (e.g., grades, assignments)
 */
export function useFreshData<T>(
  key: string | null,
  options?: SWRConfiguration
) {
  return useSWR<T>(key, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 30000, // 30 seconds
    refreshInterval: 60000, // 1 minute
    shouldRetryOnError: false,
    ...options,
  })
}

/**
 * Hook for real-time data (e.g., quiz, live events)
 */
export function useRealtimeData<T>(
  key: string | null,
  options?: SWRConfiguration
) {
  return useSWR<T>(key, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 5000, // 5 seconds
    refreshInterval: 10000, // 10 seconds
    shouldRetryOnError: true,
    ...options,
  })
}

/**
 * Hook for static data that never changes
 */
export function useStaticData<T>(
  key: string | null,
  options?: SWRConfiguration
) {
  return useSWR<T>(key, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 0,
    refreshInterval: 0,
    shouldRetryOnError: false,
    // Cache forever
    revalidateIfStale: false,
    ...options,
  })
}

/**
 * Example usage in a component:
 *
 * ```tsx
 * 'use client'
 *
 * import { useCachedData } from '@/lib/hooks/use-cached-data'
 *
 * export function StudentGrades() {
 *   const { data, error, isLoading } = useCachedData<Grade[]>('/api/grades')
 *
 *   if (isLoading) return <div>Loading...</div>
 *   if (error) return <div>Error loading grades</div>
 *
 *   return (
 *     <div>
 *       {data?.map(grade => (
 *         <div key={grade.id}>{grade.subject}: {grade.score}</div>
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
