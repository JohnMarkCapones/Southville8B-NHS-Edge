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
  SCREENSHOT_ATTEMPT = 'screenshot_attempt',
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
  /** Enable screenshot attempt detection */
  detectScreenshot?: boolean;
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
  /** Number of screenshot attempts detected */
  screenshotCount: number;
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
  const [screenshotCount, setScreenshotCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ✅ Get attempt from store to check status
  const { attempt } = useQuizAttemptStore();

  // Use Map to track submission state per flag type (prevents duplicate submissions)
  const submittingMap = useRef(new Map<string, boolean>());
  
  // ✅ ADD: Queue for flags that failed due to network issues
  const offlineFlagQueue = useRef<Array<{ flagType: FlagType; metadata?: any }>>([]);

  // Default config: enable all detections
  const {
    detectTabSwitch = true,
    detectCopyPaste = true,
    detectFullscreenExit = true,
    detectNetworkDisconnect = true,
    detectBrowserBack = true,
    detectScreenshot = true,
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
      // For network disconnect, use timestamp to allow multiple disconnects
      const flagKey = flagType === FlagType.NETWORK_DISCONNECT 
        ? `${flagType}-${Date.now()}` // Use timestamp for network disconnect to allow multiple events
        : `${flagType}-${metadata?.count || 0}`;
      if (submittingMap.current.get(flagKey)) {
        console.warn('[useQuizFlags] Already submitting this exact flag, skipping:', flagKey);
        return;
      }

      submittingMap.current.set(flagKey, true);
      console.log(`[useQuizFlags] ✅ Submitting flag: ${flagType}`, { attemptId, metadata, flagKey });

      try {
        // ✅ FIX: Check if we're online before attempting API call
        if (!navigator.onLine) {
          console.warn('[useQuizFlags] ⚠️ Offline - queueing flag for later submission:', flagType);
          offlineFlagQueue.current.push({ flagType, metadata });
          return;
        }

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
        
        // ✅ FIX: If network error or fetch failure, queue the flag for retry when online
        const isNetworkError = 
          error instanceof TypeError || 
          error instanceof DOMException ||
          (error instanceof Error && (
            error.message.includes('fetch') ||
            error.message.includes('network') ||
            error.message.includes('Failed to fetch') ||
            error.name === 'NetworkError' ||
            error.name === 'TypeError'
          ));
        
        if (isNetworkError) {
          console.warn('[useQuizFlags] ⚠️ Network error detected - queueing flag for later submission:', flagType);
          console.warn('[useQuizFlags] Error details:', {
            name: error instanceof Error ? error.name : 'Unknown',
            message: error instanceof Error ? error.message : String(error),
            navigatorOnLine: navigator.onLine,
          });
          offlineFlagQueue.current.push({ flagType, metadata });
        } else {
          console.error('[useQuizFlags] ❌ Non-network error - flag not queued:', error);
        }
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
    if (!detectNetworkDisconnect) {
      console.log('[useQuizFlags] Network disconnect detection disabled');
      return;
    }

    if (!attemptId) {
      console.log('[useQuizFlags] Network disconnect detection waiting for attemptId');
      return;
    }

    console.log('[useQuizFlags] ✅ Network disconnect detection active for attempt:', attemptId);

    const handleOffline = () => {
      console.log('[useQuizFlags] 🔴 OFFLINE event detected - browser went offline');
      console.log('[useQuizFlags] navigator.onLine:', navigator.onLine);
      submitFlag(FlagType.NETWORK_DISCONNECT, {
        online: false,
        timestamp: new Date().toISOString(),
      });
    };

    const handleOnline = async () => {
      console.log('[useQuizFlags] 🟢 ONLINE event detected - network reconnected');
      console.log('[useQuizFlags] navigator.onLine:', navigator.onLine);
      
      // ✅ FIX: Submit queued flags when connection is restored
      if (offlineFlagQueue.current.length > 0 && attemptId) {
        console.log(`[useQuizFlags] 📤 Submitting ${offlineFlagQueue.current.length} queued flags...`);
        const queuedFlags = [...offlineFlagQueue.current];
        offlineFlagQueue.current = []; // Clear queue
        
        // Submit each queued flag
        for (const queuedFlag of queuedFlags) {
          try {
            await submitFlag(queuedFlag.flagType, queuedFlag.metadata);
            // Small delay between submissions to avoid overwhelming the server
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            console.error('[useQuizFlags] ❌ Failed to submit queued flag:', queuedFlag.flagType, error);
            // Re-queue if still failing
            offlineFlagQueue.current.push(queuedFlag);
          }
        }
        console.log('[useQuizFlags] ✅ Finished submitting queued flags');
      }
    };

    // Test initial state
    console.log('[useQuizFlags] Initial network state - navigator.onLine:', navigator.onLine);
    console.log('[useQuizFlags] Network event listeners registered');

    let lastOnlineState = navigator.onLine;
    let offlineFlagSubmitted = false; // Track if we've already flagged this offline period

    // ✅ FIX: Poll navigator.onLine to catch DevTools throttling (which might not fire events)
    const checkNetworkState = () => {
      const currentOnlineState = navigator.onLine;
      
      // State changed from online to offline
      if (lastOnlineState && !currentOnlineState && !offlineFlagSubmitted) {
        console.log('[useQuizFlags] 🔴 Network state changed: ONLINE → OFFLINE (detected via polling)');
        console.log('[useQuizFlags] navigator.onLine:', navigator.onLine);
        offlineFlagSubmitted = true; // Prevent duplicate flags
        submitFlag(FlagType.NETWORK_DISCONNECT, {
          online: false,
          timestamp: new Date().toISOString(),
          detectedVia: 'polling',
        });
      }
      
      // State changed from offline to online
      if (!lastOnlineState && currentOnlineState) {
        console.log('[useQuizFlags] 🟢 Network state changed: OFFLINE → ONLINE (detected via polling)');
        offlineFlagSubmitted = false; // Reset for next offline period
        handleOnline(); // Trigger online handler
      }
      
      lastOnlineState = currentOnlineState;
    };

    // Poll every 2 seconds to catch DevTools throttling
    const pollIntervalId = setInterval(checkNetworkState, 2000);
    
    // Also check immediately
    checkNetworkState();

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      console.log('[useQuizFlags] 🧹 Cleaning up network event listeners');
      clearInterval(pollIntervalId);
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
   * Handle screenshot detection
   * Detects Print Screen key, Windows/Mac screenshot shortcuts, screen recording, and clipboard images
   */
  useEffect(() => {
    if (!detectScreenshot || !attemptId) return;

    console.log('[useQuizFlags] ✅ Screenshot detection active for attempt:', attemptId);

    // Track screen recording state
    let isScreenRecording = false;
    let mediaStream: MediaStream | null = null;

    /**
     * Handle keyboard screenshot shortcuts
     */
    const handleKeyDown = (e: KeyboardEvent) => {
      // Print Screen key (keyCode 44)
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        console.log('[useQuizFlags] 📸 Print Screen key detected');
        setScreenshotCount((prev) => {
          const newCount = prev + 1;
          submitFlag(FlagType.SCREENSHOT_ATTEMPT, {
            method: 'print_screen',
            count: newCount,
            timestamp: new Date().toISOString(),
          });
          return newCount;
        });
        return;
      }

      // Windows: Win + Shift + S (Snipping Tool)
      if (e.key === 'S' && e.shiftKey && (e.metaKey || (e as any).winKey)) {
        console.log('[useQuizFlags] 📸 Win+Shift+S detected');
        setScreenshotCount((prev) => {
          const newCount = prev + 1;
          submitFlag(FlagType.SCREENSHOT_ATTEMPT, {
            method: 'win_shift_s',
            count: newCount,
            timestamp: new Date().toISOString(),
          });
          return newCount;
        });
        return;
      }

      // Mac: Cmd + Shift + 3 (Full screen)
      if (e.key === '3' && e.shiftKey && e.metaKey) {
        console.log('[useQuizFlags] 📸 Cmd+Shift+3 detected');
        setScreenshotCount((prev) => {
          const newCount = prev + 1;
          submitFlag(FlagType.SCREENSHOT_ATTEMPT, {
            method: 'cmd_shift_3',
            count: newCount,
            timestamp: new Date().toISOString(),
          });
          return newCount;
        });
        return;
      }

      // Mac: Cmd + Shift + 4 (Selection)
      if (e.key === '4' && e.shiftKey && e.metaKey) {
        console.log('[useQuizFlags] 📸 Cmd+Shift+4 detected');
        setScreenshotCount((prev) => {
          const newCount = prev + 1;
          submitFlag(FlagType.SCREENSHOT_ATTEMPT, {
            method: 'cmd_shift_4',
            count: newCount,
            timestamp: new Date().toISOString(),
          });
          return newCount;
        });
        return;
      }

      // Browser shortcuts: Ctrl+Shift+S (some browsers)
      if (e.key === 'S' && e.shiftKey && (e.ctrlKey || e.metaKey)) {
        console.log('[useQuizFlags] 📸 Ctrl/Cmd+Shift+S detected');
        setScreenshotCount((prev) => {
          const newCount = prev + 1;
          submitFlag(FlagType.SCREENSHOT_ATTEMPT, {
            method: 'ctrl_shift_s',
            count: newCount,
            timestamp: new Date().toISOString(),
          });
          return newCount;
        });
        return;
      }
    };

    /**
     * Detect screen recording via MediaDevices API
     */
    const detectScreenRecording = () => {
      try {
        // Check if screen sharing is active
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          // Store original function if not already stored
          if (!(navigator.mediaDevices as any).__originalGetDisplayMedia) {
            (navigator.mediaDevices as any).__originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia.bind(navigator.mediaDevices);
          }
          
          const originalGetDisplayMedia = (navigator.mediaDevices as any).__originalGetDisplayMedia;
          
          // Override getDisplayMedia to detect screen recording
          navigator.mediaDevices.getDisplayMedia = async (constraints?: MediaStreamConstraints) => {
            console.log('[useQuizFlags] 📸 Screen recording detected via getDisplayMedia');
            setScreenshotCount((prev) => {
              const newCount = prev + 1;
              submitFlag(FlagType.SCREENSHOT_ATTEMPT, {
                method: 'screen_recording',
                count: newCount,
                timestamp: new Date().toISOString(),
              });
              return newCount;
            });
            
            // Call original function
            return originalGetDisplayMedia(constraints);
          };
        }
      } catch (error) {
        console.warn('[useQuizFlags] Could not set up screen recording detection:', error);
      }
    };

    /**
     * Detect clipboard images (screenshot may copy to clipboard)
     */
    const detectClipboardImage = async () => {
      try {
        const clipboardItems = await navigator.clipboard.read();
        for (const item of clipboardItems) {
          // Check if clipboard contains image
          if (item.types.some(type => type.startsWith('image/'))) {
            console.log('[useQuizFlags] 📸 Image detected in clipboard');
            setScreenshotCount((prev) => {
              const newCount = prev + 1;
              submitFlag(FlagType.SCREENSHOT_ATTEMPT, {
                method: 'clipboard_image',
                count: newCount,
                timestamp: new Date().toISOString(),
              });
              return newCount;
            });
            break;
          }
        }
      } catch (error) {
        // Clipboard access may be denied - this is expected
        // Only log if it's not a permission error
        if (error instanceof Error && !error.message.includes('permission')) {
          console.warn('[useQuizFlags] Clipboard check failed:', error);
        }
      }
    };

    // Set up event listeners
    document.addEventListener('keydown', handleKeyDown);
    
    // Monitor clipboard changes (periodic check)
    const clipboardCheckInterval = setInterval(() => {
      detectClipboardImage();
    }, 3000); // Check every 3 seconds

    // Set up screen recording detection
    detectScreenRecording();

    // Monitor paste events (may indicate screenshot was pasted)
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.startsWith('image/')) {
            console.log('[useQuizFlags] 📸 Image pasted from clipboard');
            setScreenshotCount((prev) => {
              const newCount = prev + 1;
              submitFlag(FlagType.SCREENSHOT_ATTEMPT, {
                method: 'paste_image',
                count: newCount,
                timestamp: new Date().toISOString(),
              });
              return newCount;
            });
            break;
          }
        }
      }
    };

    document.addEventListener('paste', handlePaste);

    return () => {
      console.log('[useQuizFlags] 🧹 Cleaning up screenshot detection listeners');
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('paste', handlePaste);
      clearInterval(clipboardCheckInterval);
      
      // Restore original getDisplayMedia if we modified it
      if (navigator.mediaDevices && (navigator.mediaDevices as any).__originalGetDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia = (navigator.mediaDevices as any).__originalGetDisplayMedia;
      }
    };
  }, [detectScreenshot, attemptId, submitFlag]);

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
    screenshotCount,
    isFullscreen,
    submitFlag,
    requestFullscreen,
    exitFullscreen,
  };
};
