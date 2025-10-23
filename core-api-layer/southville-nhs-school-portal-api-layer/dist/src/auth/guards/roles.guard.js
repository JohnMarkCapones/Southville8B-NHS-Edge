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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const auth_service_1 = require("../auth.service");
const role_cache_service_1 = require("../services/role-cache.service");
const roles_decorator_1 = require("../decorators/roles.decorator");
let RolesGuard = class RolesGuard {
    reflector;
    authService;
    roleCacheService;
    constructor(reflector, authService, roleCacheService) {
        this.reflector = reflector;
        this.authService = authService;
        this.roleCacheService = roleCacheService;
    }
    sanitizeInput(input) {
        if (!input)
            return input;
        return input.replace(/<[^>]*>/g, '').trim();
    }
    async canActivate(context) {
        const requiredRoles = this.reflector.getAllAndOverride(roles_decorator_1.ROLES_KEY, [context.getHandler(), context.getClass()]);
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.ForbiddenException('User not authenticated');
        }
        try {
            const sanitizedUserId = this.sanitizeInput(user.id);
            if (!sanitizedUserId) {
                throw new common_1.ForbiddenException('Invalid user ID');
            }
            let userRole = this.roleCacheService.getCachedRole(sanitizedUserId);
            if (!userRole) {
                console.log(`🔍 Cache miss for user ${sanitizedUserId}, querying database...`);
                userRole =
                    await this.authService.getUserRoleFromDatabase(sanitizedUserId);
                if (userRole) {
                    const sanitizedRole = this.sanitizeInput(userRole);
                    if (sanitizedRole) {
                        this.roleCacheService.setCachedRole(sanitizedUserId, sanitizedRole);
                        console.log(`✅ Cached role "${sanitizedRole}" for user ${sanitizedUserId}`);
                        userRole = sanitizedRole;
                    }
                }
            }
            else {
                console.log(`⚡ Cache hit for user ${sanitizedUserId}, role: "${userRole}"`);
            }
            if (!userRole) {
                throw new common_1.ForbiddenException('User role not found in database');
            }
            const sanitizedRequiredRoles = requiredRoles
                .map((role) => this.sanitizeInput(role))
                .filter((role) => role !== null && role !== undefined);
            const hasRole = sanitizedRequiredRoles.some((role) => role === userRole ||
                (userRole && this.authService.hasRoleHierarchy(userRole, role)));
            if (!hasRole) {
                console.warn(`🚫 ROLE_DENIED: User ${sanitizedUserId} attempted access requiring roles [${sanitizedRequiredRoles.join(', ')}] but has role "${userRole}" at ${new Date().toISOString()}`);
                throw new common_1.ForbiddenException(`Access denied. Required roles: ${sanitizedRequiredRoles.join(', ')}. Your role: ${userRole}`);
            }
            return true;
        }
        catch (error) {
            if (error instanceof common_1.ForbiddenException) {
                throw error;
            }
            console.error('Error in RolesGuard:', error);
            throw new common_1.ForbiddenException('Failed to verify user role');
        }
    }
};
exports.RolesGuard = RolesGuard;
exports.RolesGuard = RolesGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        auth_service_1.AuthService,
        role_cache_service_1.RoleCacheService])
], RolesGuard);
//# sourceMappingURL=roles.guard.js.map