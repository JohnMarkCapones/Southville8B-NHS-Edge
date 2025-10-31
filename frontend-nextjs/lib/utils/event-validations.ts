/**
 * ========================================
 * EVENT VALIDATION UTILITIES
 * ========================================
 * Comprehensive validation functions for event creation and editing.
 * Handles date conflicts, time validations, and business rules.
 */

import { Event, EventStatus } from '@/lib/api/types/events';

// ========================================
// TYPES
// ========================================

export enum ValidationSeverity {
  ERROR = 'error',       // Blocks submission
  WARNING = 'warning',   // Shows warning, allows override
  INFO = 'info'         // Informational only
}

export interface ValidationResult {
  isValid: boolean;
  severity: ValidationSeverity;
  message: string;
  details?: string;
  conflictingEvents?: Event[];
}

export interface EventValidationOptions {
  allowPastDates?: boolean;           // Default: false
  minimumLeadTimeHours?: number;      // Default: 2 hours
  allowSameDateEvents?: boolean;      // Default: true (with warning)
  allowSameDateTimeEvents?: boolean;  // Default: false
  checkVenueConflicts?: boolean;      // Default: true
  warnOnWeekends?: boolean;           // Default: false
  warnOnCloseProximity?: boolean;     // Default: true
  proximityThresholdHours?: number;   // Default: 2 hours
}

// ========================================
// VALIDATION FUNCTIONS
// ========================================

/**
 * Validate if event date is in the past
 */
export function validateNotPastDate(
  eventDate: string,
  eventTime: string
): ValidationResult {
  const eventDateTime = new Date(`${eventDate}T${eventTime}`);
  const now = new Date();

  if (eventDateTime < now) {
    const daysDiff = Math.floor((now.getTime() - eventDateTime.getTime()) / (1000 * 60 * 60 * 24));

    return {
      isValid: false,
      severity: ValidationSeverity.ERROR,
      message: 'Cannot create event in the past',
      details: `This event date is ${daysDiff} day${daysDiff !== 1 ? 's' : ''} in the past. Please select a future date.`
    };
  }

  return {
    isValid: true,
    severity: ValidationSeverity.INFO,
    message: 'Date validation passed'
  };
}

/**
 * Validate minimum lead time (events must be created X hours in advance)
 */
export function validateMinimumLeadTime(
  eventDate: string,
  eventTime: string,
  minimumHours: number = 2
): ValidationResult {
  const eventDateTime = new Date(`${eventDate}T${eventTime}`);
  const now = new Date();
  const hoursUntilEvent = (eventDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilEvent < minimumHours) {
    return {
      isValid: false,
      severity: ValidationSeverity.WARNING,
      message: `Events should be created at least ${minimumHours} hours in advance`,
      details: `This event is only ${hoursUntilEvent.toFixed(1)} hours away. Consider scheduling events with more notice.`
    };
  }

  return {
    isValid: true,
    severity: ValidationSeverity.INFO,
    message: 'Lead time validation passed'
  };
}

/**
 * Check for events on the same date
 */
export function validateSameDateEvents(
  eventDate: string,
  existingEvents: Event[],
  currentEventId?: string
): ValidationResult {
  const conflictingEvents = existingEvents.filter(event => {
    // Skip the current event if editing
    if (currentEventId && event.id === currentEventId) return false;

    // Only check published/draft events
    if (event.status === EventStatus.CANCELLED || event.status === EventStatus.COMPLETED) return false;

    return event.date === eventDate;
  });

  if (conflictingEvents.length > 0) {
    return {
      isValid: false,
      severity: ValidationSeverity.WARNING,
      message: `${conflictingEvents.length} other event${conflictingEvents.length !== 1 ? 's' : ''} scheduled on this date`,
      details: `There ${conflictingEvents.length === 1 ? 'is' : 'are'} ${conflictingEvents.length} event${conflictingEvents.length !== 1 ? 's' : ''} already scheduled for ${new Date(eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}. Please verify there are no conflicts.`,
      conflictingEvents
    };
  }

  return {
    isValid: true,
    severity: ValidationSeverity.INFO,
    message: 'No date conflicts found'
  };
}

/**
 * Check for events with exact same date and time (CRITICAL)
 */
export function validateSameDateTimeEvents(
  eventDate: string,
  eventTime: string,
  existingEvents: Event[],
  currentEventId?: string
): ValidationResult {
  const conflictingEvents = existingEvents.filter(event => {
    // Skip the current event if editing
    if (currentEventId && event.id === currentEventId) return false;

    // Only check published/draft events
    if (event.status === EventStatus.CANCELLED || event.status === EventStatus.COMPLETED) return false;

    return event.date === eventDate && event.time === eventTime;
  });

  if (conflictingEvents.length > 0) {
    return {
      isValid: false,
      severity: ValidationSeverity.ERROR,
      message: 'CRITICAL: Event with same date and time already exists',
      details: `Another event "${conflictingEvents[0].title}" is scheduled for exactly ${new Date(eventDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} at ${formatTime(eventTime)}. You cannot create events with identical date and time.`,
      conflictingEvents
    };
  }

  return {
    isValid: true,
    severity: ValidationSeverity.INFO,
    message: 'No time conflicts found'
  };
}

/**
 * Check for venue conflicts (same venue, same date, similar time)
 */
export function validateVenueConflicts(
  eventDate: string,
  eventTime: string,
  venue: string,
  existingEvents: Event[],
  currentEventId?: string,
  proximityHours: number = 2
): ValidationResult {
  if (!venue.trim()) {
    return {
      isValid: true,
      severity: ValidationSeverity.INFO,
      message: 'No venue specified'
    };
  }

  const eventDateTime = new Date(`${eventDate}T${eventTime}`);
  const proximityMs = proximityHours * 60 * 60 * 1000;

  const conflictingEvents = existingEvents.filter(event => {
    // Skip the current event if editing
    if (currentEventId && event.id === currentEventId) return false;

    // Only check published/draft events
    if (event.status === EventStatus.CANCELLED || event.status === EventStatus.COMPLETED) return false;

    // Check if same venue (case-insensitive)
    if (event.location.toLowerCase() !== venue.toLowerCase()) return false;

    // Check if within proximity window
    const existingDateTime = new Date(`${event.date}T${event.time}`);
    const timeDiff = Math.abs(existingDateTime.getTime() - eventDateTime.getTime());

    return timeDiff < proximityMs;
  });

  if (conflictingEvents.length > 0) {
    const event = conflictingEvents[0];
    return {
      isValid: false,
      severity: ValidationSeverity.WARNING,
      message: 'Potential venue conflict detected',
      details: `The venue "${venue}" is already booked for "${event.title}" on ${new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${formatTime(event.time)}. Please verify availability.`,
      conflictingEvents
    };
  }

  return {
    isValid: true,
    severity: ValidationSeverity.INFO,
    message: 'No venue conflicts found'
  };
}

/**
 * Check for events in close time proximity on the same day
 */
export function validateTimeProximity(
  eventDate: string,
  eventTime: string,
  existingEvents: Event[],
  currentEventId?: string,
  proximityHours: number = 2
): ValidationResult {
  const eventDateTime = new Date(`${eventDate}T${eventTime}`);
  const proximityMs = proximityHours * 60 * 60 * 1000;

  const closeEvents = existingEvents.filter(event => {
    // Skip the current event if editing
    if (currentEventId && event.id === currentEventId) return false;

    // Only check published/draft events
    if (event.status === EventStatus.CANCELLED || event.status === EventStatus.COMPLETED) return false;

    // Must be same date
    if (event.date !== eventDate) return false;

    // Check time proximity
    const existingDateTime = new Date(`${event.date}T${event.time}`);
    const timeDiff = Math.abs(existingDateTime.getTime() - eventDateTime.getTime());

    return timeDiff > 0 && timeDiff < proximityMs;
  });

  if (closeEvents.length > 0) {
    const event = closeEvents[0];
    const timeDiffHours = Math.abs(
      new Date(`${event.date}T${event.time}`).getTime() - eventDateTime.getTime()
    ) / (1000 * 60 * 60);

    return {
      isValid: false,
      severity: ValidationSeverity.WARNING,
      message: 'Events scheduled close together',
      details: `This event is only ${timeDiffHours.toFixed(1)} hour${timeDiffHours !== 1 ? 's' : ''} ${new Date(`${event.date}T${event.time}`) > eventDateTime ? 'before' : 'after'} "${event.title}". Ensure adequate time for setup/cleanup.`,
      conflictingEvents: closeEvents
    };
  }

  return {
    isValid: true,
    severity: ValidationSeverity.INFO,
    message: 'No proximity conflicts found'
  };
}

/**
 * Check if event is on weekend
 */
export function validateWeekendEvent(
  eventDate: string
): ValidationResult {
  const date = new Date(eventDate);
  const dayOfWeek = date.getDay();

  if (dayOfWeek === 0 || dayOfWeek === 6) {
    const dayName = dayOfWeek === 0 ? 'Sunday' : 'Saturday';
    return {
      isValid: false,
      severity: ValidationSeverity.WARNING,
      message: `Event scheduled for ${dayName}`,
      details: `This event is scheduled for a weekend. Please confirm this is intentional and staff/resources are available.`
    };
  }

  return {
    isValid: true,
    severity: ValidationSeverity.INFO,
    message: 'Weekday event'
  };
}

/**
 * Check for duplicate/similar event titles
 */
export function validateDuplicateTitle(
  title: string,
  existingEvents: Event[],
  currentEventId?: string
): ValidationResult {
  const normalizedTitle = title.toLowerCase().trim();

  const similarEvents = existingEvents.filter(event => {
    // Skip the current event if editing
    if (currentEventId && event.id === currentEventId) return false;

    // Only check published/draft events
    if (event.status === EventStatus.CANCELLED || event.status === EventStatus.COMPLETED) return false;

    const eventTitle = event.title.toLowerCase().trim();

    // Exact match
    if (eventTitle === normalizedTitle) return true;

    // Very similar (using simple similarity check)
    const similarity = calculateSimilarity(normalizedTitle, eventTitle);
    return similarity > 0.8;
  });

  if (similarEvents.length > 0) {
    return {
      isValid: false,
      severity: ValidationSeverity.WARNING,
      message: 'Similar event title detected',
      details: `An event with a similar title "${similarEvents[0].title}" already exists. Please verify this is not a duplicate.`,
      conflictingEvents: similarEvents
    };
  }

  return {
    isValid: true,
    severity: ValidationSeverity.INFO,
    message: 'No duplicate titles found'
  };
}

/**
 * Validate description length and quality
 */
export function validateDescription(
  description: string,
  minLength: number = 50,
  maxLength: number = 5000
): ValidationResult {
  const length = description.trim().length;

  if (length < minLength) {
    return {
      isValid: false,
      severity: ValidationSeverity.WARNING,
      message: 'Description is too short',
      details: `Event description should be at least ${minLength} characters to provide adequate information. Current length: ${length} characters.`
    };
  }

  if (length > maxLength) {
    return {
      isValid: false,
      severity: ValidationSeverity.ERROR,
      message: 'Description is too long',
      details: `Event description must not exceed ${maxLength} characters. Current length: ${length} characters.`
    };
  }

  return {
    isValid: true,
    severity: ValidationSeverity.INFO,
    message: 'Description validation passed'
  };
}

/**
 * Comprehensive validation - runs all checks
 */
export function validateEvent(
  eventData: {
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
  },
  existingEvents: Event[],
  options: EventValidationOptions = {},
  currentEventId?: string
): ValidationResult[] {
  const results: ValidationResult[] = [];

  // Critical validations (always run)
  if (!options.allowPastDates) {
    results.push(validateNotPastDate(eventData.date, eventData.time));
  }

  if (!options.allowSameDateTimeEvents) {
    results.push(validateSameDateTimeEvents(
      eventData.date,
      eventData.time,
      existingEvents,
      currentEventId
    ));
  }

  // Warning validations
  if (options.allowSameDateEvents !== false) {
    results.push(validateSameDateEvents(
      eventData.date,
      existingEvents,
      currentEventId
    ));
  }

  if (options.minimumLeadTimeHours !== undefined && options.minimumLeadTimeHours > 0) {
    results.push(validateMinimumLeadTime(
      eventData.date,
      eventData.time,
      options.minimumLeadTimeHours
    ));
  }

  if (options.checkVenueConflicts !== false) {
    results.push(validateVenueConflicts(
      eventData.date,
      eventData.time,
      eventData.location,
      existingEvents,
      currentEventId,
      options.proximityThresholdHours
    ));
  }

  if (options.warnOnCloseProximity !== false) {
    results.push(validateTimeProximity(
      eventData.date,
      eventData.time,
      existingEvents,
      currentEventId,
      options.proximityThresholdHours || 2
    ));
  }

  if (options.warnOnWeekends) {
    results.push(validateWeekendEvent(eventData.date));
  }

  results.push(validateDuplicateTitle(
    eventData.title,
    existingEvents,
    currentEventId
  ));

  results.push(validateDescription(eventData.description));

  return results;
}

/**
 * Get only failed validations (errors and warnings)
 */
export function getFailedValidations(results: ValidationResult[]): ValidationResult[] {
  return results.filter(result => !result.isValid);
}

/**
 * Check if there are any blocking errors
 */
export function hasBlockingErrors(results: ValidationResult[]): boolean {
  return results.some(result => !result.isValid && result.severity === ValidationSeverity.ERROR);
}

/**
 * Check if there are any warnings
 */
export function hasWarnings(results: ValidationResult[]): boolean {
  return results.some(result => !result.isValid && result.severity === ValidationSeverity.WARNING);
}

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Format time string for display
 */
function formatTime(time: string): string {
  try {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const minute = parseInt(minutes, 10);

    const date = new Date();
    date.setHours(hour, minute, 0, 0);

    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return time;
  }
}

/**
 * Calculate similarity between two strings (simple Levenshtein-based)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Format validation results for display
 */
export function formatValidationMessage(result: ValidationResult): string {
  return result.details || result.message;
}

/**
 * Get icon for validation severity
 */
export function getValidationIcon(severity: ValidationSeverity): string {
  switch (severity) {
    case ValidationSeverity.ERROR:
      return '🚫';
    case ValidationSeverity.WARNING:
      return '⚠️';
    case ValidationSeverity.INFO:
      return 'ℹ️';
    default:
      return '';
  }
}
