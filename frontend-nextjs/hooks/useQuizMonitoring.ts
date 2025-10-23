/**
 * useQuizMonitoring Hook
 *
 * Custom React hook for monitoring active quiz sessions (Teacher).
 * Provides real-time participant tracking and flag management.
 *
 * @module hooks/useQuizMonitoring
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
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
  /** Polling interval in milliseconds (default: 10 seconds) */
  pollInterval?: number;

  /** Auto-refresh enabled (default: true) */
  autoRefresh?: boolean;
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
export const useQuizMonitoring = (
  quizId: string | null,
  options: MonitoringOptions = {}
): UseQuizMonitoringReturn => {
  const { pollInterval = 10000, autoRefresh = true } = options;

  const [participants, setParticipants] =
    useState<ActiveParticipantsResponse | null>(null);
  const [flags, setFlags] = useState<QuizFlagsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTerminating, setIsTerminating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [pollIntervalId, setPollIntervalId] = useState<NodeJS.Timeout | null>(
    null
  );

  const { toast } = useToast();

  /**
   * Fetch active participants
   */
  const fetchParticipants = useCallback(
    async (targetQuizId: string): Promise<void> => {
      try {
        const data = await quizApi.monitoring.getActiveParticipants(
          targetQuizId
        );
        setParticipants(data);
      } catch (err) {
        const error = err as Error;
        setError(error);
        console.error('Failed to fetch participants:', error);
      }
    },
    []
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
   * Start polling
   */
  const startPolling = useCallback(() => {
    if (isPolling || !quizId) return;

    setIsPolling(true);

    // Initial fetch
    refresh();

    // Setup polling
    const id = setInterval(() => {
      if (quizId) {
        fetchParticipants(quizId);
        fetchFlags(quizId);
      }
    }, pollInterval);

    setPollIntervalId(id);
  }, [isPolling, quizId, pollInterval, refresh, fetchParticipants, fetchFlags]);

  /**
   * Stop polling
   */
  const stopPolling = useCallback(() => {
    if (pollIntervalId) {
      clearInterval(pollIntervalId);
      setPollIntervalId(null);
    }
    setIsPolling(false);
  }, [pollIntervalId]);

  // Auto-start polling if enabled
  useEffect(() => {
    if (autoRefresh && quizId) {
      startPolling();
    }

    return () => {
      stopPolling();
    };
  }, [autoRefresh, quizId, startPolling, stopPolling]);

  // Stop polling when quiz ID changes or becomes null
  useEffect(() => {
    if (!quizId) {
      stopPolling();
    }
  }, [quizId, stopPolling]);

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
