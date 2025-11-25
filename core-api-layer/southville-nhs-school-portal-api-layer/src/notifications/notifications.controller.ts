import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  Query,
  Body,
  UseGuards,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { MarkNotificationReadDto } from './dto/mark-notification-read.dto';
import { Notification } from './entities/notification.entity';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../auth/decorators/roles.decorator';
import { AuthUser } from '../auth/auth-user.decorator';
import { SupabaseUser } from '../auth/interfaces/supabase-user.interface';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('my')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({
    summary: 'Get notifications for current user',
    description: 'Retrieve notifications for the authenticated user',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filter by notification type',
    enum: ['info', 'warning', 'success', 'error', 'system'],
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by notification category',
    enum: ['user_account', 'academic', 'event_announcement', 'system', 'communication'],
  })
  @ApiQuery({
    name: 'is_read',
    required: false,
    description: 'Filter by read status',
    type: Boolean,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
    type: Number,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Sort by field',
    enum: ['created_at', 'read_at', 'title'],
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
  })
  @ApiResponse({
    status: 200,
    description: 'User notifications retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/Notification' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getMyNotifications(
    @Query() queryDto: QueryNotificationDto,
    @AuthUser() user: SupabaseUser,
  ): Promise<{
    data: Notification[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  }> {
    this.logger.log(`[getMyNotifications] ========== NOTIFICATION REQUEST ==========`);
    this.logger.log(`[getMyNotifications] User ID: ${user.id}`);
    this.logger.log(`[getMyNotifications] User email: ${user.email}`);
    this.logger.log(`[getMyNotifications] User role: ${user.role || 'N/A'}`);
    this.logger.log(`[getMyNotifications] Query params: ${JSON.stringify(queryDto)}`);
    this.logger.log(`[getMyNotifications] Full user object: ${JSON.stringify(user, null, 2)}`);
    
    const result = await this.notificationsService.findByUserId(user.id, queryDto);
    
    this.logger.log(`[getMyNotifications] Query result: ${result.data.length} notifications out of ${result.total} total`);
    this.logger.log(`[getMyNotifications] ==========================================`);
    
    return result;
  }

  @Get('unread-count')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({
    summary: 'Get unread notification count',
    description: 'Get the count of unread notifications for the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'Unread count retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number' },
      },
    },
  })
  async getUnreadCount(@AuthUser() user: SupabaseUser): Promise<{ count: number }> {
    this.logger.log(`[getUnreadCount] Request received for user: ${user.id}`);
    this.logger.log(`[getUnreadCount] User email: ${user.email}, role: ${user.role}`);
    const count = await this.notificationsService.getUnreadCount(user.id);
    this.logger.log(`[getUnreadCount] Returning count: ${count}`);
    return { count };
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({
    summary: 'Get a specific notification by ID',
    description: 'Retrieve a single notification with all details',
  })
  @ApiParam({
    name: 'id',
    description: 'Notification ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Notification retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Notification not found',
  })
  async getNotification(
    @Param('id') id: string,
    @AuthUser() user: SupabaseUser,
  ): Promise<Notification> {
    return this.notificationsService.findOne(id, user.id);
  }

  @Post()
  @Roles(UserRole.ADMIN) // Only admins can create notifications directly
  @ApiOperation({
    summary: 'Create a new notification',
    description: 'Create a notification for a specific user (admin only)',
  })
  @ApiResponse({
    status: 201,
    description: 'Notification created successfully',
  })
  async createNotification(
    @Body() createNotificationDto: CreateNotificationDto,
    @AuthUser() user: SupabaseUser,
  ): Promise<Notification> {
    return this.notificationsService.create(createNotificationDto, user.id);
  }

  @Patch(':id/read')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({
    summary: 'Mark a notification as read',
    description: 'Mark a specific notification as read for the current user',
  })
  @ApiParam({
    name: 'id',
    description: 'Notification ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Notification not found',
  })
  async markAsRead(
    @Param('id') id: string,
    @Body() markReadDto: MarkNotificationReadDto,
    @AuthUser() user: SupabaseUser,
  ): Promise<{ success: boolean }> {
    return this.notificationsService.markAsRead(id, user.id, markReadDto);
  }

  @Post('mark-all-read')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({
    summary: 'Mark all notifications as read',
    description: 'Mark all unread notifications as read for the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as read successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        count: { type: 'number' },
      },
    },
  })
  async markAllAsRead(@AuthUser() user: SupabaseUser): Promise<{
    success: boolean;
    count: number;
  }> {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({
    summary: 'Delete a notification',
    description: 'Delete a specific notification (user can only delete their own)',
  })
  @ApiParam({
    name: 'id',
    description: 'Notification ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Notification deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Notification not found',
  })
  async deleteNotification(
    @Param('id') id: string,
    @AuthUser() user: SupabaseUser,
  ): Promise<void> {
    return this.notificationsService.remove(id, user.id);
  }
}

