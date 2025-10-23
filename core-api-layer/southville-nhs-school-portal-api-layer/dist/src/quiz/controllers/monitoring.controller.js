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
var MonitoringController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const monitoring_service_1 = require("../services/monitoring.service");
const supabase_auth_guard_1 = require("../../auth/supabase-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const policies_guard_1 = require("../../auth/guards/policies.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const auth_user_decorator_1 = require("../../auth/auth-user.decorator");
let MonitoringController = MonitoringController_1 = class MonitoringController {
    monitoringService;
    logger = new common_1.Logger(MonitoringController_1.name);
    constructor(monitoringService) {
        this.monitoringService = monitoringService;
    }
    async getActiveParticipants(quizId, user) {
        this.logger.log(`Fetching active participants for quiz ${quizId}`);
        return this.monitoringService.getActiveParticipants(quizId, user.id);
    }
    async getQuizFlags(quizId, user) {
        this.logger.log(`Fetching flags for quiz ${quizId}`);
        return this.monitoringService.getQuizFlags(quizId, user.id);
    }
    async terminateAttempt(attemptId, reason, user) {
        this.logger.log(`Terminating quiz attempt ${attemptId}`);
        await this.monitoringService.terminateAttempt(attemptId, user.id, reason);
        return { message: 'Quiz attempt terminated successfully' };
    }
};
exports.MonitoringController = MonitoringController;
__decorate([
    (0, common_1.Get)('quiz/:quizId/participants'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all active participants for a quiz (polling endpoint)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Active participants retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Teachers and Admins only',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Quiz not found' }),
    __param(0, (0, common_1.Param)('quizId')),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getActiveParticipants", null);
__decorate([
    (0, common_1.Get)('quiz/:quizId/flags'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get all flags for a quiz' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Flags retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Teachers and Admins only',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Quiz not found' }),
    __param(0, (0, common_1.Param)('quizId')),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getQuizFlags", null);
__decorate([
    (0, common_1.Post)('attempt/:attemptId/terminate'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Terminate a student quiz attempt' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Quiz attempt terminated successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Teachers and Admins only',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Quiz attempt not found' }),
    __param(0, (0, common_1.Param)('attemptId')),
    __param(1, (0, common_1.Body)('reason')),
    __param(2, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "terminateAttempt", null);
exports.MonitoringController = MonitoringController = MonitoringController_1 = __decorate([
    (0, swagger_1.ApiTags)('Quiz Monitoring'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('quiz-monitoring'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, policies_guard_1.PoliciesGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [monitoring_service_1.MonitoringService])
], MonitoringController);
//# sourceMappingURL=monitoring.controller.js.map