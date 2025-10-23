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
var ModuleDownloadLoggerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleDownloadLoggerService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
let ModuleDownloadLoggerService = ModuleDownloadLoggerService_1 = class ModuleDownloadLoggerService {
    supabaseService;
    logger = new common_1.Logger(ModuleDownloadLoggerService_1.name);
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async logDownload(moduleId, userId, success, ipAddress, userAgent) {
        try {
            const { error } = await this.supabaseService
                .getClient()
                .from('module_download_logs')
                .insert({
                module_id: moduleId,
                user_id: userId,
                success,
                ip_address: ipAddress,
                user_agent: userAgent,
                downloaded_at: new Date().toISOString(),
            });
            if (error) {
                this.logger.error('Failed to log module download:', error);
            }
        }
        catch (error) {
            this.logger.error('Error logging module download:', error);
        }
    }
    async getModuleDownloadStats(moduleId) {
        try {
            const { data: logs, error } = await this.supabaseService
                .getClient()
                .from('module_download_logs')
                .select('success, downloaded_at')
                .eq('module_id', moduleId);
            if (error) {
                this.logger.error('Failed to get module download stats:', error);
                return {
                    totalDownloads: 0,
                    uniqueUsers: 0,
                    successRate: 0,
                };
            }
            const totalDownloads = logs.length;
            const successfulDownloads = logs.filter((log) => log.success).length;
            const successRate = totalDownloads > 0 ? (successfulDownloads / totalDownloads) * 100 : 0;
            const { data: uniqueUsers, error: uniqueError } = await this.supabaseService
                .getClient()
                .from('module_download_logs')
                .select('user_id')
                .eq('module_id', moduleId)
                .eq('success', true);
            const uniqueUserCount = uniqueError
                ? 0
                : new Set(uniqueUsers.map((u) => u.user_id)).size;
            const lastDownloaded = logs.length > 0
                ? logs.sort((a, b) => new Date(b.downloaded_at).getTime() -
                    new Date(a.downloaded_at).getTime())[0].downloaded_at
                : undefined;
            return {
                totalDownloads,
                uniqueUsers: uniqueUserCount,
                successRate: Math.round(successRate * 100) / 100,
                lastDownloaded,
            };
        }
        catch (error) {
            this.logger.error('Error getting module download stats:', error);
            return {
                totalDownloads: 0,
                uniqueUsers: 0,
                successRate: 0,
            };
        }
    }
    async getUserDownloadHistory(userId, limit = 50) {
        try {
            const { data: logs, error } = await this.supabaseService
                .getClient()
                .from('module_download_logs')
                .select(`
          id,
          module_id,
          user_id,
          downloaded_at,
          ip_address,
          user_agent,
          success
        `)
                .eq('user_id', userId)
                .order('downloaded_at', { ascending: false })
                .limit(limit);
            if (error) {
                this.logger.error('Failed to get user download history:', error);
                return [];
            }
            return logs || [];
        }
        catch (error) {
            this.logger.error('Error getting user download history:', error);
            return [];
        }
    }
    async getPopularModules(limit = 10) {
        try {
            const { data: popularModules, error } = await this.supabaseService
                .getClient()
                .rpc('get_popular_modules', { limit_count: limit });
            if (error) {
                this.logger.error('Failed to get popular modules:', error);
                return [];
            }
            return popularModules || [];
        }
        catch (error) {
            this.logger.error('Error getting popular modules:', error);
            return [];
        }
    }
    async getDownloadAnalytics(startDate, endDate) {
        try {
            let query = this.supabaseService
                .getClient()
                .from('module_download_logs')
                .select('success, downloaded_at, user_id');
            if (startDate) {
                query = query.gte('downloaded_at', startDate);
            }
            if (endDate) {
                query = query.lte('downloaded_at', endDate);
            }
            const { data: logs, error } = await query;
            if (error) {
                this.logger.error('Failed to get download analytics:', error);
                return {
                    totalDownloads: 0,
                    uniqueUsers: 0,
                    successRate: 0,
                    downloadsByDate: [],
                };
            }
            const totalDownloads = logs.length;
            const successfulDownloads = logs.filter((log) => log.success).length;
            const successRate = totalDownloads > 0 ? (successfulDownloads / totalDownloads) * 100 : 0;
            const uniqueUsers = new Set(logs.map((log) => log.user_id)).size;
            const downloadsByDate = logs.reduce((acc, log) => {
                const date = new Date(log.downloaded_at).toISOString().split('T')[0];
                acc[date] = (acc[date] || 0) + 1;
                return acc;
            }, {});
            const downloadsByDateArray = Object.entries(downloadsByDate)
                .map(([date, count]) => ({ date, count }))
                .sort((a, b) => a.date.localeCompare(b.date));
            return {
                totalDownloads,
                uniqueUsers,
                successRate: Math.round(successRate * 100) / 100,
                downloadsByDate: downloadsByDateArray,
            };
        }
        catch (error) {
            this.logger.error('Error getting download analytics:', error);
            return {
                totalDownloads: 0,
                uniqueUsers: 0,
                successRate: 0,
                downloadsByDate: [],
            };
        }
    }
};
exports.ModuleDownloadLoggerService = ModuleDownloadLoggerService;
exports.ModuleDownloadLoggerService = ModuleDownloadLoggerService = ModuleDownloadLoggerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], ModuleDownloadLoggerService);
//# sourceMappingURL=module-download-logger.service.js.map