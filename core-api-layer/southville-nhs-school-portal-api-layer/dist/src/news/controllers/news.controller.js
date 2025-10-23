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
var NewsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const supabase_auth_guard_1 = require("../../auth/supabase-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const auth_user_decorator_1 = require("../../auth/auth-user.decorator");
const r2_storage_service_1 = require("../../storage/r2-storage/r2-storage.service");
const news_service_1 = require("../services/news.service");
const news_approval_service_1 = require("../services/news-approval.service");
const dto_1 = require("../dto");
const uuid_1 = require("uuid");
const path = require("path");
let NewsController = NewsController_1 = class NewsController {
    newsService;
    newsApprovalService;
    r2StorageService;
    logger = new common_1.Logger(NewsController_1.name);
    constructor(newsService, newsApprovalService, r2StorageService) {
        this.newsService = newsService;
        this.newsApprovalService = newsApprovalService;
        this.r2StorageService = r2StorageService;
    }
    async findAllPublic(categoryId, limit, offset) {
        return this.newsService.findAll({
            status: 'published',
            visibility: 'public',
            categoryId,
            limit: limit ? parseInt(limit.toString()) : 20,
            offset: offset ? parseInt(offset.toString()) : 0,
        });
    }
    async findBySlugPublic(slug) {
        return this.newsService.findBySlug(slug);
    }
    async create(createDto, userId) {
        return this.newsService.create(createDto, userId);
    }
    async uploadImage(request, userId) {
        try {
            this.logger.debug(`Processing image upload for user: ${userId}`);
            const parts = request.parts();
            let imageBuffer = null;
            let imageMimeType = null;
            let imageFilename = null;
            for await (const part of parts) {
                if (part.type === 'file' && part.fieldname === 'image') {
                    const validImageTypes = [
                        'image/jpeg',
                        'image/jpg',
                        'image/png',
                        'image/gif',
                        'image/webp',
                        'image/svg+xml',
                    ];
                    if (!validImageTypes.includes(part.mimetype)) {
                        throw new common_1.BadRequestException(`Invalid image type: ${part.mimetype}. Allowed types: JPG, PNG, GIF, WebP, SVG`);
                    }
                    const chunks = [];
                    for await (const chunk of part.file) {
                        chunks.push(chunk);
                    }
                    imageBuffer = Buffer.concat(chunks);
                    imageMimeType = part.mimetype;
                    imageFilename = part.filename;
                    this.logger.debug(`Image file received: ${imageFilename} (${imageMimeType}, ${imageBuffer.length} bytes)`);
                    break;
                }
            }
            if (!imageBuffer || !imageMimeType || !imageFilename) {
                throw new common_1.BadRequestException('No image file provided');
            }
            const maxSize = 10 * 1024 * 1024;
            if (imageBuffer.length > maxSize) {
                throw new common_1.BadRequestException(`Image too large: ${(imageBuffer.length / (1024 * 1024)).toFixed(2)}MB. Maximum allowed: 10MB`);
            }
            const ext = path.extname(imageFilename);
            const sanitizedName = imageFilename
                .replace(ext, '')
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '-')
                .replace(/-+/g, '-')
                .substring(0, 50);
            const uniqueId = (0, uuid_1.v4)();
            const finalFilename = `${uniqueId}-${sanitizedName}${ext}`;
            const fileKey = `news/images/${finalFilename}`;
            this.logger.debug(`Uploading image to R2: ${fileKey}`);
            const uploadResult = await this.r2StorageService.uploadFile(fileKey, imageBuffer, imageMimeType);
            if (!uploadResult.success) {
                this.logger.error(`R2 upload failed for ${fileKey}`);
                throw new common_1.BadRequestException('Failed to upload image to storage');
            }
            this.logger.log(`Image uploaded successfully: ${fileKey}`);
            return {
                url: uploadResult.publicUrl,
                fileName: imageFilename,
                fileSize: imageBuffer.length,
            };
        }
        catch (error) {
            this.logger.error('Error uploading image:', error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to upload image: ${error.message || 'Unknown error'}`);
        }
    }
    async findAll(status, visibility, categoryId, authorId, limit, offset) {
        return this.newsService.findAll({
            status,
            visibility,
            categoryId,
            authorId,
            limit: limit ? parseInt(limit.toString()) : 20,
            offset: offset ? parseInt(offset.toString()) : 0,
        });
    }
    async findMyArticles(userId) {
        return this.newsService.findMyArticles(userId);
    }
    async getPendingArticles(userId) {
        return this.newsApprovalService.getPendingArticles();
    }
    async findOne(id) {
        return this.newsService.findOne(id);
    }
    async update(id, updateDto, userId) {
        return this.newsService.update(id, updateDto, userId);
    }
    async remove(id, userId) {
        await this.newsService.remove(id, userId);
    }
    async submitForApproval(id, userId) {
        await this.newsApprovalService.submitForApproval(id, userId);
        return { message: 'Article submitted for approval successfully' };
    }
    async approve(id, approveDto, userId) {
        return this.newsApprovalService.approveArticle(id, userId, approveDto);
    }
    async reject(id, rejectDto, userId) {
        return this.newsApprovalService.rejectArticle(id, userId, rejectDto);
    }
    async publish(id, userId) {
        await this.newsApprovalService.publishArticle(id, userId);
        return { message: 'Article published successfully' };
    }
    async getApprovalHistory(id) {
        return this.newsApprovalService.getApprovalHistory(id);
    }
    async addCoAuthor(id, addCoAuthorDto, userId) {
        await this.newsService.addCoAuthor(id, addCoAuthorDto, userId);
        return { message: 'Co-author added successfully' };
    }
    async removeCoAuthor(id, coAuthorUserId, userId) {
        await this.newsService.removeCoAuthor(id, coAuthorUserId, userId);
    }
};
exports.NewsController = NewsController;
__decorate([
    (0, common_1.Get)('public'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all published news articles (public)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Articles retrieved successfully' }),
    (0, swagger_1.ApiQuery)({ name: 'categoryId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'offset', required: false, type: Number }),
    __param(0, (0, common_1.Query)('categoryId')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], NewsController.prototype, "findAllPublic", null);
__decorate([
    (0, common_1.Get)('public/slug/:slug'),
    (0, swagger_1.ApiOperation)({ summary: 'Get article by slug (public)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Article retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Article not found' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NewsController.prototype, "findBySlugPublic", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.STUDENT),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new article' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Article created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Not a journalism member or invalid position' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateNewsDto, String]),
    __metadata("design:returntype", Promise)
], NewsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('upload-image'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.STUDENT),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        description: 'Image file upload for Tiptap editor',
        schema: {
            type: 'object',
            properties: {
                image: {
                    type: 'string',
                    format: 'binary',
                    description: 'Image file (JPG, PNG, GIF, WebP, SVG)',
                },
            },
            required: ['image'],
        },
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Upload image for article content (Tiptap)' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Image uploaded successfully',
        schema: {
            type: 'object',
            properties: {
                url: { type: 'string', description: 'R2 public URL of uploaded image' },
                fileName: { type: 'string', description: 'Original file name' },
                fileSize: { type: 'number', description: 'File size in bytes' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - Invalid file type or upload failed' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Not a journalism member' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], NewsController.prototype, "uploadImage", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.STUDENT),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all articles (with filters)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Articles retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'visibility', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'categoryId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'authorId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'offset', required: false, type: Number }),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('visibility')),
    __param(2, (0, common_1.Query)('categoryId')),
    __param(3, (0, common_1.Query)('authorId')),
    __param(4, (0, common_1.Query)('limit')),
    __param(5, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], NewsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('my-articles'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.STUDENT),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get my own articles' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Articles retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, auth_user_decorator_1.AuthUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NewsController.prototype, "findMyArticles", null);
__decorate([
    (0, common_1.Get)('pending-approval'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all pending approval articles (Advisers only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pending articles retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Not an Adviser' }),
    __param(0, (0, auth_user_decorator_1.AuthUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NewsController.prototype, "getPendingArticles", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.STUDENT),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get article by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Article retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Article not found' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NewsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.STUDENT),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Update article' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Article updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Cannot edit this article' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Article not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_user_decorator_1.AuthUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateNewsDto, String]),
    __metadata("design:returntype", Promise)
], NewsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.STUDENT),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete article (soft delete)' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Article deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Cannot delete this article' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Article not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_user_decorator_1.AuthUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], NewsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.STUDENT),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit article for approval' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Article submitted for approval' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - Article not in draft status' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Not the author' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Article not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_user_decorator_1.AuthUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], NewsController.prototype, "submitForApproval", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve article (Advisers only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Article approved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - Article not pending' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Not an Adviser' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Article not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_user_decorator_1.AuthUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.ApproveNewsDto, String]),
    __metadata("design:returntype", Promise)
], NewsController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Reject article (Advisers only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Article rejected successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - Article not pending or missing remarks' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Not an Adviser' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Article not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_user_decorator_1.AuthUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.RejectNewsDto, String]),
    __metadata("design:returntype", Promise)
], NewsController.prototype, "reject", null);
__decorate([
    (0, common_1.Post)(':id/publish'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Publish article (Advisers only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Article published successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - Article not approved' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Not an Adviser' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Article not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_user_decorator_1.AuthUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], NewsController.prototype, "publish", null);
__decorate([
    (0, common_1.Get)(':id/approval-history'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.STUDENT),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get approval history for article' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Approval history retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NewsController.prototype, "getApprovalHistory", null);
__decorate([
    (0, common_1.Post)(':id/co-authors'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.STUDENT),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Add co-author to article' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Co-author added successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - User not journalism member' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Article not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'User already a co-author' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_user_decorator_1.AuthUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.AddCoAuthorDto, String]),
    __metadata("design:returntype", Promise)
], NewsController.prototype, "addCoAuthor", null);
__decorate([
    (0, common_1.Delete)(':id/co-authors/:coAuthorUserId'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.STUDENT),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Remove co-author from article' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Co-author removed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Article not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('coAuthorUserId')),
    __param(2, (0, auth_user_decorator_1.AuthUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], NewsController.prototype, "removeCoAuthor", null);
exports.NewsController = NewsController = NewsController_1 = __decorate([
    (0, swagger_1.ApiTags)('news'),
    (0, common_1.Controller)('news'),
    __metadata("design:paramtypes", [news_service_1.NewsService,
        news_approval_service_1.NewsApprovalService,
        r2_storage_service_1.R2StorageService])
], NewsController);
//# sourceMappingURL=news.controller.js.map