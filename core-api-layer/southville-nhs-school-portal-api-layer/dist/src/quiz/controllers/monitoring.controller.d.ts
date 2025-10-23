import { MonitoringService } from '../services/monitoring.service';
import { SupabaseUser } from '../../auth/interfaces/supabase-user.interface';
export declare class MonitoringController {
    private readonly monitoringService;
    private readonly logger;
    constructor(monitoringService: MonitoringService);
    getActiveParticipants(quizId: string, user: SupabaseUser): Promise<any>;
    getQuizFlags(quizId: string, user: SupabaseUser): Promise<any>;
    terminateAttempt(attemptId: string, reason: string, user: SupabaseUser): Promise<{
        message: string;
    }>;
}
