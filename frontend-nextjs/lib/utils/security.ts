/**
 * Security Utilities
 *
 * Functions for quiz security features like tab detection, copy-paste prevention, etc.
 *
 * @module lib/utils/security
 */

'use client';

// ============================================================================
// TAB SWITCH DETECTION
// ============================================================================

/**
 * Tab switch detection options
 */
export interface TabSwitchOptions {
  onTabSwitch: () => void;
}

/**
 * Setup tab switch detection
 *
 * Detects when user switches away from the quiz tab.
 *
 * @param options - Configuration options with onTabSwitch callback
 * @returns Cleanup function
 *
 * @example
 * ```typescript
 * const cleanup = setupTabSwitchDetection({
 *   onTabSwitch: () => {
 *     console.log('User switched tabs!');
 *     // Log to backend, increment counter, etc.
 *   }
 * });
 *
 * // Later, cleanup
 * cleanup();
 * ```
 */
export const setupTabSwitchDetection = (
  options: TabSwitchOptions
): (() => void) => {
  const { onTabSwitch } = options;

  const handleVisibilityChange = () => {
    if (document.hidden) {
      onTabSwitch();
    }
  };

  const handleBlur = () => {
    onTabSwitch();
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('blur', handleBlur);

  // Return cleanup function
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('blur', handleBlur);
  };
};

// ============================================================================
// COPY-PASTE PREVENTION
// ============================================================================

/**
 * Setup copy-paste prevention
 *
 * Prevents users from copying text or pasting answers.
 *
 * @param onAttempt - Optional callback when copy/paste is attempted
 * @returns Cleanup function
 *
 * @example
 * ```typescript
 * const cleanup = setupCopyPastePrevention((action) => {
 *   console.log(`User attempted to ${action}`);
 * });
 * ```
 */
export const setupCopyPastePrevention = (
  onAttempt?: (action: 'copy' | 'paste' | 'cut') => void
): (() => void) => {
  const preventDefault = (e: ClipboardEvent, action: 'copy' | 'paste' | 'cut') => {
    e.preventDefault();
    if (onAttempt) {
      onAttempt(action);
    }
  };

  const handleCopy = (e: ClipboardEvent) => preventDefault(e, 'copy');
  const handlePaste = (e: ClipboardEvent) => preventDefault(e, 'paste');
  const handleCut = (e: ClipboardEvent) => preventDefault(e, 'cut');

  document.addEventListener('copy', handleCopy);
  document.addEventListener('paste', handlePaste);
  document.addEventListener('cut', handleCut);

  // Also prevent right-click context menu
  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
  };
  document.addEventListener('contextmenu', handleContextMenu);

  // Return cleanup function
  return () => {
    document.removeEventListener('copy', handleCopy);
    document.removeEventListener('paste', handlePaste);
    document.removeEventListener('cut', handleCut);
    document.removeEventListener('contextmenu', handleContextMenu);
  };
};

// ============================================================================
// SCREENSHOT DETECTION
// ============================================================================

/**
 * Setup screenshot detection (limited)
 *
 * Note: True screenshot detection is not fully possible in browsers,
 * but we can detect some common methods.
 *
 * @param callback - Function to call when screenshot attempt detected
 * @returns Cleanup function
 */
export const setupScreenshotDetection = (
  callback: () => void
): (() => void) => {
  // Detect Print Screen key
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'PrintScreen' || e.keyCode === 44) {
      callback();
    }

    // Detect common screenshot shortcuts
    if (
      (e.metaKey || e.ctrlKey) &&
      (e.shiftKey && (e.key === 'S' || e.key === 's' || e.keyCode === 83))
    ) {
      callback();
    }
  };

  document.addEventListener('keydown', handleKeyDown);

  // Return cleanup function
  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
};

// ============================================================================
// FULLSCREEN MODE
// ============================================================================

/**
 * Enter fullscreen mode
 *
 * Puts the quiz in fullscreen to minimize distractions.
 *
 * @returns Promise that resolves when fullscreen is entered
 *
 * @example
 * ```typescript
 * await enterFullscreen();
 * ```
 */
export const enterFullscreen = async (): Promise<void> => {
  const element = document.documentElement;

  try {
    if (element.requestFullscreen) {
      await element.requestFullscreen();
    } else if ((element as any).webkitRequestFullscreen) {
      await (element as any).webkitRequestFullscreen();
    } else if ((element as any).mozRequestFullScreen) {
      await (element as any).mozRequestFullScreen();
    } else if ((element as any).msRequestFullscreen) {
      await (element as any).msRequestFullscreen();
    }
  } catch (error) {
    console.error('Failed to enter fullscreen:', error);
    throw error;
  }
};

/**
 * Exit fullscreen mode
 *
 * @returns Promise that resolves when fullscreen is exited
 */
export const exitFullscreen = async (): Promise<void> => {
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
    console.error('Failed to exit fullscreen:', error);
    throw error;
  }
};

/**
 * Check if currently in fullscreen
 *
 * @returns True if in fullscreen mode
 */
export const isFullscreen = (): boolean => {
  return !!(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement
  );
};

/**
 * Setup fullscreen exit detection
 *
 * Detects when user exits fullscreen mode.
 *
 * @param callback - Function to call when fullscreen is exited
 * @returns Cleanup function
 */
export const setupFullscreenExitDetection = (
  callback: () => void
): (() => void) => {
  const handleFullscreenChange = () => {
    if (!isFullscreen()) {
      callback();
    }
  };

  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.addEventListener('mozfullscreenchange', handleFullscreenChange);
  document.addEventListener('MSFullscreenChange', handleFullscreenChange);

  // Return cleanup function
  return () => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
    document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
  };
};

// ============================================================================
// KEYBOARD SHORTCUTS PREVENTION
// ============================================================================

/**
 * Disable common keyboard shortcuts
 *
 * Prevents shortcuts like Ctrl+F (find), Ctrl+A (select all), etc.
 *
 * @param onAttempt - Optional callback when shortcut is attempted
 * @returns Cleanup function
 */
export const disableKeyboardShortcuts = (
  onAttempt?: (shortcut: string) => void
): (() => void) => {
  const handleKeyDown = (e: KeyboardEvent) => {
    const ctrl = e.ctrlKey || e.metaKey;

    // Prevent common shortcuts
    if (ctrl) {
      const key = e.key.toLowerCase();

      // Prevent: Ctrl+F (find), Ctrl+A (select all), Ctrl+P (print),
      // Ctrl+S (save), Ctrl+U (view source), Ctrl+Shift+I (dev tools)
      if (
        key === 'f' ||
        key === 'a' ||
        key === 'p' ||
        key === 's' ||
        key === 'u' ||
        (e.shiftKey && key === 'i')
      ) {
        e.preventDefault();
        if (onAttempt) {
          onAttempt(`Ctrl+${key.toUpperCase()}`);
        }
      }
    }

    // Prevent F12 (dev tools)
    if (e.keyCode === 123) {
      e.preventDefault();
      if (onAttempt) {
        onAttempt('F12');
      }
    }
  };

  document.addEventListener('keydown', handleKeyDown);

  // Return cleanup function
  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
};

// ============================================================================
// IDLE DETECTION
// ============================================================================

/**
 * Setup idle detection
 *
 * Detects when user is inactive for a specified duration.
 *
 * @param timeoutMs - Timeout in milliseconds
 * @param callback - Function to call when user becomes idle
 * @returns Cleanup function
 *
 * @example
 * ```typescript
 * const cleanup = setupIdleDetection(5 * 60 * 1000, () => {
 *   console.log('User has been idle for 5 minutes');
 * });
 * ```
 */
export const setupIdleDetection = (
  timeoutMs: number,
  callback: () => void
): (() => void) => {
  let idleTimer: NodeJS.Timeout | null = null;

  const resetIdleTimer = () => {
    if (idleTimer) {
      clearTimeout(idleTimer);
    }
    idleTimer = setTimeout(callback, timeoutMs);
  };

  // Events that indicate user activity
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

  events.forEach((event) => {
    document.addEventListener(event, resetIdleTimer);
  });

  // Start the timer
  resetIdleTimer();

  // Return cleanup function
  return () => {
    if (idleTimer) {
      clearTimeout(idleTimer);
    }
    events.forEach((event) => {
      document.removeEventListener(event, resetIdleTimer);
    });
  };
};

// ============================================================================
// LOCKDOWN MODE
// ============================================================================

/**
 * Setup lockdown mode
 *
 * Enables all security features at once.
 *
 * @param options - Security options
 * @param callbacks - Callback functions for various events
 * @returns Cleanup function
 *
 * @example
 * ```typescript
 * const cleanup = setupLockdownMode(
 *   {
 *     preventCopyPaste: true,
 *     detectTabSwitch: true,
 *     disableShortcuts: true,
 *     requireFullscreen: true,
 *   },
 *   {
 *     onTabSwitch: () => console.log('Tab switched!'),
 *     onCopyPaste: (action) => console.log(`Attempted ${action}`),
 *   }
 * );
 * ```
 */
export const setupLockdownMode = (
  options: {
    preventCopyPaste?: boolean;
    detectTabSwitch?: boolean;
    detectScreenshot?: boolean;
    disableShortcuts?: boolean;
    requireFullscreen?: boolean;
    idleTimeoutMs?: number;
  },
  callbacks: {
    onTabSwitch?: () => void;
    onCopyPaste?: (action: 'copy' | 'paste' | 'cut') => void;
    onScreenshot?: () => void;
    onShortcut?: (shortcut: string) => void;
    onFullscreenExit?: () => void;
    onIdle?: () => void;
  }
): (() => void) => {
  const cleanupFunctions: Array<() => void> = [];

  // Setup each security feature
  if (options.preventCopyPaste && callbacks.onCopyPaste) {
    cleanupFunctions.push(setupCopyPastePrevention(callbacks.onCopyPaste));
  }

  if (options.detectTabSwitch && callbacks.onTabSwitch) {
    cleanupFunctions.push(setupTabSwitchDetection(callbacks.onTabSwitch));
  }

  if (options.detectScreenshot && callbacks.onScreenshot) {
    cleanupFunctions.push(setupScreenshotDetection(callbacks.onScreenshot));
  }

  if (options.disableShortcuts && callbacks.onShortcut) {
    cleanupFunctions.push(disableKeyboardShortcuts(callbacks.onShortcut));
  }

  if (options.requireFullscreen && callbacks.onFullscreenExit) {
    enterFullscreen().catch(console.error);
    cleanupFunctions.push(setupFullscreenExitDetection(callbacks.onFullscreenExit));
  }

  if (options.idleTimeoutMs && callbacks.onIdle) {
    cleanupFunctions.push(setupIdleDetection(options.idleTimeoutMs, callbacks.onIdle));
  }

  // Return combined cleanup function
  return () => {
    cleanupFunctions.forEach((cleanup) => cleanup());
    if (options.requireFullscreen && isFullscreen()) {
      exitFullscreen().catch(console.error);
    }
  };
};
