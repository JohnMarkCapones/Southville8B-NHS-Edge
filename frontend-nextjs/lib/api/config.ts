/**
 * API Client Configuration
 * 
 * Centralized configuration for all API requests to the NestJS backend.
 * 
 * @module lib/api/config
 */

/**
 * Rate limit configuration for specific endpoint types
 */
export interface RateLimitConfig {
  limit: number;  // Maximum requests
  window: number; // Time window in milliseconds
}

/**
 * API Configuration Interface
 */
export interface ApiConfig {
  /** Base URL of the backend API (e.g., http://localhost:3004) */
  baseURL: string;
  
  /** API version (e.g., "1" for /api/v1) */
  version: string;
  
  /** Request timeout in milliseconds */
  timeout: number;
  
  /** Rate limiting configuration per endpoint type */
  rateLimits: {
    /** Global rate limit for all requests */
    global: RateLimitConfig;
    
    /** Rate limit for file upload operations */
    fileUpload: RateLimitConfig;
    
    /** Rate limit for mutation operations (POST/PUT/DELETE) */
    mutations: RateLimitConfig;
  };
  
  /** Time before token expiry to trigger refresh (milliseconds) */
  refreshBeforeExpiry: number;
}

/**
 * Main API Configuration
 * 
 * Uses environment variables with fallbacks for development
 */
export const apiConfig: ApiConfig = {
  // Base URL from environment or default to localhost:3004
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004',
  
  // API version - backend uses /api/v1
  version: '1',
  
  // 30 second timeout for all requests
  timeout: 30000,
  
  // Rate limiting configuration
  rateLimits: {
    // Global: 100 requests per minute (matches backend)
    global: {
      limit: 100,
      window: 60000, // 1 minute
    },
    
    // File uploads: 10 per minute (prevent abuse)
    fileUpload: {
      limit: 10,
      window: 60000, // 1 minute
    },
    
    // Mutations: 50 per minute (reasonable for form submissions)
    mutations: {
      limit: 50,
      window: 60000, // 1 minute
    },
  },
  
  // Refresh token 5 minutes before expiry (industry standard)
  // Supabase tokens default to 1 hour expiry
  refreshBeforeExpiry: 5 * 60 * 1000, // 5 minutes in milliseconds
} as const;

/**
 * Helper to build full API URL with versioning
 * 
 * @param endpoint - API endpoint path (e.g., "/users/me")
 * @returns Full URL (e.g., "http://localhost:3004/api/v1/users/me")
 */
export function buildApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${apiConfig.baseURL}/api/v${apiConfig.version}/${cleanEndpoint}`;
}

/**
 * Check if running in production environment
 */
export const isProduction = process.env.NODE_ENV === 'production';

/**
 * Check if running in development environment
 */
export const isDevelopment = process.env.NODE_ENV === 'development';

