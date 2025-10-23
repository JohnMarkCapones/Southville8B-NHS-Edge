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
var QuizAttemptsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizAttemptsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const quiz_attempts_service_1 = require("../services/quiz-attempts.service");
const start_quiz_attempt_dto_1 = require("../dto/start-quiz-attempt.dto");
const submit_answer_dto_1 = require("../dto/submit-answer.dto");
const entities_1 = require("../entities");
const supabase_auth_guard_1 = require("../../auth/supabase-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const policies_guard_1 = require("../../auth/guards/policies.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const auth_user_decorator_1 = require("../../auth/auth-user.decorator");
let QuizAttemptsController = QuizAttemptsController_1 = class QuizAttemptsController {
    quizAttemptsService;
    logger = new common_1.Logger(QuizAttemptsController_1.name);
    constructor(quizAttemptsService) {
        this.quizAttemptsService = quizAttemptsService;
    }
    async startAttempt(quizId, startDto, user, request) {
        this.logger.log(`Starting quiz attempt for student ${user.id} on quiz ${quizId}`);
        const ipAddress = request.headers['x-forwarded-for']?.split(',')[0] ||
            request.headers['x-real-ip'] ||
            request.ip;
        return this.quizAttemptsService.startAttempt(quizId, user.id, startDto, ipAddress);
    }
    async submitAnswer(attemptId, submitDto, user) {
        this.logger.log(`Saving answer for attempt ${attemptId}`);
        await this.quizAttemptsService.submitAnswer(attemptId, user.id, submitDto);
        return { message: 'Answer saved successfully' };
    }
    async submitAttempt(attemptId, user) {
        this.logger.log(`Submitting quiz attempt ${attemptId}`);
        return this.quizAttemptsService.submitAttempt(attemptId, user.id);
    }
    async getAttempt(attemptId, user) {
        this.logger.log(`Fetching quiz attempt ${attemptId}`);
        return this.quizAttemptsService.getAttempt(attemptId, user.id);
    }
};
exports.QuizAttemptsController = QuizAttemptsController;
__decorate([
    (0, common_1.Post)('start/:quizId'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.STUDENT),
    (0, swagger_1.ApiOperation)({ summary: 'Start a new quiz attempt (students only)' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Quiz attempt started successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Students only or retakes not allowed',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Quiz not found' }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad Request - Quiz ended or not published',
    }),
    __param(0, (0, common_1.Param)('quizId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_user_decorator_1.AuthUser)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, start_quiz_attempt_dto_1.StartQuizAttemptDto, Object, Object]),
    __metadata("design:returntype", Promise)
], QuizAttemptsController.prototype, "startAttempt", null);
__decorate([
    (0, common_1.Post)(':attemptId/answer'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.STUDENT),
    (0, swagger_1.ApiOperation)({ summary: 'Submit an answer (auto-save during quiz)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Answer saved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Quiz attempt not found' }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad Request - Quiz not in progress',
    }),
    __param(0, (0, common_1.Param)('attemptId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, submit_answer_dto_1.SubmitAnswerDto, Object]),
    __metadata("design:returntype", Promise)
], QuizAttemptsController.prototype, "submitAnswer", null);
__decorate([
    (0, common_1.Post)(':attemptId/submit'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.STUDENT),
    (0, swagger_1.ApiOperation)({ summary: 'Submit quiz attempt (finalize)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Quiz submitted successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Quiz attempt not found' }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad Request - Quiz already submitted',
    }),
    __param(0, (0, common_1.Param)('attemptId')),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], QuizAttemptsController.prototype, "submitAttempt", null);
__decorate([
    (0, common_1.Get)(':attemptId'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.STUDENT, roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get quiz attempt details' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Quiz attempt retrieved successfully',
        type: entities_1.QuizAttempt,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Quiz attempt not found' }),
    __param(0, (0, common_1.Param)('attemptId')),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], QuizAttemptsController.prototype, "getAttempt", null);
exports.QuizAttemptsController = QuizAttemptsController = QuizAttemptsController_1 = __decorate([
    (0, swagger_1.ApiTags)('Quiz Attempts'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('quiz-attempts'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, policies_guard_1.PoliciesGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [quiz_attempts_service_1.QuizAttemptsService])
], QuizAttemptsController);
//# sourceMappingURL=quiz-attempts.controller.js.map