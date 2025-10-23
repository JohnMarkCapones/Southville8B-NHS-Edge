import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { GalleryViewStats } from '../entities';

/**
 * Gallery View Tracker Service
 * Tracks album/item views for analytics
 */
@Injectable()
export class GalleryViewTrackerService {
  private readonly logger = new Logger(GalleryViewTrackerService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Track a view (with debouncing to prevent duplicate views)
   * @param viewableType - 'album' or 'item'
   * @param viewableId - Album or item ID
   * @param userId - User ID (optional for guests)
   * @param ipAddress - IP address for guest tracking
   */
  async trackView(
    viewableType: 'album' | 'item',
    viewableId: string,
    userId?: string,
    ipAddress?: string,
  ): Promise<void> {
    try {
      // Check if already viewed recently (within last 24 hours)
      const isDuplicate = await this.isDuplicateView(
        viewableType,
        viewableId,
        userId,
        ipAddress,
      );

      if (isDuplicate) {
        this.logger.debug(
          `Duplicate view detected, skipping: ${viewableType} ${viewableId}`,
        );
        return;
      }

      // Log the view
      const { error } = await this.supabaseService
        .getServiceClient()
        .from('gallery_views')
        .insert({
          viewable_type: viewableType,
          viewable_id: viewableId,
          user_id: userId || null,
          ip_address: ipAddress || null,
          viewed_at: new Date().toISOString(),
        });

      if (error) {
        this.logger.error('Failed to track view:', error);
        // Don't throw - tracking failure shouldn't block page load
      } else {
        this.logger.log(`View tracked: ${viewableType} ${viewableId}`);
      }

      // Increment view count (denormalized)
      await this.incrementViewCount(viewableType, viewableId);
    } catch (error) {
      this.logger.error('Error tracking view:', error);
      // Don't throw - tracking failure shouldn't block page load
    }
  }

  /**
   * Check if this is a duplicate view (same user/IP within 24 hours)
   * @param viewableType - 'album' or 'item'
   * @param viewableId - Album or item ID
   * @param userId - User ID
   * @param ipAddress - IP address
   * @returns True if duplicate
   */
  private async isDuplicateView(
    viewableType: 'album' | 'item',
    viewableId: string,
    userId?: string,
    ipAddress?: string,
  ): Promise<boolean> {
    try {
      const oneDayAgo = new Date();
      oneDayAgo.setHours(oneDayAgo.getHours() - 24);

      let query = this.supabaseService
        .getClient()
        .from('gallery_views')
        .select('id')
        .eq('viewable_type', viewableType)
        .eq('viewable_id', viewableId)
        .gte('viewed_at', oneDayAgo.toISOString());

      if (userId) {
        query = query.eq('user_id', userId);
      } else if (ipAddress) {
        query = query.eq('ip_address', ipAddress);
      } else {
        return false; // Can't determine duplicate without identifier
      }

      const { data, error } = await query.limit(1);

      if (error) {
        this.logger.error('Error checking duplicate view:', error);
        return false;
      }

      return (data?.length || 0) > 0;
    } catch (error) {
      this.logger.error('Error in isDuplicateView:', error);
      return false;
    }
  }

  /**
   * Increment view count on album or item (denormalized field)
   * @param viewableType - 'album' or 'item'
   * @param viewableId - Album or item ID
   */
  private async incrementViewCount(
    viewableType: 'album' | 'item',
    viewableId: string,
  ): Promise<void> {
    try {
      const tableName =
        viewableType === 'album' ? 'gallery_albums' : 'gallery_items';

      const { error } = await this.supabaseService
        .getServiceClient()
        .from(tableName)
        .update({
          views_count: this.supabaseService
            .getServiceClient()
            .rpc('increment', { x: 1 }),
        })
        .eq('id', viewableId);

      if (error) {
        this.logger.warn('Failed to increment view count:', error);
      }
    } catch (error) {
      this.logger.error('Error incrementing view count:', error);
    }
  }

  /**
   * Get view statistics for an album or item
   * @param viewableType - 'album' or 'item'
   * @param viewableId - Album or item ID
   * @returns View statistics
   */
  async getViewStats(
    viewableType: 'album' | 'item',
    viewableId: string,
  ): Promise<GalleryViewStats> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('gallery_views')
        .select('*')
        .eq('viewable_type', viewableType)
        .eq('viewable_id', viewableId)
        .order('viewed_at', { ascending: false });

      if (error) {
        this.logger.error('Failed to get view stats:', error);
        return {
          total_views: 0,
          unique_viewers: 0,
        };
      }

      const totalViews = data?.length || 0;
      const uniqueViewers = new Set(
        data?.filter((d) => d.user_id).map((d) => d.user_id),
      ).size;
      const lastViewed = data?.[0]?.viewed_at;

      // Get views in last 24 hours
      const oneDayAgo = new Date();
      oneDayAgo.setHours(oneDayAgo.getHours() - 24);
      const viewsLast24h =
        data?.filter((d) => new Date(d.viewed_at) >= oneDayAgo).length || 0;

      // Get views in last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const viewsLast7d =
        data?.filter((d) => new Date(d.viewed_at) >= sevenDaysAgo).length || 0;

      return {
        total_views: totalViews,
        unique_viewers: uniqueViewers,
        last_viewed: lastViewed,
        views_last_24h: viewsLast24h,
        views_last_7d: viewsLast7d,
      };
    } catch (error) {
      this.logger.error('Error getting view stats:', error);
      return {
        total_views: 0,
        unique_viewers: 0,
      };
    }
  }
}
