/**
 * useHeartbeat Hook
 *
 * Custom React hook for managing quiz session heartbeat.
 * Sends periodic heartbeats to keep the session alive and detect issues.
 *
 * @module hooks/useHeartbeat
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { quizApi } from '@/lib/api/endpoints';
import { useQuizAttemptStore } from '@/lib/stores';
import { useToast } from './use-toast';

/**
 * Heartbeat options
 */
interface HeartbeatOptions {
  /** Interval between heartbeats in milliseconds (default: 2 minutes) */
  interval?: number;

  /** Whether to start automatically (default: true) */
  autoStart?: boolean;

  /** Callback when heartbeat fails */
  onError?: (error: Error) => void;

  /** Callback when session is invalid */
  onSessionInvalid?: () => void;
}

/**
 * useHeartbeat hook return type
 */
interface UseHeartbeatReturn {
  /** Whether heartbeat is active */
  isActive: boolean;

  /** Start sending heartbeats */
  start: () => void;

  /** Stop sending heartbeats */
  stop: () => void;

  /** Send heartbeat immediately */
  sendNow: () => Promise<void>;
}

/**
 * Custom hook for quiz session heartbeat
 *
 * Automatically sends heartbeats to the backend to keep the session alive.
 * Also validates session integrity.
 *
 * @param options - Heartbeat configuration options
 *
 * @example
 * ```typescript
 * const { isActive, start, stop } = useHeartbeat({
 *   interval: 120000, // 2 minutes
 *   onSessionInvalid: () => {
 *     alert('Your session has been terminated');
 *     router.push('/student/quiz');
 *   }
 * });
 *
 * // Heartbeat starts automatically
 * // Stop manually if needed
 * stop();
 * ```
 */
export const useHeartbeat = (
  options: HeartbeatOptions = {}
): UseHeartbeatReturn => {
  const {
    interval = 120000, // 2 minutes
    autoStart = true,
    onError,
    onSessionInvalid,
  } = options;

  const { toast } = useToast();
  const {
    attempt,
    deviceFingerprint,
    tabSwitchCount,
    currentQuestionIndex,
    questions,
    updateHeartbeat,
  } = useQuizAttemptStore();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(false);

  /**
   * Send heartbeat to backend
   */
  const sendHeartbeat = useCallback(async () => {
    if (!attempt || !deviceFingerprint) {
      console.warn('Cannot send heartbeat: No active attempt or fingerprint');
      return;
    }

    try {
      const currentQuestion =
        currentQuestionIndex >= 0 && currentQuestionIndex < questions.length
          ? questions[currentQuestionIndex]
          : null;

      await quizApi.student.sendHeartbeat(attempt.attempt_id, {
        device_fingerprint: deviceFingerprint,
        tab_switches: tabSwitchCount,
        current_question_id: currentQuestion?.question_id,
      });

      // Update local timestamp
      updateHeartbeat();
    } catch (error) {
      console.error('Heartbeat failed:', error);
      if (onError) {
        onError(error as Error);
      }
    }
  }, [
    attempt,
    deviceFingerprint,
    tabSwitchCount,
    currentQuestionIndex,
    questions,
    updateHeartbeat,
    onError,
  ]);

  /**
   * Validate session
   */
  const validateSession = useCallback(async () => {
    if (!attempt || !deviceFingerprint) {
      return;
    }

    try {
      const result = await quizApi.student.validateSession(
        attempt.attempt_id,
        deviceFingerprint
      );

      if (!result.isValid) {
        console.warn('Session invalid:', result.reason);
        if (onSessionInvalid) {
          onSessionInvalid();
        } else {
          toast({
            title: 'Session Invalid',
            description:
              result.reason || 'Your quiz session has been terminated',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Session validation failed:', error);
    }
  }, [attempt, deviceFingerprint, onSessionInvalid, toast]);

  /**
   * Start heartbeat
   */
  const start = useCallback(() => {
    if (isActiveRef.current) {
      return;
    }

    isActiveRef.current = true;

    // Send initial heartbeat
    sendHeartbeat();

    // Validate session every 5 minutes
    const validationInterval = setInterval(validateSession, 300000); // 5 minutes

    // Setup periodic heartbeat
    intervalRef.current = setInterval(() => {
      sendHeartbeat();
    }, interval);

    return () => {
      clearInterval(validationInterval);
    };
  }, [sendHeartbeat, validateSession, interval]);

  /**
   * Stop heartbeat
   */
  const stop = useCallback(() => {
    isActiveRef.current = false;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /**
   * Send heartbeat immediately
   */
  const sendNow = useCallback(async () => {
    await sendHeartbeat();
  }, [sendHeartbeat]);

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart && attempt && deviceFingerprint) {
      start();
    }

    // Cleanup on unmount
    return () => {
      stop();
    };
  }, [autoStart, attempt, deviceFingerprint, start, stop]);

  // Stop heartbeat when attempt is cleared
  useEffect(() => {
    if (!attempt) {
      stop();
    }
  }, [attempt, stop]);

  return {
    isActive: isActiveRef.current,
    start,
    stop,
    sendNow,
  };
};
