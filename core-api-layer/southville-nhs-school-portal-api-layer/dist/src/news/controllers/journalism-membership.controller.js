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
exports.JournalismMembershipController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const supabase_auth_guard_1 = require("../../auth/supabase-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const auth_user_decorator_1 = require("../../auth/auth-user.decorator");
const journalism_membership_service_1 = require("../services/journalism-membership.service");
const dto_1 = require("../dto");
let JournalismMembershipController = class JournalismMembershipController {
    membershipService;
    constructor(membershipService) {
        this.membershipService = membershipService;
    }
    async getAllMembers() {
        return this.membershipService.getAllMembers();
    }
    async getMember(userId) {
        return this.membershipService.getMember(userId);
    }
    async addMember(addMemberDto, user) {
        return this.membershipService.addMember(addMemberDto, user.id);
    }
    async updatePosition(userId, updateDto, user) {
        return this.membershipService.updateMemberPosition(userId, updateDto, user.id);
    }
    async removeMember(userId, user) {
        await this.membershipService.removeMember(userId, user.id);
    }
};
exports.JournalismMembershipController = JournalismMembershipController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.STUDENT),
    (0, swagger_1.ApiOperation)({ summary: 'Get all journalism team members' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Members retrieved successfully',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    membershipId: { type: 'string' },
                    userId: { type: 'string' },
                    userName: { type: 'string' },
                    userEmail: { type: 'string' },
                    userRole: { type: 'string' },
                    position: { type: 'string' },
                    positionDescription: { type: 'string' },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], JournalismMembershipController.prototype, "getAllMembers", null);
__decorate([
    (0, common_1.Get)(':userId'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.STUDENT),
    (0, swagger_1.ApiOperation)({ summary: 'Get specific journalism member details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Member details retrieved' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Member not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JournalismMembershipController.prototype, "getMember", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Add a new student member to journalism team' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Member added successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                userId: { type: 'string' },
                userName: { type: 'string' },
                userEmail: { type: 'string' },
                position: { type: 'string' },
                addedBy: { type: 'string' },
                message: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Insufficient permissions to assign this position',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'User already a member OR position already taken',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.AddMemberDto, Object]),
    __metadata("design:returntype", Promise)
], JournalismMembershipController.prototype, "addMember", null);
__decorate([
    (0, common_1.Patch)(':userId'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Update a student member\'s position' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Position updated successfully',
        schema: {
            type: 'object',
            properties: {
                userId: { type: 'string' },
                previousPosition: { type: 'string' },
                newPosition: { type: 'string' },
                updatedBy: { type: 'string' },
                message: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Member not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Position already taken' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateMemberPositionDto, Object]),
    __metadata("design:returntype", Promise)
], JournalismMembershipController.prototype, "updatePosition", null);
__decorate([
    (0, common_1.Delete)(':userId'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a student member from journalism team' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Member removed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Member not found' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], JournalismMembershipController.prototype, "removeMember", null);
exports.JournalismMembershipController = JournalismMembershipController = __decorate([
    (0, swagger_1.ApiTags)('journalism-membership'),
    (0, common_1.Controller)('journalism/members'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [journalism_membership_service_1.JournalismMembershipService])
], JournalismMembershipController);
//# sourceMappingURL=journalism-membership.controller.js.map