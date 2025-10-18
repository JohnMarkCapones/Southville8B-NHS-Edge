import { Controller, Get, Sse, MessageEvent } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import {
  AdminDashboardService,
  AdminDashboardMetrics,
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

  @Get('metrics/stream')
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
}
