import { SupabaseService } from '../../supabase/supabase.service';
import { R2StorageService } from '../../storage/r2-storage/r2-storage.service';
import { TeacherFile, TeacherFileWithDetails } from '../entities/teacher-file.entity';
import { UpdateFileDto } from '../dto/update-file.dto';
import { FileQueryDto } from '../dto/file-query.dto';
export declare class FileStorageService {
    private readonly supabaseService;
    private readonly r2StorageService;
    private readonly logger;
    private readonly MAX_FILE_SIZE;
    private readonly ALLOWED_MIME_TYPES;
    constructor(supabaseService: SupabaseService, r2StorageService: R2StorageService);
    findAll(query: FileQueryDto): Promise<{
        files: TeacherFile[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string, accessToken?: string): Promise<TeacherFile>;
    findOneWithDetails(id: string): Promise<TeacherFileWithDetails>;
    uploadFile(folderId: string, title: string, fileBuffer: Buffer, originalFilename: string, mimeType: string, userId: string, description?: string): Promise<TeacherFile>;
    update(id: string, updateFileDto: UpdateFileDto, userId: string): Promise<TeacherFile>;
    replaceFile(id: string, fileBuffer: Buffer, originalFilename: string, mimeType: string, userId: string): Promise<TeacherFile>;
    softDelete(id: string, userId: string): Promise<void>;
    restore(id: string): Promise<TeacherFile>;
    generateDownloadUrl(fileId: string, accessToken?: string): Promise<{
        url: string;
        expiresAt: string;
    }>;
    private generateR2Key;
    isValidMimeType(mimeType: string): boolean;
}
