/**
 * Quiz Attempt Store
 *
 * Zustand store for managing active quiz attempts (Student).
 * Handles answer state, timer, auto-save, and session management.
 *
 * @module lib/stores/quiz-attempt-store
 */

'use client';

import { create } from 'zustand';
import type {
  QuizAttempt,
  QuizQuestion,
  QuizSettings,
  Quiz,
} from '../api/types';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Answer state for a question
 */
export interface QuestionAnswer {
  question_id: string;
  student_answer: any; // String, array, object depending on question type
  is_flagged: boolean;
  is_correct?: boolean | null; // For graded answers
  time_spent: number; // in seconds
  answered_at: string;
}

/**
 * Quiz attempt state
 */
interface QuizAttemptState {
  // Current attempt data
  attempt: QuizAttempt | null;
  quiz: Quiz | null;
  questions: QuizQuestion[];
  settings: QuizSettings | null;

  // Answers
  answers: Map<string, QuestionAnswer>;

  // Timer state
  timeRemaining: number | null; // in seconds
  timeElapsed: number; // in seconds
  timerActive: boolean;

  // Session state
  deviceFingerprint: string | null;
  lastHeartbeat: string | null;
  tabSwitchCount: number;
  isActive: boolean;

  // UI state
  currentQuestionIndex: number;
  isSaving: boolean;
  lastSaved: string | null;
  showSubmitDialog: boolean;

  // Actions - Attempt
  setAttempt: (
    attempt: QuizAttempt,
    quiz: Quiz,
    questions: QuizQuestion[],
    settings: QuizSettings,
    deviceFingerprint: string
  ) => void;
  setQuiz: (quiz: Quiz) => void;
  setQuestions: (questions: QuizQuestion[]) => void;
  clearAttempt: () => void;

  // Actions - Answers
  setAnswer: (questionId: string, answer: QuestionAnswer) => void;
  flagQuestion: (questionId: string, flagged: boolean) => void;
  getAnswer: (questionId: string) => QuestionAnswer | undefined;
  hasAnsweredQuestion: (questionId: string) => boolean;
  getAnsweredCount: () => number;
  getAnsweredQuestions: () => QuizQuestion[];
  getFlaggedQuestions: () => QuizQuestion[];

  // Actions - Timer
  startTimer: () => void;
  stopTimer: () => void;
  tickTimer: () => void; // Called every second
  setTimeRemaining: (seconds: number) => void;

  // Actions - Session
  updateHeartbeat: () => void;
  incrementTabSwitch: () => void;
  setDeviceFingerprint: (fingerprint: string) => void;

  // Actions - Navigation
  setCurrentQuestionIndex: (index: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;

  // Actions - UI
  setShowSubmitDialog: (show: boolean) => void;
  markSaved: () => void;
  setSaving: (saving: boolean) => void;
}

// ============================================================================
// STORE
// ============================================================================

/**
 * Quiz attempt store for student quiz taking
 *
 * @example
 * ```typescript
 * const {
 *   attempt,
 *   setAnswer,
 *   timeRemaining,
 *   startTimer
 * } = useQuizAttemptStore();
 *
 * // Save an answer
 * setAnswer('q-123', 'Paris');
 *
 * // Start the countdown
 * startTimer();
 * ```
 */
export const useQuizAttemptStore = create<QuizAttemptState>((set, get) => ({
  // ==========================================================================
  // INITIAL STATE
  // ==========================================================================
  attempt: null,
  quiz: null,
  questions: [],
  settings: null,
  answers: new Map(),
  timeRemaining: null,
  timeElapsed: 0,
  timerActive: false,
  deviceFingerprint: null,
  lastHeartbeat: null,
  tabSwitchCount: 0,
  isActive: true,
  currentQuestionIndex: 0,
  isSaving: false,
  lastSaved: null,
  showSubmitDialog: false,

  // ==========================================================================
  // ATTEMPT ACTIONS
  // ==========================================================================

  /**
   * Initialize attempt with all data
   */
  setAttempt: (attempt, quiz, questions, settings, deviceFingerprint) => {
    // Calculate time remaining if quiz has time limit
    let timeRemaining = null;
    if (quiz.time_limit) {
      const startedAt = new Date(attempt.started_at).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - startedAt) / 1000);
      timeRemaining = Math.max(0, quiz.time_limit * 60 - elapsed);
    }

    set({
      attempt,
      quiz,
      questions,
      settings,
      deviceFingerprint,
      timeRemaining,
      timeElapsed: 0,
      answers: new Map(),
      currentQuestionIndex: 0,
      isActive: true,
      tabSwitchCount: 0,
      lastHeartbeat: new Date().toISOString(),
    });
  },

  /**
   * Set quiz data only
   */
  setQuiz: (quiz) => {
    set({ quiz });
  },

  /**
   * Set questions only
   */
  setQuestions: (questions) => {
    set({ questions });
  },

  /**
   * Clear attempt and reset state
   */
  clearAttempt: () => {
    set({
      attempt: null,
      quiz: null,
      questions: [],
      settings: null,
      answers: new Map(),
      timeRemaining: null,
      timeElapsed: 0,
      timerActive: false,
      deviceFingerprint: null,
      lastHeartbeat: null,
      tabSwitchCount: 0,
      isActive: false,
      currentQuestionIndex: 0,
      isSaving: false,
      lastSaved: null,
      showSubmitDialog: false,
    });
  },

  // ==========================================================================
  // ANSWER ACTIONS
  // ==========================================================================

  /**
   * Set answer for a question
   */
  setAnswer: (questionId, answer) => {
    const { answers } = get();
    const newAnswers = new Map(answers);
    newAnswers.set(questionId, answer);
    set({ answers: newAnswers });
  },

  /**
   * Flag/unflag a question
   */
  flagQuestion: (questionId, flagged) => {
    const { answers } = get();
    const existing = answers.get(questionId);

    if (existing) {
      const newAnswers = new Map(answers);
      newAnswers.set(questionId, {
        ...existing,
        is_flagged: flagged,
      });
      set({ answers: newAnswers });
    }
  },

  /**
   * Get answer for a question
   */
  getAnswer: (questionId) => {
    const { answers } = get();
    return answers.get(questionId);
  },

  /**
   * Check if question has been answered
   */
  hasAnsweredQuestion: (questionId) => {
    const { answers } = get();
    const answer = answers.get(questionId);
    return !!answer && answer.student_answer !== null && answer.student_answer !== undefined;
  },

  /**
   * Get count of answered questions
   */
  getAnsweredCount: () => {
    const { answers, questions } = get();
    let count = 0;

    questions.forEach((q) => {
      const answer = answers.get(q.question_id);
      if (answer && answer.student_answer !== null && answer.student_answer !== undefined) {
        count++;
      }
    });

    return count;
  },

  /**
   * Get list of answered questions
   */
  getAnsweredQuestions: () => {
    const { answers, questions } = get();
    return questions.filter((q) => {
      const answer = answers.get(q.question_id);
      return answer && answer.student_answer !== null && answer.student_answer !== undefined;
    });
  },

  /**
   * Get list of flagged questions
   */
  getFlaggedQuestions: () => {
    const { answers, questions } = get();
    return questions.filter((q) => {
      const answer = answers.get(q.question_id);
      return answer && answer.is_flagged === true;
    });
  },

  // ==========================================================================
  // TIMER ACTIONS
  // ==========================================================================

  /**
   * Start the timer
   */
  startTimer: () => {
    set({ timerActive: true });
  },

  /**
   * Stop the timer
   */
  stopTimer: () => {
    set({ timerActive: false });
  },

  /**
   * Tick the timer (called every second)
   */
  tickTimer: () => {
    const { timerActive, timeRemaining, timeElapsed } = get();

    if (!timerActive) return;

    // Decrement time remaining
    if (timeRemaining !== null && timeRemaining > 0) {
      set({
        timeRemaining: timeRemaining - 1,
        timeElapsed: timeElapsed + 1,
      });
    } else if (timeRemaining === 0) {
      // Time's up!
      set({ timerActive: false });
    } else {
      // No time limit, just count up
      set({ timeElapsed: timeElapsed + 1 });
    }
  },

  /**
   * Set time remaining manually
   */
  setTimeRemaining: (seconds) => {
    set({ timeRemaining: seconds });
  },

  // ==========================================================================
  // SESSION ACTIONS
  // ==========================================================================

  /**
   * Update last heartbeat timestamp
   */
  updateHeartbeat: () => {
    set({ lastHeartbeat: new Date().toISOString() });
  },

  /**
   * Increment tab switch count
   */
  incrementTabSwitch: () => {
    const { tabSwitchCount } = get();
    set({ tabSwitchCount: tabSwitchCount + 1 });
  },

  /**
   * Set device fingerprint
   */
  setDeviceFingerprint: (fingerprint) => {
    set({ deviceFingerprint: fingerprint });
  },

  // ==========================================================================
  // NAVIGATION ACTIONS
  // ==========================================================================

  /**
   * Set current question index
   */
  setCurrentQuestionIndex: (index) => {
    const { questions } = get();
    if (index >= 0 && index < questions.length) {
      set({ currentQuestionIndex: index });
    }
  },

  /**
   * Go to next question
   */
  nextQuestion: () => {
    const { currentQuestionIndex, questions } = get();
    if (currentQuestionIndex < questions.length - 1) {
      set({ currentQuestionIndex: currentQuestionIndex + 1 });
    }
  },

  /**
   * Go to previous question
   */
  previousQuestion: () => {
    const { currentQuestionIndex } = get();
    if (currentQuestionIndex > 0) {
      set({ currentQuestionIndex: currentQuestionIndex - 1 });
    }
  },

  // ==========================================================================
  // UI ACTIONS
  // ==========================================================================

  /**
   * Show/hide submit dialog
   */
  setShowSubmitDialog: (show) => {
    set({ showSubmitDialog: show });
  },

  /**
   * Mark answers as saved
   */
  markSaved: () => {
    set({
      isSaving: false,
      lastSaved: new Date().toISOString(),
    });
  },

  /**
   * Set saving state
   */
  setSaving: (saving) => {
    set({ isSaving: saving });
  },
}));

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format time remaining as MM:SS
 */
export const formatTimeRemaining = (seconds: number | null): string => {
  if (seconds === null) return '--:--';

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${minutes.toString().padStart(2, '0')}:${secs
    .toString()
    .padStart(2, '0')}`;
};

/**
 * Calculate progress percentage
 */
export const calculateProgress = (
  answeredCount: number,
  totalQuestions: number
): number => {
  if (totalQuestions === 0) return 0;
  return Math.round((answeredCount / totalQuestions) * 100);
};

/**
 * Check if time is running low (less than 5 minutes)
 */
export const isTimeLow = (timeRemaining: number | null): boolean => {
  if (timeRemaining === null) return false;
  return timeRemaining > 0 && timeRemaining <= 300; // 5 minutes
};

/**
 * Check if time is critical (less than 1 minute)
 */
export const isTimeCritical = (timeRemaining: number | null): boolean => {
  if (timeRemaining === null) return false;
  return timeRemaining > 0 && timeRemaining <= 60; // 1 minute
};

/**
 * Get unanswered questions
 */
export const getUnansweredQuestions = (
  questions: QuizQuestion[],
  answers: Map<string, QuestionAnswer>
): QuizQuestion[] => {
  return questions.filter((q) => {
    const answer = answers.get(q.question_id);
    return !answer || answer.student_answer === null || answer.student_answer === undefined;
  });
};

/**
 * Check if all required questions are answered
 */
export const allRequiredAnswered = (
  questions: QuizQuestion[],
  answers: Map<string, QuestionAnswer>
): boolean => {
  const requiredQuestions = questions.filter((q) => q.is_required);

  return requiredQuestions.every((q) => {
    const answer = answers.get(q.question_id);
    return answer && answer.student_answer !== null && answer.student_answer !== undefined;
  });
};
