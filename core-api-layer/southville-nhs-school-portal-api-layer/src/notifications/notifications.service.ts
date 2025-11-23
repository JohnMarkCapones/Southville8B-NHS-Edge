import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { MarkNotificationReadDto } from './dto/mark-notification-read.dto';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private supabase: SupabaseClient | null = null;

  constructor(private configService: ConfigService) {}

  private getSupabaseClient(): SupabaseClient {
    if (!this.supabase) {
      const supabaseUrl = this.configService.get<string>('supabase.url');
      const supabaseServiceKey = this.configService.get<string>(
        'supabase.serviceRoleKey',
      );

      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase configuration is missing');
      }

      this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    }
    return this.supabase;
  }

  /**
   * Create a new notification
   */
  async create(
    createNotificationDto: CreateNotificationDto,
    createdBy?: string,
  ): Promise<Notification> {
    try {
      const supabase = this.getSupabaseClient();

      const { data: notification, error } = await supabase
        .from('notifications')
        .insert({
          ...createNotificationDto,
          created_by: createdBy || createNotificationDto.created_by,
        })
        .select('*')
        .single();

      if (error) {
        this.logger.error('Error creating notification:', error);
        throw new BadRequestException(
          `Failed to create notification: ${error.message}`,
        );
      }

      this.logger.log(
        `Notification created: ${notification.title} (ID: ${notification.id})`,
      );
      return notification;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error('Unexpected error creating notification:', error);
      throw new InternalServerErrorException('Failed to create notification');
    }
  }

  /**
   * Get notifications for a specific user with filtering and pagination
   */
  async findByUserId(
    userId: string,
    queryDto: QueryNotificationDto,
  ): Promise<{
    data: Notification[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  }> {
    try {
      this.logger.log(`[findByUserId] Fetching notifications for user: ${userId}`);
      this.logger.log(`[findByUserId] Query params: ${JSON.stringify(queryDto)}`);

      const supabase = this.getSupabaseClient();
      const {
        type,
        category,
        is_read,
        page = 1,
        limit = 10,
        sortBy = 'created_at',
        sortOrder = 'DESC',
      } = queryDto;

      this.logger.log(`[findByUserId] Building query with filters: type=${type}, category=${category}, is_read=${is_read}, page=${page}, limit=${limit}`);

      let query = supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', userId); // Notifications are always user-specific

      // Filter by type if provided
      if (type) {
        query = query.eq('type', type);
        this.logger.log(`[findByUserId] Applied type filter: ${type}`);
      }

      // Filter by category if provided
      if (category) {
        query = query.eq('category', category);
        this.logger.log(`[findByUserId] Applied category filter: ${category}`);
      }

      // Filter by read status if provided
      if (is_read !== undefined) {
        query = query.eq('is_read', is_read);
        this.logger.log(`[findByUserId] Applied is_read filter: ${is_read}`);
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'ASC' });
      this.logger.log(`[findByUserId] Applied sorting: ${sortBy} ${sortOrder}`);

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);
      this.logger.log(`[findByUserId] Applied pagination: range ${from} to ${to}`);

      this.logger.log(`[findByUserId] Executing query...`);
      const { data: notifications, error, count } = await query;

      if (error) {
        this.logger.error(`[findByUserId] Error fetching notifications:`, error);
        this.logger.error(`[findByUserId] Error details: ${JSON.stringify(error)}`);
        throw new InternalServerErrorException('Failed to fetch notifications');
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      this.logger.log(`[findByUserId] Query successful. Found ${total} total notifications, returning ${notifications?.length || 0} items`);
      this.logger.log(`[findByUserId] Notifications data: ${JSON.stringify(notifications?.slice(0, 2) || [])}${notifications && notifications.length > 2 ? '...' : ''}`);

      return {
        data: notifications || [],
        total,
        page,
        limit,
        total_pages: totalPages,
      };
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.error('[findByUserId] Unexpected error fetching notifications:', error);
      throw new InternalServerErrorException('Failed to fetch notifications');
    }
  }

  /**
   * Get a single notification by ID
   */
  async findOne(id: string, userId: string): Promise<Notification> {
    try {
      const supabase = this.getSupabaseClient();

      const { data: notification, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId) // Ensure user can only access their own notifications
        .single();

      if (error) {
        this.logger.error(`Error fetching notification ${id}:`, error);
        throw new NotFoundException(`Notification with ID ${id} not found`);
      }

      return notification;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Unexpected error fetching notification:', error);
      throw new InternalServerErrorException('Failed to fetch notification');
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(
    id: string,
    userId: string,
    markReadDto?: MarkNotificationReadDto,
  ): Promise<{ success: boolean }> {
    try {
      const supabase = this.getSupabaseClient();

      // Verify notification exists and belongs to user
      const notification = await this.findOne(id, userId);

      const readAt = markReadDto?.read_at || new Date().toISOString();

      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: readAt,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        this.logger.error(
          `Error marking notification ${id} as read for user ${userId}:`,
          error,
        );
        throw new InternalServerErrorException(
          'Failed to mark notification as read',
        );
      }

      this.logger.log(
        `Notification ${id} marked as read by user ${userId}`,
      );
      return { success: true };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error('Unexpected error marking notification as read:', error);
      throw new InternalServerErrorException(
        'Failed to mark notification as read',
      );
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<{ success: boolean; count: number }> {
    try {
      const supabase = this.getSupabaseClient();

      const { data, error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('is_read', false)
        .select('id');

      if (error) {
        this.logger.error(
          `Error marking all notifications as read for user ${userId}:`,
          error,
        );
        throw new InternalServerErrorException(
          'Failed to mark all notifications as read',
        );
      }

      const count = data?.length || 0;
      this.logger.log(
        `Marked ${count} notifications as read for user ${userId}`,
      );
      return { success: true, count };
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.error(
        'Unexpected error marking all notifications as read:',
        error,
      );
      throw new InternalServerErrorException(
        'Failed to mark all notifications as read',
      );
    }
  }

  /**
   * Delete a notification
   */
  async remove(id: string, userId: string): Promise<void> {
    try {
      const supabase = this.getSupabaseClient();

      // Verify notification exists and belongs to user
      await this.findOne(id, userId);

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        this.logger.error(`Error deleting notification ${id}:`, error);
        throw new InternalServerErrorException('Failed to delete notification');
      }

      this.logger.log(`Notification deleted: ${id}`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.error('Unexpected error deleting notification:', error);
      throw new InternalServerErrorException('Failed to delete notification');
    }
  }

  /**
   * Get unread notification count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      this.logger.log(`[getUnreadCount] Getting unread count for user: ${userId}`);
      const supabase = this.getSupabaseClient();

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        this.logger.error(
          `[getUnreadCount] Error getting unread count for user ${userId}:`,
          error,
        );
        this.logger.error(`[getUnreadCount] Error details: ${JSON.stringify(error)}`);
        throw new InternalServerErrorException(
          'Failed to get unread notification count',
        );
      }

      const unreadCount = count || 0;
      this.logger.log(`[getUnreadCount] User ${userId} has ${unreadCount} unread notifications`);
      return unreadCount;
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.error('[getUnreadCount] Unexpected error getting unread count:', error);
      throw new InternalServerErrorException(
        'Failed to get unread notification count',
      );
    }
  }
}

