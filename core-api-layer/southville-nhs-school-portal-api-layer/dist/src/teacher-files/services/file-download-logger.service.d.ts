import { SupabaseService } from '../../supabase/supabase.service';
import { TeacherFileDownload } from '../entities/teacher-file-download.entity';
export declare class FileDownloadLoggerService {
    private readonly supabaseService;
    private readonly logger;
    constructor(supabaseService: SupabaseService);
    logDownload(fileId: string, userId: string, ipAddress?: string, userAgent?: string, success?: boolean): Promise<void>;
    getFileDownloads(fileId: string): Promise<TeacherFileDownload[]>;
    getFileStats(fileId: string): Promise<{
        totalDownloads: number;
        uniqueUsers: number;
        successRate: number;
        lastDownloaded?: string;
    }>;
    getPopularFiles(limit?: number): Promise<Array<{
        file_id: string;
        download_count: number;
    }>>;
    getUserDownloads(userId: string): Promise<TeacherFileDownload[]>;
    getOverallStats(): Promise<{
        totalDownloads: number;
        totalFiles: number;
        totalUsers: number;
        averageDownloadsPerFile: number;
    }>;
}
