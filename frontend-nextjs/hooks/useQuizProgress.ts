/**
 * useQuizProgress Hook
 *
 * Custom React hook for tracking student progress during quiz.
 * Sends real-time updates to backend for teacher monitoring dashboard.
 *
 * @module hooks/useQuizProgress
 */

'use client';

import { useState, useCallback } from 'react';
import { quizApi } from '@/lib/api/endpoints';
import { useToast } from './use-toast';

/**
 * Progress update data
 */
interface ProgressUpdate {
  currentQuestionIndex: number;
  questionsAnswered: number;
  progress: number;
  idleTimeSeconds?: number;
}

/**
 * useQuizProgress hook return type
 */
interface UseQuizProgressReturn {
  /** Whether progress update is in progress */
  isUpdating: boolean;

  /** Send progress update to backend */
  sendProgress: (
    attemptId: string,
    currentQuestionIndex: number,
    questionsAnswered: number,
    progress: number,
    idleTimeSeconds?: number,
  ) => Promise<void>;

  /** Calculate progress percentage */
  calculateProgress: (answered: number, total: number) => number;
}

/**
 * Custom hook for quiz progress tracking
 *
 * Sends real-time progress updates to backend for teacher monitoring.
 * Updates are lightweight and don't block UI.
 *
 * @example
 * ```typescript
 * const { sendProgress, calculateProgress } = useQuizProgress();
 *
 * // When student navigates to next question
 * const progress = calculateProgress(answeredCount, totalQuestions);
 * await sendProgress(attemptId, currentQuestionIndex, answeredCount, progress);
 *
 * // Teacher dashboard will see:
 * // "John Doe - Question 3/10 - 30% complete"
 * ```
 */
export const useQuizProgress = (): UseQuizProgressReturn => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  /**
   * Calculate progress percentage (capped at 100)
   */
  const calculateProgress = useCallback(
    (answered: number, total: number): number => {
      if (total === 0) return 0;
      // Cap at 100% to prevent backend validation errors
      return Math.min(100, Math.round((answered / total) * 100));
    },
    [],
  );

  /**
   * Send progress update to backend
   */
  const sendProgress = useCallback(
    async (
      attemptId: string,
      currentQuestionIndex: number,
      questionsAnswered: number,
      progress: number,
      idleTimeSeconds?: number,
    ): Promise<void> => {
      // Don't block UI if update is already in progress
      if (isUpdating) {
        console.log('[useQuizProgress] Update already in progress, skipping');
        return;
      }

      setIsUpdating(true);

      try {
        await quizApi.student.updateProgress(attemptId, {
          currentQuestionIndex,
          questionsAnswered,
          progress,
          idleTimeSeconds,
        });

        console.log(
          `[useQuizProgress] Progress sent: Question ${currentQuestionIndex + 1}, ${questionsAnswered} answered, ${progress}%`,
        );
      } catch (error) {
        console.error('[useQuizProgress] Failed to send progress:', error);
        // Don't show error toast - progress tracking is non-critical
        // Silent failure won't disrupt student's quiz experience
      } finally {
        setIsUpdating(false);
      }
    },
    [isUpdating],
  );

  return {
    isUpdating,
    sendProgress,
    calculateProgress,
  };
};
