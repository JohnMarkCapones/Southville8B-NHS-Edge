/**
 * Authentication Validation Schemas
 * Zod schemas for login, registration, password reset, etc.
 */

import { z } from "zod"
import {
  emailSchema,
  schoolEmailSchema,
  passwordSchema,
  studentIdSchema,
  teacherIdSchema,
  parentIdSchema,
  userRoleSchema,
  phoneSchema,
  birthdateSchema,
  genderSchema,
} from "./common"

// ============================================================================
// LOGIN SCHEMAS
// ============================================================================

/**
 * Student login schema
 */
export const studentLoginSchema = z.object({
  studentId: studentIdSchema,
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(false),
})

export type StudentLoginInput = z.infer<typeof studentLoginSchema>

/**
 * Teacher/Staff login schema
 */
export const teacherLoginSchema = z.object({
  teacherId: teacherIdSchema,
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(false),
})

export type TeacherLoginInput = z.infer<typeof teacherLoginSchema>

/**
 * Parent login schema
 */
export const parentLoginSchema = z.object({
  parentId: parentIdSchema,
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(false),
})

export type ParentLoginInput = z.infer<typeof parentLoginSchema>

/**
 * Email/password login schema (for admins)
 */
export const emailLoginSchema = z.object({
  email: schoolEmailSchema,
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(false),
})

export type EmailLoginInput = z.infer<typeof emailLoginSchema>

/**
 * Generic login schema (accepts any login type)
 */
export const loginSchema = z.union([
  studentLoginSchema,
  teacherLoginSchema,
  parentLoginSchema,
  emailLoginSchema,
])

export type LoginInput = z.infer<typeof loginSchema>

// ============================================================================
// REGISTRATION SCHEMAS
// ============================================================================

/**
 * Student registration schema
 */
export const studentRegistrationSchema = z
  .object({
    // Personal Information
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name is too long")
      .trim()
      .regex(/^[a-zA-Z\s\-']+$/, "First name can only contain letters, spaces, hyphens, and apostrophes"),

    middleName: z
      .string()
      .max(50, "Middle name is too long")
      .trim()
      .regex(/^[a-zA-Z\s\-']*$/, "Middle name can only contain letters, spaces, hyphens, and apostrophes")
      .optional(),

    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name is too long")
      .trim()
      .regex(/^[a-zA-Z\s\-']+$/, "Last name can only contain letters, spaces, hyphens, and apostrophes"),

    birthdate: birthdateSchema,
    gender: genderSchema,

    // Contact Information
    email: schoolEmailSchema,
    phone: phoneSchema.optional(),

    // School Information
    studentId: studentIdSchema,
    gradeLevel: z
      .number()
      .int()
      .min(7, "Grade level must be at least 7")
      .max(12, "Grade level cannot exceed 12"),
    section: z
      .string()
      .min(1, "Section is required")
      .max(20, "Section name is too long")
      .trim(),

    // Security
    password: passwordSchema,
    confirmPassword: z.string(),

    // Consent
    termsAccepted: z
      .boolean()
      .refine((val) => val === true, {
        message: "You must accept the terms and conditions",
      }),

    privacyAccepted: z
      .boolean()
      .refine((val) => val === true, {
        message: "You must accept the privacy policy",
      }),

    parentalConsent: z
      .boolean()
      .refine((val) => val === true, {
        message: "Parental consent is required for students under 18",
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type StudentRegistrationInput = z.infer<typeof studentRegistrationSchema>

/**
 * Teacher registration schema
 */
export const teacherRegistrationSchema = z
  .object({
    // Personal Information
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name is too long")
      .trim(),

    middleName: z.string().max(50, "Middle name is too long").trim().optional(),

    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name is too long")
      .trim(),

    birthdate: birthdateSchema,
    gender: genderSchema,

    // Contact Information
    email: schoolEmailSchema,
    phone: phoneSchema,

    // Employment Information
    teacherId: teacherIdSchema,
    department: z
      .string()
      .min(1, "Department is required")
      .max(100, "Department name is too long")
      .trim(),

    specialization: z
      .string()
      .min(1, "Specialization is required")
      .max(100, "Specialization is too long")
      .trim()
      .optional(),

    // Security
    password: passwordSchema,
    confirmPassword: z.string(),

    // Consent
    termsAccepted: z
      .boolean()
      .refine((val) => val === true, {
        message: "You must accept the terms and conditions",
      }),

    privacyAccepted: z
      .boolean()
      .refine((val) => val === true, {
        message: "You must accept the privacy policy",
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type TeacherRegistrationInput = z.infer<typeof teacherRegistrationSchema>

// ============================================================================
// PASSWORD RESET SCHEMAS
// ============================================================================

/**
 * Password reset request schema (email/ID input)
 */
export const passwordResetRequestSchema = z.object({
  identifier: z
    .string()
    .min(1, "Email or ID is required")
    .trim()
    .transform((val) => val.toUpperCase()),
})

export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>

/**
 * Password reset schema (new password input)
 */
export const passwordResetSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type PasswordResetInput = z.infer<typeof passwordResetSchema>

/**
 * Change password schema (for authenticated users)
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  })

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

// ============================================================================
// TWO-FACTOR AUTHENTICATION SCHEMAS
// ============================================================================

/**
 * OTP verification schema
 */
export const otpVerificationSchema = z.object({
  code: z
    .string()
    .length(6, "OTP code must be exactly 6 digits")
    .regex(/^\d{6}$/, "OTP code must contain only numbers"),
})

export type OTPVerificationInput = z.infer<typeof otpVerificationSchema>

/**
 * Enable 2FA schema
 */
export const enable2FASchema = z.object({
  password: z.string().min(1, "Password is required"),
  code: z
    .string()
    .length(6, "Verification code must be exactly 6 digits")
    .regex(/^\d{6}$/, "Verification code must contain only numbers"),
})

export type Enable2FAInput = z.infer<typeof enable2FASchema>

// ============================================================================
// SESSION SCHEMAS
// ============================================================================

/**
 * Session refresh schema
 */
export const sessionRefreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
})

export type SessionRefreshInput = z.infer<typeof sessionRefreshSchema>

/**
 * Logout schema
 */
export const logoutSchema = z.object({
  allDevices: z.boolean().optional().default(false),
})

export type LogoutInput = z.infer<typeof logoutSchema>

// ============================================================================
// EMAIL VERIFICATION SCHEMAS
// ============================================================================

/**
 * Email verification schema
 */
export const emailVerificationSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
})

export type EmailVerificationInput = z.infer<typeof emailVerificationSchema>

/**
 * Resend verification email schema
 */
export const resendVerificationSchema = z.object({
  email: schoolEmailSchema,
})

export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>

// ============================================================================
// ACCOUNT SECURITY SCHEMAS
// ============================================================================

/**
 * Security questions schema (for account recovery)
 */
export const securityQuestionsSchema = z.object({
  question1: z.object({
    question: z.string().min(1, "Security question is required"),
    answer: z
      .string()
      .min(3, "Answer must be at least 3 characters")
      .max(100, "Answer is too long")
      .trim()
      .toLowerCase(), // Normalize for comparison
  }),
  question2: z.object({
    question: z.string().min(1, "Security question is required"),
    answer: z
      .string()
      .min(3, "Answer must be at least 3 characters")
      .max(100, "Answer is too long")
      .trim()
      .toLowerCase(),
  }),
  question3: z.object({
    question: z.string().min(1, "Security question is required"),
    answer: z
      .string()
      .min(3, "Answer must be at least 3 characters")
      .max(100, "Answer is too long")
      .trim()
      .toLowerCase(),
  }),
})

export type SecurityQuestionsInput = z.infer<typeof securityQuestionsSchema>

/**
 * Account deletion schema (requires password confirmation)
 */
export const accountDeletionSchema = z.object({
  password: z.string().min(1, "Password is required"),
  confirmation: z
    .string()
    .refine(
      (val) => val === "DELETE MY ACCOUNT",
      'You must type "DELETE MY ACCOUNT" to confirm'
    ),
  reason: z
    .string()
    .max(500, "Reason is too long")
    .optional(),
})

export type AccountDeletionInput = z.infer<typeof accountDeletionSchema>
