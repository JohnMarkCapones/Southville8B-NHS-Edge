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
exports.ClubMembershipsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const supabase_auth_guard_1 = require("../../auth/supabase-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const policies_guard_1 = require("../../auth/guards/policies.guard");
const auth_user_decorator_1 = require("../../auth/auth-user.decorator");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const club_memberships_service_1 = require("../services/club-memberships.service");
const create_club_membership_dto_1 = require("../dto/create-club-membership.dto");
const update_club_membership_dto_1 = require("../dto/update-club-membership.dto");
const club_membership_model_1 = require("../models/club-membership.model");
let ClubMembershipsController = class ClubMembershipsController {
    service;
    constructor(service) {
        this.service = service;
    }
    async create(createDto, userId) {
        return this.service.create(createDto, userId);
    }
    async findAll(clubId) {
        return this.service.findAll(clubId);
    }
    async findByStudent(studentId) {
        return this.service.findByStudent(studentId);
    }
    async findOne(id) {
        return this.service.findOne(id);
    }
    async update(id, updateDto, userId) {
        return this.service.update(id, updateDto, userId);
    }
    async remove(id, userId) {
        return this.service.remove(id, userId);
    }
};
exports.ClubMembershipsController = ClubMembershipsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Create club membership' }),
    (0, swagger_1.ApiResponse)({ status: 201, type: club_membership_model_1.ClubMembership }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_club_membership_dto_1.CreateClubMembershipDto, String]),
    __metadata("design:returntype", Promise)
], ClubMembershipsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.STUDENT),
    (0, swagger_1.ApiOperation)({ summary: 'Get all club memberships' }),
    (0, swagger_1.ApiQuery)({ name: 'clubId', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, type: [club_membership_model_1.ClubMembership] }),
    __param(0, (0, common_1.Query)('clubId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClubMembershipsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('student/:studentId'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.STUDENT),
    (0, swagger_1.ApiOperation)({ summary: 'Get memberships by student' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: [club_membership_model_1.ClubMembership] }),
    __param(0, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClubMembershipsController.prototype, "findByStudent", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.STUDENT),
    (0, swagger_1.ApiOperation)({ summary: 'Get membership by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: club_membership_model_1.ClubMembership }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClubMembershipsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Update membership' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: club_membership_model_1.ClubMembership }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_user_decorator_1.AuthUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_club_membership_dto_1.UpdateClubMembershipDto, String]),
    __metadata("design:returntype", Promise)
], ClubMembershipsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Delete membership' }),
    (0, swagger_1.ApiResponse)({ status: 204 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_user_decorator_1.AuthUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ClubMembershipsController.prototype, "remove", null);
exports.ClubMembershipsController = ClubMembershipsController = __decorate([
    (0, swagger_1.ApiTags)('club-memberships'),
    (0, common_1.Controller)('club-memberships'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, policies_guard_1.PoliciesGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [club_memberships_service_1.ClubMembershipsService])
], ClubMembershipsController);
//# sourceMappingURL=club-memberships.controller.js.map