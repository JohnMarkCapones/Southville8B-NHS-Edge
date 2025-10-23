import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
export declare class SupabaseService {
    private configService;
    private supabase;
    private serviceClient;
    constructor(configService: ConfigService);
    private validateConfig;
    getClient(): SupabaseClient;
    getClientWithAuth(accessToken: string): SupabaseClient;
    getServiceClient(): SupabaseClient;
}
