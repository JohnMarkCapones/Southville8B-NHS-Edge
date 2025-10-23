import { DomainRole } from './domain-role.entity';
import { Permission } from './permission.entity';
export declare class DomainRolePermission {
    id: string;
    domain_role_id: string;
    permission_id: string;
    allowed: boolean;
    created_at: Date;
    updated_at: Date;
    domain_role: DomainRole;
    permission: Permission;
}
