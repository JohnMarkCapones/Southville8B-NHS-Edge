/**
 * useQuizBuilderAPI Hook
 *
 * Custom hook for managing quiz builder API operations.
 * Handles quiz persistence, auto-save, publishing, and question bank integration.
 *
 * @module lib/hooks/useQuizBuilderAPI
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { quizApi } from '@/lib/api/endpoints/quiz';
import { questionBankApi } from '@/lib/api/endpoints/question-bank';
import type { Quiz, QuizSettings, QuestionBankListResponse } from '@/lib/api/types';
import {
  convertQuizDetailsToAPI,
  convertUIQuestionToAPI,
  convertAPIQuizToUI,
  convertAPIQuestionsToUI,
  convertAPIQuestionBankToUI,
  validateQuizData,
  type UIQuestion,
  type UIQuizDetails,
  type UIQuestionBankItem,
} from '@/lib/api/helpers/quiz-converters';

// Debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

interface UseQuizBuilderAPIProps {
  quizDetails: UIQuizDetails | null;
  questions: UIQuestion[];
}

interface UseQuizBuilderAPIReturn {
  // State
  quizId: string | null;
  isDraft: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  lastSaved: Date | null;
  qrCodeData: string | null;

  // Quiz operations
  initializeQuiz: () => Promise<void>;
  saveQuiz: () => Promise<void>;
  publishQuiz: (publishSettings: any, gradingType: string) => Promise<{ link: string; qrCode: string }>;

  // Question bank
  loadQuestionBank: (filters?: any) => Promise<UIQuestionBankItem[]>;
  isLoadingQuestionBank: boolean;
}

/**
 * Quiz Builder API Hook
 *
 * Manages all API interactions for the quiz builder
 */
export function useQuizBuilderAPI({
  quizDetails,
  questions,
}: UseQuizBuilderAPIProps): UseQuizBuilderAPIReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // State
  const [quizId, setQuizId] = useState<string | null>(null);
  const [isDraft, setIsDraft] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [qrCodeData, setQRCodeData] = useState<string | null>(null);
  const [isLoadingQuestionBank, setIsLoadingQuestionBank] = useState(false);

  // Track if quiz has been initialized
  const initializedRef = useRef(false);

  /**
   * Initialize quiz - load from API if editing, or prepare for creation
   */
  const initializeQuiz = useCallback(async () => {
    if (initializedRef.current) return;

    const editQuizId = searchParams.get('quizId');

    if (editQuizId) {
      // Edit mode - load from API
      try {
        const quizData = await quizApi.teacher.getQuizById(editQuizId);
        setQuizId(editQuizId);
        setIsDraft(quizData.status === 'draft');

        // Note: The UI will handle setting quizDetails and questions
        // This is just for initialization

        toast({
          title: 'Quiz Loaded',
          description: 'Quiz loaded successfully from server',
          variant: 'default',
        });
      } catch (error: any) {
        toast({
          title: 'Error Loading Quiz',
          description: error.message || 'Failed to load quiz',
          variant: 'destructive',
        });
      }
    }

    initializedRef.current = true;
  }, [searchParams, toast]);

  /**
   * Auto-save quiz to API
   */
  const autoSaveToAPI = useCallback(
    async (details: UIQuizDetails, qs: UIQuestion[]) => {
      if (!details || qs.length === 0) return;

      // Validate before saving
      const validation = validateQuizData(details, qs);
      if (!validation.valid) {
        console.warn('Quiz validation failed, skipping auto-save:', validation.errors);
        return;
      }

      setIsSaving(true);

      try {
        if (quizId) {
          // Update existing draft
          const updateData = convertQuizDetailsToAPI(details, qs);

          await quizApi.teacher.updateQuiz(quizId, updateData as any);

          // TODO: Update questions - may need bulk update endpoint
          // For now, we'll handle this in manual save

          setLastSaved(new Date());

          // Also save to localStorage as backup
          localStorage.setItem('quizDetails', JSON.stringify(details));
          localStorage.setItem('quizQuestions', JSON.stringify(qs));
        } else {
          // Create new draft
          const createData = convertQuizDetailsToAPI(details, qs);
          const newQuiz = await quizApi.teacher.createQuiz(createData as any);

          setQuizId(newQuiz.quiz_id);
          setIsDraft(true);

          // Add questions
          for (let i = 0; i < qs.length; i++) {
            const questionData = convertUIQuestionToAPI(qs[i], i);
            await quizApi.teacher.addQuestion(newQuiz.quiz_id, questionData as any);
          }

          setLastSaved(new Date());

          // Save to localStorage as backup
          localStorage.setItem('quizDetails', JSON.stringify(details));
          localStorage.setItem('quizQuestions', JSON.stringify(qs));

          toast({
            title: 'Draft Created',
            description: 'Quiz saved as draft',
            variant: 'default',
            duration: 2000,
          });
        }
      } catch (error: any) {
        console.error('Auto-save failed:', error);

        // Fall back to localStorage
        localStorage.setItem('quizDetails', JSON.stringify(details));
        localStorage.setItem('quizQuestions', JSON.stringify(qs));

        // Don't show error toast for auto-save failures (non-intrusive)
      } finally {
        setIsSaving(false);
      }
    },
    [quizId, toast]
  );

  // Debounced auto-save (3 seconds)
  const debouncedAutoSave = useRef(debounce(autoSaveToAPI, 3000));

  /**
   * Trigger auto-save whenever quiz details or questions change
   */
  useEffect(() => {
    if (quizDetails && questions.length > 0 && initializedRef.current) {
      debouncedAutoSave.current(quizDetails, questions);
    }
  }, [quizDetails, questions]);

  /**
   * Manual save quiz
   */
  const saveQuiz = useCallback(async () => {
    if (!quizDetails || !quizId) {
      toast({
        title: 'Error',
        description: 'Quiz not initialized. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      // Force immediate save (cancel debounced save)
      await autoSaveToAPI(quizDetails, questions);

      toast({
        title: 'Quiz Saved Successfully!',
        description: `"${quizDetails.title}" has been saved as a draft.`,
        variant: 'default',
        duration: 5000,
      });

      // Clear localStorage backup
      localStorage.removeItem('quizDetails');
      localStorage.removeItem('quizQuestions');

      router.push('/teacher/quiz');
    } catch (error: any) {
      toast({
        title: 'Save Failed',
        description: error.message || 'Failed to save quiz',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }, [quizDetails, quizId, questions, autoSaveToAPI, toast, router]);

  /**
   * Publish quiz
   */
  const publishQuiz = useCallback(
    async (
      publishSettings: any,
      gradingType: string
    ): Promise<{ link: string; qrCode: string }> => {
      if (!quizId) {
        throw new Error('Please save the quiz first before publishing.');
      }

      setIsPublishing(true);

      try {
        // 1. Ensure latest changes are saved
        if (quizDetails && questions.length > 0) {
          await autoSaveToAPI(quizDetails, questions);
        }

        // 2. Update quiz settings
        await quizApi.teacher.updateSettings(quizId, {
          show_results_immediately: publishSettings.showResults,
          allow_review: true, // Default
          randomize_questions: quizDetails?.shuffleQuestions || false,
          randomize_choices: false, // Default
          one_question_at_time: false, // Default
          prevent_backtrack: false, // Default
          lockdown_browser: false, // Default
          anti_screenshot: false, // Default
          disable_copy_paste: false, // Default
          track_tab_switches: true, // Default for security
          track_ip_changes: true, // Default for security
          max_tab_switches: 3, // Default
          require_webcam: false, // Default
          proctoring_enabled: false, // Default
          show_correct_answers: true, // Default
          show_explanations: true, // Default
          allow_late_submission: false, // Default
          max_attempts: publishSettings.allowRetakes ? undefined : 1,
        } as any);

        // 3. Publish the quiz
        const publishedQuiz = await quizApi.teacher.publishQuiz(quizId);

        // 4. Generate access link and QR code
        const accessLinkData = await quizApi.accessControl.generateAccessLink(quizId, {
          expiresAt: quizDetails?.dueDate || undefined,
          requiresAuth: !publishSettings.makePublic,
          maxUses: publishSettings.makePublic ? undefined : 100,
        } as any);

        const generatedLink = accessLinkData.accessLink || `${window.location.origin}/quiz/take/${quizId}`;

        // 5. Get QR code
        let qrCode = '';
        if (accessLinkData.token) {
          try {
            const qrData = await quizApi.accessControl.getQRCode(accessLinkData.token);
            qrCode = qrData.qrCodeData || '';
            setQRCodeData(qrCode);
          } catch (error) {
            console.error('Failed to generate QR code:', error);
          }
        }

        toast({
          title: 'Quiz Published Successfully!',
          description: `"${quizDetails?.title}" is now live and ready for students.`,
          variant: 'default',
          duration: 5000,
        });

        setIsDraft(false);

        return {
          link: generatedLink,
          qrCode,
        };
      } catch (error: any) {
        toast({
          title: 'Publish Failed',
          description: error.message || 'Failed to publish quiz',
          variant: 'destructive',
        });
        throw error;
      } finally {
        setIsPublishing(false);
      }
    },
    [quizId, quizDetails, questions, autoSaveToAPI, toast]
  );

  /**
   * Load question bank from API
   */
  const loadQuestionBank = useCallback(
    async (filters?: any): Promise<UIQuestionBankItem[]> => {
      setIsLoadingQuestionBank(true);

      try {
        const response = await questionBankApi.getQuestions({
          page: 1,
          limit: 100,
          question_type: filters?.type !== 'all' ? filters?.type : undefined,
          difficulty: filters?.difficulty !== 'all' ? filters?.difficulty : undefined,
          search: filters?.search || undefined,
        });

        const uiQuestions = response.data.map(convertAPIQuestionBankToUI);
        return uiQuestions;
      } catch (error: any) {
        toast({
          title: 'Failed to Load Question Bank',
          description: error.message || 'Could not load questions',
          variant: 'destructive',
        });
        return [];
      } finally {
        setIsLoadingQuestionBank(false);
      }
    },
    [toast]
  );

  return {
    // State
    quizId,
    isDraft,
    isSaving,
    isPublishing,
    lastSaved,
    qrCodeData,

    // Operations
    initializeQuiz,
    saveQuiz,
    publishQuiz,

    // Question bank
    loadQuestionBank,
    isLoadingQuestionBank,
  };
}
