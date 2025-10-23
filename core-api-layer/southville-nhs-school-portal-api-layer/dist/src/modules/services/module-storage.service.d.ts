import { R2StorageService } from '../../storage/r2-storage/r2-storage.service';
import { ModuleAccessService } from './module-access.service';
export interface ModuleFileUpload {
    moduleId: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    uploadedBy: string;
    filePath: string;
    publicUrl?: string;
}
export interface ModuleFileDownload {
    moduleId: string;
    fileName: string;
    filePath: string;
    downloadUrl: string;
    expiresAt: string;
}
export declare class ModuleStorageService {
    private readonly r2StorageService;
    private readonly moduleAccessService;
    private readonly logger;
    constructor(r2StorageService: R2StorageService, moduleAccessService: ModuleAccessService);
    uploadModuleFile(moduleId: string, fileName: string, fileBuffer: Buffer, mimeType: string, uploadedBy: string): Promise<ModuleFileUpload>;
    generateDownloadUrl(moduleId: string, fileName: string, userId: string): Promise<ModuleFileDownload>;
    deleteModuleFile(moduleId: string, fileName: string, userId: string): Promise<boolean>;
    listModuleFiles(moduleId: string): Promise<string[]>;
    getModuleFileInfo(moduleId: string, fileName: string): Promise<{
        exists: boolean;
        size?: number;
        lastModified?: string;
        mimeType?: string;
    }>;
    private isValidFileType;
    getModuleStorageUsage(moduleId: string): Promise<{
        totalFiles: number;
        totalSize: number;
        files: Array<{
            fileName: string;
            size: number;
            lastModified: string;
        }>;
    }>;
    uploadModule(file: Express.Multer.File, uploadedBy: string, isGlobal: boolean, subjectId?: string, sectionId?: string): Promise<{
        r2FileKey: string;
        fileUrl: string;
        fileSize: number;
        mimeType: string;
    }>;
    private generateR2Key;
}
