import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  ParseIntPipe,
  DefaultValuePipe,
  ParseBoolPipe,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { BulkCreateSchedulesDto } from './dto/bulk-create-schedules.dto';
import { AssignStudentsDto } from './dto/assign-students.dto';
import { ConflictCheckDto } from './dto/conflict-check.dto';
import { SearchSchedulesDto } from './dto/search-schedules.dto';
import { Schedule } from './entities/schedule.entity';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/dto/create-user.dto';
import { AuthUser } from '../auth/auth-user.decorator';
import { AuditInterceptor } from './audit.interceptor';

@ApiTags('Schedules')
@Controller('schedules')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
@ApiBearerAuth('JWT-auth')
export class SchedulesController {
  private readonly logger = new Logger(SchedulesController.name);

  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Create a new schedule' })
  @ApiResponse({
    status: 201,
    description: 'Schedule created successfully',
    type: Schedule,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - schedule conflicts detected',
  })
  async create(
    @Body() createScheduleDto: CreateScheduleDto,
    @AuthUser() user: any,
  ): Promise<Schedule> {
    this.logger.log(`Creating schedule for user: ${user.id}`);
    return this.schedulesService.create(createScheduleDto);
  }

  @Post('bulk')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Create multiple schedules in bulk' })
  @ApiResponse({
    status: 201,
    description: 'Schedules created successfully',
    type: [Schedule],
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - schedule conflicts detected',
  })
  async bulkCreate(
    @Body() bulkCreateSchedulesDto: BulkCreateSchedulesDto,
    @AuthUser() user: any,
  ): Promise<Schedule[]> {
    this.logger.log(
      `Bulk creating ${bulkCreateSchedulesDto.schedules.length} schedules for user: ${user.id}`,
    );
    return this.schedulesService.bulkCreate(bulkCreateSchedulesDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({ summary: 'Get all schedules with pagination and filtering' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiQuery({
    name: 'sectionId',
    required: false,
    type: String,
    description: 'Filter by section ID',
  })
  @ApiQuery({
    name: 'teacherId',
    required: false,
    type: String,
    description: 'Filter by teacher ID',
  })
  @ApiQuery({
    name: 'dayOfWeek',
    required: false,
    enum: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ],
    description: 'Filter by day of the week',
  })
  @ApiQuery({
    name: 'schoolYear',
    required: false,
    type: String,
    description: 'Filter by school year (e.g., 2024-2025)',
  })
  @ApiQuery({
    name: 'semester',
    required: false,
    enum: ['1st', '2nd'],
    description: 'Filter by semester',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by teacher name, subject name, or section name',
  })
  @ApiResponse({
    status: 200,
    description: 'Schedules retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('sectionId') sectionId?: string,
    @Query('teacherId') teacherId?: string,
    @Query('dayOfWeek') dayOfWeek?: string,
    @Query('schoolYear') schoolYear?: string,
    @Query('semester') semester?: string,
    @Query('search') search?: string,
  ): Promise<{ data: Schedule[]; pagination: any }> {
    const filters: SearchSchedulesDto = {
      page,
      limit,
      sectionId,
      teacherId,
      dayOfWeek: dayOfWeek as any,
      schoolYear,
      semester: semester as any,
      search,
    };

    return this.schedulesService.findAll(filters);
  }

  @Get('search')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Search schedules by teacher name (Admin only)' })
  @ApiQuery({
    name: 'search',
    required: true,
    type: String,
    description: 'Search term for teacher name, subject name, or section name',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async search(
    @Query('search') search: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<{ data: Schedule[]; pagination: any }> {
    const filters: SearchSchedulesDto = {
      search,
      page,
      limit,
    };

    return this.schedulesService.findAll(filters);
  }

  @Get('section/:sectionId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({ summary: 'Get all schedules for a specific section' })
  @ApiResponse({
    status: 200,
    description: 'Section schedules retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Section not found' })
  async getSectionSchedules(
    @Param('sectionId') sectionId: string,
  ): Promise<{ data: Schedule[]; pagination: any }> {
    return this.schedulesService.findAll({ sectionId });
  }

  @Get('teacher/:teacherId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({ summary: 'Get all schedules for a specific teacher' })
  @ApiResponse({
    status: 200,
    description: 'Teacher schedules retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Teacher not found' })
  async getTeacherSchedules(
    @Param('teacherId') teacherId: string,
  ): Promise<{ data: Schedule[]; pagination: any }> {
    return this.schedulesService.findAll({ teacherId });
  }

  @Get('student/:studentId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({ summary: 'Get all schedules for a specific student' })
  @ApiResponse({
    status: 200,
    description: 'Student schedules retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  async getStudentSchedules(
    @Param('studentId') studentId: string,
    @AuthUser() user: any,
  ): Promise<Schedule[]> {
    // Students can only access their own schedules
    if (user.role === 'Student' && user.studentId !== studentId) {
      throw new ForbiddenException('You can only access your own schedule');
    }

    return this.schedulesService.getStudentSchedule(studentId);
  }

  @Get('my-schedule')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: "Get authenticated student's schedule" })
  @ApiResponse({
    status: 200,
    description: 'Student schedule retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Student only' })
  async getMySchedule(@AuthUser() user: any): Promise<Schedule[]> {
    return this.schedulesService.getStudentSchedule(user.studentId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({ summary: 'Get schedule by ID' })
  @ApiResponse({
    status: 200,
    description: 'Schedule retrieved successfully',
    type: Schedule,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  async findOne(@Param('id') id: string): Promise<Schedule> {
    return this.schedulesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Update schedule' })
  @ApiResponse({
    status: 200,
    description: 'Schedule updated successfully',
    type: Schedule,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - schedule conflicts detected',
  })
  async update(
    @Param('id') id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
    @AuthUser() user: any,
  ): Promise<Schedule> {
    this.logger.log(`Updating schedule ${id} for user: ${user.id}`);
    return this.schedulesService.update(id, updateScheduleDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Delete schedule' })
  @ApiResponse({
    status: 200,
    description: 'Schedule deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.schedulesService.remove(id);
  }

  @Post(':id/students')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Assign students to schedule' })
  @ApiResponse({
    status: 201,
    description: 'Students assigned to schedule successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  async assignStudents(
    @Param('id') scheduleId: string,
    @Body() assignStudentsDto: AssignStudentsDto,
    @AuthUser() user: any,
  ): Promise<void> {
    this.logger.log(
      `Assigning ${assignStudentsDto.studentIds.length} students to schedule ${scheduleId} for user: ${user.id}`,
    );
    return this.schedulesService.assignStudents(scheduleId, assignStudentsDto);
  }

  @Delete(':id/students')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Remove students from schedule' })
  @ApiResponse({
    status: 200,
    description: 'Students removed from schedule successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  async removeStudents(
    @Param('id') scheduleId: string,
    @Body('studentIds') studentIds: string[],
    @AuthUser() user: any,
  ): Promise<void> {
    this.logger.log(
      `Removing ${studentIds.length} students from schedule ${scheduleId} for user: ${user.id}`,
    );
    return this.schedulesService.removeStudents(scheduleId, studentIds);
  }

  @Post('check-conflicts')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Check for schedule conflicts' })
  @ApiResponse({
    status: 200,
    description: 'Conflict check completed',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async checkConflicts(
    @Body() conflictCheckDto: ConflictCheckDto,
    @AuthUser() user: any,
  ): Promise<{ hasConflicts: boolean; conflicts: any[] }> {
    this.logger.log(`Checking conflicts for user: ${user.id}`);
    return this.schedulesService.validateScheduleConflicts(conflictCheckDto);
  }
}
