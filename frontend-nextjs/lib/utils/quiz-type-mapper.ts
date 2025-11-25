/**
 * Quiz Type Mapper
 *
 * Maps between UI types (from Edge/Quiz) and backend API types.
 * This allows the pretty UI components to work with the backend API.
 */

import type { QuestionType as BackendQuestionType } from '@/lib/api/types/quiz';
import type { QuizType as UIQuizType } from '@/types/quiz';

/**
 * Map UI question type to backend question type
 */
export function mapUITypeToBackend(uiType: UIQuizType): BackendQuestionType | null {
  const mapping: Record<UIQuizType, BackendQuestionType> = {
    'short-answer': 'short_answer' as BackendQuestionType,
    'paragraph': 'essay' as BackendQuestionType,
    'multiple-choice': 'multiple_choice' as BackendQuestionType,
    'checkbox': 'checkbox' as BackendQuestionType,
    'dropdown': 'dropdown' as BackendQuestionType,
    'linear-scale': 'linear_scale' as BackendQuestionType,
    'multiple-choice-grid': 'multiple_choice' as BackendQuestionType, // Map to multiple choice for now
    'checkbox-grid': 'checkbox' as BackendQuestionType, // Map to checkbox for now
    'drag-and-drop': 'drag_drop' as BackendQuestionType,
    'true-false': 'true_false' as BackendQuestionType,
    'matching-pair': 'matching' as BackendQuestionType,
    'fill-in-blank': 'fill_in_blank' as BackendQuestionType,
    'ordering': 'ordering' as BackendQuestionType,
  };

  return mapping[uiType] || null;
}

/**
 * Map backend question type to UI question type
 */
export function mapBackendTypeToUI(backendType: BackendQuestionType): UIQuizType | null {
  const mapping: Record<BackendQuestionType, UIQuizType> = {
    'short_answer': 'short-answer',
    'essay': 'paragraph',
    'multiple_choice': 'multiple-choice',
    'checkbox': 'checkbox',
    'dropdown': 'dropdown',
    'linear_scale': 'linear-scale',
    'drag_drop': 'drag-and-drop',
    'true_false': 'true-false',
    'matching': 'matching-pair',
    'fill_in_blank': 'fill-in-blank',
    'ordering': 'ordering',
  };

  return mapping[backendType] || null;
}
