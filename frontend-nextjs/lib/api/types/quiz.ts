/**
 * Quiz System Type Definitions
 *
 * TypeScript interfaces matching the NestJS backend entities.
 * These types ensure type safety across the quiz system.
 *
 * @module lib/api/types/quiz
 */

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Quiz status enum
 */
export enum QuizStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

/**
 * Question types supported by the quiz system
 */
export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  SHORT_ANSWER = 'short_answer',
  ESSAY = 'essay',
  FILL_IN_BLANK = 'fill_in_blank',
  MATCHING = 'matching',
  ORDERING = 'ordering',
  CHECKBOX = 'checkbox',
  DROPDOWN = 'dropdown',
  LINEAR_SCALE = 'linear_scale',
  DRAG_DROP = 'drag_drop',
}

/**
 * Quiz type enum
 */
export enum QuizType {
  ASSESSMENT = 'assessment',
  PRACTICE = 'practice',
  SURVEY = 'survey',
}

/**
 * Grading type enum
 */
export enum GradingType {
  AUTOMATIC = 'automatic',
  MANUAL = 'manual',
  HYBRID = 'hybrid',
}

/**
 * Quiz attempt status
 */
export enum AttemptStatus {
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
  GRADED = 'graded',
  TERMINATED = 'terminated',
}

// ============================================================================
// CORE ENTITIES
// ============================================================================

/**
 * Quiz entity
 */
export interface Quiz {
  quiz_id: string;
  title: string;
  description?: string;
  created_by: string;
  subject_id?: string;
  status: QuizStatus;
  quiz_type: QuizType;
  grading_type: GradingType;
  total_points: number;
  passing_score?: number;
  time_limit?: number; // in minutes
  start_date?: string; // ISO date string
  end_date?: string; // ISO date string
  is_deleted: boolean;
  version: number;
  parent_quiz_id?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Quiz question entity
 */
export interface QuizQuestion {
  question_id: string;
  quiz_id: string;
  question_text: string;
  question_type: QuestionType;
  points: number;
  order_index: number;
  is_required: boolean;
  time_limit?: number; // per-question time limit in seconds
  explanation?: string;
  created_at: string;
  updated_at: string;

  // Relations
  quiz_choices?: QuizChoice[];
  quiz_question_metadata?: QuizQuestionMetadata;
}

/**
 * Quiz choice entity (for multiple choice, checkbox, etc.)
 */
export interface QuizChoice {
  choice_id: string;
  question_id: string;
  choice_text: string;
  is_correct: boolean;
  order_index: number;
  created_at: string;
}

/**
 * Quiz question metadata (for complex question types)
 */
export interface QuizQuestionMetadata {
  metadata_id: string;
  question_id: string;

  // Matching questions
  matching_pairs?: Record<string, string>;

  // Ordering questions
  correct_order?: string[];

  // Fill-in-blank questions
  blank_positions?: number[];
  correct_answers?: string[];
  case_sensitive?: boolean;

  // Essay questions
  min_words?: number;
  max_words?: number;
  grading_rubric?: string;

  // Linear scale
  scale_min?: number;
  scale_max?: number;
  scale_labels?: { min: string; max: string };

  // Dropdown
  dropdown_options?: string[];

  // General
  allow_partial_credit?: boolean;
  randomize_options?: boolean;

  created_at: string;
  updated_at: string;
}

/**
 * Quiz settings entity
 */
export interface QuizSettings {
  settings_id: string;
  quiz_id: string;

  // Security settings
  lockdown_browser: boolean;
  anti_screenshot: boolean;
  disable_copy_paste: boolean;
  randomize_questions: boolean;
  randomize_choices: boolean;
  one_question_at_time: boolean;
  prevent_backtrack: boolean;

  // Monitoring settings
  track_tab_switches: boolean;
  track_ip_changes: boolean;
  max_tab_switches?: number;
  require_webcam: boolean;
  proctoring_enabled: boolean;

  // Display settings
  show_results_immediately: boolean;
  show_correct_answers: boolean;
  show_explanations: boolean;
  allow_review: boolean;

  // Attempt settings
  max_attempts?: number;
  allow_late_submission: boolean;
  late_penalty_percent?: number;

  created_at: string;
  updated_at: string;
}

/**
 * Quiz section assignment
 */
export interface QuizSection {
  assignment_id: string;
  quiz_id: string;
  section_id: string;
  assigned_by: string;
  section_start_date?: string;
  section_end_date?: string;
  section_time_limit?: number;
  section_settings?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/**
 * Quiz attempt entity
 */
export interface QuizAttempt {
  attempt_id: string;
  quiz_id: string;
  student_id: string;
  attempt_number: number;
  status: AttemptStatus;
  started_at: string;
  submitted_at?: string;
  time_spent?: number; // in seconds
  score?: number;
  max_score: number;
  percentage?: number;
  is_late: boolean;
  randomized_question_order?: string[]; // Array of question IDs
  device_fingerprint?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;

  // Relations
  quiz_student_answers?: QuizStudentAnswer[];
  quiz?: Quiz;
}

/**
 * Student answer entity
 */
export interface QuizStudentAnswer {
  answer_id: string;
  attempt_id: string;
  question_id: string;
  student_answer: any; // JSON field - can be string, array, object
  is_correct?: boolean;
  points_earned?: number;
  points_possible: number;
  time_spent?: number; // in seconds
  is_flagged: boolean;
  feedback?: string;
  graded_by?: string;
  graded_at?: string;
  created_at: string;
  updated_at: string;

  // Relations
  question?: QuizQuestion;
}

/**
 * Quiz session (temporary answers during quiz)
 */
export interface QuizSessionAnswer {
  session_answer_id: string;
  attempt_id: string;
  question_id: string;
  student_answer: any;
  is_flagged: boolean;
  answered_at: string;
  created_at: string;
  updated_at: string;
}

/**
 * Active session tracking
 */
export interface QuizActiveSession {
  session_id: string;
  attempt_id: string;
  student_id: string;
  quiz_id: string;
  device_fingerprint: string;
  ip_address?: string;
  user_agent?: string;
  last_heartbeat: string;
  tab_switches: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Quiz flag (suspicious activity)
 */
export interface QuizFlag {
  flag_id: string;
  attempt_id: string;
  student_id: string;
  quiz_id: string;
  flag_type: string; // 'tab_switch', 'ip_change', 'copy_paste', 'screenshot', etc.
  severity: 'low' | 'medium' | 'high';
  description?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

/**
 * Quiz access link
 */
export interface QuizAccessLink {
  access_link_id: string;
  quiz_id: string;
  token: string;
  created_by: string;
  expires_at?: string;
  access_code?: string;
  max_uses?: number;
  current_uses: number;
  requires_auth: boolean;
  is_active: boolean;
  created_at: string;
}

/**
 * Quiz analytics
 */
export interface QuizAnalytics {
  analytics_id: string;
  quiz_id: string;
  total_attempts: number;
  completed_attempts: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  average_time_spent: number; // in seconds
  pass_rate: number;
  last_calculated: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// REQUEST/RESPONSE DTOs
// ============================================================================

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Quiz list response
 */
export interface QuizListResponse extends PaginatedResponse<Quiz> {}

/**
 * Available quizzes for student
 */
export interface AvailableQuiz extends Quiz {
  sectionStartDate?: string;
  sectionEndDate?: string;
  sectionTimeLimit?: number;
}

export interface AvailableQuizzesResponse extends PaginatedResponse<AvailableQuiz> {}

/**
 * Quiz preview response (for teachers)
 */
export interface QuizPreviewResponse {
  quiz: Quiz;
  questions: QuizQuestion[];
  settings?: QuizSettings;
  preview: true;
  note: string;
}

/**
 * Quiz with questions (full quiz data)
 */
export interface QuizWithQuestions extends Quiz {
  quiz_questions: QuizQuestion[];
  quiz_settings?: QuizSettings;
  quiz_sections?: QuizSection[];
}

/**
 * Start attempt response
 */
export interface StartAttemptResponse {
  attempt: QuizAttempt;
  questions: QuizQuestion[];
  settings: QuizSettings;
  timeLimit?: number;
  message: string;
}

/**
 * Submit answer response
 */
export interface SubmitAnswerResponse {
  message: string;
  saved: boolean;
  answer_id: string;
}

/**
 * Submit quiz response
 */
export interface SubmitQuizResponse {
  message: string;
  attempt: QuizAttempt;
  score: number;
  maxScore: number;
  percentage: number;
  totalScore: number;
  gradedCount: number;
  manualGradingRequired: number;
  autoGraded: boolean;
}

/**
 * Quiz analytics response
 */
export interface QuizAnalyticsResponse {
  quizId: string;
  quizTitle: string;
  totalAttempts: number;
  completedAttempts: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passRate: number;
  averageTimeSpent: number;
  scoreDistribution: {
    range: string;
    count: number;
  }[];
  lastCalculated: string;
}

/**
 * Question analytics
 */
export interface QuestionAnalytics {
  question_id: string;
  question_text: string;
  question_type: string;
  points: number;
  total_attempts: number;
  correct_attempts: number;
  correct_rate: number;
  average_time_spent: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuestionAnalyticsResponse {
  quizId: string;
  questions: QuestionAnalytics[];
}

/**
 * Student performance
 */
export interface StudentPerformance {
  student_id: string;
  student_name: string;
  section: string;
  attempt_number: number;
  score: number;
  max_score: number;
  percentage: number;
  time_spent: number;
  status: string;
  submitted_at?: string;
  is_late: boolean;
}

export interface StudentPerformanceResponse {
  quizId: string;
  students: StudentPerformance[];
}

/**
 * Active participant (for monitoring)
 */
export interface ActiveParticipant {
  attempt_id: string;
  student_id: string;
  student_name: string;
  section: string;
  started_at: string;
  last_heartbeat: string;
  time_elapsed: number;
  questions_answered: number;
  total_questions: number;
  progress: number;
  tab_switches: number;
  is_active: boolean;
  device_fingerprint: string;
}

export interface ActiveParticipantsResponse {
  quizId: string;
  activeCount: number;
  participants: ActiveParticipant[];
}

/**
 * Quiz flags response (for monitoring)
 */
export interface QuizFlagsResponse {
  quizId: string;
  totalFlags: number;
  flags: QuizFlag[];
}

/**
 * Access link validation response
 */
export interface AccessLinkValidationResponse {
  isValid: boolean;
  quizId?: string;
  requiresAuth: boolean;
  reason?: string;
}

/**
 * Generate access link response
 */
export interface GenerateAccessLinkResponse {
  token: string;
  accessLink: string;
  qrCodeData: string;
  expiresAt?: string;
}

/**
 * QR code response
 */
export interface QRCodeResponse {
  qrCodeData: string;
  accessLink: string;
}

// ============================================================================
// REQUEST DTOs (for creating/updating)
// ============================================================================

/**
 * Create quiz DTO
 */
export interface CreateQuizDto {
  title: string;
  description?: string;
  subject_id?: string;
  quiz_type: QuizType;
  grading_type: GradingType;
  time_limit?: number;
  passing_score?: number;
  start_date?: string;
  end_date?: string;
}

/**
 * Update quiz DTO
 */
export interface UpdateQuizDto {
  title?: string;
  description?: string;
  subject_id?: string;
  time_limit?: number;
  passing_score?: number;
  start_date?: string;
  end_date?: string;
}

/**
 * Create question DTO
 */
export interface CreateQuestionDto {
  question_text: string;
  question_type: QuestionType;
  points: number;
  is_required?: boolean;
  time_limit?: number;
  explanation?: string;
  choices?: CreateQuestionChoiceDto[];
  metadata?: Partial<QuizQuestionMetadata>;
}

/**
 * Create question choice DTO
 */
export interface CreateQuestionChoiceDto {
  choice_text: string;
  is_correct: boolean;
  order_index?: number;
}

/**
 * Update quiz settings DTO
 */
export interface UpdateQuizSettingsDto extends Partial<Omit<QuizSettings, 'settings_id' | 'quiz_id' | 'created_at' | 'updated_at'>> {}

/**
 * Assign quiz to sections DTO
 */
export interface AssignQuizToSectionsDto {
  sectionIds: string[];
  startDate?: string;
  endDate?: string;
  timeLimit?: number;
  sectionSettings?: Record<string, any>;
}

/**
 * Start quiz attempt DTO
 */
export interface StartQuizAttemptDto {
  device_fingerprint: string;
}

/**
 * Submit answer DTO
 */
export interface SubmitAnswerDto {
  question_id: string;
  student_answer: any;
  is_flagged?: boolean;
  time_spent?: number;
}

/**
 * Heartbeat DTO
 */
export interface HeartbeatDto {
  device_fingerprint: string;
  tab_switches?: number;
  current_question_id?: string;
}

/**
 * Grade answer DTO
 */
export interface GradeAnswerDto {
  answer_id: string;
  points_earned: number;
  feedback?: string;
}

/**
 * Bulk grade DTO
 */
export interface BulkGradeDto {
  grades: GradeAnswerDto[];
}

/**
 * Generate access link DTO
 */
export interface GenerateAccessLinkDto {
  expiresAt?: string;
  accessCode?: string;
  maxUses?: number;
  requiresAuth?: boolean;
}

/**
 * Validate access token DTO
 */
export interface ValidateAccessTokenDto {
  token: string;
  accessCode?: string;
}

/**
 * Publish quiz DTO
 */
export interface PublishQuizDto {
  publish: boolean;
}

/**
 * Clone quiz DTO
 */
export interface CloneQuizDto {
  newTitle?: string;
}

/**
 * Terminate attempt DTO
 */
export interface TerminateAttemptDto {
  reason: string;
}

// ============================================================================
// FILTERS & QUERY PARAMS
// ============================================================================

/**
 * Quiz list filters
 */
export interface QuizFilters {
  page?: number;
  limit?: number;
  status?: QuizStatus;
  subject_id?: string;
  quiz_type?: QuizType;
  search?: string;
}

/**
 * Available quiz filters (student)
 */
export interface AvailableQuizFilters {
  page?: number;
  limit?: number;
  subject_id?: string;
}

/**
 * Question bank filters
 */
export interface QuestionBankFilters {
  page?: number;
  limit?: number;
  question_type?: QuestionType;
  subject_id?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  search?: string;
}
