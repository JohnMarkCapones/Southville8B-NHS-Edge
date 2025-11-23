/**
 * Authentication API Endpoints
 * Handles login, logout, token verification, and user profile fetching
 */

import { apiClient } from "../client";
import type {
  LoginRequest,
  LoginResponse,
  TokenVerifyResponse,
  UserProfileResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  RefreshTokenResponse,
} from "../types";

/**
 * Login with email and password
 * Sets HttpOnly cookies via server action (not directly here)
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>("/auth/login", credentials, {
    requiresAuth: false, // Login doesn't require auth
  });
}

/**
 * Verify JWT token
 * Used by middleware and session checks
 */
export async function verifyToken(token: string): Promise<TokenVerifyResponse> {
  return apiClient.post<TokenVerifyResponse>(
    "/auth/verify",
    { token },
    { requiresAuth: false }
  );
}

/**
 * Get current authenticated user profile
 * Calls GET /users/me endpoint
 */
export async function getCurrentUser(): Promise<UserProfileResponse> {
  return apiClient.get<UserProfileResponse>("/users/me");
}

/**
 * Get user profile by ID
 * Calls GET /users/:id/profile endpoint
 */
export async function getUserProfile(
  userId: string
): Promise<UserProfileResponse> {
  return apiClient.get<UserProfileResponse>(`/users/${userId}/profile`);
}

/**
 * Change user password
 * Requires authenticated user (current password must be correct)
 */
export async function changePassword(
  data: ChangePasswordRequest
): Promise<ChangePasswordResponse> {
  return apiClient.post<ChangePasswordResponse>("/auth/change-password", data);
}

/**
 * Refresh access token using refresh token
 * Called by server action to get new tokens
 */
export async function refreshToken(
  refresh_token: string
): Promise<RefreshTokenResponse> {
  return apiClient.post<RefreshTokenResponse>(
    "/auth/refresh",
    { refresh_token },
    { requiresAuth: false } // Refresh doesn't require auth (token is expired)
  );
}

/**
 * Logout (placeholder - actual logout happens via server action)
 * Backend doesn't have a logout endpoint since JWT is stateless
 * Logout is handled by clearing cookies in server action
 */
export async function logout(): Promise<void> {
  // No backend call needed - JWT is stateless
  // Actual logout happens in server action by clearing cookies
  return Promise.resolve();
}
