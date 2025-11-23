/**
 * Quiz Taking Page
 *
 * Complete quiz taking interface with real API integration.
 * Features:
 * - Device fingerprinting for security
 * - Real-time timer with countdown
 * - Auto-save answers (500ms debounce)
 * - Heartbeat mechanism (2-min intervals)
 * - Tab switch detection
 * - Progress tracking
 * - Question navigation
 * - Submit confirmation
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Countdown from 'react-countdown';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  Flag,
  Loader2,
  Save,
  Send,
  AlertTriangle,
} from 'lucide-react';

import StudentLayout from '@/components/student/student-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { useQuizAttempt } from '@/hooks/useQuizAttempt';
import { useHeartbeat } from '@/hooks/useHeartbeat';
import { useQuizAttemptStore } from '@/lib/stores';
import { generateDeviceFingerprint } from '@/lib/utils/device-fingerprint';
import { setupTabSwitchDetection } from '@/lib/utils/security';
import { useToast } from '@/hooks/use-toast';
import type { QuestionType } from '@/lib/api/types';

// Import quiz question components (you'll need to create these based on QuestionType)
import { MultipleChoiceQuestion } from '@/components/quiz/multiple-choice-question';
import { TrueFalseQuestion } from '@/components/quiz/true-false-question';
import { ShortAnswerQuestion } from '@/components/quiz/short-answer-question';
import { EssayQuestion } from '@/components/quiz/essay-question';

export default function QuizTakingPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const quizId = params.id as string;

  // Zustand store
  const {
    attempt,
    quiz,
    questions,
    answers,
    currentQuestionIndex,
    timeRemaining,
    tabSwitchCount,
    setAttempt,
    setQuiz,
    setQuestions,
    setAnswer,
    setCurrentQuestionIndex,
    nextQuestion,
    previousQuestion,
    getFlaggedQuestions,
    getAnsweredQuestions,
    clearAttempt,
  } = useQuizAttemptStore();

  // Custom hooks
  const {
    isLoading: isInitializing,
    startQuiz,
    submitAnswer,
    submitQuiz,
    isSaving,
    hasUnsavedChanges,
    lastSaved,
  } = useQuizAttempt();

  const { isActive: isHeartbeatActive, sendNow: sendHeartbeat } = useHeartbeat({
    interval: 120000, // 2 minutes
    autoStart: true,
    onSessionInvalid: () => {
      toast({
        title: 'Session Terminated',
        description: 'Your quiz session has been terminated. Redirecting...',
        variant: 'destructive',
      });
      setTimeout(() => router.push('/student/quiz'), 3000);
    },
  });

  // Local state
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deviceFingerprint, setDeviceFingerprint] = useState<string | null>(null);

  /**
   * Initialize device fingerprint
   */
  useEffect(() => {
    const initFingerprint = async () => {
      try {
        const fp = await generateDeviceFingerprint();
        setDeviceFingerprint(fp.fingerprint);
      } catch (error) {
        console.error('Failed to generate fingerprint:', error);
        toast({
          title: 'Initialization Error',
          description: 'Failed to initialize security features.',
          variant: 'destructive',
        });
      }
    };

    initFingerprint();
  }, [toast]);

  /**
   * Setup tab switch detection
   */
  useEffect(() => {
    if (!isQuizStarted) return;

    const cleanup = setupTabSwitchDetection({
      onTabSwitch: () => {
        useQuizAttemptStore.getState().incrementTabSwitch();
        toast({
          title: 'Tab Switch Detected',
          description: 'Please stay on the quiz page.',
          variant: 'destructive',
        });
      },
    });

    return cleanup;
  }, [isQuizStarted, toast]);

  /**
   * Start quiz attempt
   */
  const handleStartQuiz = async () => {
    if (!deviceFingerprint) {
      toast({
        title: 'Error',
        description: 'Device verification failed. Please refresh the page.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await startQuiz(quizId, deviceFingerprint);
      // Quiz data is already set in store by startQuiz
      setIsQuizStarted(true);

      toast({
        title: 'Quiz Started',
        description: 'Good luck! Your progress will be auto-saved.',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to Start Quiz',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  /**
   * Handle answer change
   */
  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswer(questionId, {
      question_id: questionId,
      student_answer: answer,
      is_flagged: false,
      time_spent: 0,
      answered_at: new Date().toISOString(),
    });

    // Auto-save will be triggered by useQuizAttempt hook
  };

  /**
   * Toggle question flag
   */
  const handleToggleFlag = (questionId: string) => {
    const currentAnswer = answers.get(questionId);
    if (currentAnswer) {
      setAnswer(questionId, {
        ...currentAnswer,
        is_flagged: !currentAnswer.is_flagged,
      });
    } else {
      setAnswer(questionId, {
        question_id: questionId,
        student_answer: null,
        is_flagged: true,
        time_spent: 0,
        answered_at: new Date().toISOString(),
      });
    }
  };

  /**
   * Handle quiz submission
   */
  const handleSubmitQuiz = async () => {
    setIsSubmitting(true);
    try {
      if (!attempt) {
        throw new Error('No active attempt');
      }

      const result = await submitQuiz(attempt.attempt_id);

      toast({
        title: 'Quiz Submitted',
        description: 'Your quiz has been submitted successfully!',
      });

      // Navigate to results page
      router.push(`/student/quiz/attempts/${attempt.attempt_id}/results`);
    } catch (error: any) {
      toast({
        title: 'Submission Failed',
        description: error.message || 'Failed to submit quiz',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setShowSubmitDialog(false);
    }
  };

  /**
   * Handle quiz exit
   */
  const handleExitQuiz = () => {
    if (hasUnsavedChanges) {
      toast({
        title: 'Saving Progress',
        description: 'Please wait while we save your answers...',
      });
      // Wait a bit for auto-save to complete
      setTimeout(() => {
        clearAttempt();
        router.push('/student/quiz');
      }, 1000);
    } else {
      clearAttempt();
      router.push('/student/quiz');
    }
  };

  /**
   * Prevent accidental page close
   */
  useEffect(() => {
    if (!isQuizStarted) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isQuizStarted]);

  /**
   * Auto-submit when time expires
   */
  useEffect(() => {
    if (timeRemaining !== null && timeRemaining <= 0 && isQuizStarted) {
      toast({
        title: 'Time Expired',
        description: 'Auto-submitting your quiz...',
        variant: 'destructive',
      });
      setTimeout(() => handleSubmitQuiz(), 2000);
    }
  }, [timeRemaining, isQuizStarted]);

  // Loading state
  if (isInitializing) {
    return (
      <StudentLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-school-blue" />
            <p className="text-lg text-muted-foreground">Loading quiz...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  // Quiz not found
  if (!quiz && !isInitializing) {
    return (
      <StudentLayout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-lg">
            <CardContent className="pt-6 text-center space-y-4">
              <AlertCircle className="w-16 h-16 mx-auto text-amber-500" />
              <h2 className="text-2xl font-bold">Quiz Not Found</h2>
              <p className="text-muted-foreground">
                This quiz may have been removed or you don't have access to it.
              </p>
              <Button onClick={() => router.push('/student/quiz')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Quizzes
              </Button>
            </CardContent>
          </Card>
        </div>
      </StudentLayout>
    );
  }

  // Quiz start screen
  if (!isQuizStarted && quiz) {
    return (
      <StudentLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => router.push('/student/quiz')}
              className="mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Quiz Dashboard
            </Button>

            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-3xl mb-2">{quiz.title}</CardTitle>
                {quiz.description && (
                  <p className="text-muted-foreground">{quiz.description}</p>
                )}
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Quiz info */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <Clock className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                    <div className="font-semibold">{quiz.time_limit} minutes</div>
                    <div className="text-sm text-muted-foreground">Time Limit</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-600" />
                    <div className="font-semibold">{questions.length} questions</div>
                    <div className="text-sm text-muted-foreground">Total Questions</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <AlertCircle className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                    <div className="font-semibold">{quiz.total_points} points</div>
                    <div className="text-sm text-muted-foreground">Total Points</div>
                  </div>
                </div>

                {/* Instructions */}
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Instructions</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1 mt-2">
                      <li>Your progress will be automatically saved</li>
                      <li>You can navigate between questions using the navigation buttons</li>
                      <li>Flag questions you want to review later</li>
                      <li>Submit the quiz when you're done or when time runs out</li>
                      <li>Do not refresh the page or close the browser during the quiz</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                {/* Security notice */}
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Security Notice</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1 mt-2">
                      <li>Your quiz session is monitored for academic integrity</li>
                      <li>Tab switches and other activities may be logged</li>
                      <li>Please stay on this page during the quiz</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                {/* Start button */}
                <div className="text-center pt-4">
                  <Button
                    size="lg"
                    onClick={handleStartQuiz}
                    disabled={!deviceFingerprint}
                    className="px-8"
                  >
                    {deviceFingerprint ? (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Start Quiz
                      </>
                    ) : (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Initializing...
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </StudentLayout>
    );
  }

  // Quiz taking screen
  if (isQuizStarted && quiz && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    const currentAnswer = answers.get(currentQuestion.question_id);
    const answeredCount = getAnsweredQuestions().length;
    const flaggedCount = getFlaggedQuestions().length;
    const progress = (answeredCount / questions.length) * 100;

    return (
      <StudentLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4">
          {/* Header */}
          <div className="max-w-6xl mx-auto mb-4">
            <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-lg p-4 shadow-lg">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowExitDialog(true)}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Exit
                </Button>
                <div>
                  <h1 className="font-bold text-lg">{quiz.title}</h1>
                  <p className="text-sm text-muted-foreground">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                {/* Auto-save indicator */}
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : lastSaved ? (
                    <>
                      <Save className="w-4 h-4 text-green-600" />
                      Saved {new Date(lastSaved).toLocaleTimeString()}
                    </>
                  ) : null}
                </div>

                {/* Timer */}
                {timeRemaining !== null && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <div
                      className={`text-lg font-bold ${
                        timeRemaining < 300
                          ? 'text-red-600 animate-pulse'
                          : timeRemaining < 600
                          ? 'text-amber-600'
                          : 'text-green-600'
                      }`}
                    >
                      <Countdown
                        date={Date.now() + timeRemaining * 1000}
                        renderer={({ hours, minutes, seconds }) => (
                          <span>
                            {hours > 0 && `${hours}:`}
                            {String(minutes).padStart(2, '0')}:
                            {String(seconds).padStart(2, '0')}
                          </span>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Tab switches */}
                {tabSwitchCount > 0 && (
                  <Badge variant="destructive">
                    {tabSwitchCount} tab switch{tabSwitchCount > 1 ? 'es' : ''}
                  </Badge>
                )}
              </div>
            </div>

            {/* Progress */}
            <div className="mt-4 bg-white dark:bg-slate-800 rounded-lg p-4 shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  Progress: {answeredCount}/{questions.length} answered
                </span>
                {flaggedCount > 0 && (
                  <span className="text-sm text-amber-600">
                    <Flag className="w-4 h-4 inline mr-1" />
                    {flaggedCount} flagged
                  </span>
                )}
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>

          {/* Question content */}
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl">
                    Question {currentQuestionIndex + 1}
                  </CardTitle>
                  <Button
                    variant={currentAnswer?.is_flagged ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleToggleFlag(currentQuestion.question_id)}
                  >
                    <Flag
                      className={`w-4 h-4 mr-2 ${
                        currentAnswer?.is_flagged ? 'fill-current' : ''
                      }`}
                    />
                    {currentAnswer?.is_flagged ? 'Flagged' : 'Flag'}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Question text */}
                <div
                  className="prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: currentQuestion.question_text }}
                />

                {/* Question component based on type */}
                {currentQuestion.question_type === 'multiple_choice' && (
                  <MultipleChoiceQuestion
                    question={currentQuestion}
                    value={currentAnswer?.student_answer}
                    onChange={(answer) =>
                      handleAnswerChange(currentQuestion.question_id, answer)
                    }
                  />
                )}
                {currentQuestion.question_type === 'true_false' && (
                  <TrueFalseQuestion
                    question={currentQuestion}
                    value={currentAnswer?.student_answer}
                    onChange={(answer) =>
                      handleAnswerChange(currentQuestion.question_id, answer)
                    }
                  />
                )}
                {currentQuestion.question_type === 'short_answer' && (
                  <ShortAnswerQuestion
                    question={currentQuestion}
                    value={currentAnswer?.student_answer}
                    onChange={(answer) =>
                      handleAnswerChange(currentQuestion.question_id, answer)
                    }
                  />
                )}
                {currentQuestion.question_type === 'essay' && (
                  <EssayQuestion
                    question={currentQuestion}
                    value={currentAnswer?.student_answer}
                    onChange={(answer) =>
                      handleAnswerChange(currentQuestion.question_id, answer)
                    }
                  />
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={previousQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  {currentQuestionIndex < questions.length - 1 ? (
                    <Button onClick={nextQuestion}>
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setShowSubmitDialog(true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Submit Quiz
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Question navigation grid */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Question Navigation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-10 gap-2">
                  {questions.map((q, idx) => {
                    const isAnswered = answers.has(q.question_id);
                    const isFlagged = answers.get(q.question_id)?.is_flagged;
                    const isCurrent = idx === currentQuestionIndex;

                    return (
                      <Button
                        key={q.question_id}
                        variant={isCurrent ? 'default' : 'outline'}
                        size="sm"
                        className={`relative ${
                          isAnswered && !isCurrent ? 'bg-green-100 dark:bg-green-950' : ''
                        }`}
                        onClick={() => setCurrentQuestionIndex(idx)}
                      >
                        {idx + 1}
                        {isFlagged && (
                          <Flag className="absolute -top-1 -right-1 w-3 h-3 fill-amber-500 text-amber-500" />
                        )}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submit dialog */}
          <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit Quiz?</DialogTitle>
                <DialogDescription>
                  Are you sure you want to submit this quiz? You have answered{' '}
                  {answeredCount} out of {questions.length} questions.
                  {answeredCount < questions.length && (
                    <span className="block mt-2 text-amber-600 font-semibold">
                      Warning: You have {questions.length - answeredCount} unanswered
                      question(s).
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowSubmitDialog(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitQuiz}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Exit dialog */}
          <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Exit Quiz?</DialogTitle>
                <DialogDescription>
                  Your progress has been saved. You can continue this quiz later.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowExitDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleExitQuiz} variant="destructive">
                  Exit Quiz
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </StudentLayout>
    );
  }

  return null;
}
