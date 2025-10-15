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
  Logger,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { AcademicCalendarService } from './academic-calendar.service';
import { CreateAcademicCalendarDto } from './dto/create-academic-calendar.dto';
import { UpdateAcademicCalendarDto } from './dto/update-academic-calendar.dto';
import { CreateCalendarDayDto } from './dto/create-calendar-day.dto';
import { UpdateCalendarDayDto } from './dto/update-calendar-day.dto';
import { CreateMarkerDto } from './dto/create-marker.dto';
import { UpdateMarkerDto } from './dto/update-marker.dto';
import { QueryCalendarDto } from './dto/query-calendar.dto';
import { AcademicCalendar } from './entities/academic-calendar.entity';
import { AcademicCalendarDay } from './entities/academic-calendar-day.entity';
import { AcademicCalendarMarker } from './entities/academic-calendar-marker.entity';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../auth/decorators/roles.decorator';

@ApiTags('Academic Calendar')
@Controller('academic-calendar')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class AcademicCalendarController {
  private readonly logger = new Logger(AcademicCalendarController.name);

  constructor(
    private readonly academicCalendarService: AcademicCalendarService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Create a new academic calendar (Admin only)',
    description:
      'Create a new academic calendar with optional auto-generation of days',
  })
  @ApiResponse({
    status: 201,
    description: 'Academic calendar created successfully',
    type: AcademicCalendar,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Calendar already exists for the same period',
  })
  async create(
    @Body() createAcademicCalendarDto: CreateAcademicCalendarDto,
  ): Promise<AcademicCalendar> {
    return this.academicCalendarService.create(createAcademicCalendarDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({
    summary: 'Get all academic calendars',
    description:
      'Retrieve all academic calendars with optional filtering and pagination',
  })
  @ApiQuery({
    name: 'year',
    required: false,
    description: 'Filter by academic year',
    type: String,
  })
  @ApiQuery({
    name: 'month_name',
    required: false,
    description: 'Filter by month name',
    type: String,
  })
  @ApiQuery({
    name: 'term',
    required: false,
    description: 'Filter by academic term',
    type: String,
  })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'Filter calendars that include this date',
    type: String,
  })
  @ApiQuery({
    name: 'include_days',
    required: false,
    description: 'Include calendar days in response',
    type: Boolean,
  })
  @ApiQuery({
    name: 'include_markers',
    required: false,
    description: 'Include calendar markers in response',
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
    enum: ['created_at', 'start_date', 'end_date', 'year', 'month_name'],
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
  })
  @ApiResponse({
    status: 200,
    description: 'Academic calendars retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/AcademicCalendar' },
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
  async findAll(@Query() queryDto: QueryCalendarDto): Promise<{
    data: AcademicCalendar[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.academicCalendarService.findAll(queryDto);
  }

  @Get('current')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({
    summary: 'Get current month calendar',
    description: 'Retrieve the academic calendar for the current month',
  })
  @ApiResponse({
    status: 200,
    description: 'Current calendar retrieved successfully',
    type: AcademicCalendar,
  })
  @ApiResponse({
    status: 404,
    description: 'No current calendar found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getCurrentCalendar(): Promise<AcademicCalendar | null> {
    return this.academicCalendarService.getCurrentCalendar();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({
    summary: 'Get a specific academic calendar by ID',
    description: 'Retrieve a single academic calendar with optional days',
  })
  @ApiParam({
    name: 'id',
    description: 'Academic calendar ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'includeDays',
    required: false,
    description: 'Include calendar days in response',
    type: Boolean,
  })
  @ApiResponse({
    status: 200,
    description: 'Academic calendar retrieved successfully',
    type: AcademicCalendar,
  })
  @ApiResponse({
    status: 404,
    description: 'Academic calendar not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async findOne(
    @Param('id') id: string,
    @Query('includeDays') includeDays?: boolean,
  ): Promise<AcademicCalendar> {
    return this.academicCalendarService.findOne(id, includeDays);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update an academic calendar (Admin only)',
    description: 'Update an existing academic calendar',
  })
  @ApiParam({
    name: 'id',
    description: 'Academic calendar ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Academic calendar updated successfully',
    type: AcademicCalendar,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({
    status: 404,
    description: 'Academic calendar not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateAcademicCalendarDto: UpdateAcademicCalendarDto,
  ): Promise<AcademicCalendar> {
    return this.academicCalendarService.update(id, updateAcademicCalendarDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Delete an academic calendar (Admin only)',
    description: 'Permanently delete an academic calendar and all related data',
  })
  @ApiParam({
    name: 'id',
    description: 'Academic calendar ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Academic calendar deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({
    status: 404,
    description: 'Academic calendar not found',
  })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.academicCalendarService.remove(id);
    return { message: 'Academic calendar deleted successfully' };
  }

  @Post(':id/generate-days')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Regenerate calendar days (Admin only)',
    description: 'Regenerate all calendar days for a specific calendar',
  })
  @ApiParam({
    name: 'id',
    description: 'Academic calendar ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Calendar days regenerated successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({
    status: 404,
    description: 'Academic calendar not found',
  })
  async generateDays(@Param('id') id: string): Promise<{ message: string }> {
    await this.academicCalendarService.generateDays(id);
    return { message: 'Calendar days regenerated successfully' };
  }

  @Get(':id/days')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({
    summary: 'Get all days for a calendar',
    description: 'Retrieve all calendar days for a specific academic calendar',
  })
  @ApiParam({
    name: 'id',
    description: 'Academic calendar ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Calendar days retrieved successfully',
    type: [AcademicCalendarDay],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Academic calendar not found',
  })
  async getCalendarDays(
    @Param('id') id: string,
  ): Promise<AcademicCalendarDay[]> {
    const calendar = await this.academicCalendarService.findOne(id, true);
    return calendar.days || [];
  }

  @Patch('days/:dayId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update a calendar day (Admin only)',
    description: 'Update a specific calendar day',
  })
  @ApiParam({
    name: 'dayId',
    description: 'Calendar day ID',
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: 'Calendar day updated successfully',
    type: AcademicCalendarDay,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({
    status: 404,
    description: 'Calendar day not found',
  })
  async updateDay(
    @Param('dayId') dayId: string,
    @Body() updateCalendarDayDto: UpdateCalendarDayDto,
  ): Promise<AcademicCalendarDay> {
    return this.academicCalendarService.updateDay(
      parseInt(dayId),
      updateCalendarDayDto,
    );
  }

  @Post(':id/markers')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Add marker to calendar (Admin only)',
    description: 'Add a marker to an academic calendar',
  })
  @ApiParam({
    name: 'id',
    description: 'Academic calendar ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 201,
    description: 'Marker added successfully',
    type: AcademicCalendarMarker,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async addCalendarMarker(
    @Param('id') id: string,
    @Body() createMarkerDto: CreateMarkerDto,
  ): Promise<AcademicCalendarMarker> {
    return this.academicCalendarService.addMarker(createMarkerDto, id);
  }

  @Post('days/:dayId/markers')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Add marker to calendar day (Admin only)',
    description: 'Add a marker to a specific calendar day',
  })
  @ApiParam({
    name: 'dayId',
    description: 'Calendar day ID',
    example: '1',
  })
  @ApiResponse({
    status: 201,
    description: 'Marker added successfully',
    type: AcademicCalendarMarker,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async addDayMarker(
    @Param('dayId', ParseIntPipe) dayId: number,
    @Body() createMarkerDto: CreateMarkerDto,
  ): Promise<AcademicCalendarMarker> {
    // Fetch the day record to get the calendar ID
    const day = await this.academicCalendarService.findDayById(dayId);

    if (!day) {
      throw new NotFoundException(`Calendar day with ID ${dayId} not found`);
    }

    return this.academicCalendarService.addMarker(
      createMarkerDto,
      day.academic_calendar_id,
      dayId,
    );
  }

  @Post('update-current-day')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update current day flag (Admin only)',
    description:
      'Update the current day flag for all calendar days (for cron jobs)',
  })
  @ApiResponse({
    status: 200,
    description: 'Current day updated successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async updateCurrentDay(): Promise<{ message: string }> {
    await this.academicCalendarService.updateCurrentDay();
    return { message: 'Current day updated successfully' };
  }
}
