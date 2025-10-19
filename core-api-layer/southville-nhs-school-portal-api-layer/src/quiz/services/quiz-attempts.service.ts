import {
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { StartQuizAttemptDto } from '../dto/start-quiz-attempt.dto';
import { SubmitAnswerDto } from '../dto/submit-answer.dto';
import { QuizAttempt } from '../entities';
import { AutoGradingService } from './auto-grading.service';
import { SessionManagementService } from './session-management.service';

@Injectable()
export class QuizAttemptsService {
  private readonly logger = new Logger(QuizAttemptsService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly autoGradingService: AutoGradingService,
    private readonly sessionManagementService: SessionManagementService,
  ) {}

  /**
   * Start a new quiz attempt for a student
   */
  async startAttempt(
    quizId: string,
    studentId: string,
    startDto: StartQuizAttemptDto,
    ipAddress?: string,
  ): Promise<any> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      // Get quiz details
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('quiz_id', quizId)
        .single();

      if (quizError || !quiz) {
        throw new NotFoundException('Quiz not found');
      }

      // Check if quiz is published
      if (quiz.status !== 'published') {
        throw new BadRequestException('Quiz is not published yet');
      }

      // Check if quiz has ended
      if (quiz.end_date && new Date(quiz.end_date) < new Date()) {
        throw new BadRequestException('Quiz has ended');
      }

      // Check if retakes are allowed
      const { data: existingAttempts, error: attemptsError } = await supabase
        .from('quiz_attempts')
        .select('attempt_number')
        .eq('quiz_id', quizId)
        .eq('student_id', studentId)
        .order('attempt_number', { ascending: false });

      if (attemptsError) {
        this.logger.error('Error checking existing attempts:', attemptsError);
      }

      const attemptNumber = (existingAttempts?.length || 0) + 1;

      // Check if retakes are allowed
      if (!quiz.allow_retakes && existingAttempts && existingAttempts.length > 0) {
        throw new ForbiddenException('Retakes are not allowed for this quiz');
      }

      // Get questions (randomize if needed)
      let questionsToShow: string[] = [];
      const { data: allQuestions } = await supabase
        .from('quiz_questions')
        .select('question_id')
        .eq('quiz_id', quizId)
        .order('order_index', { ascending: true });

      if (quiz.question_pool_size && quiz.questions_to_display && allQuestions) {
        // Randomize questions from pool
        const shuffled = allQuestions
          .sort(() => 0.5 - Math.random())
          .slice(0, quiz.questions_to_display);
        questionsToShow = shuffled.map((q) => q.question_id);
      } else if (allQuestions) {
        questionsToShow = allQuestions.map((q) => q.question_id);
      }

      // Create quiz attempt
      const { data: attempt, error: attemptError } = await supabase
        .from('quiz_attempts')
        .insert({
          quiz_id: quizId,
          student_id: studentId,
          attempt_number: attemptNumber,
          status: 'in_progress',
          max_possible_score: quiz.total_points,
          questions_shown: questionsToShow,
        })
        .select()
        .single();

      if (attemptError) {
        this.logger.error('Error creating quiz attempt:', attemptError);
        throw new InternalServerErrorException('Failed to start quiz attempt');
      }

      // Check for duplicate sessions and terminate them BEFORE creating new session
      this.logger.log(`Checking for duplicate sessions for student ${studentId} on quiz ${quizId}`);
      await this.sessionManagementService.checkDuplicateSessions(
        quizId,
        studentId,
        attempt.attempt_id,
      );

      // Create active session (after duplicates are cleaned up)
      const { data: sessionData, error: sessionError } = await supabase
        .from('quiz_active_sessions')
        .insert({
          quiz_id: quizId,
          student_id: studentId,
          attempt_id: attempt.attempt_id,
          initial_device_fingerprint: startDto.deviceFingerprint,
          initial_ip_address: ipAddress,
          initial_user_agent: startDto.userAgent,
        })
        .select()
        .single();

      if (sessionError) {
        this.logger.error('❌ FAILED to create active session:', {
          error: sessionError,
          code: sessionError.code,
          message: sessionError.message,
          details: sessionError.details,
          hint: sessionError.hint,
          attemptId: attempt.attempt_id,
        });
        throw new InternalServerErrorException('Failed to create quiz session');
      } else {
        this.logger.log(`✅ Active session created: ${sessionData.session_id} for attempt ${attempt.attempt_id}`);
      }

      this.logger.log(
        `Quiz attempt started: ${attempt.attempt_id} (attempt #${attemptNumber})`,
      );

      return {
        attemptId: attempt.attempt_id,
        attemptNumber,
        questionsShown: questionsToShow,
        timeLimit: quiz.time_limit,
        startedAt: attempt.started_at,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      this.logger.error('Error starting quiz attempt:', error);
      throw new InternalServerErrorException('Failed to start quiz attempt');
    }
  }

  /**
   * Submit an answer during quiz attempt (auto-save)
   */
  async submitAnswer(
    attemptId: string,
    studentId: string,
    submitDto: SubmitAnswerDto,
  ): Promise<void> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      // Verify attempt ownership and status
      const { data: attempt, error: attemptError } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('attempt_id', attemptId)
        .eq('student_id', studentId)
        .single();

      if (attemptError || !attempt) {
        throw new NotFoundException('Quiz attempt not found');
      }

      if (attempt.status !== 'in_progress') {
        throw new BadRequestException('Quiz attempt is not in progress');
      }

      // Get the active session for this attempt
      const { data: session, error: sessionFetchError } = await supabase
        .from('quiz_active_sessions')
        .select('session_id')
        .eq('attempt_id', attemptId)
        .eq('is_active', true)
        .single();

      if (sessionFetchError || !session) {
        this.logger.error('Active session not found:', sessionFetchError);
        throw new NotFoundException('Active quiz session not found');
      }

      // Save answer to session answers (temporary storage)
      const { error: sessionError } = await supabase
        .from('quiz_session_answers')
        .upsert({
          session_id: session.session_id, // ✅ CORRECT - use actual session_id
          question_id: submitDto.questionId,
          temporary_choice_id: submitDto.choiceId,
          temporary_choice_ids: submitDto.choiceIds,
          temporary_answer_text: submitDto.answerText,
          temporary_answer_json: submitDto.answerJson,
          last_updated: new Date().toISOString(),
        });

      if (sessionError) {
        this.logger.error('Error saving answer:', sessionError);
        throw new InternalServerErrorException('Failed to save answer');
      }

      this.logger.log(`Answer saved for question ${submitDto.questionId}`);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      this.logger.error('Error submitting answer:', error);
      throw new InternalServerErrorException('Failed to submit answer');
    }
  }

  /**
   * Submit quiz attempt (finalize)
   */
  async submitAttempt(attemptId: string, studentId: string): Promise<any> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      // Get attempt
      const { data: attempt, error: attemptError } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('attempt_id', attemptId)
        .eq('student_id', studentId)
        .single();

      if (attemptError || !attempt) {
        throw new NotFoundException('Quiz attempt not found');
      }

      if (attempt.status !== 'in_progress') {
        throw new BadRequestException('Quiz attempt is already submitted');
      }

      // Get the active session for this attempt
      const { data: session } = await supabase
        .from('quiz_active_sessions')
        .select('session_id')
        .eq('attempt_id', attemptId)
        .single();

      // Move session answers to final answers table
      const { data: sessionAnswers } = await supabase
        .from('quiz_session_answers')
        .select('*')
        .eq('session_id', session?.session_id || attemptId); // Fallback to attemptId if no session found

      if (sessionAnswers && sessionAnswers.length > 0) {
        const finalAnswers = sessionAnswers.map((ans) => ({
          attempt_id: attemptId,
          question_id: ans.question_id,
          choice_id: ans.temporary_choice_id,
          choice_ids: ans.temporary_choice_ids,
          answer_text: ans.temporary_answer_text,
          answer_json: ans.temporary_answer_json,
        }));

        const { error: answersError } = await supabase
          .from('quiz_student_answers')
          .insert(finalAnswers);

        if (answersError) {
          this.logger.error('Error saving final answers:', answersError);
          throw new InternalServerErrorException('Failed to save final answers');
        }
      }

      // Auto-grade the quiz attempt
      this.logger.log(`Starting auto-grading for attempt ${attemptId}`);
      const gradingResult = await this.autoGradingService.gradeQuizAttempt(attemptId);
      this.logger.log(
        `Auto-grading complete: ${gradingResult.totalScore}/${gradingResult.maxScore} ` +
        `(${gradingResult.gradedCount} auto-graded, ${gradingResult.manualGradingRequired} manual)`,
      );

      // Calculate time taken
      const startedAt = new Date(attempt.started_at);
      const now = new Date();
      const timeTakenSeconds = Math.floor((now.getTime() - startedAt.getTime()) / 1000);

      // Determine final status based on grading
      const finalStatus = gradingResult.manualGradingRequired > 0 ? 'submitted' : 'graded';

      // Update attempt status
      const { error: updateError } = await supabase
        .from('quiz_attempts')
        .update({
          status: finalStatus,
          submitted_at: now.toISOString(),
          time_taken_seconds: timeTakenSeconds,
        })
        .eq('attempt_id', attemptId);

      if (updateError) {
        this.logger.error('Error updating attempt:', updateError);
        throw new InternalServerErrorException('Failed to submit quiz');
      }

      // Deactivate session
      await supabase
        .from('quiz_active_sessions')
        .update({ is_active: false })
        .eq('attempt_id', attemptId);

      this.logger.log(`Quiz attempt submitted: ${attemptId}`);

      return {
        success: true,
        attemptId,
        submittedAt: now.toISOString(),
        timeTaken: timeTakenSeconds,
        score: gradingResult.totalScore,
        maxScore: gradingResult.maxScore,
        status: finalStatus,
        autoGraded: gradingResult.gradedCount,
        manualGradingRequired: gradingResult.manualGradingRequired,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      this.logger.error('Error submitting quiz attempt:', error);
      throw new InternalServerErrorException('Failed to submit quiz');
    }
  }

  /**
   * Get quiz attempt details
   */
  async getAttempt(attemptId: string, studentId: string): Promise<QuizAttempt> {
    const supabase = this.supabaseService.getClient();

    const { data: attempt, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('attempt_id', attemptId)
      .eq('student_id', studentId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundException('Quiz attempt not found');
      }
      this.logger.error('Error fetching attempt:', error);
      throw new InternalServerErrorException('Failed to fetch attempt');
    }

    return attempt;
  }
}
