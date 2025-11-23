import { Controller, Get, Post, Body, UseGuards, Logger } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TeacherActivityService } from './teacher-activity.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthUser } from '../auth/auth-user.decorator';
import { UserRole } from '../users/dto/create-user.dto';

export interface TeacherActivityDto {
  studentName: string;
  studentInitials: string;
  activity: string;
  timeAgo: string;
  timestamp: Date;
}

@ApiTags('Teacher Activity')
@ApiBearerAuth('JWT-auth')
@Controller('teacher-activity')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class TeacherActivityController {
  private readonly logger = new Logger(TeacherActivityController.name);

  constructor(
    private readonly teacherActivityService: TeacherActivityService,
  ) {}

  @Get('recent')
  @Roles(UserRole.TEACHER)
  @ApiOperation({
    summary: 'Get recent student activities for authenticated teacher',
    description:
      "Returns recent activities from students in the teacher's classes (submissions, quiz attempts, downloads)",
  })
  @ApiResponse({
    status: 200,
    description: 'Recent student activities retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          studentName: { type: 'string', description: 'Student full name' },
          studentInitials: { type: 'string', description: 'Student initials' },
          activity: { type: 'string', description: 'Activity description' },
          timeAgo: { type: 'string', description: 'Human-readable time ago' },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'Activity timestamp',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Teacher access required',
  })
  async getRecentActivities(
    @AuthUser() user: any,
  ): Promise<TeacherActivityDto[]> {
    this.logger.log(`Getting recent activities for teacher: ${user.id}`);
    return this.teacherActivityService.getRecentActivities(user.id);
  }

  @Post('activities')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Log a teacher activity',
    description: 'Creates a new activity record for the authenticated teacher',
  })
  @ApiResponse({
    status: 201,
    description: 'Activity logged successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createActivity(
    @AuthUser() user: any,
    @Body() activityData: any,
  ): Promise<{ success: boolean; id?: string }> {
    this.logger.log(`Logging activity for teacher: ${user.id}`);
    return this.teacherActivityService.createActivity(user.id, activityData);
  }
}
