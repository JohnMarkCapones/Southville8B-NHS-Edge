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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const supabase_auth_guard_1 = require("../auth/supabase-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const domains_service_1 = require("./domains.service");
const create_domain_dto_1 = require("./dto/create-domain.dto");
let DomainsController = class DomainsController {
    domainsService;
    constructor(domainsService) {
        this.domainsService = domainsService;
    }
    async create(createDomainDto, req) {
        return this.domainsService.create(createDomainDto, req.user.id);
    }
    async createClubDomain(createClubDomainDto, req) {
        return this.domainsService.createClubDomain(createClubDomainDto, req.user.id);
    }
    async findAll() {
        return this.domainsService.findAll();
    }
    async findOne(id) {
        return this.domainsService.findOne(id);
    }
};
exports.DomainsController = DomainsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new domain' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Domain created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_domain_dto_1.CreateDomainDto, Object]),
    __metadata("design:returntype", Promise)
], DomainsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('clubs'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a club domain with associated club',
        description: 'Creates both a domain (type: club) and a club record linked to that domain. Also creates default domain roles and permissions.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Club domain created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_domain_dto_1.CreateClubDomainDto, Object]),
    __metadata("design:returntype", Promise)
], DomainsController.prototype, "createClubDomain", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Get all domains' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Domains retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DomainsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Get domain by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Domain retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Domain not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DomainsController.prototype, "findOne", null);
exports.DomainsController = DomainsController = __decorate([
    (0, swagger_1.ApiTags)('domains'),
    (0, common_1.Controller)('domains'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [domains_service_1.DomainsService])
], DomainsController);
//# sourceMappingURL=domains.controller.js.map