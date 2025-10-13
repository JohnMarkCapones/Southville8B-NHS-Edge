/**
 * Academic Validation Schemas
 * Assignments, grades, courses, quizzes, etc.
 */

import { z } from "zod"
import {
  safeString,
  dateSchema,
  futureDateSchema,
  gradeSchema,
  gradeLevelSchema,
  percentageSchema,
  positiveIntSchema,
  academicYearSchema,
} from "./common"

// ============================================================================
// ASSIGNMENT SCHEMAS
// ============================================================================

/**
 * Assignment submission schema
 */
export const assignmentSubmissionSchema = z.object({
  assignmentId: z.string().uuid("Invalid assignment ID"),

  content: z
    .string()
    .max(10000, "Submission content is too long")
    .trim()
    .optional(),

  attachments: z
    .array(z.string().url())
    .max(10, "Maximum 10 attachments allowed")
    .optional(),

  submittedAt: dateSchema.default(() => new Date()),

  isDraft: z.boolean().default(false),
})

export type AssignmentSubmissionInput = z.infer<typeof assignmentSubmissionSchema>

/**
 * Assignment creation schema (for teachers)
 */
export const assignmentCreationSchema = z.object({
  title: safeString({ min: 3, max: 200 }),

  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description is too long")
    .trim(),

  instructions: z
    .string()
    .max(10000, "Instructions are too long")
    .trim()
    .optional(),

  dueDate: futureDateSchema,

  gradeLevel: gradeLevelSchema,

  subject: safeString({ min: 2, max: 100 }),

  section: safeString({ max: 20, required: false }).optional(),

  totalPoints: z
    .number()
    .int()
    .positive()
    .min(1, "Total points must be at least 1")
    .max(1000, "Total points cannot exceed 1000"),

  passingScore: percentageSchema.optional(),

  allowLateSubmission: z.boolean().default(false),

  latePenalty: percentageSchema.optional(),

  attachments: z
    .array(z.string().url())
    .max(10, "Maximum 10 attachments allowed")
    .optional(),

  category: z.enum([
    "homework",
    "quiz",
    "exam",
    "project",
    "activity",
    "other",
  ]),
})

export type AssignmentCreationInput = z.infer<typeof assignmentCreationSchema>

// ============================================================================
// GRADE SCHEMAS
// ============================================================================

/**
 * Grade entry schema (for teachers)
 */
export const gradeEntrySchema = z.object({
  studentId: z.string().uuid("Invalid student ID"),
  assignmentId: z.string().uuid("Invalid assignment ID"),

  score: gradeSchema,
  totalPoints: positiveIntSchema,

  feedback: z
    .string()
    .max(2000, "Feedback is too long")
    .trim()
    .optional(),

  gradedAt: dateSchema.default(() => new Date()),

  isExcused: z.boolean().default(false),
  isLate: z.boolean().default(false),
})

export type GradeEntryInput = z.infer<typeof gradeEntrySchema>

/**
 * Grade update schema
 */
export const gradeUpdateSchema = z.object({
  score: gradeSchema,
  feedback: safeString({ max: 2000, required: false }).optional(),
  isExcused: z.boolean().optional(),
})

export type GradeUpdateInput = z.infer<typeof gradeUpdateSchema>

// ============================================================================
// QUIZ SCHEMAS
// ============================================================================

/**
 * Quiz question schema
 */
export const quizQuestionSchema = z.object({
  type: z.enum([
    "multiple_choice",
    "true_false",
    "short_answer",
    "essay",
    "fill_blank",
  ]),

  question: safeString({ min: 5, max: 1000 }),

  points: positiveIntSchema,

  // For multiple choice
  options: z
    .array(safeString({ min: 1, max: 500 }))
    .min(2, "Multiple choice questions must have at least 2 options")
    .max(10, "Maximum 10 options allowed")
    .optional(),

  correctAnswer: z.union([
    z.string(), // For single answer
    z.array(z.string()), // For multiple correct answers
  ]).optional(),

  explanation: safeString({ max: 1000, required: false }).optional(),

  order: positiveIntSchema,
})

export type QuizQuestionInput = z.infer<typeof quizQuestionSchema>

/**
 * Quiz creation schema
 */
export const quizCreationSchema = z.object({
  title: safeString({ min: 3, max: 200 }),

  description: safeString({ max: 2000, required: false }).optional(),

  gradeLevel: gradeLevelSchema,

  subject: safeString({ min: 2, max: 100 }),

  section: safeString({ max: 20, required: false }).optional(),

  dueDate: futureDateSchema,

  duration: z
    .number()
    .int()
    .positive()
    .min(5, "Duration must be at least 5 minutes")
    .max(300, "Duration cannot exceed 300 minutes (5 hours)"),

  totalPoints: positiveIntSchema,

  passingScore: percentageSchema,

  questions: z
    .array(quizQuestionSchema)
    .min(1, "Quiz must have at least 1 question")
    .max(100, "Quiz cannot have more than 100 questions"),

  shuffleQuestions: z.boolean().default(false),
  shuffleOptions: z.boolean().default(false),

  allowReview: z.boolean().default(true),
  showCorrectAnswers: z.boolean().default(false),

  attemptsAllowed: z
    .number()
    .int()
    .positive()
    .min(1)
    .max(10)
    .default(1),
})

export type QuizCreationInput = z.infer<typeof quizCreationSchema>

/**
 * Quiz submission schema
 */
export const quizSubmissionSchema = z.object({
  quizId: z.string().uuid("Invalid quiz ID"),

  answers: z.array(
    z.object({
      questionId: z.string().uuid(),
      answer: z.union([
        z.string(),
        z.array(z.string()),
      ]),
    })
  ),

  timeSpent: positiveIntSchema, // in seconds

  submittedAt: dateSchema.default(() => new Date()),
})

export type QuizSubmissionInput = z.infer<typeof quizSubmissionSchema>

// ============================================================================
// COURSE SCHEMAS
// ============================================================================

/**
 * Course enrollment schema
 */
export const courseEnrollmentSchema = z.object({
  courseId: z.string().uuid("Invalid course ID"),
  section: safeString({ max: 20, required: false }).optional(),
  academicYear: academicYearSchema,
})

export type CourseEnrollmentInput = z.infer<typeof courseEnrollmentSchema>

/**
 * Course creation schema (for admins/teachers)
 */
export const courseCreationSchema = z.object({
  code: z
    .string()
    .min(2, "Course code must be at least 2 characters")
    .max(20, "Course code is too long")
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9\-]+$/, "Course code can only contain letters, numbers, and hyphens"),

  name: safeString({ min: 3, max: 200 }),

  description: z
    .string()
    .max(2000, "Description is too long")
    .trim()
    .optional(),

  gradeLevel: gradeLevelSchema,

  subject: safeString({ min: 2, max: 100 }),

  credits: z
    .number()
    .positive()
    .min(0.5)
    .max(10)
    .default(1),

  teacherId: z.string().uuid("Invalid teacher ID"),

  section: safeString({ max: 20, required: false }).optional(),

  academicYear: academicYearSchema,

  maxStudents: positiveIntSchema.optional(),

  schedule: z
    .array(
      z.object({
        day: z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]),
        startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
        endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
        room: safeString({ max: 50, required: false }).optional(),
      })
    )
    .optional(),
})

export type CourseCreationInput = z.infer<typeof courseCreationSchema>

// ============================================================================
// ATTENDANCE SCHEMAS
// ============================================================================

/**
 * Attendance record schema
 */
export const attendanceRecordSchema = z.object({
  studentId: z.string().uuid("Invalid student ID"),
  courseId: z.string().uuid("Invalid course ID"),

  date: dateSchema,

  status: z.enum(["present", "absent", "late", "excused"]),

  remarks: safeString({ max: 500, required: false }).optional(),

  arrivedAt: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)")
    .optional(),
})

export type AttendanceRecordInput = z.infer<typeof attendanceRecordSchema>

// ============================================================================
// COMMENT/FEEDBACK SCHEMAS
// ============================================================================

/**
 * Teacher comment/feedback schema
 */
export const teacherCommentSchema = z.object({
  studentId: z.string().uuid("Invalid student ID"),

  subject: safeString({ min: 3, max: 200 }),

  content: z
    .string()
    .min(10, "Comment must be at least 10 characters")
    .max(2000, "Comment is too long")
    .trim(),

  category: z.enum([
    "academic",
    "behavior",
    "attendance",
    "general",
  ]),

  isPrivate: z.boolean().default(false),

  createdAt: dateSchema.default(() => new Date()),
})

export type TeacherCommentInput = z.infer<typeof teacherCommentSchema>

// ============================================================================
// SCHEDULE SCHEMAS
// ============================================================================

/**
 * Class schedule schema
 */
export const classScheduleSchema = z.object({
  courseId: z.string().uuid("Invalid course ID"),

  day: z.enum([
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ]),

  startTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),

  endTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),

  room: safeString({ max: 50, required: false }).optional(),

  teacherId: z.string().uuid("Invalid teacher ID"),
})

export type ClassScheduleInput = z.infer<typeof classScheduleSchema>

// ============================================================================
// ANNOUNCEMENT SCHEMAS
// ============================================================================

/**
 * Announcement creation schema
 */
export const announcementSchema = z.object({
  title: safeString({ min: 5, max: 200 }),

  content: z
    .string()
    .min(10, "Content must be at least 10 characters")
    .max(5000, "Content is too long")
    .trim(),

  category: z.enum([
    "general",
    "academic",
    "event",
    "urgent",
    "maintenance",
  ]),

  audience: z.enum(["all", "students", "teachers", "parents", "specific_grade"]),

  gradeLevel: gradeLevelSchema.optional(),

  isPinned: z.boolean().default(false),

  expiresAt: futureDateSchema.optional(),

  attachments: z
    .array(z.string().url())
    .max(5, "Maximum 5 attachments allowed")
    .optional(),
})

export type AnnouncementInput = z.infer<typeof announcementSchema>
