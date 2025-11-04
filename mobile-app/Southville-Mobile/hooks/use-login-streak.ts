import { useState, useEffect, useCallback } from "react";
import { fetchLoginStreak } from "@/services/user";

interface UseLoginStreakReturn {
  streak: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useLoginStreak(): UseLoginStreakReturn {
  const [streak, setStreak] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStreak = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const streakCount = await fetchLoginStreak();
      setStreak(streakCount);
    } catch (err) {
      let errorMessage = "Failed to fetch login streak";

      if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      // Default to 0 on error
      setStreak(0);
      console.error("Error fetching login streak:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  return {
    streak,
    loading,
    error,
    refetch: fetchStreak,
  };
}
