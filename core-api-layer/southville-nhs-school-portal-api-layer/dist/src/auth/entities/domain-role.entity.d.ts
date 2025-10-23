import { Domain } from './domain.entity';
export declare class DomainRole {
    id: string;
    domain_id: string;
    name: string;
    created_by: string;
    created_at: Date;
    updated_at: Date;
    domain: Domain;
}
