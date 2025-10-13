/**
 * File Upload Validation Schemas
 * Secure file upload validation with MIME type checking and magic number verification
 */

import { z } from "zod"
import { fileNameSchema } from "./common"

// ============================================================================
// FILE TYPE DEFINITIONS
// ============================================================================

/**
 * Allowed MIME types for documents
 */
export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf", // PDF
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
  "application/msword", // DOC
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // PPTX
  "application/vnd.ms-powerpoint", // PPT
] as const

/**
 * Allowed MIME types for images
 */
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
] as const

/**
 * Allowed file extensions for documents
 */
export const ALLOWED_DOCUMENT_EXTENSIONS = [
  ".pdf",
  ".docx",
  ".doc",
  ".pptx",
  ".ppt",
] as const

/**
 * Allowed file extensions for images
 */
export const ALLOWED_IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
] as const

/**
 * File size limits (in bytes)
 */
export const FILE_SIZE_LIMITS = {
  document: 10 * 1024 * 1024, // 10 MB
  image: 5 * 1024 * 1024, // 5 MB
  avatar: 2 * 1024 * 1024, // 2 MB
} as const

// ============================================================================
// MAGIC NUMBER SIGNATURES
// ============================================================================

/**
 * File magic numbers for type verification
 * First few bytes of files that identify their actual type
 */
export const MAGIC_NUMBERS = {
  pdf: [0x25, 0x50, 0x44, 0x46], // %PDF
  png: [0x89, 0x50, 0x4e, 0x47], // .PNG
  jpeg: [0xff, 0xd8, 0xff], // JPEG
  gif87: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
  gif89: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], // GIF89a
  zip: [0x50, 0x4b, 0x03, 0x04], // ZIP (DOCX, PPTX are ZIP files)
  doc: [0xd0, 0xcf, 0x11, 0xe0], // Old MS Office (DOC, PPT)
} as const

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if file matches magic number
 * @param file - File to check
 * @param magicNumber - Expected magic number bytes
 */
export async function checkMagicNumber(
  file: File,
  magicNumber: readonly number[]
): Promise<boolean> {
  try {
    const buffer = await file.slice(0, magicNumber.length).arrayBuffer()
    const bytes = new Uint8Array(buffer)

    return magicNumber.every((byte, index) => bytes[index] === byte)
  } catch (error) {
    console.error("Error checking magic number:", error)
    return false
  }
}

/**
 * Verify file type by checking magic number
 * @param file - File to verify
 */
export async function verifyFileType(file: File): Promise<boolean> {
  try {
    const buffer = await file.slice(0, 8).arrayBuffer()
    const bytes = new Uint8Array(buffer)

    // Check PDF
    if (file.type === "application/pdf") {
      return await checkMagicNumber(file, MAGIC_NUMBERS.pdf)
    }

    // Check PNG
    if (file.type === "image/png") {
      return await checkMagicNumber(file, MAGIC_NUMBERS.png)
    }

    // Check JPEG
    if (file.type === "image/jpeg" || file.type === "image/jpg") {
      return await checkMagicNumber(file, MAGIC_NUMBERS.jpeg)
    }

    // Check GIF
    if (file.type === "image/gif") {
      const isGif87 = await checkMagicNumber(file, MAGIC_NUMBERS.gif87)
      const isGif89 = await checkMagicNumber(file, MAGIC_NUMBERS.gif89)
      return isGif87 || isGif89
    }

    // Check DOCX/PPTX (ZIP-based formats)
    if (
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ) {
      return await checkMagicNumber(file, MAGIC_NUMBERS.zip)
    }

    // Check old DOC/PPT formats
    if (
      file.type === "application/msword" ||
      file.type === "application/vnd.ms-powerpoint"
    ) {
      return await checkMagicNumber(file, MAGIC_NUMBERS.doc)
    }

    // If we can't verify, allow it (but log warning)
    console.warn(`Cannot verify file type for: ${file.type}`)
    return true
  } catch (error) {
    console.error("Error verifying file type:", error)
    return false
  }
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".")
  return lastDot === -1 ? "" : filename.slice(lastDot).toLowerCase()
}

/**
 * Sanitize filename to prevent path traversal and other attacks
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .trim()
    .replace(/\.\./g, "") // Remove ".."
    .replace(/[\/\\]/g, "") // Remove slashes
    .replace(/[<>:"|?*]/g, "") // Remove invalid Windows chars
    .replace(/[\x00-\x1f\x80-\x9f]/g, "") // Remove control characters
    .replace(/^\.+/, "") // Remove leading dots
    .slice(0, 255) // Limit length
}

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

/**
 * Base file schema with common validations
 */
const baseFileSchema = z.custom<File>(
  (val) => val instanceof File,
  "Must be a valid file"
)

/**
 * Document file validator
 */
export const documentFileSchema = baseFileSchema
  .refine(
    (file) => file.size <= FILE_SIZE_LIMITS.document,
    `File size must not exceed ${FILE_SIZE_LIMITS.document / 1024 / 1024}MB`
  )
  .refine(
    (file) => ALLOWED_DOCUMENT_TYPES.includes(file.type as any),
    `File type must be one of: ${ALLOWED_DOCUMENT_EXTENSIONS.join(", ")}`
  )
  .refine(
    (file) => {
      const ext = getFileExtension(file.name)
      return ALLOWED_DOCUMENT_EXTENSIONS.includes(ext as any)
    },
    `File extension must be one of: ${ALLOWED_DOCUMENT_EXTENSIONS.join(", ")}`
  )
  .refine((file) => file.name.length <= 255, "Filename is too long")
  .refine(
    (file) => !file.name.includes(".."),
    "Filename contains invalid characters"
  )

/**
 * Image file validator
 */
export const imageFileSchema = baseFileSchema
  .refine(
    (file) => file.size <= FILE_SIZE_LIMITS.image,
    `File size must not exceed ${FILE_SIZE_LIMITS.image / 1024 / 1024}MB`
  )
  .refine(
    (file) => ALLOWED_IMAGE_TYPES.includes(file.type as any),
    `File type must be one of: ${ALLOWED_IMAGE_EXTENSIONS.join(", ")}`
  )
  .refine(
    (file) => {
      const ext = getFileExtension(file.name)
      return ALLOWED_IMAGE_EXTENSIONS.includes(ext as any)
    },
    `File extension must be one of: ${ALLOWED_IMAGE_EXTENSIONS.join(", ")}`
  )
  .refine((file) => file.name.length <= 255, "Filename is too long")

/**
 * Avatar image validator (stricter size limit)
 */
export const avatarFileSchema = baseFileSchema
  .refine(
    (file) => file.size <= FILE_SIZE_LIMITS.avatar,
    `File size must not exceed ${FILE_SIZE_LIMITS.avatar / 1024 / 1024}MB`
  )
  .refine(
    (file) => ALLOWED_IMAGE_TYPES.includes(file.type as any),
    `File type must be one of: ${ALLOWED_IMAGE_EXTENSIONS.join(", ")}`
  )
  .refine(
    (file) => {
      const ext = getFileExtension(file.name)
      return ALLOWED_IMAGE_EXTENSIONS.includes(ext as any)
    },
    `File extension must be one of: ${ALLOWED_IMAGE_EXTENSIONS.join(", ")}`
  )

/**
 * Multiple files upload schema
 */
export const multipleFilesSchema = z
  .array(documentFileSchema)
  .min(1, "At least one file is required")
  .max(10, "Maximum 10 files allowed")

/**
 * Assignment submission schema
 */
export const assignmentSubmissionSchema = z.object({
  files: multipleFilesSchema.optional(),
  comment: z
    .string()
    .max(1000, "Comment is too long")
    .trim()
    .optional(),
  submittedAt: z.coerce.date(),
})

export type AssignmentSubmissionInput = z.infer<typeof assignmentSubmissionSchema>

/**
 * Resource upload schema (for teachers)
 */
export const resourceUploadSchema = z.object({
  file: documentFileSchema,
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title is too long")
    .trim(),
  description: z.string().max(1000, "Description is too long").trim().optional(),
  category: z.enum([
    "lecture_notes",
    "assignment",
    "quiz",
    "exam",
    "reading_material",
    "other",
  ]),
  gradeLevel: z.number().int().min(7).max(12),
  subject: z.string().min(1, "Subject is required").max(100).trim(),
})

export type ResourceUploadInput = z.infer<typeof resourceUploadSchema>

/**
 * Profile picture upload schema
 */
export const profilePictureSchema = z.object({
  file: avatarFileSchema,
})

export type ProfilePictureInput = z.infer<typeof profilePictureSchema>

/**
 * Bulk upload schema (for admin importing multiple records)
 */
export const bulkUploadSchema = z.object({
  file: baseFileSchema
    .refine(
      (file) =>
        file.type === "text/csv" ||
        file.type === "application/vnd.ms-excel" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "File must be CSV or Excel format"
    )
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "File size must not exceed 5MB"
    ),
})

export type BulkUploadInput = z.infer<typeof bulkUploadSchema>

// ============================================================================
// ADVANCED FILE VALIDATION
// ============================================================================

/**
 * Validate file with async checks (magic number, etc.)
 * Use this for more thorough validation
 */
export async function validateFileAsync(
  file: File,
  options: {
    maxSize: number
    allowedTypes: readonly string[]
    allowedExtensions: readonly string[]
    checkMagicNumber?: boolean
  }
): Promise<{ valid: boolean; error?: string }> {
  // Check file size
  if (file.size > options.maxSize) {
    return {
      valid: false,
      error: `File size must not exceed ${options.maxSize / 1024 / 1024}MB`,
    }
  }

  // Check MIME type
  if (!options.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${options.allowedExtensions.join(", ")}`,
    }
  }

  // Check file extension
  const ext = getFileExtension(file.name)
  if (!options.allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `Invalid file extension. Allowed: ${options.allowedExtensions.join(", ")}`,
    }
  }

  // Check magic number (optional but recommended)
  if (options.checkMagicNumber) {
    const isValid = await verifyFileType(file)
    if (!isValid) {
      return {
        valid: false,
        error: "File type verification failed. The file may be corrupted or renamed.",
      }
    }
  }

  // Check filename
  if (file.name.length > 255) {
    return { valid: false, error: "Filename is too long" }
  }

  if (file.name.includes("..") || /[\/\\]/.test(file.name)) {
    return { valid: false, error: "Filename contains invalid characters" }
  }

  return { valid: true }
}

/**
 * Validate document file with magic number check
 */
export async function validateDocument(
  file: File
): Promise<{ valid: boolean; error?: string }> {
  return validateFileAsync(file, {
    maxSize: FILE_SIZE_LIMITS.document,
    allowedTypes: ALLOWED_DOCUMENT_TYPES as any,
    allowedExtensions: ALLOWED_DOCUMENT_EXTENSIONS as any,
    checkMagicNumber: true,
  })
}

/**
 * Validate image file with magic number check
 */
export async function validateImage(
  file: File
): Promise<{ valid: boolean; error?: string }> {
  return validateFileAsync(file, {
    maxSize: FILE_SIZE_LIMITS.image,
    allowedTypes: ALLOWED_IMAGE_TYPES as any,
    allowedExtensions: ALLOWED_IMAGE_EXTENSIONS as any,
    checkMagicNumber: true,
  })
}

/**
 * Validate avatar image with stricter requirements
 */
export async function validateAvatar(
  file: File
): Promise<{ valid: boolean; error?: string }> {
  return validateFileAsync(file, {
    maxSize: FILE_SIZE_LIMITS.avatar,
    allowedTypes: ALLOWED_IMAGE_TYPES as any,
    allowedExtensions: ALLOWED_IMAGE_EXTENSIONS as any,
    checkMagicNumber: true,
  })
}
