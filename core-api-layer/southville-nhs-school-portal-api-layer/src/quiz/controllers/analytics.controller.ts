import {
  Controller,
  Get,
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
import { AnalyticsService } from '../services/analytics.service';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { PoliciesGuard } from '../../auth/guards/policies.guard';
import { Roles, UserRole } from '../../auth/decorators/roles.decorator';
import { AuthUser } from '../../auth/auth-user.decorator';
import { SupabaseUser } from '../../auth/interfaces/supabase-user.interface';

@ApiTags('Quiz Analytics')
@ApiBearerAuth('JWT-auth')
@Controller('quiz-analytics')
@UseGuards(SupabaseAuthGuard, PoliciesGuard, RolesGuard)
export class AnalyticsController {
  private readonly logger = new Logger(AnalyticsController.name);

  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('quiz/:quizId/overview')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get overall quiz analytics (scores, pass rate, etc.)' })
  @ApiResponse({
    status: 200,
    description: 'Quiz analytics retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only view analytics for your own quizzes',
  })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  async getQuizAnalytics(
    @Param('quizId') quizId: string,
    @AuthUser() user: SupabaseUser,
  ) {
    this.logger.log(`Fetching quiz analytics for ${quizId}`);
    return this.analyticsService.getQuizAnalytics(quizId, user.id);
  }

  @Get('quiz/:quizId/questions')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get question-level analytics (difficulty, correct rate, etc.)',
  })
  @ApiResponse({
    status: 200,
    description: 'Question analytics retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only view analytics for your own quizzes',
  })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  async getQuestionAnalytics(
    @Param('quizId') quizId: string,
    @AuthUser() user: SupabaseUser,
  ) {
    this.logger.log(`Fetching question analytics for quiz ${quizId}`);
    return this.analyticsService.getQuestionAnalytics(quizId, user.id);
  }

  @Get('quiz/:quizId/students')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get student performance for a quiz (attempts, scores, etc.)',
  })
  @ApiResponse({
    status: 200,
    description: 'Student performance retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only view analytics for your own quizzes',
  })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  async getStudentPerformance(
    @Param('quizId') quizId: string,
    @AuthUser() user: SupabaseUser,
  ) {
    this.logger.log(`Fetching student performance for quiz ${quizId}`);
    return this.analyticsService.getStudentPerformance(quizId, user.id);
  }
}
