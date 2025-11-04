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
import { ImportStudentsCsvDto } from './dto/import-students-csv.dto';
import { ImportTeachersCsvDto } from './dto/import-teachers-csv.dto';
import {
  UpdateUserStatusDto,
  SuspendUserDto,
} from './dto/update-user-status.dto';
import { AssignDomainRoleDto } from './dto/assign-domain-role.dto';

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

  @Post('import-students-csv')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Import students from CSV (Admin only)' })
  @ApiResponse({ status: 201, description: 'Students imported successfully' })
  @ApiResponse({ status: 400, description: 'Invalid CSV data' })
  async importStudentsCsv(
    @Body() importDto: ImportStudentsCsvDto,
    @AuthUser() user: SupabaseUser,
  ) {
    return this.usersService.importStudentsFromCsv(importDto, user.id);
  }

  @Post('import-teachers-csv')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Import teachers from CSV (Admin only)' })
  @ApiResponse({ status: 201, description: 'Teachers imported successfully' })
  @ApiResponse({ status: 400, description: 'Invalid CSV data' })
  async importTeachersCsv(
    @Body() importDto: ImportTeachersCsvDto,
    @AuthUser() user: SupabaseUser,
  ) {
    return this.usersService.importTeachersFromCsv(importDto, user.id);
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
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 100,
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

  @Get('me')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({
    summary: 'Get current authenticated user profile',
    description:
      'Returns the profile of the currently authenticated user with role-specific data (teacher/admin/student)',
  })
  @ApiResponse({
    status: 200,
    description: 'Current user profile retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentUser(@AuthUser() user: SupabaseUser) {
    return this.usersService.findOne(user.id);
  }

  @Post('me/record-login')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Record a daily login for current user',
    description:
      'Records that the current user logged in today. Safe to call multiple times per day (idempotent).',
  })
  @ApiResponse({
    status: 200,
    description: 'Login recorded successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async recordLogin(@AuthUser() user: SupabaseUser) {
    await this.usersService.recordLogin(user.id);
    return { success: true };
  }

  @Get('me/streak')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({
    summary: 'Get current user login streak count',
    description:
      'Returns the number of consecutive days the user has logged in. Streak resets to 0 if a day is missed.',
  })
  @ApiResponse({
    status: 200,
    description: 'Login streak retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getLoginStreak(@AuthUser() user: SupabaseUser) {
    const streak = await this.usersService.getLoginStreak(user.id);
    return { streak };
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

  // ===== Domain Role Management Endpoints =====

  @Get(':id/domain-roles')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({
    summary: 'Get all domain roles assigned to a user',
    description:
      'Retrieves all domain role assignments for a specific user, including role details and domain information',
  })
  @ApiResponse({
    status: 200,
    description: 'Domain roles retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getUserDomainRoles(@Param('id') userId: string) {
    return this.usersService.getUserDomainRoles(userId);
  }

  @Post(':id/domain-roles')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({
    summary: 'Assign a domain role to a user',
    description:
      'Assigns a specific domain role to a user. The user can have multiple domain roles across different domains.',
  })
  @ApiResponse({
    status: 201,
    description: 'Domain role assigned successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'User or domain role not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async assignDomainRole(
    @Param('id') userId: string,
    @Body() assignDto: AssignDomainRoleDto,
  ) {
    return this.usersService.assignDomainRole(
      userId,
      assignDto.domain_role_id,
    );
  }

  @Delete(':id/domain-roles/:assignmentId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove a domain role assignment from a user',
    description:
      'Removes a specific domain role assignment. Use the assignment ID from user_domain_roles table.',
  })
  @ApiResponse({
    status: 204,
    description: 'Domain role assignment removed successfully',
  })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async removeDomainRole(
    @Param('id') userId: string,
    @Param('assignmentId') assignmentId: string,
  ) {
    return this.usersService.removeDomainRole(userId, assignmentId);
  }
}
