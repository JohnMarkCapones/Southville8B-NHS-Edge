import { Controller, Get, Sse, MessageEvent, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import {
  DesktopSidebarService,
  SidebarMetrics,
} from './desktop-sidebar.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/dto/create-user.dto';

@ApiTags('Desktop Sidebar')
@Controller('desktop-sidebar')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class DesktopSidebarController {
  constructor(private readonly desktopSidebarService: DesktopSidebarService) {}

  @Get('kpi/stream')
  @Sse('kpi/stream')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get real-time sidebar KPI metrics stream',
    description:
      'Server-Sent Events stream for live sidebar KPI metrics updates (Events, Teachers, Students, Sections)',
  })
  @ApiResponse({
    status: 200,
    description: 'SSE stream of sidebar KPI metrics',
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
    return this.desktopSidebarService.getMetricsStream();
  }

  @Get('kpi')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get current sidebar KPI metrics',
    description: 'Get current sidebar KPI metrics (one-time request)',
  })
  @ApiResponse({
    status: 200,
    description: 'Current sidebar KPI metrics',
    schema: {
      type: 'object',
      properties: {
        events: { type: 'number', description: 'Number of approved events' },
        teachers: { type: 'number', description: 'Number of teachers' },
        students: { type: 'number', description: 'Number of students' },
        sections: { type: 'number', description: 'Number of sections' },
        lastUpdated: { type: 'string', description: 'Last update timestamp' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getMetrics(): Promise<SidebarMetrics> {
    return await this.desktopSidebarService.triggerMetricsUpdate();
  }
}
