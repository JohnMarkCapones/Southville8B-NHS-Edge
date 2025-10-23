/**
 * Frontend Progressive Rate Limiting Hook
 * 
 * Implements your exact recommendation:
 * - 5 failed attempts → 1 minute lockout
 * - 8 failed attempts → 5 minute lockout  
 * - 10 failed attempts → 15 minute lockout
 * 
 * Uses localStorage to persist attempts across page refreshes
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

interface LoginAttempt {
  count: number;
  firstAttempt: number;
  lastAttempt: number;
  lockoutUntil?: number;
  lockoutLevel: number;
}

interface RateLimitState {
  isLockedOut: boolean;
  remainingTime: number;
  lockoutLevel: number;
  attemptCount: number;
  canAttempt: boolean;
}

interface RateLimitActions {
  recordFailedAttempt: () => void;
  recordSuccessfulLogin: () => void;
  resetAttempts: () => void;
}

const LOCKOUT_LEVELS = [
  { attempts: 5, duration: 1 * 60 * 1000, name: '1 minute' },    // 5 attempts → 1 min
  { attempts: 8, duration: 5 * 60 * 1000, name: '5 minutes' },   // 8 attempts → 5 min  
  { attempts: 10, duration: 15 * 60 * 1000, name: '15 minutes' }, // 10 attempts → 15 min
];

const getStorageKey = (clientId: string) => `southville_login_attempts_${clientId}`;

export function useProgressiveRateLimit(clientId: string): RateLimitState & RateLimitActions {
  const [state, setState] = useState<RateLimitState>({
    isLockedOut: false,
    remainingTime: 0,
    lockoutLevel: 0,
    attemptCount: 0,
    canAttempt: true,
  });

  // Load attempts from localStorage on mount
  useEffect(() => {
    const loadAttempts = () => {
      try {
        const storageKey = getStorageKey(clientId);
        const stored = localStorage.getItem(storageKey);
        if (!stored) return;

        const attempt: LoginAttempt = JSON.parse(stored);
        const now = Date.now();

        // Check if lockout has expired
        if (attempt.lockoutUntil && now < attempt.lockoutUntil) {
          const remaining = Math.ceil((attempt.lockoutUntil - now) / 1000);
          setState({
            isLockedOut: true,
            remainingTime: remaining,
            lockoutLevel: attempt.lockoutLevel,
            attemptCount: attempt.count,
            canAttempt: false,
          });
        } else if (attempt.lockoutUntil && now >= attempt.lockoutUntil) {
          // Lockout expired, reset attempts
          localStorage.removeItem(storageKey);
          setState({
            isLockedOut: false,
            remainingTime: 0,
            lockoutLevel: 0,
            attemptCount: 0,
            canAttempt: true,
          });
        } else {
          // No active lockout, but show attempt count
          setState({
            isLockedOut: false,
            remainingTime: 0,
            lockoutLevel: 0,
            attemptCount: attempt.count,
            canAttempt: true,
          });
        }
      } catch (error) {
        console.error('Error loading rate limit data:', error);
        localStorage.removeItem(getStorageKey(clientId));
      }
    };

    loadAttempts();
  }, [clientId]);

  // Update countdown timer every second
  useEffect(() => {
    if (!state.isLockedOut || state.remainingTime <= 0) return;

    const timer = setInterval(() => {
      setState(prev => {
        const newRemaining = prev.remainingTime - 1;
        if (newRemaining <= 0) {
          // Lockout expired
          localStorage.removeItem(getStorageKey(clientId));
          return {
            isLockedOut: false,
            remainingTime: 0,
            lockoutLevel: 0,
            attemptCount: 0,
            canAttempt: true,
          };
        }
        return {
          ...prev,
          remainingTime: newRemaining,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [state.isLockedOut, state.remainingTime, clientId]);

  const getLockoutLevel = useCallback((attemptCount: number): number => {
    for (let i = LOCKOUT_LEVELS.length - 1; i >= 0; i--) {
      if (attemptCount >= LOCKOUT_LEVELS[i].attempts) {
        return i + 1;
      }
    }
    return 0;
  }, []);

  const recordFailedAttempt = useCallback(() => {
    const now = Date.now();
    const storageKey = getStorageKey(clientId);
    const stored = localStorage.getItem(storageKey);
    
    let attempt: LoginAttempt;
    
    if (stored) {
      attempt = JSON.parse(stored);
      attempt.count++;
      attempt.lastAttempt = now;
    } else {
      attempt = {
        count: 1,
        firstAttempt: now,
        lastAttempt: now,
        lockoutLevel: 0,
      };
    }

    // Check if we need to apply a lockout
    const newLockoutLevel = getLockoutLevel(attempt.count);
    if (newLockoutLevel > attempt.lockoutLevel) {
      const lockoutDuration = LOCKOUT_LEVELS[newLockoutLevel - 1].duration;
      attempt.lockoutUntil = now + lockoutDuration;
      attempt.lockoutLevel = newLockoutLevel;
      
      console.log(`🔒 Frontend lockout applied: Level ${newLockoutLevel} (${LOCKOUT_LEVELS[newLockoutLevel - 1].name}) for ${attempt.count} failed attempts`);
    }

    // Save to localStorage
    localStorage.setItem(storageKey, JSON.stringify(attempt));

    // Update state
    if (attempt.lockoutUntil) {
      const remaining = Math.ceil((attempt.lockoutUntil - now) / 1000);
      setState({
        isLockedOut: true,
        remainingTime: remaining,
        lockoutLevel: attempt.lockoutLevel,
        attemptCount: attempt.count,
        canAttempt: false,
      });
    } else {
      setState(prev => ({
        ...prev,
        attemptCount: attempt.count,
      }));
    }
  }, [getLockoutLevel, clientId]);

  const recordSuccessfulLogin = useCallback(() => {
    const storageKey = getStorageKey(clientId);
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const attempt: LoginAttempt = JSON.parse(stored);
      console.log(`✅ Successful login, clearing ${attempt.count} previous failed attempts`);
    }
    
    localStorage.removeItem(storageKey);
    setState({
      isLockedOut: false,
      remainingTime: 0,
      lockoutLevel: 0,
      attemptCount: 0,
      canAttempt: true,
    });
  }, [clientId]);

  const resetAttempts = useCallback(() => {
    localStorage.removeItem(getStorageKey(clientId));
    setState({
      isLockedOut: false,
      remainingTime: 0,
      lockoutLevel: 0,
      attemptCount: 0,
      canAttempt: true,
    });
  }, [clientId]);

  return {
    ...state,
    recordFailedAttempt,
    recordSuccessfulLogin,
    resetAttempts,
  };
}

/**
 * Utility function to format remaining time
 */
export function formatRemainingTime(seconds: number): string {
  if (seconds <= 0) return '0 seconds';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
  }
  
  return `${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
}

/**
 * Get lockout level info
 */
export function getLockoutLevelInfo(level: number) {
  if (level === 0) return null;
  return LOCKOUT_LEVELS[level - 1];
}
