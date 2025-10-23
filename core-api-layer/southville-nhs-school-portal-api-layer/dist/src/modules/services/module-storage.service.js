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
var ModuleStorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleStorageService = void 0;
const common_1 = require("@nestjs/common");
const r2_storage_service_1 = require("../../storage/r2-storage/r2-storage.service");
const module_access_service_1 = require("./module-access.service");
const crypto = require("crypto");
const path = require("path");
let ModuleStorageService = ModuleStorageService_1 = class ModuleStorageService {
    r2StorageService;
    moduleAccessService;
    logger = new common_1.Logger(ModuleStorageService_1.name);
    constructor(r2StorageService, moduleAccessService) {
        this.r2StorageService = r2StorageService;
        this.moduleAccessService = moduleAccessService;
    }
    async uploadModuleFile(moduleId, fileName, fileBuffer, mimeType, uploadedBy) {
        try {
            if (!this.isValidFileType(mimeType)) {
                throw new common_1.BadRequestException(`File type ${mimeType} is not allowed`);
            }
            const filePath = `modules/${moduleId}/${fileName}`;
            const uploadResult = await this.r2StorageService.uploadFile(filePath, fileBuffer, mimeType);
            if (!uploadResult.success) {
                throw new common_1.BadRequestException('Failed to upload file to storage');
            }
            return {
                moduleId,
                fileName,
                fileSize: fileBuffer.length,
                mimeType,
                uploadedBy,
                filePath,
                publicUrl: uploadResult.publicUrl,
            };
        }
        catch (error) {
            this.logger.error('Error uploading module file:', error);
            throw error;
        }
    }
    async generateDownloadUrl(moduleId, fileName, userId) {
        try {
            const accessResult = await this.moduleAccessService.canStudentAccessModule(userId, moduleId);
            if (!accessResult.canAccess) {
                throw new common_1.BadRequestException(accessResult.reason || 'Access denied to this module');
            }
            const filePath = `modules/${moduleId}/${fileName}`;
            const downloadUrl = await this.r2StorageService.generatePresignedUrl(filePath, 'getObject');
            return {
                moduleId,
                fileName,
                filePath,
                downloadUrl,
                expiresAt: new Date(Date.now() + 3600000).toISOString(),
            };
        }
        catch (error) {
            this.logger.error('Error generating download URL:', error);
            throw error;
        }
    }
    async deleteModuleFile(moduleId, fileName, userId) {
        try {
            const isAdmin = await this.moduleAccessService.isAdmin(userId);
            if (!isAdmin) {
                throw new common_1.BadRequestException('Only admins can delete module files');
            }
            const filePath = `modules/${moduleId}/${fileName}`;
            const deleteResult = await this.r2StorageService.deleteFile(filePath);
            return deleteResult.success;
        }
        catch (error) {
            this.logger.error('Error deleting module file:', error);
            throw error;
        }
    }
    async listModuleFiles(moduleId) {
        try {
            const prefix = `modules/${moduleId}/`;
            const files = await this.r2StorageService.listFiles(prefix);
            return files.map((file) => file.replace(prefix, ''));
        }
        catch (error) {
            this.logger.error('Error listing module files:', error);
            return [];
        }
    }
    async getModuleFileInfo(moduleId, fileName) {
        try {
            const filePath = `modules/${moduleId}/${fileName}`;
            const fileInfo = await this.r2StorageService.getFileInfo(filePath);
            return {
                exists: fileInfo.exists,
                size: fileInfo.size,
                lastModified: fileInfo.lastModified,
                mimeType: fileInfo.mimeType,
            };
        }
        catch (error) {
            this.logger.error('Error getting module file info:', error);
            return { exists: false };
        }
    }
    isValidFileType(mimeType) {
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain',
            'text/csv',
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'video/mp4',
            'video/avi',
            'video/quicktime',
            'audio/mpeg',
            'audio/wav',
            'audio/mp4',
        ];
        return allowedTypes.includes(mimeType);
    }
    async getModuleStorageUsage(moduleId) {
        try {
            const prefix = `modules/${moduleId}/`;
            const files = await this.r2StorageService.listFiles(prefix);
            let totalSize = 0;
            const fileDetails = [];
            for (const filePath of files) {
                const fileInfo = await this.r2StorageService.getFileInfo(filePath);
                if (fileInfo.exists && fileInfo.size) {
                    totalSize += fileInfo.size;
                    fileDetails.push({
                        fileName: filePath.replace(prefix, ''),
                        size: fileInfo.size,
                        lastModified: fileInfo.lastModified || '',
                    });
                }
            }
            return {
                totalFiles: fileDetails.length,
                totalSize,
                files: fileDetails,
            };
        }
        catch (error) {
            this.logger.error('Error getting module storage usage:', error);
            return {
                totalFiles: 0,
                totalSize: 0,
                files: [],
            };
        }
    }
    async uploadModule(file, uploadedBy, isGlobal, subjectId, sectionId) {
        try {
            if (!this.isValidFileType(file.mimetype)) {
                throw new common_1.BadRequestException(`File type ${file.mimetype} is not allowed`);
            }
            const r2Key = this.generateR2Key(file.originalname, isGlobal, subjectId, sectionId);
            const uploadResult = await this.r2StorageService.uploadFile(r2Key, file.buffer, file.mimetype, {
                uploadedBy,
                isGlobal: isGlobal.toString(),
                subjectId: subjectId || '',
                sectionId: sectionId || '',
            });
            if (!uploadResult.success) {
                throw new common_1.BadRequestException('Failed to upload file to R2');
            }
            return {
                r2FileKey: r2Key,
                fileUrl: uploadResult.publicUrl || '',
                fileSize: file.size,
                mimeType: file.mimetype,
            };
        }
        catch (error) {
            this.logger.error('Error uploading module:', error);
            throw error;
        }
    }
    generateR2Key(fileName, isGlobal, subjectId, sectionId) {
        const uuid = crypto.randomUUID();
        const ext = path.extname(fileName);
        const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        if (isGlobal) {
            if (!subjectId) {
                throw new common_1.BadRequestException('Subject ID is required for global modules');
            }
            return `modules/global/${subjectId}/${uuid}-${sanitizedName}`;
        }
        else {
            if (!sectionId) {
                throw new common_1.BadRequestException('Section ID is required for section-specific modules');
            }
            return `modules/sections/${sectionId}/${uuid}-${sanitizedName}`;
        }
    }
};
exports.ModuleStorageService = ModuleStorageService;
exports.ModuleStorageService = ModuleStorageService = ModuleStorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [r2_storage_service_1.R2StorageService,
        module_access_service_1.ModuleAccessService])
], ModuleStorageService);
//# sourceMappingURL=module-storage.service.js.map