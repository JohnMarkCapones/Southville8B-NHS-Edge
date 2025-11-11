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
import { QuizAnalyticsService } from './quiz-analytics.service';

@Injectable()
export class QuizAttemptsService {
  private readonly logger = new Logger(QuizAttemptsService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly autoGradingService: AutoGradingService,
    private readonly sessionManagementService: SessionManagementService,
    private readonly analyticsService: QuizAnalyticsService,
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

      // ✅ STEP 1: Check for existing active session (for answer restoration + race condition prevention)
      // This check prevents duplicate session creation when user double-clicks "Start Quiz"
      this.logger.log(
        `🔍 Checking for existing active session for student ${studentId} on quiz ${quizId}`,
      );

      const { data: existingSession, error: sessionCheckError } = await supabase
        .from('quiz_active_sessions')
        .select('session_id, attempt_id, last_heartbeat')
        .eq('quiz_id', quizId)
        .eq('student_id', studentId)
        .eq('is_active', true)
        .order('started_at', { ascending: false }) // ✅ Fixed: column is started_at (per schema line 256)
        .limit(1)
        .single();

      if (sessionCheckError && sessionCheckError.code !== 'PGRST116') {
        // PGRST116 = no rows found (expected if no active session)
        this.logger.warn('Error checking existing session:', sessionCheckError);
      }

      // Check if existing session is still valid
      // Allow longer timeout for resume (15 minutes instead of 5)
      if (existingSession) {
        this.logger.log(
          `✅ Found existing session ${existingSession.session_id} for student ${studentId}`,
        );
        const lastHeartbeat = new Date(existingSession.last_heartbeat);
        const now = new Date();
        const minutesSinceHeartbeat =
          (now.getTime() - lastHeartbeat.getTime()) / 1000 / 60;

        if (minutesSinceHeartbeat < 15) {
          // Fetch existing attempt details to check status
          const { data: existingAttempt } = await supabase
            .from('quiz_attempts')
            .select('*')
            .eq('attempt_id', existingSession.attempt_id)
            .single();

          // ✅ CRITICAL: Only resume if attempt is still IN PROGRESS
          if (existingAttempt && existingAttempt.status === 'in_progress') {
            this.logger.log(
              `🔄 Resuming existing IN-PROGRESS session ${existingSession.session_id} for attempt ${existingSession.attempt_id}`,
            );

            // Fetch full quiz with questions and choices
            const { data: fullQuiz } = await supabase
              .from('quizzes')
              .select(
                `
              *,
              quiz_questions (
                *,
                quiz_choices (*)
              ),
              quiz_settings (*)
            `,
              )
              .eq('quiz_id', quizId)
              .single();

            // ✅ Fetch saved answers from the EXISTING session
            const { data: savedAnswers, error: answersError } = await supabase
              .from('quiz_session_answers')
              .select('*')
              .eq('session_id', existingSession.session_id);

            if (answersError) {
              this.logger.warn(
                `Failed to fetch saved answers: ${answersError.message}`,
              );
            } else {
              this.logger.log(
                `📝 Found ${savedAnswers?.length || 0} saved answers for session ${existingSession.session_id}`,
              );
            }

            // ✅ PHASE 3: Fetch current question index for UI restoration
            const { data: participant } = await supabase
              .from('quiz_participants')
              .select('current_question_index')
              .eq('session_id', existingSession.session_id)
              .single();

            const currentQuestionIndex =
              participant?.current_question_index ?? 0;
            this.logger.log(
              `📍 Restored question index: ${currentQuestionIndex}`,
            );

            // Return existing attempt with saved answers
            return {
              message: 'Quiz session resumed successfully',
              attempt: {
                ...existingAttempt,
                quiz: fullQuiz,
                savedAnswers: savedAnswers || [], // ✅ CRITICAL: Include in attempt object for frontend access
                currentQuestionIndex: currentQuestionIndex, // ✅ PHASE 3: Include for UI restoration
              },
              questions: fullQuiz?.quiz_questions || [],
              settings: fullQuiz?.quiz_settings?.[0] || null,
              attemptId: existingAttempt.attempt_id,
              attemptNumber: existingAttempt.attempt_number,
              questionsShown: existingAttempt.questions_shown,
              timeLimit: fullQuiz?.time_limit,
              startedAt: existingAttempt.started_at,
              isResumed: true, // ✅ Flag to indicate this is a resumed session
            };
          } else {
            // Attempt exists but is NOT in progress (submitted/terminated)
            this.logger.log(
              `❌ Cannot resume attempt ${existingSession.attempt_id} - status is '${existingAttempt?.status}' (not in_progress)`,
            );
            // Deactivate this session and continue to create new attempt
            await supabase
              .from('quiz_active_sessions')
              .update({ is_active: false })
              .eq('session_id', existingSession.session_id);
          }
        } else {
          // Session expired, deactivate it
          this.logger.log(
            `⏰ Session ${existingSession.session_id} expired (${minutesSinceHeartbeat.toFixed(1)} min since heartbeat)`,
          );
          await supabase
            .from('quiz_active_sessions')
            .update({ is_active: false })
            .eq('session_id', existingSession.session_id);
        }
      }

      // ✅ STEP 2: No active session or expired - create NEW attempt
      this.logger.log(
        `🆕 Creating new quiz attempt for student ${studentId} on quiz ${quizId}`,
      );

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

      // ✅ CRITICAL: Check retakes BEFORE creating attempt
      const { data: existingAttempts, error: attemptsError } = await supabase
        .from('quiz_attempts')
        .select('attempt_number, status')
        .eq('quiz_id', quizId)
        .eq('student_id', studentId)
        .order('attempt_number', { ascending: false });

      if (attemptsError) {
        this.logger.error('Error checking existing attempts:', attemptsError);
      }

      const attemptNumber = (existingAttempts?.length || 0) + 1;

      // ✅ CRITICAL: Prevent retakes if not allowed (BEFORE creating attempt)
      if (existingAttempts && existingAttempts.length > 0) {
        // Check if there are any completed/submitted attempts
        const hasCompletedAttempt = existingAttempts.some(
          (a) => a.status === 'submitted' || a.status === 'graded',
        );

        if (hasCompletedAttempt && !quiz.allow_retakes) {
          this.logger.warn(
            `Student ${studentId} attempted to retake quiz ${quizId} but retakes are disabled`,
          );
          throw new ForbiddenException(
            'You have already completed this quiz. Retakes are not allowed.',
          );
        }
      }

      // Get questions (randomize if needed)
      let questionsToShow: string[] = [];
      const { data: allQuestions } = await supabase
        .from('quiz_questions')
        .select('question_id')
        .eq('quiz_id', quizId)
        .order('order_index', { ascending: true });

      if (
        quiz.question_pool_size &&
        quiz.questions_to_display &&
        allQuestions
      ) {
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
      this.logger.log(
        `Checking for duplicate sessions for student ${studentId} on quiz ${quizId}`,
      );
      await this.sessionManagementService.checkDuplicateSessions(
        quizId,
        studentId,
        attempt.attempt_id,
      );

      // Create active session (after duplicates are cleaned up)
      let sessionData: any = null;
      const { data: initialSessionData, error: sessionError } = await supabase
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

      // Only assign if we got data back
      if (!sessionError && initialSessionData) {
        sessionData = initialSessionData;
      }

      if (sessionError) {
        // Handle duplicate key violation gracefully
        if (sessionError.code === '23505') {
          // Unique constraint violation - session already exists
          // This happens when user double-clicks "Start Quiz" (race condition)
          this.logger.warn(
            `⚠️ RACE CONDITION DETECTED: Duplicate session for student ${studentId} on quiz ${quizId}`,
          );
          this.logger.warn(
            `🔧 Frontend double-click prevention should prevent this. Cleaning up and retrying...`,
          );

          // Delete the duplicate session manually
          await supabase
            .from('quiz_active_sessions')
            .delete()
            .eq('quiz_id', quizId)
            .eq('student_id', studentId);

          // Retry creating the session
          const { data: retriedSessionData, error: retryError } = await supabase
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

          if (retryError || !retriedSessionData) {
            this.logger.error('❌ Failed to create session even after retry:', {
              error: retryError,
              retriedSessionData,
            });
            throw new InternalServerErrorException(
              'Failed to create quiz session after retry',
            );
          }

          sessionData = retriedSessionData;
          this.logger.log(
            `✅ Active session created (retry): ${sessionData.session_id} for attempt ${attempt.attempt_id}`,
          );
        } else {
          this.logger.error('❌ FAILED to create active session:', {
            error: sessionError,
            code: sessionError.code,
            message: sessionError.message,
            details: sessionError.details,
            hint: sessionError.hint,
            attemptId: attempt.attempt_id,
          });
          throw new InternalServerErrorException(
            'Failed to create quiz session',
          );
        }
      } else {
        this.logger.log(
          `✅ Active session created: ${sessionData.session_id} for attempt ${attempt.attempt_id}`,
        );
      }

      // ✅ SAFETY CHECK: Ensure sessionData exists before continuing
      if (!sessionData || !sessionData.session_id) {
        this.logger.error(
          '❌ Session data is invalid after creation:',
          sessionData,
        );
        throw new InternalServerErrorException(
          'Failed to create valid quiz session',
        );
      }

      this.logger.log(
        `Quiz attempt started: ${attempt.attempt_id} (attempt #${attemptNumber})`,
      );

      // Create participant record for real-time monitoring
      const { data: participant, error: participantError } = await supabase
        .from('quiz_participants')
        .insert({
          session_id: sessionData.session_id,
          quiz_id: quizId,
          student_id: studentId,
          status: 'in_progress',
          progress: 0,
          current_question_index: 0,
          questions_answered: 0,
          total_questions: questionsToShow.length,
          start_time: new Date().toISOString(),
          flag_count: 0,
          idle_time_seconds: 0,
        })
        .select()
        .single();

      if (participantError) {
        this.logger.error(
          'Failed to create participant record:',
          participantError,
        );
        // Don't fail the quiz start, just log the error
      } else {
        this.logger.log(
          `✅ Participant created: ${participant.id} for attempt ${attempt.attempt_id}`,
        );
      }

      // Create initial device session for audit trail
      const { data: deviceSession, error: deviceSessionError } = await supabase
        .from('quiz_device_sessions')
        .insert({
          session_id: sessionData.session_id,
          device_fingerprint: startDto.deviceFingerprint || 'unknown',
          ip_address: ipAddress,
          user_agent: startDto.userAgent,
          device_type: this.detectDeviceType(startDto.userAgent),
          first_seen_at: new Date().toISOString(),
          last_seen_at: new Date().toISOString(),
          is_current: true,
        })
        .select()
        .single();

      if (deviceSessionError) {
        this.logger.error(
          'Failed to create device session:',
          deviceSessionError,
        );
        // Don't fail quiz start
      } else {
        this.logger.log(
          `🖥️ Device session created: ${deviceSession.id} (${deviceSession.device_type})`,
        );
      }

      // Fetch full quiz with questions and choices
      const { data: fullQuiz } = await supabase
        .from('quizzes')
        .select(
          `
          *,
          quiz_questions (
            *,
            quiz_choices (*)
          ),
          quiz_settings (*)
        `,
        )
        .eq('quiz_id', quizId)
        .single();

      // ✅ Fetch saved answers from quiz_session_answers (for answer restoration)
      const { data: savedAnswers, error: answersError } = await supabase
        .from('quiz_session_answers')
        .select('*')
        .eq('session_id', sessionData.session_id);

      if (answersError) {
        this.logger.warn(
          `Failed to fetch saved answers: ${answersError.message}`,
        );
        // Don't fail quiz start if we can't fetch answers - just log it
      } else {
        this.logger.log(
          `📝 Found ${savedAnswers?.length || 0} saved answers for session ${sessionData.session_id}`,
        );
      }

      // Return complete response for frontend
      return {
        message: 'Quiz attempt started successfully',
        attempt: {
          ...attempt,
          quiz: fullQuiz, // Include full quiz data
          savedAnswers: savedAnswers || [], // ✅ CRITICAL: Include in attempt object for frontend access
        },
        questions: fullQuiz?.quiz_questions || [],
        settings: fullQuiz?.quiz_settings?.[0] || null,
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

      // ✅ Lookup choice text if choiceId is provided
      let choiceText: string | undefined = submitDto.answerText;

      if (submitDto.choiceId) {
        const { data: choice } = await supabase
          .from('quiz_choices')
          .select('choice_text')
          .eq('choice_id', submitDto.choiceId)
          .single();

        if (choice) {
          choiceText = choice.choice_text;
        }
      }

      // Save answer to session answers (temporary storage)
      const { error: sessionError } = await supabase
        .from('quiz_session_answers')
        .upsert(
          {
            session_id: session.session_id, // ✅ CORRECT - use actual session_id
            question_id: submitDto.questionId,
            temporary_choice_id: submitDto.choiceId,
            temporary_choice_ids: submitDto.choiceIds,
            temporary_answer_text: choiceText, // ✅ Store choice text for single choice answers
            temporary_answer_json: submitDto.answerJson,
            time_spent_seconds: submitDto.timeSpentSeconds || null, // Store time spent on question
            last_updated: new Date().toISOString(),
          },
          {
            onConflict: 'session_id,question_id', // ✅ Use unique constraint columns for upsert
          },
        );

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
          time_spent_seconds: ans.time_spent_seconds, // Transfer time spent to final answers
        }));

        const { error: answersError } = await supabase
          .from('quiz_student_answers')
          .insert(finalAnswers);

        if (answersError) {
          this.logger.error('Error saving final answers:', answersError);
          throw new InternalServerErrorException(
            'Failed to save final answers',
          );
        }
      }

      // Auto-grade the quiz attempt
      this.logger.log(`Starting auto-grading for attempt ${attemptId}`);
      const gradingResult =
        await this.autoGradingService.gradeQuizAttempt(attemptId);
      this.logger.log(
        `Auto-grading complete: ${gradingResult.totalScore}/${gradingResult.maxScore} ` +
          `(${gradingResult.gradedCount} auto-graded, ${gradingResult.manualGradingRequired} manual)`,
      );

      // Calculate time taken
      const startedAt = new Date(attempt.started_at);
      const now = new Date();
      const timeTakenSeconds = Math.floor(
        (now.getTime() - startedAt.getTime()) / 1000,
      );

      // Determine final status based on grading
      const finalStatus =
        gradingResult.manualGradingRequired > 0 ? 'submitted' : 'graded';

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

      // Update quiz_student_summary (tracks multiple attempts, calculates average score)
      try {
        await this.updateStudentSummary(
          attemptId,
          studentId,
          attempt.quiz_id,
          gradingResult.totalScore,
        );
      } catch (error) {
        // Log but don't fail submission if summary update fails
        this.logger.error('Failed to update student summary:', error);
      }

      // Update quiz analytics (aggregate class statistics)
      try {
        await this.analyticsService.calculateQuizAnalytics(attempt.quiz_id);
      } catch (error) {
        // Log but don't fail submission if analytics update fails
        this.logger.error('Failed to update quiz analytics:', error);
      }

      // Update question statistics (per-question difficulty analysis)
      try {
        await this.analyticsService.calculateQuestionStats(attempt.quiz_id);
      } catch (error) {
        // Log but don't fail submission if question stats update fails
        this.logger.error('Failed to update question stats:', error);
      }

      this.logger.log(`Quiz attempt submitted: ${attemptId}`);

      // ✅ FIX: Calculate percentage
      const percentage = gradingResult.maxScore > 0
        ? Math.round((gradingResult.totalScore / gradingResult.maxScore) * 100)
        : 0;

      return {
        success: true,
        attemptId,
        submittedAt: now.toISOString(),
        timeTaken: timeTakenSeconds,
        score: gradingResult.totalScore,
        maxScore: gradingResult.maxScore,
        percentage, // ✅ ADD: Percentage score
        totalScore: gradingResult.totalScore, // ✅ ADD: Alias for frontend compatibility
        gradedCount: gradingResult.gradedCount, // ✅ FIX: Return as gradedCount (not autoGraded)
        status: finalStatus,
        autoGraded: gradingResult.gradedCount > 0 && gradingResult.manualGradingRequired === 0, // ✅ FIX: Boolean flag
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

  /**
   * Get detailed answer review for a completed quiz attempt
   * Returns questions with student answers and correct answers for comparison
   */
  async getAttemptReview(attemptId: string, studentId: string): Promise<any> {
    const supabase = this.supabaseService.getServiceClient();

    this.logger.log(
      `[REVIEW] 🔍 Fetching review data for attempt ${attemptId} by student ${studentId}`,
    );

    // ✅ STEP 1: Verify attempt exists (first check without student_id filter)
    const { data: attempt, error: attemptError } = await supabase
      .from('quiz_attempts')
      .select('attempt_id, quiz_id, status, score, max_possible_score, student_id')
      .eq('attempt_id', attemptId)
      .single();

    this.logger.log(`[REVIEW] 📊 Query result:`, {
      found: !!attempt,
      error: attemptError?.message,
      attemptStudentId: attempt?.student_id,
      requestingStudentId: studentId,
    });

    if (attemptError) {
      this.logger.error(`[REVIEW] ❌ Database error:`, attemptError);
      throw new NotFoundException('Quiz attempt not found');
    }

    if (!attempt) {
      this.logger.error(`[REVIEW] ❌ No attempt found with ID: ${attemptId}`);
      throw new NotFoundException('Quiz attempt not found');
    }

    // ✅ STEP 1.5: Verify the attempt belongs to the requesting student
    if (attempt.student_id !== studentId) {
      this.logger.warn(
        `[REVIEW] ⚠️ Student ID mismatch! Attempt belongs to ${attempt.student_id}, but requested by ${studentId}`,
      );
      throw new NotFoundException('Quiz attempt not found');
    }

    this.logger.log(`[REVIEW] ✅ Attempt verified for student ${studentId}`);

    // ✅ STEP 2: Only allow review for completed attempts
    if (attempt.status !== 'submitted' && attempt.status !== 'graded') {
      throw new BadRequestException(
        'Cannot review attempt that is still in progress',
      );
    }

    // ✅ STEP 3: Fetch all questions with choices and metadata
    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select(
        `
        question_id,
        question_text,
        question_type,
        points,
        order_index,
        quiz_choices (*),
        quiz_question_metadata (*)
      `,
      )
      .eq('quiz_id', attempt.quiz_id)
      .order('order_index', { ascending: true });

    if (questionsError) {
      this.logger.error('Error fetching questions:', questionsError);
      throw new InternalServerErrorException('Failed to fetch questions');
    }

    // ✅ STEP 4: Fetch all student answers for this attempt
    const { data: studentAnswers, error: answersError } = await supabase
      .from('quiz_student_answers')
      .select('question_id, choice_id, choice_ids, answer_text, answer_json, points_awarded, is_correct, grader_feedback')
      .eq('attempt_id', attemptId);

    if (answersError) {
      this.logger.error('Error fetching student answers:', answersError);
      throw new InternalServerErrorException('Failed to fetch student answers');
    }

    // ✅ STEP 5: Build answer map for quick lookup
    const answerMap = new Map(
      studentAnswers.map((a) => [a.question_id, a]),
    );

    // ✅ STEP 6: Build review data for each question
    const reviewData = questions.map((question) => {
      const studentAnswer = answerMap.get(question.question_id);
      const correctAnswer = this.extractCorrectAnswer(question);

      return {
        questionId: question.question_id,
        questionText: question.question_text,
        questionType: question.question_type,
        pointsPossible: question.points,
        pointsAwarded: studentAnswer?.points_awarded || 0,
        isCorrect: studentAnswer?.is_correct || false,
        studentAnswer: {
          choiceId: studentAnswer?.choice_id || null,
          choiceIds: studentAnswer?.choice_ids || null,
          answerText: studentAnswer?.answer_text || null,
          answerJson: studentAnswer?.answer_json || null,
        },
        correctAnswer: correctAnswer,
        feedback: studentAnswer?.grader_feedback || null,
        choices: question.quiz_choices || [],
      };
    });

    return {
      attemptId: attempt.attempt_id,
      quizId: attempt.quiz_id,
      status: attempt.status,
      score: attempt.score,
      maxScore: attempt.max_possible_score,
      percentage: attempt.max_possible_score > 0
        ? Math.round((attempt.score / attempt.max_possible_score) * 100)
        : 0,
      questions: reviewData,
    };
  }

  /**
   * Extract correct answer from question data based on question type
   */
  private extractCorrectAnswer(question: any): any {
    const questionType = question.question_type;

    switch (questionType) {
      case 'multiple_choice':
      case 'true_false':
        // Find the correct choice
        const correctChoice = question.quiz_choices?.find((c: any) => c.is_correct);
        return correctChoice?.choice_text || null;

      case 'multiple_select':
        // Find all correct choices
        const correctChoices = question.quiz_choices
          ?.filter((c: any) => c.is_correct)
          .map((c: any) => c.choice_text) || [];
        return correctChoices;

      case 'fill_in_blank':
        // Extract from metadata
        const fillMetadata = this.extractMetadata(question);
        return fillMetadata?.blank_positions?.map((bp: any) => bp.answer) || [];

      case 'matching':
      case 'matching-pair':
        // Extract from metadata
        const matchMetadata = this.extractMetadata(question);
        return matchMetadata?.matching_pairs || {};

      case 'ordering':
        // Extract from metadata
        const orderMetadata = this.extractMetadata(question);
        return orderMetadata?.items?.map((item: any, index: number) => ({
          ...item,
          correctOrder: index,
        })) || [];

      case 'short_answer':
      case 'essay':
        // These require manual grading, no "correct" answer to display
        return null;

      case 'drag_and_drop':
        // Extract from metadata
        const dragMetadata = this.extractMetadata(question);
        return dragMetadata?.drop_zones || [];

      default:
        return null;
    }
  }

  /**
   * Extract metadata from question (handles both array and object formats)
   */
  private extractMetadata(question: any): any {
    if (!question.quiz_question_metadata) {
      return null;
    }

    let metadataRecord: any = null;

    if (Array.isArray(question.quiz_question_metadata)) {
      metadataRecord = question.quiz_question_metadata[0];
    } else if (typeof question.quiz_question_metadata === 'object') {
      metadataRecord = question.quiz_question_metadata;
    }

    return metadataRecord?.metadata || null;
  }

  /**
   * Update quiz_student_summary table with aggregated attempt statistics
   * This tracks multiple attempts and calculates the official grade (average score)
   */
  private async updateStudentSummary(
    attemptId: string,
    studentId: string,
    quizId: string,
    currentScore: number,
  ): Promise<void> {
    const supabase = this.supabaseService.getServiceClient();

    this.logger.log(
      `Updating student summary for student ${studentId} on quiz ${quizId}`,
    );

    // Fetch ALL attempts for this student on this quiz (including current one)
    const { data: allAttempts, error: attemptsError } = await supabase
      .from('quiz_attempts')
      .select('score, status')
      .eq('student_id', studentId)
      .eq('quiz_id', quizId)
      .in('status', ['submitted', 'graded']);

    if (attemptsError) {
      this.logger.error('Error fetching student attempts:', attemptsError);
      throw new InternalServerErrorException(
        'Failed to fetch student attempts for summary',
      );
    }

    if (!allAttempts || allAttempts.length === 0) {
      this.logger.warn('No completed attempts found for student summary');
      return;
    }

    // Calculate aggregate statistics
    const scores = allAttempts.map((a) => a.score || 0);
    const attemptsCount = allAttempts.length;
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    const latestScore = currentScore;
    const averageScore =
      scores.reduce((sum, score) => sum + score, 0) / attemptsCount;

    this.logger.log(
      `Calculated stats: ${attemptsCount} attempts, avg=${averageScore.toFixed(2)}, ` +
        `high=${highestScore}, low=${lowestScore}, latest=${latestScore}`,
    );

    // Get quiz passing score to determine if student passed
    const { data: quiz } = await supabase
      .from('quizzes')
      .select('passing_score, total_points')
      .eq('quiz_id', quizId)
      .single();

    const passingScore = quiz?.passing_score || 0;
    const passed = averageScore >= passingScore;

    this.logger.log(
      `Passing score: ${passingScore}, Student ${passed ? 'PASSED' : 'DID NOT PASS'} (avg: ${averageScore.toFixed(2)})`,
    );

    // UPSERT into quiz_student_summary
    // Uses UNIQUE constraint on (student_id, quiz_id) to update existing record
    const { error: upsertError } = await supabase
      .from('quiz_student_summary')
      .upsert(
        {
          student_id: studentId,
          quiz_id: quizId,
          last_attempt_id: attemptId,
          attempts_count: attemptsCount,
          highest_score: highestScore,
          lowest_score: lowestScore,
          latest_score: latestScore,
          average_score: averageScore,
          status: 'completed',
          passed: passed,
          last_updated: new Date().toISOString(),
        },
        {
          onConflict: 'student_id,quiz_id',
        },
      );

    if (upsertError) {
      this.logger.error('Error upserting student summary:', upsertError);
      throw new InternalServerErrorException(
        'Failed to update student summary',
      );
    }

    this.logger.log(
      `✅ Student summary updated successfully for student ${studentId}`,
    );
  }

  /**
   * Detect device type from user agent string
   */
  private detectDeviceType(userAgent?: string): string {
    if (!userAgent) return 'unknown';

    const ua = userAgent.toLowerCase();

    // Mobile devices
    if (/mobile|android|iphone|ipod|blackberry|windows phone/i.test(ua)) {
      return 'mobile';
    }

    // Tablets
    if (/tablet|ipad/i.test(ua)) {
      return 'tablet';
    }

    // Desktop
    return 'desktop';
  }
}
