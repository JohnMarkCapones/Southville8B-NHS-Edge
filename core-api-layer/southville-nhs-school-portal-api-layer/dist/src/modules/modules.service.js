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
var ModulesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModulesService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
const module_storage_service_1 = require("./services/module-storage.service");
const module_access_service_1 = require("./services/module-access.service");
const module_download_logger_service_1 = require("./services/module-download-logger.service");
let ModulesService = ModulesService_1 = class ModulesService {
    supabaseService;
    moduleStorageService;
    moduleAccessService;
    moduleDownloadLoggerService;
    logger = new common_1.Logger(ModulesService_1.name);
    constructor(supabaseService, moduleStorageService, moduleAccessService, moduleDownloadLoggerService) {
        this.supabaseService = supabaseService;
        this.moduleStorageService = moduleStorageService;
        this.moduleAccessService = moduleAccessService;
        this.moduleDownloadLoggerService = moduleDownloadLoggerService;
    }
    async create(createModuleDto, uploadedBy) {
        try {
            if (createModuleDto.isGlobal && !createModuleDto.subjectId) {
                throw new common_1.BadRequestException('Subject ID is required for global modules');
            }
            if (!createModuleDto.isGlobal &&
                (!createModuleDto.sectionIds || createModuleDto.sectionIds.length === 0)) {
                throw new common_1.BadRequestException('Section IDs are required for non-global modules');
            }
            const { data: module, error } = await this.supabaseService
                .getServiceClient()
                .from('modules')
                .insert({
                title: createModuleDto.title,
                description: createModuleDto.description,
                is_global: createModuleDto.isGlobal || false,
                subject_id: createModuleDto.subjectId,
                uploaded_by: uploadedBy,
            })
                .select()
                .single();
            if (error) {
                this.logger.error('Failed to create module:', error);
                throw new common_1.BadRequestException('Failed to create module');
            }
            if (!createModuleDto.isGlobal && createModuleDto.sectionIds) {
                await this.assignModuleToSections(module.id, createModuleDto.sectionIds, uploadedBy);
            }
            this.logger.log(`Module created successfully: ${module.id}`);
            return module;
        }
        catch (error) {
            this.logger.error('Error creating module:', error);
            throw error;
        }
    }
    async createWithFile(createModuleDto, file, uploadedBy) {
        try {
            if (createModuleDto.isGlobal && !createModuleDto.subjectId) {
                throw new common_1.BadRequestException('Subject ID is required for global modules');
            }
            if (!createModuleDto.isGlobal &&
                (!createModuleDto.sectionIds || createModuleDto.sectionIds.length === 0)) {
                throw new common_1.BadRequestException('Section IDs are required for non-global modules');
            }
            const uploadResult = await this.moduleStorageService.uploadModule(file, uploadedBy, createModuleDto.isGlobal || false, createModuleDto.subjectId, createModuleDto.sectionIds?.[0]);
            const { data: module, error } = await this.supabaseService
                .getServiceClient()
                .from('modules')
                .insert({
                title: createModuleDto.title,
                description: createModuleDto.description,
                is_global: createModuleDto.isGlobal || false,
                subject_id: createModuleDto.subjectId,
                uploaded_by: uploadedBy,
                file_url: uploadResult.fileUrl,
                r2_file_key: uploadResult.r2FileKey,
                file_size_bytes: uploadResult.fileSize,
                mime_type: uploadResult.mimeType,
            })
                .select()
                .single();
            if (error) {
                this.logger.error('Failed to create module:', error);
                throw new common_1.BadRequestException('Failed to create module');
            }
            if (!createModuleDto.isGlobal && createModuleDto.sectionIds) {
                await this.assignModuleToSections(module.id, createModuleDto.sectionIds, uploadedBy);
            }
            this.logger.log(`Module with file created successfully: ${module.id}`);
            return module;
        }
        catch (error) {
            this.logger.error('Error creating module with file:', error);
            throw error;
        }
    }
    async uploadModule(moduleId, file, uploadModuleDto, uploadedBy) {
        try {
            const module = await this.findOne(moduleId);
            if (!module) {
                throw new common_1.NotFoundException('Module not found');
            }
            const canUpload = await this.canUserUploadToModule(module, uploadedBy);
            if (!canUpload) {
                throw new common_1.ForbiddenException('You do not have permission to upload to this module');
            }
            const uploadResult = await this.moduleStorageService.uploadModuleFile(moduleId, file.originalname, file.buffer, file.mimetype, uploadedBy);
            const { data: updatedModule, error } = await this.supabaseService
                .getServiceClient()
                .from('modules')
                .update({
                file_url: uploadResult.publicUrl,
                r2_file_key: uploadResult.filePath,
                file_size_bytes: uploadResult.fileSize,
                mime_type: uploadResult.mimeType,
                title: uploadModuleDto.title || module.title,
                description: uploadModuleDto.description || module.description,
                is_global: uploadModuleDto.isGlobal !== undefined
                    ? uploadModuleDto.isGlobal
                    : module.is_global,
                subject_id: uploadModuleDto.subjectId || module.subject_id,
            })
                .eq('id', moduleId)
                .select()
                .single();
            if (error) {
                this.logger.error('Failed to update module with file info:', error);
                throw new common_1.BadRequestException('Failed to update module with file information');
            }
            if (uploadModuleDto.sectionIds && uploadModuleDto.sectionIds.length > 0) {
                await this.supabaseService
                    .getServiceClient()
                    .from('section_modules')
                    .delete()
                    .eq('module_id', moduleId);
                await this.assignModuleToSections(moduleId, uploadModuleDto.sectionIds, uploadedBy);
            }
            this.logger.log(`Module file uploaded successfully: ${moduleId}`);
            return {
                module: updatedModule,
                uploadResult,
            };
        }
        catch (error) {
            this.logger.error('Error uploading module file:', error);
            throw error;
        }
    }
    async findAll(query, userId) {
        try {
            const { page = 1, limit = 10, search, subjectId, sectionId, isGlobal, uploadedBy, includeDeleted = false, sortBy = 'created_at', sortOrder = 'desc', } = query;
            let queryBuilder = this.supabaseService.getClient().from('modules')
                .select(`
          *,
          uploader:uploaded_by(id, full_name, email),
          subject:subject_id(id, subject_name, description),
          sections:section_modules(
            section:section_id(id, name, grade_level)
          )
        `);
            if (!includeDeleted) {
                queryBuilder = queryBuilder.eq('is_deleted', false);
            }
            if (search) {
                queryBuilder = queryBuilder.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
            }
            if (subjectId) {
                queryBuilder = queryBuilder.eq('subject_id', subjectId);
            }
            if (isGlobal !== undefined) {
                queryBuilder = queryBuilder.eq('is_global', isGlobal);
            }
            if (uploadedBy) {
                queryBuilder = queryBuilder.eq('uploaded_by', uploadedBy);
            }
            if (sectionId) {
                queryBuilder = queryBuilder.eq('section_modules.section_id', sectionId);
            }
            queryBuilder = queryBuilder.order(sortBy, {
                ascending: sortOrder === 'asc',
            });
            const from = (page - 1) * limit;
            const to = from + limit - 1;
            queryBuilder = queryBuilder.range(from, to);
            const { data: modules, error, count } = await queryBuilder;
            if (error) {
                this.logger.error('Failed to fetch modules:', error);
                throw new common_1.BadRequestException('Failed to fetch modules');
            }
            const modulesWithStats = await Promise.all((modules || []).map(async (module) => {
                const downloadStats = await this.moduleDownloadLoggerService.getModuleDownloadStats(module.id);
                return {
                    ...module,
                    downloadStats,
                };
            }));
            const totalPages = Math.ceil((count || 0) / limit);
            return {
                modules: modulesWithStats,
                total: count || 0,
                page,
                limit,
                totalPages,
            };
        }
        catch (error) {
            this.logger.error('Error fetching modules:', error);
            throw error;
        }
    }
    async findOne(id) {
        try {
            const { data: module, error } = await this.supabaseService
                .getServiceClient()
                .from('modules')
                .select(`
          *,
          uploader:uploaded_by(id, full_name, email),
          subject:subject_id(id, subject_name, description),
          sections:section_modules(
            section:section_id(id, name, grade_level)
          )
        `)
                .eq('id', id)
                .single();
            if (error) {
                if (error.code === 'PGRST116') {
                    return null;
                }
                this.logger.error('Failed to fetch module:', error);
                throw new common_1.BadRequestException('Failed to fetch module');
            }
            return module;
        }
        catch (error) {
            this.logger.error('Error fetching module:', error);
            throw error;
        }
    }
    async update(id, updateModuleDto, userId) {
        try {
            const module = await this.findOne(id);
            if (!module) {
                throw new common_1.NotFoundException('Module not found');
            }
            const canUpdate = await this.canUserUpdateModule(module, userId);
            if (!canUpdate) {
                throw new common_1.ForbiddenException('You do not have permission to update this module');
            }
            const updateData = {
                title: updateModuleDto.title,
                description: updateModuleDto.description,
                is_global: updateModuleDto.isGlobal,
                subject_id: updateModuleDto.subjectId,
            };
            const { data: updatedModule, error } = await this.supabaseService
                .getServiceClient()
                .from('modules')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();
            if (error) {
                this.logger.error('Failed to update module:', error);
                throw new common_1.BadRequestException('Failed to update module');
            }
            if (updateModuleDto.sectionIds) {
                await this.supabaseService
                    .getServiceClient()
                    .from('section_modules')
                    .delete()
                    .eq('module_id', id);
                if (updateModuleDto.sectionIds.length > 0) {
                    await this.assignModuleToSections(id, updateModuleDto.sectionIds, userId);
                }
            }
            this.logger.log(`Module updated successfully: ${id}`);
            return updatedModule;
        }
        catch (error) {
            this.logger.error('Error updating module:', error);
            throw error;
        }
    }
    async remove(id, userId) {
        try {
            const module = await this.findOne(id);
            if (!module) {
                throw new common_1.NotFoundException('Module not found');
            }
            const canDelete = await this.canUserDeleteModule(module, userId);
            if (!canDelete) {
                throw new common_1.ForbiddenException('You do not have permission to delete this module');
            }
            const { error } = await this.supabaseService
                .getServiceClient()
                .from('modules')
                .update({
                is_deleted: true,
                deleted_at: new Date().toISOString(),
                deleted_by: userId,
            })
                .eq('id', id);
            if (error) {
                this.logger.error('Failed to delete module:', error);
                throw new common_1.BadRequestException('Failed to delete module');
            }
            this.logger.log(`Module soft deleted successfully: ${id}`);
        }
        catch (error) {
            this.logger.error('Error deleting module:', error);
            throw error;
        }
    }
    async generateDownloadUrl(moduleId, userId) {
        try {
            const module = await this.findOne(moduleId);
            if (!module) {
                throw new common_1.NotFoundException('Module not found');
            }
            if (!module.r2_file_key) {
                throw new common_1.BadRequestException('Module file not found');
            }
            const accessResult = await this.moduleAccessService.canStudentAccessModule(userId, moduleId);
            if (!accessResult.canAccess) {
                throw new common_1.ForbiddenException(accessResult.reason || 'Access denied to this module');
            }
            const downloadResult = await this.moduleStorageService.generateDownloadUrl(module.id, module.r2_file_key, userId);
            await this.moduleDownloadLoggerService.logDownload(moduleId, userId, true);
            return {
                downloadUrl: downloadResult.downloadUrl,
                expiresAt: downloadResult.expiresAt,
            };
        }
        catch (error) {
            this.logger.error('Error generating download URL:', error);
            throw error;
        }
    }
    async assignModuleToSections(moduleId, sectionIds, assignedBy) {
        try {
            const assignments = sectionIds.map((sectionId) => ({
                module_id: moduleId,
                section_id: sectionId,
                assigned_by: assignedBy,
                visible: true,
            }));
            const { error } = await this.supabaseService
                .getServiceClient()
                .from('section_modules')
                .insert(assignments);
            if (error) {
                this.logger.error('Failed to assign module to sections:', error);
                throw new common_1.BadRequestException('Failed to assign module to sections');
            }
            this.logger.log(`Module assigned to ${sectionIds.length} sections: ${moduleId}`);
        }
        catch (error) {
            this.logger.error('Error assigning module to sections:', error);
            throw error;
        }
    }
    async updateModuleAssignment(moduleId, sectionId, updateDto, userId) {
        try {
            const { error } = await this.supabaseService
                .getServiceClient()
                .from('section_modules')
                .update({
                visible: updateDto.visible,
            })
                .eq('module_id', moduleId)
                .eq('section_id', sectionId);
            if (error) {
                this.logger.error('Failed to update module assignment:', error);
                throw new common_1.BadRequestException('Failed to update module assignment');
            }
            this.logger.log(`Module assignment updated: ${moduleId} -> ${sectionId}`);
        }
        catch (error) {
            this.logger.error('Error updating module assignment:', error);
            throw error;
        }
    }
    async findAccessibleModules(userId, query) {
        try {
            const page = query.page || 1;
            const limit = query.limit || 10;
            const userRole = await this.getUserRole(userId);
            if (userRole === 'Admin') {
                return this.findAll(query, userId);
            }
            else if (userRole === 'Teacher') {
                const teacherSubject = await this.moduleAccessService.getTeacherSubjectId(userId);
                let queryBuilder = this.supabaseService
                    .getClient()
                    .from('modules')
                    .select(`
            *,
            uploader:uploaded_by(id, full_name, email),
            subject:subject_id(id, subject_name, description)
          `);
                if (teacherSubject) {
                    queryBuilder = queryBuilder.or(`uploaded_by.eq.${userId},and(is_global.eq.true,subject_id.eq.${teacherSubject})`);
                }
                else {
                    queryBuilder = queryBuilder.eq('uploaded_by', userId);
                }
                queryBuilder = queryBuilder.eq('is_deleted', false);
                if (query.search) {
                    queryBuilder = queryBuilder.or(`title.ilike.%${query.search}%,description.ilike.%${query.search}%`);
                }
                const { data: modules, error, count, } = await queryBuilder
                    .order(query.sortBy || 'created_at', {
                    ascending: query.sortOrder === 'asc',
                })
                    .range((page - 1) * limit, page * limit - 1);
                if (error) {
                    this.logger.error('Failed to fetch accessible modules:', error);
                    throw new common_1.BadRequestException('Failed to fetch accessible modules');
                }
                const totalPages = Math.ceil((count || 0) / limit);
                return {
                    modules: modules || [],
                    total: count || 0,
                    page,
                    limit,
                    totalPages,
                };
            }
            else if (userRole === 'Student') {
                const studentSection = await this.moduleAccessService.getStudentSectionId(userId);
                if (!studentSection) {
                    return {
                        modules: [],
                        total: 0,
                        page,
                        limit,
                        totalPages: 0,
                    };
                }
                let queryBuilder = this.supabaseService
                    .getClient()
                    .from('modules')
                    .select(`
            *,
            uploader:uploaded_by(id, full_name, email),
            subject:subject_id(id, subject_name, description),
            section_modules!inner(visible)
          `)
                    .eq('section_modules.section_id', studentSection)
                    .eq('section_modules.visible', true)
                    .eq('is_deleted', false)
                    .or('is_global.eq.true');
                if (query.search) {
                    queryBuilder = queryBuilder.or(`title.ilike.%${query.search}%,description.ilike.%${query.search}%`);
                }
                const { data: modules, error, count, } = await queryBuilder
                    .order(query.sortBy || 'created_at', {
                    ascending: query.sortOrder === 'asc',
                })
                    .range((page - 1) * limit, page * limit - 1);
                if (error) {
                    this.logger.error('Failed to fetch student accessible modules:', error);
                    throw new common_1.BadRequestException('Failed to fetch accessible modules');
                }
                const totalPages = Math.ceil((count || 0) / limit);
                return {
                    modules: modules || [],
                    total: count || 0,
                    page,
                    limit,
                    totalPages,
                };
            }
            return {
                modules: [],
                total: 0,
                page,
                limit,
                totalPages: 0,
            };
        }
        catch (error) {
            this.logger.error('Error fetching accessible modules:', error);
            throw error;
        }
    }
    async getUserRole(userId) {
        try {
            const { data: user, error } = await this.supabaseService
                .getServiceClient()
                .from('users')
                .select(`
          roles!inner(name)
        `)
                .eq('id', userId)
                .single();
            if (error || !user) {
                throw new Error('User not found');
            }
            const roles = Array.isArray(user.roles) ? user.roles : [user.roles];
            return roles[0]?.name || 'Student';
        }
        catch (error) {
            this.logger.error('Error getting user role:', error);
            throw new common_1.BadRequestException('Failed to get user role');
        }
    }
    async canUserUploadToModule(module, userId) {
        const userRole = await this.getUserRole(userId);
        if (userRole === 'Admin') {
            return true;
        }
        if (userRole === 'Teacher') {
            return module.uploaded_by === userId;
        }
        return false;
    }
    async canUserUpdateModule(module, userId) {
        const userRole = await this.getUserRole(userId);
        if (userRole === 'Admin') {
            return true;
        }
        if (userRole === 'Teacher') {
            return module.uploaded_by === userId;
        }
        return false;
    }
    async canUserDeleteModule(module, userId) {
        const userRole = await this.getUserRole(userId);
        if (userRole === 'Admin') {
            return true;
        }
        if (userRole === 'Teacher') {
            return module.uploaded_by === userId;
        }
        return false;
    }
};
exports.ModulesService = ModulesService;
exports.ModulesService = ModulesService = ModulesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService,
        module_storage_service_1.ModuleStorageService,
        module_access_service_1.ModuleAccessService,
        module_download_logger_service_1.ModuleDownloadLoggerService])
], ModulesService);
//# sourceMappingURL=modules.service.js.map