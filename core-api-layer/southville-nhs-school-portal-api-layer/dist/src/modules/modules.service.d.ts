import { SupabaseService } from '../supabase/supabase.service';
import { ModuleStorageService } from './services/module-storage.service';
import { ModuleAccessService } from './services/module-access.service';
import { ModuleDownloadLoggerService } from './services/module-download-logger.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { UploadModuleDto } from './dto/upload-module.dto';
import { ModuleQueryDto } from './dto/module-query.dto';
import { UpdateModuleAssignmentDto } from './dto/assign-module.dto';
import { Module, ModuleWithDetails } from './entities/module.entity';
export interface ModuleUploadResult {
    module: Module;
    uploadResult: any;
}
export interface ModuleListResult {
    modules: ModuleWithDetails[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export declare class ModulesService {
    private readonly supabaseService;
    private readonly moduleStorageService;
    private readonly moduleAccessService;
    private readonly moduleDownloadLoggerService;
    private readonly logger;
    constructor(supabaseService: SupabaseService, moduleStorageService: ModuleStorageService, moduleAccessService: ModuleAccessService, moduleDownloadLoggerService: ModuleDownloadLoggerService);
    create(createModuleDto: CreateModuleDto, uploadedBy: string): Promise<Module>;
    createWithFile(createModuleDto: CreateModuleDto, file: Express.Multer.File, uploadedBy: string): Promise<Module>;
    uploadModule(moduleId: string, file: Express.Multer.File, uploadModuleDto: UploadModuleDto, uploadedBy: string): Promise<ModuleUploadResult>;
    findAll(query: ModuleQueryDto, userId: string): Promise<ModuleListResult>;
    findOne(id: string): Promise<Module | null>;
    update(id: string, updateModuleDto: UpdateModuleDto, userId: string): Promise<Module>;
    remove(id: string, userId: string): Promise<void>;
    generateDownloadUrl(moduleId: string, userId: string): Promise<{
        downloadUrl: string;
        expiresAt: string;
    }>;
    assignModuleToSections(moduleId: string, sectionIds: string[], assignedBy: string): Promise<void>;
    updateModuleAssignment(moduleId: string, sectionId: string, updateDto: UpdateModuleAssignmentDto, userId: string): Promise<void>;
    findAccessibleModules(userId: string, query: ModuleQueryDto): Promise<ModuleListResult>;
    private getUserRole;
    private canUserUploadToModule;
    private canUserUpdateModule;
    private canUserDeleteModule;
}
