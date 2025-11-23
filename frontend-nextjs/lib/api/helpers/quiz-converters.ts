/**
 * Quiz Type Converters
 *
 * Helper functions to convert between UI formats (teacher quiz builder)
 * and API formats (NestJS backend).
 *
 * These converters ensure type safety and handle the mapping between
 * the quiz builder's interface and the backend API schema.
 *
 * @module lib/api/helpers/quiz-converters
 */

import {
  QuestionType,
  GradingType,
  QuizType,
  QuizStatus,
  QuestionDifficulty,
} from '@/lib/api/types';
import type {
  CreateQuizDto,
  CreateQuestionDto,
  Quiz,
  QuizQuestion,
} from '@/lib/api/types';

// ============================================================================
// UI TYPE DEFINITIONS (matching teacher quiz builder)
// ============================================================================

/**
 * UI Question interface from teacher quiz builder
 */
export interface UIQuestion {
  id: string;
  type:
    | 'multiple-choice'
    | 'checkbox'
    | 'true-false'
    | 'short-answer'
    | 'long-answer'
    | 'fill-blank'
    | 'matching'
    | 'drag-drop'
    | 'ordering'
    | 'dropdown'
    | 'linear-scale'
    | 'essay';
  title: string;
  description?: string;
  options?: string[];
  correctAnswer?: string | string[] | number | boolean;
  correctAnswers?: string[];
  sampleAnswers?: string[];
  maxPoints?: number;
  gradingRubric?: string;
  matchingPairs?: { [key: string]: string };
  dragDropAnswers?: string[];
  orderingItems?: string[];
  dropdownOptions?: string[];
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: { min: string; max: string };
  points: number;
  required: boolean;
  timeLimit?: number;
  randomizeOptions?: boolean;
  estimatedTime?: number;
  // ✅ Image support (Cloudflare Images)
  question_image_url?: string;
  question_image_id?: string;
  question_image_file_size?: number;
  question_image_mime_type?: string;
  questionImageUrl?: string;
  questionImageId?: string;
  questionImageFileSize?: number;
  questionImageMimeType?: string;
}

/**
 * UI Quiz Details interface from teacher quiz builder
 */
export interface UIQuizDetails {
  title: string;
  subject: string;
  grade: string;
  duration: number;
  description: string;
  dueDate: string;
  allowRetakes: boolean;
  shuffleQuestions: boolean;
  showResults: boolean;
}

/**
 * UI Question Bank Item interface
 */
export interface UIQuestionBankItem {
  id: string;
  question: string;
  type: string;
  subject: string;
  difficulty: string;
  tags: string[];
  points: number;
  options?: string[];
  correctAnswer?: any;
  createdAt: string;
}

// ============================================================================
// UI → API CONVERTERS
// ============================================================================

/**
 * Convert UI question type to API QuestionType enum
 */
export function mapQuestionTypeToAPI(
  uiType: UIQuestion['type']
): QuestionType {
  const mapping: Record<UIQuestion['type'], QuestionType> = {
    'multiple-choice': QuestionType.MULTIPLE_CHOICE,
    checkbox: QuestionType.CHECKBOX,
    'true-false': QuestionType.TRUE_FALSE,
    'short-answer': QuestionType.SHORT_ANSWER,
    'long-answer': QuestionType.ESSAY, // Note: long-answer maps to ESSAY
    'fill-blank': QuestionType.FILL_IN_BLANK,
    matching: QuestionType.MATCHING,
    'drag-drop': QuestionType.DRAG_DROP,
    ordering: QuestionType.ORDERING,
    dropdown: QuestionType.DROPDOWN,
    'linear-scale': QuestionType.LINEAR_SCALE,
    essay: QuestionType.ESSAY,
  };
  return mapping[uiType];
}

/**
 * Infer grading type from questions
 */
export function inferGradingType(questions: UIQuestion[]): GradingType {
  const hasAutoGraded = questions.some((q) =>
    ['multiple-choice', 'true-false', 'checkbox'].includes(q.type)
  );
  const hasManualGraded = questions.some((q) =>
    ['short-answer', 'long-answer', 'essay'].includes(q.type)
  );

  if (hasAutoGraded && hasManualGraded) return GradingType.HYBRID;
  if (hasManualGraded) return GradingType.MANUAL;
  return GradingType.AUTOMATIC;
}

/**
 * Convert UI choices to API format with is_correct flag
 */
function convertChoicesToAPI(
  question: UIQuestion
): Array<{ choice_text: string; is_correct: boolean; order_index: number }> | undefined {
  if (!question.options || question.options.length === 0) return undefined;

  return question.options.map((option, index) => {
    let isCorrect = false;

    // Determine if this choice is correct
    if (question.type === 'multiple-choice' || question.type === 'true-false') {
      isCorrect = question.correctAnswer === option;
    } else if (question.type === 'checkbox') {
      // For checkbox, correctAnswers is an array
      isCorrect =
        Array.isArray(question.correctAnswers) &&
        question.correctAnswers.includes(option);
    }

    return {
      choice_text: option,
      is_correct: isCorrect,
      order_index: index,
    };
  });
}

/**
 * Convert UI question metadata to API format
 */
function convertQuestionMetadata(question: UIQuestion): any {
  const metadata: any = {};

  // Matching questions
  if (question.type === 'matching' && question.matchingPairs) {
    metadata.matching_pairs = question.matchingPairs;
  }

  // Ordering questions
  if (question.type === 'ordering' && question.orderingItems) {
    metadata.correct_order = question.orderingItems;
  }

  // Fill-in-blank questions
  if (question.type === 'fill-blank') {
    // Extract blank positions from title ({{blank_0}}, {{blank_1}}, etc.)
    const blankMatches = question.title.match(/{{blank_\d+}}/g) || [];
    metadata.blank_positions = blankMatches.map((_, index) => index);
    metadata.correct_answers = question.options || [];
    metadata.case_sensitive = false; // Default
  }

  // Essay/long-answer questions
  if (question.type === 'essay' || question.type === 'long-answer') {
    if (question.gradingRubric) {
      metadata.grading_rubric = question.gradingRubric;
    }
    if (question.sampleAnswers) {
      metadata.sample_answers = question.sampleAnswers;
    }
  }

  // Linear scale
  if (question.type === 'linear-scale') {
    metadata.scale_min = question.scaleMin || 1;
    metadata.scale_max = question.scaleMax || 5;
    if (question.scaleLabels) {
      metadata.scale_labels = question.scaleLabels;
    }
  }

  // Dropdown
  if (question.type === 'dropdown' && question.dropdownOptions) {
    metadata.dropdown_options = question.dropdownOptions;
  }

  // General settings
  if (question.randomizeOptions) {
    metadata.randomize_options = question.randomizeOptions;
  }

  return Object.keys(metadata).length > 0 ? metadata : undefined;
}

/**
 * Convert UI question to API CreateQuestionDto
 */
export function convertUIQuestionToAPI(
  question: UIQuestion,
  orderIndex: number
): any {
  const questionType = mapQuestionTypeToAPI(question.type);

  return {
    questionText: question.title,
    questionType: questionType,
    orderIndex: orderIndex,
    points: question.points,
    description: question.description || undefined,
    isRequired: question.required ?? false,
    isRandomize: question.randomizeOptions ?? false,
    timeLimitSeconds: question.timeLimit,
    choices: convertChoicesToAPI(question),
    metadata: convertQuestionMetadata(question),
  };
}

/**
 * Convert UI quiz details to API CreateQuizDto
 */
export function convertQuizDetailsToAPI(
  details: UIQuizDetails,
  questions: UIQuestion[]
): any {
  return {
    title: details.title,
    description: details.description,
    type: 'form', // Default to form type
    gradingType: inferGradingType(questions),
    timeLimit: details.duration || undefined,
    endDate: details.dueDate || undefined,
    // Note: subject needs to be mapped to subjectId via lookup
    // This will be handled in the component
  };
}

// ============================================================================
// API → UI CONVERTERS
// ============================================================================

/**
 * Convert API QuestionType enum to UI question type
 */
export function mapQuestionTypeToUI(
  apiType: QuestionType
): UIQuestion['type'] {
  const mapping: Record<QuestionType, UIQuestion['type']> = {
    [QuestionType.MULTIPLE_CHOICE]: 'multiple-choice',
    [QuestionType.CHECKBOX]: 'checkbox',
    [QuestionType.TRUE_FALSE]: 'true-false',
    [QuestionType.SHORT_ANSWER]: 'short-answer',
    [QuestionType.ESSAY]: 'essay',
    [QuestionType.FILL_IN_BLANK]: 'fill-blank',
    [QuestionType.MATCHING]: 'matching',
    [QuestionType.DRAG_DROP]: 'drag-drop',
    [QuestionType.ORDERING]: 'ordering',
    [QuestionType.DROPDOWN]: 'dropdown',
    [QuestionType.LINEAR_SCALE]: 'linear-scale',
  };
  return mapping[apiType] || 'multiple-choice';
}

/**
 * Convert API Quiz to UI QuizDetails
 */
export function convertAPIQuizToUI(apiQuiz: Quiz): UIQuizDetails {
  return {
    title: apiQuiz.title,
    subject: apiQuiz.subject_id || '', // May need subject name lookup
    grade: '', // Not in API, default empty
    duration: apiQuiz.time_limit || 60,
    description: apiQuiz.description || '',
    dueDate: apiQuiz.end_date || '',
    allowRetakes: false, // Will be loaded from settings
    shuffleQuestions: false, // Will be loaded from settings
    showResults: false, // Will be loaded from settings
  };
}

/**
 * Convert API QuizQuestion to UI Question
 */
export function convertAPIQuestionToUI(apiQuestion: QuizQuestion): UIQuestion {
  const uiType = mapQuestionTypeToUI(apiQuestion.question_type);

  // Extract choices
  const options = apiQuestion.quiz_choices?.map((c) => c.choice_text);

  // Extract correct answer(s)
  let correctAnswer: any = undefined;
  let correctAnswers: string[] | undefined = undefined;

  if (apiQuestion.quiz_choices) {
    if (uiType === 'checkbox') {
      correctAnswers = apiQuestion.quiz_choices
        .filter((c) => c.is_correct)
        .map((c) => c.choice_text);
    } else {
      const correctChoice = apiQuestion.quiz_choices.find((c) => c.is_correct);
      correctAnswer = correctChoice?.choice_text;
    }
  }

  // Extract metadata
  const metadata = apiQuestion.quiz_question_metadata;

  return {
    id: apiQuestion.question_id,
    type: uiType,
    title: apiQuestion.question_text,
    description: apiQuestion.description,
    options,
    correctAnswer,
    correctAnswers,
    points: apiQuestion.points,
    required: apiQuestion.is_required,
    timeLimit: apiQuestion.time_limit,
    estimatedTime: undefined, // Not in API
    matchingPairs: metadata?.matching_pairs,
    orderingItems: metadata?.correct_order,
    dropdownOptions: metadata?.dropdown_options,
    scaleMin: metadata?.scale_min,
    scaleMax: metadata?.scale_max,
    scaleLabels: metadata?.scale_labels,
    gradingRubric: metadata?.grading_rubric,
    randomizeOptions: apiQuestion.is_randomize ?? metadata?.randomize_options,
    // ✅ ADD: Image support fields (pass through from API)
    question_image_url: (apiQuestion as any).question_image_url,
    question_image_id: (apiQuestion as any).question_image_id,
    question_image_file_size: (apiQuestion as any).question_image_file_size,
    question_image_mime_type: (apiQuestion as any).question_image_mime_type,
    questionImageUrl: (apiQuestion as any).questionImageUrl,
    questionImageId: (apiQuestion as any).questionImageId,
    questionImageFileSize: (apiQuestion as any).questionImageFileSize,
    questionImageMimeType: (apiQuestion as any).questionImageMimeType,
  } as any;
}

/**
 * Convert API questions array to UI questions array
 */
export function convertAPIQuestionsToUI(
  apiQuestions: QuizQuestion[]
): UIQuestion[] {
  return apiQuestions
    .sort((a, b) => a.order_index - b.order_index)
    .map((q) => convertAPIQuestionToUI(q));
}

/**
 * Convert API question bank item to UI question bank item
 */
export function convertAPIQuestionBankToUI(apiQuestion: any): UIQuestionBankItem {
  return {
    id: apiQuestion.question_id,
    question: apiQuestion.question_text,
    type: mapQuestionTypeToUI(apiQuestion.question_type),
    subject: apiQuestion.subject_id || '',
    difficulty: apiQuestion.difficulty || 'Medium',
    tags: apiQuestion.tags || [],
    points: apiQuestion.points,
    options: apiQuestion.question_bank_choices?.map((c: any) => c.choice_text),
    correctAnswer: apiQuestion.question_bank_choices?.find((c: any) => c.is_correct)?.choice_text,
    createdAt: apiQuestion.created_at,
  };
}

/**
 * Convert UI question bank item to UI question
 */
export function convertQuestionBankItemToQuestion(
  qbItem: UIQuestionBankItem
): UIQuestion {
  // Map question bank type string to UI type
  let uiType: UIQuestion['type'] = 'multiple-choice';

  switch (qbItem.type) {
    case 'Multiple Choice':
      uiType = 'multiple-choice';
      break;
    case 'True/False':
      uiType = 'true-false';
      break;
    case 'Short Answer':
      uiType = 'short-answer';
      break;
    case 'Long Answer':
      uiType = 'long-answer';
      break;
    case 'Essay':
      uiType = 'essay';
      break;
    case 'Fill in the Blank':
      uiType = 'fill-blank';
      break;
    default:
      uiType = 'multiple-choice';
  }

  return {
    id: `question-${Date.now()}-${qbItem.id}`,
    type: uiType,
    title: qbItem.question,
    description: undefined,
    options: qbItem.options ? [...qbItem.options] : undefined,
    correctAnswer: qbItem.correctAnswer,
    correctAnswers: Array.isArray(qbItem.correctAnswer)
      ? qbItem.correctAnswer.map(String)
      : undefined,
    points: qbItem.points,
    required: false,
    estimatedTime: undefined,
  };
}

// ============================================================================
// HELPER UTILITIES
// ============================================================================

/**
 * Get default estimated time based on question type (in minutes)
 */
export function getDefaultEstimatedTime(
  questionType: UIQuestion['type']
): number {
  const timeMap: Record<UIQuestion['type'], number> = {
    'multiple-choice': 1,
    checkbox: 1.5,
    'true-false': 0.5,
    'short-answer': 2,
    'long-answer': 5,
    'fill-blank': 1.5,
    matching: 2,
    'drag-drop': 2,
    ordering: 1.5,
    dropdown: 1,
    'linear-scale': 0.5,
    essay: 10,
  };
  return timeMap[questionType] || 1;
}

/**
 * Validate quiz data before API submission
 */
export function validateQuizData(
  details: UIQuizDetails,
  questions: UIQuestion[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate quiz details
  if (!details.title || details.title.trim() === '') {
    errors.push('Quiz title is required');
  }

  if (!details.subject || details.subject.trim() === '') {
    errors.push('Subject is required');
  }

  if (details.duration <= 0) {
    errors.push('Duration must be greater than 0');
  }

  // Validate questions
  if (questions.length === 0) {
    errors.push('At least one question is required');
  }

  questions.forEach((q, index) => {
    if (!q.title || q.title.trim() === '') {
      errors.push(`Question ${index + 1}: Title is required`);
    }

    if (q.points <= 0) {
      errors.push(`Question ${index + 1}: Points must be greater than 0`);
    }

    // Validate choices for relevant question types
    if (
      ['multiple-choice', 'checkbox', 'true-false'].includes(q.type) &&
      (!q.options || q.options.length < 2)
    ) {
      errors.push(`Question ${index + 1}: At least 2 options required`);
    }

    // Validate correct answer is set
    if (
      ['multiple-choice', 'true-false'].includes(q.type) &&
      !q.correctAnswer
    ) {
      errors.push(`Question ${index + 1}: Correct answer not set`);
    }

    if (q.type === 'checkbox' && (!q.correctAnswers || q.correctAnswers.length === 0)) {
      errors.push(`Question ${index + 1}: At least one correct answer required`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
