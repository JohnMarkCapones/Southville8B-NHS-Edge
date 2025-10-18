import {
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { GradeAnswerDto } from '../dto/grade-answer.dto';

@Injectable()
export class GradingService {
  private readonly logger = new Logger(GradingService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Get all ungraded essay answers for a quiz
   */
  async getUngradedAnswers(quizId: string, teacherId: string): Promise<any> {
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
        throw new ForbiddenException('You can only grade your own quizzes');
      }

      // Get essay questions for this quiz
      const { data: essayQuestions } = await supabase
        .from('quiz_questions')
        .select('question_id')
        .eq('quiz_id', quizId)
        .in('question_type', ['essay', 'short_answer']);

      if (!essayQuestions || essayQuestions.length === 0) {
        return [];
      }

      const questionIds = essayQuestions.map((q) => q.question_id);

      // Get ungraded answers
      const { data: answers, error } = await supabase
        .from('quiz_student_answers')
        .select(
          `
          *,
          quiz_attempts!inner(quiz_id, student_id, attempt_number),
          quiz_questions!inner(question_text, points)
        `,
        )
        .in('question_id', questionIds)
        .is('is_correct', null) // Ungraded
        .eq('quiz_attempts.quiz_id', quizId)
        .order('answered_at', { ascending: true });

      if (error) {
        this.logger.error('Error fetching ungraded answers:', error);
        throw new InternalServerErrorException('Failed to fetch ungraded answers');
      }

      return answers || [];
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      this.logger.error('Error fetching ungraded answers:', error);
      throw new InternalServerErrorException('Failed to fetch ungraded answers');
    }
  }

  /**
   * Grade a student's answer
   */
  async gradeAnswer(
    answerId: string,
    teacherId: string,
    gradeDto: GradeAnswerDto,
  ): Promise<any> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      // Get answer and verify quiz ownership
      const { data: answer, error: answerError } = await supabase
        .from('quiz_student_answers')
        .select(
          `
          *,
          quiz_attempts!inner(quiz_id),
          quiz_questions!inner(points)
        `,
        )
        .eq('answer_id', answerId)
        .single();

      if (answerError || !answer) {
        throw new NotFoundException('Answer not found');
      }

      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('teacher_id')
        .eq('quiz_id', answer.quiz_attempts.quiz_id)
        .single();

      if (quizError || !quiz || quiz.teacher_id !== teacherId) {
        throw new ForbiddenException('You can only grade your own quizzes');
      }

      // Validate points
      const maxPoints = answer.quiz_questions.points;
      if (gradeDto.pointsAwarded > maxPoints) {
        throw new ForbiddenException(
          `Points awarded (${gradeDto.pointsAwarded}) cannot exceed maximum points (${maxPoints})`,
        );
      }

      // Update answer with grading
      const { data: gradedAnswer, error: updateError } = await supabase
        .from('quiz_student_answers')
        .update({
          points_awarded: gradeDto.pointsAwarded,
          is_correct: gradeDto.isCorrect,
          graded_by: teacherId,
          graded_at: new Date().toISOString(),
          grader_feedback: gradeDto.graderFeedback,
        })
        .eq('answer_id', answerId)
        .select()
        .single();

      if (updateError) {
        this.logger.error('Error grading answer:', updateError);
        throw new InternalServerErrorException('Failed to grade answer');
      }

      // Recalculate attempt score
      await this.recalculateAttemptScore(answer.attempt_id);

      this.logger.log(`Answer graded: ${answerId}`);
      return gradedAnswer;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      this.logger.error('Error grading answer:', error);
      throw new InternalServerErrorException('Failed to grade answer');
    }
  }

  /**
   * Recalculate quiz attempt score after grading
   */
  private async recalculateAttemptScore(attemptId: string): Promise<void> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      // Get all answers for this attempt
      const { data: answers } = await supabase
        .from('quiz_student_answers')
        .select('points_awarded, is_correct')
        .eq('attempt_id', attemptId);

      if (!answers) return;

      // Check if all answers are graded
      const allGraded = answers.every((a) => a.is_correct !== null);

      if (!allGraded) {
        // Don't update score if not all answers are graded
        return;
      }

      // Calculate total score
      const totalScore = answers.reduce(
        (sum, answer) => sum + (answer.points_awarded || 0),
        0,
      );

      // Update attempt
      const { error } = await supabase
        .from('quiz_attempts')
        .update({
          score: totalScore,
          status: 'graded',
        })
        .eq('attempt_id', attemptId);

      if (error) {
        this.logger.error('Error updating attempt score:', error);
      } else {
        this.logger.log(`Attempt score updated: ${attemptId} - ${totalScore}`);
      }
    } catch (error) {
      this.logger.error('Error recalculating attempt score:', error);
    }
  }
}
