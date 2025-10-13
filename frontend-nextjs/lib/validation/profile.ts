/**
 * Profile Validation Schemas
 * User profile updates, settings, and preferences
 */

import { z } from "zod"
import {
  safeString,
  emailSchema,
  phoneSchema,
  birthdateSchema,
  genderSchema,
  urlSchema,
} from "./common"

// ============================================================================
// PROFILE UPDATE SCHEMAS
// ============================================================================

/**
 * Student profile update schema
 */
export const studentProfileUpdateSchema = z.object({
  // Personal Information
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name is too long")
    .trim()
    .regex(
      /^[a-zA-Z\s\-']+$/,
      "First name can only contain letters, spaces, hyphens, and apostrophes"
    )
    .optional(),

  middleName: z
    .string()
    .max(50, "Middle name is too long")
    .trim()
    .regex(
      /^[a-zA-Z\s\-']*$/,
      "Middle name can only contain letters, spaces, hyphens, and apostrophes"
    )
    .optional(),

  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name is too long")
    .trim()
    .regex(
      /^[a-zA-Z\s\-']+$/,
      "Last name can only contain letters, spaces, hyphens, and apostrophes"
    )
    .optional(),

  birthdate: birthdateSchema.optional(),
  gender: genderSchema.optional(),

  // Contact Information
  phone: phoneSchema.optional(),

  // Bio/About
  bio: z
    .string()
    .max(500, "Bio is too long (max 500 characters)")
    .trim()
    .optional(),

  // Social Links (optional)
  socialLinks: z
    .object({
      facebook: urlSchema.optional(),
      instagram: urlSchema.optional(),
      twitter: urlSchema.optional(),
    })
    .optional(),

  // Preferences
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  darkMode: z.boolean().optional(),
})

export type StudentProfileUpdateInput = z.infer<typeof studentProfileUpdateSchema>

/**
 * Teacher profile update schema
 */
export const teacherProfileUpdateSchema = z.object({
  // Personal Information
  firstName: safeString({ min: 2, max: 50 }).optional(),
  middleName: safeString({ max: 50, required: false }).optional(),
  lastName: safeString({ min: 2, max: 50 }).optional(),

  birthdate: birthdateSchema.optional(),
  gender: genderSchema.optional(),

  // Contact Information
  phone: phoneSchema.optional(),

  // Professional Information
  department: safeString({ min: 1, max: 100 }).optional(),
  specialization: safeString({ max: 100, required: false }).optional(),

  bio: z
    .string()
    .max(1000, "Bio is too long (max 1000 characters)")
    .trim()
    .optional(),

  // Office Information
  officeLocation: safeString({ max: 100, required: false }).optional(),
  officeHours: safeString({ max: 200, required: false }).optional(),

  // Preferences
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  darkMode: z.boolean().optional(),
})

export type TeacherProfileUpdateInput = z.infer<typeof teacherProfileUpdateSchema>

// ============================================================================
// CONTACT INFORMATION SCHEMAS
// ============================================================================

/**
 * Emergency contact schema
 */
export const emergencyContactSchema = z.object({
  name: safeString({ min: 2, max: 100 }),
  relationship: z.enum([
    "parent",
    "guardian",
    "sibling",
    "spouse",
    "other",
  ]),
  phone: phoneSchema,
  alternatePhone: phoneSchema.optional(),
  email: emailSchema.optional(),
})

export type EmergencyContactInput = z.infer<typeof emergencyContactSchema>

/**
 * Address schema
 */
export const addressSchema = z.object({
  street: safeString({ min: 5, max: 200 }),
  barangay: safeString({ min: 2, max: 100 }),
  city: safeString({ min: 2, max: 100 }),
  province: safeString({ min: 2, max: 100 }),
  zipCode: z
    .string()
    .regex(/^\d{4}$/, "ZIP code must be 4 digits")
    .optional(),
  country: safeString({ min: 2, max: 100 }).default("Philippines"),
})

export type AddressInput = z.infer<typeof addressSchema>

// ============================================================================
// PREFERENCES SCHEMAS
// ============================================================================

/**
 * Notification preferences schema
 */
export const notificationPreferencesSchema = z.object({
  email: z.object({
    enabled: z.boolean(),
    assignments: z.boolean(),
    grades: z.boolean(),
    announcements: z.boolean(),
    events: z.boolean(),
    messages: z.boolean(),
  }),

  push: z.object({
    enabled: z.boolean(),
    assignments: z.boolean(),
    grades: z.boolean(),
    announcements: z.boolean(),
    events: z.boolean(),
    messages: z.boolean(),
  }),

  inApp: z.object({
    enabled: z.boolean(),
    assignments: z.boolean(),
    grades: z.boolean(),
    announcements: z.boolean(),
    events: z.boolean(),
    messages: z.boolean(),
  }),
})

export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>

/**
 * Privacy settings schema
 */
export const privacySettingsSchema = z.object({
  profileVisibility: z.enum(["public", "school", "private"]),
  showEmail: z.boolean(),
  showPhone: z.boolean(),
  showBirthdate: z.boolean(),
  allowMessages: z.boolean(),
  allowFriendRequests: z.boolean(),
})

export type PrivacySettingsInput = z.infer<typeof privacySettingsSchema>

/**
 * Appearance preferences schema
 */
export const appearancePreferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system", "gaming"]),
  fontSize: z.enum(["small", "medium", "large"]),
  language: z.enum(["en", "tl", "ceb"]), // English, Tagalog, Cebuano
  reducedMotion: z.boolean(),
  highContrast: z.boolean(),
})

export type AppearancePreferencesInput = z.infer<typeof appearancePreferencesSchema>

// ============================================================================
// AVATAR/PROFILE PICTURE SCHEMAS
// ============================================================================

/**
 * Avatar update schema (just URL/path, actual upload handled separately)
 */
export const avatarUpdateSchema = z.object({
  avatarUrl: z.string().url("Invalid avatar URL"),
})

export type AvatarUpdateInput = z.infer<typeof avatarUpdateSchema>

// ============================================================================
// PARENT/GUARDIAN SCHEMAS
// ============================================================================

/**
 * Parent/Guardian information schema
 */
export const parentGuardianSchema = z.object({
  firstName: safeString({ min: 2, max: 50 }),
  middleName: safeString({ max: 50, required: false }).optional(),
  lastName: safeString({ min: 2, max: 50 }),

  relationship: z.enum([
    "mother",
    "father",
    "legal_guardian",
    "grandparent",
    "sibling",
    "other",
  ]),

  phone: phoneSchema,
  alternatePhone: phoneSchema.optional(),
  email: emailSchema,

  occupation: safeString({ max: 100, required: false }).optional(),
  employer: safeString({ max: 100, required: false }).optional(),

  isPrimaryContact: z.boolean(),
  canPickup: z.boolean(),
  emergencyContact: z.boolean(),
})

export type ParentGuardianInput = z.infer<typeof parentGuardianSchema>
