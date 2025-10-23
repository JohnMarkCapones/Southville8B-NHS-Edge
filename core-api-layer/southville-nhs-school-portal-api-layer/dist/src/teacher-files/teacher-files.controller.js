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
exports.TeacherFilesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const supabase_auth_guard_1 = require("../auth/supabase-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const roles_decorator_2 = require("../auth/decorators/roles.decorator");
const auth_user_decorator_1 = require("../auth/auth-user.decorator");
const folder_service_1 = require("./services/folder.service");
const file_storage_service_1 = require("./services/file-storage.service");
const file_download_logger_service_1 = require("./services/file-download-logger.service");
const create_folder_dto_1 = require("./dto/create-folder.dto");
const update_folder_dto_1 = require("./dto/update-folder.dto");
const folder_query_dto_1 = require("./dto/folder-query.dto");
const update_file_dto_1 = require("./dto/update-file.dto");
const file_query_dto_1 = require("./dto/file-query.dto");
const teacher_folder_entity_1 = require("./entities/teacher-folder.entity");
const teacher_file_entity_1 = require("./entities/teacher-file.entity");
let TeacherFilesController = class TeacherFilesController {
    folderService;
    fileStorageService;
    fileDownloadLoggerService;
    constructor(folderService, fileStorageService, fileDownloadLoggerService) {
        this.folderService = folderService;
        this.fileStorageService = fileStorageService;
        this.fileDownloadLoggerService = fileDownloadLoggerService;
    }
    async getFolderTree(query, request) {
        return this.folderService.getFolderTree(query.includeDeleted, request.accessToken);
    }
    async getFolder(id) {
        return this.folderService.findOneWithFileCount(id);
    }
    async createFolder(createFolderDto, user) {
        return this.folderService.create(createFolderDto, user.id);
    }
    async updateFolder(id, updateFolderDto, user) {
        return this.folderService.update(id, updateFolderDto, user.id);
    }
    async deleteFolder(id, user) {
        return this.folderService.softDelete(id, user.id);
    }
    async restoreFolder(id) {
        return this.folderService.restore(id);
    }
    async getFiles(query) {
        return this.fileStorageService.findAll(query);
    }
    async getFile(id) {
        return this.fileStorageService.findOneWithDetails(id);
    }
    async uploadFile(request, user) {
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
                        filename: part.filename,
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
            if (!fields.folder_id) {
                throw new common_1.BadRequestException('folder_id is required');
            }
            if (!fields.title) {
                throw new common_1.BadRequestException('title is required');
            }
            return this.fileStorageService.uploadFile(fields.folder_id, fields.title, fileBuffer, fileData.filename, fileData.mimetype, user.id, fields.description);
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to upload file: ${error.message}`);
        }
    }
    async updateFile(id, updateFileDto, user) {
        return this.fileStorageService.update(id, updateFileDto, user.id);
    }
    async replaceFile(id, request, user) {
        try {
            const parts = request.parts();
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
                        filename: part.filename,
                        mimetype: part.mimetype,
                    };
                }
            }
            if (!fileData || !fileBuffer) {
                throw new common_1.BadRequestException('No file uploaded');
            }
            return this.fileStorageService.replaceFile(id, fileBuffer, fileData.filename, fileData.mimetype, user.id);
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to replace file: ${error.message}`);
        }
    }
    async deleteFile(id, user) {
        return this.fileStorageService.softDelete(id, user.id);
    }
    async restoreFile(id) {
        return this.fileStorageService.restore(id);
    }
    async getDownloadUrl(id, user, request) {
        const ipAddress = request.ip || request.headers['x-forwarded-for'] || '';
        const userAgent = request.headers['user-agent'] || '';
        await this.fileDownloadLoggerService.logDownload(id, user.id, ipAddress, userAgent, true);
        return this.fileStorageService.generateDownloadUrl(id, request.accessToken);
    }
    async getOverviewAnalytics() {
        return this.fileDownloadLoggerService.getOverallStats();
    }
    async getPopularFiles(limit) {
        return this.fileDownloadLoggerService.getPopularFiles(limit || 10);
    }
    async getFileDownloads(id) {
        const [downloads, stats] = await Promise.all([
            this.fileDownloadLoggerService.getFileDownloads(id),
            this.fileDownloadLoggerService.getFileStats(id),
        ]);
        return { downloads, stats };
    }
    async getMyDownloads(user) {
        return this.fileDownloadLoggerService.getUserDownloads(user.id);
    }
};
exports.TeacherFilesController = TeacherFilesController;
__decorate([
    (0, common_1.Get)('folders'),
    (0, roles_decorator_1.Roles)(roles_decorator_2.UserRole.ADMIN, roles_decorator_2.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get folder tree',
        description: 'Get hierarchical folder structure. Admins can include deleted folders.',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'includeDeleted',
        required: false,
        type: Boolean,
        description: 'Include deleted folders (Admin only)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Folder tree retrieved successfully',
        type: [teacher_folder_entity_1.TeacherFolderWithChildren],
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [folder_query_dto_1.FolderQueryDto, Object]),
    __metadata("design:returntype", Promise)
], TeacherFilesController.prototype, "getFolderTree", null);
__decorate([
    (0, common_1.Get)('folders/:id'),
    (0, roles_decorator_1.Roles)(roles_decorator_2.UserRole.ADMIN, roles_decorator_2.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get folder details with file count',
        description: 'Get detailed information about a specific folder',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Folder ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Folder retrieved successfully',
        type: teacher_folder_entity_1.TeacherFolderWithChildren,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Folder not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TeacherFilesController.prototype, "getFolder", null);
__decorate([
    (0, common_1.Post)('folders'),
    (0, roles_decorator_1.Roles)(roles_decorator_2.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Create new folder (Admin only)',
        description: 'Create a new folder in the file system',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Folder created successfully',
        type: teacher_folder_entity_1.TeacherFolder,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation failed' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_folder_dto_1.CreateFolderDto, Object]),
    __metadata("design:returntype", Promise)
], TeacherFilesController.prototype, "createFolder", null);
__decorate([
    (0, common_1.Put)('folders/:id'),
    (0, roles_decorator_1.Roles)(roles_decorator_2.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Update folder (Admin only)',
        description: 'Update folder name, description, or move to different parent',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Folder ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Folder updated successfully',
        type: teacher_folder_entity_1.TeacherFolder,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation failed' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Folder not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_folder_dto_1.UpdateFolderDto, Object]),
    __metadata("design:returntype", Promise)
], TeacherFilesController.prototype, "updateFolder", null);
__decorate([
    (0, common_1.Delete)('folders/:id'),
    (0, roles_decorator_1.Roles)(roles_decorator_2.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({
        summary: 'Soft delete folder (Admin only)',
        description: 'Mark folder as deleted. Cannot delete folders with children.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Folder ID' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Folder deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Folder has children' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Folder not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TeacherFilesController.prototype, "deleteFolder", null);
__decorate([
    (0, common_1.Post)('folders/:id/restore'),
    (0, roles_decorator_1.Roles)(roles_decorator_2.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Restore deleted folder (Admin only)',
        description: 'Restore a soft-deleted folder',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Folder ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Folder restored successfully',
        type: teacher_folder_entity_1.TeacherFolder,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Folder not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TeacherFilesController.prototype, "restoreFolder", null);
__decorate([
    (0, common_1.Get)('files'),
    (0, roles_decorator_1.Roles)(roles_decorator_2.UserRole.ADMIN, roles_decorator_2.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get files with filtering and pagination',
        description: 'Get list of files with optional filters',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'folderId',
        required: false,
        type: String,
        description: 'Filter by folder ID',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'search',
        required: false,
        type: String,
        description: 'Search in title and description',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'mimeType',
        required: false,
        type: String,
        description: 'Filter by MIME type',
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
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Files retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                files: { type: 'array', items: { $ref: '#/components/schemas/TeacherFile' } },
                total: { type: 'number' },
                page: { type: 'number' },
                limit: { type: 'number' },
                totalPages: { type: 'number' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [file_query_dto_1.FileQueryDto]),
    __metadata("design:returntype", Promise)
], TeacherFilesController.prototype, "getFiles", null);
__decorate([
    (0, common_1.Get)('files/:id'),
    (0, roles_decorator_1.Roles)(roles_decorator_2.UserRole.ADMIN, roles_decorator_2.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get file details',
        description: 'Get detailed information about a specific file',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'File ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'File retrieved successfully',
        type: teacher_file_entity_1.TeacherFileWithDetails,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'File not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TeacherFilesController.prototype, "getFile", null);
__decorate([
    (0, common_1.Post)('files'),
    (0, roles_decorator_1.Roles)(roles_decorator_2.UserRole.ADMIN),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        description: 'Upload file with metadata',
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'File to upload (max 50MB)',
                },
                folder_id: {
                    type: 'string',
                    format: 'uuid',
                    description: 'Folder ID',
                },
                title: {
                    type: 'string',
                    description: 'File title',
                },
                description: {
                    type: 'string',
                    description: 'File description',
                },
            },
            required: ['file', 'folder_id', 'title'],
        },
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Upload file (Admin only)',
        description: 'Upload a new file to a folder',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'File uploaded successfully',
        type: teacher_file_entity_1.TeacherFile,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation or file error' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TeacherFilesController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Put)('files/:id'),
    (0, roles_decorator_1.Roles)(roles_decorator_2.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Update file metadata (Admin only)',
        description: 'Update file title, description, or move to different folder',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'File ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'File updated successfully',
        type: teacher_file_entity_1.TeacherFile,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation failed' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'File not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_file_dto_1.UpdateFileDto, Object]),
    __metadata("design:returntype", Promise)
], TeacherFilesController.prototype, "updateFile", null);
__decorate([
    (0, common_1.Post)('files/:id/replace'),
    (0, roles_decorator_1.Roles)(roles_decorator_2.UserRole.ADMIN),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        description: 'Replace file content',
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'New file to replace existing one',
                },
            },
            required: ['file'],
        },
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Replace file content (Admin only)',
        description: 'Replace the actual file while keeping same metadata',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'File ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'File replaced successfully',
        type: teacher_file_entity_1.TeacherFile,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - file error' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'File not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], TeacherFilesController.prototype, "replaceFile", null);
__decorate([
    (0, common_1.Delete)('files/:id'),
    (0, roles_decorator_1.Roles)(roles_decorator_2.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({
        summary: 'Soft delete file (Admin only)',
        description: 'Mark file as deleted and move to .deleted/ in storage',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'File ID' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'File deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'File not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TeacherFilesController.prototype, "deleteFile", null);
__decorate([
    (0, common_1.Post)('files/:id/restore'),
    (0, roles_decorator_1.Roles)(roles_decorator_2.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Restore deleted file (Admin only)',
        description: 'Restore a soft-deleted file',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'File ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'File restored successfully',
        type: teacher_file_entity_1.TeacherFile,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'File not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TeacherFilesController.prototype, "restoreFile", null);
__decorate([
    (0, common_1.Get)('files/:id/download-url'),
    (0, roles_decorator_1.Roles)(roles_decorator_2.UserRole.ADMIN, roles_decorator_2.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get presigned download URL',
        description: 'Generate a temporary presigned URL to download the file (valid for 1 hour)',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'File ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Download URL generated successfully',
        schema: {
            type: 'object',
            properties: {
                url: { type: 'string', description: 'Presigned download URL' },
                expiresAt: { type: 'string', description: 'URL expiration timestamp' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'File not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], TeacherFilesController.prototype, "getDownloadUrl", null);
__decorate([
    (0, common_1.Get)('analytics/overview'),
    (0, roles_decorator_1.Roles)(roles_decorator_2.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Get overall download analytics (Admin only)',
        description: 'Get system-wide download statistics',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Analytics retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                totalDownloads: { type: 'number' },
                totalFiles: { type: 'number' },
                totalUsers: { type: 'number' },
                averageDownloadsPerFile: { type: 'number' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TeacherFilesController.prototype, "getOverviewAnalytics", null);
__decorate([
    (0, common_1.Get)('analytics/popular'),
    (0, roles_decorator_1.Roles)(roles_decorator_2.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Get most downloaded files (Admin only)',
        description: 'Get list of files sorted by download count',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Number of files to return (default: 10)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Popular files retrieved successfully',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    file_id: { type: 'string' },
                    download_count: { type: 'number' },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TeacherFilesController.prototype, "getPopularFiles", null);
__decorate([
    (0, common_1.Get)('files/:id/downloads'),
    (0, roles_decorator_1.Roles)(roles_decorator_2.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Get download history for file (Admin only)',
        description: 'Get complete download log for a specific file',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'File ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Download history retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                downloads: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/TeacherFileDownload' },
                },
                stats: {
                    type: 'object',
                    properties: {
                        totalDownloads: { type: 'number' },
                        uniqueUsers: { type: 'number' },
                        successRate: { type: 'number' },
                        lastDownloaded: { type: 'string' },
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TeacherFilesController.prototype, "getFileDownloads", null);
__decorate([
    (0, common_1.Get)('analytics/my-downloads'),
    (0, roles_decorator_1.Roles)(roles_decorator_2.UserRole.ADMIN, roles_decorator_2.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get my download history',
        description: 'Get download history for the authenticated user',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Download history retrieved successfully',
        type: Array,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeacherFilesController.prototype, "getMyDownloads", null);
exports.TeacherFilesController = TeacherFilesController = __decorate([
    (0, swagger_1.ApiTags)('Teacher Files'),
    (0, common_1.Controller)('teacher-files'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [folder_service_1.FolderService,
        file_storage_service_1.FileStorageService,
        file_download_logger_service_1.FileDownloadLoggerService])
], TeacherFilesController);
//# sourceMappingURL=teacher-files.controller.js.map