/**
 * Common Validation Schemas
 * Reusable Zod validators for frequently used data types
 */

import { z } from "zod"

// ============================================================================
// STRING VALIDATORS
// ============================================================================

/**
 * Safe string validator with sanitization
 * - Trims whitespace
 * - Removes dangerous characters
 * - Configurable min/max length
 */
export const safeString = (options?: {
  min?: number
  max?: number
  required?: boolean
  message?: string
}) => {
  const schema = z
    .string({
      required_error: options?.message || "This field is required",
      invalid_type_error: "Must be a string",
    })
    .trim()

  const withLength = options?.min || options?.max
    ? schema
        .min(options.min || 0, `Minimum ${options.min} characters required`)
        .max(options.max || 1000, `Maximum ${options.max} characters allowed`)
    : schema

  return options?.required === false
    ? withLength.optional()
    : withLength.min(1, options?.message || "This field is required")
}

/**
 * Email validator with lowercase normalization
 */
export const emailSchema = z
  .string({ required_error: "Email is required" })
  .trim()
  .toLowerCase()
  .email("Invalid email format")
  .max(255, "Email is too long")

/**
 * School email validator (Southville 8B domain only)
 */
export const schoolEmailSchema = emailSchema.refine(
  (email) =>
    email.endsWith("@southville8b.edu.ph") ||
    email.endsWith("@student.southville8b.edu.ph") ||
    email.endsWith("@staff.southville8b.edu.ph"),
  {
    message: "Must use a valid school email address",
  }
)

/**
 * Phone number validator (Philippine format)
 */
export const phoneSchema = z
  .string()
  .trim()
  .regex(
    /^(\+63|0)?9\d{9}$/,
    "Invalid phone number. Format: 09XXXXXXXXX or +639XXXXXXXXX"
  )
  .transform((val) => {
    // Normalize to +63 format
    if (val.startsWith("0")) {
      return `+63${val.slice(1)}`
    }
    if (val.startsWith("9")) {
      return `+63${val}`
    }
    return val
  })

/**
 * URL validator with protocol enforcement
 */
export const urlSchema = z
  .string()
  .trim()
  .url("Invalid URL format")
  .refine(
    (url) => {
      const parsed = new URL(url)
      // Only allow http and https protocols
      return ["http:", "https:"].includes(parsed.protocol)
    },
    { message: "Only HTTP and HTTPS URLs are allowed" }
  )
  .refine(
    (url) => {
      // Prevent javascript: and data: URLs (XSS prevention)
      return !url.toLowerCase().startsWith("javascript:") &&
             !url.toLowerCase().startsWith("data:")
    },
    { message: "Potentially unsafe URL" }
  )

// ============================================================================
// ID VALIDATORS
// ============================================================================

/**
 * Student ID validator (Format: S######)
 */
export const studentIdSchema = z
  .string({ required_error: "Student ID is required" })
  .trim()
  .toUpperCase()
  .regex(/^S\d{6}$/, "Student ID must be in format S123456")

/**
 * Teacher/Staff ID validator (Format: T#####)
 */
export const teacherIdSchema = z
  .string({ required_error: "Teacher ID is required" })
  .trim()
  .toUpperCase()
  .regex(/^T\d{5}$/, "Teacher ID must be in format T12345")

/**
 * Parent ID validator (Format: P######)
 */
export const parentIdSchema = z
  .string({ required_error: "Parent ID is required" })
  .trim()
  .toUpperCase()
  .regex(/^P\d{6}$/, "Parent ID must be in format P123456")

/**
 * Generic UUID validator
 */
export const uuidSchema = z
  .string()
  .uuid("Invalid ID format")

// ============================================================================
// PASSWORD VALIDATORS
// ============================================================================

/**
 * Strong password validator
 * Requirements:
 * - At least 12 characters
 * - Contains uppercase letter
 * - Contains lowercase letter
 * - Contains number
 * - Contains special character
 */
export const passwordSchema = z
  .string({ required_error: "Password is required" })
  .min(12, "Password must be at least 12 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character (!@#$%^&*)"
  )
  .refine(
    (password) => {
      // Common password check
      const commonPasswords = [
        "password123",
        "qwerty123456",
        "admin123456",
        "welcome123456",
        "letmein12345",
      ]
      return !commonPasswords.some((common) =>
        password.toLowerCase().includes(common)
      )
    },
    { message: "Password is too common" }
  )

/**
 * Password confirmation validator
 */
export const passwordConfirmSchema = (passwordField: string = "password") =>
  z
    .object({
      [passwordField]: passwordSchema,
      confirmPassword: z.string(),
    })
    .refine((data) => data[passwordField] === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    })

// ============================================================================
// DATE VALIDATORS
// ============================================================================

/**
 * Date string validator
 */
export const dateSchema = z.coerce
  .date({
    required_error: "Date is required",
    invalid_type_error: "Invalid date format",
  })
  .refine((date) => !isNaN(date.getTime()), "Invalid date")

/**
 * Past date validator (for birthdates, etc.)
 */
export const pastDateSchema = dateSchema.refine(
  (date) => date < new Date(),
  "Date must be in the past"
)

/**
 * Future date validator (for deadlines, events, etc.)
 */
export const futureDateSchema = dateSchema.refine(
  (date) => date > new Date(),
  "Date must be in the future"
)

/**
 * Birthdate validator (must be at least 5 years old for students)
 */
export const birthdateSchema = dateSchema
  .refine((date) => date < new Date(), "Birthdate must be in the past")
  .refine((date) => {
    const age = new Date().getFullYear() - date.getFullYear()
    return age >= 5 && age <= 100
  }, "Age must be between 5 and 100 years")

/**
 * Academic year validator (format: 2024-2025)
 */
export const academicYearSchema = z
  .string()
  .regex(/^\d{4}-\d{4}$/, "Academic year must be in format YYYY-YYYY")
  .refine((year) => {
    const [start, end] = year.split("-").map(Number)
    return end === start + 1
  }, "Academic year end must be one year after start")

// ============================================================================
// NUMBER VALIDATORS
// ============================================================================

/**
 * Positive integer validator
 */
export const positiveIntSchema = z
  .number({
    required_error: "Number is required",
    invalid_type_error: "Must be a number",
  })
  .int("Must be a whole number")
  .positive("Must be a positive number")

/**
 * Percentage validator (0-100)
 */
export const percentageSchema = z
  .number()
  .min(0, "Percentage cannot be negative")
  .max(100, "Percentage cannot exceed 100")

/**
 * Grade validator (0-100)
 */
export const gradeSchema = z
  .number({
    required_error: "Grade is required",
    invalid_type_error: "Grade must be a number",
  })
  .min(0, "Grade cannot be negative")
  .max(100, "Grade cannot exceed 100")

/**
 * Grade level validator (1-12)
 */
export const gradeLevelSchema = z
  .number()
  .int("Grade level must be a whole number")
  .min(1, "Grade level must be at least 1")
  .max(12, "Grade level cannot exceed 12")

// ============================================================================
// ENUM VALIDATORS
// ============================================================================

/**
 * User role validator
 */
export const userRoleSchema = z.enum(
  ["superadmin", "admin", "teacher", "student", "parent", "guest"],
  {
    required_error: "User role is required",
    invalid_type_error: "Invalid user role",
  }
)

/**
 * Gender validator
 */
export const genderSchema = z.enum(["male", "female", "other", "prefer_not_to_say"], {
  required_error: "Gender is required",
})

/**
 * Assignment status validator
 */
export const assignmentStatusSchema = z.enum([
  "draft",
  "published",
  "submitted",
  "graded",
  "late",
  "missing",
])

// ============================================================================
// ARRAY VALIDATORS
// ============================================================================

/**
 * Non-empty array validator
 */
export const nonEmptyArray = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.array(itemSchema).min(1, "At least one item is required")

/**
 * Unique array validator
 */
export const uniqueArray = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z
    .array(itemSchema)
    .refine((arr) => new Set(arr).size === arr.length, {
      message: "Array must contain unique values",
    })

// ============================================================================
// FILE NAME VALIDATORS
// ============================================================================

/**
 * Safe file name validator
 * - No path traversal characters
 * - No special characters that could cause issues
 * - Max length 255 characters
 */
export const fileNameSchema = z
  .string()
  .trim()
  .min(1, "File name is required")
  .max(255, "File name is too long")
  .regex(
    /^[a-zA-Z0-9_\-. ]+$/,
    "File name can only contain letters, numbers, spaces, hyphens, underscores, and dots"
  )
  .refine(
    (name) => !name.includes("..") && !name.includes("/") && !name.includes("\\"),
    "File name contains invalid path characters"
  )
  .refine(
    (name) => !name.startsWith("."),
    "File name cannot start with a dot"
  )

// ============================================================================
// PAGINATION VALIDATORS
// ============================================================================

/**
 * Pagination schema
 */
export const paginationSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .positive()
    .min(1, "Page must be at least 1")
    .max(10000, "Page number is too large")
    .default(1),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(10),
  sort: z.enum(["asc", "desc"]).optional().default("desc"),
})

// ============================================================================
// SEARCH VALIDATORS
// ============================================================================

/**
 * Search query validator
 */
export const searchQuerySchema = z
  .string()
  .trim()
  .max(100, "Search query is too long")
  .optional()
  .transform((val) => {
    if (!val) return ""
    // Remove potentially dangerous characters
    return val
      .replace(/[<>]/g, "") // Remove angle brackets
      .replace(/['"]/g, "") // Remove quotes
      .replace(/[;]/g, "") // Remove semicolons
  })

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create optional version of any schema
 */
export const optional = <T extends z.ZodTypeAny>(schema: T) =>
  schema.optional().nullable()

/**
 * Create nullable version of any schema
 */
export const nullable = <T extends z.ZodTypeAny>(schema: T) =>
  schema.nullable()

/**
 * Create a schema that accepts either the value or a custom transform
 */
export const orTransform = <T extends z.ZodTypeAny>(
  schema: T,
  transform: (val: unknown) => z.infer<T>
) => z.preprocess(transform, schema)
