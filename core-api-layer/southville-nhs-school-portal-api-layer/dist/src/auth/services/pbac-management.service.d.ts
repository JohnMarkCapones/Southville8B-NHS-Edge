import { SupabaseService } from '../../supabase/supabase.service';
export declare class PbacManagementService {
    private readonly supabaseService;
    private readonly logger;
    constructor(supabaseService: SupabaseService);
    createDomain(type: string, name: string, createdBy: string): Promise<number>;
    createDomainRole(domainId: number, name: string, createdBy: string): Promise<number>;
    createPermission(key: string, description?: string): Promise<number>;
    assignPermissionToRole(domainRoleId: number, permissionId: number, allowed?: boolean): Promise<number>;
    assignRoleToUser(userId: string, domainRoleId: number): Promise<number>;
    getAllDomains(): Promise<Array<{
        id: number;
        type: string;
        name: string;
    }>>;
    getAllPermissions(): Promise<Array<{
        id: string;
        key: string;
        description: string | null;
    }>>;
    removeRoleFromUser(userId: string, domainRoleId: number): Promise<boolean>;
}
