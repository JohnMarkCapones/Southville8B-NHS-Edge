/**
 * Authentication API Types
 * Aligned with backend auth controller responses
 */

// Login Request DTO
export interface LoginRequest {
  email: string;
  password: string;
}

// Login Response from backend
export interface LoginResponse {
  success: boolean;
  user: AuthUser;
  session: AuthSession;
  message: string;
}

// Auth User from backend (from Supabase JWT)
export interface AuthUser {
  id: string;
  email: string;
  role: "Admin" | "Teacher" | "Student";
  created_at: string;
  email_confirmed_at?: string;
  user_metadata?: Record<string, any>;
}

// Auth Session from backend
export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at: number; // Unix timestamp in seconds
}

// Token Verification Response
export interface TokenVerifyResponse {
  success: boolean;
  user: AuthUser;
  message: string;
}

// Change Password Request
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Change Password Response
export interface ChangePasswordResponse {
  message: string;
}

// Refresh Token Response
export interface RefreshTokenResponse {
  success: boolean;
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number; // Unix timestamp in seconds
    expires_in: number; // Seconds until expiry
    token_type: string;
  };
  message: string;
}
