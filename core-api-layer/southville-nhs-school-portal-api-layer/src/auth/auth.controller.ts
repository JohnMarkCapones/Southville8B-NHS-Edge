import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { SupabaseUser } from './interfaces/supabase-user.interface';
import { LoginDto, TokenVerifyDto } from './dto/login.dto';
import { SessionManagementService } from '../session-management/session-management.service';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import { AuthUser } from './auth-user.decorator';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from '../users/dto/create-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AdminChangePasswordDto } from './dto/admin-change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { UsersService } from '../users/users.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionManagementService: SessionManagementService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Authenticate user with email and password',
    description:
      'Signs in a user with email and password, returns user data and session',
  })
  @ApiBody({
    description: 'User login credentials',
    type: LoginDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' },
            created_at: { type: 'string' },
            email_confirmed_at: { type: 'string' },
            user_metadata: { type: 'object' },
          },
        },
        session: {
          type: 'object',
          properties: {
            access_token: { type: 'string' },
            refresh_token: { type: 'string' },
            expires_at: { type: 'number' },
          },
        },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid email or password',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number' },
        message: { type: 'string' },
        error: { type: 'string' },
      },
    },
  })
  async login(@Body() loginDto: LoginDto, @Req() request: Request) {
    try {
      // Get client IP for rate limiting
      const clientIp =
        request.ip || request.connection.remoteAddress || 'unknown';

      // Authenticate user with email and password
      const { user, session } = await this.authService.signIn(
        loginDto.email,
        loginDto.password,
      );

      // Create session for tracking
      const sessionId = session.access_token; // Use access token as session ID
      await this.sessionManagementService.createSession(
        user.id,
        sessionId,
        request.headers['user-agent'] || 'unknown',
        clientIp,
      );

      // Record daily login for streak tracking (non-blocking)
      this.usersService.recordLogin(user.id).catch((error) => {
        // Log error but don't fail login if streak recording fails
        console.error('Failed to record login for streak tracking:', error);
      });

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          created_at: user.created_at,
          email_confirmed_at: user.email_confirmed_at,
          user_metadata: user.user_metadata,
        },
        session: {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at,
        },
        message: 'Login successful',
      };
    } catch (error) {
      // Progressive rate limiting is now handled in AuthService
      throw error; // Let NestJS handle the error response
    }
  }

  @Post('verify')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 attempts per minute
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify JWT token',
    description: 'Verifies a Supabase JWT token and returns user information',
  })
  @ApiBody({
    description: 'Supabase JWT token',
    type: TokenVerifyDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Token verified successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' },
            created_at: { type: 'string' },
            email_confirmed_at: { type: 'string' },
          },
        },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired token',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number' },
        message: { type: 'string' },
        error: { type: 'string' },
      },
    },
  })
  async verify(@Body() tokenDto: TokenVerifyDto) {
    try {
      // Verify the Supabase JWT token
      const user: SupabaseUser = await this.authService.verifyToken(
        tokenDto.token,
      );

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          created_at: user.created_at,
          email_confirmed_at: user.email_confirmed_at,
          user_metadata: user.user_metadata,
        },
        message: 'Token verified successfully',
      };
    } catch (error) {
      throw error; // Let NestJS handle the error response
    }
  }

  @Post('reset-password')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Reset user password to default (Admin only)',
    description:
      'Resets password to birthday-based default for students/teachers, random for admins',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        temporaryPassword: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @AuthUser() admin: any,
  ): Promise<{ message: string; temporaryPassword?: string }> {
    return this.authService.resetPasswordToDefault(
      resetPasswordDto.userId,
      admin.id,
    );
  }

  @Post('change-password')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Change own password',
    description: 'User changes their own password (requires current password)',
  })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized or incorrect current password',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @AuthUser() user: any,
  ): Promise<{ message: string }> {
    return this.authService.changePassword(
      user.id,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
  }

  @Post('admin-change-password')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Admin changes any user password',
    description:
      'Admin can change any user password without knowing current password',
  })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async adminChangePassword(
    @Body() adminChangePasswordDto: AdminChangePasswordDto,
    @AuthUser() admin: any,
  ): Promise<{ message: string }> {
    return this.authService.adminChangePassword(
      adminChangePasswordDto.userId,
      adminChangePasswordDto.newPassword,
      admin.id,
    );
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send password reset email to admin',
    description:
      'Sends a password reset magic link to the admin email address via Supabase',
  })
  @ApiResponse({
    status: 200,
    description: 'If the email is registered as an admin, a password reset link has been sent',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid email format',
  })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.sendPasswordResetEmail(forgotPasswordDto.email);
  }
}
