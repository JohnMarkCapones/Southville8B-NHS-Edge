/**
 * ========================================
 * ANNOUNCEMENT DATE VALIDATION UTILITIES
 * ========================================
 * Validation functions for announcement dates
 */

export interface DateValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
  severity?: 'error' | 'warning' | 'info';
}

export interface DateDurationInfo {
  days: number;
  hours: number;
  minutes: number;
  totalHours: number;
  humanReadable: string;
}

/**
 * Validate expiration date for announcements
 *
 * Rules:
 * - Must be in the future (at least 1 hour from now)
 * - Cannot be more than 1 year from now
 * - Warning if less than 24 hours from now
 *
 * @param expirationDate - The expiration date to validate
 * @param publishDate - Optional publish/schedule date (defaults to now)
 * @returns Validation result with error/warning messages
 */
export function validateExpirationDate(
  expirationDate: string | Date | null | undefined,
  publishDate?: string | Date | null
): DateValidationResult {
  // If no expiration date, it's optional - valid
  if (!expirationDate) {
    return { isValid: true };
  }

  const now = new Date();
  const expiration = new Date(expirationDate);
  const publish = publishDate ? new Date(publishDate) : now;

  // Check if date is valid
  if (isNaN(expiration.getTime())) {
    return {
      isValid: false,
      error: 'Invalid expiration date format',
      severity: 'error',
    };
  }

  // HARD VALIDATION: Expiration must be after publish/current time
  const minimumExpiration = new Date(publish.getTime() + 60 * 60 * 1000); // 1 hour from publish
  if (expiration <= minimumExpiration) {
    const isPast = expiration <= now;
    return {
      isValid: false,
      error: isPast
        ? 'Expiration date is in the past. The announcement would be hidden immediately.'
        : 'Expiration date must be at least 1 hour from now.',
      severity: 'error',
    };
  }

  // HARD VALIDATION: Cannot be more than 1 year from now
  const oneYearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
  if (expiration > oneYearFromNow) {
    return {
      isValid: false,
      error: 'Expiration date cannot be more than 1 year from now',
      severity: 'error',
    };
  }

  // SOFT VALIDATION: Warning if less than 24 hours
  const twentyFourHoursFromPublish = new Date(publish.getTime() + 24 * 60 * 60 * 1000);
  if (expiration < twentyFourHoursFromPublish) {
    const duration = calculateDuration(publish, expiration);
    return {
      isValid: true,
      warning: `Announcement will expire very soon (in ${duration.humanReadable}). Consider extending the expiration date.`,
      severity: 'warning',
    };
  }

  // All good!
  return { isValid: true };
}

/**
 * Calculate duration between two dates
 *
 * @param start - Start date
 * @param end - End date
 * @returns Duration information
 */
export function calculateDuration(
  start: string | Date,
  end: string | Date
): DateDurationInfo {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const diffMs = endDate.getTime() - startDate.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const remainingHours = diffHours % 24;
  const remainingMinutes = diffMinutes % 60;

  // Create human-readable string
  let humanReadable = '';
  if (diffDays > 0) {
    humanReadable += `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    if (remainingHours > 0) {
      humanReadable += `, ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`;
    }
  } else if (diffHours > 0) {
    humanReadable += `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    if (remainingMinutes > 0) {
      humanReadable += `, ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
    }
  } else {
    humanReadable += `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
  }

  return {
    days: diffDays,
    hours: remainingHours,
    minutes: remainingMinutes,
    totalHours: diffHours,
    humanReadable,
  };
}

/**
 * Get announcement visibility duration preview
 *
 * @param expirationDate - The expiration date
 * @param publishDate - Optional publish date (defaults to now)
 * @returns Human-readable duration or null if no expiration
 */
export function getVisibilityDuration(
  expirationDate: string | Date | null | undefined,
  publishDate?: string | Date | null
): string | null {
  if (!expirationDate) {
    return 'No expiration (visible indefinitely)';
  }

  const publish = publishDate ? new Date(publishDate) : new Date();
  const expiration = new Date(expirationDate);

  if (isNaN(expiration.getTime())) {
    return null;
  }

  // Check if already expired
  if (expiration <= new Date()) {
    return 'Expired (will be hidden immediately)';
  }

  const duration = calculateDuration(publish, expiration);
  return `Active for ${duration.humanReadable}`;
}

/**
 * Format date for input[type="datetime-local"]
 *
 * @param date - Date to format
 * @returns Formatted string for datetime-local input
 */
export function formatDateTimeLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Get minimum allowed expiration date (1 hour from now)
 */
export function getMinimumExpirationDate(): string {
  const now = new Date();
  const minimum = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
  return formatDateTimeLocal(minimum);
}

/**
 * Get maximum allowed expiration date (1 year from now)
 */
export function getMaximumExpirationDate(): string {
  const now = new Date();
  const maximum = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year from now
  return formatDateTimeLocal(maximum);
}

/**
 * Get suggested expiration date (30 days from now)
 */
export function getSuggestedExpirationDate(): string {
  const now = new Date();
  const suggested = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
  return formatDateTimeLocal(suggested);
}
