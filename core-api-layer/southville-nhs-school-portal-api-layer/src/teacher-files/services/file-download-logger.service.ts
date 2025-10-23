import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { TeacherFileDownload } from '../entities/teacher-file-download.entity';

@Injectable()
export class FileDownloadLoggerService {
  private readonly logger = new Logger(FileDownloadLoggerService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Log a file download
   */
  async logDownload(
    fileId: string,
    userId: string,
    ipAddress?: string,
    userAgent?: string,
    success = true,
  ): Promise<void> {
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
        // Don't throw error - logging failure shouldn't break download
      }
    } catch (error) {
      this.logger.error('Error in logDownload - Caught exception:', {
        error,
        errorMessage: error.message,
        errorStack: error.stack,
        fileId,
        userId,
      });
      // Don't throw error - logging failure shouldn't break download
    }
  }

  /**
   * Get download history for a file
   */
  async getFileDownloads(fileId: string): Promise<TeacherFileDownload[]> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('teacher_file_downloads')
        .select('*')
        .eq('file_id', fileId)
        .order('downloaded_at', { ascending: false });

      if (error) {
        this.logger.error('Error fetching download history:', error);
        throw new InternalServerErrorException(
          'Failed to fetch download history: ' + error.message,
        );
      }

      return data as TeacherFileDownload[];
    } catch (error) {
      this.logger.error('Error in getFileDownloads:', error);
      throw error;
    }
  }

  /**
   * Get download statistics for a file
   */
  async getFileStats(fileId: string): Promise<{
    totalDownloads: number;
    uniqueUsers: number;
    successRate: number;
    lastDownloaded?: string;
  }> {
    try {
      // Get total downloads
      const { count: totalDownloads, error: countError } =
        await this.supabaseService
          .getClient()
          .from('teacher_file_downloads')
          .select('*', { count: 'exact', head: true })
          .eq('file_id', fileId);

      if (countError) {
        this.logger.error('Error counting downloads:', countError);
      }

      // Get unique users
      const { data: uniqueData, error: uniqueError } =
        await this.supabaseService
          .getClient()
          .from('teacher_file_downloads')
          .select('user_id')
          .eq('file_id', fileId);

      const uniqueUsers = uniqueData
        ? new Set(uniqueData.map((d) => d.user_id)).size
        : 0;

      // Get success rate
      const { count: successCount, error: successError } =
        await this.supabaseService
          .getClient()
          .from('teacher_file_downloads')
          .select('*', { count: 'exact', head: true })
          .eq('file_id', fileId)
          .eq('success', true);

      const successRate =
        totalDownloads && totalDownloads > 0
          ? (successCount! / totalDownloads) * 100
          : 0;

      // Get last download
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
    } catch (error) {
      this.logger.error('Error in getFileStats:', error);
      return {
        totalDownloads: 0,
        uniqueUsers: 0,
        successRate: 0,
      };
    }
  }

  /**
   * Get most downloaded files
   */
  async getPopularFiles(limit = 10): Promise<
    Array<{
      file_id: string;
      download_count: number;
    }>
  > {
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

      // Count downloads per file
      const downloadCounts = new Map<string, number>();
      data?.forEach((row) => {
        const count = downloadCounts.get(row.file_id) || 0;
        downloadCounts.set(row.file_id, count + 1);
      });

      // Sort and limit
      const sorted = Array.from(downloadCounts.entries())
        .map(([file_id, download_count]) => ({ file_id, download_count }))
        .sort((a, b) => b.download_count - a.download_count)
        .slice(0, limit);

      return sorted;
    } catch (error) {
      this.logger.error('Error in getPopularFiles:', error);
      return [];
    }
  }

  /**
   * Get user's download history
   */
  async getUserDownloads(userId: string): Promise<TeacherFileDownload[]> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('teacher_file_downloads')
        .select('*')
        .eq('user_id', userId)
        .order('downloaded_at', { ascending: false });

      if (error) {
        this.logger.error('Error fetching user downloads:', error);
        throw new InternalServerErrorException(
          'Failed to fetch user downloads: ' + error.message,
        );
      }

      return data as TeacherFileDownload[];
    } catch (error) {
      this.logger.error('Error in getUserDownloads:', error);
      throw error;
    }
  }

  /**
   * Get overall download analytics
   */
  async getOverallStats(): Promise<{
    totalDownloads: number;
    totalFiles: number;
    totalUsers: number;
    averageDownloadsPerFile: number;
  }> {
    try {
      // Total downloads
      const { count: totalDownloads } = await this.supabaseService
        .getClient()
        .from('teacher_file_downloads')
        .select('*', { count: 'exact', head: true });

      // Unique files
      const { data: filesData } = await this.supabaseService
        .getClient()
        .from('teacher_file_downloads')
        .select('file_id');

      const totalFiles = filesData
        ? new Set(filesData.map((d) => d.file_id)).size
        : 0;

      // Unique users
      const { data: usersData } = await this.supabaseService
        .getClient()
        .from('teacher_file_downloads')
        .select('user_id');

      const totalUsers = usersData
        ? new Set(usersData.map((d) => d.user_id)).size
        : 0;

      const averageDownloadsPerFile =
        totalFiles > 0 ? (totalDownloads || 0) / totalFiles : 0;

      return {
        totalDownloads: totalDownloads || 0,
        totalFiles,
        totalUsers,
        averageDownloadsPerFile:
          Math.round(averageDownloadsPerFile * 100) / 100,
      };
    } catch (error) {
      this.logger.error('Error in getOverallStats:', error);
      return {
        totalDownloads: 0,
        totalFiles: 0,
        totalUsers: 0,
        averageDownloadsPerFile: 0,
      };
    }
  }
}
