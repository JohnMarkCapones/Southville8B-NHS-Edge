/**
 * Quiz Store
 *
 * Zustand store for managing quiz creation and editing state (Teacher).
 * Handles quiz builder state, questions, settings, and draft persistence.
 *
 * @module lib/stores/quiz-store
 */

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Quiz,
  QuizQuestion,
  QuizSettings,
  CreateQuestionDto,
  QuestionType,
} from '../api/types';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Quiz builder state
 */
interface QuizBuilderState {
  // Current quiz being edited
  currentQuiz: Quiz | null;
  questions: QuizQuestion[];
  settings: QuizSettings | null;

  // UI state
  isDirty: boolean; // Has unsaved changes
  isSaving: boolean;
  lastSaved: string | null;

  // Actions - Quiz
  setCurrentQuiz: (quiz: Quiz | null) => void;
  updateQuizDetails: (updates: Partial<Quiz>) => void;
  clearQuiz: () => void;

  // Actions - Questions
  setQuestions: (questions: QuizQuestion[]) => void;
  addQuestion: (question: QuizQuestion) => void;
  updateQuestion: (questionId: string, updates: Partial<QuizQuestion>) => void;
  deleteQuestion: (questionId: string) => void;
  reorderQuestions: (startIndex: number, endIndex: number) => void;
  duplicateQuestion: (questionId: string) => void;

  // Actions - Settings
  setSettings: (settings: QuizSettings) => void;
  updateSettings: (updates: Partial<QuizSettings>) => void;

  // Actions - Persistence
  markSaved: () => void;
  markDirty: () => void;
}

// ============================================================================
// STORE
// ============================================================================

/**
 * Quiz store for teacher quiz builder
 *
 * @example
 * ```typescript
 * const { currentQuiz, questions, addQuestion } = useQuizStore();
 *
 * // Add a new question
 * addQuestion({
 *   question_id: 'new-q-1',
 *   quiz_id: currentQuiz.quiz_id,
 *   question_text: 'What is 2+2?',
 *   question_type: QuestionType.MULTIPLE_CHOICE,
 *   points: 1,
 *   order_index: questions.length,
 *   is_required: true,
 *   created_at: new Date().toISOString(),
 *   updated_at: new Date().toISOString()
 * });
 * ```
 */
export const useQuizStore = create<QuizBuilderState>()(
  persist(
    (set, get) => ({
      // ========================================================================
      // INITIAL STATE
      // ========================================================================
      currentQuiz: null,
      questions: [],
      settings: null,
      isDirty: false,
      isSaving: false,
      lastSaved: null,

      // ========================================================================
      // QUIZ ACTIONS
      // ========================================================================

      /**
       * Set the current quiz being edited
       */
      setCurrentQuiz: (quiz) => {
        set({
          currentQuiz: quiz,
          isDirty: false,
        });
      },

      /**
       * Update quiz details
       */
      updateQuizDetails: (updates) => {
        const { currentQuiz } = get();
        if (!currentQuiz) return;

        set({
          currentQuiz: {
            ...currentQuiz,
            ...updates,
            updated_at: new Date().toISOString(),
          },
          isDirty: true,
        });
      },

      /**
       * Clear current quiz and reset state
       */
      clearQuiz: () => {
        set({
          currentQuiz: null,
          questions: [],
          settings: null,
          isDirty: false,
          isSaving: false,
          lastSaved: null,
        });
      },

      // ========================================================================
      // QUESTION ACTIONS
      // ========================================================================

      /**
       * Set all questions (e.g., after loading from API)
       */
      setQuestions: (questions) => {
        set({ questions });
      },

      /**
       * Add a new question
       */
      addQuestion: (question) => {
        const { questions } = get();
        set({
          questions: [...questions, question],
          isDirty: true,
        });
      },

      /**
       * Update a question
       */
      updateQuestion: (questionId, updates) => {
        const { questions } = get();
        set({
          questions: questions.map((q) =>
            q.question_id === questionId
              ? {
                  ...q,
                  ...updates,
                  updated_at: new Date().toISOString(),
                }
              : q
          ),
          isDirty: true,
        });
      },

      /**
       * Delete a question
       */
      deleteQuestion: (questionId) => {
        const { questions } = get();
        const filtered = questions.filter((q) => q.question_id !== questionId);

        // Re-index remaining questions
        const reindexed = filtered.map((q, index) => ({
          ...q,
          order_index: index,
        }));

        set({
          questions: reindexed,
          isDirty: true,
        });
      },

      /**
       * Reorder questions (drag and drop)
       */
      reorderQuestions: (startIndex, endIndex) => {
        const { questions } = get();
        const result = Array.from(questions);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);

        // Update order_index for all questions
        const reordered = result.map((q, index) => ({
          ...q,
          order_index: index,
        }));

        set({
          questions: reordered,
          isDirty: true,
        });
      },

      /**
       * Duplicate a question
       */
      duplicateQuestion: (questionId) => {
        const { questions } = get();
        const original = questions.find((q) => q.question_id === questionId);
        if (!original) return;

        // Create duplicate with new ID
        const duplicate: QuizQuestion = {
          ...original,
          question_id: `temp-${Date.now()}`, // Temporary ID
          question_text: `${original.question_text} (Copy)`,
          order_index: questions.length,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        set({
          questions: [...questions, duplicate],
          isDirty: true,
        });
      },

      // ========================================================================
      // SETTINGS ACTIONS
      // ========================================================================

      /**
       * Set quiz settings
       */
      setSettings: (settings) => {
        set({ settings });
      },

      /**
       * Update quiz settings
       */
      updateSettings: (updates) => {
        const { settings } = get();
        if (!settings) return;

        set({
          settings: {
            ...settings,
            ...updates,
            updated_at: new Date().toISOString(),
          },
          isDirty: true,
        });
      },

      // ========================================================================
      // PERSISTENCE ACTIONS
      // ========================================================================

      /**
       * Mark as saved (no unsaved changes)
       */
      markSaved: () => {
        set({
          isDirty: false,
          lastSaved: new Date().toISOString(),
          isSaving: false,
        });
      },

      /**
       * Mark as dirty (has unsaved changes)
       */
      markDirty: () => {
        set({ isDirty: true });
      },
    }),
    {
      name: 'quiz-builder-storage',
      // Only persist essential data (not UI state)
      partialize: (state) => ({
        currentQuiz: state.currentQuiz,
        questions: state.questions,
        settings: state.settings,
        lastSaved: state.lastSaved,
      }),
    }
  )
);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get total points for quiz
 */
export const getTotalPoints = (questions: QuizQuestion[]): number => {
  return questions.reduce((sum, q) => sum + q.points, 0);
};

/**
 * Validate quiz before publishing
 */
export const validateQuiz = (
  quiz: Quiz | null,
  questions: QuizQuestion[]
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!quiz) {
    errors.push('No quiz data available');
    return { isValid: false, errors };
  }

  // Check required fields
  if (!quiz.title || quiz.title.trim() === '') {
    errors.push('Quiz title is required');
  }

  if (questions.length === 0) {
    errors.push('Quiz must have at least one question');
  }

  // Check question validity
  questions.forEach((q, index) => {
    if (!q.question_text || q.question_text.trim() === '') {
      errors.push(`Question ${index + 1} is missing question text`);
    }

    if (q.points <= 0) {
      errors.push(`Question ${index + 1} must have points greater than 0`);
    }

    // Check multiple choice questions have choices
    if (
      (q.question_type === 'multiple_choice' ||
        q.question_type === 'checkbox') &&
      (!q.quiz_choices || q.quiz_choices.length < 2)
    ) {
      errors.push(
        `Question ${index + 1} must have at least 2 choices`
      );
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Check if quiz can be published
 */
export const canPublishQuiz = (
  quiz: Quiz | null,
  questions: QuizQuestion[]
): boolean => {
  const validation = validateQuiz(quiz, questions);
  return validation.isValid;
};
