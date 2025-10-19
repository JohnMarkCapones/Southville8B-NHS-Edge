import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { DepartmentsService, PaginatedResult } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DepartmentQueryDto } from './dto/department-query.dto';
import { AssignHeadDto } from './dto/assign-head.dto';
import { Department } from './entities/department.entity';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../auth/decorators/roles.decorator';
import { AuthUser } from '../auth/auth-user.decorator';
import { SupabaseUser } from '../auth/interfaces/supabase-user.interface';

@ApiTags('Departments')
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create new department (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Department created successfully',
    type: Department,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Department name already exists',
  })
  async create(
    @Body() createDto: CreateDepartmentDto,
    @AuthUser() user: SupabaseUser,
  ): Promise<Department> {
    return this.departmentsService.create(createDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all departments' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
    example: 10,
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
    example: true,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by department name',
    example: 'Information Technology',
  })
  @ApiResponse({
    status: 200,
    description: 'Departments retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/Department' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async findAll(@Query() query: DepartmentQueryDto): Promise<PaginatedResult> {
    return this.departmentsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get department by ID' })
  @ApiParam({ name: 'id', description: 'Department ID' })
  @ApiResponse({
    status: 200,
    description: 'Department retrieved successfully',
    type: Department,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Department> {
    return this.departmentsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update department (Admin only)' })
  @ApiParam({ name: 'id', description: 'Department ID' })
  @ApiResponse({
    status: 200,
    description: 'Department updated successfully',
    type: Department,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Department not found' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Department name already exists',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateDepartmentDto,
    @AuthUser() user: SupabaseUser,
  ): Promise<Department> {
    return this.departmentsService.update(id, updateDto, user.id);
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete department (Admin only)' })
  @ApiParam({ name: 'id', description: 'Department ID' })
  @ApiResponse({
    status: 204,
    description: 'Department soft deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthUser() user: SupabaseUser,
  ): Promise<void> {
    await this.departmentsService.remove(id, user.id);
  }

  @Post(':id/activate')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Activate department (Admin only)' })
  @ApiParam({ name: 'id', description: 'Department ID' })
  @ApiResponse({
    status: 200,
    description: 'Department activated successfully',
    type: Department,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthUser() user: SupabaseUser,
  ): Promise<Department> {
    return this.departmentsService.activate(id, user.id);
  }

  @Post(':id/deactivate')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Deactivate department (Admin only)' })
  @ApiParam({ name: 'id', description: 'Department ID' })
  @ApiResponse({
    status: 200,
    description: 'Department deactivated successfully',
    type: Department,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async deactivate(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthUser() user: SupabaseUser,
  ): Promise<Department> {
    return this.departmentsService.deactivate(id, user.id);
  }

  @Post(':id/assign-head')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Assign department head (Admin only)' })
  @ApiParam({ name: 'id', description: 'Department ID' })
  @ApiResponse({
    status: 200,
    description: 'Department head assigned successfully',
    type: Department,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Department or teacher not found' })
  async assignHead(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignHeadDto,
    @AuthUser() user: SupabaseUser,
  ): Promise<Department> {
    return this.departmentsService.assignHead(id, dto.teacherId, user.id);
  }
}
