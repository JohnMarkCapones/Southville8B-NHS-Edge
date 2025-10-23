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
var FolderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FolderService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
let FolderService = FolderService_1 = class FolderService {
    supabaseService;
    logger = new common_1.Logger(FolderService_1.name);
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async findAll(includeDeleted = false, accessToken) {
        try {
            const client = accessToken
                ? this.supabaseService.getClientWithAuth(accessToken)
                : this.supabaseService.getClient();
            let query = client
                .from('teacher_folders')
                .select('*')
                .order('name', { ascending: true });
            if (!includeDeleted) {
                query = query.eq('is_deleted', false);
            }
            const { data, error } = await query;
            if (error) {
                this.logger.error('Error fetching folders:', error);
                throw new common_1.InternalServerErrorException('Failed to fetch folders: ' + error.message);
            }
            return data;
        }
        catch (error) {
            this.logger.error('Error in findAll:', error);
            throw error;
        }
    }
    async getFolderTree(includeDeleted = false, accessToken) {
        const folders = await this.findAll(includeDeleted, accessToken);
        return this.buildTree(folders);
    }
    buildTree(folders, parentId = null) {
        const tree = [];
        for (const folder of folders) {
            if (folder.parent_id === parentId) {
                const folderWithChildren = {
                    ...folder,
                    children: this.buildTree(folders, folder.id),
                };
                tree.push(folderWithChildren);
            }
        }
        return tree;
    }
    async findOne(id) {
        try {
            const { data, error } = await this.supabaseService
                .getClient()
                .from('teacher_folders')
                .select('*')
                .eq('id', id)
                .single();
            if (error) {
                if (error.code === 'PGRST116') {
                    throw new common_1.NotFoundException(`Folder with ID ${id} not found`);
                }
                this.logger.error('Error fetching folder:', error);
                throw new common_1.InternalServerErrorException('Failed to fetch folder: ' + error.message);
            }
            return data;
        }
        catch (error) {
            this.logger.error('Error in findOne:', error);
            throw error;
        }
    }
    async findOneWithFileCount(id) {
        const folder = await this.findOne(id);
        const { count, error } = await this.supabaseService
            .getClient()
            .from('teacher_files')
            .select('*', { count: 'exact', head: true })
            .eq('folder_id', id)
            .eq('is_deleted', false);
        if (error) {
            this.logger.warn('Error counting files:', error);
        }
        return {
            ...folder,
            file_count: count || 0,
        };
    }
    async create(createFolderDto, userId) {
        try {
            if (createFolderDto.parent_id) {
                await this.findOne(createFolderDto.parent_id);
            }
            const { data, error } = await this.supabaseService
                .getServiceClient()
                .from('teacher_folders')
                .insert({
                name: createFolderDto.name,
                description: createFolderDto.description,
                parent_id: createFolderDto.parent_id || null,
                created_by: userId,
                updated_by: userId,
            })
                .select()
                .single();
            if (error) {
                this.logger.error('Error creating folder:', error);
                throw new common_1.InternalServerErrorException('Failed to create folder: ' + error.message);
            }
            return data;
        }
        catch (error) {
            this.logger.error('Error in create:', error);
            throw error;
        }
    }
    async update(id, updateFolderDto, userId) {
        try {
            await this.findOne(id);
            if (updateFolderDto.parent_id) {
                if (updateFolderDto.parent_id === id) {
                    throw new common_1.BadRequestException('Folder cannot be its own parent');
                }
                await this.findOne(updateFolderDto.parent_id);
                const isDescendant = await this.isDescendantOf(updateFolderDto.parent_id, id);
                if (isDescendant) {
                    throw new common_1.BadRequestException('Cannot move folder to its own descendant');
                }
            }
            const updateData = {
                updated_by: userId,
            };
            if (updateFolderDto.name !== undefined) {
                updateData.name = updateFolderDto.name;
            }
            if (updateFolderDto.description !== undefined) {
                updateData.description = updateFolderDto.description;
            }
            if (updateFolderDto.parent_id !== undefined) {
                updateData.parent_id = updateFolderDto.parent_id;
            }
            const { data, error } = await this.supabaseService
                .getServiceClient()
                .from('teacher_folders')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();
            if (error) {
                this.logger.error('Error updating folder:', error);
                throw new common_1.InternalServerErrorException('Failed to update folder: ' + error.message);
            }
            return data;
        }
        catch (error) {
            this.logger.error('Error in update:', error);
            throw error;
        }
    }
    async softDelete(id, userId) {
        try {
            await this.findOne(id);
            const { data: children } = await this.supabaseService
                .getClient()
                .from('teacher_folders')
                .select('id')
                .eq('parent_id', id)
                .eq('is_deleted', false);
            if (children && children.length > 0) {
                throw new common_1.BadRequestException('Cannot delete folder with child folders. Delete children first.');
            }
            const { error } = await this.supabaseService
                .getServiceClient()
                .from('teacher_folders')
                .update({
                is_deleted: true,
                deleted_at: new Date().toISOString(),
                deleted_by: userId,
            })
                .eq('id', id);
            if (error) {
                this.logger.error('Error soft deleting folder:', error);
                throw new common_1.InternalServerErrorException('Failed to delete folder: ' + error.message);
            }
        }
        catch (error) {
            this.logger.error('Error in softDelete:', error);
            throw error;
        }
    }
    async restore(id) {
        try {
            const { data, error } = await this.supabaseService
                .getServiceClient()
                .from('teacher_folders')
                .update({
                is_deleted: false,
                deleted_at: null,
                deleted_by: null,
            })
                .eq('id', id)
                .select()
                .single();
            if (error) {
                if (error.code === 'PGRST116') {
                    throw new common_1.NotFoundException(`Folder with ID ${id} not found`);
                }
                this.logger.error('Error restoring folder:', error);
                throw new common_1.InternalServerErrorException('Failed to restore folder: ' + error.message);
            }
            return data;
        }
        catch (error) {
            this.logger.error('Error in restore:', error);
            throw error;
        }
    }
    async isDescendantOf(folderId, ancestorId) {
        let currentFolder = await this.findOne(folderId);
        while (currentFolder.parent_id) {
            if (currentFolder.parent_id === ancestorId) {
                return true;
            }
            currentFolder = await this.findOne(currentFolder.parent_id);
        }
        return false;
    }
};
exports.FolderService = FolderService;
exports.FolderService = FolderService = FolderService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], FolderService);
//# sourceMappingURL=folder.service.js.map