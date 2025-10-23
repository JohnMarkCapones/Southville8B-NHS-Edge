/**
 * useQuizAttempt Hook
 *
 * Custom React hook for managing quiz attempts (Student).
 * Handles starting, answering, submitting quizzes with auto-save.
 *
 * @module hooks/useQuizAttempt
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { quizApi } from '@/lib/api/endpoints';
import { useToast } from './use-toast';
import { useQuizAttemptStore } from '@/lib/stores';
import { generateDeviceFingerprint } from '@/lib/utils/device-fingerprint';
import debounce from 'lodash.debounce';
import type {
  QuizAttempt,
  StartAttemptResponse,
  SubmitQuizResponse,
} from '@/lib/api/types';

/**
 * useQuizAttempt hook return type
 */
interface UseQuizAttemptReturn {
  // Data
  attempt: QuizAttempt | null;
  isActive: boolean;

  // Loading states
  isLoading: boolean;
  isStarting: boolean;
  isSubmitting: boolean;
  isSaving: boolean;

  // Error
  error: Error | null;

  // Operations
  startQuiz: (quizId: string, deviceFingerprint: string) => Promise<StartAttemptResponse>;
  startAttempt: (quizId: string) => Promise<boolean>;
  submitAnswer: (attemptId: string, questionId: string, answer: any) => Promise<void>;
  submitQuiz: (attemptId: string) => Promise<SubmitQuizResponse | null>;
  getAttempt: (attemptId: string) => Promise<QuizAttempt | null>;

  // Auto-save status
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
}

/**
 * Custom hook for quiz attempts (Student)
 *
 * @example
 * ```typescript
 * const {
 *   startAttempt,
 *   submitAnswer,
 *   submitQuiz,
 *   isStarting,
 *   attempt
 * } = useQuizAttempt();
 *
 * // Start a quiz
 * await startAttempt('quiz-123');
 *
 * // Answer a question (auto-saves after 500ms debounce)
 * await submitAnswer('q-456', 'Paris');
 *
 * // Submit the quiz
 * const result = await submitQuiz();
 * ```
 */
export const useQuizAttempt = (): UseQuizAttemptReturn => {
  const [isStarting, setIsStarting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { toast } = useToast();
  const {
    attempt,
    setAttempt,
    isActive,
  } = useQuizAttemptStore();

  // Store pending answers for auto-save
  const pendingAnswers = useRef<Map<string, any>>(new Map());

  /**
   * Start quiz with device fingerprint (new API)
   */
  const startQuiz = useCallback(
    async (quizId: string, deviceFingerprint: string): Promise<StartAttemptResponse> => {
      setIsStarting(true);
      setError(null);

      try {
        // Start the attempt
        const response: StartAttemptResponse =
          await quizApi.student.startQuizAttempt(quizId, {
            device_fingerprint: deviceFingerprint,
          });

        // Store in Zustand
        const { setAttempt, setQuiz, setQuestions } = useQuizAttemptStore.getState();
        setAttempt(
          response.attempt,
          (response as any).quiz || response.attempt.quiz,
          response.questions,
          response.settings,
          deviceFingerprint
        );

        return response;
      } catch (err) {
        const error = err as Error;
        setError(error);
        throw error;
      } finally {
        setIsStarting(false);
      }
    },
    []
  );

  /**
   * Start a quiz attempt (legacy method)
   */
  const startAttempt = useCallback(
    async (quizId: string): Promise<boolean> => {
      setIsStarting(true);
      setError(null);

      try {
        // Generate device fingerprint
        const fingerprint = await generateDeviceFingerprint();

        // Start the attempt
        const response: StartAttemptResponse =
          await quizApi.student.startQuizAttempt(quizId, {
            device_fingerprint: fingerprint.fingerprint,
          });

        // Store in Zustand
        setAttempt(
          response.attempt,
          response.attempt.quiz!,
          response.questions,
          response.settings,
          fingerprint.fingerprint
        );

        toast({
          title: 'Quiz Started',
          description: response.message || 'Good luck!',
        });

        return true;
      } catch (err) {
        const error = err as Error;
        setError(error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to start quiz',
          variant: 'destructive',
        });
        return false;
      } finally {
        setIsStarting(false);
      }
    },
    [toast, setAttempt]
  );

  /**
   * Submit an answer (with debounce for auto-save)
   */
  const submitAnswerDebounced = useCallback(
    debounce(async (attemptId: string, questionId: string, answer: any) => {
      setIsSaving(true);

      try {
        await quizApi.student.submitAnswer(attemptId, {
          question_id: questionId,
          student_answer: answer,
          time_spent: 0, // TODO: Track actual time spent
        });

        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        pendingAnswers.current.delete(questionId);
      } catch (err) {
        console.error('Failed to save answer:', err);
        // Don't show error toast for auto-save failures
      } finally {
        setIsSaving(false);
      }
    }, 500), // 500ms debounce
    []
  );

  /**
   * Submit an answer
   */
  const submitAnswer = useCallback(
    async (attemptId: string, questionId: string, answer: any): Promise<void> => {
      // Store answer locally (optimistic update)
      pendingAnswers.current.set(questionId, answer);
      setHasUnsavedChanges(true);

      // Debounced save to backend
      submitAnswerDebounced(attemptId, questionId, answer);
    },
    [toast, submitAnswerDebounced]
  );

  /**
   * Submit the quiz (finalize)
   */
  const submitQuiz = useCallback(async (attemptId: string): Promise<SubmitQuizResponse | null> => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Save any pending answers first
      if (pendingAnswers.current.size > 0) {
        await Promise.all(
          Array.from(pendingAnswers.current.entries()).map(
            ([questionId, answer]) =>
              quizApi.student.submitAnswer(attemptId, {
                question_id: questionId,
                student_answer: answer,
                time_spent: 0,
              })
          )
        );
        pendingAnswers.current.clear();
      }

      // Submit the quiz
      const result = await quizApi.student.submitQuiz(attemptId);

      toast({
        title: 'Quiz Submitted',
        description: result.autoGraded
          ? `Score: ${result.score}/${result.maxScore} (${result.percentage.toFixed(1)}%)`
          : 'Your quiz has been submitted for grading',
      });

      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit quiz',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [toast]);

  /**
   * Get attempt details
   */
  const getAttempt = useCallback(
    async (attemptId: string): Promise<QuizAttempt | null> => {
      setIsStarting(true);
      setError(null);

      try {
        const fetchedAttempt = await quizApi.student.getAttemptDetails(
          attemptId
        );
        return fetchedAttempt;
      } catch (err) {
        const error = err as Error;
        setError(error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to load attempt',
          variant: 'destructive',
        });
        return null;
      } finally {
        setIsStarting(false);
      }
    },
    [toast]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cancel any pending debounced calls
      submitAnswerDebounced.cancel();
    };
  }, [submitAnswerDebounced]);

  return {
    attempt,
    isActive,
    isLoading: isStarting || isSubmitting,
    isStarting,
    isSubmitting,
    isSaving,
    error,
    startQuiz,
    startAttempt,
    submitAnswer,
    submitQuiz,
    getAttempt,
    lastSaved,
    hasUnsavedChanges,
  };
};
