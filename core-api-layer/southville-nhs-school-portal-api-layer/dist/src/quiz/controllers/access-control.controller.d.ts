import { AccessControlService } from '../services/access-control.service';
import { GenerateAccessLinkDto, ValidateAccessLinkDto } from '../dto/generate-access-link.dto';
import { SupabaseUser } from '../../auth/interfaces/supabase-user.interface';
export declare class AccessControlController {
    private readonly accessControlService;
    private readonly logger;
    constructor(accessControlService: AccessControlService);
    generateAccessLink(quizId: string, generateDto: GenerateAccessLinkDto, user: SupabaseUser): Promise<{
        token: string;
        accessLink: string;
        qrCodeData: string;
        expiresAt?: string;
    }>;
    validateAccess(validateDto: ValidateAccessLinkDto, user?: SupabaseUser): Promise<{
        isValid: boolean;
        quizId?: string;
        requiresAuth?: boolean;
        reason?: string;
    }>;
    getQuizAccessLinks(quizId: string, user: SupabaseUser): Promise<any[]>;
    revokeAccessLink(token: string, user: SupabaseUser): Promise<{
        message: string;
    }>;
    getQRCode(token: string): Promise<{
        qrCodeData: string;
        accessLink: string;
    }>;
}
