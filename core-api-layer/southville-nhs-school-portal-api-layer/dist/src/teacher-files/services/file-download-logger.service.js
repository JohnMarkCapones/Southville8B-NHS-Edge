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
var FileDownloadLoggerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileDownloadLoggerService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
let FileDownloadLoggerService = FileDownloadLoggerService_1 = class FileDownloadLoggerService {
    supabaseService;
    logger = new common_1.Logger(FileDownloadLoggerService_1.name);
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async logDownload(fileId, userId, ipAddress, userAgent, success = true) {
        try {
            const { error } = await this.supabaseService
                .getServiceClient()
                .from('teacher_file_downloads')
                .insert({
                file_id: fileId,
                user_id: userId,
                ip_address: ipAddress,
                user_agent: userAgent,
                success,
            });
            if (error) {
                this.logger.error('Error logging download - Full error details:', {
                    error,
                    errorMessage: error.message,
                    errorCode: error.code,
                    errorDetails: error.details,
                    fileId,
                    userId,
                });
            }
        }
        catch (error) {
            this.logger.error('Error in logDownload - Caught exception:', {
                error,
                errorMessage: error.message,
                errorStack: error.stack,
                fileId,
                userId,
            });
        }
    }
    async getFileDownloads(fileId) {
        try {
            const { data, error } = await this.supabaseService
                .getClient()
                .from('teacher_file_downloads')
                .select('*')
                .eq('file_id', fileId)
                .order('downloaded_at', { ascending: false });
            if (error) {
                this.logger.error('Error fetching download history:', error);
                throw new common_1.InternalServerErrorException('Failed to fetch download history: ' + error.message);
            }
            return data;
        }
        catch (error) {
            this.logger.error('Error in getFileDownloads:', error);
            throw error;
        }
    }
    async getFileStats(fileId) {
        try {
            const { count: totalDownloads, error: countError } = await this.supabaseService
                .getClient()
                .from('teacher_file_downloads')
                .select('*', { count: 'exact', head: true })
                .eq('file_id', fileId);
            if (countError) {
                this.logger.error('Error counting downloads:', countError);
            }
            const { data: uniqueData, error: uniqueError } = await this.supabaseService
                .getClient()
                .from('teacher_file_downloads')
                .select('user_id')
                .eq('file_id', fileId);
            const uniqueUsers = uniqueData
                ? new Set(uniqueData.map((d) => d.user_id)).size
                : 0;
            const { count: successCount, error: successError } = await this.supabaseService
                .getClient()
                .from('teacher_file_downloads')
                .select('*', { count: 'exact', head: true })
                .eq('file_id', fileId)
                .eq('success', true);
            const successRate = totalDownloads && totalDownloads > 0
                ? (successCount / totalDownloads) * 100
                : 0;
            const { data: lastDownload } = await this.supabaseService
                .getClient()
                .from('teacher_file_downloads')
                .select('downloaded_at')
                .eq('file_id', fileId)
                .order('downloaded_at', { ascending: false })
                .limit(1)
                .single();
            return {
                totalDownloads: totalDownloads || 0,
                uniqueUsers,
                successRate: Math.round(successRate * 100) / 100,
                lastDownloaded: lastDownload?.downloaded_at,
            };
        }
        catch (error) {
            this.logger.error('Error in getFileStats:', error);
            return {
                totalDownloads: 0,
                uniqueUsers: 0,
                successRate: 0,
            };
        }
    }
    async getPopularFiles(limit = 10) {
        try {
            const { data, error } = await this.supabaseService
                .getClient()
                .from('teacher_file_downloads')
                .select('file_id')
                .eq('success', true);
            if (error) {
                this.logger.error('Error fetching popular files:', error);
                return [];
            }
            const downloadCounts = new Map();
            data?.forEach((row) => {
                const count = downloadCounts.get(row.file_id) || 0;
                downloadCounts.set(row.file_id, count + 1);
            });
            const sorted = Array.from(downloadCounts.entries())
                .map(([file_id, download_count]) => ({ file_id, download_count }))
                .sort((a, b) => b.download_count - a.download_count)
                .slice(0, limit);
            return sorted;
        }
        catch (error) {
            this.logger.error('Error in getPopularFiles:', error);
            return [];
        }
    }
    async getUserDownloads(userId) {
        try {
            const { data, error } = await this.supabaseService
                .getClient()
                .from('teacher_file_downloads')
                .select('*')
                .eq('user_id', userId)
                .order('downloaded_at', { ascending: false });
            if (error) {
                this.logger.error('Error fetching user downloads:', error);
                throw new common_1.InternalServerErrorException('Failed to fetch user downloads: ' + error.message);
            }
            return data;
        }
        catch (error) {
            this.logger.error('Error in getUserDownloads:', error);
            throw error;
        }
    }
    async getOverallStats() {
        try {
            const { count: totalDownloads } = await this.supabaseService
                .getClient()
                .from('teacher_file_downloads')
                .select('*', { count: 'exact', head: true });
            const { data: filesData } = await this.supabaseService
                .getClient()
                .from('teacher_file_downloads')
                .select('file_id');
            const totalFiles = filesData
                ? new Set(filesData.map((d) => d.file_id)).size
                : 0;
            const { data: usersData } = await this.supabaseService
                .getClient()
                .from('teacher_file_downloads')
                .select('user_id');
            const totalUsers = usersData
                ? new Set(usersData.map((d) => d.user_id)).size
                : 0;
            const averageDownloadsPerFile = totalFiles > 0 ? (totalDownloads || 0) / totalFiles : 0;
            return {
                totalDownloads: totalDownloads || 0,
                totalFiles,
                totalUsers,
                averageDownloadsPerFile: Math.round(averageDownloadsPerFile * 100) / 100,
            };
        }
        catch (error) {
            this.logger.error('Error in getOverallStats:', error);
            return {
                totalDownloads: 0,
                totalFiles: 0,
                totalUsers: 0,
                averageDownloadsPerFile: 0,
            };
        }
    }
};
exports.FileDownloadLoggerService = FileDownloadLoggerService;
exports.FileDownloadLoggerService = FileDownloadLoggerService = FileDownloadLoggerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], FileDownloadLoggerService);
//# sourceMappingURL=file-download-logger.service.js.map