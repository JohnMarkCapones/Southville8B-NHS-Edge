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
var AnnouncementsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnouncementsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const announcements_service_1 = require("./announcements.service");
const create_announcement_dto_1 = require("./dto/create-announcement.dto");
const update_announcement_dto_1 = require("./dto/update-announcement.dto");
const create_tag_dto_1 = require("./dto/create-tag.dto");
const update_tag_dto_1 = require("./dto/update-tag.dto");
const announcement_entity_1 = require("./entities/announcement.entity");
const tag_entity_1 = require("./entities/tag.entity");
const supabase_auth_guard_1 = require("../auth/supabase-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const create_user_dto_1 = require("../users/dto/create-user.dto");
const auth_user_decorator_1 = require("../auth/auth-user.decorator");
const audit_interceptor_1 = require("./audit.interceptor");
let AnnouncementsController = AnnouncementsController_1 = class AnnouncementsController {
    announcementsService;
    logger = new common_1.Logger(AnnouncementsController_1.name);
    constructor(announcementsService) {
        this.announcementsService = announcementsService;
    }
    async create(createAnnouncementDto, user) {
        this.logger.log(`Creating announcement for user: ${user.id}`);
        return this.announcementsService.create(createAnnouncementDto, user.id);
    }
    async findAll(page, limit, visibility, type, roleId, includeExpired) {
        const filters = {
            page,
            limit,
            visibility,
            type,
            roleId,
            includeExpired,
        };
        return this.announcementsService.findAll(filters);
    }
    async getMyAnnouncements(user, page, limit, includeExpired) {
        const filters = {
            page,
            limit,
            includeExpired,
        };
        return this.announcementsService.getAnnouncementsForUser(user.id, user.roleId, filters);
    }
    async findOne(id) {
        return this.announcementsService.findOne(id);
    }
    async update(id, updateAnnouncementDto, user) {
        this.logger.log(`Updating announcement ${id} for user: ${user.id}`);
        return this.announcementsService.update(id, updateAnnouncementDto, user.id, user.role);
    }
    async remove(id) {
        this.logger.log(`Deleting announcement ${id}`);
        await this.announcementsService.remove(id);
        return { message: 'Announcement deleted successfully' };
    }
    async createTag(createTagDto) {
        this.logger.log(`Creating tag: ${createTagDto.name}`);
        return this.announcementsService.createTag(createTagDto);
    }
    async findAllTags() {
        return this.announcementsService.findAllTags();
    }
    async updateTag(id, updateTagDto) {
        this.logger.log(`Updating tag ${id}`);
        return this.announcementsService.updateTag(id, updateTagDto);
    }
    async removeTag(id) {
        this.logger.log(`Deleting tag ${id}`);
        await this.announcementsService.removeTag(id);
        return { message: 'Tag deleted successfully' };
    }
};
exports.AnnouncementsController = AnnouncementsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN, create_user_dto_1.UserRole.TEACHER),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new announcement (Admin/Teacher only)' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Announcement created successfully',
        type: announcement_entity_1.Announcement,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request - Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_announcement_dto_1.CreateAnnouncementDto, Object]),
    __metadata("design:returntype", Promise)
], AnnouncementsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all announcements with pagination and filtering',
    }),
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
        name: 'visibility',
        required: false,
        enum: ['public', 'private'],
        description: 'Filter by visibility',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'type',
        required: false,
        type: String,
        description: 'Filter by announcement type',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'roleId',
        required: false,
        type: String,
        description: 'Filter by target role ID',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'includeExpired',
        required: false,
        type: Boolean,
        description: 'Include expired announcements (default: false)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Announcements retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('visibility')),
    __param(3, (0, common_1.Query)('type')),
    __param(4, (0, common_1.Query)('roleId')),
    __param(5, (0, common_1.Query)('includeExpired', new common_1.DefaultValuePipe(false), common_1.ParseBoolPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String, Boolean]),
    __metadata("design:returntype", Promise)
], AnnouncementsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('my-announcements'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN, create_user_dto_1.UserRole.TEACHER, create_user_dto_1.UserRole.STUDENT),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: "Get announcements targeted to current user's role",
    }),
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
        name: 'includeExpired',
        required: false,
        type: Boolean,
        description: 'Include expired announcements (default: false)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User announcements retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __param(3, (0, common_1.Query)('includeExpired', new common_1.DefaultValuePipe(false), common_1.ParseBoolPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, Boolean]),
    __metadata("design:returntype", Promise)
], AnnouncementsController.prototype, "getMyAnnouncements", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get announcement by ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Announcement retrieved successfully',
        type: announcement_entity_1.Announcement,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Announcement not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AnnouncementsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN, create_user_dto_1.UserRole.TEACHER),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Update announcement (Admin or Teacher if owner)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Announcement updated successfully',
        type: announcement_entity_1.Announcement,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request - Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Can only update own announcements',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Announcement not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_announcement_dto_1.UpdateAnnouncementDto, Object]),
    __metadata("design:returntype", Promise)
], AnnouncementsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete announcement (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Announcement deleted successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin only' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Announcement not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AnnouncementsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('tags'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new tag (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Tag created successfully',
        type: tag_entity_1.Tag,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad Request - Invalid input data or tag name already exists',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin only' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_tag_dto_1.CreateTagDto]),
    __metadata("design:returntype", Promise)
], AnnouncementsController.prototype, "createTag", null);
__decorate([
    (0, common_1.Get)('tags'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all tags' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Tags retrieved successfully',
        type: [tag_entity_1.Tag],
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnnouncementsController.prototype, "findAllTags", null);
__decorate([
    (0, common_1.Patch)('tags/:id'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Update tag (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Tag updated successfully',
        type: tag_entity_1.Tag,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad Request - Invalid input data or tag name already exists',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin only' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tag not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_tag_dto_1.UpdateTagDto]),
    __metadata("design:returntype", Promise)
], AnnouncementsController.prototype, "updateTag", null);
__decorate([
    (0, common_1.Delete)('tags/:id'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete tag (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tag deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin only' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tag not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AnnouncementsController.prototype, "removeTag", null);
exports.AnnouncementsController = AnnouncementsController = AnnouncementsController_1 = __decorate([
    (0, swagger_1.ApiTags)('Announcements'),
    (0, common_1.Controller)('announcements'),
    (0, common_1.UseInterceptors)(audit_interceptor_1.AuditInterceptor),
    __metadata("design:paramtypes", [announcements_service_1.AnnouncementsService])
], AnnouncementsController);
//# sourceMappingURL=announcements.controller.js.map