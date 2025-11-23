/**
 * Utility functions for handling Date objects in localStorage
 */

/**
 * Recursively converts date strings back to Date objects
 */
export function reviveDates(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(reviveDates)
  }

  if (typeof obj === 'object') {
    const revived: any = {}
    for (const [key, value] of Object.entries(obj)) {
      // Check if this looks like a date string
      if (typeof value === 'string' && isDateString(value)) {
        revived[key] = new Date(value)
      } else if (typeof value === 'object') {
        revived[key] = reviveDates(value)
      } else {
        revived[key] = value
      }
    }
    return revived
  }

  return obj
}

/**
 * Check if a string looks like a date
 */
function isDateString(str: string): boolean {
  // Check for ISO date strings or common date patterns
  return (
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(str) || // ISO format
    /^\d{4}-\d{2}-\d{2}/.test(str) || // Date only
    /^[A-Za-z]{3} \d{2} \d{4}/.test(str) || // "Jan 01 2024"
    /^[A-Za-z]{3}, \d{2} [A-Za-z]{3} \d{4}/.test(str) // "Mon, 01 Jan 2024"
  )
}

/**
 * Safe date formatting that handles both Date objects and date strings
 */
export function formatDate(date: Date | string | null | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!date) return ''
  
  const dateObj = date instanceof Date ? date : new Date(date)
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date'
  }
  
  return dateObj.toLocaleDateString(undefined, options)
}

/**
 * Safe time formatting that handles both Date objects and date strings
 */
export function formatTime(date: Date | string | null | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!date) return ''
  
  const dateObj = date instanceof Date ? date : new Date(date)
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Time'
  }
  
  return dateObj.toLocaleTimeString(undefined, options)
}

/**
 * Safe date and time formatting
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return ''
  
  const dateObj = date instanceof Date ? date : new Date(date)
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date'
  }
  
  return `${formatDate(dateObj)} at ${formatTime(dateObj, { hour: "2-digit", minute: "2-digit" })}`
}
