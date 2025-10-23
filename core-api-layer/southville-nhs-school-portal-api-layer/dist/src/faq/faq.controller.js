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
var FaqController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FaqController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const faq_service_1 = require("./faq.service");
const create_faq_dto_1 = require("./dto/create-faq.dto");
const update_faq_dto_1 = require("./dto/update-faq.dto");
const faq_entity_1 = require("./entities/faq.entity");
const supabase_auth_guard_1 = require("../auth/supabase-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const auth_user_decorator_1 = require("../auth/auth-user.decorator");
let FaqController = FaqController_1 = class FaqController {
    faqService;
    logger = new common_1.Logger(FaqController_1.name);
    constructor(faqService) {
        this.faqService = faqService;
    }
    async findAll(page, limit, search) {
        this.logger.log('Fetching FAQs (public)');
        return this.faqService.findAll({ page, limit, search });
    }
    async search(query) {
        this.logger.log(`Searching FAQs with query: ${query}`);
        return this.faqService.search(query);
    }
    async findOne(id) {
        this.logger.log(`Fetching FAQ ${id} (public)`);
        return this.faqService.findOne(id);
    }
    async create(createFaqDto, user) {
        this.logger.log(`Creating FAQ for user: ${user.email} (${user.id})`);
        return this.faqService.create(createFaqDto);
    }
    async update(id, updateFaqDto, user) {
        this.logger.log(`Updating FAQ ${id} for user: ${user.email} (${user.id})`);
        return this.faqService.update(id, updateFaqDto);
    }
    async remove(id, user) {
        this.logger.log(`Deleting FAQ ${id} for user: ${user.email} (${user.id})`);
        await this.faqService.remove(id);
        return { message: 'FAQ deleted successfully' };
    }
};
exports.FaqController = FaqController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all FAQs (Public)' }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        required: false,
        type: Number,
        description: 'Page number (default: 1)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Items per page (default: 10)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'search',
        required: false,
        type: String,
        description: 'Search in questions and answers',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'FAQs retrieved successfully',
    }),
    __param(0, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", Promise)
], FaqController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('search'),
    (0, swagger_1.ApiOperation)({ summary: 'Search FAQs (Public)' }),
    (0, swagger_1.ApiQuery)({
        name: 'q',
        required: true,
        type: String,
        description: 'Search query',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Search results retrieved successfully',
    }),
    __param(0, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FaqController.prototype, "search", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get FAQ by ID (Public)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'FAQ retrieved successfully',
        type: faq_entity_1.Faq,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'FAQ not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FaqController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Create FAQ (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'FAQ created successfully',
        type: faq_entity_1.Faq,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin access required',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request - Invalid input data' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_faq_dto_1.CreateFaqDto, Object]),
    __metadata("design:returntype", Promise)
], FaqController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Update FAQ (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'FAQ updated successfully',
        type: faq_entity_1.Faq,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin access required',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'FAQ not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request - Invalid input data' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_faq_dto_1.UpdateFaqDto, Object]),
    __metadata("design:returntype", Promise)
], FaqController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete FAQ (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'FAQ deleted successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin access required',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'FAQ not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FaqController.prototype, "remove", null);
exports.FaqController = FaqController = FaqController_1 = __decorate([
    (0, swagger_1.ApiTags)('FAQ'),
    (0, common_1.Controller)('faq'),
    __metadata("design:paramtypes", [faq_service_1.FaqService])
], FaqController);
//# sourceMappingURL=faq.controller.js.map