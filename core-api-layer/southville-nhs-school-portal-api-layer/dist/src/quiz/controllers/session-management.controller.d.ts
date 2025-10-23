import { SessionManagementService } from '../services/session-management.service';
import { SupabaseUser } from '../../auth/interfaces/supabase-user.interface';
import { FastifyRequest } from 'fastify';
export declare class SessionManagementController {
    private readonly sessionManagementService;
    private readonly logger;
    constructor(sessionManagementService: SessionManagementService);
    heartbeat(attemptId: string, deviceFingerprint: string, user: SupabaseUser, request: FastifyRequest): Promise<{
        success: boolean;
        message: string;
    }>;
    validateSession(attemptId: string, deviceFingerprint: string, user: SupabaseUser): Promise<{
        isValid: boolean;
        reason?: string;
        deviceChanged?: boolean;
        ipChanged?: boolean;
    }>;
    getSessionDetails(attemptId: string, user: SupabaseUser): Promise<any>;
    terminateSession(attemptId: string, reason?: string): Promise<{
        message: string;
    }>;
}
