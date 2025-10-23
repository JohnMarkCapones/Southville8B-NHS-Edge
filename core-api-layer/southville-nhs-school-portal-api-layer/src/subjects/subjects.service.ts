import {
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { Subject } from './entities/subject.entity';
import { SubjectQueryDto } from './dto/subject-query.dto';

export interface PaginatedResult {
  data: Subject[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class SubjectsService {
  private readonly logger = new Logger(SubjectsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  private getSupabaseClient() {
    return this.supabaseService.getServiceClient();
  }

  async findAll(query: SubjectQueryDto): Promise<PaginatedResult> {
    try {
      const { page = 1, limit = 10, search, status, departmentId, department_id } = query;
      const supabase = this.getSupabaseClient();

      let queryBuilder = supabase
        .from('subjects')
        .select('*', { count: 'exact' })
        .eq('is_deleted', false);

      if (search) {
        queryBuilder = queryBuilder.or(
          `subject_name.ilike.%${search}%,code.ilike.%${search}%`,
        );
      }

      if (status) {
        queryBuilder = queryBuilder.eq('status', status);
      }

      if (departmentId || department_id) {
        queryBuilder = queryBuilder.eq('department_id', departmentId || department_id);
      }

      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit - 1;

      const { data, error, count } = await queryBuilder
        .order('created_at', { ascending: false })
        .range(startIndex, endIndex);

      if (error) {
        this.logger.error('Error fetching subjects:', error);
        throw new InternalServerErrorException('Failed to fetch subjects');
      }

      return {
        data: (data || []) as Subject[],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      };
    } catch (error) {
      this.handleError(error, 'fetch subjects');
    }
  }

  async findOne(id: string): Promise<Subject> {
    try {
      const supabase = this.getSupabaseClient();
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('id', id)
        .eq('is_deleted', false)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          this.logger.warn(`Subject with id ${id} not found`);
          throw new NotFoundException(`Subject with ID ${id} not found`);
        }
        this.logger.error('Error fetching subject:', error);
        throw new InternalServerErrorException('Failed to fetch subject');
      }

      return data;
    } catch (error) {
      this.handleError(error, 'fetch subject');
    }
  }

  async create(createSubjectDto: CreateSubjectDto): Promise<Subject> {
    try {
      const supabase = this.getSupabaseClient();
      const { data, error } = await supabase
        .from('subjects')
        .insert(createSubjectDto)
        .select()
        .single();

      if (error) {
        this.logger.error('Error creating subject:', error);
        throw new InternalServerErrorException('Failed to create subject');
      }

      this.logger.log(`Subject created with ID: ${data.id}`);
      return data;
    } catch (error) {
      this.handleError(error, 'create subject');
    }
  }

  async update(id: string, updateSubjectDto: UpdateSubjectDto): Promise<Subject> {
    try {
      const supabase = this.getSupabaseClient();
      const { data, error } = await supabase
        .from('subjects')
        .update(updateSubjectDto)
        .eq('id', id)
        .eq('is_deleted', false)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new NotFoundException(`Subject with ID ${id} not found`);
        }
        this.logger.error('Error updating subject:', error);
        throw new InternalServerErrorException('Failed to update subject');
      }

      this.logger.log(`Subject updated with ID: ${id}`);
      return data;
    } catch (error) {
      this.handleError(error, 'update subject');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const supabase = this.getSupabaseClient();
      const { error } = await supabase
        .from('subjects')
        .update({ is_deleted: true })
        .eq('id', id);

      if (error) {
        this.logger.error('Error deleting subject:', error);
        throw new InternalServerErrorException('Failed to delete subject');
      }

      this.logger.log(`Subject soft deleted with ID: ${id}`);
    } catch (error) {
      this.handleError(error, 'delete subject');
    }
  }

  private handleError(error: any, operation: string): never {
    if (error instanceof NotFoundException || error instanceof BadRequestException) {
      throw error;
    }

    this.logger.error(`Error during ${operation}:`, error);
    throw new InternalServerErrorException(`Failed to ${operation}`);
  }
}