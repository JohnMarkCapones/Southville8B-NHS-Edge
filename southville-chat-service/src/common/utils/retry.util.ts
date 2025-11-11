/**
 * Retry utility with exponential backoff
 * Handles network errors and temporary failures gracefully
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  timeout?: number;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 100,
  maxDelay: 2000,
  backoffMultiplier: 2,
  timeout: 10000, // 10 seconds
};

/**
 * Check if error is a retryable network error
 */
function isRetryableError(error: any): boolean {
  if (!error) return false;

  const errorMessage = error.message?.toLowerCase() || '';
  const errorName = error.name?.toLowerCase() || '';

  // Network-related errors
  if (
    errorMessage.includes('fetch failed') ||
    errorMessage.includes('network') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('econnreset') ||
    errorMessage.includes('enotfound') ||
    errorName === 'typeerror' ||
    errorName === 'networkerror'
  ) {
    return true;
  }

  // Supabase-specific retryable errors
  if (error.code === 'PGRST301' || error.code === 'PGRST116') {
    return false; // Not found errors are not retryable
  }

  // HTTP 5xx errors are retryable
  if (error.status >= 500 && error.status < 600) {
    return true;
  }

  return false;
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create a timeout promise that rejects after specified time
 */
function createTimeout(timeoutMs: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });
}

/**
 * Retry a function with exponential backoff
 * @param fn - Function to retry
 * @param options - Retry configuration options
 * @returns Result of the function
 * @throws Last error if all retries fail
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;
  let delay = opts.initialDelay;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      // Create timeout promise
      const timeoutPromise = createTimeout(opts.timeout);

      // Race between the function and timeout
      const result = await Promise.race([fn(), timeoutPromise]);

      // If we get here, the function succeeded
      return result;
    } catch (error: any) {
      lastError = error;

      // Check if error is retryable
      if (!isRetryableError(error)) {
        // Non-retryable error, throw immediately
        throw error;
      }

      // If this was the last attempt, throw the error
      if (attempt === opts.maxRetries) {
        throw error;
      }

      // Calculate delay with exponential backoff
      delay = Math.min(delay * opts.backoffMultiplier, opts.maxDelay);

      // Wait before retrying
      await sleep(delay);
    }
  }

  // Should never reach here, but TypeScript needs this
  throw lastError;
}

