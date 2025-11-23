/**
 * Club Forms API Endpoints
 *
 * Provides functions for managing club application forms, questions, and responses.
 * Teachers can create custom forms with questions for student applications.
 * Students submit responses which teachers can review and approve/reject.
 */

import { apiClient } from '../client';

// ============================================================================
// ENUMS
// ============================================================================

export enum FormType {
  MEMBER_REGISTRATION = 'member_registration',
  TEACHER_APPLICATION = 'teacher_application',
  EVENT_SIGNUP = 'event_signup',
  SURVEY = 'survey',
  FEEDBACK = 'feedback',
}

export enum QuestionType {
  TEXT = 'text',           // Short text input - maps to "short-text" in UI
  TEXTAREA = 'textarea',   // Long text input - maps to "long-text" in UI
}

export enum ResponseStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Club Form
 * Represents an application/signup form for a club
 */
export interface ClubForm {
  id: string;
  clubId: string;
  createdBy: string;
  name: string;
  description?: string;
  isActive: boolean;
  autoApprove: boolean;
  formType: FormType;
  createdAt: string;
  updatedAt: string;
  questions?: FormQuestion[];
}

/**
 * Form Question
 * Individual question within a form
 */
export interface FormQuestion {
  id: string;
  formId: string;
  questionText: string;
  questionType: QuestionType;
  required: boolean;
  orderIndex: number;
  options?: QuestionOption[];  // For future dropdown/radio/checkbox support
}

/**
 * Question Option
 * Options for dropdown/radio/checkbox questions (future use)
 */
export interface QuestionOption {
  id: string;
  questionId: string;
  optionText: string;
  optionValue: string;
  orderIndex: number;
}

/**
 * Form Response
 * Student's submission of a form
 */
export interface FormResponse {
  id: string;
  formId: string;
  studentId: string;
  status: ResponseStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  answers: FormAnswer[];
  // Populated fields
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    gradeLevel?: string;
  };
}

/**
 * Form Answer
 * Individual answer to a question
 */
export interface FormAnswer {
  id: string;
  responseId: string;
  questionId: string;
  answerValue: string;
  question?: FormQuestion;
}

// ============================================================================
// DATA TRANSFER OBJECTS (DTOs)
// ============================================================================

/**
 * DTO for creating a new form
 */
export interface CreateClubFormDto {
  name: string;
  description?: string;
  is_active?: boolean;
  auto_approve?: boolean;
  form_type?: FormType;
}

/**
 * DTO for updating a form
 */
export interface UpdateClubFormDto {
  name?: string;
  description?: string;
  is_active?: boolean;
  auto_approve?: boolean;
}

/**
 * DTO for creating a question
 */
export interface CreateFormQuestionDto {
  question_text: string;
  question_type?: QuestionType;
  required?: boolean;
  order_index?: number;
  options?: {
    option_text: string;
    option_value: string;
    order_index?: number;
  }[];
}

/**
 * DTO for updating a question
 */
export interface UpdateFormQuestionDto {
  question_text?: string;
  question_type?: QuestionType;
  required?: boolean;
  order_index?: number;
}

/**
 * DTO for submitting a form response
 */
export interface SubmitFormResponseDto {
  answers: {
    question_id: string;
    answer_value: string;
  }[];
}

/**
 * DTO for reviewing a response
 */
export interface ReviewFormResponseDto {
  status: 'approved' | 'rejected';
  review_notes?: string;
}

// ============================================================================
// API FUNCTIONS - FORM MANAGEMENT
// ============================================================================

/**
 * Get all forms for a club
 */
export const getClubFormsByClub = (clubId: string) =>
  apiClient.get<ClubForm[]>(`/clubs/${clubId}/forms`);

/**
 * Get a single form with its questions
 */
export const getClubFormById = (clubId: string, formId: string) =>
  apiClient.get<ClubForm>(`/clubs/${clubId}/forms/${formId}`);

/**
 * Create a new form for a club
 */
export const createClubFormForClub = (clubId: string, data: CreateClubFormDto) =>
  apiClient.post<ClubForm>(`/clubs/${clubId}/forms`, data);

/**
 * Update an existing form
 */
export const updateClubForm = (clubId: string, formId: string, data: UpdateClubFormDto) =>
  apiClient.patch<ClubForm>(`/clubs/${clubId}/forms/${formId}`, data);

/**
 * Delete a form
 */
export const deleteClubForm = (clubId: string, formId: string) =>
  apiClient.delete(`/clubs/${clubId}/forms/${formId}`);

// ============================================================================
// API FUNCTIONS - QUESTION MANAGEMENT
// ============================================================================

/**
 * Add a question to a form
 */
export const addFormQuestion = (clubId: string, formId: string, data: CreateFormQuestionDto) =>
  apiClient.post<FormQuestion>(`/clubs/${clubId}/forms/${formId}/questions`, data);

/**
 * Update a question
 */
export const updateFormQuestion = (
  clubId: string,
  formId: string,
  questionId: string,
  data: UpdateFormQuestionDto
) =>
  apiClient.patch<FormQuestion>(`/clubs/${clubId}/forms/${formId}/questions/${questionId}`, data);

/**
 * Delete a question
 */
export const deleteFormQuestion = (clubId: string, formId: string, questionId: string) =>
  apiClient.delete(`/clubs/${clubId}/forms/${formId}/questions/${questionId}`);

// ============================================================================
// API FUNCTIONS - RESPONSE MANAGEMENT
// ============================================================================

/**
 * Get all responses for a form
 */
export const getFormResponses = (clubId: string, formId: string) =>
  apiClient.get<FormResponse[]>(`/clubs/${clubId}/forms/${formId}/responses`);

/**
 * Get a single response by ID
 */
export const getFormResponse = (clubId: string, formId: string, responseId: string) =>
  apiClient.get<FormResponse>(`/clubs/${clubId}/forms/${formId}/responses/${responseId}`);

/**
 * Submit a form response (student)
 */
export const submitFormResponse = (clubId: string, formId: string, data: SubmitFormResponseDto) =>
  apiClient.post<FormResponse>(`/clubs/${clubId}/forms/${formId}/responses`, data);

/**
 * Review a form response (approve/reject)
 */
export const reviewFormResponse = (
  clubId: string,
  formId: string,
  responseId: string,
  data: ReviewFormResponseDto
) =>
  apiClient.patch<FormResponse>(
    `/clubs/${clubId}/forms/${formId}/responses/${responseId}/review`,
    data
  );

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Map backend question type to frontend UI type
 */
export const mapQuestionTypeToUI = (backendType: QuestionType): 'short-text' | 'long-text' => {
  return backendType === QuestionType.TEXT ? 'short-text' : 'long-text';
};

/**
 * Map frontend UI type to backend question type
 */
export const mapUITypeToBackend = (uiType: 'short-text' | 'long-text'): QuestionType => {
  return uiType === 'short-text' ? QuestionType.TEXT : QuestionType.TEXTAREA;
};

/**
 * Get status badge color class
 */
export const getResponseStatusColor = (status: ResponseStatus): string => {
  switch (status) {
    case ResponseStatus.PENDING:
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
    case ResponseStatus.APPROVED:
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
    case ResponseStatus.REJECTED:
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
  }
};
