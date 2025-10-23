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
var AnalyticsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const analytics_service_1 = require("../services/analytics.service");
const supabase_auth_guard_1 = require("../../auth/supabase-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const policies_guard_1 = require("../../auth/guards/policies.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const auth_user_decorator_1 = require("../../auth/auth-user.decorator");
let AnalyticsController = AnalyticsController_1 = class AnalyticsController {
    analyticsService;
    logger = new common_1.Logger(AnalyticsController_1.name);
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    async getQuizAnalytics(quizId, user) {
        this.logger.log(`Fetching quiz analytics for ${quizId}`);
        return this.analyticsService.getQuizAnalytics(quizId, user.id);
    }
    async getQuestionAnalytics(quizId, user) {
        this.logger.log(`Fetching question analytics for quiz ${quizId}`);
        return this.analyticsService.getQuestionAnalytics(quizId, user.id);
    }
    async getStudentPerformance(quizId, user) {
        this.logger.log(`Fetching student performance for quiz ${quizId}`);
        return this.analyticsService.getStudentPerformance(quizId, user.id);
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Get)('quiz/:quizId/overview'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get overall quiz analytics (scores, pass rate, etc.)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Quiz analytics retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - You can only view analytics for your own quizzes',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Quiz not found' }),
    __param(0, (0, common_1.Param)('quizId')),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getQuizAnalytics", null);
__decorate([
    (0, common_1.Get)('quiz/:quizId/questions'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Get question-level analytics (difficulty, correct rate, etc.)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Question analytics retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - You can only view analytics for your own quizzes',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Quiz not found' }),
    __param(0, (0, common_1.Param)('quizId')),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getQuestionAnalytics", null);
__decorate([
    (0, common_1.Get)('quiz/:quizId/students'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Get student performance for a quiz (attempts, scores, etc.)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Student performance retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - You can only view analytics for your own quizzes',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Quiz not found' }),
    __param(0, (0, common_1.Param)('quizId')),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getStudentPerformance", null);
exports.AnalyticsController = AnalyticsController = AnalyticsController_1 = __decorate([
    (0, swagger_1.ApiTags)('Quiz Analytics'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('quiz-analytics'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, policies_guard_1.PoliciesGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map