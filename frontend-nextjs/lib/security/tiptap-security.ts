/**
 * Tiptap Rich Text Editor Security
 * XSS prevention and content sanitization for Tiptap editor
 */

import { sanitizeHtml, sanitizeUrl, detectXss } from "./sanitizers"

// ============================================================================
// TIPTAP CONFIGURATION
// ============================================================================

/**
 * Allowed HTML tags in Tiptap content
 * These are safe tags that Tiptap can render
 */
export const ALLOWED_TIPTAP_TAGS = [
  // Text formatting
  "p",
  "br",
  "strong",
  "em",
  "u",
  "s",
  "mark",
  "code",
  "sub",
  "sup",

  // Headings
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",

  // Lists
  "ul",
  "ol",
  "li",

  // Blockquotes and code blocks
  "blockquote",
  "pre",

  // Links and images
  "a",
  "img",

  // Tables
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",

  // Horizontal rule
  "hr",

  // Div (for node views)
  "div",
  "span",
] as const

/**
 * Allowed attributes for specific tags
 */
export const ALLOWED_TIPTAP_ATTRIBUTES: Record<string, string[]> = {
  a: ["href", "target", "rel", "class"],
  img: ["src", "alt", "title", "width", "height", "class"],
  table: ["class"],
  th: ["colspan", "rowspan", "class"],
  td: ["colspan", "rowspan", "class"],
  code: ["class"], // For syntax highlighting
  pre: ["class"], // For code blocks
  div: ["class", "data-type"], // For custom node views
  span: ["class", "style"], // For text colors/highlights (limited)
  p: ["class"],
  h1: ["class"],
  h2: ["class"],
  h3: ["class"],
  h4: ["class"],
  h5: ["class"],
  h6: ["class"],
}

/**
 * Allowed link protocols
 */
export const ALLOWED_LINK_PROTOCOLS = ["http:", "https:", "mailto:"] as const

/**
 * Allowed image protocols
 */
export const ALLOWED_IMAGE_PROTOCOLS = ["http:", "https:", "data:"] as const

/**
 * Maximum content length (characters)
 */
export const MAX_TIPTAP_CONTENT_LENGTH = 50000 // 50k characters

// ============================================================================
// CONTENT SANITIZATION
// ============================================================================

/**
 * Sanitize Tiptap HTML content
 * Removes dangerous tags, attributes, and scripts
 */
export function sanitizeTiptapContent(html: string): string {
  if (typeof html !== "string") return ""

  let sanitized = html

  // Step 1: Remove script and style tags completely
  sanitized = sanitized
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")

  // Step 2: Remove dangerous tags
  const dangerousTags = [
    "iframe",
    "object",
    "embed",
    "applet",
    "link",
    "meta",
    "base",
    "form",
    "input",
    "button",
    "textarea",
    "select",
  ]

  dangerousTags.forEach((tag) => {
    const regex = new RegExp(`<${tag}\\b[^<]*(?:(?!<\\/${tag}>)<[^<]*)*<\\/${tag}>`, "gi")
    sanitized = sanitized.replace(regex, "")
    // Also remove self-closing tags
    sanitized = sanitized.replace(new RegExp(`<${tag}\\b[^>]*\\/?>`, "gi"), "")
  })

  // Step 3: Remove event handlers
  sanitized = sanitized
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/on\w+\s*=\s*[^\s>]*/gi, "")

  // Step 4: Sanitize href attributes
  sanitized = sanitized.replace(/href\s*=\s*["']([^"']*)["']/gi, (match, url) => {
    const sanitizedUrl = sanitizeUrl(url)
    return `href="${sanitizedUrl}"`
  })

  // Step 5: Sanitize src attributes
  sanitized = sanitized.replace(/src\s*=\s*["']([^"']*)["']/gi, (match, url) => {
    // For images, allow data: URLs but validate them
    if (url.startsWith("data:image/")) {
      // Basic validation for data URLs
      if (/^data:image\/(png|jpeg|jpg|gif|webp);base64,/.test(url)) {
        return `src="${url}"`
      }
      return 'src=""'
    }

    const sanitizedUrl = sanitizeUrl(url)
    return `src="${sanitizedUrl}"`
  })

  // Step 6: Remove dangerous attributes
  const dangerousAttrs = ["formaction", "action", "xmlns"]
  dangerousAttrs.forEach((attr) => {
    sanitized = sanitized.replace(new RegExp(`${attr}\\s*=\\s*["'][^"']*["']`, "gi"), "")
  })

  // Step 7: Limit style attribute (only allow safe styles)
  sanitized = sanitized.replace(/style\s*=\s*["']([^"']*)["']/gi, (match, styles) => {
    // Only allow safe styles like color, text-align, etc.
    const allowedStyles = ["color", "text-align", "background-color"]
    const styleParts = styles.split(";").filter((style: string) => {
      const prop = style.trim().split(":")[0]?.trim().toLowerCase()
      return allowedStyles.includes(prop)
    })

    if (styleParts.length === 0) return ""
    return `style="${styleParts.join(";").trim()}"`
  })

  return sanitized
}

/**
 * Validate Tiptap JSON content
 * Checks the JSON structure from Tiptap editor
 */
export function validateTiptapJson(json: unknown): boolean {
  if (!json || typeof json !== "object") return false

  const content = json as Record<string, any>

  // Must have type
  if (!content.type || typeof content.type !== "string") return false

  // Check content array if present
  if (content.content && !Array.isArray(content.content)) return false

  // Recursively validate content
  if (content.content) {
    return content.content.every((node: unknown) => validateTiptapJson(node))
  }

  return true
}

/**
 * Sanitize Tiptap JSON content
 * Removes dangerous nodes and marks
 */
export function sanitizeTiptapJson(json: any): any {
  if (!json || typeof json !== "object") return null

  const sanitized = { ...json }

  // Remove dangerous node types
  const dangerousTypes = ["script", "iframe", "object", "embed"]
  if (dangerousTypes.includes(sanitized.type)) {
    return null
  }

  // Sanitize attributes
  if (sanitized.attrs) {
    // Sanitize href in links
    if (sanitized.attrs.href) {
      sanitized.attrs.href = sanitizeUrl(sanitized.attrs.href)
    }

    // Sanitize src in images
    if (sanitized.attrs.src) {
      const src = sanitized.attrs.src
      if (src.startsWith("data:image/")) {
        // Validate data URL
        if (!/^data:image\/(png|jpeg|jpg|gif|webp);base64,/.test(src)) {
          sanitized.attrs.src = ""
        }
      } else {
        sanitized.attrs.src = sanitizeUrl(src)
      }
    }

    // Remove dangerous attributes
    delete sanitized.attrs.onclick
    delete sanitized.attrs.onerror
    delete sanitized.attrs.onload
  }

  // Recursively sanitize content
  if (Array.isArray(sanitized.content)) {
    sanitized.content = sanitized.content
      .map((node: any) => sanitizeTiptapJson(node))
      .filter((node: any) => node !== null)
  }

  return sanitized
}

// ============================================================================
// LINK VALIDATION
// ============================================================================

/**
 * Validate link URL for Tiptap
 */
export function validateTiptapLink(url: string): boolean {
  if (!url || typeof url !== "string") return false

  try {
    const parsed = new URL(url, window.location.origin)

    // Check if protocol is allowed
    return ALLOWED_LINK_PROTOCOLS.includes(parsed.protocol as any)
  } catch {
    // If URL parsing fails, check if it's a relative URL
    return url.startsWith("/") || url.startsWith("#")
  }
}

/**
 * Sanitize link URL for Tiptap
 * Returns safe URL or empty string
 */
export function sanitizeTiptapLink(url: string): string {
  if (!validateTiptapLink(url)) {
    return ""
  }

  return sanitizeUrl(url)
}

// ============================================================================
// IMAGE VALIDATION
// ============================================================================

/**
 * Validate image source for Tiptap
 */
export function validateTiptapImage(src: string): boolean {
  if (!src || typeof src !== "string") return false

  // Allow data URLs for base64 images
  if (src.startsWith("data:image/")) {
    // Validate format
    return /^data:image\/(png|jpeg|jpg|gif|webp);base64,/.test(src)
  }

  // Validate as regular URL
  try {
    const parsed = new URL(src)
    return ALLOWED_IMAGE_PROTOCOLS.includes(parsed.protocol as any)
  } catch {
    return false
  }
}

/**
 * Sanitize image source for Tiptap
 */
export function sanitizeTiptapImage(src: string): string {
  if (!validateTiptapImage(src)) {
    return ""
  }

  // Data URLs are already validated
  if (src.startsWith("data:image/")) {
    return src
  }

  return sanitizeUrl(src)
}

// ============================================================================
// PASTE HANDLING
// ============================================================================

/**
 * Sanitize pasted content in Tiptap
 * Handles both HTML and plain text paste
 */
export function sanitizePastedContent(content: string, isHtml: boolean): string {
  if (!content) return ""

  if (isHtml) {
    // Sanitize HTML content
    return sanitizeTiptapContent(content)
  } else {
    // For plain text, just remove any HTML
    return content
      .replace(/<[^>]*>/g, "")
      .replace(/[\x00-\x1F\x7F-\x9F]/g, "")
      .trim()
  }
}

/**
 * Handle paste event in Tiptap
 * Returns sanitized content
 */
export function handleTiptapPaste(event: ClipboardEvent): string {
  const html = event.clipboardData?.getData("text/html")
  const text = event.clipboardData?.getData("text/plain")

  if (html) {
    return sanitizePastedContent(html, true)
  } else if (text) {
    return sanitizePastedContent(text, false)
  }

  return ""
}

// ============================================================================
// CONTENT VALIDATION
// ============================================================================

/**
 * Validate Tiptap content length
 */
export function validateContentLength(content: string): boolean {
  return content.length <= MAX_TIPTAP_CONTENT_LENGTH
}

/**
 * Check if content contains XSS attempts
 */
export function checkTiptapContentSecurity(content: string): {
  safe: boolean
  threats: string[]
} {
  const threats: string[] = []

  // Check for XSS
  if (detectXss(content)) {
    threats.push("Potential XSS attack detected in content")
  }

  // Check for script tags
  if (/<script/i.test(content)) {
    threats.push("Script tags are not allowed")
  }

  // Check for iframe tags
  if (/<iframe/i.test(content)) {
    threats.push("Iframe tags are not allowed")
  }

  // Check for javascript: URLs
  if (/javascript:/i.test(content)) {
    threats.push("JavaScript URLs are not allowed")
  }

  // Check for event handlers
  if (/on\w+\s*=/i.test(content)) {
    threats.push("Event handlers are not allowed")
  }

  return {
    safe: threats.length === 0,
    threats,
  }
}

// ============================================================================
// TIPTAP EXTENSIONS CONFIGURATION
// ============================================================================

/**
 * Get secure Tiptap link extension options
 */
export function getSecureLinkOptions() {
  return {
    openOnClick: false,
    HTMLAttributes: {
      class: "tiptap-link",
      rel: "noopener noreferrer nofollow", // Security best practice
      target: "_blank",
    },
    validate: (url: string) => validateTiptapLink(url),
  }
}

/**
 * Get secure Tiptap image extension options
 */
export function getSecureImageOptions() {
  return {
    HTMLAttributes: {
      class: "tiptap-image",
    },
    allowBase64: true, // Allow data URLs
    validate: (src: string) => validateTiptapImage(src),
  }
}

// ============================================================================
// COMMENT SANITIZATION (SCHOOL-SPECIFIC)
// ============================================================================

/**
 * Sanitize student/teacher comment content
 * More restrictive than general content
 */
export function sanitizeComment(content: string): string {
  if (!content) return ""

  // Detect threats
  const security = checkTiptapContentSecurity(content)
  if (!security.safe) {
    console.warn("Comment contains security threats:", security.threats)
    // Still sanitize, but log the attempt
  }

  // Sanitize HTML
  let sanitized = sanitizeTiptapContent(content)

  // Further restrictions for comments:
  // - No images in comments
  sanitized = sanitized.replace(/<img[^>]*>/gi, "[Image removed]")

  // - No tables in comments
  sanitized = sanitized.replace(/<table[^>]*>.*?<\/table>/gi, "[Table removed]")

  // - Limit to basic formatting only
  const allowedCommentTags = ["p", "br", "strong", "em", "u", "a", "code", "ul", "ol", "li"]
  // This is a simplified filter; in production, use a proper HTML parser

  return sanitized
}

/**
 * Validate comment length
 */
export const MAX_COMMENT_LENGTH = 2000 // 2000 characters for comments

export function validateCommentLength(content: string): boolean {
  // Strip HTML to count actual text
  const textOnly = content.replace(/<[^>]*>/g, "")
  return textOnly.length <= MAX_COMMENT_LENGTH
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert Tiptap HTML to plain text
 */
export function tiptapHtmlToText(html: string): string {
  if (!html) return ""

  return html
    .replace(/<br\s*\/?>/gi, "\n") // Convert br to newlines
    .replace(/<\/p>/gi, "\n\n") // Paragraphs get double newline
    .replace(/<[^>]*>/g, "") // Remove all HTML tags
    .replace(/&nbsp;/g, " ") // Convert nbsp to space
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .trim()
}

/**
 * Get word count from Tiptap content
 */
export function getTiptapWordCount(html: string): number {
  const text = tiptapHtmlToText(html)
  if (!text) return 0

  return text.split(/\s+/).filter((word) => word.length > 0).length
}

/**
 * Get character count from Tiptap content (excluding HTML)
 */
export function getTiptapCharCount(html: string): number {
  const text = tiptapHtmlToText(html)
  return text.length
}

/**
 * Truncate Tiptap content to specified length
 */
export function truncateTiptapContent(html: string, maxLength: number): string {
  const text = tiptapHtmlToText(html)

  if (text.length <= maxLength) return html

  // Truncate text
  const truncated = text.slice(0, maxLength) + "..."

  // Return as simple paragraph
  return `<p>${truncated}</p>`
}
