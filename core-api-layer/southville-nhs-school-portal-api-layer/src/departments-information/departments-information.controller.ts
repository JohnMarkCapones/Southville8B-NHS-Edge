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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { DepartmentsInformationService } from './departments-information.service';
import { CreateDepartmentsInformationDto } from './dto/create-departments-information.dto';
import { UpdateDepartmentsInformationDto } from './dto/update-departments-information.dto';
import { DepartmentInformation } from './entities/department-information.entity';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/dto/create-user.dto';

@ApiTags('Departments Information')
@Controller('departments-information')
export class DepartmentsInformationController {
  constructor(
    private readonly departmentsInformationService: DepartmentsInformationService,
  ) {}

  @Post()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create new department information (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Department information created successfully',
    type: DepartmentInformation,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async create(
    @Body() createDepartmentsInformationDto: CreateDepartmentsInformationDto,
  ): Promise<DepartmentInformation> {
    return this.departmentsInformationService.create(
      createDepartmentsInformationDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all departments information (Public)' })
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
    name: 'departmentId',
    required: false,
    type: String,
    description: 'Filter by department ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Departments information retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/DepartmentInformation' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.departmentsInformationService.findAll({
      page,
      limit,
      departmentId,
    });
  }

  @Get('department/:departmentId')
  @ApiOperation({
    summary: 'Get all information for a specific department (Public)',
  })
  @ApiResponse({
    status: 200,
    description: 'Department information retrieved successfully',
    type: [DepartmentInformation],
  })
  async findByDepartment(
    @Param('departmentId') departmentId: string,
  ): Promise<DepartmentInformation[]> {
    return this.departmentsInformationService.findByDepartment(departmentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get department information by ID (Public)' })
  @ApiResponse({
    status: 200,
    description: 'Department information retrieved successfully',
    type: DepartmentInformation,
  })
  @ApiResponse({ status: 404, description: 'Department information not found' })
  async findOne(@Param('id') id: string): Promise<DepartmentInformation> {
    return this.departmentsInformationService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update department information (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Department information updated successfully',
    type: DepartmentInformation,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Department information not found' })
  async update(
    @Param('id') id: string,
    @Body() updateDepartmentsInformationDto: UpdateDepartmentsInformationDto,
  ): Promise<DepartmentInformation> {
    return this.departmentsInformationService.update(
      id,
      updateDepartmentsInformationDto,
    );
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete department information (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Department information deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Department information not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.departmentsInformationService.remove(id);
  }
}
