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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { SectionsService } from './sections.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../auth/decorators/roles.decorator';
import { AuthUser } from '../auth/auth-user.decorator';
import { SupabaseUser } from '../auth/interfaces/supabase-user.interface';

@ApiTags('sections')
@Controller('sections')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Create a new section' })
  @ApiResponse({ status: 201, description: 'Section created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Section already exists' })
  create(@Body() createSectionDto: CreateSectionDto, @AuthUser() _user: SupabaseUser) {
    return this.sectionsService.create(createSectionDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get all sections with pagination and filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'grade_level', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({ status: 200, description: 'Sections retrieved successfully' })
  findAll(
    @AuthUser() _user: SupabaseUser,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('grade_level') grade_level?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc'
  ) {
    return this.sectionsService.findAll({
      page,
      limit,
      grade_level,
      status,
      search,
      sortBy,
      sortOrder,
    });
  }

  @Get('teachers/available')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get available teachers (not assigned to any section)' })
  @ApiResponse({ status: 200, description: 'Available teachers retrieved successfully' })
  getAvailableTeachers(@AuthUser() _user: SupabaseUser) {
    return this.sectionsService.getAvailableTeachers();
  }

  @Get('teacher/:teacherId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get sections by teacher ID' })
  @ApiParam({ name: 'teacherId', description: 'Teacher user ID' })
  @ApiResponse({ status: 200, description: 'Teacher sections retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Teacher not found' })
  getSectionsByTeacher(@Param('teacherId') teacherId: string, @AuthUser() _user: SupabaseUser) {
    return this.sectionsService.findByTeacherId(teacherId);
  }

  @Get('grade/:gradeLevel')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get sections by grade level' })
  @ApiResponse({ status: 200, description: 'Sections retrieved successfully' })
  findByGradeLevel(@Param('gradeLevel') gradeLevel: string, @AuthUser() _user: SupabaseUser) {
    return this.sectionsService.findByGradeLevel(gradeLevel);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get section by ID' })
  @ApiResponse({ status: 200, description: 'Section retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Section not found' })
  findOne(@Param('id') id: string, @AuthUser() _user: SupabaseUser) {
    return this.sectionsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Update section' })
  @ApiResponse({ status: 200, description: 'Section updated successfully' })
  @ApiResponse({ status: 404, description: 'Section not found' })
  @ApiResponse({ status: 409, description: 'Section name or teacher conflict' })
  update(@Param('id') id: string, @Body() updateSectionDto: UpdateSectionDto, @AuthUser() _user: SupabaseUser) {
    return this.sectionsService.update(id, updateSectionDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete section' })
  @ApiResponse({ status: 200, description: 'Section deleted successfully' })
  @ApiResponse({ status: 404, description: 'Section not found' })
  remove(@Param('id') id: string, @AuthUser() _user: SupabaseUser) {
    return this.sectionsService.remove(id);
  }
}