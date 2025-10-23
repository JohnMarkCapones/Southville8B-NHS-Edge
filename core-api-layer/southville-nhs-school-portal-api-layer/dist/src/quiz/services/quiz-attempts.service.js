"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var QuizAttemptsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizAttemptsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
const auto_grading_service_1 = require("./auto-grading.service");
const session_management_service_1 = require("./session-management.service");
let QuizAttemptsService = QuizAttemptsService_1 = class QuizAttemptsService {
    supabaseService;
    autoGradingService;
    sessionManagementService;
    logger = new common_1.Logger(QuizAttemptsService_1.name);
    constructor(supabaseService, autoGradingService, sessionManagementService) {
        this.supabaseService = supabaseService;
        this.autoGradingService = autoGradingService;
        this.sessionManagementService = sessionManagementService;
    }
    async startAttempt(quizId, studentId, startDto, ipAddress) {
        try {
            const supabase = this.supabaseService.getServiceClient();
            const { data: quiz, error: quizError } = await supabase
                .from('quizzes')
                .select('*')
                .eq('quiz_id', quizId)
                .single();
            if (quizError || !quiz) {
                throw new common_1.NotFoundException('Quiz not found');
            }
            if (quiz.status !== 'published') {
                throw new common_1.BadRequestException('Quiz is not published yet');
            }
            if (quiz.end_date && new Date(quiz.end_date) < new Date()) {
                throw new common_1.BadRequestException('Quiz has ended');
            }
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
            if (!quiz.allow_retakes && existingAttempts && existingAttempts.length > 0) {
                throw new common_1.ForbiddenException('Retakes are not allowed for this quiz');
            }
            let questionsToShow = [];
            const { data: allQuestions } = await supabase
                .from('quiz_questions')
                .select('question_id')
                .eq('quiz_id', quizId)
                .order('order_index', { ascending: true });
            if (quiz.question_pool_size && quiz.questions_to_display && allQuestions) {
                const shuffled = allQuestions
                    .sort(() => 0.5 - Math.random())
                    .slice(0, quiz.questions_to_display);
                questionsToShow = shuffled.map((q) => q.question_id);
            }
            else if (allQuestions) {
                questionsToShow = allQuestions.map((q) => q.question_id);
            }
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
                throw new common_1.InternalServerErrorException('Failed to start quiz attempt');
            }
            this.logger.log(`Checking for duplicate sessions for student ${studentId} on quiz ${quizId}`);
            await this.sessionManagementService.checkDuplicateSessions(quizId, studentId, attempt.attempt_id);
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
                throw new common_1.InternalServerErrorException('Failed to create quiz session');
            }
            else {
                this.logger.log(`✅ Active session created: ${sessionData.session_id} for attempt ${attempt.attempt_id}`);
            }
            this.logger.log(`Quiz attempt started: ${attempt.attempt_id} (attempt #${attemptNumber})`);
            return {
                attemptId: attempt.attempt_id,
                attemptNumber,
                questionsShown: questionsToShow,
                timeLimit: quiz.time_limit,
                startedAt: attempt.started_at,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException ||
                error instanceof common_1.ForbiddenException) {
                throw error;
            }
            this.logger.error('Error starting quiz attempt:', error);
            throw new common_1.InternalServerErrorException('Failed to start quiz attempt');
        }
    }
    async submitAnswer(attemptId, studentId, submitDto) {
        try {
            const supabase = this.supabaseService.getServiceClient();
            const { data: attempt, error: attemptError } = await supabase
                .from('quiz_attempts')
                .select('*')
                .eq('attempt_id', attemptId)
                .eq('student_id', studentId)
                .single();
            if (attemptError || !attempt) {
                throw new common_1.NotFoundException('Quiz attempt not found');
            }
            if (attempt.status !== 'in_progress') {
                throw new common_1.BadRequestException('Quiz attempt is not in progress');
            }
            const { data: session, error: sessionFetchError } = await supabase
                .from('quiz_active_sessions')
                .select('session_id')
                .eq('attempt_id', attemptId)
                .eq('is_active', true)
                .single();
            if (sessionFetchError || !session) {
                this.logger.error('Active session not found:', sessionFetchError);
                throw new common_1.NotFoundException('Active quiz session not found');
            }
            const { error: sessionError } = await supabase
                .from('quiz_session_answers')
                .upsert({
                session_id: session.session_id,
                question_id: submitDto.questionId,
                temporary_choice_id: submitDto.choiceId,
                temporary_choice_ids: submitDto.choiceIds,
                temporary_answer_text: submitDto.answerText,
                temporary_answer_json: submitDto.answerJson,
                last_updated: new Date().toISOString(),
            });
            if (sessionError) {
                this.logger.error('Error saving answer:', sessionError);
                throw new common_1.InternalServerErrorException('Failed to save answer');
            }
            this.logger.log(`Answer saved for question ${submitDto.questionId}`);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException ||
                error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            this.logger.error('Error submitting answer:', error);
            throw new common_1.InternalServerErrorException('Failed to submit answer');
        }
    }
    async submitAttempt(attemptId, studentId) {
        try {
            const supabase = this.supabaseService.getServiceClient();
            const { data: attempt, error: attemptError } = await supabase
                .from('quiz_attempts')
                .select('*')
                .eq('attempt_id', attemptId)
                .eq('student_id', studentId)
                .single();
            if (attemptError || !attempt) {
                throw new common_1.NotFoundException('Quiz attempt not found');
            }
            if (attempt.status !== 'in_progress') {
                throw new common_1.BadRequestException('Quiz attempt is already submitted');
            }
            const { data: session } = await supabase
                .from('quiz_active_sessions')
                .select('session_id')
                .eq('attempt_id', attemptId)
                .single();
            const { data: sessionAnswers } = await supabase
                .from('quiz_session_answers')
                .select('*')
                .eq('session_id', session?.session_id || attemptId);
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
                    throw new common_1.InternalServerErrorException('Failed to save final answers');
                }
            }
            this.logger.log(`Starting auto-grading for attempt ${attemptId}`);
            const gradingResult = await this.autoGradingService.gradeQuizAttempt(attemptId);
            this.logger.log(`Auto-grading complete: ${gradingResult.totalScore}/${gradingResult.maxScore} ` +
                `(${gradingResult.gradedCount} auto-graded, ${gradingResult.manualGradingRequired} manual)`);
            const startedAt = new Date(attempt.started_at);
            const now = new Date();
            const timeTakenSeconds = Math.floor((now.getTime() - startedAt.getTime()) / 1000);
            const finalStatus = gradingResult.manualGradingRequired > 0 ? 'submitted' : 'graded';
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
                throw new common_1.InternalServerErrorException('Failed to submit quiz');
            }
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
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException ||
                error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            this.logger.error('Error submitting quiz attempt:', error);
            throw new common_1.InternalServerErrorException('Failed to submit quiz');
        }
    }
    async getAttempt(attemptId, studentId) {
        const supabase = this.supabaseService.getClient();
        const { data: attempt, error } = await supabase
            .from('quiz_attempts')
            .select('*')
            .eq('attempt_id', attemptId)
            .eq('student_id', studentId)
            .single();
        if (error) {
            if (error.code === 'PGRST116') {
                throw new common_1.NotFoundException('Quiz attempt not found');
            }
            this.logger.error('Error fetching attempt:', error);
            throw new common_1.InternalServerErrorException('Failed to fetch attempt');
        }
        return attempt;
    }
};
exports.QuizAttemptsService = QuizAttemptsService;
exports.QuizAttemptsService = QuizAttemptsService = QuizAttemptsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService,
        auto_grading_service_1.AutoGradingService,
        session_management_service_1.SessionManagementService])
], QuizAttemptsService);
//# sourceMappingURL=quiz-attempts.service.js.map