import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { QuizService } from '../services/quiz.service';
import {
  CreateQuizDto,
  UpdateQuizDto,
  CreateQuizQuestionDto,
  CreateQuizSettingsDto,
  PublishQuizDto,
} from '../dto';
import { AssignQuizToSectionsDto } from '../dto/assign-quiz-to-sections.dto';
import { ImportQuestionDto } from '../dto/import-question.dto';
import { Quiz, QuizQuestion, QuizSettings } from '../entities';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { PoliciesGuard } from '../../auth/guards/policies.guard';
import { Roles, UserRole } from '../../auth/decorators/roles.decorator';
import { AuthUser } from '../../auth/auth-user.decorator';
import { SupabaseUser } from '../../auth/interfaces/supabase-user.interface';
import { Audit } from '../../common/audit';
import { AuditEntityType } from '../../common/audit/audit.types';

@ApiTags('Quizzes')
@ApiBearerAuth('JWT-auth')
@Controller('quizzes')
@UseGuards(SupabaseAuthGuard, PoliciesGuard, RolesGuard)
export class QuizController {
  private readonly logger = new Logger(QuizController.name);

  constructor(private readonly quizService: QuizService) {}

  // ==================== STUDENT ENDPOINTS ====================

  @Get('available')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Get available quizzes for the current student' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'subjectId',
    required: false,
    type: String,
    description: 'Filter by subject ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Available quizzes retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Students only' })
  async getAvailableQuizzes(
    @AuthUser() user: SupabaseUser,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('subjectId') subjectId?: string,
  ) {
    this.logger.log(`Fetching available quizzes for student ${user.id}`);
    return this.quizService.getAvailableQuizzes(user.id, {
      page,
      limit,
      subjectId,
    });
  }

  // ==================== QUIZ CRUD OPERATIONS ====================

  @Post()
  @Audit({
    entityType: AuditEntityType.QUIZ,
    descriptionField: 'title',
  })
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new quiz (draft status)' })
  @ApiResponse({
    status: 201,
    description: 'Quiz created successfully',
    type: Quiz,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Teachers and Admins only',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid data',
  })
  async createQuiz(
    @Body() createQuizDto: CreateQuizDto,
    @AuthUser() user: SupabaseUser,
  ): Promise<Quiz> {
    this.logger.log(`Creating quiz for teacher: ${user.id}`);
    return this.quizService.createQuiz(createQuizDto, user.id);
  }

  @Get()
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all quizzes with pagination and filtering' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'teacherId',
    required: false,
    type: String,
    description: 'Filter by teacher ID',
  })
  @ApiQuery({
    name: 'subjectId',
    required: false,
    type: String,
    description: 'Filter by subject ID',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['draft', 'published', 'archived', 'scheduled'],
    description: 'Filter by quiz status',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['created_at', 'title', 'updated_at'],
    description: 'Sort field',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort order',
  })
  @ApiResponse({
    status: 200,
    description: 'Quizzes retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Teachers and Admins only',
  })
  async findAllQuizzes(
    @AuthUser() user: SupabaseUser,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('teacherId') teacherId?: string,
    @Query('subjectId') subjectId?: string,
    @Query('status') status?: string,
    @Query('sortBy') sortBy: string = 'created_at',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    this.logger.log('Fetching quizzes');
    return this.quizService.findAllQuizzes({
      page,
      limit,
      teacherId,
      subjectId,
      status,
      sortBy,
      sortOrder,
    });
  }

  @Get(':id')
  @Roles(UserRole.TEACHER, UserRole.ADMIN, UserRole.STUDENT)
  @ApiOperation({ summary: 'Get a quiz by ID' })
  @ApiResponse({
    status: 200,
    description: 'Quiz retrieved successfully',
    type: Quiz,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  async findQuizById(
    @Param('id') id: string,
    @AuthUser() user: SupabaseUser,
  ): Promise<Quiz> {
    this.logger.log(`Fetching quiz ${id} for user ${user.id}`);
    // Pass user.id to filter student_attempts to current user
    return this.quizService.findQuizById(id, user.id);
  }

  @Patch(':id')
  @Audit({
    entityType: AuditEntityType.QUIZ,
    descriptionField: 'title',
  })
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update a quiz (teachers can only update their own quizzes)',
  })
  @ApiResponse({
    status: 200,
    description: 'Quiz updated successfully',
    type: Quiz,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only update your own quizzes',
  })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  async updateQuiz(
    @Param('id') id: string,
    @Body() updateQuizDto: UpdateQuizDto,
    @AuthUser() user: SupabaseUser,
  ): Promise<Quiz> {
    this.logger.log(`Updating quiz ${id} for teacher: ${user.id}`);
    return this.quizService.updateQuiz(id, updateQuizDto, user.id);
  }

  @Delete(':id')
  @Audit({
    entityType: AuditEntityType.QUIZ,
    descriptionField: 'title',
  })
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a quiz (soft delete by archiving)' })
  @ApiResponse({
    status: 200,
    description: 'Quiz deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only delete your own quizzes',
  })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  async deleteQuiz(
    @Param('id') id: string,
    @AuthUser() user: SupabaseUser,
  ) {
    this.logger.log(`Deleting quiz ${id} for teacher: ${user.id}`);
    // Return the deleted quiz for audit logging
    return this.quizService.deleteQuiz(id, user.id);
  }

  // ==================== QUIZ QUESTIONS ====================

  @Post(':id/questions')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Add a question to a quiz' })
  @ApiResponse({
    status: 201,
    description: 'Question added successfully',
    type: QuizQuestion,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only add questions to your own quizzes',
  })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  async addQuestion(
    @Param('id') quizId: string,
    @Body() createQuestionDto: CreateQuizQuestionDto,
    @AuthUser() user: SupabaseUser,
  ): Promise<QuizQuestion> {
    this.logger.log(`Adding question to quiz ${quizId}`);
    return this.quizService.addQuestion(quizId, createQuestionDto, user.id);
  }

  @Patch(':id/questions/:questionId')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a quiz question' })
  @ApiResponse({
    status: 200,
    description: 'Question updated successfully',
    type: QuizQuestion,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - You can only update questions in your own quizzes',
  })
  @ApiResponse({ status: 404, description: 'Question not found' })
  async updateQuestion(
    @Param('id') quizId: string,
    @Param('questionId') questionId: string,
    @Body() updateQuestionDto: CreateQuizQuestionDto,
    @AuthUser() user: SupabaseUser,
  ): Promise<QuizQuestion> {
    this.logger.log(`Updating question ${questionId} in quiz ${quizId}`);
    return this.quizService.updateQuestion(
      quizId,
      questionId,
      updateQuestionDto,
      user.id,
    );
  }

  @Delete(':id/questions/:questionId')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a quiz question' })
  @ApiResponse({
    status: 200,
    description: 'Question deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - You can only delete questions in your own quizzes',
  })
  @ApiResponse({ status: 404, description: 'Question not found' })
  async deleteQuestion(
    @Param('id') quizId: string,
    @Param('questionId') questionId: string,
    @AuthUser() user: SupabaseUser,
  ): Promise<{ message: string }> {
    this.logger.log(`Deleting question ${questionId} from quiz ${quizId}`);
    await this.quizService.deleteQuestion(quizId, questionId, user.id);
    return { message: 'Question deleted successfully' };
  }

  // ==================== QUIZ SETTINGS ====================

  @Post(':id/settings')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Configure quiz security and monitoring settings' })
  @ApiResponse({
    status: 201,
    description: 'Quiz settings configured successfully',
    type: QuizSettings,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - You can only configure settings for your own quizzes',
  })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  async createQuizSettings(
    @Param('id') quizId: string,
    @Body() settingsDto: CreateQuizSettingsDto,
    @AuthUser() user: SupabaseUser,
  ): Promise<QuizSettings> {
    this.logger.log(`Configuring settings for quiz ${quizId}`);
    return this.quizService.createQuizSettings(quizId, settingsDto, user.id);
  }

  // ==================== QUIZ PUBLISHING ====================

  @Post(':id/publish')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Publish a quiz and optionally assign to sections' })
  @ApiResponse({
    status: 200,
    description: 'Quiz published successfully',
    type: Quiz,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only publish your own quizzes',
  })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  async publishQuiz(
    @Param('id') quizId: string,
    @Body() publishDto: PublishQuizDto,
    @AuthUser() user: SupabaseUser,
  ): Promise<Quiz> {
    this.logger.log(
      `Publishing quiz ${quizId} with status: ${publishDto.status}`,
    );
    return this.quizService.publishQuiz(quizId, publishDto, user.id);
  }

  @Post(':id/schedule')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Schedule a quiz for future availability' })
  @ApiResponse({
    status: 200,
    description: 'Quiz scheduled successfully',
    type: Quiz,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only schedule your own quizzes',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid dates or no sections selected',
  })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  async scheduleQuiz(
    @Param('id') quizId: string,
    @Body()
    scheduleDto: {
      startDate: string;
      endDate?: string;
      sectionIds: string[];
      sectionSettings?: Record<string, { timeLimit?: number }>;
    },
    @AuthUser() user: SupabaseUser,
  ): Promise<Quiz> {
    this.logger.log(`Scheduling quiz ${quizId} for ${scheduleDto.startDate}`);
    return this.quizService.scheduleQuiz(quizId, scheduleDto, user.id);
  }

  // ==================== SECTION ASSIGNMENT ====================

  @Post(':id/assign-sections')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Assign quiz to sections with optional deadline overrides',
  })
  @ApiResponse({
    status: 200,
    description: 'Quiz assigned to sections successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only assign your own quizzes',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Quiz must be published first',
  })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  async assignQuizToSections(
    @Param('id') quizId: string,
    @Body() assignDto: AssignQuizToSectionsDto,
    @AuthUser() user: SupabaseUser,
  ): Promise<{ message: string }> {
    this.logger.log(
      `Assigning quiz ${quizId} to ${assignDto.sectionIds.length} section(s)`,
    );
    await this.quizService.assignQuizToSections(
      quizId,
      assignDto.sectionIds,
      user.id,
      {
        startDate: assignDto.startDate,
        endDate: assignDto.endDate,
        timeLimit: assignDto.timeLimit,
        sectionSettings: assignDto.sectionSettings,
      },
    );
    return { message: 'Quiz assigned to sections successfully' };
  }

  @Get(':id/sections')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get sections assigned to a quiz' })
  @ApiResponse({
    status: 200,
    description: 'Sections retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  async getQuizSections(@Param('id') quizId: string) {
    this.logger.log(`Fetching sections for quiz ${quizId}`);
    return this.quizService.getQuizSections(quizId);
  }

  @Delete(':id/sections')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Remove quiz from all sections' })
  @ApiResponse({
    status: 200,
    description: 'Quiz removed from all sections successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only remove your own quizzes',
  })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  async removeQuizFromSections(
    @Param('id') quizId: string,
    @AuthUser() user: SupabaseUser,
  ): Promise<{ message: string }> {
    this.logger.log(`Removing quiz ${quizId} from all sections`);
    await this.quizService.removeQuizFromAllSections(quizId, user.id);
    return { message: 'Quiz removed from all sections successfully' };
  }

  // ==================== QUIZ CLONING & PREVIEW ====================

  @Post(':id/clone')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Clone/duplicate a quiz' })
  @ApiResponse({
    status: 201,
    description: 'Quiz cloned successfully',
    type: Quiz,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only clone your own quizzes',
  })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  async cloneQuiz(
    @Param('id') quizId: string,
    @Body('newTitle') newTitle: string,
    @AuthUser() user: SupabaseUser,
  ): Promise<Quiz> {
    this.logger.log(`Cloning quiz ${quizId}`);
    return this.quizService.cloneQuiz(quizId, user.id, newTitle);
  }

  @Get(':id/preview')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get quiz preview (for testing before publishing)' })
  @ApiResponse({
    status: 200,
    description: 'Quiz preview retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only preview your own quizzes',
  })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  async getQuizPreview(
    @Param('id') quizId: string,
    @AuthUser() user: SupabaseUser,
  ) {
    this.logger.log(`Getting preview for quiz ${quizId}`);
    return this.quizService.getQuizPreview(quizId, user.id);
  }

  // ==================== QUESTION BANK IMPORT ====================

  @Post(':id/import-question')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Import question from question bank to quiz' })
  @ApiResponse({
    status: 201,
    description: 'Question imported successfully',
    type: QuizQuestion,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - You can only import to your own quizzes or import your own questions',
  })
  @ApiResponse({ status: 404, description: 'Quiz or question not found' })
  async importQuestionFromBank(
    @Param('id') quizId: string,
    @Body() dto: ImportQuestionDto,
    @AuthUser() user: SupabaseUser,
  ): Promise<QuizQuestion> {
    this.logger.log(
      `Importing question ${dto.questionBankId} to quiz ${quizId}`,
    );
    return this.quizService.importQuestionFromBank(
      quizId,
      dto.questionBankId,
      dto.orderIndex,
      user.id,
    );
  }
}
