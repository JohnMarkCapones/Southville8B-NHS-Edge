import {
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateQuestionBankDto } from '../dto/create-question-bank.dto';
import { UpdateQuestionBankDto } from '../dto/update-question-bank.dto';
import { QuestionBank } from '../entities/question-bank.entity';

@Injectable()
export class QuestionBankService {
  private readonly logger = new Logger(QuestionBankService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Create a question in the question bank
   */
  async create(
    createDto: CreateQuestionBankDto,
    teacherId: string,
  ): Promise<QuestionBank> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      const { data: question, error } = await supabase
        .from('question_bank')
        .insert({
          teacher_id: teacherId,
          question_text: createDto.questionText,
          question_type: createDto.questionType,
          subject_id: createDto.subjectId,
          topic: createDto.topic,
          difficulty: createDto.difficulty,
          tags: createDto.tags,
          default_points: createDto.defaultPoints || 1,
          choices: createDto.choices,
          correct_answer: createDto.correctAnswer,
          allow_partial_credit: createDto.allowPartialCredit || false,
          time_limit_seconds: createDto.timeLimitSeconds,
        })
        .select()
        .single();

      if (error) {
        this.logger.error('Error creating question bank item:', error);
        throw new InternalServerErrorException(
          `Failed to create question: ${error.message}`,
        );
      }

      this.logger.log(`Question bank item created: ${question.id}`);
      return question;
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.error('Error creating question bank item:', error);
      throw new InternalServerErrorException('Failed to create question');
    }
  }

  /**
   * Get all questions from teacher's question bank
   */
  async findAll(filters: any = {}): Promise<any> {
    const supabase = this.supabaseService.getClient();
    const {
      page = 1,
      limit = 10,
      teacherId,
      subjectId,
      topic,
      difficulty,
      questionType,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = filters;

    let query = supabase.from('question_bank').select('*', { count: 'exact' });

    // Filter by teacher (required for teachers to see only their questions)
    if (teacherId) {
      query = query.eq('teacher_id', teacherId);
    }

    // Apply filters
    if (subjectId) {
      query = query.eq('subject_id', subjectId);
    }
    if (topic) {
      query = query.eq('topic', topic);
    }
    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }
    if (questionType) {
      query = query.eq('question_type', questionType);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      this.logger.error('Error fetching question bank:', error);
      throw new InternalServerErrorException('Failed to fetch questions');
    }

    return {
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  }

  /**
   * Get a single question by ID
   */
  async findOne(id: string, teacherId: string): Promise<QuestionBank> {
    const supabase = this.supabaseService.getClient();

    const { data: question, error } = await supabase
      .from('question_bank')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundException('Question not found');
      }
      this.logger.error('Error fetching question:', error);
      throw new InternalServerErrorException('Failed to fetch question');
    }

    // Verify ownership
    if (question.teacher_id !== teacherId) {
      throw new ForbiddenException(
        'You can only view your own question bank items',
      );
    }

    return question;
  }

  /**
   * Update a question in the question bank
   */
  async update(
    id: string,
    updateDto: UpdateQuestionBankDto,
    teacherId: string,
  ): Promise<QuestionBank> {
    const supabase = this.supabaseService.getServiceClient();

    // Verify ownership
    await this.findOne(id, teacherId);

    const { data: updatedQuestion, error } = await supabase
      .from('question_bank')
      .update({
        ...(updateDto.questionText && { question_text: updateDto.questionText }),
        ...(updateDto.questionType && { question_type: updateDto.questionType }),
        ...(updateDto.subjectId !== undefined && {
          subject_id: updateDto.subjectId,
        }),
        ...(updateDto.topic !== undefined && { topic: updateDto.topic }),
        ...(updateDto.difficulty !== undefined && {
          difficulty: updateDto.difficulty,
        }),
        ...(updateDto.tags !== undefined && { tags: updateDto.tags }),
        ...(updateDto.defaultPoints !== undefined && {
          default_points: updateDto.defaultPoints,
        }),
        ...(updateDto.choices !== undefined && { choices: updateDto.choices }),
        ...(updateDto.correctAnswer !== undefined && {
          correct_answer: updateDto.correctAnswer,
        }),
        ...(updateDto.allowPartialCredit !== undefined && {
          allow_partial_credit: updateDto.allowPartialCredit,
        }),
        ...(updateDto.timeLimitSeconds !== undefined && {
          time_limit_seconds: updateDto.timeLimitSeconds,
        }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      this.logger.error('Error updating question:', error);
      throw new InternalServerErrorException('Failed to update question');
    }

    this.logger.log(`Question bank item updated: ${id}`);
    return updatedQuestion;
  }

  /**
   * Delete a question from the question bank
   */
  async remove(id: string, teacherId: string): Promise<void> {
    const supabase = this.supabaseService.getServiceClient();

    // Verify ownership
    await this.findOne(id, teacherId);

    const { error } = await supabase.from('question_bank').delete().eq('id', id);

    if (error) {
      this.logger.error('Error deleting question:', error);
      throw new InternalServerErrorException('Failed to delete question');
    }

    this.logger.log(`Question bank item deleted: ${id}`);
  }
}
