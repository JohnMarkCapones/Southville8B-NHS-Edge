import { useState, useEffect, useCallback } from 'react';
import { fetchStudentRanking } from '@/services/rankings';
import type { StudentRanking } from '@/lib/types/ranking';

interface UseStudentRankingReturn {
  ranking: StudentRanking | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage student ranking from REST API
 * @param studentId - Optional student ID (UUID from students table)
 * @returns Ranking data, loading state, error, and refetch function
 */
export function useStudentRanking(
  studentId?: string | null
): UseStudentRankingReturn {
  const [ranking, setRanking] = useState<StudentRanking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!studentId) {
      setRanking(null);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await fetchStudentRanking(studentId);
      setRanking(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch ranking';
      setError(errorMessage);
      console.error('Error fetching student ranking:', err);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ranking,
    loading,
    error,
    refetch: fetchData,
  };
}

