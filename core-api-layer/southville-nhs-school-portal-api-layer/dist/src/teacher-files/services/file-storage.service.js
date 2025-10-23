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
var FileStorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileStorageService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
const r2_storage_service_1 = require("../../storage/r2-storage/r2-storage.service");
const crypto = require("crypto");
const path = require("path");
let FileStorageService = FileStorageService_1 = class FileStorageService {
    supabaseService;
    r2StorageService;
    logger = new common_1.Logger(FileStorageService_1.name);
    MAX_FILE_SIZE = 50 * 1024 * 1024;
    ALLOWED_MIME_TYPES = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'application/msword',
        'application/vnd.ms-powerpoint',
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'text/csv',
    ];
    constructor(supabaseService, r2StorageService) {
        this.supabaseService = supabaseService;
        this.r2StorageService = r2StorageService;
    }
    async findAll(query) {
        try {
            const { folderId, search, mimeType, page = 1, limit = 20 } = query;
            const offset = (page - 1) * limit;
            let queryBuilder = this.supabaseService
                .getClient()
                .from('teacher_files')
                .select('*', { count: 'exact' })
                .eq('is_deleted', false);
            if (folderId) {
                queryBuilder = queryBuilder.eq('folder_id', folderId);
            }
            if (mimeType) {
                queryBuilder = queryBuilder.eq('mime_type', mimeType);
            }
            if (search) {
                queryBuilder = queryBuilder.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
            }
            queryBuilder = queryBuilder
                .range(offset, offset + limit - 1)
                .order('created_at', { ascending: false });
            const { data, error, count } = await queryBuilder;
            if (error) {
                this.logger.error('Error fetching files:', error);
                throw new common_1.InternalServerErrorException('Failed to fetch files: ' + error.message);
            }
            return {
                files: data,
                total: count || 0,
                page,
                limit,
                totalPages: Math.ceil((count || 0) / limit),
            };
        }
        catch (error) {
            this.logger.error('Error in findAll:', error);
            throw error;
        }
    }
    async findOne(id, accessToken) {
        try {
            const client = accessToken
                ? this.supabaseService.getClientWithAuth(accessToken)
                : this.supabaseService.getClient();
            const { data, error } = await client
                .from('teacher_files')
                .select('*')
                .eq('id', id)
                .single();
            if (error) {
                if (error.code === 'PGRST116') {
                    throw new common_1.NotFoundException(`File with ID ${id} not found`);
                }
                this.logger.error('Error fetching file:', error);
                throw new common_1.InternalServerErrorException('Failed to fetch file: ' + error.message);
            }
            return data;
        }
        catch (error) {
            this.logger.error('Error in findOne:', error);
            throw error;
        }
    }
    async findOneWithDetails(id) {
        try {
            const { data, error } = await this.supabaseService
                .getClient()
                .from('teacher_files')
                .select(`
          *,
          folder:teacher_folders!inner(id, name, parent_id),
          uploader:users!uploaded_by(id, full_name, email)
        `)
                .eq('id', id)
                .single();
            if (error) {
                if (error.code === 'PGRST116') {
                    throw new common_1.NotFoundException(`File with ID ${id} not found`);
                }
                this.logger.error('Error fetching file with details:', error);
                throw new common_1.InternalServerErrorException('Failed to fetch file: ' + error.message);
            }
            return data;
        }
        catch (error) {
            this.logger.error('Error in findOneWithDetails:', error);
            throw error;
        }
    }
    async uploadFile(folderId, title, fileBuffer, originalFilename, mimeType, userId, description) {
        try {
            if (fileBuffer.length > this.MAX_FILE_SIZE) {
                throw new common_1.BadRequestException(`File size exceeds maximum allowed size of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
            }
            if (!this.ALLOWED_MIME_TYPES.includes(mimeType)) {
                throw new common_1.BadRequestException(`File type ${mimeType} is not allowed`);
            }
            const { data: folder, error: folderError } = await this.supabaseService
                .getClient()
                .from('teacher_folders')
                .select('id')
                .eq('id', folderId)
                .eq('is_deleted', false)
                .single();
            if (folderError || !folder) {
                throw new common_1.NotFoundException(`Folder with ID ${folderId} not found`);
            }
            const r2Key = this.generateR2Key(folderId, originalFilename);
            const uploadResult = await this.r2StorageService.uploadFile(r2Key, fileBuffer, mimeType, {
                uploadedBy: userId,
                folderId,
                originalFilename,
            });
            if (!uploadResult.success) {
                throw new common_1.BadRequestException('Failed to upload file to storage');
            }
            const { data, error } = await this.supabaseService
                .getServiceClient()
                .from('teacher_files')
                .insert({
                folder_id: folderId,
                title,
                description,
                file_url: uploadResult.publicUrl || '',
                r2_file_key: r2Key,
                file_size_bytes: fileBuffer.length,
                mime_type: mimeType,
                original_filename: originalFilename,
                uploaded_by: userId,
                updated_by: userId,
            })
                .select()
                .single();
            if (error) {
                await this.r2StorageService.deleteFile(r2Key);
                this.logger.error('Error creating file record:', error);
                throw new common_1.InternalServerErrorException('Failed to create file record: ' + error.message);
            }
            return data;
        }
        catch (error) {
            this.logger.error('Error in uploadFile:', error);
            throw error;
        }
    }
    async update(id, updateFileDto, userId) {
        try {
            await this.findOne(id);
            if (updateFileDto.folder_id) {
                const { data: folder, error: folderError } = await this.supabaseService
                    .getClient()
                    .from('teacher_folders')
                    .select('id')
                    .eq('id', updateFileDto.folder_id)
                    .eq('is_deleted', false)
                    .single();
                if (folderError || !folder) {
                    throw new common_1.NotFoundException(`Folder with ID ${updateFileDto.folder_id} not found`);
                }
            }
            const updateData = {
                updated_by: userId,
            };
            if (updateFileDto.title !== undefined) {
                updateData.title = updateFileDto.title;
            }
            if (updateFileDto.description !== undefined) {
                updateData.description = updateFileDto.description;
            }
            if (updateFileDto.folder_id !== undefined) {
                updateData.folder_id = updateFileDto.folder_id;
            }
            const { data, error } = await this.supabaseService
                .getServiceClient()
                .from('teacher_files')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();
            if (error) {
                this.logger.error('Error updating file:', error);
                throw new common_1.InternalServerErrorException('Failed to update file: ' + error.message);
            }
            return data;
        }
        catch (error) {
            this.logger.error('Error in update:', error);
            throw error;
        }
    }
    async replaceFile(id, fileBuffer, originalFilename, mimeType, userId) {
        try {
            const existingFile = await this.findOne(id);
            if (fileBuffer.length > this.MAX_FILE_SIZE) {
                throw new common_1.BadRequestException(`File size exceeds maximum allowed size of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
            }
            if (!this.ALLOWED_MIME_TYPES.includes(mimeType)) {
                throw new common_1.BadRequestException(`File type ${mimeType} is not allowed`);
            }
            const newR2Key = this.generateR2Key(existingFile.folder_id, originalFilename);
            const uploadResult = await this.r2StorageService.uploadFile(newR2Key, fileBuffer, mimeType, {
                uploadedBy: userId,
                folderId: existingFile.folder_id,
                originalFilename,
                replacedFile: existingFile.r2_file_key,
            });
            if (!uploadResult.success) {
                throw new common_1.BadRequestException('Failed to upload replacement file');
            }
            await this.r2StorageService.deleteFile(existingFile.r2_file_key);
            const { data, error } = await this.supabaseService
                .getServiceClient()
                .from('teacher_files')
                .update({
                file_url: uploadResult.publicUrl || '',
                r2_file_key: newR2Key,
                file_size_bytes: fileBuffer.length,
                mime_type: mimeType,
                original_filename: originalFilename,
                updated_by: userId,
            })
                .eq('id', id)
                .select()
                .single();
            if (error) {
                await this.r2StorageService.deleteFile(newR2Key);
                this.logger.error('Error updating file record after replacement:', error);
                throw new common_1.InternalServerErrorException('Failed to update file record: ' + error.message);
            }
            return data;
        }
        catch (error) {
            this.logger.error('Error in replaceFile:', error);
            throw error;
        }
    }
    async softDelete(id, userId) {
        try {
            const file = await this.findOne(id);
            const { error } = await this.supabaseService
                .getServiceClient()
                .from('teacher_files')
                .update({
                is_deleted: true,
                deleted_at: new Date().toISOString(),
                deleted_by: userId,
            })
                .eq('id', id);
            if (error) {
                this.logger.error('Error soft deleting file:', error);
                throw new common_1.InternalServerErrorException('Failed to delete file: ' + error.message);
            }
        }
        catch (error) {
            this.logger.error('Error in softDelete:', error);
            throw error;
        }
    }
    async restore(id) {
        try {
            const { data: file, error: fetchError } = await this.supabaseService
                .getClient()
                .from('teacher_files')
                .select('*')
                .eq('id', id)
                .single();
            if (fetchError || !file) {
                throw new common_1.NotFoundException(`File with ID ${id} not found`);
            }
            if (!file.is_deleted) {
                throw new common_1.BadRequestException('File is not deleted');
            }
            const { data, error } = await this.supabaseService
                .getServiceClient()
                .from('teacher_files')
                .update({
                is_deleted: false,
                deleted_at: null,
                deleted_by: null,
            })
                .eq('id', id)
                .select()
                .single();
            if (error) {
                this.logger.error('Error restoring file:', error);
                throw new common_1.InternalServerErrorException('Failed to restore file: ' + error.message);
            }
            return data;
        }
        catch (error) {
            this.logger.error('Error in restore:', error);
            throw error;
        }
    }
    async generateDownloadUrl(fileId, accessToken) {
        try {
            const file = await this.findOne(fileId, accessToken);
            if (file.is_deleted) {
                throw new common_1.BadRequestException('Cannot download deleted file');
            }
            const url = await this.r2StorageService.generatePresignedUrl(file.r2_file_key, 'getObject');
            return {
                url,
                expiresAt: new Date(Date.now() + 3600000).toISOString(),
            };
        }
        catch (error) {
            this.logger.error('Error generating download URL:', error);
            throw error;
        }
    }
    generateR2Key(folderId, originalFilename) {
        const uuid = crypto.randomUUID();
        const ext = path.extname(originalFilename);
        const sanitizedName = originalFilename
            .replace(ext, '')
            .replace(/[^a-zA-Z0-9.-]/g, '_')
            .toLowerCase();
        return `teacher-files/${folderId}/${uuid}-${sanitizedName}${ext}`;
    }
    isValidMimeType(mimeType) {
        return this.ALLOWED_MIME_TYPES.includes(mimeType);
    }
};
exports.FileStorageService = FileStorageService;
exports.FileStorageService = FileStorageService = FileStorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService,
        r2_storage_service_1.R2StorageService])
], FileStorageService);
//# sourceMappingURL=file-storage.service.js.map