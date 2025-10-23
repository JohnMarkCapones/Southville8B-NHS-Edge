import { SupabaseService } from '../../supabase/supabase.service';
export interface ModuleDownloadLog {
    id: string;
    module_id: string;
    user_id: string;
    downloaded_at: string;
    ip_address?: string;
    user_agent?: string;
    success: boolean;
}
export interface ModuleDownloadStats {
    totalDownloads: number;
    uniqueUsers: number;
    successRate: number;
    lastDownloaded?: string;
}
export declare class ModuleDownloadLoggerService {
    private readonly supabaseService;
    private readonly logger;
    constructor(supabaseService: SupabaseService);
    logDownload(moduleId: string, userId: string, success: boolean, ipAddress?: string, userAgent?: string): Promise<void>;
    getModuleDownloadStats(moduleId: string): Promise<ModuleDownloadStats>;
    getUserDownloadHistory(userId: string, limit?: number): Promise<ModuleDownloadLog[]>;
    getPopularModules(limit?: number): Promise<Array<{
        moduleId: string;
        downloadCount: number;
        uniqueUsers: number;
    }>>;
    getDownloadAnalytics(startDate?: string, endDate?: string): Promise<{
        totalDownloads: number;
        uniqueUsers: number;
        successRate: number;
        downloadsByDate: Array<{
            date: string;
            count: number;
        }>;
    }>;
}
