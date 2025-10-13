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
import { AuthService } from '../auth/auth.service';

@ApiTags('Role Examples')
@ApiBearerAuth('JWT-auth')
@Controller('examples')
export class RoleExamplesController {
  constructor(private readonly authService: AuthService) {}
  // Admin only endpoint
  @Get('admin-only')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin only endpoint' })
  @ApiResponse({ status: 200, description: 'Admin access granted' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async adminOnly(@AuthUser() user: SupabaseUser) {
    const actualRole = await this.authService.getUserRoleFromDatabase(user.id);
    return {
      message: 'Admin access granted',
      user: user.email,
      role: actualRole || 'Unknown',
      data: 'Sensitive admin data',
      hierarchyNote:
        actualRole !== 'Admin'
          ? `Access granted via role hierarchy (${actualRole} → Admin)`
          : undefined,
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
  async teacherOnly(@AuthUser() user: SupabaseUser) {
    const actualRole = await this.authService.getUserRoleFromDatabase(user.id);
    return {
      message: 'Teacher access granted',
      user: user.email,
      role: actualRole || 'Unknown',
      data: 'Teacher-specific data',
      hierarchyNote:
        actualRole !== 'Teacher'
          ? `Access granted via role hierarchy (${actualRole} → Teacher)`
          : undefined,
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
  async studentOnly(@AuthUser() user: SupabaseUser) {
    const actualRole = await this.authService.getUserRoleFromDatabase(user.id);
    return {
      message: 'Student access granted',
      user: user.email,
      role: actualRole || 'Unknown',
      data: 'Student-specific data',
      hierarchyNote:
        actualRole !== 'Student'
          ? `Access granted via role hierarchy (${actualRole} → Student)`
          : undefined,
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
  async adminTeacher(@AuthUser() user: SupabaseUser) {
    const actualRole = await this.authService.getUserRoleFromDatabase(user.id);
    return {
      message: 'Admin or Teacher access granted',
      user: user.email,
      role: actualRole || 'Unknown',
      data: 'Staff-level data',
      hierarchyNote:
        actualRole !== 'Admin' && actualRole !== 'Teacher'
          ? `Access granted via role hierarchy (${actualRole} → Admin/Teacher)`
          : undefined,
    };
  }

  // All authenticated users endpoint
  @Get('all-roles')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({ summary: 'All roles endpoint' })
  @ApiResponse({ status: 200, description: 'Access granted' })
  @ApiResponse({ status: 403, description: 'Forbidden - Valid role required' })
  async allRoles(@AuthUser() user: SupabaseUser) {
    const actualRole = await this.authService.getUserRoleFromDatabase(user.id);
    return {
      message: 'Access granted to all roles',
      user: user.email,
      role: actualRole || 'Unknown',
      data: 'General data for all users',
    };
  }

  // No role restriction (just authentication)
  @Get('authenticated-only')
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({ summary: 'Authenticated users only' })
  @ApiResponse({ status: 200, description: 'Access granted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async authenticatedOnly(@AuthUser() user: SupabaseUser) {
    const actualRole = await this.authService.getUserRoleFromDatabase(user.id);
    return {
      message: 'Access granted to any authenticated user',
      user: user.email,
      role: actualRole || 'Unknown',
      data: 'General authenticated data',
    };
  }
}
