import { useState, useEffect, useCallback } from 'react';
import { fetchCurrentUser } from '@/services/user';
import type { UserProfile } from '@/lib/types/user';
import { useAuthSession } from '@/hooks/use-auth-session';

interface UseCurrentUserReturn {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCurrentUser(): UseCurrentUserReturn {
  const { status } = useAuthSession();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (status !== 'authenticated') {
      // No token yet or logged out; avoid noisy error and stop loading
      setUser(null);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await fetchCurrentUser();
      setUser(data);
    } catch (err) {
      // Soft-handle unauthorized during startup
      const message = err instanceof Error ? err.message : 'Failed to fetch user profile';
      setError(message);
      if (typeof message === 'string' && message.toLowerCase().includes('no authentication token')) {
        // Do not spam console for expected unauthenticated state on cold start
      } else {
        console.error('Error fetching user profile:', err);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [status]);

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
