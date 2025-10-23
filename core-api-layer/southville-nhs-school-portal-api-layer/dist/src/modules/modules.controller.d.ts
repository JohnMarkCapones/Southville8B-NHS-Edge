import { ModulesService, ModuleListResult, ModuleUploadResult } from './modules.service';
import { UpdateModuleDto } from './dto/update-module.dto';
import { ModuleQueryDto } from './dto/module-query.dto';
import { AssignModuleDto, UpdateModuleAssignmentDto } from './dto/assign-module.dto';
import { Module, ModuleWithDetails } from './entities/module.entity';
export declare class ModulesController {
    private readonly modulesService;
    constructor(modulesService: ModulesService);
    create(request: any, user: any): Promise<Module>;
    uploadModule(id: string, request: any, user: any): Promise<ModuleUploadResult>;
    findAll(query: ModuleQueryDto, user: any): Promise<ModuleListResult>;
    findAllAdmin(query: ModuleQueryDto, user: any): Promise<ModuleListResult>;
    findOne(id: string, user: any): Promise<ModuleWithDetails>;
    update(id: string, updateModuleDto: UpdateModuleDto, user: any): Promise<Module>;
    remove(id: string, user: any): Promise<void>;
    generateDownloadUrl(id: string, user: any): Promise<{
        downloadUrl: string;
        expiresAt: string;
    }>;
    assignModule(id: string, assignModuleDto: AssignModuleDto, user: any): Promise<void>;
    updateModuleAssignment(id: string, sectionId: string, updateDto: UpdateModuleAssignmentDto, user: any): Promise<void>;
}
