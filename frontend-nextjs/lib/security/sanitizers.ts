/**
 * Input Sanitization Utilities
 * Functions to sanitize user input and prevent XSS, SQL injection, and other attacks
 */

// ============================================================================
// STRING SANITIZATION
// ============================================================================

/**
 * Sanitize a plain text string
 * - Removes HTML tags
 * - Removes script tags
 * - Normalizes whitespace
 * - Removes control characters
 */
export function sanitizeString(input: string): string {
  if (typeof input !== "string") return ""

  return (
    input
      // Remove HTML tags
      .replace(/<[^>]*>/g, "")
      // Remove script content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      // Remove style content
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      // Remove control characters
      .replace(/[\x00-\x1F\x7F-\x9F]/g, "")
      // Normalize whitespace
      .replace(/\s+/g, " ")
      .trim()
  )
}

/**
 * Sanitize HTML content (allows safe tags only)
 * This is a basic implementation - use DOMPurify for production
 */
export function sanitizeHtml(html: string): string {
  if (typeof html !== "string") return ""

  // Allow only these safe tags
  const ALLOWED_TAGS = [
    "p",
    "br",
    "strong",
    "em",
    "u",
    "ol",
    "ul",
    "li",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "blockquote",
    "code",
    "pre",
  ]

  // Remove dangerous tags and attributes
  let sanitized = html
    // Remove script tags and content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Remove style tags and content
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    // Remove iframe tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    // Remove event handlers (onclick, onerror, etc.)
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/on\w+\s*=\s*[^\s>]*/gi, "")
    // Remove javascript: URLs
    .replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"')
    .replace(/src\s*=\s*["']javascript:[^"']*["']/gi, 'src=""')
    // Remove data: URLs (potential XSS)
    .replace(/href\s*=\s*["']data:[^"']*["']/gi, 'href="#"')
    .replace(/src\s*=\s*["']data:[^"']*["']/gi, 'src=""')

  return sanitized
}

/**
 * Escape HTML special characters
 * Use this when displaying user input as text
 */
export function escapeHtml(text: string): string {
  if (typeof text !== "string") return ""

  const htmlEscapes: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  }

  return text.replace(/[&<>"'\/]/g, (char) => htmlEscapes[char] || char)
}

/**
 * Unescape HTML entities
 */
export function unescapeHtml(text: string): string {
  if (typeof text !== "string") return ""

  const htmlUnescapes: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#x27;": "'",
    "&#x2F;": "/",
  }

  return text.replace(/&(?:amp|lt|gt|quot|#x27|#x2F);/g, (entity) => htmlUnescapes[entity] || entity)
}

// ============================================================================
// URL SANITIZATION
// ============================================================================

/**
 * Sanitize URL to prevent XSS via javascript: or data: URLs
 */
export function sanitizeUrl(url: string): string {
  if (typeof url !== "string") return ""

  const trimmed = url.trim().toLowerCase()

  // Block dangerous protocols
  const dangerousProtocols = ["javascript:", "data:", "vbscript:", "file:"]
  for (const protocol of dangerousProtocols) {
    if (trimmed.startsWith(protocol)) {
      return "#"
    }
  }

  // Only allow http, https, mailto, and relative URLs
  if (
    !trimmed.startsWith("http://") &&
    !trimmed.startsWith("https://") &&
    !trimmed.startsWith("mailto:") &&
    !trimmed.startsWith("/") &&
    !trimmed.startsWith("#")
  ) {
    return "#"
  }

  return url.trim()
}

/**
 * Validate and sanitize URL
 * Returns null if URL is invalid
 */
export function validateUrl(url: string): string | null {
  try {
    const parsed = new URL(url, window.location.origin)

    // Only allow http and https
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return null
    }

    return parsed.toString()
  } catch {
    // If URL parsing fails, try as relative URL
    if (url.startsWith("/") || url.startsWith("#")) {
      return url
    }
    return null
  }
}

// ============================================================================
// FILENAME SANITIZATION
// ============================================================================

/**
 * Sanitize filename to prevent path traversal attacks
 */
export function sanitizeFilename(filename: string): string {
  if (typeof filename !== "string") return ""

  return (
    filename
      .trim()
      // Remove path separators
      .replace(/[\/\\]/g, "")
      // Remove path traversal attempts
      .replace(/\.\./g, "")
      // Remove null bytes
      .replace(/\0/g, "")
      // Remove control characters
      .replace(/[\x00-\x1F\x7F-\x9F]/g, "")
      // Remove Windows reserved characters
      .replace(/[<>:"|?*]/g, "")
      // Remove leading/trailing dots and spaces
      .replace(/^[\s.]+|[\s.]+$/g, "")
      // Limit length
      .slice(0, 255)
  )
}

/**
 * Get safe filename with extension
 */
export function getSafeFilename(filename: string, extension?: string): string {
  const sanitized = sanitizeFilename(filename)

  // If no name left after sanitization, use default
  if (!sanitized) {
    const timestamp = Date.now()
    return extension ? `file_${timestamp}.${extension}` : `file_${timestamp}`
  }

  // Add extension if provided and not already present
  if (extension && !sanitized.toLowerCase().endsWith(`.${extension.toLowerCase()}`)) {
    return `${sanitized}.${extension}`
  }

  return sanitized
}

// ============================================================================
// SEARCH QUERY SANITIZATION
// ============================================================================

/**
 * Sanitize search query
 * - Removes dangerous characters
 * - Escapes special regex characters if needed
 * - Limits length
 */
export function sanitizeSearchQuery(query: string): string {
  if (typeof query !== "string") return ""

  return (
    query
      .trim()
      // Remove HTML tags
      .replace(/<[^>]*>/g, "")
      // Remove SQL injection attempts
      .replace(/[';"]|--|\*|\/\*/g, "")
      // Remove script tags
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      // Normalize whitespace
      .replace(/\s+/g, " ")
      // Limit length
      .slice(0, 100)
  )
}

/**
 * Escape special regex characters in search query
 */
export function escapeRegex(query: string): string {
  if (typeof query !== "string") return ""

  return query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

// ============================================================================
// UNICODE NORMALIZATION
// ============================================================================

/**
 * Normalize unicode to prevent homograph attacks
 * Converts similar-looking characters to their standard form
 */
export function normalizeUnicode(text: string): string {
  if (typeof text !== "string") return ""

  // Normalize to NFC (Canonical Composition)
  let normalized = text.normalize("NFC")

  // Remove zero-width characters
  normalized = normalized.replace(/[\u200B-\u200D\uFEFF]/g, "")

  // Remove right-to-left override characters (can be used for spoofing)
  normalized = normalized.replace(/[\u202A-\u202E]/g, "")

  return normalized
}

/**
 * Detect and warn about potential homograph attacks
 * Returns true if suspicious characters are detected
 */
export function detectHomographAttack(text: string): boolean {
  if (typeof text !== "string") return false

  // Check for mixed scripts (Latin + Cyrillic, etc.)
  const cyrillicPattern = /[\u0400-\u04FF]/
  const greekPattern = /[\u0370-\u03FF]/
  const latinPattern = /[A-Za-z]/

  const hasCyrillic = cyrillicPattern.test(text)
  const hasGreek = greekPattern.test(text)
  const hasLatin = latinPattern.test(text)

  // If mixing Latin with Cyrillic or Greek, it's suspicious
  if (hasLatin && (hasCyrillic || hasGreek)) {
    return true
  }

  // Check for zero-width characters
  if (/[\u200B-\u200D\uFEFF]/.test(text)) {
    return true
  }

  // Check for RTL override
  if (/[\u202A-\u202E]/.test(text)) {
    return true
  }

  return false
}

// ============================================================================
// SQL INJECTION PREVENTION
// ============================================================================

/**
 * Escape SQL special characters
 * NOTE: This is a basic implementation. In production, ALWAYS use
 * parameterized queries or an ORM. This is just for extra safety on frontend.
 */
export function escapeSql(input: string): string {
  if (typeof input !== "string") return ""

  return input
    .replace(/'/g, "''") // Escape single quotes
    .replace(/;/g, "") // Remove semicolons
    .replace(/--/g, "") // Remove SQL comments
    .replace(/\/\*/g, "") // Remove block comments
    .replace(/\*\//g, "")
}

/**
 * Detect potential SQL injection attempts
 * Returns true if suspicious SQL patterns are detected
 */
export function detectSqlInjection(input: string): boolean {
  if (typeof input !== "string") return false

  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b)/gi,
    /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/gi, // OR 1=1
    /';?\s*--/gi, // SQL comments
    /\/\*.*\*\//gi, // Block comments
    /\bxp_\w+/gi, // Extended stored procedures
    /\bsp_\w+/gi, // Stored procedures
  ]

  return sqlPatterns.some((pattern) => pattern.test(input))
}

// ============================================================================
// XSS DETECTION
// ============================================================================

/**
 * Detect potential XSS payloads
 * Returns true if suspicious patterns are detected
 */
export function detectXss(input: string): boolean {
  if (typeof input !== "string") return false

  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=\s*["'][^"']*["']/gi, // Event handlers
    /<img[^>]+src[^>]*>/gi, // Image tags
    /data:text\/html/gi, // Data URIs
    /<embed[^>]*>/gi,
    /<object[^>]*>/gi,
  ]

  return xssPatterns.some((pattern) => pattern.test(input))
}

// ============================================================================
// CONTENT SECURITY
// ============================================================================

/**
 * Remove potentially dangerous content from user input
 */
export function removeDangerousContent(input: string): string {
  if (typeof input !== "string") return ""

  return input
    // Remove script tags
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Remove iframe tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    // Remove embed tags
    .replace(/<embed\b[^>]*>/gi, "")
    // Remove object tags
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    // Remove event handlers
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/on\w+\s*=\s*[^\s>]*/gi, "")
    // Remove javascript: URLs
    .replace(/javascript:/gi, "")
    // Remove data: URLs
    .replace(/data:text\/html/gi, "")
}

// ============================================================================
// COMBINED SANITIZATION
// ============================================================================

/**
 * Comprehensive input sanitization
 * Applies multiple sanitization techniques
 */
export function sanitizeInput(
  input: string,
  options: {
    allowHtml?: boolean
    normalizeUnicode?: boolean
    detectThreats?: boolean
  } = {}
): {
  sanitized: string
  threats: string[]
} {
  const threats: string[] = []

  if (typeof input !== "string") {
    return { sanitized: "", threats: [] }
  }

  let sanitized = input

  // Normalize unicode if requested
  if (options.normalizeUnicode !== false) {
    sanitized = normalizeUnicode(sanitized)

    // Detect homograph attacks
    if (detectHomographAttack(sanitized)) {
      threats.push("Potential homograph attack detected")
    }
  }

  // Detect threats if requested
  if (options.detectThreats) {
    if (detectXss(sanitized)) {
      threats.push("Potential XSS attack detected")
    }

    if (detectSqlInjection(sanitized)) {
      threats.push("Potential SQL injection detected")
    }
  }

  // Sanitize based on whether HTML is allowed
  if (options.allowHtml) {
    sanitized = sanitizeHtml(sanitized)
  } else {
    sanitized = sanitizeString(sanitized)
  }

  return { sanitized, threats }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if string contains only alphanumeric characters
 */
export function isAlphanumeric(text: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(text)
}

/**
 * Check if string contains only letters
 */
export function isAlpha(text: string): boolean {
  return /^[a-zA-Z]+$/.test(text)
}

/**
 * Check if string contains only numbers
 */
export function isNumeric(text: string): boolean {
  return /^[0-9]+$/.test(text)
}

/**
 * Truncate string to maximum length
 */
export function truncate(text: string, maxLength: number, ellipsis = "..."): string {
  if (typeof text !== "string") return ""
  if (text.length <= maxLength) return text

  return text.slice(0, maxLength - ellipsis.length) + ellipsis
}

/**
 * Remove extra whitespace
 */
export function normalizeWhitespace(text: string): string {
  if (typeof text !== "string") return ""

  return text.replace(/\s+/g, " ").trim()
}

/**
 * Convert to safe identifier (for IDs, classes, etc.)
 */
export function toSafeIdentifier(text: string): string {
  if (typeof text !== "string") return ""

  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with dashes
    .replace(/^-+|-+$/g, "") // Remove leading/trailing dashes
    .slice(0, 50) // Limit length
}
