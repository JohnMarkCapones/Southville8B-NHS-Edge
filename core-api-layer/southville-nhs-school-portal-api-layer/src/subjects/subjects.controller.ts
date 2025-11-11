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
  ParseIntPipe,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { SubjectsService, PaginatedResult } from './subjects.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
// import { Subject } from './entities/subject.entity';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { PoliciesGuard } from '../auth/guards/policies.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthUser } from '../auth/auth-user.decorator';
import { SupabaseUser } from '../auth/interfaces/supabase-user.interface';
import { UserRole } from '../users/dto/create-user.dto';

@ApiTags('Subjects')
@Controller('subjects')
@UseGuards(SupabaseAuthGuard, PoliciesGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class SubjectsController {
  private readonly logger = new Logger(SubjectsController.name);
  constructor(private readonly subjectsService: SubjectsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new subject (Admin only)' })
  @ApiResponse({ status: 201, description: 'Subject created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Subject code already exists',
  })
  async create(
    @Body() createSubjectDto: CreateSubjectDto,
    @AuthUser() _user: SupabaseUser, // eslint-disable-line @typescript-eslint/no-unused-vars
  ) {
    this.logger.log('Creating subject for admin user');
    return this.subjectsService.create(createSubjectDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({ summary: 'Get all subjects with pagination and filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['created_at', 'subject_name', 'code'],
  })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({ status: 200, description: 'Subjects retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async findAll(
    @AuthUser() user: SupabaseUser,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('search') search?: string,
    @Query('sortBy') sortBy: string = 'created_at',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    return this.subjectsService.findAll({
      page,
      limit,
      search,
      sortBy,
      sortOrder,
    });
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({ summary: 'Get subject by ID' })
  @ApiResponse({ status: 200, description: 'Subject retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Subject not found' })
  async findOne(@Param('id') id: string, @AuthUser() user: SupabaseUser) {
    console.log(`Fetching subject ${id} for user: ${user.email} (${user.id})`);
    return this.subjectsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update subject by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Subject updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Subject not found' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Subject code already exists',
  })
  async update(
    @Param('id') id: string,
    @Body() updateSubjectDto: UpdateSubjectDto,
    @AuthUser() user: SupabaseUser,
  ) {
    console.log(`Updating subject ${id} for user: ${user.email} (${user.id})`);
    return this.subjectsService.update(id, updateSubjectDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete subject by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Subject deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Subject not found' })
  async remove(@Param('id') id: string, @AuthUser() user: SupabaseUser) {
    console.log(`Deleting subject ${id} for user: ${user.email} (${user.id})`);
    await this.subjectsService.remove(id);
    return { message: 'Subject deleted successfully' };
  }

  @Get('validate/code/:code')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Check if subject code exists' })
  @ApiQuery({
    name: 'excludeId',
    required: false,
    type: String,
    description: 'Subject ID to exclude from check',
  })
  @ApiResponse({
    status: 200,
    description: 'Validation result returned',
    schema: { type: 'object', properties: { exists: { type: 'boolean' } } },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async checkCode(
    @Param('code') code: string,
    @Query('excludeId') excludeId?: string,
    @AuthUser() _user?: SupabaseUser,
  ) {
    const exists = await this.subjectsService.checkCodeExists(code, excludeId);
    return { exists };
  }

  @Get('validate/name/:name')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Check if subject name exists' })
  @ApiQuery({
    name: 'excludeId',
    required: false,
    type: String,
    description: 'Subject ID to exclude from check',
  })
  @ApiResponse({
    status: 200,
    description: 'Validation result returned',
    schema: { type: 'object', properties: { exists: { type: 'boolean' } } },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async checkName(
    @Param('name') name: string,
    @Query('excludeId') excludeId?: string,
    @AuthUser() _user?: SupabaseUser,
  ) {
    const exists = await this.subjectsService.checkNameExists(name, excludeId);
    return { exists };
  }
}
