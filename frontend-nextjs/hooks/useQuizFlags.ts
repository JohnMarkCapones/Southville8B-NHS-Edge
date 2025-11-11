/**
 * useQuizFlags Hook
 *
 * Custom React hook for detecting and submitting security flags during quiz.
 * Tracks tab switches, copy/paste attempts, fullscreen exits, etc.
 *
 * @module hooks/useQuizFlags
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { quizApi } from '@/lib/api/endpoints';
import { useQuizAttemptStore } from '@/lib/stores';

/**
 * Flag types that can be detected
 */
export enum FlagType {
  TAB_SWITCH = 'tab_switch',
  COPY_PASTE = 'copy_paste',
  FULLSCREEN_EXIT = 'fullscreen_exit',
  NETWORK_DISCONNECT = 'network_disconnect',
  BROWSER_BACK = 'browser_back',
}

/**
 * Flag detection configuration
 */
interface FlagDetectionConfig {
  /** Enable tab switch detection */
  detectTabSwitch?: boolean;
  /** Enable copy/paste detection */
  detectCopyPaste?: boolean;
  /** Enable fullscreen exit detection */
  detectFullscreenExit?: boolean;
  /** Enable network disconnect detection */
  detectNetworkDisconnect?: boolean;
  /** Enable browser back button detection */
  detectBrowserBack?: boolean;
}

/**
 * useQuizFlags hook return type
 */
interface UseQuizFlagsReturn {
  /** Number of tab switches detected */
  tabSwitchCount: number;
  /** Number of copy attempts detected */
  copyCount: number;
  /** Number of paste attempts detected */
  pasteCount: number;
  /** Number of fullscreen exits detected */
  fullscreenExitCount: number;
  /** Whether currently in fullscreen */
  isFullscreen: boolean;
  /** Manually submit a flag */
  submitFlag: (flagType: FlagType, metadata?: any) => Promise<void>;
  /** Request fullscreen mode */
  requestFullscreen: () => Promise<void>;
  /** Exit fullscreen mode */
  exitFullscreen: () => Promise<void>;
}

/**
 * Custom hook for quiz security flag detection
 *
 * Automatically detects and reports suspicious behavior during quiz attempts.
 * All detections are logged silently and sent to backend for teacher review.
 *
 * @example
 * ```typescript
 * const {
 *   tabSwitchCount,
 *   isFullscreen,
 *   requestFullscreen
 * } = useQuizFlags(attemptId, {
 *   detectTabSwitch: true,
 *   detectCopyPaste: true,
 *   detectFullscreenExit: true
 * });
 *
 * // Teacher can see in monitoring dashboard:
 * // "Warning: Student switched tabs 3 times"
 * ```
 */
export const useQuizFlags = (
  attemptId: string | null,
  config: FlagDetectionConfig = {},
): UseQuizFlagsReturn => {
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [copyCount, setCopyCount] = useState(0);
  const [pasteCount, setPasteCount] = useState(0);
  const [fullscreenExitCount, setFullscreenExitCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ✅ Get attempt from store to check status
  const { attempt } = useQuizAttemptStore();

  // Use Map to track submission state per flag type (prevents duplicate submissions)
  const submittingMap = useRef(new Map<string, boolean>());

  // Default config: enable all detections
  const {
    detectTabSwitch = true,
    detectCopyPaste = true,
    detectFullscreenExit = true,
    detectNetworkDisconnect = true,
    detectBrowserBack = true,
  } = config;

  /**
   * Submit a flag to the backend
   */
  const submitFlag = useCallback(
    async (flagType: FlagType, metadata?: any): Promise<void> => {
      if (!attemptId) {
        console.warn('[useQuizFlags] Cannot submit flag - no attemptId:', flagType);
        return;
      }

      // ✅ CRITICAL: Don't submit flags if attempt is already submitted/completed
      if (attempt?.status && attempt.status !== 'in_progress') {
        console.log(`[useQuizFlags] ⏹️ Skipping flag submission - attempt status is '${attempt.status}' (not in_progress)`);
        return;
      }

      // Check if this specific flag type is already being submitted
      const flagKey = `${flagType}-${metadata?.count || 0}`;
      if (submittingMap.current.get(flagKey)) {
        console.warn('[useQuizFlags] Already submitting this exact flag, skipping:', flagKey);
        return;
      }

      submittingMap.current.set(flagKey, true);
      console.log(`[useQuizFlags] ✅ Submitting flag: ${flagType}`, { attemptId, metadata, flagKey });

      try {
        const result = await quizApi.student.submitFlag(attemptId, {
          flagType,
          metadata: {
            ...metadata,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
          },
        });

        console.log(`[useQuizFlags] ✅ Flag submitted successfully: ${flagType}`, result);
      } catch (error) {
        console.error('[useQuizFlags] ❌ Failed to submit flag:', flagType, error);
        // Silent failure - don't disrupt quiz experience
      } finally {
        // Clear the flag after a short delay
        setTimeout(() => {
          submittingMap.current.delete(flagKey);
        }, 1000); // Longer delay to prevent rapid duplicate submissions
      }
    },
    [attemptId, attempt],
  );

  /**
   * Handle visibility change (tab switch detection)
   */
  useEffect(() => {
    if (!detectTabSwitch || !attemptId) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Student switched away from tab
        setTabSwitchCount((prev) => {
          const newCount = prev + 1;
          submitFlag(FlagType.TAB_SWITCH, {
            count: newCount,
            documentHidden: true,
          });
          return newCount;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [detectTabSwitch, attemptId, submitFlag]);

  /**
   * Handle copy/paste detection
   */
  useEffect(() => {
    if (!detectCopyPaste || !attemptId) return;

    const handleCopy = (e: ClipboardEvent) => {
      setCopyCount((prev) => {
        const newCount = prev + 1;
        submitFlag(FlagType.COPY_PASTE, {
          action: 'copy',
          count: newCount,
        });
        return newCount;
      });
    };

    const handlePaste = (e: ClipboardEvent) => {
      setPasteCount((prev) => {
        const newCount = prev + 1;
        submitFlag(FlagType.COPY_PASTE, {
          action: 'paste',
          count: newCount,
        });
        return newCount;
      });
    };

    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
    };
  }, [detectCopyPaste, attemptId, submitFlag]);

  /**
   * Handle fullscreen changes
   */
  useEffect(() => {
    console.log('[useQuizFlags] 🔧 Fullscreen effect initializing:', {
      detectFullscreenExit,
      attemptId,
      currentFullscreenElement: document.fullscreenElement,
      willAttachListeners: detectFullscreenExit && !!attemptId,
    });

    if (!detectFullscreenExit) {
      console.warn('[useQuizFlags] ❌ Fullscreen detection is DISABLED');
      return;
    }

    if (!attemptId) {
      console.warn('[useQuizFlags] ❌ No attemptId - fullscreen detection will not work');
      return;
    }

    console.log('[useQuizFlags] ✅ Attaching fullscreen event listeners NOW');

    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;
      const wasFullscreen = isFullscreen; // Track previous state

      console.log('[useQuizFlags] Fullscreen change detected:', {
        wasFullscreen,
        isNowFullscreen,
        attemptId,
        detectFullscreenExit,
      });

      setIsFullscreen(isNowFullscreen);

      // Flag when exiting fullscreen (was fullscreen, now not)
      if (wasFullscreen && !isNowFullscreen) {
        console.log('[useQuizFlags] 🚨 Fullscreen EXIT detected - submitting flag');
        setFullscreenExitCount((prev) => {
          const newCount = prev + 1;
          console.log('[useQuizFlags] Fullscreen exit count:', newCount);
          submitFlag(FlagType.FULLSCREEN_EXIT, {
            count: newCount,
          });
          return newCount;
        });
      } else if (!wasFullscreen && isNowFullscreen) {
        console.log('[useQuizFlags] ✅ Fullscreen ENTERED');
      }
    };

    // Add test listener to verify browser events fire
    const testListener = () => {
      console.log('[useQuizFlags] 🎯 RAW fullscreenchange event fired!', {
        fullscreenElement: document.fullscreenElement,
        timestamp: new Date().toISOString(),
      });
    };

    document.addEventListener('fullscreenchange', testListener);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    // Initialize fullscreen state
    const initialFullscreen = !!document.fullscreenElement;
    console.log('[useQuizFlags] Initial fullscreen state:', initialFullscreen);
    setIsFullscreen(initialFullscreen);

    return () => {
      console.log('[useQuizFlags] 🧹 Cleaning up fullscreen event listeners');
      document.removeEventListener('fullscreenchange', testListener);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener(
        'webkitfullscreenchange',
        handleFullscreenChange,
      );
      document.removeEventListener(
        'mozfullscreenchange',
        handleFullscreenChange,
      );
      document.removeEventListener(
        'MSFullscreenChange',
        handleFullscreenChange,
      );
    };
  }, [detectFullscreenExit, attemptId, submitFlag, isFullscreen]);

  /**
   * Handle network disconnect detection
   */
  useEffect(() => {
    if (!detectNetworkDisconnect || !attemptId) return;

    const handleOffline = () => {
      submitFlag(FlagType.NETWORK_DISCONNECT, {
        online: false,
      });
    };

    const handleOnline = () => {
      // Log reconnection (optional)
      console.log('[useQuizFlags] Network reconnected');
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [detectNetworkDisconnect, attemptId, submitFlag]);

  /**
   * Handle browser back button (popstate)
   */
  useEffect(() => {
    if (!detectBrowserBack || !attemptId) return;

    const handlePopState = () => {
      submitFlag(FlagType.BROWSER_BACK, {
        action: 'browser_back_button',
      });
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [detectBrowserBack, attemptId, submitFlag]);

  /**
   * Request fullscreen mode
   */
  const requestFullscreen = useCallback(async () => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        await (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).mozRequestFullScreen) {
        await (elem as any).mozRequestFullScreen();
      } else if ((elem as any).msRequestFullscreen) {
        await (elem as any).msRequestFullscreen();
      }
    } catch (error) {
      // Silenced: Browser blocks fullscreen on auto-resume (needs user interaction)
      // console.error('[useQuizFlags] Failed to request fullscreen:', error);
    }
  }, []);

  /**
   * Exit fullscreen mode
   */
  const exitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      }
    } catch (error) {
      console.error('[useQuizFlags] Failed to exit fullscreen:', error);
    }
  }, []);

  return {
    tabSwitchCount,
    copyCount,
    pasteCount,
    fullscreenExitCount,
    isFullscreen,
    submitFlag,
    requestFullscreen,
    exitFullscreen,
  };
};
