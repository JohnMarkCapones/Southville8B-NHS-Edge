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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { SectionsService } from './sections.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { Section } from './entities/section.entity';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { PoliciesGuard } from '../auth/guards/policies.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Policies } from '../auth/decorators/policies.decorator';
import { AuthUser } from '../auth/auth-user.decorator';
import { SupabaseUser } from '../auth/interfaces/supabase-user.interface';
import { UserRole } from '../users/dto/create-user.dto';

@ApiTags('Sections')
@Controller('sections')
@UseGuards(SupabaseAuthGuard, PoliciesGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new section (Admin only)' })
  @ApiResponse({ status: 201, description: 'Section created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid data' })
  async create(
    @Body() createSectionDto: CreateSectionDto,
    @AuthUser() user: SupabaseUser,
  ) {
    console.log(`Creating section for user: ${user.email} (${user.id})`);
    return this.sectionsService.create(createSectionDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get all sections with pagination and filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'gradeLevel', required: false, type: String })
  @ApiQuery({ name: 'teacherId', required: false, type: String })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['created_at', 'name', 'grade_level'],
  })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({ status: 200, description: 'Sections retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async findAll(
    @AuthUser() user: SupabaseUser,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('gradeLevel') gradeLevel?: string,
    @Query('teacherId') teacherId?: string,
    @Query('sortBy') sortBy: string = 'created_at',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    return this.sectionsService.findAll({
      page,
      limit,
      search,
      gradeLevel,
      teacherId,
      sortBy,
      sortOrder,
    });
  }

  @Get('teacher/:teacherId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get sections by teacher ID' })
  @ApiResponse({ status: 200, description: 'Sections retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async getSectionsByTeacher(
    @Param('teacherId') teacherId: string,
    @AuthUser() user: SupabaseUser,
  ) {
    // Teachers can only view their own sections
    if (user.role === 'Teacher' && user.id !== teacherId) {
      throw new Error('Forbidden - Can only view your own sections');
    }

    return this.sectionsService.getSectionsByTeacher(teacherId);
  }

  @Get('grade/:gradeLevel')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get sections by grade level' })
  @ApiResponse({ status: 200, description: 'Sections retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async getSectionsByGradeLevel(
    @Param('gradeLevel') gradeLevel: string,
    @AuthUser() user: SupabaseUser,
  ) {
    return this.sectionsService.getSectionsByGradeLevel(gradeLevel);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get section by ID' })
  @ApiResponse({ status: 200, description: 'Section retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Section not found' })
  async findOne(@Param('id') id: string, @AuthUser() user: SupabaseUser) {
    console.log(`Fetching section ${id} for user: ${user.email} (${user.id})`);
    return this.sectionsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update section by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Section updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Section not found' })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid data' })
  async update(
    @Param('id') id: string,
    @Body() updateSectionDto: UpdateSectionDto,
    @AuthUser() user: SupabaseUser,
  ) {
    console.log(`Updating section ${id} for user: ${user.email} (${user.id})`);
    return this.sectionsService.update(id, updateSectionDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete section by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Section deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Section not found' })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Cannot delete section with students',
  })
  async remove(@Param('id') id: string, @AuthUser() user: SupabaseUser) {
    console.log(`Deleting section ${id} for user: ${user.email} (${user.id})`);
    await this.sectionsService.remove(id);
    return { message: 'Section deleted successfully' };
  }
}
