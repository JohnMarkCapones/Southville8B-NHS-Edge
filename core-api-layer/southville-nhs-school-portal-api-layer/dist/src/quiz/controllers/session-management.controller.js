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
var SessionManagementController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionManagementController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const session_management_service_1 = require("../services/session-management.service");
const supabase_auth_guard_1 = require("../../auth/supabase-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const policies_guard_1 = require("../../auth/guards/policies.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const auth_user_decorator_1 = require("../../auth/auth-user.decorator");
let SessionManagementController = SessionManagementController_1 = class SessionManagementController {
    sessionManagementService;
    logger = new common_1.Logger(SessionManagementController_1.name);
    constructor(sessionManagementService) {
        this.sessionManagementService = sessionManagementService;
    }
    async heartbeat(attemptId, deviceFingerprint, user, request) {
        this.logger.log(`Heartbeat received for attempt ${attemptId}`);
        const ipAddress = request.headers['x-forwarded-for']?.split(',')[0] ||
            request.headers['x-real-ip'] ||
            request.ip;
        const userAgent = request.headers['user-agent'];
        return this.sessionManagementService.heartbeat(attemptId, user.id, {
            deviceFingerprint,
            userAgent,
            ipAddress,
        });
    }
    async validateSession(attemptId, deviceFingerprint, user) {
        this.logger.log(`Validating session for attempt ${attemptId}`);
        return this.sessionManagementService.validateSession(attemptId, user.id, deviceFingerprint);
    }
    async getSessionDetails(attemptId, user) {
        this.logger.log(`Fetching session details for attempt ${attemptId}`);
        return this.sessionManagementService.getSessionDetails(attemptId, user.id);
    }
    async terminateSession(attemptId, reason) {
        this.logger.log(`Terminating session for attempt ${attemptId}`);
        await this.sessionManagementService.terminateSession(attemptId, reason || 'user_logout');
        return { message: 'Session terminated successfully' };
    }
};
exports.SessionManagementController = SessionManagementController;
__decorate([
    (0, common_1.Post)(':attemptId/heartbeat'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.STUDENT),
    (0, swagger_1.ApiOperation)({
        summary: 'Send heartbeat to keep quiz session alive (students only)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Heartbeat recorded successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Students only' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Quiz attempt not found' }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad Request - Quiz not in progress',
    }),
    __param(0, (0, common_1.Param)('attemptId')),
    __param(1, (0, common_1.Body)('deviceFingerprint')),
    __param(2, (0, auth_user_decorator_1.AuthUser)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], SessionManagementController.prototype, "heartbeat", null);
__decorate([
    (0, common_1.Post)(':attemptId/validate'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.STUDENT),
    (0, swagger_1.ApiOperation)({ summary: 'Validate session integrity (students only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Session validation result',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('attemptId')),
    __param(1, (0, common_1.Body)('deviceFingerprint')),
    __param(2, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], SessionManagementController.prototype, "validateSession", null);
__decorate([
    (0, common_1.Get)(':attemptId'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.STUDENT, roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get session details' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Session details retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Session not found' }),
    __param(0, (0, common_1.Param)('attemptId')),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SessionManagementController.prototype, "getSessionDetails", null);
__decorate([
    (0, common_1.Post)(':attemptId/terminate'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.STUDENT, roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Terminate an active session' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Session terminated successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('attemptId')),
    __param(1, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SessionManagementController.prototype, "terminateSession", null);
exports.SessionManagementController = SessionManagementController = SessionManagementController_1 = __decorate([
    (0, swagger_1.ApiTags)('Quiz Session Management'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('quiz-sessions'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, policies_guard_1.PoliciesGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [session_management_service_1.SessionManagementService])
], SessionManagementController);
//# sourceMappingURL=session-management.controller.js.map