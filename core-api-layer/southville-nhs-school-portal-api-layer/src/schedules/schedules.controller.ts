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
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { BulkCreateSchedulesDto } from './dto/bulk-create-schedules.dto';
import { AssignStudentsDto } from './dto/assign-students.dto';
import { SearchSchedulesDto } from './dto/search-schedules.dto';
import { ConflictCheckDto } from './dto/conflict-check.dto';
import { Schedule } from './entities/schedule.entity';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthUser } from '../auth/auth-user.decorator';
import { UserRole } from '../users/dto/create-user.dto';
import { AuditInterceptor } from './audit.interceptor';

@ApiTags('Schedules')
@ApiBearerAuth('JWT-auth')
@Controller('schedules')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
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
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Schedule conflict detected' })
  async create(
    @Body() createScheduleDto: CreateScheduleDto,
    @AuthUser() user: any,
  ): Promise<Schedule> {
    this.logger.log(
      `Creating schedule for user: ${user.id}, section: ${createScheduleDto.sectionId}`,
    );
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
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async createBulk(
    @Body() bulkCreateSchedulesDto: BulkCreateSchedulesDto,
    @AuthUser() user: any,
  ): Promise<Schedule[]> {
    this.logger.log(
      `Creating ${bulkCreateSchedulesDto.schedules.length} schedules in bulk for user: ${user.id}`,
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
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
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
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
      'SUNDAY',
    ],
    description: 'Filter by day of week',
  })
  @ApiQuery({
    name: 'schoolYear',
    required: false,
    type: String,
    description: 'Filter by school year',
  })
  @ApiQuery({
    name: 'semester',
    required: false,
    enum: ['FIRST', 'SECOND', 'SUMMER'],
    description: 'Filter by semester',
  })
  @ApiResponse({
    status: 200,
    description: 'Schedules retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/Schedule' },
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            total: { type: 'number' },
            pages: { type: 'number' },
          },
        },
      },
    },
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
  ): Promise<{ data: Schedule[]; pagination: any }> {
    const filters: any = {
      sectionId,
      teacherId,
      dayOfWeek,
      schoolYear,
      semester,
    };

    // Remove undefined filters
    Object.keys(filters).forEach((key) => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });

    return this.schedulesService.findAll(filters);
  }

  @Get('search')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Search schedules by teacher name (Admin only)' })
  @ApiQuery({
    name: 'teacherName',
    required: true,
    type: String,
    description: 'Teacher name to search for',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
    type: [Schedule],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async searchSchedules(
    @Query() searchDto: SearchSchedulesDto,
  ): Promise<Schedule[]> {
    // Use findAll with teacherName filter
    const result = await this.schedulesService.findAll(searchDto);
    return result.data;
  }

  @Get('section/:sectionId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({ summary: 'Get all schedules for a specific section' })
  @ApiParam({ name: 'sectionId', description: 'Section ID' })
  @ApiResponse({
    status: 200,
    description: 'Section schedules retrieved successfully',
    type: [Schedule],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Section not found' })
  async getSchedulesBySection(
    @Param('sectionId') sectionId: string,
  ): Promise<Schedule[]> {
    const result = await this.schedulesService.findAll({ sectionId });
    return result.data;
  }

  @Get('teacher/:teacherId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({ summary: 'Get all schedules for a specific teacher' })
  @ApiParam({ name: 'teacherId', description: 'Teacher ID' })
  @ApiResponse({
    status: 200,
    description: 'Teacher schedules retrieved successfully',
    type: [Schedule],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Teacher not found' })
  async getSchedulesByTeacher(
    @Param('teacherId') teacherId: string,
  ): Promise<Schedule[]> {
    const result = await this.schedulesService.findAll({ teacherId });
    return result.data;
  }

  @Get('student/:studentId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({ summary: 'Get all schedules for a specific student' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  @ApiResponse({
    status: 200,
    description: 'Student schedules retrieved successfully',
    type: [Schedule],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  async getStudentSchedules(
    @Param('studentId') studentId: string,
    @AuthUser() user: any,
  ): Promise<Schedule[]> {
    // Students can only access their own schedules
    if (user.role === UserRole.STUDENT && user.studentId !== studentId) {
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
    type: [Schedule],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Student access required',
  })
  async getMySchedule(@AuthUser() user: any): Promise<Schedule[]> {
    return this.schedulesService.getStudentSchedule(user.studentId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({ summary: 'Get schedule by ID' })
  @ApiParam({ name: 'id', description: 'Schedule ID' })
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
  @ApiParam({ name: 'id', description: 'Schedule ID' })
  @ApiResponse({
    status: 200,
    description: 'Schedule updated successfully',
    type: Schedule,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  @ApiResponse({ status: 409, description: 'Schedule conflict detected' })
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
  @ApiParam({ name: 'id', description: 'Schedule ID' })
  @ApiResponse({
    status: 200,
    description: 'Schedule deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  async remove(@Param('id') id: string, @AuthUser() user: any): Promise<void> {
    this.logger.log(`Deleting schedule ${id} for user: ${user.id}`);
    return this.schedulesService.remove(id);
  }

  @Post(':id/students')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Assign students to schedule' })
  @ApiParam({ name: 'id', description: 'Schedule ID' })
  @ApiResponse({
    status: 200,
    description: 'Students assigned to schedule successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
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
  @ApiParam({ name: 'id', description: 'Schedule ID' })
  @ApiResponse({
    status: 200,
    description: 'Students removed from schedule successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  async removeStudents(
    @Param('id') scheduleId: string,
    @Body() dto: AssignStudentsDto,
    @AuthUser() user: any,
  ): Promise<void> {
    this.logger.log(
      `Removing ${dto.studentIds.length} students from schedule ${scheduleId} for user: ${user.id}`,
    );
    return this.schedulesService.removeStudents(scheduleId, dto.studentIds);
  }

  @Post('check-conflicts')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Check for schedule conflicts' })
  @ApiResponse({
    status: 200,
    description: 'Conflict check completed successfully',
    schema: {
      type: 'object',
      properties: {
        hasConflicts: { type: 'boolean' },
        conflicts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              message: { type: 'string' },
              conflictingSchedule: { $ref: '#/components/schemas/Schedule' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async checkConflicts(
    @Body() conflictCheckDto: ConflictCheckDto,
  ): Promise<{ hasConflicts: boolean; conflicts: any[] }> {
    return this.schedulesService.validateScheduleConflicts(conflictCheckDto);
  }
}
