/**
 * useStudentSearch Hook
 *
 * React Query hook for searching students with debounced search and filters.
 * Used in Add Member dialog to search through all students.
 *
 * Usage:
 * ```tsx
 * const { data, isLoading, updateSearch, updateFilters } = useStudentSearch();
 * ```
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { searchStudents, type SearchStudentsParams } from '@/lib/api/endpoints/students';
import { useState, useCallback } from 'react';

// Debounce utility function
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);
  };
}

export function useStudentSearch(initialParams: SearchStudentsParams = {}) {
  const [params, setParams] = useState<SearchStudentsParams>({
    page: 1,
    limit: 20,
    ...initialParams,
  });

  const query = useQuery({
    queryKey: ['students-search', params],
    queryFn: () => searchStudents(params),
    enabled: true,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Debounced search update (300ms delay)
  const updateSearch = useCallback(
    debounce((search: string) => {
      setParams((prev) => ({ ...prev, search, page: 1 }));
    }, 300),
    []
  );

  const updateFilters = (updates: Partial<SearchStudentsParams>) => {
    setParams((prev) => ({ ...prev, ...updates, page: 1 }));
  };

  const setPage = (page: number) => {
    setParams((prev) => ({ ...prev, page }));
  };

  return {
    ...query,
    params,
    updateSearch,
    updateFilters,
    setPage,
  };
}
