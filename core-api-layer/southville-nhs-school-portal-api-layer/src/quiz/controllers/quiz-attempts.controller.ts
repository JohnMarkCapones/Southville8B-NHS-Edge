import {
  Controller,
  Get,
  Post,
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
import { QuizAttemptsService } from '../services/quiz-attempts.service';
import { StartQuizAttemptDto } from '../dto/start-quiz-attempt.dto';
import { SubmitAnswerDto } from '../dto/submit-answer.dto';
import { QuizAttempt } from '../entities';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { PoliciesGuard } from '../../auth/guards/policies.guard';
import { Roles, UserRole } from '../../auth/decorators/roles.decorator';
import { AuthUser } from '../../auth/auth-user.decorator';
import { SupabaseUser } from '../../auth/interfaces/supabase-user.interface';
import { FastifyRequest } from 'fastify';

@ApiTags('Quiz Attempts')
@ApiBearerAuth('JWT-auth')
@Controller('quiz-attempts')
@UseGuards(SupabaseAuthGuard, PoliciesGuard, RolesGuard)
export class QuizAttemptsController {
  private readonly logger = new Logger(QuizAttemptsController.name);

  constructor(private readonly quizAttemptsService: QuizAttemptsService) {}

  @Post('start/:quizId')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Start a new quiz attempt (students only)' })
  @ApiResponse({
    status: 201,
    description: 'Quiz attempt started successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Students only or retakes not allowed',
  })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Quiz ended or not published',
  })
  async startAttempt(
    @Param('quizId') quizId: string,
    @Body() startDto: StartQuizAttemptDto,
    @AuthUser() user: SupabaseUser,
    @Req() request: FastifyRequest,
  ) {
    this.logger.log(`Starting quiz attempt for student ${user.id} on quiz ${quizId}`);

    // Extract IP address
    const ipAddress =
      (request.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      (request.headers['x-real-ip'] as string) ||
      request.ip;

    return this.quizAttemptsService.startAttempt(
      quizId,
      user.id,
      startDto,
      ipAddress,
    );
  }

  @Post(':attemptId/answer')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Submit an answer (auto-save during quiz)' })
  @ApiResponse({
    status: 200,
    description: 'Answer saved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Quiz attempt not found' })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Quiz not in progress',
  })
  async submitAnswer(
    @Param('attemptId') attemptId: string,
    @Body() submitDto: SubmitAnswerDto,
    @AuthUser() user: SupabaseUser,
  ): Promise<{ message: string }> {
    this.logger.log(`Saving answer for attempt ${attemptId}`);
    await this.quizAttemptsService.submitAnswer(attemptId, user.id, submitDto);
    return { message: 'Answer saved successfully' };
  }

  @Post(':attemptId/submit')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Submit quiz attempt (finalize)' })
  @ApiResponse({
    status: 200,
    description: 'Quiz submitted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Quiz attempt not found' })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Quiz already submitted',
  })
  async submitAttempt(
    @Param('attemptId') attemptId: string,
    @AuthUser() user: SupabaseUser,
  ) {
    this.logger.log(`Submitting quiz attempt ${attemptId}`);
    return this.quizAttemptsService.submitAttempt(attemptId, user.id);
  }

  @Get(':attemptId')
  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get quiz attempt details' })
  @ApiResponse({
    status: 200,
    description: 'Quiz attempt retrieved successfully',
    type: QuizAttempt,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Quiz attempt not found' })
  async getAttempt(
    @Param('attemptId') attemptId: string,
    @AuthUser() user: SupabaseUser,
  ): Promise<QuizAttempt> {
    this.logger.log(`Fetching quiz attempt ${attemptId}`);
    return this.quizAttemptsService.getAttempt(attemptId, user.id);
  }
}
