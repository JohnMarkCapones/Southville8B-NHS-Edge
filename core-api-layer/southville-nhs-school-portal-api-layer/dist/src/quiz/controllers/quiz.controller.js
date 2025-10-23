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
var QuizController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const quiz_service_1 = require("../services/quiz.service");
const dto_1 = require("../dto");
const assign_quiz_to_sections_dto_1 = require("../dto/assign-quiz-to-sections.dto");
const entities_1 = require("../entities");
const supabase_auth_guard_1 = require("../../auth/supabase-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const policies_guard_1 = require("../../auth/guards/policies.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const auth_user_decorator_1 = require("../../auth/auth-user.decorator");
let QuizController = QuizController_1 = class QuizController {
    quizService;
    logger = new common_1.Logger(QuizController_1.name);
    constructor(quizService) {
        this.quizService = quizService;
    }
    async getAvailableQuizzes(user, page = 1, limit = 10, subjectId) {
        this.logger.log(`Fetching available quizzes for student ${user.id}`);
        return this.quizService.getAvailableQuizzes(user.id, {
            page,
            limit,
            subjectId,
        });
    }
    async createQuiz(createQuizDto, user) {
        this.logger.log(`Creating quiz for teacher: ${user.id}`);
        return this.quizService.createQuiz(createQuizDto, user.id);
    }
    async findAllQuizzes(user, page = 1, limit = 10, teacherId, subjectId, status, sortBy = 'created_at', sortOrder = 'desc') {
        this.logger.log('Fetching quizzes');
        return this.quizService.findAllQuizzes({
            page,
            limit,
            teacherId,
            subjectId,
            status,
            sortBy,
            sortOrder,
        });
    }
    async findQuizById(id, user) {
        this.logger.log(`Fetching quiz ${id}`);
        return this.quizService.findQuizById(id);
    }
    async updateQuiz(id, updateQuizDto, user) {
        this.logger.log(`Updating quiz ${id} for teacher: ${user.id}`);
        return this.quizService.updateQuiz(id, updateQuizDto, user.id);
    }
    async deleteQuiz(id, user) {
        this.logger.log(`Deleting quiz ${id} for teacher: ${user.id}`);
        await this.quizService.deleteQuiz(id, user.id);
        return { message: 'Quiz archived successfully' };
    }
    async addQuestion(quizId, createQuestionDto, user) {
        this.logger.log(`Adding question to quiz ${quizId}`);
        return this.quizService.addQuestion(quizId, createQuestionDto, user.id);
    }
    async createQuizSettings(quizId, settingsDto, user) {
        this.logger.log(`Configuring settings for quiz ${quizId}`);
        return this.quizService.createQuizSettings(quizId, settingsDto, user.id);
    }
    async publishQuiz(quizId, publishDto, user) {
        this.logger.log(`Publishing quiz ${quizId} with status: ${publishDto.status}`);
        return this.quizService.publishQuiz(quizId, publishDto, user.id);
    }
    async assignQuizToSections(quizId, assignDto, user) {
        this.logger.log(`Assigning quiz ${quizId} to ${assignDto.sectionIds.length} section(s)`);
        await this.quizService.assignQuizToSections(quizId, assignDto.sectionIds, user.id, {
            startDate: assignDto.startDate,
            endDate: assignDto.endDate,
            timeLimit: assignDto.timeLimit,
            sectionSettings: assignDto.sectionSettings,
        });
        return { message: 'Quiz assigned to sections successfully' };
    }
    async getQuizSections(quizId) {
        this.logger.log(`Fetching sections for quiz ${quizId}`);
        return this.quizService.getQuizSections(quizId);
    }
    async removeQuizFromSections(quizId, user) {
        this.logger.log(`Removing quiz ${quizId} from all sections`);
        await this.quizService.removeQuizFromAllSections(quizId, user.id);
        return { message: 'Quiz removed from all sections successfully' };
    }
    async cloneQuiz(quizId, newTitle, user) {
        this.logger.log(`Cloning quiz ${quizId}`);
        return this.quizService.cloneQuiz(quizId, user.id, newTitle);
    }
    async getQuizPreview(quizId, user) {
        this.logger.log(`Getting preview for quiz ${quizId}`);
        return this.quizService.getQuizPreview(quizId, user.id);
    }
};
exports.QuizController = QuizController;
__decorate([
    (0, common_1.Get)('available'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.STUDENT),
    (0, swagger_1.ApiOperation)({ summary: 'Get available quizzes for the current student' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Items per page' }),
    (0, swagger_1.ApiQuery)({ name: 'subjectId', required: false, type: String, description: 'Filter by subject ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Available quizzes retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Students only' }),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __param(3, (0, common_1.Query)('subjectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String]),
    __metadata("design:returntype", Promise)
], QuizController.prototype, "getAvailableQuizzes", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new quiz (draft status)' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Quiz created successfully',
        type: entities_1.Quiz,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Teachers and Admins only',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad Request - Invalid data',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateQuizDto, Object]),
    __metadata("design:returntype", Promise)
], QuizController.prototype, "createQuiz", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get all quizzes with pagination and filtering' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Items per page' }),
    (0, swagger_1.ApiQuery)({ name: 'teacherId', required: false, type: String, description: 'Filter by teacher ID' }),
    (0, swagger_1.ApiQuery)({ name: 'subjectId', required: false, type: String, description: 'Filter by subject ID' }),
    (0, swagger_1.ApiQuery)({
        name: 'status',
        required: false,
        enum: ['draft', 'published', 'archived', 'scheduled'],
        description: 'Filter by quiz status',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'sortBy',
        required: false,
        enum: ['created_at', 'title', 'updated_at'],
        description: 'Sort field',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'sortOrder',
        required: false,
        enum: ['asc', 'desc'],
        description: 'Sort order',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Quizzes retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Teachers and Admins only',
    }),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __param(3, (0, common_1.Query)('teacherId')),
    __param(4, (0, common_1.Query)('subjectId')),
    __param(5, (0, common_1.Query)('status')),
    __param(6, (0, common_1.Query)('sortBy')),
    __param(7, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], QuizController.prototype, "findAllQuizzes", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.STUDENT),
    (0, swagger_1.ApiOperation)({ summary: 'Get a quiz by ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Quiz retrieved successfully',
        type: entities_1.Quiz,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Quiz not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], QuizController.prototype, "findQuizById", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update a quiz (teachers can only update their own quizzes)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Quiz updated successfully',
        type: entities_1.Quiz,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - You can only update your own quizzes',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Quiz not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateQuizDto, Object]),
    __metadata("design:returntype", Promise)
], QuizController.prototype, "updateQuiz", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a quiz (soft delete by archiving)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Quiz deleted successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - You can only delete your own quizzes',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Quiz not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], QuizController.prototype, "deleteQuiz", null);
__decorate([
    (0, common_1.Post)(':id/questions'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Add a question to a quiz' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Question added successfully',
        type: entities_1.QuizQuestion,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - You can only add questions to your own quizzes',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Quiz not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreateQuizQuestionDto, Object]),
    __metadata("design:returntype", Promise)
], QuizController.prototype, "addQuestion", null);
__decorate([
    (0, common_1.Post)(':id/settings'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Configure quiz security and monitoring settings' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Quiz settings configured successfully',
        type: entities_1.QuizSettings,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - You can only configure settings for your own quizzes',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Quiz not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreateQuizSettingsDto, Object]),
    __metadata("design:returntype", Promise)
], QuizController.prototype, "createQuizSettings", null);
__decorate([
    (0, common_1.Post)(':id/publish'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Publish a quiz and optionally assign to sections' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Quiz published successfully',
        type: entities_1.Quiz,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - You can only publish your own quizzes',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Quiz not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.PublishQuizDto, Object]),
    __metadata("design:returntype", Promise)
], QuizController.prototype, "publishQuiz", null);
__decorate([
    (0, common_1.Post)(':id/assign-sections'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Assign quiz to sections with optional deadline overrides' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Quiz assigned to sections successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - You can only assign your own quizzes',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad Request - Quiz must be published first',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Quiz not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assign_quiz_to_sections_dto_1.AssignQuizToSectionsDto, Object]),
    __metadata("design:returntype", Promise)
], QuizController.prototype, "assignQuizToSections", null);
__decorate([
    (0, common_1.Get)(':id/sections'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get sections assigned to a quiz' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Sections retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Quiz not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], QuizController.prototype, "getQuizSections", null);
__decorate([
    (0, common_1.Delete)(':id/sections'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Remove quiz from all sections' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Quiz removed from all sections successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - You can only remove your own quizzes',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Quiz not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], QuizController.prototype, "removeQuizFromSections", null);
__decorate([
    (0, common_1.Post)(':id/clone'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Clone/duplicate a quiz' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Quiz cloned successfully',
        type: entities_1.Quiz,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - You can only clone your own quizzes',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Quiz not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('newTitle')),
    __param(2, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], QuizController.prototype, "cloneQuiz", null);
__decorate([
    (0, common_1.Get)(':id/preview'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get quiz preview (for testing before publishing)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Quiz preview retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - You can only preview your own quizzes',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Quiz not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], QuizController.prototype, "getQuizPreview", null);
exports.QuizController = QuizController = QuizController_1 = __decorate([
    (0, swagger_1.ApiTags)('Quizzes'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('quizzes'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, policies_guard_1.PoliciesGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [quiz_service_1.QuizService])
], QuizController);
//# sourceMappingURL=quiz.controller.js.map