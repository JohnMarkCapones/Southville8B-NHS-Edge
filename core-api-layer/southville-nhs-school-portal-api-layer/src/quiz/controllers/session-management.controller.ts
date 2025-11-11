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
import { UpdateProgressDto } from '../dto/update-progress.dto';
import { CreateFlagDto } from '../dto/create-flag.dto';

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

  @Post(':attemptId/progress')
  @Roles(UserRole.STUDENT)
  @ApiOperation({
    summary: 'Update student progress for real-time monitoring (students only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Progress updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Students only' })
  @ApiResponse({ status: 404, description: 'Active session not found' })
  async updateProgress(
    @Param('attemptId') attemptId: string,
    @Body() progressDto: UpdateProgressDto,
    @AuthUser() user: SupabaseUser,
  ): Promise<{ message: string }> {
    this.logger.log(
      `Progress update for attempt ${attemptId}: Question ${progressDto.currentQuestionIndex + 1}, ${progressDto.progress}%`,
    );
    await this.sessionManagementService.updateProgress(
      attemptId,
      user.id,
      progressDto,
    );
    return { message: 'Progress updated successfully' };
  }

  @Get(':attemptId/device-history')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get device history for a quiz attempt (teachers and admins only)',
    description:
      'Returns a timeline of all devices used during the quiz attempt for academic integrity review',
  })
  @ApiResponse({
    status: 200,
    description: 'Device history retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          deviceFingerprint: { type: 'string' },
          deviceType: {
            type: 'string',
            enum: ['mobile', 'tablet', 'desktop', 'unknown'],
          },
          ipAddress: { type: 'string' },
          userAgent: { type: 'string' },
          firstSeenAt: { type: 'string', format: 'date-time' },
          lastSeenAt: { type: 'string', format: 'date-time' },
          isCurrent: { type: 'boolean' },
          duration: { type: 'string', example: '15m 30s' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Teachers/Admins only' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async getDeviceHistory(@Param('attemptId') attemptId: string) {
    this.logger.log(`Fetching device history for attempt ${attemptId}`);
    return this.sessionManagementService.getDeviceHistory(attemptId);
  }

  @Post(':attemptId/flag')
  @Roles(UserRole.STUDENT)
  @ApiOperation({
    summary: 'Submit a client-side detected security flag (students only)',
    description:
      'Students can self-report suspicious events like tab switches, fullscreen exits, etc. for academic integrity',
  })
  @ApiResponse({
    status: 200,
    description: 'Flag submitted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Students only' })
  @ApiResponse({ status: 404, description: 'Quiz attempt not found' })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Quiz not in progress',
  })
  async submitFlag(
    @Param('attemptId') attemptId: string,
    @Body() flagDto: CreateFlagDto,
    @AuthUser() user: SupabaseUser,
  ) {
    this.logger.log(
      `Flag submission for attempt ${attemptId}: ${flagDto.flagType}`,
    );
    return this.sessionManagementService.submitClientFlag(
      attemptId,
      user.id,
      flagDto.flagType,
      flagDto.metadata,
    );
  }
}
