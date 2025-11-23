/**
 * Authentication Server Actions
 * 
 * These server-side functions handle:
 * - Setting/clearing HttpOnly cookies securely
 * - Session management
 * - Token refresh
 * 
 * Server Actions are the ONLY way to set HttpOnly cookies in Next.js 15 App Router
 * 
 * NOTE: Server Actions run on the server (Node.js), so we use direct fetch
 * instead of the client-side apiClient which uses document.cookie
 */

'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { LoginRequest, LoginResponse, TokenVerifyResponse } from '@/lib/api/types';

/**
 * Enhanced Cookie configuration for security
 * 
 * Implements your recommendations:
 * - HttpOnly for sensitive tokens (refresh token)
 * - Secure flag for HTTPS only in production
 * - SameSite strict for CSRF protection
 * - Session timeout: 3 hours (exceeds JWT expiry for safety margin)
 */
const COOKIE_OPTIONS = {
  httpOnly: true, // Prevent JavaScript access (XSS protection)
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'strict' as const, // CSRF protection
  path: '/', // Available site-wide
  maxAge: 60 * 60 * 3, // 3 hours (longer than JWT expiry ~2.78 hours)
};

const ACCESS_TOKEN_OPTIONS = {
  ...COOKIE_OPTIONS,
  httpOnly: false, // Client needs to read for Authorization header
  maxAge: 60 * 60 * 3, // 3 hours (exceeds JWT expiry for safety margin)
};

const REFRESH_TOKEN_OPTIONS = {
  ...COOKIE_OPTIONS,
  httpOnly: true, // Maximum security for refresh token
  maxAge: 60 * 60 * 24 * 7, // 7 days (longer for refresh)
};

/**
 * Login Action
 * 
 * Authenticates user and sets HttpOnly cookies
 * Returns user data and success/error status
 */
export async function loginAction(credentials: LoginRequest) {
  try {
    // Call backend login endpoint directly using fetch (server-side)
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004';
    const apiUrl = `${backendUrl}/api/v1/auth/login`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
      return {
        success: false,
        error: errorData.message || 'Invalid email or password',
      };
    }

    const data: LoginResponse = await response.json();

    if (!data.success) {
      return {
        success: false,
        error: 'Login failed. Please check your credentials.',
      };
    }

    // Get cookie store
    const cookieStore = await cookies();

    // Set cookies for tokens with enhanced security
    // Access token: NOT HttpOnly so client can send it in Authorization header
    // Still secure with: CSRF protection, rate limiting, secure flag in prod, sameSite strict
    cookieStore.set('sb-access-token', data.session.access_token, ACCESS_TOKEN_OPTIONS);
    
    // Refresh token: KEEP HttpOnly for maximum security (only used server-side)
    cookieStore.set('sb-refresh-token', data.session.refresh_token, REFRESH_TOKEN_OPTIONS);
    
    // Store token expiry (2 hours session timeout)
    cookieStore.set('sb-token-expires', data.session.expires_at.toString(), {
      ...ACCESS_TOKEN_OPTIONS,
      httpOnly: false, // Client needs to read this for token refresh logic
    });
    
    // Store session start time for timeout warnings
    cookieStore.set('sb-session-start', Date.now().toString(), {
      ...ACCESS_TOKEN_OPTIONS,
      httpOnly: false, // Client needs to read this for timeout warnings
    });

    // Store user role for client-side routing (not sensitive)
    cookieStore.set('user-role', data.user.role, {
      ...COOKIE_OPTIONS,
      httpOnly: false, // Client needs to read this for routing
    });

    return {
      success: true,
      user: data.user,
      role: data.user.role,
    };
  } catch (error: any) {
    console.error('[loginAction] Error:', error);
    
    return {
      success: false,
      error: error.message || 'Login failed. Please try again.',
    };
  }
}

/**
 * Logout Action
 * 
 * Clears all authentication cookies
 */
export async function logoutAction() {
  try {
    const cookieStore = await cookies();

    // Clear all auth-related cookies
    cookieStore.delete('sb-access-token');
    cookieStore.delete('sb-refresh-token');
    cookieStore.delete('sb-token-expires');
    cookieStore.delete('user-role');

    return { success: true };
  } catch (error: any) {
    console.error('[logoutAction] Error:', error);
    return {
      success: false,
      error: error.message || 'Logout failed',
    };
  }
}

/**
 * Get Session Action
 * 
 * Retrieves current session from cookies and verifies token
 */
export async function getSessionAction() {
  try {
    const cookieStore = await cookies();
    
    const accessToken = cookieStore.get('sb-access-token')?.value;
    const refreshToken = cookieStore.get('sb-refresh-token')?.value;
    const expiresAt = cookieStore.get('sb-token-expires')?.value;
    const userRole = cookieStore.get('user-role')?.value;

    if (!accessToken) {
      return { 
        success: false, 
        error: 'No active session',
        isAuthenticated: false 
      };
    }

    // Verify token with backend directly
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004';
      const apiUrl = `${backendUrl}/api/v1/auth/verify`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: accessToken }),
      });

      if (!response.ok) {
        // Token invalid - clear cookies
        await logoutAction();
        return { 
          success: false, 
          error: 'Invalid token',
          isAuthenticated: false 
        };
      }

      const verifyResponse: TokenVerifyResponse = await response.json();
      
      if (!verifyResponse.success) {
        // Token invalid - clear cookies
        await logoutAction();
        return { 
          success: false, 
          error: 'Invalid token',
          isAuthenticated: false 
        };
      }

      return {
        success: true,
        isAuthenticated: true,
        user: verifyResponse.user,
        expiresAt: expiresAt ? parseInt(expiresAt) : undefined,
      };
    } catch (verifyError) {
      // Token verification failed
      console.error('[getSessionAction] Token verification failed:', verifyError);
      await logoutAction();
      return { 
        success: false, 
        error: 'Token verification failed',
        isAuthenticated: false 
      };
    }
  } catch (error: any) {
    console.error('[getSessionAction] Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get session',
      isAuthenticated: false
    };
  }
}

/**
 * Refresh Token Action
 *
 * Refreshes access token using refresh token
 * Updates all cookies with new tokens
 */
export async function refreshTokenAction() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('sb-refresh-token')?.value;

    if (!refreshToken) {
      return {
        success: false,
        error: 'No refresh token available',
      };
    }

    // Call backend refresh endpoint
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004';
    const apiUrl = `${backendUrl}/api/v1/auth/refresh`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Token refresh failed' }));
      console.error('[refreshTokenAction] Refresh failed:', errorData);

      // If refresh token is invalid, clear all cookies
      if (response.status === 401) {
        await logoutAction();
      }

      return {
        success: false,
        error: errorData.message || 'Token refresh failed',
      };
    }

    const data = await response.json();

    if (!data.success || !data.session) {
      return {
        success: false,
        error: 'Invalid refresh response',
      };
    }

    // Update cookies with new tokens
    cookieStore.set('sb-access-token', data.session.access_token, ACCESS_TOKEN_OPTIONS);
    cookieStore.set('sb-refresh-token', data.session.refresh_token, REFRESH_TOKEN_OPTIONS);
    cookieStore.set('sb-token-expires', data.session.expires_at.toString(), {
      ...ACCESS_TOKEN_OPTIONS,
      httpOnly: false,
    });

    // Update session start time
    cookieStore.set('sb-session-start', Date.now().toString(), {
      ...ACCESS_TOKEN_OPTIONS,
      httpOnly: false,
    });

    console.log('[refreshTokenAction] Token refreshed successfully');

    return {
      success: true,
      session: data.session,
    };
  } catch (error: any) {
    console.error('[refreshTokenAction] Error:', error);
    return {
      success: false,
      error: error.message || 'Token refresh failed',
    };
  }
}

