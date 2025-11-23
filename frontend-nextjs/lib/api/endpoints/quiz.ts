/**
 * Quiz API Endpoints
 *
 * Complete API client for quiz system with all 40+ endpoints.
 * Organized by functionality: Student, Teacher (Management, Grading, Monitoring, Analytics, Access Control).
 *
 * @module lib/api/endpoints/quiz
 */

import { apiClient } from '../client';
import type {
  // Core entities
  Quiz,
  QuizWithQuestions,
  QuizQuestion,
  QuizSettings,
  QuizAttempt,
  QuizStudentAnswer,
  QuizAnalytics,
  QuizFlag,
  QuizAccessLink,

  // Response types
  QuizListResponse,
  AvailableQuizzesResponse,
  QuizPreviewResponse,
  StartAttemptResponse,
  SubmitAnswerResponse,
  SubmitQuizResponse,
  QuizAnalyticsResponse,
  QuestionAnalyticsResponse,
  StudentPerformanceResponse,
  StudentAnswersResponse,
  ActiveParticipantsResponse,
  QuizFlagsResponse,
  MonitoringExportResponse,
  GenerateAccessLinkResponse,
  AccessLinkValidationResponse,
  QRCodeResponse,

  // Request DTOs
  CreateQuizDto,
  UpdateQuizDto,
  CreateQuestionDto,
  UpdateQuizSettingsDto,
  AssignQuizToSectionsDto,
  StartQuizAttemptDto,
  SubmitAnswerDto,
  HeartbeatDto,
  GradeAnswerDto,
  BulkGradeDto,
  GenerateAccessLinkDto,
  ValidateAccessTokenDto,
  PublishQuizDto,
  CloneQuizDto,
  TerminateAttemptDto,

  // Filters
  QuizFilters,
  AvailableQuizFilters,
} from '../types';

// ============================================================================
// STUDENT ENDPOINTS
// ============================================================================

/**
 * Student Quiz API
 *
 * Endpoints for students to view and take quizzes.
 */
export const studentQuizApi = {
  /**
   * Get available quizzes for the current student
   *
   * @param filters - Pagination and filter options
   * @returns List of available quizzes with pagination
   *
   * @example
   * ```typescript
   * const quizzes = await studentQuizApi.getAvailableQuizzes({
   *   page: 1,
   *   limit: 10,
   *   subject_id: 'abc-123'
   * });
   * ```
   */
  getAvailableQuizzes: async (
    filters?: AvailableQuizFilters
  ): Promise<AvailableQuizzesResponse> => {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.subject_id) params.append('subjectId', filters.subject_id);

    const queryString = params.toString();
    const endpoint = `/quizzes/available${queryString ? `?${queryString}` : ''}`;

    return apiClient.get<AvailableQuizzesResponse>(endpoint);
  },

  /**
   * Start a quiz attempt
   *
   * @param quizId - Quiz ID
   * @param data - Device fingerprint and other metadata
   * @returns Attempt details with questions
   *
   * @example
   * ```typescript
   * const attempt = await studentQuizApi.startQuizAttempt('quiz-123', {
   *   deviceFingerprint: 'abc123'
   * });
   * ```
   */
  startQuizAttempt: async (
    quizId: string,
    data: StartQuizAttemptDto
  ): Promise<StartAttemptResponse> => {
    return apiClient.post<StartAttemptResponse>(
      `/quiz-attempts/start/${quizId}`,
      data
    );
  },

  /**
   * Submit an answer (auto-saves to session table)
   *
   * @param attemptId - Attempt ID
   * @param data - Answer data
   * @returns Confirmation
   *
   * @example
   * ```typescript
   * await studentQuizApi.submitAnswer('attempt-123', {
   *   question_id: 'q-456',
   *   student_answer: 'Paris',
   *   time_spent: 30
   * });
   * ```
   */
  submitAnswer: async (
    attemptId: string,
    data: SubmitAnswerDto
  ): Promise<SubmitAnswerResponse> => {
    return apiClient.post<SubmitAnswerResponse>(
      `/quiz-attempts/${attemptId}/answer`,
      data
    );
  },

  /**
   * Submit the entire quiz (finalizes attempt)
   *
   * @param attemptId - Attempt ID
   * @returns Final score and grading results
   *
   * @example
   * ```typescript
   * const result = await studentQuizApi.submitQuiz('attempt-123');
   * console.log(`Score: ${result.score}/${result.maxScore}`);
   * ```
   */
  submitQuiz: async (attemptId: string): Promise<SubmitQuizResponse> => {
    return apiClient.post<SubmitQuizResponse>(
      `/quiz-attempts/${attemptId}/submit`
    );
  },

  /**
   * Get attempt details (for review or in-progress)
   *
   * @param attemptId - Attempt ID
   * @returns Attempt with answers and questions
   *
   * @example
   * ```typescript
   * const attempt = await studentQuizApi.getAttemptDetails('attempt-123');
   * ```
   */
  getAttemptDetails: async (attemptId: string): Promise<QuizAttempt> => {
    return apiClient.get<QuizAttempt>(`/quiz-attempts/${attemptId}`);
  },

  /**
   * Get detailed answer review for a completed quiz attempt
   *
   * @param attemptId - Attempt ID
   * @returns Review data with questions, student answers, and correct answers
   *
   * @example
   * ```typescript
   * const review = await studentQuizApi.getAttemptReview('attempt-123');
   * console.log(`Review for ${review.questions.length} questions`);
   * ```
   */
  getAttemptReview: async (attemptId: string): Promise<any> => {
    return apiClient.get<any>(`/quiz-attempts/${attemptId}/review`);
  },

  /**
   * Send heartbeat to keep session alive
   *
   * @param attemptId - Attempt ID
   * @param data - Heartbeat data with device fingerprint
   * @returns Confirmation
   *
   * @example
   * ```typescript
   * await studentQuizApi.sendHeartbeat('attempt-123', {
   *   deviceFingerprint: 'abc123',
   *   tabSwitches: 0,
   *   currentQuestionId: 'q-456'
   * });
   * ```
   */
  sendHeartbeat: async (
    attemptId: string,
    data: HeartbeatDto
  ): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>(
      `/quiz-sessions/${attemptId}/heartbeat`,
      data
    );
  },

  /**
   * Validate session integrity
   *
   * @param attemptId - Attempt ID
   * @param deviceFingerprint - Device fingerprint
   * @returns Validation result
   *
   * @example
   * ```typescript
   * const valid = await studentQuizApi.validateSession('attempt-123', 'abc123');
   * ```
   */
  validateSession: async (
    attemptId: string,
    deviceFingerprint: string
  ): Promise<{ isValid: boolean; reason?: string }> => {
    return apiClient.post<{ isValid: boolean; reason?: string }>(
      `/quiz-sessions/${attemptId}/validate`,
      { deviceFingerprint: deviceFingerprint }
    );
  },

  /**
   * Update student progress for real-time monitoring
   *
   * @param attemptId - Attempt ID
   * @param data - Progress data
   * @returns Confirmation
   *
   * @example
   * ```typescript
   * await studentQuizApi.updateProgress('attempt-123', {
   *   currentQuestionIndex: 2,
   *   questionsAnswered: 2,
   *   progress: 40,
   *   idleTimeSeconds: 0
   * });
   * ```
   */
  updateProgress: async (
    attemptId: string,
    data: {
      currentQuestionIndex: number;
      questionsAnswered: number;
      progress: number;
      idleTimeSeconds?: number;
    }
  ): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>(
      `/quiz-sessions/${attemptId}/progress`,
      data
    );
  },

  /**
   * Submit a security flag for suspicious activity
   *
   * @param attemptId - Attempt ID
   * @param data - Flag data
   * @returns Confirmation
   *
   * @example
   * ```typescript
   * await studentQuizApi.submitFlag('attempt-123', {
   *   flagType: 'tab_switch',
   *   metadata: { count: 1, timestamp: '2025-01-07T12:00:00Z' }
   * });
   * ```
   */
  submitFlag: async (
    attemptId: string,
    data: {
      flagType: string;
      metadata?: any;
    }
  ): Promise<{ success: boolean; message: string }> => {
    return apiClient.post<{ success: boolean; message: string }>(
      `/quiz-sessions/${attemptId}/flag`,
      data
    );
  },
};

// ============================================================================
// TEACHER - QUIZ MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * Teacher Quiz Management API
 *
 * Endpoints for teachers to create, update, and manage quizzes.
 */
export const teacherQuizApi = {
  /**
   * Create a new quiz
   *
   * @param data - Quiz creation data
   * @returns Created quiz
   *
   * @example
   * ```typescript
   * const quiz = await teacherQuizApi.createQuiz({
   *   title: 'Math Quiz 1',
   *   quiz_type: QuizType.ASSESSMENT,
   *   grading_type: GradingType.AUTOMATIC
   * });
   * ```
   */
  createQuiz: async (data: CreateQuizDto): Promise<Quiz> => {
    return apiClient.post<Quiz>('/quizzes', data);
  },

  /**
   * Get all quizzes (teacher's quizzes)
   *
   * @param filters - Filters and pagination
   * @returns List of quizzes
   *
   * @example
   * ```typescript
   * const quizzes = await teacherQuizApi.getQuizzes({
   *   page: 1,
   *   limit: 20,
   *   status: QuizStatus.PUBLISHED
   * });
   * ```
   */
  getQuizzes: async (filters?: QuizFilters): Promise<QuizListResponse> => {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.subject_id) params.append('subjectId', filters.subject_id);
    if (filters?.quiz_type) params.append('quizType', filters.quiz_type);
    if (filters?.search) params.append('search', filters.search);

    const queryString = params.toString();
    const endpoint = `/quizzes${queryString ? `?${queryString}` : ''}`;

    return apiClient.get<QuizListResponse>(endpoint);
  },

  /**
   * Get quiz by ID (with questions and settings)
   *
   * @param quizId - Quiz ID
   * @returns Quiz with full details
   *
   * @example
   * ```typescript
   * const quiz = await teacherQuizApi.getQuizById('quiz-123');
   * ```
   */
  getQuizById: async (quizId: string): Promise<QuizWithQuestions> => {
    return apiClient.get<QuizWithQuestions>(`/quizzes/${quizId}`);
  },

  /**
   * Update quiz (creates new version if active attempts exist)
   *
   * @param quizId - Quiz ID
   * @param data - Update data
   * @returns Updated quiz (or new version)
   *
   * @example
   * ```typescript
   * const updated = await teacherQuizApi.updateQuiz('quiz-123', {
   *   title: 'Updated Title',
   *   time_limit: 60
   * });
   * ```
   */
  updateQuiz: async (quizId: string, data: UpdateQuizDto): Promise<Quiz> => {
    return apiClient.patch<Quiz>(`/quizzes/${quizId}`, data);
  },

  /**
   * Delete (archive) quiz
   *
   * @param quizId - Quiz ID
   * @returns Confirmation
   *
   * @example
   * ```typescript
   * await teacherQuizApi.deleteQuiz('quiz-123');
   * ```
   */
  deleteQuiz: async (quizId: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/quizzes/${quizId}`);
  },

  /**
   * Add question to quiz
   *
   * @param quizId - Quiz ID
   * @param data - Question data
   * @returns Created question
   *
   * @example
   * ```typescript
   * const question = await teacherQuizApi.addQuestion('quiz-123', {
   *   question_text: 'What is 2+2?',
   *   question_type: QuestionType.MULTIPLE_CHOICE,
   *   points: 1,
   *   choices: [
   *     { choice_text: '3', is_correct: false },
   *     { choice_text: '4', is_correct: true }
   *   ]
   * });
   * ```
   */
  addQuestion: async (
    quizId: string,
    data: CreateQuestionDto
  ): Promise<QuizQuestion> => {
    return apiClient.post<QuizQuestion>(`/quizzes/${quizId}/questions`, data);
  },

  /**
   * Update a quiz question
   *
   * @param quizId - Quiz ID
   * @param questionId - Question ID
   * @param data - Question data
   * @returns Updated question
   *
   * @example
   * ```typescript
   * await teacherQuizApi.updateQuestion('quiz-123', 'question-456', {
   *   questionText: 'Updated question text',
   *   points: 5
   * });
   * ```
   */
  updateQuestion: async (
    quizId: string,
    questionId: string,
    data: CreateQuestionDto
  ): Promise<QuizQuestion> => {
    return apiClient.patch<QuizQuestion>(`/quizzes/${quizId}/questions/${questionId}`, data);
  },

  /**
   * Delete a quiz question
   *
   * @param quizId - Quiz ID
   * @param questionId - Question ID
   * @returns Confirmation
   *
   * @example
   * ```typescript
   * await teacherQuizApi.deleteQuestion('quiz-123', 'question-456');
   * ```
   */
  deleteQuestion: async (
    quizId: string,
    questionId: string
  ): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/quizzes/${quizId}/questions/${questionId}`);
  },

  /**
   * Update quiz settings
   *
   * @param quizId - Quiz ID
   * @param data - Settings data
   * @returns Updated settings
   *
   * @example
   * ```typescript
   * await teacherQuizApi.updateSettings('quiz-123', {
   *   lockdown_browser: true,
   *   randomize_questions: true
   * });
   * ```
   */
  updateSettings: async (
    quizId: string,
    data: UpdateQuizSettingsDto
  ): Promise<QuizSettings> => {
    return apiClient.post<QuizSettings>(`/quizzes/${quizId}/settings`, data);
  },

  /**
   * Publish quiz
   *
   * @param quizId - Quiz ID
   * @param publishDto - Publish data including status and optional sectionIds
   * @returns Updated quiz
   *
   * @example
   * ```typescript
   * await teacherQuizApi.publishQuiz('quiz-123', {
   *   status: 'published',
   *   sectionIds: ['section-1', 'section-2']
   * });
   * ```
   */
  publishQuiz: async (
    quizId: string,
    publishDto: { status: string; sectionIds?: string[] }
  ): Promise<Quiz> => {
    return apiClient.post<Quiz>(`/quizzes/${quizId}/publish`, publishDto);
  },

  /**
   * Clone quiz (duplicate with new title)
   *
   * @param quizId - Quiz ID
   * @param data - Clone options
   * @returns Cloned quiz
   *
   * @example
   * ```typescript
   * const cloned = await teacherQuizApi.cloneQuiz('quiz-123', {
   *   newTitle: 'Math Quiz 2 (Cloned)'
   * });
   * ```
   */
  cloneQuiz: async (quizId: string, data?: CloneQuizDto): Promise<Quiz> => {
    return apiClient.post<Quiz>(`/quizzes/${quizId}/clone`, data || {});
  },

  /**
   * Schedule quiz for future availability
   *
   * @param quizId - Quiz ID
   * @param data - Schedule data with dates and sections
   * @returns Scheduled quiz
   *
   * @example
   * ```typescript
   * const scheduled = await teacherQuizApi.scheduleQuiz('quiz-123', {
   *   startDate: '2025-12-01T08:00:00Z',
   *   endDate: '2025-12-15T23:59:59Z',
   *   sectionIds: ['section-1', 'section-2'],
   *   sectionSettings: {
   *     'section-1': { timeLimit: 60 },
   *     'section-2': { timeLimit: 45 }
   *   }
   * });
   * ```
   */
  scheduleQuiz: async (
    quizId: string,
    data: {
      startDate: string;
      endDate?: string;
      sectionIds: string[];
      sectionSettings?: Record<string, { timeLimit?: number }>;
    }
  ): Promise<Quiz> => {
    return apiClient.post<Quiz>(`/quizzes/${quizId}/schedule`, data);
  },

  /**
   * Get quiz preview (for testing before publishing)
   *
   * @param quizId - Quiz ID
   * @returns Preview data
   *
   * @example
   * ```typescript
   * const preview = await teacherQuizApi.getQuizPreview('quiz-123');
   * ```
   */
  getQuizPreview: async (quizId: string): Promise<QuizPreviewResponse> => {
    return apiClient.get<QuizPreviewResponse>(`/quizzes/${quizId}/preview`);
  },

  /**
   * Assign quiz to sections
   *
   * @param quizId - Quiz ID
   * @param data - Section assignment data
   * @returns Confirmation
   *
   * @example
   * ```typescript
   * await teacherQuizApi.assignToSections('quiz-123', {
   *   sectionIds: ['section-1', 'section-2'],
   *   startDate: '2024-03-01T00:00:00Z',
   *   endDate: '2024-03-15T23:59:59Z',
   *   timeLimit: 60
   * });
   * ```
   */
  assignToSections: async (
    quizId: string,
    data: AssignQuizToSectionsDto
  ): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>(
      `/quizzes/${quizId}/assign-sections`,
      data
    );
  },

  /**
   * Get assigned sections for quiz
   *
   * @param quizId - Quiz ID
   * @returns List of sections
   *
   * @example
   * ```typescript
   * const sections = await teacherQuizApi.getAssignedSections('quiz-123');
   * ```
   */
  getAssignedSections: async (quizId: string): Promise<any[]> => {
    return apiClient.get<any[]>(`/quizzes/${quizId}/sections`);
  },

  /**
   * Remove quiz from sections
   *
   * @param quizId - Quiz ID
   * @param sectionIds - Section IDs to remove
   * @returns Confirmation
   *
   * @example
   * ```typescript
   * await teacherQuizApi.removeFromSections('quiz-123', ['section-1']);
   * ```
   */
  removeFromSections: async (
    quizId: string,
    sectionIds: string[]
  ): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(
      `/quizzes/${quizId}/sections`,
      {
        body: { sectionIds },
      } as any
    );
  },

  /**
   * Import question from question bank to quiz
   *
   * @param quizId - Quiz ID
   * @param data - Import question data
   * @returns Imported quiz question
   *
   * @example
   * ```typescript
   * await teacherQuizApi.importQuestionFromBank('quiz-123', {
   *   questionBankId: 'qb-456',
   *   orderIndex: 5
   * });
   * ```
   */
  importQuestionFromBank: async (
    quizId: string,
    data: { questionBankId: string; orderIndex?: number }
  ): Promise<QuizQuestion> => {
    return apiClient.post<QuizQuestion>(
      `/quizzes/${quizId}/import-question`,
      data
    );
  },
};

// ============================================================================
// TEACHER - GRADING ENDPOINTS
// ============================================================================

/**
 * Teacher Grading API
 *
 * Endpoints for manual grading of essay questions.
 */
export const teacherGradingApi = {
  /**
   * Grade a single answer manually
   *
   * @param data - Grading data
   * @returns Confirmation
   *
   * @example
   * ```typescript
   * await teacherGradingApi.gradeAnswer({
   *   answer_id: 'ans-123',
   *   points_earned: 8,
   *   feedback: 'Good analysis, but missing key points.'
   * });
   * ```
   */
  gradeAnswer: async (
    data: GradeAnswerDto
  ): Promise<{ message: string; answer: QuizStudentAnswer }> => {
    return apiClient.post<{ message: string; answer: QuizStudentAnswer }>(
      '/grading/grade-answer',
      data
    );
  },

  /**
   * Bulk grade multiple answers
   *
   * @param attemptId - Attempt ID
   * @param data - Bulk grading data
   * @returns Confirmation
   *
   * @example
   * ```typescript
   * await teacherGradingApi.bulkGrade('attempt-123', {
   *   grades: [
   *     { answer_id: 'ans-1', points_earned: 5, feedback: 'Good!' },
   *     { answer_id: 'ans-2', points_earned: 3, feedback: 'Needs work' }
   *   ]
   * });
   * ```
   */
  bulkGrade: async (
    attemptId: string,
    data: BulkGradeDto
  ): Promise<{ message: string; gradedCount: number }> => {
    return apiClient.post<{ message: string; gradedCount: number }>(
      `/grading/bulk-grade`,
      data
    );
  },

  /**
   * Get answers requiring manual grading
   *
   * @param quizId - Quiz ID
   * @returns List of answers
   *
   * @example
   * ```typescript
   * const answers = await teacherGradingApi.getAnswersToGrade('quiz-123');
   * ```
   */
  getAnswersToGrade: async (quizId: string): Promise<QuizStudentAnswer[]> => {
    return apiClient.get<QuizStudentAnswer[]>(
      `/grading/quiz/${quizId}/pending`
    );
  },
};

// ============================================================================
// TEACHER - MONITORING ENDPOINTS
// ============================================================================

/**
 * Teacher Monitoring API
 *
 * Endpoints for real-time monitoring of quiz sessions.
 */
export const teacherMonitoringApi = {
  /**
   * Get active participants for quiz
   *
   * @param quizId - Quiz ID
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 50)
   * @returns List of active participants with pagination
   *
   * @example
   * ```typescript
   * const participants = await teacherMonitoringApi.getActiveParticipants('quiz-123', 1, 50);
   * ```
   */
  getActiveParticipants: async (
    quizId: string,
    page?: number,
    limit?: number
  ): Promise<ActiveParticipantsResponse> => {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());

    const queryString = params.toString();
    const endpoint = `/quiz-monitoring/quiz/${quizId}/participants${queryString ? `?${queryString}` : ''}`;

    return apiClient.get<ActiveParticipantsResponse>(endpoint);
  },

  /**
   * Get quiz flags (suspicious activities)
   *
   * @param quizId - Quiz ID
   * @returns List of flags
   *
   * @example
   * ```typescript
   * const flags = await teacherMonitoringApi.getQuizFlags('quiz-123');
   * ```
   */
  getQuizFlags: async (quizId: string): Promise<QuizFlagsResponse> => {
    return apiClient.get<QuizFlagsResponse>(
      `/quiz-monitoring/quiz/${quizId}/flags`
    );
  },

  /**
   * Terminate an attempt
   *
   * @param attemptId - Attempt ID
   * @param data - Termination reason
   * @returns Confirmation
   *
   * @example
   * ```typescript
   * await teacherMonitoringApi.terminateAttempt('attempt-123', {
   *   reason: 'Multiple tab switches detected'
   * });
   * ```
   */
  terminateAttempt: async (
    attemptId: string,
    data: TerminateAttemptDto
  ): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>(
      `/quiz-monitoring/attempt/${attemptId}/terminate`,
      data
    );
  },

  /**
   * Export monitoring report (for CSV/PDF generation)
   *
   * @param quizId - Quiz ID
   * @returns Complete monitoring report with participants, flags, and summary
   *
   * @example
   * ```typescript
   * const report = await teacherMonitoringApi.exportReport('quiz-123');
   * // Generate CSV from report.participants
   * // Generate PDF with report.summary
   * ```
   */
  exportReport: async (quizId: string): Promise<MonitoringExportResponse> => {
    return apiClient.get<MonitoringExportResponse>(
      `/quiz-monitoring/quiz/${quizId}/export`
    );
  },
};

// ============================================================================
// TEACHER - ANALYTICS ENDPOINTS
// ============================================================================

/**
 * Teacher Analytics API
 *
 * Endpoints for quiz analytics and performance reports.
 */
export const teacherAnalyticsApi = {
  /**
   * Get quiz analytics (overall stats)
   *
   * @param quizId - Quiz ID
   * @returns Analytics data
   *
   * @example
   * ```typescript
   * const analytics = await teacherAnalyticsApi.getQuizAnalytics('quiz-123');
   * ```
   */
  getQuizAnalytics: async (quizId: string): Promise<QuizAnalyticsResponse> => {
    return apiClient.get<QuizAnalyticsResponse>(`/analytics/quiz/${quizId}`);
  },

  /**
   * Get per-question analytics
   *
   * @param quizId - Quiz ID
   * @returns Question analytics
   *
   * @example
   * ```typescript
   * const questions = await teacherAnalyticsApi.getQuestionAnalytics('quiz-123');
   * ```
   */
  getQuestionAnalytics: async (
    quizId: string
  ): Promise<QuestionAnalyticsResponse> => {
    return apiClient.get<QuestionAnalyticsResponse>(
      `/analytics/quiz/${quizId}/questions`
    );
  },

  /**
   * Get student performance for quiz
   *
   * @param quizId - Quiz ID
   * @returns Student performance data
   *
   * @example
   * ```typescript
   * const students = await teacherAnalyticsApi.getStudentPerformance('quiz-123');
   * ```
   */
  getStudentPerformance: async (
    quizId: string
  ): Promise<StudentPerformanceResponse> => {
    return apiClient.get<StudentPerformanceResponse>(
      `/analytics/quiz/${quizId}/students`
    );
  },

  /**
   * Get detailed answers for a specific student
   *
   * @param quizId - Quiz ID
   * @param studentId - Student ID
   * @returns Student's detailed answers with question info
   *
   * @example
   * ```typescript
   * const answers = await teacherAnalyticsApi.getStudentAnswers('quiz-123', 'student-456');
   * ```
   */
  getStudentAnswers: async (
    quizId: string,
    studentId: string
  ): Promise<StudentAnswersResponse> => {
    return apiClient.get<StudentAnswersResponse>(
      `/analytics/quiz/${quizId}/students/${studentId}/answers`
    );
  },
};

// ============================================================================
// TEACHER - ACCESS CONTROL ENDPOINTS
// ============================================================================

/**
 * Teacher Access Control API
 *
 * Endpoints for managing quiz access links and QR codes.
 */
export const teacherAccessControlApi = {
  /**
   * Generate access link for quiz
   *
   * @param quizId - Quiz ID
   * @param data - Access link options
   * @returns Access link and QR code data
   *
   * @example
   * ```typescript
   * const link = await teacherAccessControlApi.generateAccessLink('quiz-123', {
   *   expiresAt: '2024-12-31T23:59:59Z',
   *   accessCode: 'MATH2024',
   *   maxUses: 100,
   *   requiresAuth: true
   * });
   * ```
   */
  generateAccessLink: async (
    quizId: string,
    data: GenerateAccessLinkDto
  ): Promise<GenerateAccessLinkResponse> => {
    return apiClient.post<GenerateAccessLinkResponse>(
      `/quiz-access/generate/${quizId}`,
      data
    );
  },

  /**
   * Validate access token
   *
   * @param data - Token and access code
   * @returns Validation result
   *
   * @example
   * ```typescript
   * const valid = await teacherAccessControlApi.validateAccessToken({
   *   token: 'abc123...',
   *   accessCode: 'MATH2024'
   * });
   * ```
   */
  validateAccessToken: async (
    data: ValidateAccessTokenDto
  ): Promise<AccessLinkValidationResponse> => {
    return apiClient.post<AccessLinkValidationResponse>(
      '/quiz-access/validate',
      data
    );
  },

  /**
   * Get all access links for quiz
   *
   * @param quizId - Quiz ID
   * @returns List of access links
   *
   * @example
   * ```typescript
   * const links = await teacherAccessControlApi.getAccessLinks('quiz-123');
   * ```
   */
  getAccessLinks: async (quizId: string): Promise<QuizAccessLink[]> => {
    return apiClient.get<QuizAccessLink[]>(
      `/quiz-access/quiz/${quizId}/links`
    );
  },

  /**
   * Revoke access link
   *
   * @param token - Access token
   * @returns Confirmation
   *
   * @example
   * ```typescript
   * await teacherAccessControlApi.revokeAccessLink('abc123...');
   * ```
   */
  revokeAccessLink: async (token: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(
      `/quiz-access/revoke/${token}`
    );
  },

  /**
   * Get QR code for access link
   *
   * @param token - Access token
   * @returns QR code data
   *
   * @example
   * ```typescript
   * const qr = await teacherAccessControlApi.getQRCode('abc123...');
   * ```
   */
  getQRCode: async (token: string): Promise<QRCodeResponse> => {
    return apiClient.get<QRCodeResponse>(`/quiz-access/qr/${token}`);
  },
};

// ============================================================================
// COMBINED EXPORT
// ============================================================================

/**
 * Complete quiz API client
 *
 * @example
 * ```typescript
 * import { quizApi } from '@/lib/api/endpoints/quiz';
 *
 * // Student
 * const quizzes = await quizApi.student.getAvailableQuizzes();
 *
 * // Teacher
 * const quiz = await quizApi.teacher.createQuiz({ title: 'Math Quiz' });
 * ```
 */
export const quizApi = {
  student: studentQuizApi,
  teacher: teacherQuizApi,
  grading: teacherGradingApi,
  monitoring: teacherMonitoringApi,
  analytics: teacherAnalyticsApi,
  accessControl: teacherAccessControlApi,
};
