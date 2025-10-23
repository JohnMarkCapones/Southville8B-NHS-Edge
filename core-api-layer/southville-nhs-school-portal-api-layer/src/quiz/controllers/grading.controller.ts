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
import { GradingService } from '../services/grading.service';
import { GradeAnswerDto } from '../dto/grade-answer.dto';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { PoliciesGuard } from '../../auth/guards/policies.guard';
import { Roles, UserRole } from '../../auth/decorators/roles.decorator';
import { AuthUser } from '../../auth/auth-user.decorator';
import { SupabaseUser } from '../../auth/interfaces/supabase-user.interface';

@ApiTags('Quiz Grading')
@ApiBearerAuth('JWT-auth')
@Controller('quiz-grading')
@UseGuards(SupabaseAuthGuard, PoliciesGuard, RolesGuard)
export class GradingController {
  private readonly logger = new Logger(GradingController.name);

  constructor(private readonly gradingService: GradingService) {}

  @Get('quiz/:quizId/ungraded')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all ungraded essay answers for a quiz' })
  @ApiResponse({
    status: 200,
    description: 'Ungraded answers retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only grade your own quizzes',
  })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  async getUngradedAnswers(
    @Param('quizId') quizId: string,
    @AuthUser() user: SupabaseUser,
  ) {
    this.logger.log(`Fetching ungraded answers for quiz ${quizId}`);
    return this.gradingService.getUngradedAnswers(quizId, user.id);
  }

  @Post('answer/:answerId/grade')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Grade a student answer (essay/short answer)' })
  @ApiResponse({
    status: 200,
    description: 'Answer graded successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only grade your own quizzes',
  })
  @ApiResponse({ status: 404, description: 'Answer not found' })
  async gradeAnswer(
    @Param('answerId') answerId: string,
    @Body() gradeDto: GradeAnswerDto,
    @AuthUser() user: SupabaseUser,
  ) {
    this.logger.log(`Grading answer ${answerId}`);
    return this.gradingService.gradeAnswer(answerId, user.id, gradeDto);
  }
}
