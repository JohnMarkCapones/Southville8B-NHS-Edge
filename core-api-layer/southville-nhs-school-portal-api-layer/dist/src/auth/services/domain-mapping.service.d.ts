import { SupabaseService } from '../../supabase/supabase.service';
export interface DomainMapping {
    entityType: string;
    tableName: string;
    domainIdColumn: string;
}
export declare class DomainMappingService {
    private readonly supabaseService;
    private readonly logger;
    private readonly domainMappings;
    constructor(supabaseService: SupabaseService);
    registerMapping(entityType: string, mapping: DomainMapping): void;
    resolveDomainId(paramName: string, entityId: string): Promise<string | null>;
    private extractEntityTypeFromParam;
    getAllMappings(): Map<string, DomainMapping>;
    hasMapping(entityType: string): boolean;
}
