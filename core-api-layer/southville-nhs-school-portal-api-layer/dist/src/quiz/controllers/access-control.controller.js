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
var AccessControlController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessControlController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const access_control_service_1 = require("../services/access-control.service");
const generate_access_link_dto_1 = require("../dto/generate-access-link.dto");
const supabase_auth_guard_1 = require("../../auth/supabase-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const policies_guard_1 = require("../../auth/guards/policies.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const auth_user_decorator_1 = require("../../auth/auth-user.decorator");
let AccessControlController = AccessControlController_1 = class AccessControlController {
    accessControlService;
    logger = new common_1.Logger(AccessControlController_1.name);
    constructor(accessControlService) {
        this.accessControlService = accessControlService;
    }
    async generateAccessLink(quizId, generateDto, user) {
        this.logger.log(`Generating access link for quiz ${quizId}`);
        return this.accessControlService.generateAccessLink({
            quizId,
            teacherId: user.id,
            expiresAt: generateDto.expiresAt,
            accessCode: generateDto.accessCode,
            maxUses: generateDto.maxUses,
            requiresAuth: generateDto.requiresAuth,
        });
    }
    async validateAccess(validateDto, user) {
        this.logger.log(`Validating access token`);
        return this.accessControlService.validateAccess({
            token: validateDto.token,
            accessCode: validateDto.accessCode,
            studentId: user?.id,
        });
    }
    async getQuizAccessLinks(quizId, user) {
        this.logger.log(`Fetching access links for quiz ${quizId}`);
        return this.accessControlService.getQuizAccessLinks(quizId, user.id);
    }
    async revokeAccessLink(token, user) {
        this.logger.log(`Revoking access link ${token}`);
        await this.accessControlService.revokeAccessLink(token, user.id);
        return { message: 'Access link revoked successfully' };
    }
    async getQRCode(token) {
        this.logger.log(`Generating QR code for token ${token}`);
        const accessLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/quiz/access/${token}`;
        const qrCodeData = await this.accessControlService.generateQRCode(accessLink);
        return {
            qrCodeData,
            accessLink,
        };
    }
};
exports.AccessControlController = AccessControlController;
__decorate([
    (0, common_1.Post)('generate/:quizId'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Generate an access link for a quiz' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Access link generated successfully',
        schema: {
            example: {
                token: 'a1b2c3d4e5f6...',
                accessLink: 'http://localhost:3000/quiz/access/a1b2c3d4e5f6...',
                qrCodeData: 'http://localhost:3000/quiz/access/a1b2c3d4e5f6...',
                expiresAt: '2025-01-20T23:59:59Z',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Teachers and Admins only' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Quiz not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request - Quiz must be published' }),
    __param(0, (0, common_1.Param)('quizId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, generate_access_link_dto_1.GenerateAccessLinkDto, Object]),
    __metadata("design:returntype", Promise)
], AccessControlController.prototype, "generateAccessLink", null);
__decorate([
    (0, common_1.Post)('validate'),
    (0, swagger_1.ApiOperation)({ summary: 'Validate an access token (public endpoint)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Access validation result',
        schema: {
            example: {
                isValid: true,
                quizId: 'uuid',
                requiresAuth: true,
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_access_link_dto_1.ValidateAccessLinkDto, Object]),
    __metadata("design:returntype", Promise)
], AccessControlController.prototype, "validateAccess", null);
__decorate([
    (0, common_1.Get)('quiz/:quizId/links'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get all access links for a quiz' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Access links retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Teachers and Admins only' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Quiz not found' }),
    __param(0, (0, common_1.Param)('quizId')),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AccessControlController.prototype, "getQuizAccessLinks", null);
__decorate([
    (0, common_1.Delete)('revoke/:token'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Revoke an access link' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Access link revoked successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Teachers and Admins only' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Access link not found' }),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AccessControlController.prototype, "revokeAccessLink", null);
__decorate([
    (0, common_1.Get)('qr/:token'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get QR code data for an access link' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'QR code data retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AccessControlController.prototype, "getQRCode", null);
exports.AccessControlController = AccessControlController = AccessControlController_1 = __decorate([
    (0, swagger_1.ApiTags)('Quiz Access Control'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('quiz-access'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, policies_guard_1.PoliciesGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [access_control_service_1.AccessControlService])
], AccessControlController);
//# sourceMappingURL=access-control.controller.js.map