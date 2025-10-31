import { useCallback } from 'react';
import { useRouter } from 'expo-router';

import { useAuthSession } from './use-auth-session';

/**
 * Custom hook for handling authentication errors
 * Automatically clears auth state and redirects to login when tokens expire
 */
export function useAuthErrorHandler() {
  const { handleTokenExpiration } = useAuthSession();
  const router = useRouter();

  const handleAuthError = useCallback((error: any): boolean => {
    // Check if it's an auth error and clear auth state if needed
    const wasAuthError = handleTokenExpiration(error);
    
    if (wasAuthError) {
      console.log('[AuthErrorHandler] Auth error detected - redirecting to login');
      // Navigate to login screen
      router.replace('/login');
      return true; // Indicates that redirect was triggered
    }
    
    return false; // Not an auth error, no redirect needed
  }, [handleTokenExpiration, router]);

  return { handleAuthError };
}
