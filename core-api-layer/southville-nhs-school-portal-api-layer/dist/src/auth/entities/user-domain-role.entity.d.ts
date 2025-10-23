import { DomainRole } from './domain-role.entity';
export declare class UserDomainRole {
    id: string;
    user_id: string;
    domain_role_id: string;
    created_at: Date;
    updated_at: Date;
    domain_role: DomainRole;
}
