import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { SupabaseUser } from './interfaces/supabase-user.interface';
import { LoginDto, TokenVerifyDto } from './dto/login.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
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
  async login(@Body() loginDto: LoginDto) {
    try {
      // Authenticate user with email and password
      const { user, session } = await this.authService.signIn(
        loginDto.email,
        loginDto.password,
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
        session: {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at,
        },
        message: 'Login successful',
      };
    } catch (error) {
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
}
