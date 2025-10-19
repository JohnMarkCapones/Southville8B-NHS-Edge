import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Logger,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SessionManagementService } from '../services/session-management.service';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { PoliciesGuard } from '../../auth/guards/policies.guard';
import { Roles, UserRole } from '../../auth/decorators/roles.decorator';
import { AuthUser } from '../../auth/auth-user.decorator';
import { SupabaseUser } from '../../auth/interfaces/supabase-user.interface';
import { FastifyRequest } from 'fastify';

@ApiTags('Quiz Session Management')
@ApiBearerAuth('JWT-auth')
@Controller('quiz-sessions')
@UseGuards(SupabaseAuthGuard, PoliciesGuard, RolesGuard)
export class SessionManagementController {
  private readonly logger = new Logger(SessionManagementController.name);

  constructor(
    private readonly sessionManagementService: SessionManagementService,
  ) {}

  @Post(':attemptId/heartbeat')
  @Roles(UserRole.STUDENT)
  @ApiOperation({
    summary: 'Send heartbeat to keep quiz session alive (students only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Heartbeat recorded successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Students only' })
  @ApiResponse({ status: 404, description: 'Quiz attempt not found' })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Quiz not in progress',
  })
  async heartbeat(
    @Param('attemptId') attemptId: string,
    @Body('deviceFingerprint') deviceFingerprint: string,
    @AuthUser() user: SupabaseUser,
    @Req() request: FastifyRequest,
  ) {
    this.logger.log(`Heartbeat received for attempt ${attemptId}`);

    // Extract IP address
    const ipAddress =
      (request.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      (request.headers['x-real-ip'] as string) ||
      request.ip;

    const userAgent = request.headers['user-agent'] as string;

    return this.sessionManagementService.heartbeat(attemptId, user.id, {
      deviceFingerprint,
      userAgent,
      ipAddress,
    });
  }

  @Post(':attemptId/validate')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Validate session integrity (students only)' })
  @ApiResponse({
    status: 200,
    description: 'Session validation result',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async validateSession(
    @Param('attemptId') attemptId: string,
    @Body('deviceFingerprint') deviceFingerprint: string,
    @AuthUser() user: SupabaseUser,
  ) {
    this.logger.log(`Validating session for attempt ${attemptId}`);
    return this.sessionManagementService.validateSession(
      attemptId,
      user.id,
      deviceFingerprint,
    );
  }

  @Get(':attemptId')
  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get session details' })
  @ApiResponse({
    status: 200,
    description: 'Session details retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async getSessionDetails(
    @Param('attemptId') attemptId: string,
    @AuthUser() user: SupabaseUser,
  ) {
    this.logger.log(`Fetching session details for attempt ${attemptId}`);
    return this.sessionManagementService.getSessionDetails(attemptId, user.id);
  }

  @Post(':attemptId/terminate')
  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Terminate an active session' })
  @ApiResponse({
    status: 200,
    description: 'Session terminated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async terminateSession(
    @Param('attemptId') attemptId: string,
    @Body('reason') reason?: string,
  ): Promise<{ message: string }> {
    this.logger.log(`Terminating session for attempt ${attemptId}`);
    await this.sessionManagementService.terminateSession(
      attemptId,
      reason || 'user_logout',
    );
    return { message: 'Session terminated successfully' };
  }
}
