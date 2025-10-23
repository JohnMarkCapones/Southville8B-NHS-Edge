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
var GradingController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GradingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const grading_service_1 = require("../services/grading.service");
const grade_answer_dto_1 = require("../dto/grade-answer.dto");
const supabase_auth_guard_1 = require("../../auth/supabase-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const policies_guard_1 = require("../../auth/guards/policies.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const auth_user_decorator_1 = require("../../auth/auth-user.decorator");
let GradingController = GradingController_1 = class GradingController {
    gradingService;
    logger = new common_1.Logger(GradingController_1.name);
    constructor(gradingService) {
        this.gradingService = gradingService;
    }
    async getUngradedAnswers(quizId, user) {
        this.logger.log(`Fetching ungraded answers for quiz ${quizId}`);
        return this.gradingService.getUngradedAnswers(quizId, user.id);
    }
    async gradeAnswer(answerId, gradeDto, user) {
        this.logger.log(`Grading answer ${answerId}`);
        return this.gradingService.gradeAnswer(answerId, user.id, gradeDto);
    }
};
exports.GradingController = GradingController;
__decorate([
    (0, common_1.Get)('quiz/:quizId/ungraded'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get all ungraded essay answers for a quiz' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Ungraded answers retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - You can only grade your own quizzes',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Quiz not found' }),
    __param(0, (0, common_1.Param)('quizId')),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], GradingController.prototype, "getUngradedAnswers", null);
__decorate([
    (0, common_1.Post)('answer/:answerId/grade'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Grade a student answer (essay/short answer)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Answer graded successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - You can only grade your own quizzes',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Answer not found' }),
    __param(0, (0, common_1.Param)('answerId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, grade_answer_dto_1.GradeAnswerDto, Object]),
    __metadata("design:returntype", Promise)
], GradingController.prototype, "gradeAnswer", null);
exports.GradingController = GradingController = GradingController_1 = __decorate([
    (0, swagger_1.ApiTags)('Quiz Grading'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('quiz-grading'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, policies_guard_1.PoliciesGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [grading_service_1.GradingService])
], GradingController);
//# sourceMappingURL=grading.controller.js.map