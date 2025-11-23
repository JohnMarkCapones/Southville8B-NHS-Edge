/**
 * useQuizMonitoring Hook
 *
 * Custom React hook for monitoring active quiz sessions (Teacher).
 * Provides real-time participant tracking and flag management.
 *
 * @module hooks/useQuizMonitoring
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { quizApi } from '@/lib/api/endpoints';
import { useToast } from './use-toast';
import type {
  ActiveParticipantsResponse,
  QuizFlagsResponse,
} from '@/lib/api/types';

/**
 * Monitoring options
 */
interface MonitoringOptions {
  /** Polling interval in milliseconds (default: 10 seconds, auto-adjusted based on activity) */
  pollInterval?: number;

  /** Auto-refresh enabled (default: true) */
  autoRefresh?: boolean;

  /** Page number for pagination (default: 1) */
  page?: number;

  /** Results per page (default: 50) */
  limit?: number;

  /** Enable smart polling (adaptive intervals based on activity) */
  smartPolling?: boolean;
}

/**
 * useQuizMonitoring hook return type
 */
interface UseQuizMonitoringReturn {
  // Data
  participants: ActiveParticipantsResponse | null;
  flags: QuizFlagsResponse | null;

  // Loading states
  isLoading: boolean;
  isTerminating: boolean;

  // Error
  error: Error | null;

  // Operations
  fetchParticipants: (quizId: string) => Promise<void>;
  fetchFlags: (quizId: string) => Promise<void>;
  terminateAttempt: (attemptId: string, reason: string) => Promise<boolean>;
  refresh: () => Promise<void>;

  // Control
  startPolling: () => void;
  stopPolling: () => void;
  isPolling: boolean;
}

/**
 * Custom hook for quiz monitoring (Teacher)
 *
 * @param quizId - Quiz ID to monitor
 * @param options - Monitoring options
 *
 * @example
 * ```typescript
 * const {
 *   participants,
 *   flags,
 *   refresh,
 *   terminateAttempt
 * } = useQuizMonitoring('quiz-123', {
 *   pollInterval: 10000,
 *   autoRefresh: true
 * });
 *
 * // Participants and flags update automatically
 * console.log(`Active students: ${participants?.activeCount}`);
 *
 * // Terminate a student's attempt
 * await terminateAttempt('attempt-456', 'Too many tab switches');
 * ```
 */
/**
 * Get smart polling interval based on active student count
 * - 0 students: 60s (conserve resources when idle)
 * - 1-4 students: 15s (moderate activity)
 * - 5-19 students: 10s (active monitoring)
 * - 20+ students: 5s (high activity)
 */
const getSmartInterval = (activeCount: number): number => {
  if (activeCount === 0) return 60000;  // 60s when idle
  if (activeCount < 5) return 15000;    // 15s for small groups
  if (activeCount < 20) return 10000;   // 10s for medium groups
  return 5000;                          // 5s for large classes
};

/**
 * Fetch with retry logic (exponential backoff)
 */
const fetchWithRetry = async <T,>(
  fn: () => Promise<T>,
  retries: number = 3,
  backoff: number = 1000,
): Promise<T> => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      const isLastAttempt = i === retries - 1;

      if (isLastAttempt) {
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = backoff * Math.pow(2, i);
      console.warn(`⚠️ Retry ${i + 1}/${retries} after ${delay}ms:`, error);

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error('Max retries exceeded');
};

export const useQuizMonitoring = (
  quizId: string | null,
  options: MonitoringOptions = {}
): UseQuizMonitoringReturn => {
  const {
    pollInterval = 10000,
    autoRefresh = true,
    page = 1,
    limit = 50,
    smartPolling = true, // ✅ Enable smart polling by default
  } = options;

  const [participants, setParticipants] =
    useState<ActiveParticipantsResponse | null>(null);
  const [flags, setFlags] = useState<QuizFlagsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTerminating, setIsTerminating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [activeCount, setActiveCount] = useState(0); // ✅ Track active count for smart polling
  const [currentInterval, setCurrentInterval] = useState(pollInterval);

  // ✅ FIX: Use ref instead of state to avoid infinite loop
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { toast } = useToast();

  // ✅ SMART POLLING: Adjust interval based on activity
  useEffect(() => {
    if (!smartPolling) return;

    const newInterval = getSmartInterval(activeCount);
    if (newInterval !== currentInterval) {
      console.log(
        `📊 Smart polling: Adjusting interval ${currentInterval}ms → ${newInterval}ms (${activeCount} active students)`,
      );
      setCurrentInterval(newInterval);
    }
  }, [activeCount, smartPolling, currentInterval]);

  /**
   * Fetch active participants with retry logic
   */
  const fetchParticipants = useCallback(
    async (targetQuizId: string): Promise<void> => {
      try {
        const data = await fetchWithRetry(
          () => quizApi.monitoring.getActiveParticipants(targetQuizId, page, limit),
          3,
          1000,
        );
        setParticipants(data);
        setActiveCount(data.activeCount || 0); // ✅ Update active count for smart polling
        setError(null);
      } catch (err) {
        const error = err as Error;
        setError(error);
        console.error('❌ Failed to fetch participants after 3 retries:', error);
      }
    },
    [page, limit]
  );

  /**
   * Fetch quiz flags
   */
  const fetchFlags = useCallback(async (targetQuizId: string): Promise<void> => {
    try {
      const data = await quizApi.monitoring.getQuizFlags(targetQuizId);
      setFlags(data);
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error('Failed to fetch flags:', error);
    }
  }, []);

  /**
   * Refresh all monitoring data
   */
  const refresh = useCallback(async (): Promise<void> => {
    if (!quizId) return;

    setIsLoading(true);
    setError(null);

    try {
      await Promise.all([fetchParticipants(quizId), fetchFlags(quizId)]);
    } catch (err) {
      const error = err as Error;
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [quizId, fetchParticipants, fetchFlags]);

  /**
   * Terminate an attempt
   */
  const terminateAttempt = useCallback(
    async (attemptId: string, reason: string): Promise<boolean> => {
      setIsTerminating(true);
      setError(null);

      try {
        await quizApi.monitoring.terminateAttempt(attemptId, { reason });

        toast({
          title: 'Attempt Terminated',
          description: 'Student attempt has been terminated',
        });

        // Refresh data after termination
        if (quizId) {
          await refresh();
        }

        return true;
      } catch (err) {
        const error = err as Error;
        setError(error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to terminate attempt',
          variant: 'destructive',
        });
        return false;
      } finally {
        setIsTerminating(false);
      }
    },
    [quizId, refresh, toast]
  );

  /**
   * Start polling with dynamic interval
   */
  const startPolling = useCallback(() => {
    if (isPolling || !quizId) return;

    setIsPolling(true);

    // Initial fetch
    refresh();

    // Setup polling with current interval
    const id = setInterval(() => {
      if (quizId) {
        fetchParticipants(quizId);
        fetchFlags(quizId);
      }
    }, currentInterval); // ✅ Use dynamic interval for smart polling

    pollIntervalRef.current = id;
  }, [isPolling, quizId, currentInterval, refresh, fetchParticipants, fetchFlags]);

  /**
   * Stop polling
   */
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current); // ✅ FIX: Use ref instead of state
      pollIntervalRef.current = null;
    }
    setIsPolling(false);
  }, []); // ✅ FIX: No deps needed since we use ref

  // Auto-start polling if enabled
  useEffect(() => {
    if (autoRefresh && quizId) {
      startPolling();
    }

    return () => {
      // ✅ FIX: Don't call stopPolling in cleanup to avoid infinite loop
      // Just clear the interval directly
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [autoRefresh, quizId, startPolling]); // ✅ Removed stopPolling from deps

  // Stop polling when quiz ID changes or becomes null
  useEffect(() => {
    if (!quizId && pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
      setIsPolling(false);
    }
  }, [quizId]); // ✅ Removed stopPolling from deps

  // ✅ SMART POLLING: Restart polling when interval changes
  useEffect(() => {
    if (isPolling && smartPolling && quizId) {
      // Stop current polling
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }

      // Restart with new interval
      const id = setInterval(() => {
        if (quizId) {
          fetchParticipants(quizId);
          fetchFlags(quizId);
        }
      }, currentInterval);

      pollIntervalRef.current = id;
    }
  }, [currentInterval, isPolling, smartPolling, quizId]); // ✅ FIX: Removed fetchParticipants, fetchFlags to prevent infinite loop

  return {
    participants,
    flags,
    isLoading,
    isTerminating,
    error,
    fetchParticipants,
    fetchFlags,
    terminateAttempt,
    refresh,
    startPolling,
    stopPolling,
    isPolling,
  };
};
