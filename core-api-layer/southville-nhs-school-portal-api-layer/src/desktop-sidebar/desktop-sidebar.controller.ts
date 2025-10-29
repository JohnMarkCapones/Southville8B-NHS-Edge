import {
  Controller,
  Get,
  Sse,
  MessageEvent,
  UseGuards,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import {
  DesktopSidebarService,
  SidebarMetrics,
  TeacherSidebarMetrics,
} from './desktop-sidebar.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/dto/create-user.dto';
import { AuthUser } from '../auth/auth-user.decorator';

@ApiTags('Desktop Sidebar')
@Controller('desktop-sidebar')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class DesktopSidebarController {
  constructor(private readonly desktopSidebarService: DesktopSidebarService) {}

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

  @Sse('teacher/kpi/stream')
  @Roles(UserRole.TEACHER)
  @ApiOperation({
    summary: 'Get real-time teacher sidebar KPI metrics stream',
    description:
      'Server-Sent Events stream for live teacher sidebar KPI metrics updates (Classes, Assignments, Students, Messages)',
  })
  @ApiResponse({
    status: 200,
    description: 'SSE stream of teacher sidebar KPI metrics',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'string', description: 'JSON string of teacher metrics' },
        type: { type: 'string', description: 'Event type' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Teacher access required',
  })
  streamTeacherMetrics(@AuthUser() user: any): Observable<MessageEvent> {
    return this.desktopSidebarService.getTeacherMetricsStream(user.id);
  }

  @Get('teacher/kpi')
  @Roles(UserRole.TEACHER)
  @ApiOperation({
    summary: 'Get current teacher sidebar KPI metrics',
    description: 'Get current teacher sidebar KPI metrics (one-time request)',
  })
  @ApiResponse({
    status: 200,
    description: 'Current teacher sidebar KPI metrics',
    schema: {
      type: 'object',
      properties: {
        totalClasses: {
          type: 'number',
          description: 'Number of active classes',
        },
        totalAnnouncements: {
          type: 'number',
          description: 'Number of announcements posted by teacher',
        },
        totalStudents: { type: 'number', description: 'Number of students' },
        unreadMessages: {
          type: 'number',
          description: 'Number of unread messages',
        },
        lastUpdated: { type: 'string', description: 'Last update timestamp' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Teacher access required',
  })
  async getTeacherMetrics(
    @AuthUser() user: any,
  ): Promise<TeacherSidebarMetrics> {
    return await this.desktopSidebarService.triggerTeacherMetricsUpdate(
      user.id,
    );
  }

  @Get('student-distribution')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get student distribution for grades 7-10',
    description:
      'Returns total students and counts per grade from the students table.',
  })
  @ApiResponse({ status: 200, description: 'Student distribution payload' })
  async getStudentDistribution(): Promise<{
    total: number;
    grades: { grade: string; count: number }[];
  }> {
    return await this.desktopSidebarService.getStudentDistribution();
  }
}
