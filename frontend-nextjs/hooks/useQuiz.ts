/**
 * useQuiz Hook
 *
 * Custom React hook for managing quiz data and operations (Teacher).
 * Provides CRUD operations with loading/error states.
 *
 * @module hooks/useQuiz
 */

'use client';

import { useState, useCallback } from 'react';
import { quizApi } from '@/lib/api/endpoints';
import { useToast } from './use-toast';
import type {
  Quiz,
  QuizWithQuestions,
  CreateQuizDto,
  UpdateQuizDto,
  QuizFilters,
  QuizListResponse,
} from '@/lib/api/types';

/**
 * useQuiz hook return type
 */
interface UseQuizReturn {
  // Data
  quiz: QuizWithQuestions | null;
  quizzes: Quiz[];
  pagination: any;

  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  isDeleting: boolean;

  // Error
  error: Error | null;

  // Operations
  createQuiz: (data: CreateQuizDto) => Promise<Quiz | null>;
  getQuiz: (quizId: string) => Promise<QuizWithQuestions | null>;
  getQuizzes: (filters?: QuizFilters) => Promise<void>;
  updateQuiz: (quizId: string, data: UpdateQuizDto) => Promise<Quiz | null>;
  deleteQuiz: (quizId: string) => Promise<boolean>;
  publishQuiz: (quizId: string, sectionIds?: string[]) => Promise<boolean>;
  scheduleQuiz: (quizId: string, scheduleData: {
    startDate: string;
    endDate?: string;
    sectionIds: string[];
    sectionSettings?: Record<string, { timeLimit?: number }>;
  }) => Promise<Quiz | null>;
  cloneQuiz: (quizId: string, newTitle?: string) => Promise<Quiz | null>;
  clearQuiz: () => void;
}

/**
 * Custom hook for quiz management (Teacher)
 *
 * @example
 * ```typescript
 * const {
 *   quiz,
 *   createQuiz,
 *   publishQuiz,
 *   isLoading
 * } = useQuiz();
 *
 * // Create a new quiz
 * const newQuiz = await createQuiz({
 *   title: 'Math Quiz 1',
 *   quiz_type: QuizType.ASSESSMENT,
 *   grading_type: GradingType.AUTOMATIC
 * });
 * ```
 */
export const useQuiz = (): UseQuizReturn => {
  const [quiz, setQuiz] = useState<QuizWithQuestions | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  /**
   * Create a new quiz
   */
  const createQuiz = useCallback(
    async (data: CreateQuizDto): Promise<Quiz | null> => {
      setIsSaving(true);
      setError(null);

      try {
        const newQuiz = await quizApi.teacher.createQuiz(data);
        toast({
          title: 'Success',
          description: 'Quiz created successfully',
        });
        return newQuiz;
      } catch (err) {
        const error = err as Error;
        setError(error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to create quiz',
          variant: 'destructive',
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [toast]
  );

  /**
   * Get quiz by ID
   */
  const getQuiz = useCallback(
    async (quizId: string): Promise<QuizWithQuestions | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const fetchedQuiz = await quizApi.teacher.getQuizById(quizId);
        setQuiz(fetchedQuiz);
        return fetchedQuiz;
      } catch (err) {
        const error = err as Error;
        setError(error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to load quiz',
          variant: 'destructive',
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  /**
   * Get all quizzes with filters
   */
  const getQuizzes = useCallback(
    async (filters?: QuizFilters): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const response: QuizListResponse = await quizApi.teacher.getQuizzes(
          filters
        );
        setQuizzes(response.data);
        setPagination(response.pagination);
      } catch (err) {
        const error = err as Error;
        setError(error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to load quizzes',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  /**
   * Update quiz
   */
  const updateQuiz = useCallback(
    async (quizId: string, data: UpdateQuizDto): Promise<Quiz | null> => {
      setIsSaving(true);
      setError(null);

      try {
        const updatedQuiz = await quizApi.teacher.updateQuiz(quizId, data);
        toast({
          title: 'Success',
          description: 'Quiz updated successfully',
        });
        return updatedQuiz;
      } catch (err) {
        const error = err as Error;
        setError(error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to update quiz',
          variant: 'destructive',
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [toast]
  );

  /**
   * Delete (archive) quiz
   */
  const deleteQuiz = useCallback(
    async (quizId: string): Promise<boolean> => {
      setIsDeleting(true);
      setError(null);

      try {
        await quizApi.teacher.deleteQuiz(quizId);
        toast({
          title: 'Success',
          description: 'Quiz deleted successfully',
        });
        return true;
      } catch (err) {
        const error = err as Error;
        setError(error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to delete quiz',
          variant: 'destructive',
        });
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [toast]
  );

  /**
   * Publish quiz
   */
  const publishQuiz = useCallback(
    async (quizId: string, sectionIds?: string[]): Promise<boolean> => {
      setIsSaving(true);
      setError(null);

      try {
        await quizApi.teacher.publishQuiz(quizId, {
          status: 'published',
          sectionIds: sectionIds,
        });

        const sectionText = sectionIds && sectionIds.length > 0
          ? ` and assigned to ${sectionIds.length} section(s)`
          : '';

        toast({
          title: 'Success',
          description: `Quiz published successfully${sectionText}`,
        });
        return true;
      } catch (err) {
        const error = err as Error;
        setError(error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to publish quiz',
          variant: 'destructive',
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [toast]
  );

  /**
   * Schedule quiz for future availability
   */
  const scheduleQuiz = useCallback(
    async (
      quizId: string,
      scheduleData: {
        startDate: string;
        endDate?: string;
        sectionIds: string[];
        sectionSettings?: Record<string, { timeLimit?: number }>;
      }
    ): Promise<Quiz | null> => {
      setIsSaving(true);
      setError(null);

      try {
        const scheduledQuiz = await quizApi.teacher.scheduleQuiz(quizId, scheduleData);
        toast({
          title: 'Success',
          description: 'Quiz scheduled successfully',
        });
        return scheduledQuiz;
      } catch (err) {
        const error = err as Error;
        setError(error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to schedule quiz',
          variant: 'destructive',
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [toast]
  );

  /**
   * Clone quiz
   */
  const cloneQuiz = useCallback(
    async (quizId: string, newTitle?: string): Promise<Quiz | null> => {
      setIsSaving(true);
      setError(null);

      try {
        const clonedQuiz = await quizApi.teacher.cloneQuiz(quizId, {
          newTitle,
        });
        toast({
          title: 'Success',
          description: 'Quiz cloned successfully',
        });
        return clonedQuiz;
      } catch (err) {
        const error = err as Error;
        setError(error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to clone quiz',
          variant: 'destructive',
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [toast]
  );

  /**
   * Clear current quiz from state
   */
  const clearQuiz = useCallback(() => {
    setQuiz(null);
    setError(null);
  }, []);

  return {
    quiz,
    quizzes,
    pagination,
    isLoading,
    isSaving,
    isDeleting,
    error,
    createQuiz,
    getQuiz,
    getQuizzes,
    updateQuiz,
    deleteQuiz,
    publishQuiz,
    scheduleQuiz,
    cloneQuiz,
    clearQuiz,
  };
};
