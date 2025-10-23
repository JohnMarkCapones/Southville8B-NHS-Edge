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
exports.ModulesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const supabase_auth_guard_1 = require("../auth/supabase-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const roles_decorator_2 = require("../auth/decorators/roles.decorator");
const auth_user_decorator_1 = require("../auth/auth-user.decorator");
const module_upload_throttle_guard_1 = require("./guards/module-upload-throttle.guard");
const modules_service_1 = require("./modules.service");
const update_module_dto_1 = require("./dto/update-module.dto");
const module_query_dto_1 = require("./dto/module-query.dto");
const assign_module_dto_1 = require("./dto/assign-module.dto");
const module_entity_1 = require("./entities/module.entity");
let ModulesController = class ModulesController {
    modulesService;
    constructor(modulesService) {
        this.modulesService = modulesService;
    }
    async create(request, user) {
        try {
            const parts = request.parts();
            const fields = {};
            let fileData = null;
            let fileBuffer = null;
            for await (const part of parts) {
                if (part.type === 'file') {
                    const chunks = [];
                    for await (const chunk of part.file) {
                        chunks.push(chunk);
                    }
                    fileBuffer = Buffer.concat(chunks);
                    fileData = {
                        fieldname: part.fieldname,
                        filename: part.filename,
                        encoding: part.encoding,
                        mimetype: part.mimetype,
                    };
                }
                else {
                    fields[part.fieldname] = part.value;
                }
            }
            if (!fileData || !fileBuffer) {
                throw new common_1.BadRequestException('No file uploaded');
            }
            const createModuleDto = {
                title: fields.title || '',
                description: fields.description,
                isGlobal: fields.isGlobal === 'true' || fields.isGlobal === true,
                subjectId: fields.subjectId,
                sectionIds: fields.sectionIds
                    ? Array.isArray(fields.sectionIds)
                        ? fields.sectionIds
                        : [fields.sectionIds]
                    : undefined,
            };
            if (createModuleDto.isGlobal && !createModuleDto.subjectId) {
                throw new common_1.BadRequestException('Subject ID is required for global modules');
            }
            if (!createModuleDto.isGlobal &&
                (!createModuleDto.sectionIds || createModuleDto.sectionIds.length === 0)) {
                throw new common_1.BadRequestException('Section IDs are required for section-specific modules');
            }
            const file = {
                fieldname: fileData.fieldname,
                originalname: fileData.filename,
                encoding: fileData.encoding,
                mimetype: fileData.mimetype,
                size: fileBuffer.length,
                buffer: fileBuffer,
                stream: null,
                destination: '',
                filename: fileData.filename,
                path: '',
            };
            return this.modulesService.createWithFile(createModuleDto, file, user.id);
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to create module: ${error.message}`);
        }
    }
    async uploadModule(id, request, user) {
        try {
            const parts = request.parts();
            const fields = {};
            let fileData = null;
            let fileBuffer = null;
            for await (const part of parts) {
                if (part.type === 'file') {
                    const chunks = [];
                    for await (const chunk of part.file) {
                        chunks.push(chunk);
                    }
                    fileBuffer = Buffer.concat(chunks);
                    fileData = {
                        fieldname: part.fieldname,
                        filename: part.filename,
                        encoding: part.encoding,
                        mimetype: part.mimetype,
                    };
                }
                else {
                    fields[part.fieldname] = part.value;
                }
            }
            if (!fileData || !fileBuffer) {
                throw new common_1.BadRequestException('No file uploaded');
            }
            const uploadModuleDto = {
                title: fields.title || '',
                description: fields.description,
                isGlobal: fields.isGlobal === 'true' || fields.isGlobal === true,
                subjectId: fields.subjectId,
                sectionIds: fields.sectionIds
                    ? Array.isArray(fields.sectionIds)
                        ? fields.sectionIds
                        : [fields.sectionIds]
                    : undefined,
            };
            const file = {
                fieldname: fileData.fieldname,
                originalname: fileData.filename,
                encoding: fileData.encoding,
                mimetype: fileData.mimetype,
                size: fileBuffer.length,
                buffer: fileBuffer,
                stream: null,
                destination: '',
                filename: fileData.filename,
                path: '',
            };
            return this.modulesService.uploadModule(id, file, uploadModuleDto, user.id);
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to upload module: ${error.message}`);
        }
    }
    async findAll(query, user) {
        return this.modulesService.findAccessibleModules(user.id, query);
    }
    async findAllAdmin(query, user) {
        return this.modulesService.findAll(query, user.id);
    }
    async findOne(id, user) {
        const module = await this.modulesService.findOne(id);
        if (!module) {
            throw new common_1.NotFoundException('Module not found');
        }
        return module;
    }
    async update(id, updateModuleDto, user) {
        return this.modulesService.update(id, updateModuleDto, user.id);
    }
    async remove(id, user) {
        return this.modulesService.remove(id, user.id);
    }
    async generateDownloadUrl(id, user) {
        return this.modulesService.generateDownloadUrl(id, user.id);
    }
    async assignModule(id, assignModuleDto, user) {
        return this.modulesService.assignModuleToSections(id, assignModuleDto.sectionIds, user.id);
    }
    async updateModuleAssignment(id, sectionId, updateDto, user) {
        return this.modulesService.updateModuleAssignment(id, sectionId, updateDto, user.id);
    }
};
exports.ModulesController = ModulesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(roles_decorator_2.UserRole.ADMIN, roles_decorator_2.UserRole.TEACHER),
    (0, common_1.UseGuards)(module_upload_throttle_guard_1.ModuleUploadThrottleGuard),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        description: 'Module data and file upload',
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Module file (PDF, PowerPoint, Word, or image)',
                },
                title: {
                    type: 'string',
                    description: 'Title of the module',
                    example: 'Introduction to Biology',
                },
                description: {
                    type: 'string',
                    description: 'Description of the module',
                    example: 'Basic concepts of biology for beginners',
                },
                isGlobal: {
                    type: 'boolean',
                    description: 'Whether this module is global (accessible to all teachers of the same subject)',
                    example: true,
                },
                subjectId: {
                    type: 'string',
                    format: 'uuid',
                    description: 'Subject ID - required if isGlobal is true',
                    example: '635fe7a9-bda5-4c80-91a8-8c89cf01ef47',
                },
                sectionIds: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'uuid',
                    },
                    description: 'Section IDs - required if isGlobal is false',
                    example: ['123e4567-e89b-12d3-a456-426614174000'],
                },
            },
            required: ['file', 'title'],
        },
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new module with file upload',
        description: 'Upload a new module file and create module record. Teachers can upload 10 modules per hour.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Module created successfully',
        type: module_entity_1.Module,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation failed' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - insufficient permissions',
    }),
    (0, swagger_1.ApiResponse)({
        status: 429,
        description: 'Too many requests - upload limit exceeded',
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ModulesController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/upload'),
    (0, roles_decorator_1.Roles)(roles_decorator_2.UserRole.ADMIN, roles_decorator_2.UserRole.TEACHER),
    (0, common_1.UseGuards)(module_upload_throttle_guard_1.ModuleUploadThrottleGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Upload a module file',
        description: 'Upload a file for an existing module. Teachers can only upload to their own modules.',
    }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        description: 'Module file and metadata',
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Module file (PDF, DOC, DOCX, etc.)',
                },
                title: { type: 'string', description: 'Module title' },
                description: { type: 'string', description: 'Module description' },
                isGlobal: { type: 'boolean', description: 'Whether module is global' },
                subjectId: {
                    type: 'string',
                    description: 'Subject ID for global modules',
                },
                sectionIds: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Section IDs for non-global modules',
                },
            },
        },
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Module ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'File uploaded successfully',
        schema: {
            type: 'object',
            properties: {
                module: { $ref: '#/components/schemas/Module' },
                uploadResult: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        key: { type: 'string' },
                        publicUrl: { type: 'string' },
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation failed' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - insufficient permissions',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Module not found' }),
    (0, swagger_1.ApiResponse)({
        status: 429,
        description: 'Too many requests - upload limit exceeded',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ModulesController.prototype, "uploadModule", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(roles_decorator_2.UserRole.ADMIN, roles_decorator_2.UserRole.TEACHER, roles_decorator_2.UserRole.STUDENT),
    (0, swagger_1.ApiOperation)({
        summary: 'Get accessible modules',
        description: 'Get modules accessible to the current user based on their role and permissions.',
    }),
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
        name: 'search',
        required: false,
        type: String,
        description: 'Search term',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'subjectId',
        required: false,
        type: String,
        description: 'Filter by subject ID',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'sectionId',
        required: false,
        type: String,
        description: 'Filter by section ID',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'isGlobal',
        required: false,
        type: Boolean,
        description: 'Filter by global modules',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'uploadedBy',
        required: false,
        type: String,
        description: 'Filter by uploader ID',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'includeDeleted',
        required: false,
        type: Boolean,
        description: 'Include deleted modules',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'sortBy',
        required: false,
        type: String,
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
        description: 'Modules retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                modules: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/ModuleWithDetails' },
                },
                total: { type: 'number' },
                page: { type: 'number' },
                limit: { type: 'number' },
                totalPages: { type: 'number' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - insufficient permissions',
    }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [module_query_dto_1.ModuleQueryDto, Object]),
    __metadata("design:returntype", Promise)
], ModulesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('admin'),
    (0, roles_decorator_1.Roles)(roles_decorator_2.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all modules (Admin only)',
        description: 'Get all modules with full access for administrators.',
    }),
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
        name: 'search',
        required: false,
        type: String,
        description: 'Search term',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'subjectId',
        required: false,
        type: String,
        description: 'Filter by subject ID',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'sectionId',
        required: false,
        type: String,
        description: 'Filter by section ID',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'isGlobal',
        required: false,
        type: Boolean,
        description: 'Filter by global modules',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'uploadedBy',
        required: false,
        type: String,
        description: 'Filter by uploader ID',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'includeDeleted',
        required: false,
        type: Boolean,
        description: 'Include deleted modules',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'sortBy',
        required: false,
        type: String,
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
        description: 'All modules retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                modules: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/ModuleWithDetails' },
                },
                total: { type: 'number' },
                page: { type: 'number' },
                limit: { type: 'number' },
                totalPages: { type: 'number' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin access required',
    }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [module_query_dto_1.ModuleQueryDto, Object]),
    __metadata("design:returntype", Promise)
], ModulesController.prototype, "findAllAdmin", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(roles_decorator_2.UserRole.ADMIN, roles_decorator_2.UserRole.TEACHER, roles_decorator_2.UserRole.STUDENT),
    (0, swagger_1.ApiOperation)({
        summary: 'Get a module by ID',
        description: 'Get a specific module by its ID. Access is controlled by user permissions.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Module ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Module retrieved successfully',
        type: module_entity_1.ModuleWithDetails,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - insufficient permissions',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Module not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ModulesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)(roles_decorator_2.UserRole.ADMIN, roles_decorator_2.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({
        summary: 'Update a module',
        description: 'Update module information. Teachers can only update their own modules.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Module ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Module updated successfully',
        type: module_entity_1.Module,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation failed' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - insufficient permissions',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Module not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_module_dto_1.UpdateModuleDto, Object]),
    __metadata("design:returntype", Promise)
], ModulesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(roles_decorator_2.UserRole.ADMIN, roles_decorator_2.UserRole.TEACHER),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete a module',
        description: 'Soft delete a module. Teachers can only delete their own modules.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Module ID' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Module deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - insufficient permissions',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Module not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ModulesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/download'),
    (0, roles_decorator_1.Roles)(roles_decorator_2.UserRole.ADMIN, roles_decorator_2.UserRole.TEACHER, roles_decorator_2.UserRole.STUDENT),
    (0, swagger_1.ApiOperation)({
        summary: 'Generate download URL for a module',
        description: 'Generate a presigned URL for downloading a module file. Access is controlled by user permissions.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Module ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Download URL generated successfully',
        schema: {
            type: 'object',
            properties: {
                downloadUrl: { type: 'string', description: 'Presigned download URL' },
                expiresAt: { type: 'string', description: 'URL expiration timestamp' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - insufficient permissions',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Module not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Module file not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ModulesController.prototype, "generateDownloadUrl", null);
__decorate([
    (0, common_1.Post)(':id/assign'),
    (0, roles_decorator_1.Roles)(roles_decorator_2.UserRole.ADMIN, roles_decorator_2.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({
        summary: 'Assign module to sections',
        description: 'Assign a module to specific sections. Teachers can only assign their own modules.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Module ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Module assigned to sections successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation failed' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - insufficient permissions',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Module not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assign_module_dto_1.AssignModuleDto, Object]),
    __metadata("design:returntype", Promise)
], ModulesController.prototype, "assignModule", null);
__decorate([
    (0, common_1.Put)(':id/sections/:sectionId'),
    (0, roles_decorator_1.Roles)(roles_decorator_2.UserRole.ADMIN, roles_decorator_2.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({
        summary: 'Update module assignment visibility',
        description: 'Update the visibility of a module assignment to a specific section.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Module ID' }),
    (0, swagger_1.ApiParam)({ name: 'sectionId', description: 'Section ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Module assignment updated successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation failed' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - insufficient permissions',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Module or section not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('sectionId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, assign_module_dto_1.UpdateModuleAssignmentDto, Object]),
    __metadata("design:returntype", Promise)
], ModulesController.prototype, "updateModuleAssignment", null);
exports.ModulesController = ModulesController = __decorate([
    (0, swagger_1.ApiTags)('Modules'),
    (0, common_1.Controller)('modules'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [modules_service_1.ModulesService])
], ModulesController);
//# sourceMappingURL=modules.controller.js.map