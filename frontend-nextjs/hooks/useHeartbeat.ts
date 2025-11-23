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

  /** Delay before first heartbeat in milliseconds (default: 3000ms) */
  initialDelay?: number;

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
 * ✅ FIXES APPLIED:
 * 1. Initial delay before first heartbeat (prevents race condition)
 * 2. Proper validation interval cleanup (prevents memory leak)
 * 3. Graceful error handling for "not in progress" errors
 * 4. Automatic stop on attempt completion/submission
 * 5. Prevents duplicate intervals on component re-renders
 *
 * @param options - Heartbeat configuration options
 *
 * @example
 * ```typescript
 * const { isActive, start, stop } = useHeartbeat({
 *   interval: 120000, // 2 minutes
 *   initialDelay: 3000, // 3 second delay before first heartbeat
 *   onSessionInvalid: () => {
 *     alert('Your session has been terminated');
 *     router.push('/student/quiz');
 *   }
 * });
 *
 * // Heartbeat starts automatically after 3 second delay
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
    initialDelay = 3000, // ✅ 3 second delay before first heartbeat
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

  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const validationIntervalRef = useRef<NodeJS.Timeout | null>(null); // ✅ Store validation interval ref
  const initialTimeoutRef = useRef<NodeJS.Timeout | null>(null); // ✅ Store initial delay timeout
  const isActiveRef = useRef(false);
  const firstHeartbeatFailedRef = useRef(false); // ✅ Track if first heartbeat failed

  /**
   * Send heartbeat to backend
   */
  const sendHeartbeat = useCallback(async (isFirstHeartbeat: boolean = false) => {
    if (!attempt || !deviceFingerprint) {
      console.warn('[Heartbeat] Cannot send: No active attempt or fingerprint');
      return;
    }

    // ✅ CRITICAL: Don't send heartbeat if attempt is already submitted/completed
    if (attempt.status && attempt.status !== 'in_progress') {
      console.log(`[Heartbeat] ⏹️ Skipping - attempt status is '${attempt.status}' (not in_progress)`);
      // Stop heartbeat automatically
      isActiveRef.current = false;
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      if (validationIntervalRef.current) {
        clearInterval(validationIntervalRef.current);
        validationIntervalRef.current = null;
      }
      return;
    }

    try {
      await quizApi.student.sendHeartbeat(attempt.attempt_id, {
        deviceFingerprint: deviceFingerprint,
        userAgent: navigator.userAgent,
        // Note: IP address is extracted server-side from request headers
      });

      // Update local timestamp
      updateHeartbeat();

      // ✅ Clear first heartbeat failed flag on success
      if (firstHeartbeatFailedRef.current) {
        console.log('[Heartbeat] ✅ Recovered from initial failure');
        firstHeartbeatFailedRef.current = false;
      }

      if (isFirstHeartbeat) {
        console.log('[Heartbeat] ✅ First heartbeat successful');
      }
    } catch (error) {
      const err = error as any;

      // ✅ GRACEFUL HANDLING: If first heartbeat fails with "not in progress"
      if (isFirstHeartbeat && (err.message?.includes('not in progress') || err.status === 400)) {
        console.log('[Heartbeat] ⚠️ First heartbeat failed (race condition) - will retry on next interval');
        firstHeartbeatFailedRef.current = true;
        // Don't stop heartbeat - let it retry on next interval
        return;
      }

      // ✅ If backend says attempt is not in progress (and it's not first heartbeat), stop
      if (err.message?.includes('not in progress') || err.status === 400) {
        console.log('[Heartbeat] ⏹️ Attempt no longer in progress - stopping heartbeat');
        isActiveRef.current = false;
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
          heartbeatIntervalRef.current = null;
        }
        if (validationIntervalRef.current) {
          clearInterval(validationIntervalRef.current);
          validationIntervalRef.current = null;
        }
        return;
      }

      console.error('[Heartbeat] ❌ Failed:', error);
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
        console.warn('[Heartbeat] ⚠️ Session invalid:', result.reason);
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
      console.error('[Heartbeat] Session validation failed:', error);
    }
  }, [attempt, deviceFingerprint, onSessionInvalid, toast]);

  /**
   * Start heartbeat
   */
  const start = useCallback(() => {
    if (isActiveRef.current) {
      console.log('[Heartbeat] Already active, skipping start');
      return;
    }

    console.log('[Heartbeat] 🚀 Starting with', initialDelay, 'ms initial delay');
    isActiveRef.current = true;

    // ✅ CRITICAL FIX: Delay first heartbeat to avoid race condition
    // Wait for backend to fully commit the quiz attempt before first heartbeat
    initialTimeoutRef.current = setTimeout(() => {
      console.log('[Heartbeat] ⏰ Initial delay complete, sending first heartbeat');
      sendHeartbeat(true); // Mark as first heartbeat

      // ✅ Setup validation interval (every 5 minutes)
      validationIntervalRef.current = setInterval(validateSession, 300000);

      // ✅ Setup periodic heartbeat interval
      heartbeatIntervalRef.current = setInterval(() => {
        sendHeartbeat(false);
      }, interval);

      console.log('[Heartbeat] ✅ Intervals configured:', {
        heartbeatInterval: interval,
        validationInterval: 300000,
      });
    }, initialDelay);
  }, [sendHeartbeat, validateSession, interval, initialDelay]);

  /**
   * Stop heartbeat
   */
  const stop = useCallback(() => {
    console.log('[Heartbeat] ⏹️ Stopping');
    isActiveRef.current = false;

    // ✅ Clear all intervals and timeouts
    if (initialTimeoutRef.current) {
      clearTimeout(initialTimeoutRef.current);
      initialTimeoutRef.current = null;
    }

    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }

    if (validationIntervalRef.current) {
      clearInterval(validationIntervalRef.current);
      validationIntervalRef.current = null;
    }

    firstHeartbeatFailedRef.current = false;
  }, []);

  /**
   * Send heartbeat immediately
   */
  const sendNow = useCallback(async () => {
    await sendHeartbeat(false);
  }, [sendHeartbeat]);

  // ✅ Auto-start if enabled
  useEffect(() => {
    if (autoStart && attempt && deviceFingerprint) {
      start();
    }

    // ✅ CRITICAL: Cleanup on unmount
    return () => {
      stop();
    };
  }, [autoStart, attempt, deviceFingerprint, start, stop]);

  // ✅ Stop heartbeat when attempt is cleared
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
