import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { Section, SectionWithDetails } from './entities/section.entity';

@Injectable()
export class SectionsService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration is missing');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async create(createSectionDto: CreateSectionDto): Promise<Section> {
    try {
      // Check if section name already exists for this grade level
      const { data: existingSection } = await this.supabase
        .from('sections')
        .select('id')
        .eq('name', createSectionDto.name)
        .eq('grade_level', createSectionDto.grade_level)
        .single();

      if (existingSection) {
        throw new ConflictException(
          `Section ${createSectionDto.name} already exists for ${createSectionDto.grade_level}`,
        );
      }

      // Check if teacher is already assigned to another section
      if (createSectionDto.teacher_id) {
        const { data: teacherSection } = await this.supabase
          .from('sections')
          .select('id, name')
          .eq('teacher_id', createSectionDto.teacher_id)
          .single();

        if (teacherSection) {
          throw new ConflictException(
            `Teacher is already assigned to section ${teacherSection.name}`,
          );
        }
      }

      const { data, error } = await this.supabase
        .from('sections')
        .insert(createSectionDto)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create section: ${error.message}`);
      }

      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async findAll(params?: {
    page?: number;
    limit?: number;
    grade_level?: string;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: SectionWithDetails[]; pagination: any }> {
    try {
      const page = params?.page || 1;
      const limit = params?.limit || 20;
      const offset = (page - 1) * limit;

      let query = this.supabase.from('sections_with_details').select('*');

      // Apply filters
      if (params?.grade_level) {
        query = query.eq('grade_level', params.grade_level);
      }

      if (params?.status) {
        query = query.eq('status', params.status);
      }

      if (params?.search) {
        query = query.or(
          `name.ilike.%${params.search}%,grade_level.ilike.%${params.search}%`,
        );
      }

      // Apply sorting
      const sortBy = params?.sortBy || 'created_at';
      const sortOrder = params?.sortOrder || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Failed to fetch sections: ${error.message}`);
      }

      return {
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async findOne(id: string): Promise<SectionWithDetails> {
    try {
      const { data, error } = await this.supabase
        .from('sections_with_details')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        throw new NotFoundException(`Section with ID ${id} not found`);
      }

      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async findByGradeLevel(gradeLevel: string): Promise<SectionWithDetails[]> {
    try {
      const { data, error } = await this.supabase
        .from('sections_with_details')
        .select('*')
        .eq('grade_level', gradeLevel)
        .order('name');

      if (error) {
        throw new Error(
          `Failed to fetch sections for grade ${gradeLevel}: ${error.message}`,
        );
      }

      return data || [];
    } catch (error) {
      this.handleError(error);
    }
  }

  async update(
    id: string,
    updateSectionDto: UpdateSectionDto,
  ): Promise<Section> {
    try {
      // Check if section exists
      const existingSection = await this.findOne(id);

      // Check if section name already exists for this grade level (excluding current section)
      if (
        updateSectionDto.name &&
        updateSectionDto.name !== existingSection.name
      ) {
        const { data: duplicateSection } = await this.supabase
          .from('sections')
          .select('id')
          .eq('name', updateSectionDto.name)
          .eq(
            'grade_level',
            updateSectionDto.grade_level || existingSection.grade_level,
          )
          .neq('id', id)
          .single();

        if (duplicateSection) {
          throw new ConflictException(
            `Section ${updateSectionDto.name} already exists for this grade level`,
          );
        }
      }

      // Check if teacher is already assigned to another section
      if (
        updateSectionDto.teacher_id &&
        updateSectionDto.teacher_id !== existingSection.teacher_id
      ) {
        const { data: teacherSection } = await this.supabase
          .from('sections')
          .select('id, name')
          .eq('teacher_id', updateSectionDto.teacher_id)
          .neq('id', id)
          .single();

        if (teacherSection) {
          throw new ConflictException(
            `Teacher is already assigned to section ${teacherSection.name}`,
          );
        }
      }

      const { data, error } = await this.supabase
        .from('sections')
        .update(updateSectionDto)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update section: ${error.message}`);
      }

      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('sections')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete section: ${error.message}`);
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  async findByTeacherId(teacherId: string): Promise<SectionWithDetails[]> {
    try {
      const { data, error } = await this.supabase
        .from('sections_with_details')
        .select('*')
        .eq('teacher_id', teacherId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(
          `Failed to fetch sections for teacher: ${error.message}`,
        );
      }

      return data || [];
    } catch (error) {
      this.handleError(error);
    }
  }

  async getMySections(userId: string): Promise<SectionWithDetails[]> {
    try {
      const { data, error } = await this.supabase
        .from('sections_with_details')
        .select('*')
        .eq('teacher_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch sections for user: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      this.handleError(error);
    }
  }

  async getAvailableTeachers(): Promise<any[]> {
    try {
      const { data, error } = await this.supabase.rpc('get_available_teachers');

      if (error) {
        throw new Error(`Failed to fetch available teachers: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: any): never {
    if (
      error instanceof NotFoundException ||
      error instanceof ConflictException
    ) {
      throw error;
    }
    throw new Error(error.message || 'An unexpected error occurred');
  }
}
