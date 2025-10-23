import {
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { Subject } from './entities/subject.entity';

@Injectable()
export class SubjectsService {
  private readonly logger = new Logger(SubjectsService.name);
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {}

  private getSupabaseClient(): SupabaseClient {
    if (!this.supabase) {
      const supabaseUrl = this.configService.get<string>('supabase.url');
      const supabaseServiceKey = this.configService.get<string>(
        'supabase.serviceRoleKey',
      );

      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase configuration is missing');
      }

      this.supabase = createClient(
        supabaseUrl,
        supabaseServiceKey,
      ) as SupabaseClient;
    }
    return this.supabase;
  }

  async create(createSubjectDto: CreateSubjectDto): Promise<Subject> {
    try {
      const supabase = this.getSupabaseClient();

      // Check if subject code already exists
      const { data: existingSubject } = await supabase
        .from('subjects')
        .select('id')
        .eq('code', createSubjectDto.code)
        .single();

      if (existingSubject) {
        throw new ConflictException('Subject code already exists');
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { data: subject, error } = await supabase
        .from('subjects')
        .insert({
          code: createSubjectDto.code,
          subject_name: createSubjectDto.subject_name,
          description: createSubjectDto.description,
          department_id: createSubjectDto.department_id,
          grade_levels: createSubjectDto.grade_levels,
          status: createSubjectDto.status || 'inactive',
          visibility: createSubjectDto.visibility || 'public',
        })
        .select()
        .single();

      if (error) {
        this.logger.error('Error creating subject:', error);
        throw new InternalServerErrorException(
          `Failed to create subject: ${error.message}`,
        );
      }

      return subject as Subject;
    } catch (error) {
      this.handleError(error, 'create subject');
    }
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: Subject[]; pagination: any }> {
    try {
      const supabase = this.getSupabaseClient();
      const {
        page = 1,
        limit = 10,
        search,
        sortBy = 'created_at',
        sortOrder = 'desc',
      } = params;

      let query = supabase.from('subjects').select('*', { count: 'exact' });

      // Apply search filter
      if (search) {
        query = query.or(
          `code.ilike.%${search}%,subject_name.ilike.%${search}%,description.ilike.%${search}%`,
        );
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data: subjects, error, count } = await query;

      if (error) {
        this.logger.error('Error fetching subjects:', error);
        throw new InternalServerErrorException(
          `Failed to fetch subjects: ${error.message}`,
        );
      }

      return {
        data: (subjects || []) as Subject[],
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error) {
      this.handleError(error, 'fetch subjects');
    }
  }

  async findOne(id: string): Promise<Subject> {
    try {
      const supabase = this.getSupabaseClient();

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { data: subject, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new NotFoundException('Subject not found');
        }
        this.logger.error('Error fetching subject:', error);
        throw new InternalServerErrorException(
          `Failed to fetch subject: ${error.message}`,
        );
      }

      return subject as Subject;
    } catch (error) {
      this.handleError(error, 'fetch subject');
    }
  }

  async update(
    id: string,
    updateSubjectDto: UpdateSubjectDto,
  ): Promise<Subject> {
    try {
      const supabase = this.getSupabaseClient();

      // Check if subject exists
      const existingSubject = await this.findOne(id);
      if (!existingSubject) {
        throw new NotFoundException('Subject not found');
      }

      // Check if code is being updated and if it already exists
      if (
        updateSubjectDto.code &&
        updateSubjectDto.code !== existingSubject.code
      ) {
        const { data: codeExists } = await supabase
          .from('subjects')
          .select('id')
          .eq('code', updateSubjectDto.code)
          .neq('id', id)
          .single();

        if (codeExists) {
          throw new ConflictException('Subject code already exists');
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { data: subject, error } = await supabase
        .from('subjects')
        .update({
          ...updateSubjectDto,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        this.logger.error('Error updating subject:', error);
        throw new InternalServerErrorException(
          `Failed to update subject: ${error.message}`,
        );
      }

      return subject as Subject;
    } catch (error) {
      this.handleError(error, 'update subject');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const supabase = this.getSupabaseClient();

      // Check if subject exists
      await this.findOne(id);

      const { error } = await supabase.from('subjects').delete().eq('id', id);

      if (error) {
        this.logger.error('Error deleting subject:', error);
        throw new InternalServerErrorException(
          `Failed to delete subject: ${error.message}`,
        );
      }
    } catch (error) {
      this.handleError(error, 'delete subject');
    }
  }

  private handleError(error: any, operation: string): never {
    if (
      error instanceof NotFoundException ||
      error instanceof ConflictException ||
      error instanceof BadRequestException
    ) {
      throw error;
    }

    this.logger.error(`Error in ${operation}:`, error);
    throw new InternalServerErrorException(
      `An error occurred while ${operation}`,
    );
  }
}
