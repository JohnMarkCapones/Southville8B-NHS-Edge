import { SupabaseService } from '../../supabase/supabase.service';
export interface SessionHeartbeatDto {
    deviceFingerprint: string;
    userAgent?: string;
    ipAddress?: string;
}
export declare class SessionManagementService {
    private readonly supabaseService;
    private readonly logger;
    private readonly SESSION_TIMEOUT_MINUTES;
    constructor(supabaseService: SupabaseService);
    hasActiveSession(quizId: string, studentId: string): Promise<{
        hasSession: boolean;
        sessionId?: string;
        attemptId?: string;
    }>;
    heartbeat(attemptId: string, studentId: string, heartbeatData: SessionHeartbeatDto): Promise<{
        success: boolean;
        message: string;
    }>;
    validateSession(attemptId: string, studentId: string, currentDeviceFingerprint: string): Promise<{
        isValid: boolean;
        reason?: string;
        deviceChanged?: boolean;
        ipChanged?: boolean;
    }>;
    terminateSession(attemptId: string, reason?: string): Promise<void>;
    checkDuplicateSessions(quizId: string, studentId: string, currentAttemptId: string): Promise<void>;
    private logSuspiciousActivity;
    getSessionDetails(attemptId: string, studentId: string): Promise<any>;
}
