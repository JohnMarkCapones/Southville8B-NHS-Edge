/**
 * useSecurityMonitoring Hook
 *
 * Enhanced security monitoring for quiz sessions.
 * Tracks screen recording attempts, mouse inactivity, and suspicious patterns.
 *
 * @module hooks/useSecurityMonitoring
 */

'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { quizApi } from '@/lib/api/endpoints';

/**
 * Security monitoring options
 */
interface SecurityMonitoringOptions {
  /** Enable screen recording detection */
  detectScreenRecording?: boolean;

  /** Enable mouse activity tracking */
  trackMouseActivity?: boolean;

  /** Idle timeout in seconds (default: 180 = 3 minutes) */
  idleTimeout?: number;

  /** Check interval in milliseconds (default: 30000 = 30 seconds) */
  checkInterval?: number;

  /** Callback when security event detected */
  onSecurityEvent?: (event: SecurityEvent) => void;
}

/**
 * Security event types
 */
export enum SecurityEventType {
  SCREEN_RECORDING_DETECTED = 'screen_recording_detected',
  MOUSE_IDLE = 'mouse_idle',
  SUSPICIOUS_PATTERN = 'suspicious_pattern',
}

/**
 * Security event
 */
export interface SecurityEvent {
  type: SecurityEventType;
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * Hook return type
 */
interface UseSecurityMonitoringReturn {
  /** Last mouse activity timestamp */
  lastMouseActivity: Date | null;

  /** Seconds since last mouse activity */
  idleSeconds: number;

  /** Is user currently idle */
  isIdle: boolean;

  /** Detected security events */
  events: SecurityEvent[];

  /** Manually trigger security check */
  checkSecurity: () => Promise<void>;
}

/**
 * Enhanced security monitoring hook
 *
 * @param attemptId - Quiz attempt ID
 * @param options - Monitoring options
 *
 * @example
 * ```typescript
 * const { isIdle, idleSeconds, events } = useSecurityMonitoring(attemptId, {
 *   detectScreenRecording: true,
 *   trackMouseActivity: true,
 *   idleTimeout: 180,
 *   onSecurityEvent: (event) => {
 *     console.warn('Security event:', event);
 *   }
 * });
 *
 * // Show warning if user is idle
 * {isIdle && <Alert>You appear to be inactive...</Alert>}
 * ```
 */
export const useSecurityMonitoring = (
  attemptId: string | null,
  options: SecurityMonitoringOptions = {}
): UseSecurityMonitoringReturn => {
  const {
    detectScreenRecording = true,
    trackMouseActivity = true,
    idleTimeout = 180, // 3 minutes
    checkInterval = 30000, // 30 seconds
    onSecurityEvent,
  } = options;

  const [lastMouseActivity, setLastMouseActivity] = useState<Date | null>(null);
  const [idleSeconds, setIdleSeconds] = useState(0);
  const [events, setEvents] = useState<SecurityEvent[]>([]);

  const lastMouseMoveRef = useRef<Date>(new Date());
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const screenRecordingCheckRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Report security event
   */
  const reportEvent = useCallback(
    (type: SecurityEventType, metadata?: Record<string, any>) => {
      const event: SecurityEvent = {
        type,
        timestamp: new Date().toISOString(),
        metadata,
      };

      setEvents((prev) => [...prev, event]);

      // Call callback if provided
      if (onSecurityEvent) {
        onSecurityEvent(event);
      }

      // TODO: Send to backend flag system
      console.warn('[SecurityMonitoring]', event);
    },
    [onSecurityEvent]
  );

  /**
   * Detect screen recording
   *
   * Note: This is a limited detection method. It attempts to detect
   * if the user's display is being captured, but it's not foolproof.
   * Modern browsers restrict this API for privacy reasons.
   */
  const checkScreenRecording = useCallback(async () => {
    if (!detectScreenRecording || !attemptId) return;

    try {
      // Check if getDisplayMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        return;
      }

      // This will throw an error if no screen capture is active
      // or if the user denies permission (which is actually good)
      // Note: This approach has limitations and may not work in all browsers

      // For now, we'll just log that screen recording detection is active
      // A more robust solution would require browser extensions or
      // server-side monitoring of suspicious patterns

      // ⚠️ COMMENTED OUT: This approach triggers permission prompt
      // which disrupts the quiz experience.
      // TODO: Implement passive detection via canvas fingerprinting
      // or other non-intrusive methods

      // const stream = await navigator.mediaDevices.getDisplayMedia({
      //   video: true
      // });
      // if (stream) {
      //   // Screen is being captured
      //   stream.getTracks().forEach(track => track.stop());
      //   reportEvent(SecurityEventType.SCREEN_RECORDING_DETECTED, {
      //     detected: true
      //   });
      // }
    } catch (error) {
      // Error means no active screen capture (or permission denied)
      // This is actually the expected "good" path
    }
  }, [detectScreenRecording, attemptId, reportEvent]);

  /**
   * Track mouse activity
   */
  const handleMouseMove = useCallback(() => {
    const now = new Date();
    lastMouseMoveRef.current = now;
    setLastMouseActivity(now);
  }, []);

  /**
   * Check for idle activity
   */
  const checkIdleActivity = useCallback(() => {
    if (!trackMouseActivity || !attemptId) return;

    const now = new Date();
    const secondsSinceLastMove =
      (now.getTime() - lastMouseMoveRef.current.getTime()) / 1000;

    setIdleSeconds(Math.floor(secondsSinceLastMove));

    // Report idle if exceeds threshold
    if (secondsSinceLastMove > idleTimeout) {
      reportEvent(SecurityEventType.MOUSE_IDLE, {
        idleSeconds: Math.floor(secondsSinceLastMove),
      });
    }
  }, [trackMouseActivity, attemptId, idleTimeout, reportEvent]);

  /**
   * Manual security check
   */
  const checkSecurity = useCallback(async () => {
    await checkScreenRecording();
    checkIdleActivity();
  }, [checkScreenRecording, checkIdleActivity]);

  /**
   * Setup tracking
   */
  useEffect(() => {
    if (!attemptId) return;

    // Initialize last mouse activity
    lastMouseMoveRef.current = new Date();
    setLastMouseActivity(new Date());

    // Track mouse movement
    if (trackMouseActivity) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('click', handleMouseMove);
      document.addEventListener('scroll', handleMouseMove);
      document.addEventListener('keypress', handleMouseMove);
    }

    // Periodic security checks
    checkIntervalRef.current = setInterval(() => {
      checkIdleActivity();
    }, checkInterval);

    // Screen recording detection (every 60 seconds)
    if (detectScreenRecording) {
      screenRecordingCheckRef.current = setInterval(() => {
        checkScreenRecording();
      }, 60000);
    }

    return () => {
      // Cleanup
      if (trackMouseActivity) {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('click', handleMouseMove);
        document.removeEventListener('scroll', handleMouseMove);
        document.removeEventListener('keypress', handleMouseMove);
      }

      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }

      if (screenRecordingCheckRef.current) {
        clearInterval(screenRecordingCheckRef.current);
      }
    };
  }, [
    attemptId,
    trackMouseActivity,
    detectScreenRecording,
    handleMouseMove,
    checkIdleActivity,
    checkScreenRecording,
    checkInterval,
  ]);

  const isIdle = idleSeconds > idleTimeout;

  return {
    lastMouseActivity,
    idleSeconds,
    isIdle,
    events,
    checkSecurity,
  };
};
