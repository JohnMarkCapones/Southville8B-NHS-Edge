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
var GradingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GradingService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
let GradingService = GradingService_1 = class GradingService {
    supabaseService;
    logger = new common_1.Logger(GradingService_1.name);
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async getUngradedAnswers(quizId, teacherId) {
        try {
            const supabase = this.supabaseService.getClient();
            const { data: quiz, error: quizError } = await supabase
                .from('quizzes')
                .select('teacher_id')
                .eq('quiz_id', quizId)
                .single();
            if (quizError || !quiz) {
                throw new common_1.NotFoundException('Quiz not found');
            }
            if (quiz.teacher_id !== teacherId) {
                throw new common_1.ForbiddenException('You can only grade your own quizzes');
            }
            const { data: essayQuestions } = await supabase
                .from('quiz_questions')
                .select('question_id')
                .eq('quiz_id', quizId)
                .in('question_type', ['essay', 'short_answer']);
            if (!essayQuestions || essayQuestions.length === 0) {
                return [];
            }
            const questionIds = essayQuestions.map((q) => q.question_id);
            const { data: answers, error } = await supabase
                .from('quiz_student_answers')
                .select(`
          *,
          quiz_attempts!inner(quiz_id, student_id, attempt_number),
          quiz_questions!inner(question_text, points)
        `)
                .in('question_id', questionIds)
                .is('is_correct', null)
                .eq('quiz_attempts.quiz_id', quizId)
                .order('answered_at', { ascending: true });
            if (error) {
                this.logger.error('Error fetching ungraded answers:', error);
                throw new common_1.InternalServerErrorException('Failed to fetch ungraded answers');
            }
            return answers || [];
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.ForbiddenException ||
                error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            this.logger.error('Error fetching ungraded answers:', error);
            throw new common_1.InternalServerErrorException('Failed to fetch ungraded answers');
        }
    }
    async gradeAnswer(answerId, teacherId, gradeDto) {
        try {
            const supabase = this.supabaseService.getServiceClient();
            const { data: answer, error: answerError } = await supabase
                .from('quiz_student_answers')
                .select(`
          *,
          quiz_attempts!inner(quiz_id),
          quiz_questions!inner(points)
        `)
                .eq('answer_id', answerId)
                .single();
            if (answerError || !answer) {
                throw new common_1.NotFoundException('Answer not found');
            }
            const { data: quiz, error: quizError } = await supabase
                .from('quizzes')
                .select('teacher_id')
                .eq('quiz_id', answer.quiz_attempts.quiz_id)
                .single();
            if (quizError || !quiz || quiz.teacher_id !== teacherId) {
                throw new common_1.ForbiddenException('You can only grade your own quizzes');
            }
            const maxPoints = answer.quiz_questions.points;
            if (gradeDto.pointsAwarded > maxPoints) {
                throw new common_1.ForbiddenException(`Points awarded (${gradeDto.pointsAwarded}) cannot exceed maximum points (${maxPoints})`);
            }
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
                throw new common_1.InternalServerErrorException('Failed to grade answer');
            }
            await this.recalculateAttemptScore(answer.attempt_id);
            this.logger.log(`Answer graded: ${answerId}`);
            return gradedAnswer;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.ForbiddenException ||
                error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            this.logger.error('Error grading answer:', error);
            throw new common_1.InternalServerErrorException('Failed to grade answer');
        }
    }
    async recalculateAttemptScore(attemptId) {
        try {
            const supabase = this.supabaseService.getServiceClient();
            const { data: answers } = await supabase
                .from('quiz_student_answers')
                .select('points_awarded, is_correct')
                .eq('attempt_id', attemptId);
            if (!answers)
                return;
            const allGraded = answers.every((a) => a.is_correct !== null);
            if (!allGraded) {
                return;
            }
            const totalScore = answers.reduce((sum, answer) => sum + (answer.points_awarded || 0), 0);
            const { error } = await supabase
                .from('quiz_attempts')
                .update({
                score: totalScore,
                status: 'graded',
            })
                .eq('attempt_id', attemptId);
            if (error) {
                this.logger.error('Error updating attempt score:', error);
            }
            else {
                this.logger.log(`Attempt score updated: ${attemptId} - ${totalScore}`);
            }
        }
        catch (error) {
            this.logger.error('Error recalculating attempt score:', error);
        }
    }
};
exports.GradingService = GradingService;
exports.GradingService = GradingService = GradingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], GradingService);
//# sourceMappingURL=grading.service.js.map