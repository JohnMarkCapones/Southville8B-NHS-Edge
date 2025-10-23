/**
 * API Error Handling System
 * 
 * Provides structured error handling for all API requests with
 * type detection and user-friendly messaging.
 * 
 * @module lib/api/errors
 */

/**
 * Custom API Error Class
 * 
 * Extends the native Error class to include HTTP status codes
 * and structured error data from the backend.
 * 
 * @example
 * ```typescript
 * throw new ApiError('User not found', 404, { userId: '123' });
 * ```
 */
export class ApiError extends Error {
  /**
   * @param message - Error message
   * @param status - HTTP status code
   * @param data - Optional additional error data from backend
   */
  constructor(
    message: string,
    public readonly status: number,
    public readonly data?: any
  ) {
    super(message);
    this.name = 'ApiError';
    
    // Maintains proper stack trace for where error was thrown (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Check if error is an authentication/authorization error
   * @returns true if status is 401 (Unauthorized) or 403 (Forbidden)
   */
  get isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  /**
   * Check if error is a validation error
   * @returns true if status is 400 (Bad Request) or 422 (Unprocessable Entity)
   */
  get isValidationError(): boolean {
    return this.status === 400 || this.status === 422;
  }

  /**
   * Check if error is a server error
   * @returns true if status is 5xx
   */
  get isServerError(): boolean {
    return this.status >= 500 && this.status < 600;
  }

  /**
   * Check if error is a rate limit error
   * @returns true if status is 429 (Too Many Requests)
   */
  get isRateLimitError(): boolean {
    return this.status === 429;
  }

  /**
   * Check if error is a not found error
   * @returns true if status is 404
   */
  get isNotFoundError(): boolean {
    return this.status === 404;
  }

  /**
   * Check if error is a conflict error
   * @returns true if status is 409 (Conflict)
   */
  get isConflictError(): boolean {
    return this.status === 409;
  }

  /**
   * Get user-friendly error message
   * 
   * Converts technical error messages into user-friendly text
   * suitable for displaying in the UI.
   * 
   * @returns User-friendly error message
   */
  get userMessage(): string {
    // Check for specific error types first
    if (this.isAuthError) {
      if (this.status === 401) {
        return 'Please log in to continue';
      }
      return 'You do not have permission to perform this action';
    }

    if (this.isValidationError) {
      // Use backend message if available, otherwise generic
      return this.data?.message || 'Invalid input. Please check your data and try again.';
    }

    if (this.isRateLimitError) {
      return 'Too many requests. Please wait a moment before trying again.';
    }

    if (this.isNotFoundError) {
      return this.data?.message || 'The requested resource was not found.';
    }

    if (this.isConflictError) {
      return this.data?.message || 'This action conflicts with existing data.';
    }

    if (this.isServerError) {
      return 'A server error occurred. Please try again later.';
    }

    // Default: use original message or generic error
    return this.message || 'An unexpected error occurred. Please try again.';
  }

  /**
   * Convert error to JSON for logging
   */
  toJSON(): object {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      data: this.data,
      stack: this.stack,
    };
  }
}

/**
 * Error type guard to check if an error is an ApiError
 * 
 * @param error - Any error object
 * @returns true if error is an instance of ApiError
 * 
 * @example
 * ```typescript
 * if (isApiError(error)) {
 *   console.log(error.status);
 * }
 * ```
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Extract user-friendly message from any error
 * 
 * Handles ApiError, native Error, and unknown error types
 * 
 * @param error - Any error object
 * @returns User-friendly error message
 * 
 * @example
 * ```typescript
 * try {
 *   await apiClient.get('/users/me');
 * } catch (error) {
 *   toast.error(getErrorMessage(error));
 * }
 * ```
 */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.userMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred';
}

/**
 * Log error to console with structured format
 * 
 * Only logs in development mode to avoid exposing errors in production
 * 
 * @param error - Error to log
 * @param context - Optional context string
 */
export function logError(error: unknown, context?: string): void {
  // Only log in development
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const prefix = context ? `[${context}]` : '[API Error]';

  if (isApiError(error)) {
    console.error(prefix, {
      message: error.message,
      status: error.status,
      data: error.data,
      userMessage: error.userMessage,
    });
  } else if (error instanceof Error) {
    console.error(prefix, error.message, error.stack);
  } else {
    console.error(prefix, error);
  }
}

/**
 * Create ApiError from fetch Response
 * 
 * Attempts to parse JSON error from response, falls back to status text
 * 
 * @param response - Fetch Response object
 * @returns Promise<ApiError>
 */
export async function createErrorFromResponse(response: Response): Promise<ApiError> {
  let errorData: any;
  
  try {
    errorData = await response.json();
  } catch {
    // If JSON parsing fails, use status text
    errorData = { message: response.statusText };
  }

  const message = errorData.message || errorData.error || response.statusText || 'Request failed';

  return new ApiError(message, response.status, errorData);
}

