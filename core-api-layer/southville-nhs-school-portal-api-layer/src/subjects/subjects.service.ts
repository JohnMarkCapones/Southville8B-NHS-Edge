import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { Subject } from './entities/subject.entity';
import { SubjectQueryDto } from './dto/subject-query.dto';

interface PaginatedResult {
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
      const { page = 1, limit = 10, departmentId, gradeLevel, search } = query;
      const offset = (page - 1) * limit;

      let supabaseQuery = this.getSupabaseClient()
        .from('subjects')
        .select(
          `
          *,
          department:department_id(id, department_name, description)
        `,
          { count: 'exact' },
        )
        .order('subject_name', { ascending: true });

      // Apply filters
      if (departmentId) {
        supabaseQuery = supabaseQuery.eq('department_id', departmentId);
      }

      if (gradeLevel) {
        supabaseQuery = supabaseQuery.eq('grade_level', gradeLevel);
      }

      if (search) {
        supabaseQuery = supabaseQuery.ilike('subject_name', `%${search}%`);
      }

      // Apply pagination
      supabaseQuery = supabaseQuery.range(offset, offset + limit - 1);

      const { data, error, count } = await supabaseQuery;

      if (error) {
        this.logger.error('Error fetching subjects:', error);
        throw new InternalServerErrorException('Failed to fetch subjects');
      }

      const totalPages = Math.ceil((count || 0) / limit);

      return {
        data: data || [],
        total: count || 0,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      this.logger.error('Error fetching subjects:', error);
      throw new InternalServerErrorException('Failed to fetch subjects');
    }
  }

  async findOne(id: string): Promise<Subject> {
    try {
      const { data, error } = await this.getSupabaseClient()
        .from('subjects')
        .select(
          `
          *,
          department:department_id(id, department_name, description)
        `,
        )
        .eq('id', id)
        .single();

      if (error) {
        this.logger.error('Error fetching subject:', error);
        throw new InternalServerErrorException('Failed to fetch subject');
      }

      return data;
    } catch (error) {
      this.logger.error('Error fetching subject:', error);
      throw new InternalServerErrorException('Failed to fetch subject');
    }
  }
}
