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
import { QuestionBankService } from '../services/question-bank.service';
import { CreateQuestionBankDto } from '../dto/create-question-bank.dto';
import { UpdateQuestionBankDto } from '../dto/update-question-bank.dto';
import { QuestionBank } from '../entities/question-bank.entity';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { PoliciesGuard } from '../../auth/guards/policies.guard';
import { Roles, UserRole } from '../../auth/decorators/roles.decorator';
import { AuthUser } from '../../auth/auth-user.decorator';
import { SupabaseUser } from '../../auth/interfaces/supabase-user.interface';

@ApiTags('Question Bank')
@ApiBearerAuth('JWT-auth')
@Controller('question-bank')
@UseGuards(SupabaseAuthGuard, PoliciesGuard, RolesGuard)
export class QuestionBankController {
  private readonly logger = new Logger(QuestionBankController.name);

  constructor(private readonly questionBankService: QuestionBankService) {}

  @Post()
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a reusable question template' })
  @ApiResponse({
    status: 201,
    description: 'Question created successfully',
    type: QuestionBank,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Teachers and Admins only',
  })
  async create(
    @Body() createDto: CreateQuestionBankDto,
    @AuthUser() user: SupabaseUser,
  ): Promise<QuestionBank> {
    this.logger.log(`Creating question bank item for teacher: ${user.id}`);
    return this.questionBankService.create(createDto, user.id);
  }

  @Get()
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all questions from your question bank' })
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
  @ApiQuery({
    name: 'topic',
    required: false,
    type: String,
    description: 'Filter by topic',
  })
  @ApiQuery({
    name: 'difficulty',
    required: false,
    enum: ['easy', 'medium', 'hard'],
    description: 'Filter by difficulty',
  })
  @ApiQuery({
    name: 'questionType',
    required: false,
    type: String,
    description: 'Filter by question type',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search in question text (case-insensitive)',
  })
  @ApiQuery({
    name: 'tags',
    required: false,
    type: String,
    description: 'Filter by tags (comma-separated, e.g., "math,algebra")',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['created_at', 'question_text', 'difficulty'],
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
    description: 'Questions retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @AuthUser() user: SupabaseUser,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('subjectId') subjectId?: string,
    @Query('topic') topic?: string,
    @Query('difficulty') difficulty?: string,
    @Query('questionType') questionType?: string,
    @Query('search') search?: string,
    @Query('tags') tags?: string,
    @Query('sortBy') sortBy: string = 'created_at',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    this.logger.log('Fetching question bank');

    // Parse tags from comma-separated string to array
    const tagsArray = tags
      ? tags
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t.length > 0)
      : undefined;

    return this.questionBankService.findAll({
      page,
      limit,
      teacherId: user.id, // Teachers only see their own questions
      subjectId,
      topic,
      difficulty,
      questionType,
      search,
      tags: tagsArray,
      sortBy,
      sortOrder,
    });
  }

  @Get(':id')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get a question by ID' })
  @ApiResponse({
    status: 200,
    description: 'Question retrieved successfully',
    type: QuestionBank,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only view your own questions',
  })
  async findOne(
    @Param('id') id: string,
    @AuthUser() user: SupabaseUser,
  ): Promise<QuestionBank> {
    this.logger.log(`Fetching question ${id}`);
    return this.questionBankService.findOne(id, user.id);
  }

  @Patch(':id')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a question in your question bank' })
  @ApiResponse({
    status: 200,
    description: 'Question updated successfully',
    type: QuestionBank,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only update your own questions',
  })
  @ApiResponse({ status: 404, description: 'Question not found' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateQuestionBankDto,
    @AuthUser() user: SupabaseUser,
  ): Promise<QuestionBank> {
    this.logger.log(`Updating question ${id}`);
    return this.questionBankService.update(id, updateDto, user.id);
  }

  @Delete(':id')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a question from your question bank' })
  @ApiResponse({
    status: 200,
    description: 'Question deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only delete your own questions',
  })
  @ApiResponse({ status: 404, description: 'Question not found' })
  async remove(
    @Param('id') id: string,
    @AuthUser() user: SupabaseUser,
  ): Promise<{ message: string }> {
    this.logger.log(`Deleting question ${id}`);
    await this.questionBankService.remove(id, user.id);
    return { message: 'Question deleted successfully' };
  }

  @Get(':id/usage')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get usage statistics for a question' })
  @ApiResponse({
    status: 200,
    description: 'Usage statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        usage_count: { type: 'number', example: 5 },
        quizzes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              quiz_id: { type: 'string', format: 'uuid' },
              title: { type: 'string' },
              status: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only view usage for your own questions',
  })
  @ApiResponse({ status: 404, description: 'Question not found' })
  async getUsageStats(@Param('id') id: string, @AuthUser() user: SupabaseUser) {
    this.logger.log(`Getting usage statistics for question ${id}`);
    return this.questionBankService.getUsageStats(id, user.id);
  }
}
