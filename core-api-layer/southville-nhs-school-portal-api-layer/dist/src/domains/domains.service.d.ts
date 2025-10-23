import { SupabaseService } from '../supabase/supabase.service';
import { CreateDomainDto, CreateClubDomainDto } from './dto/create-domain.dto';
export declare class DomainsService {
    private readonly supabaseService;
    private readonly logger;
    constructor(supabaseService: SupabaseService);
    create(createDomainDto: CreateDomainDto, createdBy: string): Promise<any>;
    createClubDomain(createClubDomainDto: CreateClubDomainDto, createdBy: string): Promise<any>;
    private createDefaultDomainRoles;
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
}
