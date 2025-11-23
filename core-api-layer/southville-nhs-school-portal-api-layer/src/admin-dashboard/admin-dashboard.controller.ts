import {
  Controller,
  Get,
  Sse,
  MessageEvent,
  Query,
  Post,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import {
  AdminDashboardService,
  AdminDashboardMetrics,
  AdminActivity,
} from './admin-dashboard.service';
import { UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/dto/create-user.dto';

@ApiTags('Desktop Admin Dashboard')
@Controller('desktop-admin-dashboard')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class AdminDashboardController {
  constructor(private readonly adminDashboardService: AdminDashboardService) {}

  @Get('metrics')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get desktop admin dashboard metrics',
    description:
      'Get current desktop admin dashboard metrics (one-time request)',
  })
  @ApiResponse({
    status: 200,
    description: 'Current admin dashboard metrics',
    schema: {
      type: 'object',
      properties: {
        totalStudents: {
          type: 'number',
          description: 'Number of active students',
        },
        activeTeachers: {
          type: 'number',
          description: 'Number of active teachers',
        },
        totalSections: { type: 'number', description: 'Number of sections' },
        onlineUsersCount: {
          type: 'number',
          description: 'Number of online users',
        },
        lastUpdated: { type: 'string', description: 'Last update timestamp' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getMetrics(): Promise<AdminDashboardMetrics> {
    return await this.adminDashboardService.triggerMetricsUpdate();
  }

  @Sse('metrics/stream')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get real-time desktop admin dashboard metrics stream',
    description:
      'Server-Sent Events stream for live desktop admin dashboard metrics updates',
  })
  @ApiResponse({
    status: 200,
    description: 'SSE stream of admin dashboard metrics',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'string', description: 'JSON string of metrics' },
        type: { type: 'string', description: 'Event type' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  streamMetrics(): Observable<MessageEvent> {
    return this.adminDashboardService.getMetricsStream();
  }

  @Get('activities')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({
    summary: 'Get recent admin activities',
    description: 'Get recent admin and teacher activities for the dashboard',
  })
  @ApiResponse({
    status: 200,
    description: 'List of recent admin activities',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Activity ID' },
          userId: {
            type: 'string',
            description: 'User ID who performed the action',
          },
          userName: { type: 'string', description: 'Full name of the user' },
          actionType: {
            type: 'string',
            description: 'Type of action performed',
          },
          description: { type: 'string', description: 'Activity description' },
          entityType: {
            type: 'string',
            description: 'Type of entity affected',
          },
          entityId: { type: 'string', description: 'ID of entity affected' },
          metadata: { type: 'object', description: 'Additional metadata' },
          icon: { type: 'string', description: 'Icon name for UI display' },
          color: { type: 'string', description: 'Color code for UI display' },
          createdAt: { type: 'string', description: 'Activity timestamp' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin or Teacher access required',
  })
  async getRecentActivities(
    @Query('limit') limit?: string,
  ): Promise<AdminActivity[]> {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return await this.adminDashboardService.getRecentActivities(limitNum);
  }

  @Post('activities')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({
    summary: 'Create admin activity log',
    description: 'Log an admin or teacher activity for audit trail',
  })
  @ApiResponse({
    status: 201,
    description: 'Activity logged successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin or Teacher access required',
  })
  async createActivity(
    @Body()
    activityData: {
      user_id: string;
      action_type: string;
      description: string;
      entity_type?: string;
      entity_id?: string;
      icon?: string;
      color?: string;
      metadata?: any;
    },
  ): Promise<{ success: boolean; id?: string }> {
    return await this.adminDashboardService.createActivity(activityData);
  }
}
