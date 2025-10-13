import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../auth/decorators/roles.decorator';
import { AuthUser } from '../auth/auth-user.decorator';
import { SupabaseUser } from '../auth/interfaces/supabase-user.interface';

@ApiTags('Role Examples')
@ApiBearerAuth('JWT-auth')
@Controller('api/examples')
export class RoleExamplesController {
  // Admin only endpoint
  @Get('admin-only')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin only endpoint' })
  @ApiResponse({ status: 200, description: 'Admin access granted' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  adminOnly(@AuthUser() user: SupabaseUser) {
    return {
      message: 'Admin access granted',
      user: user.email,
      role: 'Admin',
      data: 'Sensitive admin data',
    };
  }

  // Teacher only endpoint
  @Get('teacher-only')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Teacher only endpoint' })
  @ApiResponse({ status: 200, description: 'Teacher access granted' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Teacher role required',
  })
  teacherOnly(@AuthUser() user: SupabaseUser) {
    return {
      message: 'Teacher access granted',
      user: user.email,
      role: 'Teacher',
      data: 'Teacher-specific data',
    };
  }

  // Student only endpoint
  @Get('student-only')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Student only endpoint' })
  @ApiResponse({ status: 200, description: 'Student access granted' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Student role required',
  })
  studentOnly(@AuthUser() user: SupabaseUser) {
    return {
      message: 'Student access granted',
      user: user.email,
      role: 'Student',
      data: 'Student-specific data',
    };
  }

  // Admin and Teacher endpoint
  @Get('admin-teacher')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Admin and Teacher endpoint' })
  @ApiResponse({ status: 200, description: 'Access granted' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin or Teacher role required',
  })
  adminTeacher(@AuthUser() user: SupabaseUser) {
    return {
      message: 'Admin or Teacher access granted',
      user: user.email,
      role: 'Admin or Teacher',
      data: 'Staff-level data',
    };
  }

  // All authenticated users endpoint
  @Get('all-roles')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({ summary: 'All roles endpoint' })
  @ApiResponse({ status: 200, description: 'Access granted' })
  @ApiResponse({ status: 403, description: 'Forbidden - Valid role required' })
  allRoles(@AuthUser() user: SupabaseUser) {
    return {
      message: 'Access granted to all roles',
      user: user.email,
      role: 'Any valid role',
      data: 'General data for all users',
    };
  }

  // No role restriction (just authentication)
  @Get('authenticated-only')
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({ summary: 'Authenticated users only' })
  @ApiResponse({ status: 200, description: 'Access granted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  authenticatedOnly(@AuthUser() user: SupabaseUser) {
    return {
      message: 'Access granted to any authenticated user',
      user: user.email,
      role: 'Any authenticated user',
      data: 'General authenticated data',
    };
  }
}
