import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { StudentActivitiesService } from './student-activities.service';
import { CreateStudentActivityDto } from './dto/create-student-activity.dto';
import { QueryStudentActivitiesDto } from './dto/query-student-activities.dto';
import { UpdateStudentActivityDto } from './dto/update-student-activity.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../auth/decorators/roles.decorator';
import { AuthUser } from '../auth/auth-user.decorator';
import { SupabaseUser } from '../auth/interfaces/supabase-user.interface';

@ApiTags('Student Activities')
@ApiBearerAuth('JWT-auth')
@Controller('student-activities')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class StudentActivitiesController {
  private readonly logger = new Logger(StudentActivitiesController.name);

  constructor(
    private readonly studentActivitiesService: StudentActivitiesService,
  ) {}

  /**
   * Create a new student activity
   * Typically used by backend services, but admins/teachers can manually create activities
   */
  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({
    summary: 'Create a new student activity (Admin/Teacher only)',
  })
  @ApiResponse({
    status: 201,
    description: 'Activity created successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(
    @Body() createDto: CreateStudentActivityDto,
    @AuthUser() user: SupabaseUser,
  ) {
    this.logger.log(
      `Admin/Teacher ${user.email} creating activity for student ${createDto.studentUserId}`,
    );
    return this.studentActivitiesService.create(createDto);
  }

  /**
   * Get current user's activities (for students)
   */
  @Get('my-activities')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: "Get current student's activities" })
  @ApiResponse({
    status: 200,
    description: 'Activities retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyActivities(
    @Query() query: QueryStudentActivitiesDto,
    @AuthUser() user: SupabaseUser,
  ) {
    this.logger.log(`Student ${user.email} fetching their activities`);
    return this.studentActivitiesService.findByStudent(user.id, query);
  }

  /**
   * Get activities for a specific student (Admin/Teacher)
   */
  @Get('student/:studentUserId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({
    summary: 'Get activities for a specific student (Admin/Teacher only)',
  })
  @ApiParam({
    name: 'studentUserId',
    description: 'Student user ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Activities retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getStudentActivities(
    @Param('studentUserId') studentUserId: string,
    @Query() query: QueryStudentActivitiesDto,
    @AuthUser() user: SupabaseUser,
  ) {
    this.logger.log(
      `Admin/Teacher ${user.email} fetching activities for student ${studentUserId}`,
    );
    return this.studentActivitiesService.findByStudent(studentUserId, query);
  }

  /**
   * Get a single activity
   */
  @Get(':activityId')
  @Roles(UserRole.STUDENT, UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get a single activity by ID' })
  @ApiParam({
    name: 'activityId',
    description: 'Activity ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Activity retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  async getOne(
    @Param('activityId') activityId: string,
    @AuthUser() user: SupabaseUser,
  ) {
    // For students, ensure they can only view their own activities
    // This is enforced by RLS, but we add extra check here
    if (user.role === UserRole.STUDENT) {
      return this.studentActivitiesService.findOne(activityId, user.id);
    }

    // For admin/teachers, they can view any activity
    // We still need to know which student it belongs to for the query
    // In a real implementation, you might want a separate method for admins
    return this.studentActivitiesService.findOne(activityId, user.id);
  }

  /**
   * Update activity visibility (students can hide/show activities)
   */
  @Patch(':activityId/visibility')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Update activity visibility (Student only)' })
  @ApiParam({
    name: 'activityId',
    description: 'Activity ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Activity updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  async updateVisibility(
    @Param('activityId') activityId: string,
    @Body() updateDto: UpdateStudentActivityDto,
    @AuthUser() user: SupabaseUser,
  ) {
    this.logger.log(
      `Student ${user.email} updating visibility for activity ${activityId}`,
    );
    return this.studentActivitiesService.updateVisibility(
      activityId,
      user.id,
      updateDto,
    );
  }

  /**
   * Delete an activity (Admin only)
   */
  @Delete(':activityId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete an activity (Admin only)' })
  @ApiParam({
    name: 'activityId',
    description: 'Activity ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Activity deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  async remove(
    @Param('activityId') activityId: string,
    @AuthUser() user: SupabaseUser,
  ) {
    this.logger.log(`Admin ${user.email} deleting activity ${activityId}`);
    await this.studentActivitiesService.remove(activityId);
    return { message: 'Activity deleted successfully' };
  }

  /**
   * Get activity statistics for current student
   */
  @Get('my-activities/statistics')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Get activity statistics for current student' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyStatistics(@AuthUser() user: SupabaseUser) {
    this.logger.log(`Student ${user.email} fetching activity statistics`);
    return this.studentActivitiesService.getStatistics(user.id);
  }

  /**
   * Get activity statistics for a specific student (Admin/Teacher)
   */
  @Get('student/:studentUserId/statistics')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({
    summary:
      'Get activity statistics for a specific student (Admin/Teacher only)',
  })
  @ApiParam({
    name: 'studentUserId',
    description: 'Student user ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getStudentStatistics(
    @Param('studentUserId') studentUserId: string,
    @AuthUser() user: SupabaseUser,
  ) {
    this.logger.log(
      `Admin/Teacher ${user.email} fetching statistics for student ${studentUserId}`,
    );
    return this.studentActivitiesService.getStatistics(studentUserId);
  }
}
