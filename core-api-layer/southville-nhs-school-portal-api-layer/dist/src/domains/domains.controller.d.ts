import { DomainsService } from './domains.service';
import { CreateDomainDto, CreateClubDomainDto } from './dto/create-domain.dto';
export declare class DomainsController {
    private readonly domainsService;
    constructor(domainsService: DomainsService);
    create(createDomainDto: CreateDomainDto, req: any): Promise<any>;
    createClubDomain(createClubDomainDto: CreateClubDomainDto, req: any): Promise<any>;
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
}
