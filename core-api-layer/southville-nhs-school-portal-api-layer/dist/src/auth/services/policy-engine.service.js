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
var PolicyEngineService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolicyEngineService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
let PolicyEngineService = PolicyEngineService_1 = class PolicyEngineService {
    supabaseService;
    logger = new common_1.Logger(PolicyEngineService_1.name);
    permissionCache = new Map();
    PERMISSION_TTL = 30 * 1000;
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async evaluatePermission(userId, domainId, permissionKey) {
        try {
            const cacheKey = `${userId}:${domainId}:${permissionKey}`;
            const cached = this.permissionCache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < this.PERMISSION_TTL) {
                this.logger.debug(`⚡ Permission cache hit for ${cacheKey}: ${cached.result}`);
                return cached.result;
            }
            this.logger.debug(`🔍 Permission cache miss for user ${userId}, domain ${domainId}, permission ${permissionKey}`);
            const supabase = this.supabaseService.getServiceClient();
            const { data, error } = await supabase
                .from('user_domain_roles')
                .select(`
          domain_role_id,
          domain_roles!inner(
            id,
            domain_id,
            domain_role_permissions!inner(
              allowed,
              permissions!inner(
                key
              )
            )
          )
        `)
                .eq('user_id', userId)
                .eq('domain_roles.domain_id', domainId)
                .eq('domain_roles.domain_role_permissions.permissions.key', permissionKey);
            if (error) {
                this.logger.error(`Database error evaluating permission for user ${userId}`, error);
                throw new common_1.InternalServerErrorException('Failed to evaluate permissions');
            }
            if (!data || data.length === 0) {
                this.logger.debug(`No permissions found for user ${userId} in domain ${domainId} with key ${permissionKey}`);
                return false;
            }
            const hasPermission = data.some((userRole) => userRole.domain_roles.domain_role_permissions.some((rolePermission) => rolePermission.allowed === true));
            this.permissionCache.set(cacheKey, {
                result: hasPermission,
                timestamp: Date.now(),
            });
            this.logger.debug(`✅ Permission evaluation result for user ${userId}: ${hasPermission} (cached)`);
            return hasPermission;
        }
        catch (error) {
            if (error instanceof common_1.ForbiddenException) {
                throw error;
            }
            this.logger.error(`System error evaluating permission for user ${userId}`, error);
            throw new common_1.InternalServerErrorException('Permission evaluation failed');
        }
    }
    async getUserDomainPermissions(userId, domainId) {
        try {
            const supabase = this.supabaseService.getServiceClient();
            const { data, error } = await supabase
                .from('user_domain_roles')
                .select(`
          domain_role_id,
          domain_roles!inner(
            id,
            domain_id,
            domain_role_permissions!inner(
              allowed,
              permissions!inner(
                key
              )
            )
          )
        `)
                .eq('user_id', userId)
                .eq('domain_roles.domain_id', domainId);
            if (error) {
                this.logger.error(`Database error getting user domain permissions for user ${userId}`, error);
                throw new common_1.InternalServerErrorException('Failed to get user permissions');
            }
            if (!data || data.length === 0) {
                return [];
            }
            const permissionsMap = new Map();
            data.forEach((userRole) => {
                userRole.domain_roles.domain_role_permissions.forEach((rolePermission) => {
                    const key = rolePermission.permissions.key;
                    permissionsMap.set(key, permissionsMap.get(key) || rolePermission.allowed);
                });
            });
            return Array.from(permissionsMap.entries()).map(([permissionKey, allowed]) => ({
                permissionKey,
                allowed,
            }));
        }
        catch (error) {
            if (error instanceof common_1.ForbiddenException) {
                throw error;
            }
            this.logger.error(`System error getting user domain permissions for user ${userId}`, error);
            throw new common_1.InternalServerErrorException('Failed to get user permissions');
        }
    }
    async hasAnyDomainRole(userId, domainId) {
        try {
            const supabase = this.supabaseService.getServiceClient();
            const { data, error } = await supabase
                .from('user_domain_roles')
                .select(`
          domain_role_id,
          domain_roles!inner(
            id,
            domain_id
          )
        `)
                .eq('user_id', userId)
                .eq('domain_roles.domain_id', domainId)
                .limit(1);
            if (error) {
                this.logger.error(`Error checking domain role for user ${userId}`, error);
                return false;
            }
            return data && data.length > 0;
        }
        catch (error) {
            this.logger.error(`Unexpected error checking domain role for user ${userId}`, error);
            return false;
        }
    }
    clearUserPermissionCache(userId) {
        const keysToDelete = Array.from(this.permissionCache.keys()).filter((key) => key.startsWith(`${userId}:`));
        keysToDelete.forEach((key) => this.permissionCache.delete(key));
        this.logger.debug(`🗑️ Cleared permission cache for user ${userId} (${keysToDelete.length} entries)`);
    }
    clearAllPermissionCache() {
        this.permissionCache.clear();
        this.logger.debug('🗑️ Cleared all permission cache');
    }
    getCacheStats() {
        const entries = Array.from(this.permissionCache.entries()).map(([key, cached]) => ({
            key,
            age: Date.now() - cached.timestamp,
            result: cached.result,
        }));
        return {
            size: this.permissionCache.size,
            entries,
        };
    }
};
exports.PolicyEngineService = PolicyEngineService;
exports.PolicyEngineService = PolicyEngineService = PolicyEngineService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], PolicyEngineService);
//# sourceMappingURL=policy-engine.service.js.map