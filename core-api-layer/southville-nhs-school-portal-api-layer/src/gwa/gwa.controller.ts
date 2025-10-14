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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../auth/decorators/roles.decorator';
import { AuthUser } from '../auth/auth-user.decorator';
import { SupabaseUser } from '../auth/interfaces/supabase-user.interface';
import { GwaService } from './gwa.service';
import { CreateGwaDto } from './dto/create-gwa.dto';
import { UpdateGwaDto } from './dto/update-gwa.dto';
import { QueryGwaDto } from './dto/query-gwa.dto';
import { Gwa } from './entities/gwa.entity';

@ApiTags('GWA Management')
@ApiBearerAuth('JWT-auth')
@Controller('gwa')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class GwaController {
  constructor(private readonly gwaService: GwaService) {}

  @Post()
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new GWA record',
    description:
      'Teachers can create GWA records for students in their advisory section. Admins can create for any student.',
  })
  @ApiResponse({
    status: 201,
    description: 'GWA record created successfully',
    type: Gwa,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - GWA record already exists for this period',
  })
  async create(
    @Body() createGwaDto: CreateGwaDto,
    @AuthUser() user: SupabaseUser,
  ): Promise<Gwa> {
    return this.gwaService.create(createGwaDto, user.id);
  }

  @Get()
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get all GWA records with filters',
    description:
      'Retrieve GWA records with optional filtering by student, grading period, and school year. Supports pagination.',
  })
  @ApiResponse({
    status: 200,
    description: 'GWA records retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/Gwa' },
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            total: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiQuery({
    name: 'studentId',
    required: false,
    description: 'Filter by student ID',
  })
  @ApiQuery({
    name: 'gradingPeriod',
    required: false,
    description: 'Filter by grading period (Q1, Q2, Q3, Q4)',
  })
  @ApiQuery({
    name: 'schoolYear',
    required: false,
    description: 'Filter by school year (YYYY-YYYY)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (default: 10)',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Sort field (default: created_at)',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Sort order (asc/desc, default: desc)',
  })
  async findAll(@Query() queryDto: QueryGwaDto): Promise<any> {
    return this.gwaService.findAll(queryDto);
  }

  @Get('student/:studentId')
  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get GWA history for a specific student',
    description:
      "Students can view their own GWA history. Teachers and admins can view any student's GWA history.",
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Student GWA history retrieved successfully',
    type: [Gwa],
  })
  @ApiResponse({
    status: 404,
    description: 'Student not found',
  })
  async findByStudent(@Param('studentId') studentId: string): Promise<Gwa[]> {
    return this.gwaService.findByStudent(studentId);
  }

  @Get(':id')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get a specific GWA record by ID',
    description: 'Retrieve a single GWA record with all related information.',
  })
  @ApiParam({
    name: 'id',
    description: 'GWA record ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'GWA record retrieved successfully',
    type: Gwa,
  })
  @ApiResponse({
    status: 404,
    description: 'GWA record not found',
  })
  async findOne(@Param('id') id: string): Promise<Gwa> {
    return this.gwaService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update a GWA record',
    description:
      'Teachers can update GWA records for students in their advisory section. Admins can update any GWA record.',
  })
  @ApiParam({
    name: 'id',
    description: 'GWA record ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'GWA record updated successfully',
    type: Gwa,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'GWA record not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - GWA record already exists for this period',
  })
  async update(
    @Param('id') id: string,
    @Body() updateGwaDto: UpdateGwaDto,
    @AuthUser() user: SupabaseUser,
  ): Promise<Gwa> {
    return this.gwaService.update(id, updateGwaDto, user.id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a GWA record',
    description:
      'Only administrators can delete GWA records. This action is irreversible.',
  })
  @ApiParam({
    name: 'id',
    description: 'GWA record ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'GWA record deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - only administrators can delete GWA records',
  })
  @ApiResponse({
    status: 404,
    description: 'GWA record not found',
  })
  async remove(
    @Param('id') id: string,
    @AuthUser() user: SupabaseUser,
  ): Promise<void> {
    return this.gwaService.remove(id, user.id);
  }
}
