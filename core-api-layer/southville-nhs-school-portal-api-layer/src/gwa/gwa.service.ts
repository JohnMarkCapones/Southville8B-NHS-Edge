import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateGwaDto } from './dto/create-gwa.dto';
import { UpdateGwaDto } from './dto/update-gwa.dto';
import { Gwa } from './entities/gwa.entity';

export interface StudentGwaDto {
  id?: string;
  student_id: string;
  student_name: string;
  student_number: string;
  gwa?: number;
  remarks?: string;
  honor_status: string;
  gwa_id?: string; // null if no GWA entry exists yet
}

export interface StudentGwaListResponse {
  students: StudentGwaDto[];
  section_name: string;
  grade_level: string;
}

@Injectable()
export class GwaService {
  private readonly logger = new Logger(GwaService.name);
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('supabase.url');
    const serviceRoleKey = this.configService.get<string>(
      'supabase.serviceRoleKey',
    );

    this.supabase = createClient(supabaseUrl!, serviceRoleKey!);
  }

  private getSupabaseClient(): SupabaseClient {
    return this.supabase;
  }

  async getAdvisoryStudentsWithGwa(
    teacherId: string,
    gradingPeriod: string,
    schoolYear: string,
  ): Promise<StudentGwaListResponse> {
    try {
      this.logger.log(
        `Getting advisory students for teacher: ${teacherId}, period: ${gradingPeriod}, year: ${schoolYear}`,
      );

      // First, get the teacher's advisory section
      const { data: teacher, error: teacherError } = await this.supabase
        .from('teachers')
        .select('advisory_section_id')
        .eq('user_id', teacherId)
        .single();

      if (teacherError || !teacher?.advisory_section_id) {
        this.logger.error('Teacher not found or no advisory section assigned');
        throw new NotFoundException(
          'Teacher not found or no advisory section assigned',
        );
      }

      // Get section details
      const { data: section, error: sectionError } = await this.supabase
        .from('sections')
        .select('name, grade_level')
        .eq('id', teacher.advisory_section_id)
        .single();

      if (sectionError || !section) {
        this.logger.error('Section not found');
        throw new NotFoundException('Section not found');
      }

      // Get students in the advisory section with their GWA records
      const { data: studentsWithGwa, error: studentsError } =
        await this.supabase
          .from('students')
          .select(
            `
          id,
          student_id,
          first_name,
          last_name,
          students_gwa!left(
            id,
            gwa,
            remarks,
            honor_status
          )
        `,
          )
          .eq('section_id', teacher.advisory_section_id)
          .eq('students_gwa.grading_period', gradingPeriod)
          .eq('students_gwa.school_year', schoolYear);

      if (studentsError) {
        this.logger.error('Error fetching students with GWA:', studentsError);
        throw new Error(`Failed to fetch students: ${studentsError.message}`);
      }

      const students: StudentGwaDto[] =
        studentsWithGwa?.map((student: any) => ({
          student_id: student.id,
          student_name: `${student.first_name} ${student.last_name}`,
          student_number: student.student_id,
          gwa: student.students_gwa?.[0]?.gwa,
          remarks: student.students_gwa?.[0]?.remarks,
          honor_status: student.students_gwa?.[0]?.honor_status || 'None',
          gwa_id: student.students_gwa?.[0]?.id,
        })) || [];

      this.logger.log(
        `Found ${students.length} students in advisory section: ${section.name}`,
      );

      return {
        students,
        section_name: section.name,
        grade_level: section.grade_level,
      };
    } catch (error) {
      this.logger.error('Error in getAdvisoryStudentsWithGwa:', error);
      throw error;
    }
  }

  async createGwaEntry(dto: CreateGwaDto, recordedBy: string): Promise<any> {
    try {
      this.logger.log(`Creating GWA entry for student: ${dto.student_id}`);

      // Validate that the teacher is the advisor of the student's section
      await this.validateTeacherPermission(dto.student_id, recordedBy);

      // Get teacher.id from user.id (recordedBy is user.id from auth)
      const { data: teacher, error: teacherError } = await this.supabase
        .from('teachers')
        .select('id')
        .eq('user_id', recordedBy)
        .single();

      if (teacherError || !teacher) {
        this.logger.error('Teacher not found for user:', recordedBy);
        throw new NotFoundException('Teacher not found');
      }

      const { data, error } = await this.supabase
        .from('students_gwa')
        .insert({
          student_id: dto.student_id,
          gwa: dto.gwa,
          grading_period: dto.grading_period,
          school_year: dto.school_year,
          remarks: dto.remarks,
          honor_status: dto.honor_status,
          recorded_by: teacher.id, // Use teachers.id, not users.id
        })
        .select()
        .single();

      if (error) {
        this.logger.error('Error creating GWA entry:', error);
        throw new Error(`Failed to create GWA entry: ${error.message}`);
      }

      this.logger.log(`GWA entry created successfully: ${data.id}`);
      return data;
    } catch (error) {
      this.logger.error('Error in createGwaEntry:', error);
      throw error;
    }
  }

  async updateGwaEntry(
    id: string,
    dto: UpdateGwaDto,
    teacherUserId: string, // This is actually user.id from auth
  ): Promise<any> {
    try {
      this.logger.log(`Updating GWA entry: ${id}`);

      // Get teacher.id from user.id (teacherUserId is user.id from auth)
      const { data: teacher, error: teacherError } = await this.supabase
        .from('teachers')
        .select('id')
        .eq('user_id', teacherUserId)
        .single();

      if (teacherError || !teacher) {
        this.logger.error('Teacher not found for user:', teacherUserId);
        throw new NotFoundException('Teacher not found');
      }

      // Validate ownership
      const { data: existingEntry, error: fetchError } = await this.supabase
        .from('students_gwa')
        .select('recorded_by')
        .eq('id', id)
        .single();

      if (fetchError || !existingEntry) {
        throw new NotFoundException('GWA entry not found');
      }

      if (existingEntry.recorded_by !== teacher.id) {
        throw new ForbiddenException(
          'You can only update GWA entries you created',
        );
      }

      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (dto.gwa !== undefined) updateData.gwa = dto.gwa;
      if (dto.remarks !== undefined) updateData.remarks = dto.remarks;
      if (dto.honor_status !== undefined)
        updateData.honor_status = dto.honor_status;

      const { data, error } = await this.supabase
        .from('students_gwa')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        this.logger.error('Error updating GWA entry:', error);
        throw new Error(`Failed to update GWA entry: ${error.message}`);
      }

      this.logger.log(`GWA entry updated successfully: ${id}`);
      return data;
    } catch (error) {
      this.logger.error('Error in updateGwaEntry:', error);
      throw error;
    }
  }

  async deleteGwaEntry(id: string, teacherUserId: string): Promise<void> {
    try {
      this.logger.log(`Deleting GWA entry: ${id}`);

      // Get teacher.id from user.id (teacherUserId is user.id from auth)
      const { data: teacher, error: teacherError } = await this.supabase
        .from('teachers')
        .select('id')
        .eq('user_id', teacherUserId)
        .single();

      if (teacherError || !teacher) {
        this.logger.error('Teacher not found for user:', teacherUserId);
        throw new NotFoundException('Teacher not found');
      }

      // Validate ownership
      const { data: existingEntry, error: fetchError } = await this.supabase
        .from('students_gwa')
        .select('recorded_by')
        .eq('id', id)
        .single();

      if (fetchError || !existingEntry) {
        throw new NotFoundException('GWA entry not found');
      }

      if (existingEntry.recorded_by !== teacher.id) {
        throw new ForbiddenException(
          'You can only delete GWA entries you created',
        );
      }

      const { error } = await this.supabase
        .from('students_gwa')
        .delete()
        .eq('id', id);

      if (error) {
        this.logger.error('Error deleting GWA entry:', error);
        throw new Error(`Failed to delete GWA entry: ${error.message}`);
      }

      this.logger.log(`GWA entry deleted successfully: ${id}`);
    } catch (error) {
      this.logger.error('Error in deleteGwaEntry:', error);
      throw error;
    }
  }

  private async validateTeacherPermission(
    studentId: string,
    teacherId: string,
  ): Promise<void> {
    // Get student's section
    const { data: student, error: studentError } = await this.supabase
      .from('students')
      .select('section_id')
      .eq('id', studentId)
      .single();

    if (studentError || !student) {
      throw new NotFoundException('Student not found');
    }

    // Check if teacher is the advisor of this section
    const { data: teacher, error: teacherError } = await this.supabase
      .from('teachers')
      .select('advisory_section_id')
      .eq('user_id', teacherId)
      .single();

    if (teacherError || !teacher) {
      throw new NotFoundException('Teacher not found');
    }

    if (teacher.advisory_section_id !== student.section_id) {
      throw new ForbiddenException(
        'You can only enter GWA for students in your advisory section',
      );
    }
  }

  /**
   * Get GWA records for a specific student
   */
  async getStudentGwa(
    userId: string,
    gradingPeriod?: string,
    schoolYear?: string,
  ): Promise<Gwa[]> {
    try {
      this.logger.log(
        `Getting GWA records for student user: ${userId}, period: ${gradingPeriod}, year: ${schoolYear}`,
      );

      // Get student ID from user ID
      const { data: student, error: studentError } = await this.supabase
        .from('students')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (studentError || !student) {
        this.logger.error('Student not found for user:', userId);
        throw new NotFoundException('Student record not found');
      }

      // Query students_gwa table with optional filters
      let query = this.supabase
        .from('students_gwa')
        .select('*')
        .eq('student_id', student.id)
        .order('school_year', { ascending: false })
        .order('grading_period', { ascending: false });

      if (gradingPeriod) {
        query = query.eq('grading_period', gradingPeriod);
      }
      if (schoolYear) {
        query = query.eq('school_year', schoolYear);
      }

      const { data: gwaRecords, error } = await query;

      if (error) {
        this.logger.error('Error fetching student GWA records:', error);
        throw new InternalServerErrorException(
          'Failed to fetch student GWA records',
        );
      }

      this.logger.log(
        `Found ${gwaRecords?.length || 0} GWA records for student: ${student.id}`,
      );

      return gwaRecords || [];
    } catch (error) {
      this.logger.error('Error in getStudentGwa:', error);
      throw error;
    }
  }

  /**
   * Get top students by GWA for leaderboard display (public endpoint)
   */
  async getTopStudents(params: {
    gradeLevel?: string;
    quarter?: string;
    schoolYear?: string;
    limit?: number;
  }): Promise<Gwa[]> {
    const supabase = this.getSupabaseClient();
    const { gradeLevel, quarter, schoolYear, limit = 10 } = params;

    let query = supabase
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
      .order('gwa', { ascending: false })
      .limit(limit);

    // Apply filters
    if (gradeLevel) {
      query = query.eq('student.grade_level', gradeLevel);
    }

    if (quarter) {
      query = query.eq('grading_period', quarter);
    }

    if (schoolYear) {
      query = query.eq('school_year', schoolYear);
    }

    const { data: gwaRecords, error } = await query;

    if (error) {
      this.logger.error('Error fetching top students by GWA:', error);
      throw new InternalServerErrorException(
        'Failed to fetch top students by GWA',
      );
    }

    return gwaRecords || [];
  }
}
