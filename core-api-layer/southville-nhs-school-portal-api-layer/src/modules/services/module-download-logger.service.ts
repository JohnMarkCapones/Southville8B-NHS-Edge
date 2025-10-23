import { Injectable, Logger } from '@nestjs/common';
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

@Injectable()
export class ModuleDownloadLoggerService {
  private readonly logger = new Logger(ModuleDownloadLoggerService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Log module download attempt
   */
  async logDownload(
    moduleId: string,
    userId: string,
    success: boolean,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
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
    } catch (error) {
      this.logger.error('Error logging module download:', error);
    }
  }

  /**
   * Get module download statistics
   */
  async getModuleDownloadStats(moduleId: string): Promise<ModuleDownloadStats> {
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
      const successRate =
        totalDownloads > 0 ? (successfulDownloads / totalDownloads) * 100 : 0;

      // Get unique users count
      const { data: uniqueUsers, error: uniqueError } =
        await this.supabaseService
          .getClient()
          .from('module_download_logs')
          .select('user_id')
          .eq('module_id', moduleId)
          .eq('success', true);

      const uniqueUserCount = uniqueError
        ? 0
        : new Set(uniqueUsers.map((u) => u.user_id)).size;

      // Get last download date
      const lastDownloaded =
        logs.length > 0
          ? logs.sort(
              (a, b) =>
                new Date(b.downloaded_at).getTime() -
                new Date(a.downloaded_at).getTime(),
            )[0].downloaded_at
          : undefined;

      return {
        totalDownloads,
        uniqueUsers: uniqueUserCount,
        successRate: Math.round(successRate * 100) / 100,
        lastDownloaded,
      };
    } catch (error) {
      this.logger.error('Error getting module download stats:', error);
      return {
        totalDownloads: 0,
        uniqueUsers: 0,
        successRate: 0,
      };
    }
  }

  /**
   * Get user's download history
   */
  async getUserDownloadHistory(
    userId: string,
    limit: number = 50,
  ): Promise<ModuleDownloadLog[]> {
    try {
      const { data: logs, error } = await this.supabaseService
        .getClient()
        .from('module_download_logs')
        .select(
          `
          id,
          module_id,
          user_id,
          downloaded_at,
          ip_address,
          user_agent,
          success
        `,
        )
        .eq('user_id', userId)
        .order('downloaded_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.logger.error('Failed to get user download history:', error);
        return [];
      }

      return logs || [];
    } catch (error) {
      this.logger.error('Error getting user download history:', error);
      return [];
    }
  }

  /**
   * Get popular modules based on download count
   */
  async getPopularModules(limit: number = 10): Promise<
    Array<{
      moduleId: string;
      downloadCount: number;
      uniqueUsers: number;
    }>
  > {
    try {
      const { data: popularModules, error } = await this.supabaseService
        .getClient()
        .rpc('get_popular_modules', { limit_count: limit });

      if (error) {
        this.logger.error('Failed to get popular modules:', error);
        return [];
      }

      return popularModules || [];
    } catch (error) {
      this.logger.error('Error getting popular modules:', error);
      return [];
    }
  }

  /**
   * Get download analytics for admin dashboard
   */
  async getDownloadAnalytics(
    startDate?: string,
    endDate?: string,
  ): Promise<{
    totalDownloads: number;
    uniqueUsers: number;
    successRate: number;
    downloadsByDate: Array<{ date: string; count: number }>;
  }> {
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
      const successRate =
        totalDownloads > 0 ? (successfulDownloads / totalDownloads) * 100 : 0;
      const uniqueUsers = new Set(logs.map((log) => log.user_id)).size;

      // Group downloads by date
      const downloadsByDate = logs.reduce(
        (acc, log) => {
          const date = new Date(log.downloaded_at).toISOString().split('T')[0];
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      const downloadsByDateArray = Object.entries(downloadsByDate)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return {
        totalDownloads,
        uniqueUsers,
        successRate: Math.round(successRate * 100) / 100,
        downloadsByDate: downloadsByDateArray,
      };
    } catch (error) {
      this.logger.error('Error getting download analytics:', error);
      return {
        totalDownloads: 0,
        uniqueUsers: 0,
        successRate: 0,
        downloadsByDate: [],
      };
    }
  }
}
