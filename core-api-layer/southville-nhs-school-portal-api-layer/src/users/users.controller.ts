import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ForbiddenException,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PoliciesGuard } from '../auth/guards/policies.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './dto/create-user.dto';
import { Policies } from '../auth/decorators/policies.decorator';
import { AuthUser } from '../auth/auth-user.decorator';
import { SupabaseUser } from '../auth/interfaces/supabase-user.interface';
import { UsersService } from './users.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { CreateStudentRequestDto } from './dto/create-student.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BulkCreateUsersDto } from './dto/bulk-create-users.dto';
import {
  UpdateUserStatusDto,
  SuspendUserDto,
} from './dto/update-user-status.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(SupabaseAuthGuard, PoliciesGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('teacher')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new teacher (Admin only)' })
  @ApiResponse({ status: 201, description: 'Teacher created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async createTeacher(
    @Body() createTeacherDto: CreateTeacherDto,
    @AuthUser() user: SupabaseUser,
  ) {
    return this.usersService.createTeacher(createTeacherDto, user.id);
  }

  @Post('admin')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new admin (Admin only)' })
  @ApiResponse({ status: 201, description: 'Admin created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async createAdmin(
    @Body() createAdminDto: CreateAdminDto,
    @AuthUser() user: SupabaseUser,
  ) {
    return this.usersService.createAdmin(createAdminDto, user.id);
  }

  @Post('student')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new student (Admin only)' })
  @ApiResponse({ status: 201, description: 'Student created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async createStudent(
    @Body() createStudentDto: CreateStudentRequestDto,
    @AuthUser() user: SupabaseUser,
  ) {
    return this.usersService.createStudent(createStudentDto, user.id);
  }

  @Post('bulk')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create multiple users (Admin only)' })
  @ApiResponse({ status: 201, description: 'Users created successfully' })
  async createBulkUsers(
    @Body() bulkCreateDto: BulkCreateUsersDto,
    @AuthUser() user: SupabaseUser,
  ) {
    return this.usersService.createBulkUsers(bulkCreateDto, user.id);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get users with pagination and filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: ['Admin', 'Teacher', 'Student'],
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['Active', 'Inactive', 'Suspended'],
  })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['created_at', 'email', 'full_name'],
  })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  async findAll(
    @AuthUser() user: SupabaseUser,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy: string = 'created_at',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    return this.usersService.findAll({
      page,
      limit,
      role,
      status,
      search,
      sortBy,
      sortOrder,
    });
  }

  @Get('export')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Export users to CSV (Admin only)' })
  @ApiQuery({ name: 'format', required: false, enum: ['csv'] })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: ['Admin', 'Teacher', 'Student'],
  })
  async exportUsers(
    @AuthUser() user: SupabaseUser,
    @Query('format') format: 'csv' = 'csv',
    @Query('role') role?: string,
  ) {
    return this.usersService.exportUsers(format, { role });
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({ summary: 'Get a specific user' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string, @AuthUser() user: SupabaseUser) {
    // Students can only view their own data
    if (user.role === 'Student' && user.id !== id) {
      throw new ForbiddenException('Students can only view their own data');
    }
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @AuthUser() user: SupabaseUser,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param('id') id: string, @AuthUser() user: SupabaseUser) {
    return this.usersService.remove(id);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update user status (Admin only)' })
  @ApiResponse({ status: 200, description: 'User status updated successfully' })
  async updateUserStatus(
    @Param('id') id: string,
    @Body() statusDto: UpdateUserStatusDto,
    @AuthUser() user: SupabaseUser,
  ) {
    return this.usersService.updateUserStatus(id, statusDto);
  }

  @Post(':id/suspend')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Suspend user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User suspended successfully' })
  async suspendUser(
    @Param('id') id: string,
    @Body() suspendDto: SuspendUserDto,
    @AuthUser() user: SupabaseUser,
  ) {
    return this.usersService.suspendUser(id, suspendDto);
  }

  @Get(':id/profile')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  async getUserProfile(
    @Param('id') id: string,
    @AuthUser() user: SupabaseUser,
  ) {
    // Students can only view their own profile
    if (user.role === 'Student' && user.id !== id) {
      throw new ForbiddenException('Students can only view their own profile');
    }
    return this.usersService.findOne(id);
  }
}
