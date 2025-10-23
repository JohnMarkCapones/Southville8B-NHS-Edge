import { ConfigService } from '@nestjs/config';
import { SupabaseUser, SupabaseJWTPayload } from './interfaces/supabase-user.interface';
import { JwtVerificationService } from './jwt-verification.service';
export declare class AuthService {
    private configService;
    private jwtVerificationService;
    private readonly logger;
    private supabase;
    private authClient;
    constructor(configService: ConfigService, jwtVerificationService: JwtVerificationService);
    private validateConfig;
    private getServiceClient;
    private getAuthClient;
    signIn(email: string, password: string): Promise<{
        user: SupabaseUser;
        session: any;
    }>;
    private ensureUserExistsInPublicTable;
    verifyToken(token: string): Promise<SupabaseUser>;
    extractUserFromToken(token: string): Promise<SupabaseJWTPayload>;
    getUserRoleFromSupabase(userId: string): Promise<string | null>;
    getUserRole(userId: string): Promise<string | undefined>;
    hasRole(userId: string, requiredRole: string): Promise<boolean>;
    private readonly ROLE_HIERARCHY;
    hasRoleHierarchy(userRole: string, requiredRole: string): boolean;
    getUserRoleFromDatabase(userId: string): Promise<string | null>;
}
