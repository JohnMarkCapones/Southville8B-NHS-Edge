import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MonitoringService } from '../services/monitoring.service';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { PoliciesGuard } from '../../auth/guards/policies.guard';
import { Roles, UserRole } from '../../auth/decorators/roles.decorator';
import { AuthUser } from '../../auth/auth-user.decorator';
import { SupabaseUser } from '../../auth/interfaces/supabase-user.interface';

@ApiTags('Quiz Monitoring')
@ApiBearerAuth('JWT-auth')
@Controller('quiz-monitoring')
@UseGuards(SupabaseAuthGuard, PoliciesGuard, RolesGuard)
export class MonitoringController {
  private readonly logger = new Logger(MonitoringController.name);

  constructor(private readonly monitoringService: MonitoringService) {}

  @Get('quiz/:quizId/participants')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get all active participants for a quiz (polling endpoint)',
  })
  @ApiResponse({
    status: 200,
    description: 'Active participants retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Teachers and Admins only',
  })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  async getActiveParticipants(
    @Param('quizId') quizId: string,
    @AuthUser() user: SupabaseUser,
  ) {
    this.logger.log(`Fetching active participants for quiz ${quizId}`);
    return this.monitoringService.getActiveParticipants(quizId, user.id);
  }

  @Get('quiz/:quizId/flags')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all flags for a quiz' })
  @ApiResponse({
    status: 200,
    description: 'Flags retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Teachers and Admins only',
  })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  async getQuizFlags(
    @Param('quizId') quizId: string,
    @AuthUser() user: SupabaseUser,
  ) {
    this.logger.log(`Fetching flags for quiz ${quizId}`);
    return this.monitoringService.getQuizFlags(quizId, user.id);
  }

  @Post('attempt/:attemptId/terminate')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Terminate a student quiz attempt' })
  @ApiResponse({
    status: 200,
    description: 'Quiz attempt terminated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Teachers and Admins only',
  })
  @ApiResponse({ status: 404, description: 'Quiz attempt not found' })
  async terminateAttempt(
    @Param('attemptId') attemptId: string,
    @Body('reason') reason: string,
    @AuthUser() user: SupabaseUser,
  ): Promise<{ message: string }> {
    this.logger.log(`Terminating quiz attempt ${attemptId}`);
    await this.monitoringService.terminateAttempt(attemptId, user.id, reason);
    return { message: 'Quiz attempt terminated successfully' };
  }
}
