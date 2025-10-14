import {
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateGwaDto } from './dto/create-gwa.dto';
import { UpdateGwaDto } from './dto/update-gwa.dto';
import { QueryGwaDto } from './dto/query-gwa.dto';
import { SupabaseUser } from '../auth/interfaces/supabase-user.interface';
import { Gwa, HonorStatus } from './entities/gwa.entity';

@Injectable()
export class GwaService {
  private readonly logger = new Logger(GwaService.name);
  private supabase: SupabaseClient | null = null;

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

  /**
   * Calculate honor status based on GWA
   */
  private calculateHonorStatus(gwa: number): HonorStatus {
    if (gwa >= 98) return HonorStatus.WITH_HIGHEST_HONORS;
    if (gwa >= 95) return HonorStatus.WITH_HIGH_HONORS;
    if (gwa >= 90) return HonorStatus.WITH_HONORS;
    return HonorStatus.NONE;
  }

  /**
   * Generate predefined remarks based on GWA
   */
  private generateRemarks(gwa: number): string {
    if (gwa >= 95) return 'Excellent Performance';
    if (gwa >= 85) return 'Very Satisfactory';
    if (gwa >= 75) return 'Satisfactory';
    return 'Needs Improvement';
  }

  /**
   * Validate if teacher can manage GWA for this student
   */
  private async validateTeacherAccess(
    teacherId: string,
    studentId: string,
  ): Promise<boolean> {
    const supabase = this.getSupabaseClient();

    const { data, error } = await supabase
      .from('teachers')
      .select(
        `
        id,
        advisory_section_id,
        advisory_section:sections(
          id,
          students!inner(id)
        )
      `,
      )
      .eq('id', teacherId)
      .eq('advisory_section.students.id', studentId)
      .single();

    if (error) {
      this.logger.error('Error validating teacher access:', error);
      return false;
    }

    return !!data;
  }

  /**
   * Check if user is admin
   */
  private async isAdmin(userId: string): Promise<boolean> {
    const supabase = this.getSupabaseClient();

    const { data, error } = await supabase
      .from('users')
      .select(
        `
        id,
        role:roles(name)
      `,
      )
      .eq('id', userId)
      .eq('role.name', 'Admin')
      .single();

    if (error) {
      this.logger.error('Error checking admin status:', error);
      return false;
    }

    return !!data;
  }

  /**
   * Create a new GWA record
   */
  async create(createGwaDto: CreateGwaDto, recordedBy: string): Promise<Gwa> {
    try {
      const supabase = this.getSupabaseClient();

      // Check if user is admin first
      const isUserAdmin = await this.isAdmin(recordedBy);
      let teacherId: string;

      if (isUserAdmin) {
        // Admin: fetch advisory teacher by student's section_id
        const { data: student, error: studentError } = await supabase
          .from('students')
          .select('section_id')
          .eq('id', createGwaDto.studentId)
          .single();

        if (studentError || !student) {
          throw new NotFoundException('Student not found');
        }

        const { data: advisoryTeacher, error: teacherError } = await supabase
          .from('teachers')
          .select('id')
          .eq('advisory_section_id', student.section_id)
          .single();

        if (teacherError || !advisoryTeacher) {
          throw new InternalServerErrorException(
            'No advisory teacher found for student section',
          );
        }

        teacherId = advisoryTeacher.id;
      } else {
        // Teacher: validate access and use their own ID
        const { data: teacher, error: teacherError } = await supabase
          .from('teachers')
          .select('id')
          .eq('user_id', recordedBy)
          .single();

        if (teacherError || !teacher) {
          throw new ForbiddenException(
            'Teacher record not found for this user',
          );
        }

        const hasAccess = await this.validateTeacherAccess(
          teacher.id,
          createGwaDto.studentId,
        );
        if (!hasAccess) {
          throw new ForbiddenException(
            'You can only create GWA records for students in your advisory section',
          );
        }

        teacherId = teacher.id;
      }

      // Check if student exists
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('id, section_id')
        .eq('id', createGwaDto.studentId)
        .single();

      if (studentError || !student) {
        throw new NotFoundException('Student not found');
      }

      // Check for duplicate GWA record for same period and year
      const { data: existingGwa, error: duplicateError } = await supabase
        .from('students_gwa')
        .select('id')
        .eq('student_id', createGwaDto.studentId)
        .eq('grading_period', createGwaDto.gradingPeriod)
        .eq('school_year', createGwaDto.schoolYear)
        .single();

      if (existingGwa) {
        throw new ConflictException(
          `GWA record already exists for student in ${createGwaDto.gradingPeriod} ${createGwaDto.schoolYear}`,
        );
      }

      // Calculate honor status and generate remarks if not provided
      const honorStatus = this.calculateHonorStatus(createGwaDto.gwa);
      const remarks =
        createGwaDto.remarks || this.generateRemarks(createGwaDto.gwa);

      // Create GWA record
      const { data: gwa, error: gwaError } = await supabase
        .from('students_gwa')
        .insert({
          student_id: createGwaDto.studentId,
          gwa: createGwaDto.gwa,
          grading_period: createGwaDto.gradingPeriod,
          school_year: createGwaDto.schoolYear,
          remarks: remarks,
          honor_status: honorStatus,
          recorded_by: teacherId,
        })
        .select(
          `
          *,
          student:students(
            id,
            first_name,
            last_name,
            middle_name,
            student_id,
            lrn_id,
            grade_level,
            section:sections(
              id,
              name,
              grade_level
            )
          ),
          teacher:teachers(
            id,
            first_name,
            last_name,
            middle_name,
            advisory_section:sections(
              id,
              name,
              grade_level
            )
          )
        `,
        )
        .single();

      if (gwaError) {
        this.logger.error('Error creating GWA record:', gwaError);
        // 23505 = unique_violation (Postgres) — Supabase exposes in error.code
        if ((gwaError as any).code === '23505') {
          throw new ConflictException(
            `GWA record already exists for student in ${createGwaDto.gradingPeriod} ${createGwaDto.schoolYear}`,
          );
        }
        throw new InternalServerErrorException('Failed to create GWA record');
      }

      this.logger.log(
        `GWA record created successfully for student ${createGwaDto.studentId}`,
      );
      return gwa;
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      this.logger.error('Error creating GWA record:', error);
      throw new InternalServerErrorException('Failed to create GWA record');
    }
  }

  /**
   * Find all GWA records with filters and pagination
   */
  async findAll(queryDto: QueryGwaDto): Promise<any> {
    const supabase = this.getSupabaseClient();
    const {
      page = 1,
      limit = 10,
      studentId,
      gradingPeriod,
      schoolYear,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = queryDto;

    let query = supabase.from('students_gwa').select(
      `
        *,
        student:students(
          id,
          first_name,
          last_name,
          middle_name,
          student_id,
          lrn_id,
          grade_level,
          section:sections(
            id,
            name,
            grade_level
          )
        ),
        teacher:teachers(
          id,
          first_name,
          last_name,
          middle_name,
          advisory_section:sections(
            id,
            name,
            grade_level
          )
        )
      `,
      { count: 'exact' },
    );

    // Apply filters
    if (studentId) {
      query = query.eq('student_id', studentId);
    }
    if (gradingPeriod) {
      query = query.eq('grading_period', gradingPeriod);
    }
    if (schoolYear) {
      query = query.eq('school_year', schoolYear);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'ASC' });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      this.logger.error('Error fetching GWA records:', error);
      throw new InternalServerErrorException('Failed to fetch GWA records');
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
   * Find a single GWA record by ID
   */
  async findOne(id: string): Promise<Gwa> {
    const supabase = this.getSupabaseClient();

    const { data: gwa, error } = await supabase
      .from('students_gwa')
      .select(
        `
        *,
        student:students(
          id,
          first_name,
          last_name,
          middle_name,
          student_id,
          lrn_id,
          grade_level,
          section:sections(
            id,
            name,
            grade_level
          )
        ),
        teacher:teachers(
          id,
          first_name,
          last_name,
          middle_name,
          advisory_section:sections(
            id,
            name,
            grade_level
          )
        )
      `,
      )
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundException('GWA record not found');
      }
      this.logger.error('Error fetching GWA record:', error);
      throw new InternalServerErrorException('Failed to fetch GWA record');
    }

    return gwa;
  }

  /**
   * Update a GWA record
   */
  async update(
    id: string,
    updateGwaDto: UpdateGwaDto,
    updatedBy: string,
  ): Promise<Gwa> {
    try {
      const supabase = this.getSupabaseClient();

      // Get existing GWA record first
      const { data: existingGwa, error: fetchError } = await supabase
        .from('students_gwa')
        .select('student_id, recorded_by, grading_period, school_year')
        .eq('id', id)
        .single();

      if (fetchError || !existingGwa) {
        throw new NotFoundException('GWA record not found');
      }

      // Check if user is admin first
      const isUserAdmin = await this.isAdmin(updatedBy);
      if (!isUserAdmin) {
        // Only fetch teacher record for non-admin users
        const { data: teacher, error: teacherError } = await supabase
          .from('teachers')
          .select('id')
          .eq('user_id', updatedBy)
          .single();

        if (teacherError || !teacher) {
          throw new ForbiddenException(
            'Teacher record not found for this user',
          );
        }

        const hasAccess = await this.validateTeacherAccess(
          teacher.id,
          existingGwa.student_id,
        );
        if (!hasAccess) {
          throw new ForbiddenException(
            'You can only update GWA records for students in your advisory section',
          );
        }
      }

      // Prepare update data
      const updateData: any = {};

      if (updateGwaDto.gwa !== undefined) {
        updateData.gwa = updateGwaDto.gwa;
        updateData.honor_status = this.calculateHonorStatus(updateGwaDto.gwa);
        // Update remarks if not provided and GWA changed
        if (!updateGwaDto.remarks) {
          updateData.remarks = this.generateRemarks(updateGwaDto.gwa);
        }
      }

      if (updateGwaDto.gradingPeriod !== undefined) {
        updateData.grading_period = updateGwaDto.gradingPeriod;
      }

      if (updateGwaDto.schoolYear !== undefined) {
        updateData.school_year = updateGwaDto.schoolYear;
      }

      if (updateGwaDto.remarks !== undefined) {
        updateData.remarks = updateGwaDto.remarks;
      }

      // Check for duplicate if grading period or school year changed
      if (updateGwaDto.gradingPeriod || updateGwaDto.schoolYear) {
        const { data: duplicateGwa, error: duplicateError } = await supabase
          .from('students_gwa')
          .select('id')
          .eq('student_id', existingGwa.student_id)
          .eq(
            'grading_period',
            updateGwaDto.gradingPeriod || existingGwa.grading_period,
          )
          .eq('school_year', updateGwaDto.schoolYear || existingGwa.school_year)
          .neq('id', id)
          .single();

        if (duplicateGwa) {
          throw new ConflictException(
            `GWA record already exists for student in ${updateGwaDto.gradingPeriod || existingGwa.grading_period} ${updateGwaDto.schoolYear || existingGwa.school_year}`,
          );
        }
      }

      // Update GWA record
      const { data: gwa, error: updateError } = await supabase
        .from('students_gwa')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select(
          `
          *,
          student:students(
            id,
            first_name,
            last_name,
            middle_name,
            student_id,
            lrn_id,
            grade_level,
            section:sections(
              id,
              name,
              grade_level
            )
          ),
          teacher:teachers(
            id,
            first_name,
            last_name,
            middle_name,
            advisory_section:sections(
              id,
              name,
              grade_level
            )
          )
        `,
        )
        .single();

      if (updateError) {
        this.logger.error('Error updating GWA record:', updateError);
        throw new InternalServerErrorException('Failed to update GWA record');
      }

      this.logger.log(`GWA record updated successfully: ${id}`);
      return gwa;
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      this.logger.error('Error updating GWA record:', error);
      throw new InternalServerErrorException('Failed to update GWA record');
    }
  }

  /**
   * Remove a GWA record (Admin only)
   */
  async remove(id: string, deletedBy: string): Promise<void> {
    try {
      const supabase = this.getSupabaseClient();

      // Check if user is admin
      const isUserAdmin = await this.isAdmin(deletedBy);
      if (!isUserAdmin) {
        throw new ForbiddenException(
          'Only administrators can delete GWA records',
        );
      }

      // Check if GWA record exists
      const { data: existingGwa, error: fetchError } = await supabase
        .from('students_gwa')
        .select('id')
        .eq('id', id)
        .single();

      if (fetchError || !existingGwa) {
        throw new NotFoundException('GWA record not found');
      }

      // Delete GWA record
      const { error: deleteError } = await supabase
        .from('students_gwa')
        .delete()
        .eq('id', id);

      if (deleteError) {
        this.logger.error('Error deleting GWA record:', deleteError);
        throw new InternalServerErrorException('Failed to delete GWA record');
      }

      this.logger.log(`GWA record deleted successfully: ${id}`);
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      this.logger.error('Error deleting GWA record:', error);
      throw new InternalServerErrorException('Failed to delete GWA record');
    }
  }

  /**
   * Get GWA history for a specific student
   */
  async findByStudent(
    studentId: string,
    requester: SupabaseUser,
  ): Promise<Gwa[]> {
    const supabase = this.getSupabaseClient();

    // AuthZ: admins and teachers can view any; students can view only their own
    const isUserAdmin = await this.isAdmin(requester.id);
    if (!isUserAdmin) {
      const { data: teacher, error: teacherError } = await supabase
        .from('teachers')
        .select('id')
        .eq('user_id', requester.id)
        .single();
      const isTeacher = !teacherError && !!teacher;
      if (!isTeacher) {
        const { data: studentProfile, error: studentErr } = await supabase
          .from('students')
          .select('id')
          .eq('user_id', requester.id)
          .single();
        if (studentErr || !studentProfile || studentProfile.id !== studentId) {
          throw new ForbiddenException(
            'You can only view your own GWA history',
          );
        }
      }
    }

    const { data: gwaRecords, error } = await supabase
      .from('students_gwa')
      .select(
        `
        *,
        student:students(
          id,
          first_name,
          last_name,
          middle_name,
          student_id,
          lrn_id,
          grade_level,
          section:sections(
            id,
            name,
            grade_level
          )
        ),
        teacher:teachers(
          id,
          first_name,
          last_name,
          middle_name,
          advisory_section:sections(
            id,
            name,
            grade_level
          )
        )
      `,
      )
      .eq('student_id', studentId)
      .order('school_year', { ascending: false })
      .order('grading_period', { ascending: true });

    if (error) {
      this.logger.error('Error fetching student GWA history:', error);
      throw new InternalServerErrorException(
        'Failed to fetch student GWA history',
      );
    }

    return gwaRecords || [];
  }
}
