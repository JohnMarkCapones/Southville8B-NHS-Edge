/**
 * Quiz Validation Utilities
 *
 * Functions for validating quiz data, answers, and user input.
 *
 * @module lib/utils/quiz-validation
 */

import type {
  Quiz,
  QuizQuestion,
  QuestionType,
  QuizSettings,
} from '../api/types';

// ============================================================================
// QUIZ VALIDATION
// ============================================================================

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate quiz before publishing
 *
 * @param quiz - Quiz to validate
 * @param questions - Quiz questions
 * @returns Validation result
 *
 * @example
 * ```typescript
 * const result = validateQuizForPublish(quiz, questions);
 * if (!result.isValid) {
 *   console.error('Validation errors:', result.errors);
 * }
 * ```
 */
export const validateQuizForPublish = (
  quiz: Quiz | null,
  questions: QuizQuestion[]
): ValidationResult => {
  const errors: string[] = [];

  if (!quiz) {
    errors.push('Quiz data is missing');
    return { isValid: false, errors };
  }

  // Basic quiz validation
  if (!quiz.title || quiz.title.trim() === '') {
    errors.push('Quiz title is required');
  }

  if (questions.length === 0) {
    errors.push('Quiz must have at least one question');
  }

  if (!quiz.subject_id) {
    errors.push('Subject is required');
  }

  if (quiz.passing_score && (quiz.passing_score < 0 || quiz.passing_score > 100)) {
    errors.push('Passing score must be between 0 and 100');
  }

  if (quiz.time_limit && quiz.time_limit <= 0) {
    errors.push('Time limit must be greater than 0');
  }

  // Validate questions
  questions.forEach((q, index) => {
    const questionErrors = validateQuestion(q, index + 1);
    errors.push(...questionErrors);
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate a single question
 *
 * @param question - Question to validate
 * @param questionNumber - Question number (for error messages)
 * @returns Array of error messages
 */
export const validateQuestion = (
  question: QuizQuestion,
  questionNumber: number
): string[] => {
  const errors: string[] = [];
  const prefix = `Question ${questionNumber}`;

  // Basic validation
  if (!question.question_text || question.question_text.trim() === '') {
    errors.push(`${prefix}: Question text is required`);
  }

  if (question.points <= 0) {
    errors.push(`${prefix}: Points must be greater than 0`);
  }

  // Type-specific validation
  switch (question.question_type) {
    case 'multiple_choice':
    case 'checkbox':
      if (!question.quiz_choices || question.quiz_choices.length < 2) {
        errors.push(`${prefix}: Must have at least 2 choices`);
      } else {
        const correctChoices = question.quiz_choices.filter((c) => c.is_correct);
        if (correctChoices.length === 0) {
          errors.push(`${prefix}: Must have at least one correct answer`);
        }
        if (
          question.question_type === 'multiple_choice' &&
          correctChoices.length > 1
        ) {
          errors.push(
            `${prefix}: Multiple choice questions can only have one correct answer`
          );
        }
      }
      break;

    case 'true_false':
      if (!question.quiz_choices || question.quiz_choices.length !== 2) {
        errors.push(`${prefix}: True/False questions must have exactly 2 choices`);
      }
      break;

    case 'fill_in_blank':
      if (!question.quiz_question_metadata?.correct_answers) {
        errors.push(`${prefix}: Must specify correct answers for blanks`);
      }
      break;

    case 'matching':
      if (!question.quiz_question_metadata?.matching_pairs) {
        errors.push(`${prefix}: Must specify matching pairs`);
      } else {
        const pairs = Object.keys(question.quiz_question_metadata.matching_pairs);
        if (pairs.length < 2) {
          errors.push(`${prefix}: Must have at least 2 matching pairs`);
        }
      }
      break;

    case 'ordering':
      if (!question.quiz_question_metadata?.correct_order) {
        errors.push(`${prefix}: Must specify correct order`);
      } else if (question.quiz_question_metadata.correct_order.length < 2) {
        errors.push(`${prefix}: Must have at least 2 items to order`);
      }
      break;

    case 'dropdown':
      if (!question.quiz_question_metadata?.dropdown_options) {
        errors.push(`${prefix}: Must specify dropdown options`);
      } else if (question.quiz_question_metadata.dropdown_options.length < 2) {
        errors.push(`${prefix}: Must have at least 2 dropdown options`);
      }
      break;

    case 'linear_scale':
      const metadata = question.quiz_question_metadata;
      if (!metadata?.scale_min || !metadata?.scale_max) {
        errors.push(`${prefix}: Must specify scale range`);
      } else if (metadata.scale_min >= metadata.scale_max) {
        errors.push(`${prefix}: Scale minimum must be less than maximum`);
      }
      break;

    case 'essay':
      const essayMeta = question.quiz_question_metadata;
      if (essayMeta?.min_words && essayMeta?.max_words) {
        if (essayMeta.min_words > essayMeta.max_words) {
          errors.push(`${prefix}: Minimum words cannot exceed maximum words`);
        }
      }
      break;
  }

  return errors;
};

// ============================================================================
// ANSWER VALIDATION
// ============================================================================

/**
 * Validate answer for a question
 *
 * @param question - Question being answered
 * @param answer - Student's answer
 * @returns Validation result
 *
 * @example
 * ```typescript
 * const result = validateAnswer(question, 'Paris');
 * if (!result.isValid) {
 *   alert(result.errors.join(', '));
 * }
 * ```
 */
export const validateAnswer = (
  question: QuizQuestion,
  answer: any
): ValidationResult => {
  const errors: string[] = [];

  // Check if required
  if (question.is_required && (answer === null || answer === undefined || answer === '')) {
    errors.push('This question is required');
    return { isValid: false, errors };
  }

  // If not required and empty, it's valid
  if (answer === null || answer === undefined || answer === '') {
    return { isValid: true, errors: [] };
  }

  // Type-specific validation
  switch (question.question_type) {
    case 'multiple_choice':
    case 'true_false':
      if (typeof answer !== 'string') {
        errors.push('Answer must be a string');
      }
      break;

    case 'checkbox':
      if (!Array.isArray(answer)) {
        errors.push('Answer must be an array');
      } else if (answer.length === 0) {
        errors.push('At least one option must be selected');
      }
      break;

    case 'short_answer':
      if (typeof answer !== 'string') {
        errors.push('Answer must be text');
      } else if (answer.trim().length === 0) {
        errors.push('Answer cannot be empty');
      } else if (answer.length > 500) {
        errors.push('Answer must be 500 characters or less');
      }
      break;

    case 'essay':
      if (typeof answer !== 'string') {
        errors.push('Answer must be text');
      } else {
        const wordCount = answer.trim().split(/\s+/).length;
        const metadata = question.quiz_question_metadata;

        if (metadata?.min_words && wordCount < metadata.min_words) {
          errors.push(
            `Answer must be at least ${metadata.min_words} words (currently ${wordCount})`
          );
        }

        if (metadata?.max_words && wordCount > metadata.max_words) {
          errors.push(
            `Answer must be no more than ${metadata.max_words} words (currently ${wordCount})`
          );
        }
      }
      break;

    case 'fill_in_blank':
      if (!Array.isArray(answer)) {
        errors.push('Answer must be an array');
      } else {
        const expectedBlanks = question.quiz_question_metadata?.blank_positions?.length || 0;
        if (answer.length !== expectedBlanks) {
          errors.push(`Must fill in all ${expectedBlanks} blanks`);
        }
      }
      break;

    case 'matching':
      if (typeof answer !== 'object') {
        errors.push('Answer must be an object');
      } else {
        const expectedPairs = Object.keys(
          question.quiz_question_metadata?.matching_pairs || {}
        ).length;
        const providedPairs = Object.keys(answer).length;
        if (providedPairs !== expectedPairs) {
          errors.push('All pairs must be matched');
        }
      }
      break;

    case 'ordering':
      if (!Array.isArray(answer)) {
        errors.push('Answer must be an array');
      } else {
        const expectedLength =
          question.quiz_question_metadata?.correct_order?.length || 0;
        if (answer.length !== expectedLength) {
          errors.push('All items must be ordered');
        }
      }
      break;

    case 'linear_scale':
      const scale = question.quiz_question_metadata;
      if (typeof answer !== 'number') {
        errors.push('Answer must be a number');
      } else if (
        scale &&
        (answer < scale.scale_min || answer > scale.scale_max)
      ) {
        errors.push(
          `Answer must be between ${scale.scale_min} and ${scale.scale_max}`
        );
      }
      break;

    case 'drag_drop':
      if (typeof answer !== 'object') {
        errors.push('Answer must be an object');
      }
      break;
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate all answers before submission
 *
 * @param questions - All quiz questions
 * @param answers - Map of answers
 * @returns Validation result
 */
export const validateAllAnswers = (
  questions: QuizQuestion[],
  answers: Map<string, any>
): ValidationResult => {
  const errors: string[] = [];

  questions.forEach((question, index) => {
    const answer = answers.get(question.question_id);
    const result = validateAnswer(question, answer);

    if (!result.isValid) {
      result.errors.forEach((error) => {
        errors.push(`Question ${index + 1}: ${error}`);
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ============================================================================
// QUIZ ACCESS VALIDATION
// ============================================================================

/**
 * Check if quiz is currently accessible
 *
 * @param quiz - Quiz to check
 * @returns True if quiz is accessible
 */
export const isQuizAccessible = (quiz: Quiz): boolean => {
  const now = new Date();

  // Check if published
  if (quiz.status !== 'published') {
    return false;
  }

  // Check start date
  if (quiz.start_date) {
    const startDate = new Date(quiz.start_date);
    if (now < startDate) {
      return false;
    }
  }

  // Check end date
  if (quiz.end_date) {
    const endDate = new Date(quiz.end_date);
    if (now > endDate) {
      return false;
    }
  }

  return true;
};

/**
 * Get quiz access status
 *
 * @param quiz - Quiz to check
 * @returns Status string
 */
export const getQuizAccessStatus = (
  quiz: Quiz
): 'upcoming' | 'active' | 'expired' | 'draft' | 'archived' => {
  if (quiz.status === 'draft') return 'draft';
  if (quiz.status === 'archived') return 'archived';

  const now = new Date();

  if (quiz.start_date) {
    const startDate = new Date(quiz.start_date);
    if (now < startDate) {
      return 'upcoming';
    }
  }

  if (quiz.end_date) {
    const endDate = new Date(quiz.end_date);
    if (now > endDate) {
      return 'expired';
    }
  }

  return 'active';
};

/**
 * Calculate time until quiz starts/ends
 *
 * @param quiz - Quiz
 * @returns Time in milliseconds (negative if past)
 */
export const getTimeUntilQuizEvent = (
  quiz: Quiz
): { untilStart: number | null; untilEnd: number | null } => {
  const now = Date.now();

  const untilStart = quiz.start_date
    ? new Date(quiz.start_date).getTime() - now
    : null;

  const untilEnd = quiz.end_date
    ? new Date(quiz.end_date).getTime() - now
    : null;

  return { untilStart, untilEnd };
};
