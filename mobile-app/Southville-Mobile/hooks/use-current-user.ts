import { useState, useEffect, useCallback } from 'react';
import { fetchCurrentUser } from '@/services/user';
import type { UserProfile } from '@/lib/types/user';

interface UseCurrentUserReturn {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCurrentUser(): UseCurrentUserReturn {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCurrentUser();
      setUser(data);
    } catch (err) {
      let errorMessage = 'Failed to fetch user profile';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error('Error fetching user profile:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    user,
    loading,
    error,
    refetch: fetchData,
  };
}
