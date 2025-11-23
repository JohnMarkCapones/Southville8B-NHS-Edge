import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { GalleryDownload, GalleryDownloadStats } from '../entities';

/**
 * Gallery Download Logger Service
 * Tracks downloads for analytics
 */
@Injectable()
export class GalleryDownloadLoggerService {
  private readonly logger = new Logger(GalleryDownloadLoggerService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Log a download attempt
   * @param itemId - Gallery item ID
   * @param userId - User ID (optional for guests)
   * @param ipAddress - IP address for guest tracking
   * @param userAgent - Browser user agent
   * @param success - Whether download was successful
   */
  async logDownload(
    itemId: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
    success: boolean = true,
  ): Promise<void> {
    try {
      const { error } = await this.supabaseService
        .getServiceClient()
        .from('gallery_downloads')
        .insert({
          item_id: itemId,
          user_id: userId || null,
          ip_address: ipAddress || null,
          user_agent: userAgent || null,
          success,
          downloaded_at: new Date().toISOString(),
        });

      if (error) {
        this.logger.error('Failed to log download:', error);
        // Don't throw - logging failure shouldn't block download
      } else {
        this.logger.log(`Download logged for item: ${itemId}`);
      }

      // Increment download count on item (denormalized)
      if (success) {
        await this.incrementDownloadCount(itemId);
      }
    } catch (error) {
      this.logger.error('Error logging download:', error);
      // Don't throw - logging failure shouldn't block download
    }
  }

  /**
   * Get download statistics for an item
   * @param itemId - Gallery item ID
   * @returns Download statistics
   */
  async getItemDownloadStats(itemId: string): Promise<GalleryDownloadStats> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('gallery_downloads')
        .select('*')
        .eq('item_id', itemId)
        .eq('success', true);

      if (error) {
        this.logger.error('Failed to get download stats:', error);
        return {
          total_downloads: 0,
          unique_users: 0,
          success_rate: 0,
        };
      }

      const totalDownloads = data?.length || 0;
      const uniqueUsers = new Set(
        data?.filter((d) => d.user_id).map((d) => d.user_id),
      ).size;
      const lastDownloaded = data?.[0]?.downloaded_at;

      // Calculate success rate
      const { data: allAttempts } = await this.supabaseService
        .getClient()
        .from('gallery_downloads')
        .select('success')
        .eq('item_id', itemId);

      const successfulDownloads =
        allAttempts?.filter((d) => d.success).length || 0;
      const totalAttempts = allAttempts?.length || 1;
      const successRate = (successfulDownloads / totalAttempts) * 100;

      return {
        total_downloads: totalDownloads,
        unique_users: uniqueUsers,
        success_rate: Math.round(successRate * 100) / 100,
        last_downloaded: lastDownloaded,
      };
    } catch (error) {
      this.logger.error('Error getting download stats:', error);
      return {
        total_downloads: 0,
        unique_users: 0,
        success_rate: 0,
      };
    }
  }

  /**
   * Increment download count on item (denormalized field)
   * @param itemId - Gallery item ID
   */
  private async incrementDownloadCount(itemId: string): Promise<void> {
    try {
      const { error } = await this.supabaseService
        .getServiceClient()
        .from('gallery_items')
        .update({
          downloads_count: this.supabaseService
            .getServiceClient()
            .rpc('increment', { x: 1 }),
        })
        .eq('id', itemId);

      if (error) {
        this.logger.warn('Failed to increment download count:', error);
      }
    } catch (error) {
      this.logger.error('Error incrementing download count:', error);
    }
  }

  /**
   * Get recent downloads for an item
   * @param itemId - Gallery item ID
   * @param limit - Number of recent downloads to retrieve
   * @returns Recent download records
   */
  async getRecentDownloads(
    itemId: string,
    limit: number = 10,
  ): Promise<GalleryDownload[]> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('gallery_downloads')
        .select('*')
        .eq('item_id', itemId)
        .order('downloaded_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.logger.error('Failed to get recent downloads:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      this.logger.error('Error getting recent downloads:', error);
      return [];
    }
  }
}
