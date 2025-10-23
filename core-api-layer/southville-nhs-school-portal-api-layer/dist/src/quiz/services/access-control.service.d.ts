import { SupabaseService } from '../../supabase/supabase.service';
export interface GenerateAccessLinkDto {
    quizId: string;
    teacherId: string;
    expiresAt?: string;
    accessCode?: string;
    maxUses?: number;
    requiresAuth?: boolean;
}
export interface ValidateAccessDto {
    token: string;
    accessCode?: string;
    studentId?: string;
}
export declare class AccessControlService {
    private readonly supabaseService;
    private readonly logger;
    private readonly TOKEN_LENGTH;
    constructor(supabaseService: SupabaseService);
    generateAccessLink(dto: GenerateAccessLinkDto): Promise<{
        token: string;
        accessLink: string;
        qrCodeData: string;
        expiresAt?: string;
    }>;
    validateAccess(dto: ValidateAccessDto): Promise<{
        isValid: boolean;
        quizId?: string;
        requiresAuth?: boolean;
        reason?: string;
    }>;
    recordAccessUsage(token: string, studentId: string, metadata?: any): Promise<void>;
    revokeAccessLink(token: string, teacherId: string): Promise<void>;
    getQuizAccessLinks(quizId: string, teacherId: string): Promise<any[]>;
    private generateSecureToken;
    generateQRCode(accessLink: string): Promise<string>;
}
