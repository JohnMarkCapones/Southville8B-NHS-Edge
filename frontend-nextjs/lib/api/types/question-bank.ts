/**
 * Question Bank Type Definitions
 *
 * Types for the reusable question bank system.
 *
 * @module lib/api/types/question-bank
 */

import { QuestionType, QuizChoice, QuizQuestionMetadata } from './quiz';

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Question difficulty levels
 */
export enum QuestionDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

// ============================================================================
// ENTITIES
// ============================================================================

/**
 * Question bank entity
 */
export interface QuestionBank {
  question_id: string;
  question_text: string;
  question_type: QuestionType;
  subject_id?: string;
  difficulty: QuestionDifficulty;
  points: number;
  explanation?: string;
  tags?: string[];
  created_by: string;
  usage_count: number;
  is_public: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;

  // Relations
  question_bank_choices?: QuestionBankChoice[];
  question_bank_metadata?: QuestionBankMetadata;
}

/**
 * Question bank choice
 */
export interface QuestionBankChoice {
  choice_id: string;
  question_id: string;
  choice_text: string;
  is_correct: boolean;
  order_index: number;
  created_at: string;
}

/**
 * Question bank metadata (for complex question types)
 */
export interface QuestionBankMetadata {
  metadata_id: string;
  question_id: string;

  // Same structure as QuizQuestionMetadata
  matching_pairs?: Record<string, string>;
  correct_order?: string[];
  blank_positions?: number[];
  correct_answers?: string[];
  case_sensitive?: boolean;
  min_words?: number;
  max_words?: number;
  grading_rubric?: string;
  scale_min?: number;
  scale_max?: number;
  scale_labels?: { min: string; max: string };
  dropdown_options?: string[];
  allow_partial_credit?: boolean;
  randomize_options?: boolean;

  created_at: string;
  updated_at: string;
}

// ============================================================================
// REQUEST/RESPONSE DTOs
// ============================================================================

/**
 * Question bank with full details
 */
export interface QuestionBankWithDetails extends QuestionBank {
  question_bank_choices: QuestionBankChoice[];
  question_bank_metadata?: QuestionBankMetadata;
}

/**
 * Question bank list response
 */
export interface QuestionBankListResponse {
  data: QuestionBankWithDetails[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Create question bank DTO
 */
export interface CreateQuestionBankDto {
  question_text: string;
  question_type: QuestionType;
  subject_id?: string;
  difficulty: QuestionDifficulty;
  points: number;
  explanation?: string;
  tags?: string[];
  is_public?: boolean;
  choices?: CreateQuestionBankChoiceDto[];
  metadata?: Partial<QuestionBankMetadata>;
}

/**
 * Create question bank choice DTO
 */
export interface CreateQuestionBankChoiceDto {
  choice_text: string;
  is_correct: boolean;
  order_index?: number;
}

/**
 * Update question bank DTO
 */
export interface UpdateQuestionBankDto {
  question_text?: string;
  subject_id?: string;
  difficulty?: QuestionDifficulty;
  points?: number;
  explanation?: string;
  tags?: string[];
  is_public?: boolean;
  choices?: CreateQuestionBankChoiceDto[];
  metadata?: Partial<QuestionBankMetadata>;
}

/**
 * Question bank filters
 */
export interface QuestionBankFilters {
  page?: number;
  limit?: number;
  question_type?: QuestionType;
  subject_id?: string;
  difficulty?: QuestionDifficulty;
  search?: string;
  tags?: string[];
  is_public?: boolean;
}

/**
 * Import question from bank to quiz
 */
export interface ImportQuestionDto {
  question_bank_id: string;
  order_index?: number;
}
