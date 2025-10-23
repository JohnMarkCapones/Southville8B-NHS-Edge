import { SupabaseService } from '../../supabase/supabase.service';
export declare class PolicyEngineService {
    private readonly supabaseService;
    private readonly logger;
    private permissionCache;
    private readonly PERMISSION_TTL;
    constructor(supabaseService: SupabaseService);
    evaluatePermission(userId: string, domainId: string, permissionKey: string): Promise<boolean>;
    getUserDomainPermissions(userId: string, domainId: string): Promise<Array<{
        permissionKey: string;
        allowed: boolean;
    }>>;
    hasAnyDomainRole(userId: string, domainId: string): Promise<boolean>;
    clearUserPermissionCache(userId: string): void;
    clearAllPermissionCache(): void;
    getCacheStats(): {
        size: number;
        entries: Array<{
            key: string;
            age: number;
            result: boolean;
        }>;
    };
}
