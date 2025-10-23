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
var MonitoringService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
let MonitoringService = MonitoringService_1 = class MonitoringService {
    supabaseService;
    logger = new common_1.Logger(MonitoringService_1.name);
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async getActiveParticipants(quizId, teacherId) {
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
                throw new common_1.NotFoundException('Quiz not found');
            }
            const { data: participants, error } = await supabase
                .from('quiz_participants')
                .select('*')
                .eq('quiz_id', quizId)
                .in('status', ['active', 'not_started', 'flagged'])
                .order('updated_at', { ascending: false });
            if (error) {
                this.logger.error('Error fetching participants:', error);
                throw new common_1.InternalServerErrorException('Failed to fetch participants');
            }
            return participants || [];
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            this.logger.error('Error fetching active participants:', error);
            throw new common_1.InternalServerErrorException('Failed to fetch participants');
        }
    }
    async getQuizFlags(quizId, teacherId) {
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
                throw new common_1.NotFoundException('Quiz not found');
            }
            const { data: flags, error } = await supabase
                .from('quiz_flags')
                .select('*')
                .eq('quiz_id', quizId)
                .order('timestamp', { ascending: false });
            if (error) {
                this.logger.error('Error fetching flags:', error);
                throw new common_1.InternalServerErrorException('Failed to fetch flags');
            }
            return flags || [];
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            this.logger.error('Error fetching quiz flags:', error);
            throw new common_1.InternalServerErrorException('Failed to fetch flags');
        }
    }
    async terminateAttempt(attemptId, teacherId, reason) {
        try {
            const supabase = this.supabaseService.getServiceClient();
            const { data: attempt, error: attemptError } = await supabase
                .from('quiz_attempts')
                .select('quiz_id')
                .eq('attempt_id', attemptId)
                .single();
            if (attemptError || !attempt) {
                throw new common_1.NotFoundException('Quiz attempt not found');
            }
            const { data: quiz, error: quizError } = await supabase
                .from('quizzes')
                .select('teacher_id')
                .eq('quiz_id', attempt.quiz_id)
                .single();
            if (quizError || !quiz || quiz.teacher_id !== teacherId) {
                throw new common_1.NotFoundException('Quiz not found');
            }
            const { error: updateError } = await supabase
                .from('quiz_attempts')
                .update({
                status: 'terminated',
                terminated_by_teacher: true,
                termination_reason: reason || 'Terminated by teacher',
                submitted_at: new Date().toISOString(),
            })
                .eq('attempt_id', attemptId);
            if (updateError) {
                this.logger.error('Error terminating attempt:', updateError);
                throw new common_1.InternalServerErrorException('Failed to terminate attempt');
            }
            await supabase
                .from('quiz_active_sessions')
                .update({ is_active: false })
                .eq('attempt_id', attemptId);
            this.logger.log(`Quiz attempt terminated by teacher: ${attemptId}`);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            this.logger.error('Error terminating quiz attempt:', error);
            throw new common_1.InternalServerErrorException('Failed to terminate attempt');
        }
    }
    async createFlag(sessionId, quizId, studentId, flagType, message, severity = 'info', metadata) {
        try {
            const supabase = this.supabaseService.getServiceClient();
            const { data: participant } = await supabase
                .from('quiz_participants')
                .select('id')
                .eq('session_id', sessionId)
                .single();
            const { error } = await supabase.from('quiz_flags').insert({
                participant_id: participant?.id,
                session_id: sessionId,
                quiz_id: quizId,
                student_id: studentId,
                flag_type: flagType,
                message,
                severity,
                metadata,
            });
            if (error) {
                this.logger.error('Error creating flag:', error);
            }
            if (participant) {
                await supabase
                    .from('quiz_participants')
                    .update({
                    flag_count: supabase.rpc('increment', { participant_id: participant.id }),
                    status: severity === 'critical' ? 'flagged' : undefined,
                })
                    .eq('id', participant.id);
            }
            this.logger.log(`Flag created: ${flagType} for student ${studentId}`);
        }
        catch (error) {
            this.logger.error('Error creating flag:', error);
        }
    }
};
exports.MonitoringService = MonitoringService;
exports.MonitoringService = MonitoringService = MonitoringService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], MonitoringService);
//# sourceMappingURL=monitoring.service.js.map