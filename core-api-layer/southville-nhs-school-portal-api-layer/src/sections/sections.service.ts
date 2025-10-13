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
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { Section } from './entities/section.entity';

@Injectable()
export class SectionsService {
  private readonly logger = new Logger(SectionsService.name);
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

      this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    }
    return this.supabase;
  }

  async create(createSectionDto: CreateSectionDto): Promise<Section> {
    try {
      const supabase = this.getSupabaseClient();

      // Validate teacher exists if teacherId is provided
      if (createSectionDto.teacherId) {
        const { data: teacher, error: teacherError } = await supabase
          .from('users')
          .select('id, role:roles(name)')
          .eq('id', createSectionDto.teacherId)
          .single();

        if (teacherError || !teacher) {
          throw new BadRequestException('Teacher not found');
        }

        if ((teacher.role as any)?.name !== 'Teacher') {
          throw new BadRequestException('User is not a teacher');
        }
      }

      const { data: section, error } = await supabase
        .from('sections')
        .insert({
          name: createSectionDto.name,
          grade_level: createSectionDto.gradeLevel,
          teacher_id: createSectionDto.teacherId,
          room_id: createSectionDto.roomId,
          building_id: createSectionDto.buildingId,
        })
        .select(
          `
          *,
          teacher:users(id, full_name, email)
        `,
        )
        .single();

      if (error) {
        this.logger.error('Error creating section:', error);
        throw new InternalServerErrorException(
          `Failed to create section: ${error.message}`,
        );
      }

      this.logger.log(`Section created successfully: ${section.name}`);
      return section;
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error('Error creating section:', error);
      throw new InternalServerErrorException('Failed to create section');
    }
  }

  async findAll(filters: any = {}): Promise<any> {
    const supabase = this.getSupabaseClient();
    const {
      page = 1,
      limit = 10,
      search,
      gradeLevel,
      teacherId,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = filters;

    let query = supabase.from('sections').select(`
      *,
      teacher:users(id, full_name, email),
      students:students(id, first_name, last_name, student_id)
    `);

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,grade_level.ilike.%${search}%`);
    }
    if (gradeLevel) {
      query = query.eq('grade_level', gradeLevel);
    }
    if (teacherId) {
      query = query.eq('teacher_id', teacherId);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: sections, error, count } = await query;

    if (error) {
      this.logger.error('Error fetching sections:', error);
      throw new InternalServerErrorException('Failed to fetch sections');
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return {
      data: sections,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findOne(id: string): Promise<Section> {
    const supabase = this.getSupabaseClient();

    const { data: section, error } = await supabase
      .from('sections')
      .select(
        `
        *,
        teacher:users(id, full_name, email),
        students:students(id, first_name, last_name, student_id)
      `,
      )
      .eq('id', id)
      .single();

    if (error) {
      this.logger.error('Error fetching section:', error);
      throw new NotFoundException('Section not found');
    }

    return section;
  }

  async update(
    id: string,
    updateSectionDto: UpdateSectionDto,
  ): Promise<Section> {
    const supabase = this.getSupabaseClient();

    // Validate teacher exists if teacherId is provided
    if (updateSectionDto.teacherId) {
      const { data: teacher, error: teacherError } = await supabase
        .from('users')
        .select('id, role:roles(name)')
        .eq('id', updateSectionDto.teacherId)
        .single();

      if (teacherError || !teacher) {
        throw new BadRequestException('Teacher not found');
      }

      if ((teacher.role as any)?.name !== 'Teacher') {
        throw new BadRequestException('User is not a teacher');
      }
    }

    const { data: section, error } = await supabase
      .from('sections')
      .update({
        name: updateSectionDto.name,
        grade_level: updateSectionDto.gradeLevel,
        teacher_id: updateSectionDto.teacherId,
        room_id: updateSectionDto.roomId,
        building_id: updateSectionDto.buildingId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(
        `
        *,
        teacher:users(id, full_name, email)
      `,
      )
      .single();

    if (error) {
      this.logger.error('Error updating section:', error);
      throw new InternalServerErrorException(
        `Failed to update section: ${error.message}`,
      );
    }

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    this.logger.log(`Section updated successfully: ${section.name}`);
    return section;
  }

  async remove(id: string): Promise<void> {
    const supabase = this.getSupabaseClient();

    // Check if section has students
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id')
      .eq('section_id', id)
      .limit(1);

    if (studentsError) {
      this.logger.error('Error checking students:', studentsError);
      throw new InternalServerErrorException(
        'Failed to check section students',
      );
    }

    if (students && students.length > 0) {
      throw new BadRequestException(
        'Cannot delete section with assigned students',
      );
    }

    const { error } = await supabase.from('sections').delete().eq('id', id);

    if (error) {
      this.logger.error('Error deleting section:', error);
      throw new InternalServerErrorException(
        `Failed to delete section: ${error.message}`,
      );
    }

    this.logger.log(`Section deleted successfully: ${id}`);
  }

  async getSectionsByTeacher(teacherId: string): Promise<Section[]> {
    const supabase = this.getSupabaseClient();

    const { data: sections, error } = await supabase
      .from('sections')
      .select(
        `
        *,
        teacher:users(id, full_name, email),
        students:students(id, first_name, last_name, student_id)
      `,
      )
      .eq('teacher_id', teacherId)
      .order('name');

    if (error) {
      this.logger.error('Error fetching teacher sections:', error);
      throw new InternalServerErrorException(
        'Failed to fetch teacher sections',
      );
    }

    return sections || [];
  }

  async getSectionsByGradeLevel(gradeLevel: string): Promise<Section[]> {
    const supabase = this.getSupabaseClient();

    const { data: sections, error } = await supabase
      .from('sections')
      .select(
        `
        *,
        teacher:users(id, full_name, email),
        students:students(id, first_name, last_name, student_id)
      `,
      )
      .eq('grade_level', gradeLevel)
      .order('name');

    if (error) {
      this.logger.error('Error fetching grade level sections:', error);
      throw new InternalServerErrorException(
        'Failed to fetch grade level sections',
      );
    }

    return sections || [];
  }
}
