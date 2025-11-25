/**
 * API Client for Backend Communication
 * 
 * Provides HTTP methods for making authenticated requests to the NestJS backend.
 * Handles token management, CSRF protection, and error handling automatically.
 * 
 * @module lib/api/client
 */

'use client';

import { apiConfig, buildApiUrl } from './config';
import { ApiError, createErrorFromResponse, logError } from './errors';
import { refreshTokenAction } from '@/app/actions/auth';

/**
 * Request options extending standard RequestInit
 */
export interface ApiRequestOptions extends Omit<RequestInit, 'body' | 'method'> {
  /** Whether this request requires authentication (default: true) */
  requiresAuth?: boolean;

  /** Whether to retry on auth failure after token refresh (default: true) */
  retryOnAuthFailure?: boolean;

  /** Query parameters to append to the URL */
  params?: Record<string, any>;
}

/**
 * API Client Class
 * 
 * Centralized HTTP client for all backend API requests.
 * Automatically handles authentication, CSRF tokens, and errors.
 */
class ApiClient {
  /**
   * Get authentication token from cookie (client-side only)
   * 
   * @returns JWT token or null if not found
   */
  private getTokenFromCookie(): string | null {
    // Only works in browser environment
    if (typeof window === 'undefined') {
      return null;
    }

    const match = document.cookie.match(/sb-access-token=([^;]+)/);
    const token = match ? match[1] : null;
    
    if (process.env.NODE_ENV === 'development') {
      if (token) {
        console.log('[ApiClient] ✅ Token found in cookie');
      } else {
        console.log('[ApiClient] ❌ No token found in cookie');
        console.log('[ApiClient] Available cookies:', document.cookie);
      }
    }
    
    return token;
  }

  /**
   * Get CSRF token from cookie (client-side only)
   * 
   * @returns CSRF token or null if not found
   */
  private getCsrfTokenFromCookie(): string | null {
    // Only works in browser environment
    if (typeof window === 'undefined') {
      return null;
    }

    const match = document.cookie.match(/csrf-token=([^;]+)/);
    return match ? match[1] : null;
  }

  /**
   * Build request headers with auth and CSRF tokens
   * 
   * @param customHeaders - Custom headers to merge
   * @param requiresAuth - Whether to include auth token
   * @param includeCSRF - Whether to include CSRF token
   * @returns Headers object
   */
  private buildHeaders(
    customHeaders?: HeadersInit,
    requiresAuth = true,
    includeCSRF = false
  ): Headers {
    const headers = new Headers(customHeaders);

    // Set Content-Type if not already set (and not FormData)
    if (!headers.has('Content-Type') && !headers.has('content-type')) {
      headers.set('Content-Type', 'application/json');
    }

    // Add Authorization header
    if (requiresAuth) {
      const token = this.getTokenFromCookie();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    // Add CSRF token for mutations
    if (includeCSRF) {
      const csrfToken = this.getCsrfTokenFromCookie();
      if (csrfToken) {
        headers.set('x-csrf-token', csrfToken);
      } else {
        console.warn('[API Client] CSRF token not found for mutation request');
      }
    }

    return headers;
  }

  /**
   * Handle fetch response
   * 
   * @param response - Fetch Response object
   * @returns Parsed JSON data
   * @throws ApiError if response is not ok
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    console.log('[API CLIENT] Response received:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      url: response.url
    });
    
    // If response is not ok, create and throw ApiError
    if (!response.ok) {
      console.error('[API CLIENT] Response not ok:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });
      const error = await createErrorFromResponse(response);
      throw error;
    }

    // Handle 204 No Content
    if (response.status === 204) {
      console.log('[API CLIENT] 204 No Content response');
      return null as T;
    }

    // Check if response has content before parsing
    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');

    // If no content-type or content-length is 0, return null for successful responses
    if (!contentType || contentLength === '0') {
      console.log('[API CLIENT] Empty response body (no content-type or content-length=0)');
      return null as T;
    }

    // Parse and return JSON
    try {
      const text = await response.text();
      // If response is empty string, return null
      if (!text || text.trim() === '') {
        console.log('[API CLIENT] Empty response body (empty text)');
        return null as T;
      }

      const data = JSON.parse(text);
      console.log('[API CLIENT] JSON parsed successfully:', {
        hasData: !!data,
        dataType: typeof data,
        dataKeys: data && typeof data === 'object' ? Object.keys(data) : 'N/A'
      });
      return data;
    } catch (error) {
      console.error('[API CLIENT] Failed to parse JSON:', error);
      throw new ApiError(
        'Failed to parse response JSON',
        response.status,
        { originalError: error }
      );
    }
  }

  /**
   * Make HTTP request to backend API
   * 
   * @param endpoint - API endpoint (e.g., "/users/me")
   * @param options - Request options
   * @returns Promise with parsed response data
   * @throws ApiError on request failure
   */
  async request<T>(
    endpoint: string,
    options: ApiRequestOptions & { body?: any; method?: string } = {}
  ): Promise<T> {
    const {
      requiresAuth = true,
      retryOnAuthFailure = true,
      body,
      method = 'GET',
      params,
      ...fetchOptions
    } = options;

    // Determine if this is a mutation (needs CSRF)
    const isMutation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase());

    // Build full URL
    let url = buildApiUrl(endpoint);
    
    console.log('[API CLIENT] Making request:', {
      method,
      endpoint,
      url,
      requiresAuth,
      isMutation
    });

    // Append query parameters if present
    if (params && Object.keys(params).length > 0) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
      const queryString = queryParams.toString();
      if (queryString) {
        url = `${url}?${queryString}`;
      }
    }

    // Build headers
    const headers = this.buildHeaders(fetchOptions.headers, requiresAuth, isMutation);

    // Prepare fetch options
    const finalOptions: RequestInit = {
      ...fetchOptions,
      method,
      headers,
      credentials: 'include', // Include cookies in requests
      signal: AbortSignal.timeout(apiConfig.timeout),
    };

    // Add body if present
    if (body !== undefined) {
      if (body instanceof FormData) {
        // For FormData, remove Content-Type header (browser will set it with boundary)
        headers.delete('Content-Type');
        finalOptions.body = body;
      } else {
        // For JSON, stringify
        finalOptions.body = JSON.stringify(body);
      }
    } else {
      // If no body, remove Content-Type header (e.g., for DELETE requests)
      headers.delete('Content-Type');
    }

    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('[API Client] Making request:', {
        method,
        url,
        params,
        requiresAuth,
        hasToken: requiresAuth ? !!this.getTokenFromCookie() : 'N/A',
        hasCsrf: isMutation ? !!this.getCsrfTokenFromCookie() : 'N/A',
      });
    }

    try {
      const response = await fetch(url, finalOptions);
      return await this.handleResponse<T>(response);
    } catch (error) {
      // Enhanced error logging - handle different error types
      console.error('[API Client] ===== Request Failed =====');
      console.error('Endpoint:', endpoint);
      console.error('URL:', url);
      console.error('Method:', method);
      console.error('Raw error:', error);
      
      // Try to extract more info
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      if (error instanceof ApiError) {
        console.error('API Error status:', error.status);
        console.error('API Error data:', error.data);
      }
      
      // Check for network errors
      if (error instanceof TypeError) {
        console.error('⚠️ Network Error - Possible causes:');
        console.error('  1. Backend not running');
        console.error('  2. Wrong backend URL/port');
        console.error('  3. CORS issue');
        console.error('  4. Network connectivity problem');
      }
      
      // Check for timeout
      if (error?.name === 'AbortError' || error?.name === 'TimeoutError') {
        console.error('⏱️ Request Timeout - Backend took too long to respond');
      }
      
      console.error('=====================================');

      // Handle 401 Unauthorized (token expired or invalid)
      if (error instanceof ApiError && error.status === 401 && retryOnAuthFailure) {
        if (typeof window !== 'undefined') {
          // Don't process if we're on a public page
          const currentPath = window.location.pathname;
          const isPublicPage = currentPath === '/' ||
                               currentPath.startsWith('/guess') ||
                               currentPath.startsWith('/_next');

          if (!isPublicPage) {
            console.log('[API Client] 401 Unauthorized - attempting token refresh');

            try {
              // Attempt to refresh the token
              const refreshResult = await refreshTokenAction();

              if (refreshResult.success) {
                console.log('[API Client] Token refreshed successfully - retrying request');

                // Retry the original request with the new token
                // Set retryOnAuthFailure to false to prevent infinite loop
                return this.request<T>(endpoint, {
                  ...options,
                  body,
                  method,
                  params,
                  retryOnAuthFailure: false,
                });
              } else {
                console.log('[API Client] Token refresh failed:', refreshResult.error);
              }
            } catch (refreshError) {
              console.error('[API Client] Token refresh error:', refreshError);
            }

            // If refresh failed, redirect to login
            console.log('[API Client] Redirecting to portal after failed refresh');

            // Determine role based on the current path
            let role = 'student'; // default
            if (currentPath.startsWith('/teacher')) {
              role = 'teacher';
            } else if (currentPath.startsWith('/admin') || currentPath.startsWith('/superadmin')) {
              role = 'admin';
            }

            window.location.href = `/guess/portal?role=${role}`;
          }
        }
      }

      // Re-throw the error
      throw error;
    }
  }

  /**
   * Make GET request
   * 
   * @param endpoint - API endpoint
   * @param options - Request options
   * @returns Promise with response data
   * 
   * @example
   * ```typescript
   * const user = await apiClient.get<User>('/users/me');
   * ```
   */
  async get<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * Make POST request
   * 
   * @param endpoint - API endpoint
   * @param data - Request body data
   * @param options - Request options
   * @returns Promise with response data
   * 
   * @example
   * ```typescript
   * const quiz = await apiClient.post<Quiz>('/quiz', { title: 'Math Quiz' });
   * ```
   */
  async post<T>(endpoint: string, data?: unknown, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body: data });
  }

  /**
   * Make PUT request
   * 
   * @param endpoint - API endpoint
   * @param data - Request body data
   * @param options - Request options
   * @returns Promise with response data
   * 
   * @example
   * ```typescript
   * const updated = await apiClient.put<User>('/users/me', { name: 'John' });
   * ```
   */
  async put<T>(endpoint: string, data?: unknown, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body: data });
  }

  /**
   * Make PATCH request
   * 
   * @param endpoint - API endpoint
   * @param data - Request body data (partial update)
   * @param options - Request options
   * @returns Promise with response data
   * 
   * @example
   * ```typescript
   * const updated = await apiClient.patch<User>('/users/me', { email: 'new@example.com' });
   * ```
   */
  async patch<T>(endpoint: string, data?: unknown, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body: data });
  }

  /**
   * Make DELETE request
   * 
   * @param endpoint - API endpoint
   * @param options - Request options
   * @returns Promise with response data
   * 
   * @example
   * ```typescript
   * await apiClient.delete('/quiz/123');
   * ```
   */
  async delete<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Upload file to backend
   * 
   * @param endpoint - API endpoint
   * @param file - File to upload
   * @param additionalData - Additional form fields
   * @param options - Request options
   * @returns Promise with response data
   * 
   * @example
   * ```typescript
   * const module = await apiClient.uploadFile<Module>(
   *   '/modules',
   *   fileObject,
   *   { title: 'Lesson 1', description: 'Introduction' }
   * );
   * ```
   */
  async uploadFile<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, string>,
    options?: ApiRequestOptions
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    // Add additional fields to form data
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: formData,
    });
  }
}

/**
 * Singleton API client instance
 * 
 * Use this instance for all API requests throughout the application.
 * 
 * @example
 * ```typescript
 * import { apiClient } from '@/lib/api/client';
 * 
 * const user = await apiClient.get<User>('/users/me');
 * ```
 */
export const apiClient = new ApiClient();

