/**
 * useQuizSession Hook
 *
 * Manages quiz session heartbeat, monitoring, and security tracking.
 * Sends periodic heartbeats to backend and tracks student behavior.
 *
 * @module hooks/useQuizSession
 */

'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { useToast } from './use-toast';
// ✅ FIXED: Use existing studentQuizApi (matches teacher pattern)
import { studentQuizApi } from '@/lib/api/endpoints/quiz';
import { useQuizAttemptStore } from '@/lib/stores';

/**
 * Session heartbeat data
 */
interface HeartbeatData {
  deviceFingerprint: string;
  tabSwitchCount: number;
  currentQuestionIndex?: number;
  questionsAnswered?: number;
}

/**
 * Hook return type
 */
interface UseQuizSessionReturn {
  /** Number of tab switches detected */
  tabSwitchCount: number;
  /** Device fingerprint string */
  deviceFingerprint: string;
  /** Whether session is being monitored */
  isMonitoring: boolean;
  /** Manually send heartbeat */
  sendHeartbeat: () => Promise<void>;
  /** Reset tab switch count */
  resetTabSwitchCount: () => void;
}

/**
 * Generate a simple device fingerprint
 * (Can be enhanced with libraries like fingerprintjs)
 */
function generateDeviceFingerprint(): string {
  if (typeof window === 'undefined') return '';

  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 'unknown',
    navigator.platform,
  ];

  const fingerprint = components.join('|');

  // Simple hash (in production, use a proper hashing library)
  return btoa(fingerprint).substring(0, 32);
}

/**
 * Quiz session management hook
 *
 * Features:
 * - Automatic heartbeat every 30 seconds
 * - Tab switch detection and tracking
 * - Device fingerprinting
 * - Session validation
 *
 * @param sessionId - Current session ID (null if no active session)
 * @param isActive - Whether the quiz session is active
 * @param options - Additional options
 *
 * @example
 * ```tsx
 * const { tabSwitchCount, deviceFingerprint, isMonitoring } = useQuizSession(
 *   sessionId,
 *   isQuizActive
 * );
 *
 * // Show warning if too many tab switches
 * useEffect(() => {
 *   if (tabSwitchCount >= 3) {
 *     toast.warning('Multiple tab switches detected');
 *   }
 * }, [tabSwitchCount]);
 * ```
 */
export function useQuizSession(
  sessionId: string | null,
  isActive: boolean,
  options?: {
    /** Heartbeat interval in milliseconds (default: 30000 = 30s) */
    heartbeatInterval?: number;
    /** Show warning toasts for violations */
    showWarnings?: boolean;
    /** Current question index for progress tracking */
    currentQuestionIndex?: number;
    /** Number of questions answered */
    questionsAnswered?: number;
  }
): UseQuizSessionReturn {
  const {
    heartbeatInterval = 30000, // 30 seconds
    showWarnings = true,
    currentQuestionIndex,
    questionsAnswered,
  } = options || {};

  const { toast } = useToast();

  // ✅ Get attempt from store to check status
  const { attempt } = useQuizAttemptStore();

  // State
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [deviceFingerprint, setDeviceFingerprint] = useState<string>('');
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Refs to avoid stale closures
  const tabSwitchCountRef = useRef(tabSwitchCount);
  const lastHeartbeatRef = useRef<Date | null>(null);

  // Update ref when tabSwitchCount changes
  useEffect(() => {
    tabSwitchCountRef.current = tabSwitchCount;
  }, [tabSwitchCount]);

  /**
   * Generate device fingerprint on mount
   */
  useEffect(() => {
    const fingerprint = generateDeviceFingerprint();
    setDeviceFingerprint(fingerprint);
    console.log('[useQuizSession] Device fingerprint generated:', fingerprint.substring(0, 8) + '...');
  }, []);

  /**
   * Send heartbeat to backend
   */
  const sendHeartbeat = useCallback(async () => {
    if (!sessionId) {
      console.log('[useQuizSession] No sessionId, skipping heartbeat');
      return;
    }

    // ✅ CRITICAL: Don't send heartbeat if attempt is already submitted/completed
    if (attempt?.status && attempt.status !== 'in_progress') {
      console.log(`[useQuizSession] ⏹️ Skipping heartbeat - attempt status is '${attempt.status}' (not in_progress)`);
      return;
    }

    const heartbeatData: HeartbeatData = {
      deviceFingerprint,
      tabSwitchCount: tabSwitchCountRef.current,
      currentQuestionIndex,
      questionsAnswered,
    };

    try {
      console.log('[useQuizSession] Sending heartbeat:', {
        sessionId,
        ...heartbeatData,
      });

      // ✅ FIXED: Use studentQuizApi.sendHeartbeat (matches existing API)
      await studentQuizApi.sendHeartbeat(sessionId, {
        deviceFingerprint: heartbeatData.deviceFingerprint,
        tabSwitches: heartbeatData.tabSwitchCount,
        currentQuestionId: undefined, // Can be added later if needed
      });

      lastHeartbeatRef.current = new Date();
      console.log('[useQuizSession] Heartbeat sent successfully');
    } catch (error) {
      console.error('[useQuizSession] Heartbeat failed:', error);

      // ✅ GRACEFUL HANDLING: If backend says "not in progress", stop silently
      const err = error as any;
      if (err.message?.includes('not in progress') || err.status === 400) {
        console.log('[useQuizSession] ⏹️ Backend says attempt is not in progress - stopping heartbeat');
        return; // Silent stop
      }

      // Don't show error toast for heartbeat failures (non-critical)
      // Backend may be temporarily unavailable
    }
  }, [sessionId, deviceFingerprint, currentQuestionIndex, questionsAnswered, attempt]);

  /**
   * Reset tab switch count (useful for testing or after warnings)
   */
  const resetTabSwitchCount = useCallback(() => {
    setTabSwitchCount(0);
    tabSwitchCountRef.current = 0;
  }, []);

  /**
   * Track tab/window visibility changes (tab switches)
   */
  useEffect(() => {
    if (!isActive) {
      setIsMonitoring(false);
      return;
    }

    setIsMonitoring(true);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User switched away from tab
        const newCount = tabSwitchCountRef.current + 1;
        setTabSwitchCount(newCount);

        console.log('[useQuizSession] Tab switch detected. Count:', newCount);

        // Show warnings at milestones
        if (showWarnings) {
          if (newCount === 3) {
            toast({
              title: '⚠️ Warning: Tab Switch Detected',
              description: 'You have switched tabs 3 times. This activity is being monitored.',
              variant: 'destructive',
              duration: 5000,
            });
          } else if (newCount === 5) {
            toast({
              title: '🚨 Multiple Tab Switches Detected',
              description: 'Excessive tab switching may be flagged for review.',
              variant: 'destructive',
              duration: 7000,
            });
          } else if (newCount >= 10) {
            toast({
              title: '⛔ Excessive Tab Switches',
              description: 'Your activity will be reviewed by your teacher.',
              variant: 'destructive',
              duration: 10000,
            });
          }
        }
      }
    };

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      setIsMonitoring(false);
    };
  }, [isActive, showWarnings, toast]);

  /**
   * Periodic heartbeat sender
   */
  useEffect(() => {
    if (!sessionId || !isActive) {
      return;
    }

    // Send initial heartbeat immediately
    sendHeartbeat();

    // Then send periodic heartbeats
    const interval = setInterval(() => {
      sendHeartbeat();
    }, heartbeatInterval);

    console.log(`[useQuizSession] Heartbeat started (every ${heartbeatInterval / 1000}s)`);

    return () => {
      clearInterval(interval);
      console.log('[useQuizSession] Heartbeat stopped');
    };
  }, [sessionId, isActive, heartbeatInterval, sendHeartbeat]);

  /**
   * Warn before page unload
   */
  useEffect(() => {
    if (!isActive) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'You have an active quiz. Are you sure you want to leave?';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isActive]);

  return {
    tabSwitchCount,
    deviceFingerprint,
    isMonitoring,
    sendHeartbeat,
    resetTabSwitchCount,
  };
}

/**
 * Hook to track mouse leaving quiz window
 * (Additional security feature)
 */
export function useQuizFocusTracking(isActive: boolean) {
  const [focusLostCount, setFocusLostCount] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const handleMouseLeave = () => {
      setFocusLostCount(prev => prev + 1);
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isActive]);

  return { focusLostCount };
}
