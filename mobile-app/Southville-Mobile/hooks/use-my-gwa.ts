import { useState, useEffect, useCallback } from 'react';
import { fetchMyGwa } from '@/services/gwa';
import type { Gwa, GwaParams } from '@/lib/types/gwa';

interface UseMyGwaReturn {
  gwaRecords: Gwa[];
  loading: boolean;
  error: string | null;
  refetch: (params?: GwaParams) => Promise<void>;
}

export function useMyGwa(params?: GwaParams): UseMyGwaReturn {
  const [gwaRecords, setGwaRecords] = useState<Gwa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (filterParams?: GwaParams) => {
    try {
      setLoading(true);
      setError(null);
      console.log('[useMyGwa] Fetching data with params:', filterParams);
      const data = await fetchMyGwa(filterParams);
      console.log('[useMyGwa] Received data:', data);
      setGwaRecords(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch GWA records';
      setError(errorMessage);
      console.error('Error fetching GWA records:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('[useMyGwa] useEffect triggered with params:', params);
    fetchData(params);
  }, [fetchData, params?.grading_period, params?.school_year]);

  return { gwaRecords, loading, error, refetch: fetchData };
}
