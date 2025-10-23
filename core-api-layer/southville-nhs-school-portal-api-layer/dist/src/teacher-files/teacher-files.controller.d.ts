import { FolderService } from './services/folder.service';
import { FileStorageService } from './services/file-storage.service';
import { FileDownloadLoggerService } from './services/file-download-logger.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { FolderQueryDto } from './dto/folder-query.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { FileQueryDto } from './dto/file-query.dto';
import { TeacherFolder, TeacherFolderWithChildren } from './entities/teacher-folder.entity';
import { TeacherFile, TeacherFileWithDetails } from './entities/teacher-file.entity';
export declare class TeacherFilesController {
    private readonly folderService;
    private readonly fileStorageService;
    private readonly fileDownloadLoggerService;
    constructor(folderService: FolderService, fileStorageService: FileStorageService, fileDownloadLoggerService: FileDownloadLoggerService);
    getFolderTree(query: FolderQueryDto, request: any): Promise<TeacherFolderWithChildren[]>;
    getFolder(id: string): Promise<TeacherFolderWithChildren>;
    createFolder(createFolderDto: CreateFolderDto, user: any): Promise<TeacherFolder>;
    updateFolder(id: string, updateFolderDto: UpdateFolderDto, user: any): Promise<TeacherFolder>;
    deleteFolder(id: string, user: any): Promise<void>;
    restoreFolder(id: string): Promise<TeacherFolder>;
    getFiles(query: FileQueryDto): Promise<{
        files: TeacherFile[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getFile(id: string): Promise<TeacherFileWithDetails>;
    uploadFile(request: any, user: any): Promise<TeacherFile>;
    updateFile(id: string, updateFileDto: UpdateFileDto, user: any): Promise<TeacherFile>;
    replaceFile(id: string, request: any, user: any): Promise<TeacherFile>;
    deleteFile(id: string, user: any): Promise<void>;
    restoreFile(id: string): Promise<TeacherFile>;
    getDownloadUrl(id: string, user: any, request: any): Promise<{
        url: string;
        expiresAt: string;
    }>;
    getOverviewAnalytics(): Promise<{
        totalDownloads: number;
        totalFiles: number;
        totalUsers: number;
        averageDownloadsPerFile: number;
    }>;
    getPopularFiles(limit?: number): Promise<{
        file_id: string;
        download_count: number;
    }[]>;
    getFileDownloads(id: string): Promise<{
        downloads: import("./entities/teacher-file-download.entity").TeacherFileDownload[];
        stats: {
            totalDownloads: number;
            uniqueUsers: number;
            successRate: number;
            lastDownloaded?: string;
        };
    }>;
    getMyDownloads(user: any): Promise<import("./entities/teacher-file-download.entity").TeacherFileDownload[]>;
}
