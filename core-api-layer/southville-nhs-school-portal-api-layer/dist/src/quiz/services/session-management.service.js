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
var SessionManagementService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionManagementService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
let SessionManagementService = SessionManagementService_1 = class SessionManagementService {
    supabaseService;
    logger = new common_1.Logger(SessionManagementService_1.name);
    SESSION_TIMEOUT_MINUTES = 5;
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async hasActiveSession(quizId, studentId) {
        try {
            const supabase = this.supabaseService.getClient();
            const { data: session, error } = await supabase
                .from('quiz_active_sessions')
                .select('session_id, attempt_id')
                .eq('quiz_id', quizId)
                .eq('student_id', studentId)
                .eq('is_active', true)
                .gte('last_heartbeat', new Date(Date.now() - this.SESSION_TIMEOUT_MINUTES * 60 * 1000).toISOString())
                .single();
            if (error && error.code !== 'PGRST116') {
                this.logger.error('Error checking active session:', error);
                throw new common_1.InternalServerErrorException('Failed to check active session');
            }
            return {
                hasSession: !!session,
                sessionId: session?.session_id,
                attemptId: session?.attempt_id,
            };
        }
        catch (error) {
            if (error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            this.logger.error('Error checking active session:', error);
            throw new common_1.InternalServerErrorException('Failed to check active session');
        }
    }
    async heartbeat(attemptId, studentId, heartbeatData) {
        try {
            const supabase = this.supabaseService.getServiceClient();
            const { data: attempt, error: attemptError } = await supabase
                .from('quiz_attempts')
                .select('student_id, status')
                .eq('attempt_id', attemptId)
                .single();
            if (attemptError || !attempt) {
                throw new common_1.NotFoundException('Quiz attempt not found');
            }
            if (attempt.student_id !== studentId) {
                throw new common_1.ForbiddenException('You do not own this quiz attempt');
            }
            if (attempt.status !== 'in_progress') {
                throw new common_1.BadRequestException('Quiz attempt is not in progress');
            }
            const { error: updateError } = await supabase
                .from('quiz_active_sessions')
                .update({
                last_heartbeat: new Date().toISOString(),
                current_device_fingerprint: heartbeatData.deviceFingerprint,
                current_ip_address: heartbeatData.ipAddress,
                current_user_agent: heartbeatData.userAgent,
            })
                .eq('attempt_id', attemptId)
                .eq('student_id', studentId);
            if (updateError) {
                this.logger.error('Error updating heartbeat:', updateError);
                throw new common_1.InternalServerErrorException('Failed to update heartbeat');
            }
            return {
                success: true,
                message: 'Heartbeat recorded',
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.ForbiddenException ||
                error instanceof common_1.BadRequestException ||
                error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            this.logger.error('Error recording heartbeat:', error);
            throw new common_1.InternalServerErrorException('Failed to record heartbeat');
        }
    }
    async validateSession(attemptId, studentId, currentDeviceFingerprint) {
        try {
            const supabase = this.supabaseService.getClient();
            const { data: session, error } = await supabase
                .from('quiz_active_sessions')
                .select('*')
                .eq('attempt_id', attemptId)
                .eq('student_id', studentId)
                .single();
            if (error || !session) {
                return {
                    isValid: false,
                    reason: 'Session not found',
                };
            }
            if (!session.is_active) {
                return {
                    isValid: false,
                    reason: 'Session has been terminated',
                };
            }
            const lastHeartbeat = new Date(session.last_heartbeat);
            const timeoutThreshold = new Date(Date.now() - this.SESSION_TIMEOUT_MINUTES * 60 * 1000);
            if (lastHeartbeat < timeoutThreshold) {
                return {
                    isValid: false,
                    reason: 'Session expired due to inactivity',
                };
            }
            const deviceChanged = session.initial_device_fingerprint !== currentDeviceFingerprint;
            const ipChanged = session.initial_ip_address !== session.current_ip_address;
            if (deviceChanged) {
                await this.logSuspiciousActivity(attemptId, studentId, 'device_change', {
                    initial: session.initial_device_fingerprint,
                    current: currentDeviceFingerprint,
                });
                return {
                    isValid: false,
                    reason: 'Device fingerprint changed',
                    deviceChanged: true,
                };
            }
            if (ipChanged) {
                await this.logSuspiciousActivity(attemptId, studentId, 'ip_change', {
                    initial: session.initial_ip_address,
                    current: session.current_ip_address,
                });
            }
            return {
                isValid: true,
                deviceChanged: false,
                ipChanged,
            };
        }
        catch (error) {
            this.logger.error('Error validating session:', error);
            return {
                isValid: false,
                reason: 'Session validation failed',
            };
        }
    }
    async terminateSession(attemptId, reason = 'user_logout') {
        try {
            const supabase = this.supabaseService.getServiceClient();
            const { error } = await supabase
                .from('quiz_active_sessions')
                .update({
                is_active: false,
                terminated_reason: reason,
            })
                .eq('attempt_id', attemptId);
            if (error) {
                this.logger.error('Error terminating session:', error);
                throw new common_1.InternalServerErrorException('Failed to terminate session');
            }
            this.logger.log(`Session terminated for attempt ${attemptId}: ${reason}`);
        }
        catch (error) {
            if (error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            this.logger.error('Error terminating session:', error);
            throw new common_1.InternalServerErrorException('Failed to terminate session');
        }
    }
    async checkDuplicateSessions(quizId, studentId, currentAttemptId) {
        try {
            const supabase = this.supabaseService.getServiceClient();
            const { data: otherSessions, error } = await supabase
                .from('quiz_active_sessions')
                .select('session_id, attempt_id, is_active')
                .eq('quiz_id', quizId)
                .eq('student_id', studentId)
                .neq('attempt_id', currentAttemptId);
            if (error) {
                this.logger.error('Error checking duplicate sessions:', error);
                return;
            }
            if (otherSessions && otherSessions.length > 0) {
                this.logger.warn(`Found ${otherSessions.length} existing sessions for student ${studentId} on quiz ${quizId} - deleting to allow new attempt`);
                for (const session of otherSessions) {
                    const { error: deleteError } = await supabase
                        .from('quiz_active_sessions')
                        .delete()
                        .eq('session_id', session.session_id);
                    if (deleteError) {
                        this.logger.error(`Error deleting old session ${session.session_id}:`, deleteError);
                    }
                    else {
                        this.logger.log(`Deleted old session ${session.session_id} for attempt ${session.attempt_id}`);
                    }
                    await supabase
                        .from('quiz_attempts')
                        .update({
                        status: 'terminated',
                    })
                        .eq('attempt_id', session.attempt_id);
                }
            }
        }
        catch (error) {
            this.logger.error('Error checking duplicate sessions:', error);
        }
    }
    async logSuspiciousActivity(attemptId, studentId, flagType, metadata) {
        try {
            const supabase = this.supabaseService.getServiceClient();
            await supabase.from('quiz_flags').insert({
                attempt_id: attemptId,
                student_id: studentId,
                flag_type: flagType,
                severity: 'medium',
                metadata,
            });
            this.logger.warn(`Suspicious activity logged: ${flagType} for attempt ${attemptId}`);
        }
        catch (error) {
            this.logger.error('Error logging suspicious activity:', error);
        }
    }
    async getSessionDetails(attemptId, studentId) {
        try {
            const supabase = this.supabaseService.getClient();
            const { data: session, error } = await supabase
                .from('quiz_active_sessions')
                .select('*')
                .eq('attempt_id', attemptId)
                .eq('student_id', studentId)
                .single();
            if (error || !session) {
                throw new common_1.NotFoundException('Session not found');
            }
            return {
                sessionId: session.session_id,
                attemptId: session.attempt_id,
                quizId: session.quiz_id,
                isActive: session.is_active,
                lastHeartbeat: session.last_heartbeat,
                deviceChanged: session.initial_device_fingerprint !== session.current_device_fingerprint,
                ipChanged: session.initial_ip_address !== session.current_ip_address,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error('Error getting session details:', error);
            throw new common_1.InternalServerErrorException('Failed to get session details');
        }
    }
};
exports.SessionManagementService = SessionManagementService;
exports.SessionManagementService = SessionManagementService = SessionManagementService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], SessionManagementService);
//# sourceMappingURL=session-management.service.js.map