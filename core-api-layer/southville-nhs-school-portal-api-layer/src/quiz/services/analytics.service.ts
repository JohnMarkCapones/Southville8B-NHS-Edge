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

      // Verify quiz ownership
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('teacher_id, total_points')
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
          totalAttempts: 0,
          totalStudents: 0,
          completedAttempts: 0,
          averageScore: 0,
          highestScore: 0,
          lowestScore: 0,
          medianScore: 0,
          passRate: 0,
          averageTimeTaken: 0,
        };
      }

      // Calculate statistics
      const scores = attempts
        .filter((a) => a.score !== null)
        .map((a) => a.score as number);

      const totalAttempts = attempts.length;
      const totalStudents = new Set(attempts.map((a) => a.student_id)).size;
      const completedAttempts = scores.length;

      const averageScore =
        scores.length > 0
          ? scores.reduce((sum, score) => sum + score, 0) / scores.length
          : 0;

      const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
      const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;

      // Calculate median
      const sortedScores = [...scores].sort((a, b) => a - b);
      const medianScore =
        sortedScores.length > 0
          ? sortedScores.length % 2 === 0
            ? (sortedScores[sortedScores.length / 2 - 1] +
                sortedScores[sortedScores.length / 2]) /
              2
            : sortedScores[Math.floor(sortedScores.length / 2)]
          : 0;

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
      const averageTimeTaken =
        timesWithData.length > 0
          ? timesWithData.reduce((sum, a) => sum + a.time_taken_seconds!, 0) /
            timesWithData.length
          : 0;

      return {
        totalAttempts,
        totalStudents,
        completedAttempts,
        averageScore: Math.round(averageScore * 100) / 100,
        highestScore,
        lowestScore,
        medianScore: Math.round(medianScore * 100) / 100,
        passRate: Math.round(passRate * 100) / 100,
        averageTimeTaken: Math.round(averageTimeTaken),
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

      // Get all questions
      const { data: questions, error: questionsError } = await supabase
        .from('quiz_questions')
        .select('question_id, question_text, question_type, points')
        .eq('quiz_id', quizId);

      if (questionsError) {
        this.logger.error('Error fetching questions:', questionsError);
        throw new InternalServerErrorException(
          'Failed to fetch question analytics',
        );
      }

      if (!questions || questions.length === 0) {
        return [];
      }

      // Get all answers for these questions
      const questionIds = questions.map((q) => q.question_id);
      const { data: answers, error: answersError } = await supabase
        .from('quiz_student_answers')
        .select('question_id, is_correct, points_awarded, time_spent_seconds')
        .in('question_id', questionIds);

      if (answersError) {
        this.logger.error('Error fetching answers:', answersError);
        throw new InternalServerErrorException(
          'Failed to fetch question analytics',
        );
      }

      // Calculate stats per question
      const questionStats = questions.map((question) => {
        const questionAnswers =
          answers?.filter((a) => a.question_id === question.question_id) || [];

        const totalAttempts = questionAnswers.length;
        const correctCount = questionAnswers.filter(
          (a) => a.is_correct === true,
        ).length;
        const incorrectCount = questionAnswers.filter(
          (a) => a.is_correct === false,
        ).length;
        const skippedCount = questionAnswers.filter(
          (a) => a.is_correct === null,
        ).length;

        const correctRate =
          totalAttempts > 0 ? (correctCount / totalAttempts) * 100 : 0;

        const avgTimeSpent =
          questionAnswers.length > 0
            ? questionAnswers
                .filter((a) => a.time_spent_seconds !== null)
                .reduce((sum, a) => sum + (a.time_spent_seconds || 0), 0) /
              questionAnswers.filter((a) => a.time_spent_seconds !== null)
                .length
            : 0;

        return {
          questionId: question.question_id,
          questionText: question.question_text,
          questionType: question.question_type,
          points: question.points,
          totalAttempts,
          correctCount,
          incorrectCount,
          skippedCount,
          correctRate: Math.round(correctRate * 100) / 100,
          averageTimeSpent: Math.round(avgTimeSpent),
        };
      });

      return questionStats;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      this.logger.error('Error fetching question analytics:', error);
      throw new InternalServerErrorException(
        'Failed to fetch question analytics',
      );
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

      // Get all attempts grouped by student
      const { data: attempts, error: attemptsError } = await supabase
        .from('quiz_attempts')
        .select('student_id, attempt_number, score, time_taken_seconds, status')
        .eq('quiz_id', quizId)
        .order('student_id')
        .order('attempt_number');

      if (attemptsError) {
        this.logger.error('Error fetching attempts:', attemptsError);
        throw new InternalServerErrorException(
          'Failed to fetch student performance',
        );
      }

      if (!attempts || attempts.length === 0) {
        return [];
      }

      // Group by student
      const studentMap = new Map<string, any>();

      attempts.forEach((attempt) => {
        if (!studentMap.has(attempt.student_id)) {
          studentMap.set(attempt.student_id, {
            studentId: attempt.student_id,
            attempts: [],
          });
        }
        studentMap.get(attempt.student_id).attempts.push(attempt);
      });

      // Calculate stats per student
      const studentPerformance = Array.from(studentMap.values()).map(
        (student) => {
          const completedAttempts = student.attempts.filter(
            (a) => a.status === 'submitted' || a.status === 'graded',
          );

          const scores = completedAttempts
            .filter((a) => a.score !== null)
            .map((a) => a.score);

          const averageScore =
            scores.length > 0
              ? scores.reduce((sum, score) => sum + score, 0) / scores.length
              : 0;

          const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
          const latestScore =
            completedAttempts.length > 0
              ? completedAttempts[completedAttempts.length - 1].score || 0
              : 0;

          return {
            studentId: student.studentId,
            totalAttempts: student.attempts.length,
            completedAttempts: completedAttempts.length,
            averageScore: Math.round(averageScore * 100) / 100,
            bestScore,
            latestScore,
          };
        },
      );

      return studentPerformance;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      this.logger.error('Error fetching student performance:', error);
      throw new InternalServerErrorException(
        'Failed to fetch student performance',
      );
    }
  }
}
