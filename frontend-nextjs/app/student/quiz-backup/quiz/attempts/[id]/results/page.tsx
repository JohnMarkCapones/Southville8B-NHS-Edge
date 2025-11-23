/**
 * Quiz Results Page
 *
 * Displays quiz results after submission, including:
 * - Overall score and percentage
 * - Time taken
 * - Question-by-question review
 * - Correct/incorrect answers
 * - Feedback from teacher (if available)
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  FileText,
  Loader2,
} from 'lucide-react';

import StudentLayout from '@/components/student/student-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { quizApi } from '@/lib/api/endpoints';
import { useToast } from '@/hooks/use-toast';
import type {
  QuizAttempt,
  Quiz,
  QuizQuestion,
  AttemptStatus,
} from '@/lib/api/types';
import type { QuestionAnswer } from '@/lib/stores/quiz-attempt-store';

// Import question components for review
import { MultipleChoiceQuestion } from '@/components/quiz/multiple-choice-question';
import { TrueFalseQuestion } from '@/components/quiz/true-false-question';
import { ShortAnswerQuestion } from '@/components/quiz/short-answer-question';
import { EssayQuestion } from '@/components/quiz/essay-question';

export default function QuizResultsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const attemptId = params.id as string;

  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<QuestionAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Fetch attempt results
   */
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setIsLoading(true);

        // Fetch attempt details with results
        const attemptData = await quizApi.student.getAttemptDetails(attemptId) as any;
        setAttempt(attemptData.attempt || attemptData);
        setQuiz(attemptData.quiz || null);
        setQuestions(attemptData.questions || []);
        // Convert answers Map to Array if needed
        const answersData = attemptData.answers || [];
        const answersArray = Array.isArray(answersData)
          ? answersData
          : Array.from(answersData?.values?.() || []);
        setAnswers(answersArray);
      } catch (error: any) {
        console.error('Failed to fetch results:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to load quiz results',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [attemptId, toast]);

  /**
   * Calculate statistics
   */
  const getStatistics = () => {
    if (!attempt || !questions.length) {
      return {
        totalQuestions: 0,
        answeredQuestions: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        pendingGrading: 0,
        score: 0,
        maxScore: 0,
        percentage: 0,
      };
    }

    const answeredQuestions = answers.length;
    const correctAnswers = answers.filter(
      (a) => a.is_correct === true
    ).length;
    const incorrectAnswers = answers.filter(
      (a) => a.is_correct === false
    ).length;
    const pendingGrading = answers.filter(
      (a) => a.is_correct === null
    ).length;

    const score = (attempt as any).total_score || 0;
    const maxScore = quiz?.total_points || 0;
    const percentage =
      maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

    return {
      totalQuestions: questions.length,
      answeredQuestions,
      correctAnswers,
      incorrectAnswers,
      pendingGrading,
      score,
      maxScore,
      percentage,
    };
  };

  const stats = getStatistics();

  /**
   * Format time duration
   */
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  /**
   * Get badge variant based on score
   */
  const getScoreBadgeVariant = (
    percentage: number
  ): 'default' | 'destructive' | 'secondary' => {
    if (percentage >= 80) return 'default';
    if (percentage >= 60) return 'secondary';
    return 'destructive';
  };

  // Loading state
  if (isLoading) {
    return (
      <StudentLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-school-blue" />
            <p className="text-lg text-muted-foreground">Loading results...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  // Error state
  if (!attempt || !quiz) {
    return (
      <StudentLayout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-lg">
            <CardContent className="pt-6 text-center space-y-4">
              <AlertCircle className="w-16 h-16 mx-auto text-amber-500" />
              <h2 className="text-2xl font-bold">Results Not Found</h2>
              <p className="text-muted-foreground">
                Unable to load quiz results. The attempt may not exist or you
                don't have access to it.
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

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.push('/student/quiz')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Quizzes
            </Button>
          </div>

          {/* Results Summary Card */}
          <Card>
            <CardHeader className="text-center pb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="p-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full">
                  <Trophy className="w-12 h-12 text-white" />
                </div>
              </div>
              <CardTitle className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                Quiz Completed!
              </CardTitle>
              <p className="text-xl text-muted-foreground">{quiz.title}</p>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Score Overview */}
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-2xl border border-green-200 dark:border-green-800">
                  <div className="text-4xl font-bold text-green-700 dark:text-green-300 mb-2">
                    {stats.percentage}%
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">
                    Final Score
                  </div>
                  <Badge
                    variant={getScoreBadgeVariant(stats.percentage)}
                    className="mt-2"
                  >
                    {stats.percentage >= 80
                      ? 'Excellent'
                      : stats.percentage >= 60
                      ? 'Good'
                      : 'Needs Improvement'}
                  </Badge>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-2xl border border-blue-200 dark:border-blue-800">
                  <div className="text-4xl font-bold text-blue-700 dark:text-blue-300 mb-2">
                    {stats.score}/{stats.maxScore}
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">
                    Points Earned
                  </div>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-2xl border border-purple-200 dark:border-purple-800">
                  <div className="text-4xl font-bold text-purple-700 dark:text-purple-300 mb-2">
                    {stats.correctAnswers}/{stats.totalQuestions}
                  </div>
                  <div className="text-sm text-purple-600 dark:text-purple-400">
                    Correct Answers
                  </div>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 rounded-2xl border border-orange-200 dark:border-orange-800">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                  <div className="text-2xl font-bold text-orange-700 dark:text-orange-300 mb-2">
                    {(attempt as any).time_taken
                      ? formatDuration((attempt as any).time_taken)
                      : 'N/A'}
                  </div>
                  <div className="text-sm text-orange-600 dark:text-orange-400">
                    Time Taken
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Overall Progress</span>
                  <span className="font-semibold">{stats.percentage}%</span>
                </div>
                <Progress value={stats.percentage} className="h-3" />
              </div>

              {/* Pending Grading Alert */}
              {stats.pendingGrading > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Pending Manual Grading</AlertTitle>
                  <AlertDescription>
                    {stats.pendingGrading} question{stats.pendingGrading > 1 ? 's' : ''}{' '}
                    require manual grading by your teacher. Your final score may
                    change once grading is complete.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Detailed Review Tabs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Detailed Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">
                    All ({stats.totalQuestions})
                  </TabsTrigger>
                  <TabsTrigger value="correct">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Correct ({stats.correctAnswers})
                  </TabsTrigger>
                  <TabsTrigger value="incorrect">
                    <XCircle className="w-4 h-4 mr-1" />
                    Incorrect ({stats.incorrectAnswers})
                  </TabsTrigger>
                  <TabsTrigger value="pending">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Pending ({stats.pendingGrading})
                  </TabsTrigger>
                </TabsList>

                {/* All Questions */}
                <TabsContent value="all" className="space-y-6 mt-6">
                  {questions.map((question, index) => {
                    const answer = answers.find(
                      (a) => a.question_id === question.question_id
                    );

                    return (
                      <QuizQuestionReview
                        key={question.question_id}
                        question={question}
                        answer={answer}
                        index={index}
                      />
                    );
                  })}
                </TabsContent>

                {/* Correct Answers */}
                <TabsContent value="correct" className="space-y-6 mt-6">
                  {questions
                    .filter((q) => {
                      const answer = answers.find(
                        (a) => a.question_id === q.question_id
                      );
                      return answer?.is_correct === true;
                    })
                    .map((question, index) => {
                      const answer = answers.find(
                        (a) => a.question_id === question.question_id
                      );
                      return (
                        <QuizQuestionReview
                          key={question.question_id}
                          question={question}
                          answer={answer}
                          index={index}
                        />
                      );
                    })}
                </TabsContent>

                {/* Incorrect Answers */}
                <TabsContent value="incorrect" className="space-y-6 mt-6">
                  {questions
                    .filter((q) => {
                      const answer = answers.find(
                        (a) => a.question_id === q.question_id
                      );
                      return answer?.is_correct === false;
                    })
                    .map((question, index) => {
                      const answer = answers.find(
                        (a) => a.question_id === question.question_id
                      );
                      return (
                        <QuizQuestionReview
                          key={question.question_id}
                          question={question}
                          answer={answer}
                          index={index}
                        />
                      );
                    })}
                </TabsContent>

                {/* Pending Grading */}
                <TabsContent value="pending" className="space-y-6 mt-6">
                  {questions
                    .filter((q) => {
                      const answer = answers.find(
                        (a) => a.question_id === q.question_id
                      );
                      return answer?.is_correct === null;
                    })
                    .map((question, index) => {
                      const answer = answers.find(
                        (a) => a.question_id === question.question_id
                      );
                      return (
                        <QuizQuestionReview
                          key={question.question_id}
                          question={question}
                          answer={answer}
                          index={index}
                        />
                      );
                    })}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </StudentLayout>
  );
}

/**
 * Individual Question Review Component
 */
interface QuizQuestionReviewProps {
  question: QuizQuestion;
  answer?: QuestionAnswer;
  index: number;
}

function QuizQuestionReview({
  question,
  answer,
  index,
}: QuizQuestionReviewProps) {
  const getStatusIcon = () => {
    if (!answer) return <AlertCircle className="w-5 h-5 text-gray-400" />;
    if (answer.is_correct === null)
      return <AlertCircle className="w-5 h-5 text-amber-500" />;
    if (answer.is_correct === true)
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  const getStatusBadge = () => {
    if (!answer) return <Badge variant="secondary">Not Answered</Badge>;
    if (answer.is_correct === null)
      return <Badge variant="secondary">Pending Grading</Badge>;
    if (answer.is_correct === true)
      return <Badge className="bg-green-600">Correct</Badge>;
    return <Badge variant="destructive">Incorrect</Badge>;
  };

  return (
    <Card
      className={`${
        answer?.is_correct === true
          ? 'border-green-300 dark:border-green-800'
          : answer?.is_correct === false
          ? 'border-red-300 dark:border-red-800'
          : ''
      }`}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {getStatusIcon()}
            <div>
              <CardTitle className="text-lg">Question {index + 1}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {question.points} point{question.points !== 1 ? 's' : ''} •{' '}
                {question.question_type.replace('_', ' ')}
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Question Text */}
        <div
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: question.question_text }}
        />

        {/* Student's Answer */}
        <div>
          <p className="text-sm font-semibold mb-2">Your Answer:</p>
          {question.question_type === 'multiple_choice' && (
            <MultipleChoiceQuestion
              question={question}
              value={answer?.student_answer}
              onChange={() => {}}
              disabled={true}
              showCorrectAnswer={answer?.is_correct !== null}
            />
          )}
          {question.question_type === 'true_false' && (
            <TrueFalseQuestion
              question={question}
              value={answer?.student_answer}
              onChange={() => {}}
              disabled={true}
              showCorrectAnswer={answer?.is_correct !== null}
            />
          )}
          {question.question_type === 'short_answer' && (
            <ShortAnswerQuestion
              question={question}
              value={answer?.student_answer}
              onChange={() => {}}
              disabled={true}
              showCorrectAnswer={answer?.is_correct !== null}
            />
          )}
          {question.question_type === 'essay' && (
            <EssayQuestion
              question={question}
              value={answer?.student_answer}
              onChange={() => {}}
              disabled={true}
              showCorrectAnswer={answer?.is_correct !== null}
            />
          )}
        </div>

        {/* Points Awarded */}
        {(answer as any)?.points_awarded !== null && (answer as any)?.points_awarded !== undefined && (
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <span className="text-sm font-semibold">Points Awarded:</span>
            <Badge variant="outline">
              {(answer as any).points_awarded} / {question.points}
            </Badge>
          </div>
        )}

        {/* Feedback */}
        {(answer as any)?.feedback && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Teacher Feedback</AlertTitle>
            <AlertDescription>{(answer as any).feedback}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
