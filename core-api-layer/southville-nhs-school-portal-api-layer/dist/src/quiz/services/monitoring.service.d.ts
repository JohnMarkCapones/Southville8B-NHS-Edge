import { SupabaseService } from '../../supabase/supabase.service';
export declare class MonitoringService {
    private readonly supabaseService;
    private readonly logger;
    constructor(supabaseService: SupabaseService);
    getActiveParticipants(quizId: string, teacherId: string): Promise<any>;
    getQuizFlags(quizId: string, teacherId: string): Promise<any>;
    terminateAttempt(attemptId: string, teacherId: string, reason?: string): Promise<void>;
    createFlag(sessionId: string, quizId: string, studentId: string, flagType: string, message: string, severity?: 'info' | 'warning' | 'critical', metadata?: any): Promise<void>;
}
