import {
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Get quiz analytics (overall stats)
   */
  async getQuizAnalytics(quizId: string, teacherId: string): Promise<any> {
    try {
      const supabase = this.supabaseService.getClient();

      // Verify quiz ownership and get quiz details
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('teacher_id, total_points, title')
        .eq('quiz_id', quizId)
        .single();

      if (quizError || !quiz) {
        throw new NotFoundException('Quiz not found');
      }

      if (quiz.teacher_id !== teacherId) {
        throw new ForbiddenException(
          'You can only view analytics for your own quizzes',
        );
      }

      // Get all completed attempts
      const { data: attempts, error: attemptsError } = await supabase
        .from('quiz_attempts')
        .select('student_id, score, time_taken_seconds, status')
        .eq('quiz_id', quizId)
        .in('status', ['submitted', 'graded']);

      if (attemptsError) {
        this.logger.error('Error fetching attempts:', attemptsError);
        throw new InternalServerErrorException('Failed to fetch analytics');
      }

      if (!attempts || attempts.length === 0) {
        return {
          quizId,
          quizTitle: quiz.title,
          totalAttempts: 0,
          completedAttempts: 0,
          averageScore: 0,
          highestScore: 0,
          lowestScore: 0,
          passRate: 0,
          averageTimeSpent: 0,
          scoreDistribution: [],
          lastCalculated: new Date().toISOString(),
        };
      }

      // Calculate statistics
      const scores = attempts
        .filter((a) => a.score !== null)
        .map((a) => a.score as number);

      const totalAttempts = attempts.length;
      const completedAttempts = scores.length;

      const averageScore =
        scores.length > 0
          ? scores.reduce((sum, score) => sum + score, 0) / scores.length
          : 0;

      const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
      const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;

      // Calculate pass rate (assuming 75% is passing)
      const passingScore = quiz.total_points * 0.75;
      const passedCount = scores.filter(
        (score) => score >= passingScore,
      ).length;
      const passRate =
        scores.length > 0 ? (passedCount / scores.length) * 100 : 0;

      // Calculate average time taken
      const timesWithData = attempts.filter(
        (a) => a.time_taken_seconds !== null,
      );
      const averageTimeSpent =
        timesWithData.length > 0
          ? timesWithData.reduce((sum, a) => sum + a.time_taken_seconds!, 0) /
            timesWithData.length
          : 0;

      // Calculate score distribution
      const scoreDistribution = this.calculateScoreDistribution(
        scores,
        quiz.total_points,
      );

      return {
        quizId,
        quizTitle: quiz.title,
        totalAttempts,
        completedAttempts,
        averageScore: Math.round(averageScore * 100) / 100,
        highestScore,
        lowestScore,
        passRate: Math.round(passRate * 100) / 100,
        averageTimeSpent: Math.round(averageTimeSpent),
        scoreDistribution,
        lastCalculated: new Date().toISOString(),
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      this.logger.error('Error fetching quiz analytics:', error);
      throw new InternalServerErrorException('Failed to fetch analytics');
    }
  }

  /**
   * Calculate score distribution for histogram
   */
  private calculateScoreDistribution(
    scores: number[],
    totalPoints: number,
  ): { range: string; count: number }[] {
    if (scores.length === 0) {
      return [];
    }

    // Create 10-point ranges (0-10, 11-20, etc.)
    const ranges = [
      { range: '0-10', min: 0, max: 10, count: 0 },
      { range: '11-20', min: 11, max: 20, count: 0 },
      { range: '21-30', min: 21, max: 30, count: 0 },
      { range: '31-40', min: 31, max: 40, count: 0 },
      { range: '41-50', min: 41, max: 50, count: 0 },
      { range: '51-60', min: 51, max: 60, count: 0 },
      { range: '61-70', min: 61, max: 70, count: 0 },
      { range: '71-80', min: 71, max: 80, count: 0 },
      { range: '81-90', min: 81, max: 90, count: 0 },
      { range: '91-100', min: 91, max: 100, count: 0 },
    ];

    // Convert scores to percentages and count in ranges
    scores.forEach((score) => {
      const percentage = (score / totalPoints) * 100;
      const rangeIndex = ranges.findIndex(
        (r) => percentage >= r.min && percentage <= r.max,
      );
      if (rangeIndex !== -1) {
        ranges[rangeIndex].count++;
      }
    });

    return ranges.map((r) => ({ range: r.range, count: r.count }));
  }

  /**
   * Get question-level analytics
   */
  async getQuestionAnalytics(quizId: string, teacherId: string): Promise<any> {
    try {
      const supabase = this.supabaseService.getClient();

      // Verify quiz ownership
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('teacher_id')
        .eq('quiz_id', quizId)
        .single();

      if (quizError || !quiz) {
        throw new NotFoundException('Quiz not found');
      }

      if (quiz.teacher_id !== teacherId) {
        throw new ForbiddenException(
          'You can only view analytics for your own quizzes',
        );
      }

      // Get all questions with their order
      const { data: questions, error: questionsError } = await supabase
        .from('quiz_questions')
        .select(
          'question_id, question_text, question_type, points, order_index',
        )
        .eq('quiz_id', quizId)
        .order('order_index', { ascending: true });

      if (questionsError) {
        this.logger.error('Error fetching questions:', questionsError);
        // Return empty instead of throwing
        return {
          quizId,
          questions: [],
        };
      }

      if (!questions || questions.length === 0) {
        return {
          quizId,
          questions: [],
        };
      }

      // Get all answers for these questions
      const questionIds = questions.map((q) => q.question_id);
      const { data: answers, error: answersError } = await supabase
        .from('quiz_student_answers')
        .select('question_id, is_correct, points_awarded, time_spent_seconds')
        .in('question_id', questionIds);

      if (answersError) {
        this.logger.error('Error fetching answers:', answersError);
        // Continue with empty answers instead of throwing
      }

      // Calculate stats per question
      const questionStats = questions.map((question) => {
        const questionAnswers =
          answers?.filter((a) => a.question_id === question.question_id) || [];

        const totalAttempts = questionAnswers.length;
        const correctAttempts = questionAnswers.filter(
          (a) => a.is_correct === true,
        ).length;

        const correctRate =
          totalAttempts > 0 ? correctAttempts / totalAttempts : 0;

        const avgTimeSpent =
          questionAnswers.length > 0
            ? questionAnswers
                .filter((a) => a.time_spent_seconds !== null)
                .reduce((sum, a) => sum + (a.time_spent_seconds || 0), 0) /
              Math.max(
                questionAnswers.filter((a) => a.time_spent_seconds !== null)
                  .length,
                1,
              )
            : 0;

        // Determine difficulty based on correct rate
        let difficulty: 'easy' | 'medium' | 'hard' = 'medium';
        if (totalAttempts > 0) {
          if (correctRate >= 0.7) {
            difficulty = 'easy';
          } else if (correctRate < 0.5) {
            difficulty = 'hard';
          }
        }

        return {
          question_id: question.question_id,
          question_text: question.question_text,
          question_type: question.question_type,
          points: question.points,
          total_attempts: totalAttempts,
          correct_attempts: correctAttempts,
          correct_rate: Math.round(correctRate * 10000) / 100, // Convert to percentage with 2 decimals
          average_time_spent: Math.round(avgTimeSpent),
          difficulty,
        };
      });

      return {
        quizId,
        questions: questionStats,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      this.logger.error('Error fetching question analytics:', error);
      // Return empty data instead of 500 error
      return {
        quizId,
        questions: [],
      };
    }
  }

  /**
   * Get student performance for a quiz
   */
  async getStudentPerformance(quizId: string, teacherId: string): Promise<any> {
    try {
      const supabase = this.supabaseService.getClient();

      // Verify quiz ownership
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('teacher_id, total_points, end_date')
        .eq('quiz_id', quizId)
        .single();

      if (quizError || !quiz) {
        throw new NotFoundException('Quiz not found');
      }

      if (quiz.teacher_id !== teacherId) {
        throw new ForbiddenException(
          'You can only view analytics for your own quizzes',
        );
      }

      // Get all attempts - simplified query without complex joins
      const { data: attempts, error: attemptsError } = await supabase
        .from('quiz_attempts')
        .select(
          'attempt_id, student_id, attempt_number, score, time_taken_seconds, status, submitted_at',
        )
        .eq('quiz_id', quizId)
        .in('status', ['submitted', 'graded'])
        .order('student_id');

      if (attemptsError) {
        this.logger.error('Error fetching attempts:', attemptsError);
        // Return empty data instead of throwing error
        return {
          quizId,
          students: [],
        };
      }

      if (!attempts || attempts.length === 0) {
        return {
          quizId,
          students: [],
        };
      }

      // ✅ FIX: student_id in quiz_attempts is actually users.id, not students.id!
      // Get unique student IDs (these are actually user IDs)
      const studentIds = [...new Set(attempts.map((a) => a.student_id))];

      // Use service client to bypass RLS (same as monitoring service)
      const serviceSupabase = this.supabaseService.getServiceClient();

      // Fetch user names directly (student_id = users.id)
      const { data: usersData, error: usersError } = await serviceSupabase
        .from('users')
        .select('id, full_name')
        .in('id', studentIds);

      if (usersError) {
        this.logger.error('Error fetching users:', usersError);
      }

      // Create user names lookup map
      const studentNames: Record<string, string> = {};
      if (usersData) {
        usersData.forEach((user) => {
          studentNames[user.id] = user.full_name || 'Unknown Student';
        });
      }

      this.logger.log(`[Analytics] Fetched ${Object.keys(studentNames).length} student names`);
      this.logger.log(`[Analytics] Student names map:`, studentNames);

      // Group attempts by student and get BEST attempt (highest score) + count graded attempts
      const studentPerformanceMap = new Map<string, any>();
      const studentAttemptCounts = new Map<string, number>();

      // Count graded/submitted attempts per student
      attempts.forEach((attempt) => {
        const studentId = attempt.student_id;
        const currentCount = studentAttemptCounts.get(studentId) || 0;
        studentAttemptCounts.set(studentId, currentCount + 1);
      });

      attempts.forEach((attempt) => {
        const studentId = attempt.student_id; // This is users.id
        const studentName = studentNames[studentId] || 'Unknown Student';

        const existing = studentPerformanceMap.get(studentId);
        const attemptScore = attempt.score || 0;
        const existingScore = existing?.score || 0;

        // ✅ FIX: Keep the BEST attempt (highest score), not latest
        // If scores are equal, prefer the latest attempt
        if (!existing || attemptScore > existingScore || 
            (attemptScore === existingScore && attempt.attempt_number > existing.attempt_number)) {
          studentPerformanceMap.set(studentId, {
            student_id: studentId,
            student_name: studentName, // ✅ Use direct lookup from users table
            section: 'N/A', // Section info not needed for results page
            attempt_number: attempt.attempt_number,
            attempt_id: attempt.attempt_id, // ✅ ADD: Store attempt_id for best attempt
            graded_attempts_count: studentAttemptCounts.get(studentId) || 1, // ✅ FIX: Count of graded/submitted attempts
            score: attemptScore,
            max_score: quiz.total_points,
            percentage: attemptScore
              ? Math.round((attemptScore / quiz.total_points) * 100 * 100) /
                100
              : 0,
            time_spent: attempt.time_taken_seconds || 0,
            status: attempt.status,
            submitted_at: attempt.submitted_at,
            is_late:
              quiz.end_date && attempt.submitted_at
                ? new Date(attempt.submitted_at) > new Date(quiz.end_date)
                : false,
          });
        }
      });

      const studentPerformance = Array.from(studentPerformanceMap.values());

      return {
        quizId,
        students: studentPerformance,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      this.logger.error('Error fetching student performance:', error);
      // Return empty data instead of 500 error
      return {
        quizId,
        students: [],
      };
    }
  }

  /**
   * Get detailed answers for a specific student in a quiz
   */
  async getStudentAnswers(
    quizId: string,
    studentId: string,
    teacherId: string,
  ): Promise<any> {
    try {
      const supabase = this.supabaseService.getClient();

      // Verify quiz ownership
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('teacher_id, quiz_id')
        .eq('quiz_id', quizId)
        .single();

      if (quizError || !quiz) {
        throw new NotFoundException('Quiz not found');
      }

      if (quiz.teacher_id !== teacherId) {
        throw new ForbiddenException(
          'You can only view answers for your own quizzes',
        );
      }

      // ✅ FIX: Get student's BEST completed attempt (highest score), not latest
      // First get all completed attempts, then find the best one
      const { data: completedAttempts, error: attemptsError } = await supabase
        .from('quiz_attempts')
        .select('attempt_id, status, score, time_taken_seconds, submitted_at, attempt_number')
        .eq('quiz_id', quizId)
        .eq('student_id', studentId)
        .in('status', ['submitted', 'graded', 'completed']);

      this.logger.log(
        `Found ${completedAttempts?.length || 0} completed attempts for student ${studentId} in quiz ${quizId}`,
      );
      if (completedAttempts && completedAttempts.length > 0) {
        this.logger.log(`Attempt statuses: ${completedAttempts.map((a) => a.status).join(', ')}`);
      }

      if (attemptsError || !completedAttempts || completedAttempts.length === 0) {
        this.logger.warn(
          `No completed attempt found for student ${studentId} in quiz ${quizId}. Error: ${attemptsError?.message}`,
        );
        return {
          quizId,
          studentId,
          attemptId: null,
          answers: [],
        };
      }

      // Find the best attempt: highest score, or if scores equal, prefer latest
      const attempt = completedAttempts.reduce((best, current) => {
        const bestScore = best.score || 0;
        const currentScore = current.score || 0;
        
        if (currentScore > bestScore) {
          return current;
        } else if (currentScore === bestScore && current.attempt_number > best.attempt_number) {
          return current;
        }
        return best;
      });

      this.logger.log(
        `Using BEST attempt ${attempt.attempt_id} (score: ${attempt.score}, attempt #${attempt.attempt_number}) with status: ${attempt.status}`,
      );

      // Get all answers for this attempt with question details
      const { data: answers, error: answersError } = await supabase
        .from('quiz_student_answers')
        .select(
          `
          question_id,
          choice_id,
          choice_ids,
          answer_text,
          answer_json,
          points_awarded,
          is_correct,
          time_spent_seconds,
          quiz_questions!inner (
            question_text,
            question_type,
            points,
            order_index,
            correct_answer
          )
        `,
        )
        .eq('attempt_id', attempt.attempt_id);

      if (answersError) {
        this.logger.error('Error fetching student answers:', answersError);
        throw new InternalServerErrorException(
          'Failed to fetch student answers',
        );
      }

      this.logger.log(
        `Found ${answers?.length || 0} answers in quiz_student_answers for attempt ${attempt.attempt_id}`,
      );

      if (!answers || answers.length === 0) {
        this.logger.warn(
          `No answers found in quiz_student_answers for attempt ${attempt.attempt_id}. Student may have submitted without answering questions.`,
        );
      }

      // For each answer, get the choice text
      const enrichedAnswers = await Promise.all(
        answers.map(async (answer) => {
          const question = Array.isArray(answer.quiz_questions)
            ? answer.quiz_questions[0]
            : answer.quiz_questions;

          let studentAnswer = 'No answer';
          let correctAnswer = 'N/A';

          // Get student's answer text
          if (answer.choice_id) {
            const { data: choiceData } = await supabase
              .from('quiz_choices')
              .select('choice_text')
              .eq('choice_id', answer.choice_id)
              .single();
            studentAnswer = choiceData?.choice_text || 'No answer';
          } else if (answer.choice_ids && answer.choice_ids.length > 0) {
            const { data: choicesData } = await supabase
              .from('quiz_choices')
              .select('choice_text')
              .in('choice_id', answer.choice_ids);
            studentAnswer =
              choicesData?.map((c) => c.choice_text).join(', ') || 'No answer';
          } else if (answer.answer_text) {
            studentAnswer = answer.answer_text;
          } else if (answer.answer_json) {
            // Handle fill-in-blank and other JSON answers
            if (Array.isArray(answer.answer_json)) {
              // Fill-in-blank: ["Paris", "Manila"]
              studentAnswer = answer.answer_json.join(', ');
            } else if (typeof answer.answer_json === 'object') {
              // ✅ FIX: For matching questions, return the object directly (not stringified)
              // Frontend will format it properly
              if (question?.question_type === 'matching' || question?.question_type === 'matching-pair') {
                studentAnswer = answer.answer_json;
              } else {
                // Other complex answers (ordering, etc.) - stringify for now
                studentAnswer = JSON.stringify(answer.answer_json);
              }
            } else {
              studentAnswer = String(answer.answer_json);
            }
          }

          // Get correct answer(s)
          // For fill-in-blank and matching, check metadata first
          if (question?.question_type === 'fill_in_blank') {
            const { data: metadata } = await supabase
              .from('quiz_question_metadata')
              .select('metadata')
              .eq('question_id', answer.question_id)
              .single();

            if (metadata?.metadata?.blank_positions) {
              const correctAnswers = metadata.metadata.blank_positions.map(
                (bp: any) => bp.answer
              );
              correctAnswer = correctAnswers.join(', ');
            }
          } else if (question?.question_type === 'matching' || question?.question_type === 'matching-pair') {
            // ✅ FIX: Extract matching pairs from metadata for correct answer
            const { data: metadata } = await supabase
              .from('quiz_question_metadata')
              .select('metadata')
              .eq('question_id', answer.question_id)
              .single();

            if (metadata?.metadata?.matching_pairs) {
              // Return the matching_pairs object (will be formatted by frontend)
              correctAnswer = metadata.metadata.matching_pairs;
            } else {
              correctAnswer = 'N/A';
            }
          } else if (question?.correct_answer) {
            // For multiple choice/true-false, correct_answer contains choice_id(s)
            // For text answers, it contains the text directly
            const correctAnswerData = question.correct_answer;

            // Check if it's a choice_id (UUID format)
            if (
              typeof correctAnswerData === 'string' &&
              correctAnswerData.match(
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
              )
            ) {
              // It's a single choice_id, fetch the choice text
              const { data: choiceData } = await supabase
                .from('quiz_choices')
                .select('choice_text')
                .eq('choice_id', correctAnswerData)
                .single();
              correctAnswer = choiceData?.choice_text || correctAnswerData;
            } else if (Array.isArray(correctAnswerData)) {
              // It's an array of choice_ids, fetch all choice texts
              const { data: choicesData } = await supabase
                .from('quiz_choices')
                .select('choice_text')
                .in('choice_id', correctAnswerData);
              correctAnswer =
                choicesData?.map((c) => c.choice_text).join(', ') ||
                correctAnswerData.join(', ');
            } else {
              // It's plain text (for true/false, short answer, etc.)
              correctAnswer = String(correctAnswerData);
            }
          } else {
            // Fallback: Query quiz_choices for is_correct = true
            const { data: correctChoices } = await supabase
              .from('quiz_choices')
              .select('choice_text')
              .eq('question_id', answer.question_id)
              .eq('is_correct', true);

            if (correctChoices && correctChoices.length > 0) {
              correctAnswer = correctChoices
                .map((c) => c.choice_text)
                .join(', ');
            }
          }

          return {
            questionId: answer.question_id,
            questionNumber: (question?.order_index || 0) + 1,
            questionText: question?.question_text || '',
            questionType: question?.question_type || 'multiple_choice',
            studentAnswer,
            correctAnswer,
            isCorrect: answer.is_correct || false,
            pointsAwarded: answer.points_awarded || 0,
            maxPoints: question?.points || 0,
            timeSpent: answer.time_spent_seconds || 0,
            orderIndex: question?.order_index || 0, // Keep for sorting
          };
        }),
      );

      // Sort by question order
      enrichedAnswers.sort((a, b) => a.orderIndex - b.orderIndex);

      // Remove orderIndex from final response
      const sortedAnswers = enrichedAnswers.map(({ orderIndex, ...answer }) => answer);

      return {
        quizId,
        studentId,
        attemptId: attempt.attempt_id,
        score: attempt.score,
        timeTaken: attempt.time_taken_seconds,
        submittedAt: attempt.submitted_at,
        answers: sortedAnswers,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      this.logger.error('Error fetching student answers:', error);
      throw new InternalServerErrorException('Failed to fetch student answers');
    }
  }
}
