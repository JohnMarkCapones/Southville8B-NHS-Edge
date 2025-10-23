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
var QuestionBankController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionBankController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const question_bank_service_1 = require("../services/question-bank.service");
const create_question_bank_dto_1 = require("../dto/create-question-bank.dto");
const update_question_bank_dto_1 = require("../dto/update-question-bank.dto");
const question_bank_entity_1 = require("../entities/question-bank.entity");
const supabase_auth_guard_1 = require("../../auth/supabase-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const policies_guard_1 = require("../../auth/guards/policies.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const auth_user_decorator_1 = require("../../auth/auth-user.decorator");
let QuestionBankController = QuestionBankController_1 = class QuestionBankController {
    questionBankService;
    logger = new common_1.Logger(QuestionBankController_1.name);
    constructor(questionBankService) {
        this.questionBankService = questionBankService;
    }
    async create(createDto, user) {
        this.logger.log(`Creating question bank item for teacher: ${user.id}`);
        return this.questionBankService.create(createDto, user.id);
    }
    async findAll(user, page = 1, limit = 10, subjectId, topic, difficulty, questionType, sortBy = 'created_at', sortOrder = 'desc') {
        this.logger.log('Fetching question bank');
        return this.questionBankService.findAll({
            page,
            limit,
            teacherId: user.id,
            subjectId,
            topic,
            difficulty,
            questionType,
            sortBy,
            sortOrder,
        });
    }
    async findOne(id, user) {
        this.logger.log(`Fetching question ${id}`);
        return this.questionBankService.findOne(id, user.id);
    }
    async update(id, updateDto, user) {
        this.logger.log(`Updating question ${id}`);
        return this.questionBankService.update(id, updateDto, user.id);
    }
    async remove(id, user) {
        this.logger.log(`Deleting question ${id}`);
        await this.questionBankService.remove(id, user.id);
        return { message: 'Question deleted successfully' };
    }
};
exports.QuestionBankController = QuestionBankController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create a reusable question template' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Question created successfully',
        type: question_bank_entity_1.QuestionBank,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Teachers and Admins only',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_question_bank_dto_1.CreateQuestionBankDto, Object]),
    __metadata("design:returntype", Promise)
], QuestionBankController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get all questions from your question bank' }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        required: false,
        type: Number,
        description: 'Page number',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Items per page',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'subjectId',
        required: false,
        type: String,
        description: 'Filter by subject ID',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'topic',
        required: false,
        type: String,
        description: 'Filter by topic',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'difficulty',
        required: false,
        enum: ['easy', 'medium', 'hard'],
        description: 'Filter by difficulty',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'questionType',
        required: false,
        type: String,
        description: 'Filter by question type',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'sortBy',
        required: false,
        enum: ['created_at', 'question_text', 'difficulty'],
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
        description: 'Questions retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __param(3, (0, common_1.Query)('subjectId')),
    __param(4, (0, common_1.Query)('topic')),
    __param(5, (0, common_1.Query)('difficulty')),
    __param(6, (0, common_1.Query)('questionType')),
    __param(7, (0, common_1.Query)('sortBy')),
    __param(8, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], QuestionBankController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get a question by ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Question retrieved successfully',
        type: question_bank_entity_1.QuestionBank,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Question not found' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - You can only view your own questions',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], QuestionBankController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update a question in your question bank' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Question updated successfully',
        type: question_bank_entity_1.QuestionBank,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - You can only update your own questions',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Question not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_question_bank_dto_1.UpdateQuestionBankDto, Object]),
    __metadata("design:returntype", Promise)
], QuestionBankController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a question from your question bank' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Question deleted successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - You can only delete your own questions',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Question not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], QuestionBankController.prototype, "remove", null);
exports.QuestionBankController = QuestionBankController = QuestionBankController_1 = __decorate([
    (0, swagger_1.ApiTags)('Question Bank'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('question-bank'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, policies_guard_1.PoliciesGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [question_bank_service_1.QuestionBankService])
], QuestionBankController);
//# sourceMappingURL=question-bank.controller.js.map