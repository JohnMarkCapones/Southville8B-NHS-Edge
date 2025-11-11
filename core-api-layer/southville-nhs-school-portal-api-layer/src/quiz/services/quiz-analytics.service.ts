import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class QuizAnalyticsService {
  private readonly logger = new Logger(QuizAnalyticsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Calculate and update aggregate analytics for a quiz
   * Called after each quiz submission to keep stats up-to-date
   */
  async calculateQuizAnalytics(quizId: string): Promise<void> {
    const supabase = this.supabaseService.getServiceClient();

    this.logger.log(`Calculating analytics for quiz ${quizId}`);

    try {
      // Fetch all completed attempts for this quiz
      const { data: attempts, error: attemptsError } = await supabase
        .from('quiz_attempts')
        .select('student_id, score, time_taken_seconds, status')
        .eq('quiz_id', quizId)
        .in('status', ['submitted', 'graded']);

      if (attemptsError) {
        this.logger.error('Error fetching attempts:', attemptsError);
        throw new InternalServerErrorException(
          'Failed to fetch attempts for analytics',
        );
      }

      if (!attempts || attempts.length === 0) {
        this.logger.log('No completed attempts found, skipping analytics');
        return;
      }

      // Get quiz passing score
      const { data: quiz } = await supabase
        .from('quizzes')
        .select('passing_score, total_points')
        .eq('quiz_id', quizId)
        .single();

      const passingScore = quiz?.passing_score || 0;

      // Calculate statistics
      const totalAttempts = attempts.length;
      const uniqueStudents = new Set(
        attempts.map((a) => a.student_id),
      ).size;
      const completedAttempts = attempts.filter((a) =>
        ['submitted', 'graded'].includes(a.status),
      ).length;

      // Score statistics
      const scores = attempts.map((a) => a.score || 0);
      const averageScore =
        scores.reduce((sum, score) => sum + score, 0) / totalAttempts;
      const highestScore = Math.max(...scores);
      const lowestScore = Math.min(...scores);
      const medianScore = this.calculateMedian(scores);

      // Pass rate calculation
      const passedCount = scores.filter((score) => score >= passingScore).length;
      const passRate = (passedCount / totalAttempts) * 100;

      // Time statistics (filter out null values)
      const timeTaken = attempts
        .map((a) => a.time_taken_seconds)
        .filter((t) => t !== null && t !== undefined) as number[];

      let averageTime: number | null = null;
      let fastestTime: number | null = null;
      let slowestTime: number | null = null;

      if (timeTaken.length > 0) {
        averageTime = Math.floor(
          timeTaken.reduce((sum, time) => sum + time, 0) / timeTaken.length,
        );
        fastestTime = Math.min(...timeTaken);
        slowestTime = Math.max(...timeTaken);
      }

      this.logger.log(
        `Analytics calculated: ${totalAttempts} attempts, ${uniqueStudents} students, ` +
          `avg=${averageScore.toFixed(2)}, pass_rate=${passRate.toFixed(1)}%`,
      );

      // UPSERT into quiz_analytics
      const { error: upsertError } = await supabase
        .from('quiz_analytics')
        .upsert(
          {
            quiz_id: quizId,
            total_attempts: totalAttempts,
            total_students: uniqueStudents,
            completed_attempts: completedAttempts,
            average_score: averageScore,
            highest_score: highestScore,
            lowest_score: lowestScore,
            median_score: medianScore,
            pass_rate: passRate,
            average_time_taken_seconds: averageTime,
            fastest_completion_seconds: fastestTime,
            slowest_completion_seconds: slowestTime,
            last_calculated_at: new Date().toISOString(),
          },
          {
            onConflict: 'quiz_id',
          },
        );

      if (upsertError) {
        this.logger.error('Error upserting quiz analytics:', upsertError);
        throw new InternalServerErrorException(
          'Failed to update quiz analytics',
        );
      }

      this.logger.log(`✅ Quiz analytics updated successfully for quiz ${quizId}`);
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.error('Unexpected error calculating analytics:', error);
      throw new InternalServerErrorException(
        'Failed to calculate quiz analytics',
      );
    }
  }

  /**
   * Calculate and update per-question statistics
   * Provides difficulty metrics and psychometric analysis
   */
  async calculateQuestionStats(quizId: string): Promise<void> {
    const supabase = this.supabaseService.getServiceClient();

    this.logger.log(`Calculating question stats for quiz ${quizId}`);

    try {
      // Get all questions for this quiz
      const { data: questions, error: questionsError } = await supabase
        .from('quiz_questions')
        .select('question_id')
        .eq('quiz_id', quizId);

      if (questionsError) {
        this.logger.error('Error fetching questions:', questionsError);
        throw new InternalServerErrorException(
          'Failed to fetch questions for stats',
        );
      }

      if (!questions || questions.length === 0) {
        this.logger.log('No questions found, skipping question stats');
        return;
      }

      // Process each question
      const statsUpdates: Array<{
        question_id: string;
        quiz_id: string;
        total_attempts: number;
        correct_count: number;
        incorrect_count: number;
        skipped_count: number;
        difficulty_score: number;
        average_time_spent_seconds: number | null;
        discrimination_index: number;
        last_calculated_at: string;
      }> = [];

      // Get total number of attempts for this quiz ONCE (outside loop)
      const { data: quizAttempts } = await supabase
        .from('quiz_attempts')
        .select('attempt_id')
        .eq('quiz_id', quizId)
        .in('status', ['submitted', 'graded']);

      const totalQuizAttempts = quizAttempts?.length || 0;

      for (const question of questions) {
        const questionId = question.question_id;

        // Fetch all student answers for this question
        const { data: answers, error: answersError } = await supabase
          .from('quiz_student_answers')
          .select('is_correct, attempt_id, time_spent_seconds')
          .eq('question_id', questionId);

        if (answersError) {
          this.logger.warn(
            `Error fetching answers for question ${questionId}:`,
            answersError,
          );
          continue;
        }

        // Filter answers to only those from completed attempts of this quiz
        const attemptIds = quizAttempts?.map((a) => a.attempt_id) || [];
        const relevantAnswers = answers?.filter((a) =>
          attemptIds.includes(a.attempt_id),
        ) || [];

        // Calculate statistics for this question
        const totalAttempts = relevantAnswers.length;
        const correctCount =
          relevantAnswers.filter((a) => a.is_correct === true).length;
        const incorrectCount =
          relevantAnswers.filter((a) => a.is_correct === false).length;

        // Skipped = students who took quiz but didn't answer this question
        const skippedCount = totalQuizAttempts - totalAttempts;

        // Calculate average time spent on this question
        const timesSpent = relevantAnswers
          .map((a) => a.time_spent_seconds)
          .filter((t) => t !== null && t !== undefined) as number[];

        let averageTimeSpent: number | null = null;
        if (timesSpent.length > 0) {
          averageTimeSpent = Math.floor(
            timesSpent.reduce((sum, time) => sum + time, 0) / timesSpent.length,
          );
        }

        // Difficulty score: higher = more difficult (0-100 scale)
        // Formula: (incorrect + skipped) / total quiz attempts * 100
        let difficultyScore = 0;
        if (totalQuizAttempts > 0) {
          difficultyScore =
            ((incorrectCount + skippedCount) / totalQuizAttempts) * 100;
        }

        // Calculate discrimination index (measures question quality)
        const discriminationIndex = await this.calculateDiscriminationIndex(
          quizId,
          questionId,
        );

        this.logger.log(
          `Question ${questionId}: ${totalAttempts} attempts, ` +
            `${correctCount} correct (${((correctCount / totalAttempts) * 100).toFixed(1)}%), ` +
            `difficulty=${difficultyScore.toFixed(1)}`,
        );

        statsUpdates.push({
          question_id: questionId,
          quiz_id: quizId,
          total_attempts: totalAttempts,
          correct_count: correctCount,
          incorrect_count: incorrectCount,
          skipped_count: skippedCount,
          difficulty_score: difficultyScore,
          average_time_spent_seconds: averageTimeSpent,
          discrimination_index: discriminationIndex,
          last_calculated_at: new Date().toISOString(),
        });
      }

      // Batch upsert all question stats
      if (statsUpdates.length > 0) {
        const { error: upsertError } = await supabase
          .from('quiz_question_stats')
          .upsert(statsUpdates, {
            onConflict: 'question_id',
          });

        if (upsertError) {
          this.logger.error('Error upserting question stats:', upsertError);
          throw new InternalServerErrorException(
            'Failed to update question stats',
          );
        }

        this.logger.log(
          `✅ Question stats updated successfully for ${statsUpdates.length} questions`,
        );
      }
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.error('Unexpected error calculating question stats:', error);
      throw new InternalServerErrorException(
        'Failed to calculate question stats',
      );
    }
  }

  /**
   * Calculate discrimination index for a question
   * Measures how well the question discriminates between high and low performers
   * Returns value between -1 and 1 (positive = good question, negative = poor question)
   */
  private async calculateDiscriminationIndex(
    quizId: string,
    questionId: string,
  ): Promise<number> {
    const supabase = this.supabaseService.getServiceClient();

    try {
      // Get all attempts with their total scores
      const { data: attempts, error: attemptsError } = await supabase
        .from('quiz_attempts')
        .select('attempt_id, score')
        .eq('quiz_id', quizId)
        .in('status', ['submitted', 'graded'])
        .order('score', { ascending: false });

      if (attemptsError || !attempts || attempts.length < 4) {
        // Need at least 4 attempts to calculate meaningful discrimination
        return 0;
      }

      // Split into top 27% and bottom 27% (standard psychometric approach)
      const cutoffIndex = Math.max(1, Math.floor(attempts.length * 0.27));
      const topGroup = attempts.slice(0, cutoffIndex);
      const bottomGroup = attempts.slice(-cutoffIndex);

      // Get answers for this question from top and bottom groups
      const topAttemptIds = topGroup.map((a) => a.attempt_id);
      const bottomAttemptIds = bottomGroup.map((a) => a.attempt_id);

      const { data: topAnswers } = await supabase
        .from('quiz_student_answers')
        .select('is_correct')
        .eq('question_id', questionId)
        .in('attempt_id', topAttemptIds);

      const { data: bottomAnswers } = await supabase
        .from('quiz_student_answers')
        .select('is_correct')
        .eq('question_id', questionId)
        .in('attempt_id', bottomAttemptIds);

      // Calculate proportion correct in each group
      const topCorrect =
        topAnswers?.filter((a) => a.is_correct === true).length || 0;
      const bottomCorrect =
        bottomAnswers?.filter((a) => a.is_correct === true).length || 0;

      const topProportion = topCorrect / topAttemptIds.length;
      const bottomProportion = bottomCorrect / bottomAttemptIds.length;

      // Discrimination index = proportion_top - proportion_bottom
      const discriminationIndex = topProportion - bottomProportion;

      return discriminationIndex;
    } catch (error) {
      this.logger.warn(
        `Failed to calculate discrimination index for question ${questionId}:`,
        error,
      );
      return 0;
    }
  }

  /**
   * Calculate median value from array of numbers
   */
  private calculateMedian(numbers: number[]): number {
    if (numbers.length === 0) return 0;

    const sorted = [...numbers].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
      // Even length: average of two middle values
      return (sorted[middle - 1] + sorted[middle]) / 2;
    } else {
      // Odd length: middle value
      return sorted[middle];
    }
  }
}
