import { ConfigService } from '@nestjs/config';
import { SupabaseUser } from '../auth/interfaces/supabase-user.interface';
export declare class JwtVerificationService {
    private configService;
    constructor(configService: ConfigService);
    verifyTokenLocally(token: string): Promise<SupabaseUser>;
    extractPayload(token: string): any;
}
