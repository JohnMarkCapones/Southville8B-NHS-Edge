/**
 * Question Bank API Endpoints
 *
 * API client for managing reusable questions.
 *
 * @module lib/api/endpoints/question-bank
 */

import { apiClient } from '../client';
import type {
  QuestionBank,
  QuestionBankWithDetails,
  QuestionBankListResponse,
  CreateQuestionBankDto,
  UpdateQuestionBankDto,
  QuestionBankFilters,
  ImportQuestionDto,
} from '../types';

/**
 * Question Bank API
 *
 * Endpoints for creating, managing, and reusing questions.
 */
export const questionBankApi = {
  /**
   * Create a new question in the bank
   *
   * @param data - Question data
   * @returns Created question
   *
   * @example
   * ```typescript
   * const question = await questionBankApi.createQuestion({
   *   question_text: 'What is the capital of France?',
   *   question_type: QuestionType.MULTIPLE_CHOICE,
   *   difficulty: QuestionDifficulty.EASY,
   *   points: 1,
   *   choices: [
   *     { choice_text: 'Paris', is_correct: true },
   *     { choice_text: 'London', is_correct: false }
   *   ]
   * });
   * ```
   */
  createQuestion: async (
    data: CreateQuestionBankDto
  ): Promise<QuestionBankWithDetails> => {
    return apiClient.post<QuestionBankWithDetails>('/question-bank', data);
  },

  /**
   * Get all questions from bank (with filters)
   *
   * @param filters - Filter and pagination options
   * @returns List of questions
   *
   * @example
   * ```typescript
   * const questions = await questionBankApi.getQuestions({
   *   page: 1,
   *   limit: 20,
   *   difficulty: QuestionDifficulty.MEDIUM,
   *   subject_id: 'math-123'
   * });
   * ```
   */
  getQuestions: async (
    filters?: QuestionBankFilters
  ): Promise<QuestionBankListResponse> => {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.question_type)
      params.append('questionType', filters.question_type);
    if (filters?.subject_id) params.append('subjectId', filters.subject_id);
    if (filters?.difficulty) params.append('difficulty', filters.difficulty);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.tags) params.append('tags', filters.tags.join(','));
    if (filters?.is_public !== undefined)
      params.append('isPublic', filters.is_public.toString());

    const queryString = params.toString();
    const endpoint = `/question-bank${queryString ? `?${queryString}` : ''}`;

    return apiClient.get<QuestionBankListResponse>(endpoint);
  },

  /**
   * Get question by ID
   *
   * @param questionId - Question ID
   * @returns Question details
   *
   * @example
   * ```typescript
   * const question = await questionBankApi.getQuestionById('q-123');
   * ```
   */
  getQuestionById: async (
    questionId: string
  ): Promise<QuestionBankWithDetails> => {
    return apiClient.get<QuestionBankWithDetails>(
      `/question-bank/${questionId}`
    );
  },

  /**
   * Update question in bank
   *
   * @param questionId - Question ID
   * @param data - Update data
   * @returns Updated question
   *
   * @example
   * ```typescript
   * const updated = await questionBankApi.updateQuestion('q-123', {
   *   question_text: 'Updated question text',
   *   difficulty: QuestionDifficulty.HARD
   * });
   * ```
   */
  updateQuestion: async (
    questionId: string,
    data: UpdateQuestionBankDto
  ): Promise<QuestionBankWithDetails> => {
    return apiClient.patch<QuestionBankWithDetails>(
      `/question-bank/${questionId}`,
      data
    );
  },

  /**
   * Delete question from bank
   *
   * @param questionId - Question ID
   * @returns Confirmation
   *
   * @example
   * ```typescript
   * await questionBankApi.deleteQuestion('q-123');
   * ```
   */
  deleteQuestion: async (
    questionId: string
  ): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(
      `/question-bank/${questionId}`
    );
  },

  /**
   * Import question from bank into quiz
   *
   * @param quizId - Quiz ID
   * @param data - Import data
   * @returns Imported question
   *
   * @example
   * ```typescript
   * await questionBankApi.importToQuiz('quiz-123', {
   *   question_bank_id: 'q-456',
   *   order_index: 5
   * });
   * ```
   */
  importToQuiz: async (
    quizId: string,
    data: ImportQuestionDto
  ): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>(
      `/quizzes/${quizId}/import-question`,
      data
    );
  },

  /**
   * Search questions by text
   *
   * @param searchTerm - Search term
   * @param filters - Additional filters
   * @returns Matching questions
   *
   * @example
   * ```typescript
   * const results = await questionBankApi.searchQuestions('photosynthesis', {
   *   subject_id: 'science-123'
   * });
   * ```
   */
  searchQuestions: async (
    searchTerm: string,
    filters?: Omit<QuestionBankFilters, 'search'>
  ): Promise<QuestionBankListResponse> => {
    return questionBankApi.getQuestions({
      ...filters,
      search: searchTerm,
    });
  },

  /**
   * Get questions by tags
   *
   * @param tags - Array of tags
   * @param filters - Additional filters
   * @returns Matching questions
   *
   * @example
   * ```typescript
   * const results = await questionBankApi.getQuestionsByTags(
   *   ['algebra', 'equations'],
   *   { difficulty: QuestionDifficulty.MEDIUM }
   * );
   * ```
   */
  getQuestionsByTags: async (
    tags: string[],
    filters?: Omit<QuestionBankFilters, 'tags'>
  ): Promise<QuestionBankListResponse> => {
    return questionBankApi.getQuestions({
      ...filters,
      tags,
    });
  },

  /**
   * Get usage statistics for a question
   *
   * @param questionId - Question ID
   * @returns Usage stats
   *
   * @example
   * ```typescript
   * const stats = await questionBankApi.getUsageStats('q-123');
   * ```
   */
  getUsageStats: async (
    questionId: string
  ): Promise<{
    question_id: string;
    usage_count: number;
    quizzes_used_in: string[];
  }> => {
    return apiClient.get<{
      question_id: string;
      usage_count: number;
      quizzes_used_in: string[];
    }>(`/question-bank/${questionId}/usage`);
  },
};
