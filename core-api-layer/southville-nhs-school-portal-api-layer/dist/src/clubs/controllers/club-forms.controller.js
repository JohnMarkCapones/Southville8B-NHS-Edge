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
exports.ClubFormsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const supabase_auth_guard_1 = require("../../auth/supabase-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const policies_guard_1 = require("../../auth/guards/policies.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const policies_decorator_1 = require("../../auth/decorators/policies.decorator");
const auth_user_decorator_1 = require("../../auth/auth-user.decorator");
const club_forms_service_1 = require("../services/club-forms.service");
const club_form_responses_service_1 = require("../services/club-form-responses.service");
const create_club_form_dto_1 = require("../dto/create-club-form.dto");
const update_club_form_dto_1 = require("../dto/update-club-form.dto");
const create_form_question_dto_1 = require("../dto/create-form-question.dto");
const update_form_question_dto_1 = require("../dto/update-form-question.dto");
const submit_form_response_dto_1 = require("../dto/submit-form-response.dto");
const review_form_response_dto_1 = require("../dto/review-form-response.dto");
let ClubFormsController = class ClubFormsController {
    clubFormsService;
    clubFormResponsesService;
    constructor(clubFormsService, clubFormResponsesService) {
        this.clubFormsService = clubFormsService;
        this.clubFormResponsesService = clubFormResponsesService;
    }
    async createForm(clubId, createClubFormDto, user) {
        return this.clubFormsService.createForm(clubId, createClubFormDto, user.id);
    }
    async findAllForms(clubId) {
        return this.clubFormsService.findAllForms(clubId);
    }
    async findOneForm(clubId, formId) {
        return this.clubFormsService.findOneForm(clubId, formId);
    }
    async updateForm(clubId, formId, updateClubFormDto, user) {
        return this.clubFormsService.updateForm(clubId, formId, updateClubFormDto, user.id);
    }
    async removeForm(clubId, formId, user) {
        await this.clubFormsService.removeForm(clubId, formId, user.id);
    }
    async addQuestion(clubId, formId, createQuestionDto, user) {
        return this.clubFormsService.addQuestion(clubId, formId, createQuestionDto, user.id);
    }
    async updateQuestion(clubId, formId, questionId, updateQuestionDto, user) {
        return this.clubFormsService.updateQuestion(clubId, formId, questionId, updateQuestionDto, user.id);
    }
    async removeQuestion(clubId, formId, questionId, user) {
        await this.clubFormsService.removeQuestion(clubId, formId, questionId, user.id);
    }
    async submitResponse(clubId, formId, submitResponseDto, user) {
        return this.clubFormResponsesService.submitResponse(clubId, formId, submitResponseDto, user.id);
    }
    async findAllResponses(clubId, formId, user) {
        return this.clubFormResponsesService.findAllResponses(clubId, formId, user.id);
    }
    async findOneResponse(clubId, formId, responseId, user) {
        return this.clubFormResponsesService.findOneResponse(clubId, formId, responseId, user.id);
    }
    async reviewResponse(clubId, formId, responseId, reviewDto, user) {
        return this.clubFormResponsesService.reviewResponse(clubId, formId, responseId, reviewDto, user.id);
    }
};
exports.ClubFormsController = ClubFormsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.STUDENT),
    (0, policies_decorator_1.Policies)('clubId', 'club.manage_forms'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new club form' }),
    (0, swagger_1.ApiParam)({ name: 'clubId', description: 'Club ID' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Form created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Param)('clubId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_club_form_dto_1.CreateClubFormDto, Object]),
    __metadata("design:returntype", Promise)
], ClubFormsController.prototype, "createForm", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.STUDENT),
    (0, swagger_1.ApiOperation)({ summary: 'Get all forms for a club' }),
    (0, swagger_1.ApiParam)({ name: 'clubId', description: 'Club ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Forms retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Param)('clubId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClubFormsController.prototype, "findAllForms", null);
__decorate([
    (0, common_1.Get)(':formId'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.STUDENT),
    (0, swagger_1.ApiOperation)({ summary: 'Get form by ID with questions' }),
    (0, swagger_1.ApiParam)({ name: 'clubId', description: 'Club ID' }),
    (0, swagger_1.ApiParam)({ name: 'formId', description: 'Form ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Form retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Form not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Param)('clubId')),
    __param(1, (0, common_1.Param)('formId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ClubFormsController.prototype, "findOneForm", null);
__decorate([
    (0, common_1.Patch)(':formId'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.STUDENT),
    (0, policies_decorator_1.Policies)('clubId', 'club.manage_forms'),
    (0, swagger_1.ApiOperation)({ summary: 'Update club form' }),
    (0, swagger_1.ApiParam)({ name: 'clubId', description: 'Club ID' }),
    (0, swagger_1.ApiParam)({ name: 'formId', description: 'Form ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Form updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Form not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Param)('clubId')),
    __param(1, (0, common_1.Param)('formId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_club_form_dto_1.UpdateClubFormDto, Object]),
    __metadata("design:returntype", Promise)
], ClubFormsController.prototype, "updateForm", null);
__decorate([
    (0, common_1.Delete)(':formId'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.STUDENT),
    (0, policies_decorator_1.Policies)('clubId', 'club.manage_forms'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete club form' }),
    (0, swagger_1.ApiParam)({ name: 'clubId', description: 'Club ID' }),
    (0, swagger_1.ApiParam)({ name: 'formId', description: 'Form ID' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Form deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Form not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Param)('clubId')),
    __param(1, (0, common_1.Param)('formId')),
    __param(2, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ClubFormsController.prototype, "removeForm", null);
__decorate([
    (0, common_1.Post)(':formId/questions'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.STUDENT),
    (0, policies_decorator_1.Policies)('clubId', 'club.manage_forms'),
    (0, swagger_1.ApiOperation)({ summary: 'Add question to form' }),
    (0, swagger_1.ApiParam)({ name: 'clubId', description: 'Club ID' }),
    (0, swagger_1.ApiParam)({ name: 'formId', description: 'Form ID' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Question added successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Param)('clubId')),
    __param(1, (0, common_1.Param)('formId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_form_question_dto_1.CreateFormQuestionDto, Object]),
    __metadata("design:returntype", Promise)
], ClubFormsController.prototype, "addQuestion", null);
__decorate([
    (0, common_1.Patch)(':formId/questions/:questionId'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.STUDENT),
    (0, policies_decorator_1.Policies)('clubId', 'club.manage_forms'),
    (0, swagger_1.ApiOperation)({ summary: 'Update form question' }),
    (0, swagger_1.ApiParam)({ name: 'clubId', description: 'Club ID' }),
    (0, swagger_1.ApiParam)({ name: 'formId', description: 'Form ID' }),
    (0, swagger_1.ApiParam)({ name: 'questionId', description: 'Question ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Question updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Question not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Param)('clubId')),
    __param(1, (0, common_1.Param)('formId')),
    __param(2, (0, common_1.Param)('questionId')),
    __param(3, (0, common_1.Body)()),
    __param(4, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, update_form_question_dto_1.UpdateFormQuestionDto, Object]),
    __metadata("design:returntype", Promise)
], ClubFormsController.prototype, "updateQuestion", null);
__decorate([
    (0, common_1.Delete)(':formId/questions/:questionId'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.STUDENT),
    (0, policies_decorator_1.Policies)('clubId', 'club.manage_forms'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete form question' }),
    (0, swagger_1.ApiParam)({ name: 'clubId', description: 'Club ID' }),
    (0, swagger_1.ApiParam)({ name: 'formId', description: 'Form ID' }),
    (0, swagger_1.ApiParam)({ name: 'questionId', description: 'Question ID' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Question deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Question not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Param)('clubId')),
    __param(1, (0, common_1.Param)('formId')),
    __param(2, (0, common_1.Param)('questionId')),
    __param(3, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], ClubFormsController.prototype, "removeQuestion", null);
__decorate([
    (0, common_1.Post)(':formId/responses'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.STUDENT),
    (0, swagger_1.ApiOperation)({ summary: 'Submit form response' }),
    (0, swagger_1.ApiParam)({ name: 'clubId', description: 'Club ID' }),
    (0, swagger_1.ApiParam)({ name: 'formId', description: 'Form ID' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Response submitted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Response already exists' }),
    __param(0, (0, common_1.Param)('clubId')),
    __param(1, (0, common_1.Param)('formId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, submit_form_response_dto_1.SubmitFormResponseDto, Object]),
    __metadata("design:returntype", Promise)
], ClubFormsController.prototype, "submitResponse", null);
__decorate([
    (0, common_1.Get)(':formId/responses'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.STUDENT),
    (0, policies_decorator_1.Policies)('clubId', 'club.view_responses'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all responses for a form' }),
    (0, swagger_1.ApiParam)({ name: 'clubId', description: 'Club ID' }),
    (0, swagger_1.ApiParam)({ name: 'formId', description: 'Form ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Responses retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Param)('clubId')),
    __param(1, (0, common_1.Param)('formId')),
    __param(2, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ClubFormsController.prototype, "findAllResponses", null);
__decorate([
    (0, common_1.Get)(':formId/responses/:responseId'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.STUDENT),
    (0, policies_decorator_1.Policies)('clubId', 'club.view_responses'),
    (0, swagger_1.ApiOperation)({ summary: 'Get response by ID' }),
    (0, swagger_1.ApiParam)({ name: 'clubId', description: 'Club ID' }),
    (0, swagger_1.ApiParam)({ name: 'formId', description: 'Form ID' }),
    (0, swagger_1.ApiParam)({ name: 'responseId', description: 'Response ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Response retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Response not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Param)('clubId')),
    __param(1, (0, common_1.Param)('formId')),
    __param(2, (0, common_1.Param)('responseId')),
    __param(3, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], ClubFormsController.prototype, "findOneResponse", null);
__decorate([
    (0, common_1.Patch)(':formId/responses/:responseId/review'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.STUDENT),
    (0, policies_decorator_1.Policies)('clubId', 'club.review_responses'),
    (0, swagger_1.ApiOperation)({ summary: 'Review form response (approve/reject)' }),
    (0, swagger_1.ApiParam)({ name: 'clubId', description: 'Club ID' }),
    (0, swagger_1.ApiParam)({ name: 'formId', description: 'Form ID' }),
    (0, swagger_1.ApiParam)({ name: 'responseId', description: 'Response ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Response reviewed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Response not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Param)('clubId')),
    __param(1, (0, common_1.Param)('formId')),
    __param(2, (0, common_1.Param)('responseId')),
    __param(3, (0, common_1.Body)()),
    __param(4, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, review_form_response_dto_1.ReviewFormResponseDto, Object]),
    __metadata("design:returntype", Promise)
], ClubFormsController.prototype, "reviewResponse", null);
exports.ClubFormsController = ClubFormsController = __decorate([
    (0, swagger_1.ApiTags)('club-forms'),
    (0, common_1.Controller)('clubs/:clubId/forms'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, policies_guard_1.PoliciesGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [club_forms_service_1.ClubFormsService,
        club_form_responses_service_1.ClubFormResponsesService])
], ClubFormsController);
//# sourceMappingURL=club-forms.controller.js.map