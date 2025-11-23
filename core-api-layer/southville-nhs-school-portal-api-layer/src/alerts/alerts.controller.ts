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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { QueryAlertDto } from './dto/query-alert.dto';
import { MarkAlertReadDto } from './dto/mark-alert-read.dto';
import { Alert } from './entities/alert.entity';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../auth/decorators/roles.decorator';
import { AuthUser } from '../auth/auth-user.decorator';
import { SupabaseUser } from '../auth/interfaces/supabase-user.interface';

@ApiTags('Alerts')
@Controller('alerts')
export class AlertsController {
  private readonly logger = new Logger(AlertsController.name);

  constructor(private readonly alertsService: AlertsService) {}

  @Post()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create a new alert (Admin only)',
    description: 'Create a new alert that will be visible to all users',
  })
  @ApiResponse({
    status: 201,
    description: 'Alert created successfully',
    type: Alert,
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
  async create(
    @Body() createAlertDto: CreateAlertDto,
    @AuthUser() user: SupabaseUser,
  ): Promise<Alert> {
    return this.alertsService.create(createAlertDto, user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all alerts',
    description: 'Retrieve all alerts with optional filtering and pagination',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filter by alert type',
    enum: ['info', 'warning', 'success', 'error', 'system'],
  })
  @ApiQuery({
    name: 'includeExpired',
    required: false,
    description: 'Include expired alerts in results',
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
    enum: ['created_at', 'expires_at', 'title'],
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
  })
  @ApiResponse({
    status: 200,
    description: 'Alerts retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/Alert' },
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
  async findAll(@Query() queryDto: QueryAlertDto): Promise<{
    data: Alert[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    // Public endpoint - show all public alerts (no user filter)
    return this.alertsService.findAll(queryDto);
  }

  @Get('my')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get alerts for current user',
    description:
      'Retrieve alerts for the authenticated user (global alerts + user-specific alerts)',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filter by alert type',
    enum: ['info', 'warning', 'success', 'error', 'system'],
  })
  @ApiQuery({
    name: 'includeExpired',
    required: false,
    description: 'Include expired alerts in results',
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
    enum: ['created_at', 'expires_at', 'title'],
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
  })
  @ApiResponse({
    status: 200,
    description: 'User alerts retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/Alert' },
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
  async getMyAlerts(
    @Query() queryDto: QueryAlertDto,
    @AuthUser() user: SupabaseUser,
  ): Promise<{
    data: Alert[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    // Map user.role string to UserRole enum
    const userRole =
      user.role === 'Admin'
        ? UserRole.ADMIN
        : user.role === 'Teacher'
          ? UserRole.TEACHER
          : user.role === 'Student'
            ? UserRole.STUDENT
            : UserRole.STUDENT; // Default fallback

    return this.alertsService.findAll(queryDto, user.id, userRole);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a specific alert by ID',
    description: 'Retrieve a single alert with all details',
  })
  @ApiParam({
    name: 'id',
    description: 'Alert ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Alert retrieved successfully',
    type: Alert,
  })
  @ApiResponse({
    status: 404,
    description: 'Alert not found',
  })
  async findOne(@Param('id') id: string): Promise<Alert> {
    // Public endpoint - show alert without user filter
    return this.alertsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update an alert (Admin only)',
    description: 'Update an existing alert',
  })
  @ApiParam({
    name: 'id',
    description: 'Alert ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Alert updated successfully',
    type: Alert,
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
    description: 'Alert not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateAlertDto: UpdateAlertDto,
    @AuthUser() user: SupabaseUser,
  ): Promise<Alert> {
    return this.alertsService.update(id, updateAlertDto, user.id);
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete an alert (Admin only)',
    description: 'Permanently delete an alert',
  })
  @ApiParam({
    name: 'id',
    description: 'Alert ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Alert deleted successfully',
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
    description: 'Alert not found',
  })
  async remove(
    @Param('id') id: string,
    @AuthUser() user: SupabaseUser,
  ): Promise<{ message: string }> {
    await this.alertsService.remove(id, user.id);
    return { message: 'Alert deleted successfully' };
  }

  @Post(':id/read')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Mark an alert as read',
    description:
      'Mark a specific alert as read for the authenticated user. Available to all authenticated users.',
  })
  @ApiParam({
    name: 'id',
    description: 'Alert ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Alert marked as read successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Alert not found or user does not have access',
  })
  async markAsRead(
    @Param('id') id: string,
    @Body() _dto: MarkAlertReadDto, // DTO for documentation, not used
    @AuthUser() user: SupabaseUser,
  ): Promise<{ success: boolean }> {
    return this.alertsService.markAsRead(id, user.id);
  }

  @Get('read-ids')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get read alert IDs for current user' })
  @ApiResponse({ status: 200, description: 'OK' })
  async getReadIds(
    @AuthUser() user: SupabaseUser,
  ): Promise<{ data: string[] }> {
    const ids = await this.alertsService.getReadAlertIds(user.id);
    return { data: ids };
  }
}
