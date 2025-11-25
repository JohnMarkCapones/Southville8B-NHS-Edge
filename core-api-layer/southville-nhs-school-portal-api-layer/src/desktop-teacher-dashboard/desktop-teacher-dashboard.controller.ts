import { Controller, Get, Query, UseGuards, Logger } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthUser } from '../auth/auth-user.decorator';
import { UserRole } from '../users/dto/create-user.dto';
import { DesktopTeacherDashboardService } from './desktop-teacher-dashboard.service';

@ApiTags('Desktop Teacher Dashboard')
@ApiBearerAuth('JWT-auth')
@Controller('desktop-teacher-dashboard')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class DesktopTeacherDashboardController {
  private readonly logger = new Logger(DesktopTeacherDashboardController.name);

  constructor(
    private readonly desktopTeacherDashboardService: DesktopTeacherDashboardService,
  ) {}

  @Get('activities')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get recent teacher activities for desktop app',
    description:
      'Returns recent activities performed by the authenticated teacher from teacher_activities table',
  })
  @ApiResponse({
    status: 200,
    description: 'Activities retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getRecentActivities(
    @AuthUser() user: any,
    @Query('limit') limit?: number,
  ): Promise<any[]> {
    this.logger.log(
      `Getting recent activities for teacher: ${user.id}, limit: ${limit || 10}`,
    );
    return this.desktopTeacherDashboardService.getRecentActivities(
      user.id,
      limit || 10,
    );
  }
}
