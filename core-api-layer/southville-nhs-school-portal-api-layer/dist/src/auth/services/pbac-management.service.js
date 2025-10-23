"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PbacManagementService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PbacManagementService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
let PbacManagementService = PbacManagementService_1 = class PbacManagementService {
    supabaseService;
    logger = new common_1.Logger(PbacManagementService_1.name);
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async createDomain(type, name, createdBy) {
        try {
            const supabase = this.supabaseService.getServiceClient();
            const { data, error } = await supabase
                .from('domains')
                .insert({
                type,
                name,
                created_by: createdBy,
            })
                .select('id')
                .single();
            if (error) {
                this.logger.error(`Error creating domain: ${type}:${name}`, error);
                throw new Error(`Failed to create domain: ${error.message}`);
            }
            this.logger.log(`Created domain ${data.id} for ${type}:${name}`);
            return data.id;
        }
        catch (error) {
            this.logger.error(`Unexpected error creating domain: ${type}:${name}`, error);
            throw error;
        }
    }
    async createDomainRole(domainId, name, createdBy) {
        try {
            const supabase = this.supabaseService.getServiceClient();
            const { data, error } = await supabase
                .from('domain_roles')
                .insert({
                domain_id: domainId,
                name,
                created_by: createdBy,
            })
                .select('id')
                .single();
            if (error) {
                this.logger.error(`Error creating domain role: ${name} for domain ${domainId}`, error);
                throw new Error(`Failed to create domain role: ${error.message}`);
            }
            this.logger.log(`Created domain role ${data.id}: ${name} for domain ${domainId}`);
            return data.id;
        }
        catch (error) {
            this.logger.error(`Unexpected error creating domain role: ${name}`, error);
            throw error;
        }
    }
    async createPermission(key, description) {
        try {
            const supabase = this.supabaseService.getServiceClient();
            const { data, error } = await supabase
                .from('permissions')
                .insert({
                key,
                description,
            })
                .select('id')
                .single();
            if (error) {
                this.logger.error(`Error creating permission: ${key}`, error);
                throw new Error(`Failed to create permission: ${error.message}`);
            }
            this.logger.log(`Created permission ${data.id}: ${key}`);
            return data.id;
        }
        catch (error) {
            this.logger.error(`Unexpected error creating permission: ${key}`, error);
            throw error;
        }
    }
    async assignPermissionToRole(domainRoleId, permissionId, allowed = true) {
        try {
            const supabase = this.supabaseService.getServiceClient();
            const { data, error } = await supabase
                .from('domain_role_permissions')
                .insert({
                domain_role_id: domainRoleId,
                permission_id: permissionId,
                allowed,
            })
                .select('id')
                .single();
            if (error) {
                this.logger.error(`Error assigning permission ${permissionId} to role ${domainRoleId}`, error);
                throw new Error(`Failed to assign permission: ${error.message}`);
            }
            this.logger.log(`Assigned permission ${permissionId} to domain role ${domainRoleId} (allowed: ${allowed})`);
            return data.id;
        }
        catch (error) {
            this.logger.error(`Unexpected error assigning permission to role`, error);
            throw error;
        }
    }
    async assignRoleToUser(userId, domainRoleId) {
        try {
            const supabase = this.supabaseService.getServiceClient();
            const { data, error } = await supabase
                .from('user_domain_roles')
                .insert({
                user_id: userId,
                domain_role_id: domainRoleId,
            })
                .select('id')
                .single();
            if (error) {
                this.logger.error(`Error assigning role ${domainRoleId} to user ${userId}`, error);
                throw new Error(`Failed to assign role to user: ${error.message}`);
            }
            this.logger.log(`Assigned domain role ${domainRoleId} to user ${userId}`);
            return data.id;
        }
        catch (error) {
            this.logger.error(`Unexpected error assigning role to user`, error);
            throw error;
        }
    }
    async getAllDomains() {
        try {
            const supabase = this.supabaseService.getServiceClient();
            const { data, error } = await supabase
                .from('domains')
                .select('id, type, name')
                .order('created_at', { ascending: false });
            if (error) {
                this.logger.error('Error getting all domains', error);
                throw new Error(`Failed to get domains: ${error.message}`);
            }
            return data || [];
        }
        catch (error) {
            this.logger.error('Unexpected error getting domains', error);
            throw error;
        }
    }
    async getAllPermissions() {
        try {
            const supabase = this.supabaseService.getServiceClient();
            const { data, error } = await supabase
                .from('permissions')
                .select('id, key, description')
                .order('key');
            if (error) {
                this.logger.error('Error getting all permissions', error);
                throw new Error(`Failed to get permissions: ${error.message}`);
            }
            return data || [];
        }
        catch (error) {
            this.logger.error('Unexpected error getting permissions', error);
            throw error;
        }
    }
    async removeRoleFromUser(userId, domainRoleId) {
        try {
            const supabase = this.supabaseService.getServiceClient();
            const { error } = await supabase
                .from('user_domain_roles')
                .delete()
                .eq('user_id', userId)
                .eq('domain_role_id', domainRoleId);
            if (error) {
                this.logger.error(`Error removing role ${domainRoleId} from user ${userId}`, error);
                throw new Error(`Failed to remove role from user: ${error.message}`);
            }
            this.logger.log(`Removed domain role ${domainRoleId} from user ${userId}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Unexpected error removing role from user`, error);
            throw error;
        }
    }
};
exports.PbacManagementService = PbacManagementService;
exports.PbacManagementService = PbacManagementService = PbacManagementService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], PbacManagementService);
//# sourceMappingURL=pbac-management.service.js.map