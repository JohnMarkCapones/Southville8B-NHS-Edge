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
var PoliciesGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoliciesGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const policies_decorator_1 = require("../decorators/policies.decorator");
const policy_engine_service_1 = require("../services/policy-engine.service");
const domain_mapping_service_1 = require("../services/domain-mapping.service");
let PoliciesGuard = PoliciesGuard_1 = class PoliciesGuard {
    reflector;
    policyEngineService;
    domainMappingService;
    logger = new common_1.Logger(PoliciesGuard_1.name);
    constructor(reflector, policyEngineService, domainMappingService) {
        this.reflector = reflector;
        this.policyEngineService = policyEngineService;
        this.domainMappingService = domainMappingService;
    }
    sanitizeInput(input) {
        if (!input)
            return input;
        return input.replace(/<[^>]*>/g, '').trim();
    }
    async canActivate(context) {
        const policyConfig = this.reflector.getAllAndOverride(policies_decorator_1.POLICIES_KEY, [context.getHandler(), context.getClass()]);
        if (!policyConfig) {
            this.logger.debug('No policies required for this route');
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            this.logger.warn('No authenticated user found in request');
            throw new common_1.ForbiddenException('User not authenticated');
        }
        try {
            const { domainParam, permissionKey } = policyConfig;
            const sanitizedUserId = this.sanitizeInput(user.id);
            const sanitizedDomainParam = this.sanitizeInput(domainParam);
            const sanitizedPermissionKey = this.sanitizeInput(permissionKey);
            if (!sanitizedUserId ||
                !sanitizedDomainParam ||
                !sanitizedPermissionKey) {
                throw new common_1.ForbiddenException('Invalid input parameters');
            }
            const entityId = request.params[sanitizedDomainParam];
            if (!entityId) {
                this.logger.warn(`Domain parameter '${sanitizedDomainParam}' not found in route parameters`);
                throw new common_1.ForbiddenException(`Required parameter '${sanitizedDomainParam}' not found`);
            }
            const sanitizedEntityId = this.sanitizeInput(entityId);
            if (!sanitizedEntityId) {
                throw new common_1.ForbiddenException('Invalid entity ID');
            }
            const domainId = await this.domainMappingService.resolveDomainId(sanitizedDomainParam, sanitizedEntityId);
            if (domainId === null || domainId === undefined) {
                this.logger.warn(`Could not resolve domain ID for ${sanitizedDomainParam}:${sanitizedEntityId}`);
                throw new common_1.ForbiddenException(`Invalid ${sanitizedDomainParam} or domain not found`);
            }
            this.logger.debug(`Evaluating permission for user ${sanitizedUserId}, domain ${domainId}, permission ${sanitizedPermissionKey}`);
            const hasPermission = await this.policyEngineService.evaluatePermission(sanitizedUserId, domainId, sanitizedPermissionKey);
            if (!hasPermission) {
                this.logger.warn(`🚫 PERMISSION_DENIED: User ${sanitizedUserId} attempted ${sanitizedPermissionKey} on domain ${domainId} at ${new Date().toISOString()}`);
                this.logger.warn(`🔍 Security Context: IP=${request.ip}, UserAgent=${request.headers['user-agent']}, Path=${request.path}`);
                throw new common_1.ForbiddenException(`Access denied. Required permission: ${sanitizedPermissionKey} in domain ${domainId}`);
            }
            this.logger.debug(`✅ Access granted for user ${sanitizedUserId} - has permission ${sanitizedPermissionKey} in domain ${domainId}`);
            return true;
        }
        catch (error) {
            if (error instanceof common_1.ForbiddenException) {
                throw error;
            }
            this.logger.error(`Unexpected error in PoliciesGuard for user ${user.id}`, error);
            throw new common_1.ForbiddenException('Failed to evaluate domain permissions');
        }
    }
};
exports.PoliciesGuard = PoliciesGuard;
exports.PoliciesGuard = PoliciesGuard = PoliciesGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        policy_engine_service_1.PolicyEngineService,
        domain_mapping_service_1.DomainMappingService])
], PoliciesGuard);
//# sourceMappingURL=policies.guard.js.map