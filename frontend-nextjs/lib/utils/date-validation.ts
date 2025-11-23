/**
 * ========================================
 * DATE VALIDATION UTILITIES
 * ========================================
 * Validation helpers for dates in forms
 */

/**
 * Check if a date is in the past (before today)
 *
 * @param date - Date string or Date object
 * @returns true if date is in the past, false otherwise
 *
 * @example
 * ```ts
 * const isPast = isDateInPast('2024-01-15');
 * if (isPast) {
 *   console.log('Please select a future date');
 * }
 * ```
 */
export function isDateInPast(date: string | Date): boolean {
  if (!date) return false;

  const inputDate = new Date(date);
  const now = new Date();

  // Reset time to start of day for comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const checkDate = new Date(
    inputDate.getFullYear(),
    inputDate.getMonth(),
    inputDate.getDate()
  );

  return checkDate < today;
}

/**
 * Check if end date is after start date
 *
 * @param startDate - Start date string or Date object
 * @param endDate - End date string or Date object
 * @returns true if end date is after start date, false otherwise
 *
 * @example
 * ```ts
 * const isValid = isEndDateAfterStartDate('2024-01-15', '2024-01-20');
 * if (!isValid) {
 *   console.log('End date must be after start date');
 * }
 * ```
 */
export function isEndDateAfterStartDate(
  startDate: string | Date,
  endDate: string | Date
): boolean {
  if (!startDate || !endDate) return true;

  const start = new Date(startDate);
  const end = new Date(endDate);

  return end > start;
}

/**
 * Validate banner/schedule date range
 * Returns error message if invalid, null if valid
 *
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Error message string or null if valid
 *
 * @example
 * ```ts
 * const error = validateDateRange(startDate, endDate);
 * if (error) {
 *   setError('dateRange', { message: error });
 * }
 * ```
 */
export function validateDateRange(
  startDate: string | Date,
  endDate: string | Date
): string | null {
  // Check if start date is in the past
  if (isDateInPast(startDate)) {
    return 'Start date cannot be in the past. Please select today or a future date.';
  }

  // Check if end date is after start date
  if (!isEndDateAfterStartDate(startDate, endDate)) {
    return 'End date must be after start date. Please select a later date.';
  }

  return null;
}

/**
 * Format date for input fields (YYYY-MM-DDTHH:mm format)
 *
 * @param date - Date to format
 * @returns Formatted date string
 *
 * @example
 * ```ts
 * const formattedDate = formatDateForInput(new Date());
 * // Returns: "2024-01-15T14:30"
 * ```
 */
export function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Get minimum date for date input (today)
 *
 * @returns Today's date in YYYY-MM-DD format
 *
 * @example
 * ```ts
 * <input type="datetime-local" min={getMinDate()} />
 * ```
 */
export function getMinDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Get minimum datetime for datetime-local input (now)
 *
 * @returns Current datetime in YYYY-MM-DDTHH:mm format
 *
 * @example
 * ```ts
 * <input type="datetime-local" min={getMinDateTime()} />
 * ```
 */
export function getMinDateTime(): string {
  return formatDateForInput(new Date());
}

/**
 * Check if date is within a reasonable range (not too far in future)
 *
 * @param date - Date to check
 * @param maxYears - Maximum years in the future (default: 1)
 * @returns true if date is within range, false otherwise
 *
 * @example
 * ```ts
 * const isReasonable = isDateWithinRange(selectedDate, 2);
 * if (!isReasonable) {
 *   console.log('Please select a date within 2 years');
 * }
 * ```
 */
export function isDateWithinRange(
  date: string | Date,
  maxYears: number = 1
): boolean {
  if (!date) return true;

  const inputDate = new Date(date);
  const now = new Date();
  const maxDate = new Date();
  maxDate.setFullYear(now.getFullYear() + maxYears);

  return inputDate <= maxDate;
}

/**
 * Calculate duration between two dates in days
 *
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Number of days between dates
 *
 * @example
 * ```ts
 * const days = calculateDuration('2024-01-15', '2024-01-20');
 * console.log(`Duration: ${days} days`); // Duration: 5 days
 * ```
 */
export function calculateDuration(
  startDate: string | Date,
  endDate: string | Date
): number {
  if (!startDate || !endDate) return 0;

  const start = new Date(startDate);
  const end = new Date(endDate);

  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}
