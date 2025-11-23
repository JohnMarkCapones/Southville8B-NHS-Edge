import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateGwaDto } from './dto/create-gwa.dto';
import { UpdateGwaDto } from './dto/update-gwa.dto';
import { Gwa } from './entities/gwa.entity';
import { NotificationService } from '../common/services/notification.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import { ActivityMonitoringService } from '../activity-monitoring/activity-monitoring.service';

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
  private readonly gradingPeriodOrderMap: Record<string, number> = {
    Q1: 1,
    Q2: 2,
    Q3: 3,
    Q4: 4,
  };
  private readonly rankingEpsilon = 0.0001;

  constructor(
    private configService: ConfigService,
    private notificationService: NotificationService,
    private activityMonitoring: ActivityMonitoringService,
  ) {
    const supabaseUrl = this.configService.get<string>('supabase.url');
    const serviceRoleKey = this.configService.get<string>(
      'supabase.serviceRoleKey',
    );

    this.supabase = createClient(supabaseUrl!, serviceRoleKey!);
  }

  private getSupabaseClient(): SupabaseClient {
    return this.supabase;
  }

  async getStudentGwaHistory(studentId: string): Promise<any[]> {
    try {
      this.logger.log(`Getting GWA history for student: ${studentId}`);

      const { data: gwaRecords, error } = await this.supabase
        .from('students_gwa')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) {
        this.logger.error('Error fetching GWA history:', error);
        throw new Error(`Failed to fetch GWA history: ${error.message}`);
      }

      this.logger.log(
        `Found ${gwaRecords?.length || 0} GWA records for student: ${studentId}`,
      );
      return gwaRecords || [];
    } catch (error) {
      this.logger.error('Error in getStudentGwaHistory:', error);
      throw error;
    }
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

      const advisoryContext = await this.resolveAcademicContext({
        schoolYear,
        gradingPeriod,
        strict: false,
      });

      // Get students in the advisory section with their GWA records
      let studentsQuery = this.supabase
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
          honor_status,
          academic_year_id,
          academic_period_id
        )
      `,
        )
        .eq('section_id', teacher.advisory_section_id);

      if (advisoryContext.academicYearId && advisoryContext.academicPeriodId) {
        studentsQuery = studentsQuery
          .eq('students_gwa.academic_year_id', advisoryContext.academicYearId)
          .eq(
            'students_gwa.academic_period_id',
            advisoryContext.academicPeriodId,
          );
      } else {
        studentsQuery = studentsQuery
          .eq('students_gwa.grading_period', gradingPeriod)
          .eq('students_gwa.school_year', schoolYear);
      }

      const { data: studentsWithGwa, error: studentsError } =
        await studentsQuery;

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

      const academicContext = await this.resolveAcademicContext({
        academicYearId: dto.academic_year_id,
        academicPeriodId: dto.academic_period_id,
        schoolYear: dto.school_year,
        gradingPeriod: dto.grading_period,
        strict: true,
      });

      const { data, error } = await this.supabase
        .from('students_gwa')
        .insert({
          student_id: dto.student_id,
          gwa: dto.gwa,
          grading_period: dto.grading_period,
          school_year: dto.school_year,
          academic_year_id: academicContext.academicYearId,
          academic_period_id: academicContext.academicPeriodId,
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

      const { data: studentProfile, error: studentProfileError } =
        await this.supabase
          .from('students')
          .select('user_id, first_name, last_name, section_id, grade_level')
          .eq('id', dto.student_id)
          .single();

      if (studentProfileError || !studentProfile) {
        this.logger.error('Student profile not found for GWA entry');
        throw new NotFoundException('Student not found');
      }

      try {
        await this.recomputeStudentRankingsForContext({
          gradeLevel: studentProfile.grade_level,
          gradingPeriod: dto.grading_period,
          schoolYear: dto.school_year,
        });
      } catch (rankingError) {
        this.logger.warn(
          'Failed to recompute rankings after GWA creation:',
          rankingError,
        );
      }

      // Activity monitoring - notify student about grade entry
      try {
        if (studentProfile?.user_id) {
          // Get subject name from grading period (simplified - could be enhanced)
          const subject = `GWA ${dto.grading_period}`;
          const grade = dto.gwa?.toFixed(2) || 'N/A';

          await this.activityMonitoring.handleGradeEntered(
            data.id,
            studentProfile.user_id,
            subject,
            grade,
            recordedBy,
          );

          // Performance alert - check if GWA is below threshold (75)
          if (dto.gwa && dto.gwa < 75) {
            // Find the advisory teacher for the student's section
            if (studentProfile.section_id) {
              const { data: advisoryTeacher } = await this.supabase
                .from('teachers')
                .select('user_id')
                .eq('advisory_section_id', studentProfile.section_id)
                .single();

              if (advisoryTeacher?.user_id) {
                const studentName = `${studentProfile.first_name} ${studentProfile.last_name}`;
                const alertReason = `GWA dropped to ${dto.gwa.toFixed(2)} (below 75) for ${dto.grading_period} ${dto.school_year}`;

                await this.activityMonitoring.handlePerformanceAlert(
                  dto.student_id,
                  studentName,
                  subject,
                  advisoryTeacher.user_id,
                  alertReason,
                );
              }
            }
          }
        }
      } catch (error) {
        this.logger.warn(
          'Failed to handle grade entry activity monitoring:',
          error,
        );
      }

      // Notify student about GWA entry creation
      try {
        if (studentProfile?.user_id) {
          await this.notificationService.notifyUser(
            studentProfile.user_id,
            'GWA Recorded',
            `Your GWA for ${dto.grading_period} ${dto.school_year} has been recorded. GWA: ${dto.gwa?.toFixed(2) || 'N/A'}, Honor Status: ${dto.honor_status}`,
            NotificationType.INFO,
            recordedBy,
            { expiresInDays: 7 },
          );
        }
      } catch (error) {
        this.logger.warn(
          'Failed to create notification for GWA creation:',
          error,
        );
      }

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
        .select('recorded_by, student_id, grading_period, school_year')
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

      const { data: studentProfile, error: studentProfileError } =
        await this.supabase
          .from('students')
          .select('user_id, grade_level')
          .eq('id', existingEntry.student_id)
          .single();

      if (studentProfileError || !studentProfile) {
        throw new NotFoundException('Student not found');
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

      try {
        await this.recomputeStudentRankingsForContext({
          gradeLevel: studentProfile.grade_level,
          gradingPeriod: existingEntry.grading_period,
          schoolYear: existingEntry.school_year,
        });
      } catch (rankingError) {
        this.logger.warn(
          'Failed to recompute rankings after GWA update:',
          rankingError,
        );
      }

      // Notify student about GWA entry update
      try {
        if (studentProfile?.user_id) {
          const updatedFields: string[] = [];
          if (dto.gwa !== undefined) {
            updatedFields.push(`GWA: ${dto.gwa.toFixed(2)}`);
          }
          if (dto.honor_status !== undefined) {
            updatedFields.push(`Honor Status: ${dto.honor_status}`);
          }
          if (dto.remarks !== undefined) {
            updatedFields.push('Remarks updated');
          }

          await this.notificationService.notifyUser(
            studentProfile.user_id,
            'GWA Updated',
            `Your GWA for ${existingEntry.grading_period} ${existingEntry.school_year} has been updated. ${updatedFields.join(', ')}`,
            NotificationType.INFO,
            teacherUserId,
            { expiresInDays: 7 },
          );
        }
      } catch (error) {
        this.logger.warn(
          'Failed to create notification for GWA update:',
          error,
        );
      }

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

      // Validate ownership and get student_id for notification
      const { data: existingEntry, error: fetchError } = await this.supabase
        .from('students_gwa')
        .select('recorded_by, student_id, grading_period, school_year')
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

      const { data: studentProfile, error: studentProfileError } =
        await this.supabase
          .from('students')
          .select('user_id, grade_level')
          .eq('id', existingEntry.student_id)
          .single();

      if (studentProfileError || !studentProfile) {
        throw new NotFoundException('Student not found');
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

      try {
        await this.recomputeStudentRankingsForContext({
          gradeLevel: studentProfile.grade_level,
          gradingPeriod: existingEntry.grading_period,
          schoolYear: existingEntry.school_year,
        });
      } catch (rankingError) {
        this.logger.warn(
          'Failed to recompute rankings after GWA deletion:',
          rankingError,
        );
      }

      // Notify student about GWA entry deletion
      try {
        if (studentProfile?.user_id) {
          await this.notificationService.notifyUser(
            studentProfile.user_id,
            'GWA Record Deleted',
            'Your GWA record has been deleted by your advisor.',
            NotificationType.WARNING,
            teacherUserId,
            { expiresInDays: 7 },
          );
        }
      } catch (error) {
        this.logger.warn(
          'Failed to create notification for GWA deletion:',
          error,
        );
      }
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

      let studentContext: {
        academicYearId: string | null;
        academicPeriodId: string | null;
      } = { academicYearId: null, academicPeriodId: null };
      if (gradingPeriod || schoolYear) {
        studentContext = await this.resolveAcademicContext({
          schoolYear,
          gradingPeriod,
          strict: false,
        });
      }

      if (studentContext.academicPeriodId) {
        query = query.eq('academic_period_id', studentContext.academicPeriodId);
      } else if (gradingPeriod) {
        query = query.eq('grading_period', gradingPeriod);
      }

      if (studentContext.academicYearId) {
        query = query.eq('academic_year_id', studentContext.academicYearId);
      } else if (schoolYear) {
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

  private async recomputeStudentRankingsForContext(params: {
    gradeLevel?: string | null;
    gradingPeriod?: string | null;
    schoolYear?: string | null;
  }): Promise<void> {
    const { gradeLevel, gradingPeriod, schoolYear } = params;

    if (!gradeLevel || !gradingPeriod || !schoolYear) {
      this.logger.warn(
        'Skipping ranking recompute - incomplete context',
        params,
      );
      return;
    }

    const supabase = this.getSupabaseClient();

    const { data: gwaRows, error } = await supabase
      .from('students_gwa')
      .select(
        `
        id,
        student_id,
        gwa,
        honor_status,
        grading_period,
        school_year,
        created_at,
        updated_at,
        student:students!inner(
          id,
          grade_level,
          first_name,
          last_name,
          student_id
        )
      `,
      )
      .eq('grading_period', gradingPeriod)
      .eq('school_year', schoolYear)
      .eq('student.grade_level', gradeLevel);

    if (error) {
      this.logger.error('Failed to load GWA rows for ranking recompute', error);
      throw new InternalServerErrorException('Failed to recompute rankings');
    }

    const rows = gwaRows ?? [];
    if (!rows.length) {
      await supabase
        .from('student_rankings')
        .delete()
        .eq('grade_level', gradeLevel)
        .eq('quarter', gradingPeriod)
        .eq('school_year', schoolYear);
      this.logger.log(
        `Cleared rankings for ${gradeLevel} ${gradingPeriod} ${schoolYear} - no GWA data`,
      );
      return;
    }

    const latestByStudent = new Map<string, any>();
    rows.forEach((row) => {
      const candidateTime = new Date(
        row.updated_at ?? row.created_at ?? 0,
      ).getTime();
      const existing = latestByStudent.get(row.student_id);

      if (!existing) {
        latestByStudent.set(row.student_id, row);
        return;
      }

      const existingTime = new Date(
        existing.updated_at ?? existing.created_at ?? 0,
      ).getTime();

      if (candidateTime >= existingTime) {
        latestByStudent.set(row.student_id, row);
      }
    });

    const normalizedRows = Array.from(latestByStudent.values())
      .map((row) => {
        const gwaValue =
          typeof row.gwa === 'number' ? row.gwa : Number(row.gwa);
        return {
          student_id: row.student_id as string,
          grade_level: row.student?.grade_level ?? gradeLevel,
          first_name: row.student?.first_name ?? '',
          last_name: row.student?.last_name ?? '',
          student_number: row.student?.student_id ?? '',
          honor_status: row.honor_status ?? 'None',
          gwaValue: Number.isFinite(gwaValue) ? gwaValue : null,
        };
      })
      .filter((row) => row.gwaValue !== null);

    if (!normalizedRows.length) {
      await supabase
        .from('student_rankings')
        .delete()
        .eq('grade_level', gradeLevel)
        .eq('quarter', gradingPeriod)
        .eq('school_year', schoolYear);
      this.logger.log(
        `Cleared rankings for ${gradeLevel} ${gradingPeriod} ${schoolYear} - no numeric GWA values`,
      );
      return;
    }

    normalizedRows.sort((a, b) => {
      const scoreDiff = (b.gwaValue ?? 0) - (a.gwaValue ?? 0);
      if (Math.abs(scoreDiff) > this.rankingEpsilon) {
        return scoreDiff;
      }

      const lastNameDiff = a.last_name.localeCompare(b.last_name);
      if (lastNameDiff !== 0) {
        return lastNameDiff;
      }

      const firstNameDiff = a.first_name.localeCompare(b.first_name);
      if (firstNameDiff !== 0) {
        return firstNameDiff;
      }

      return a.student_number.localeCompare(b.student_number);
    });

    const upsertPayload: Array<{
      student_id: string;
      grade_level: string;
      rank: number;
      honor_status: string;
      quarter: string;
      school_year: string;
      updated_at: string;
    }> = [];

    let denseRank = 0;
    let previousScore: number | null = null;
    const nowIso = new Date().toISOString();

    for (const row of normalizedRows) {
      if (row.gwaValue === null) {
        continue;
      }

      if (
        previousScore === null ||
        Math.abs(row.gwaValue - previousScore) > this.rankingEpsilon
      ) {
        denseRank += 1;
      }

      previousScore = row.gwaValue;

      if (denseRank > 100) {
        break;
      }

      upsertPayload.push({
        student_id: row.student_id,
        grade_level: row.grade_level,
        rank: denseRank,
        honor_status: row.honor_status,
        quarter: gradingPeriod,
        school_year: schoolYear,
        updated_at: nowIso,
      });
    }

    if (!upsertPayload.length) {
      await supabase
        .from('student_rankings')
        .delete()
        .eq('grade_level', gradeLevel)
        .eq('quarter', gradingPeriod)
        .eq('school_year', schoolYear);
      return;
    }

    const { error: upsertError } = await supabase
      .from('student_rankings')
      .upsert(upsertPayload, {
        onConflict: 'student_id,grade_level,quarter,school_year',
      });

    if (upsertError) {
      this.logger.error('Failed to upsert student rankings', upsertError);
      throw new InternalServerErrorException('Failed to recompute rankings');
    }

    const { data: existingRankings, error: existingError } = await supabase
      .from('student_rankings')
      .select('id, student_id')
      .eq('grade_level', gradeLevel)
      .eq('quarter', gradingPeriod)
      .eq('school_year', schoolYear);

    if (!existingError && existingRankings?.length) {
      const keepIds = new Set(upsertPayload.map((row) => row.student_id));
      const idsToDelete = existingRankings
        .filter((row) => !keepIds.has(row.student_id))
        .map((row) => row.id);

      if (idsToDelete.length) {
        await supabase.from('student_rankings').delete().in('id', idsToDelete);
      }
    }

    this.logger.log(
      `Recomputed ${upsertPayload.length} rankings for ${gradeLevel} ${gradingPeriod} ${schoolYear}`,
    );
  }

  private async resolveAcademicContext(options: {
    academicYearId?: string;
    academicPeriodId?: string;
    schoolYear?: string;
    gradingPeriod?: string;
    strict?: boolean;
  }): Promise<{
    academicYearId: string | null;
    academicPeriodId: string | null;
  }> {
    const strict = options.strict ?? false;
    let academicYearId = options.academicYearId ?? null;

    if (academicYearId) {
      const { data: yearRow, error } = await this.supabase
        .from('academic_years')
        .select('id')
        .eq('id', academicYearId)
        .maybeSingle();

      if (error) {
        this.logger.warn('Failed to validate academic year ID', error);
      }

      if (!yearRow?.id) {
        if (strict) {
          throw new NotFoundException(
            'Academic year not found for the provided identifier',
          );
        }
        academicYearId = null;
      }
    } else if (options.schoolYear) {
      const { data: yearRow, error } = await this.supabase
        .from('academic_years')
        .select('id')
        .eq('year_name', options.schoolYear)
        .maybeSingle();

      if (error) {
        this.logger.warn('Failed to map school year to academic_years', error);
      }

      if (yearRow?.id) {
        academicYearId = yearRow.id;
      } else if (strict) {
        throw new NotFoundException(
          `Academic year ${options.schoolYear} has no configured record`,
        );
      }
    } else if (strict) {
      throw new BadRequestException('Academic year information is required');
    }

    let academicPeriodId = options.academicPeriodId ?? null;

    if (academicPeriodId) {
      const { data: periodRow, error } = await this.supabase
        .from('academic_periods')
        .select('id, academic_year_id')
        .eq('id', academicPeriodId)
        .maybeSingle();

      if (error) {
        this.logger.warn('Failed to validate academic period ID', error);
      }

      if (!periodRow?.id) {
        if (strict) {
          throw new NotFoundException(
            'Academic period not found for the provided identifier',
          );
        }
        academicPeriodId = null;
      } else if (
        academicYearId &&
        periodRow.academic_year_id !== academicYearId
      ) {
        if (strict) {
          throw new BadRequestException(
            'Academic period does not belong to the specified academic year',
          );
        }
        academicPeriodId = null;
      } else {
        academicYearId = academicYearId ?? periodRow.academic_year_id;
      }
    }

    const periodOrder = options.gradingPeriod
      ? this.gradingPeriodOrderMap[options.gradingPeriod]
      : undefined;

    if (!periodOrder && options.gradingPeriod && strict) {
      throw new BadRequestException(
        `Unsupported grading period value: ${options.gradingPeriod}`,
      );
    }

    if (!academicPeriodId && periodOrder && academicYearId) {
      const { data: periodRow, error } = await this.supabase
        .from('academic_periods')
        .select('id')
        .eq('academic_year_id', academicYearId)
        .eq('period_order', periodOrder)
        .maybeSingle();

      if (error) {
        this.logger.warn(
          'Failed to match grading period to academic_periods',
          error,
        );
      }

      if (periodRow?.id) {
        academicPeriodId = periodRow.id;
      } else if (strict) {
        throw new NotFoundException(
          `Academic period ${options.gradingPeriod} is not configured for the selected academic year`,
        );
      }
    } else if (!academicPeriodId && strict) {
      throw new BadRequestException('Academic period information is required');
    }

    return { academicYearId, academicPeriodId };
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

    let leaderboardContext: {
      academicYearId: string | null;
      academicPeriodId: string | null;
    } = { academicYearId: null, academicPeriodId: null };

    if (quarter || schoolYear) {
      leaderboardContext = await this.resolveAcademicContext({
        schoolYear,
        gradingPeriod: quarter,
        strict: false,
      });
    }

    if (leaderboardContext.academicPeriodId) {
      query = query.eq(
        'academic_period_id',
        leaderboardContext.academicPeriodId,
      );
    } else if (quarter) {
      query = query.eq('grading_period', quarter);
    }

    if (leaderboardContext.academicYearId) {
      query = query.eq('academic_year_id', leaderboardContext.academicYearId);
    } else if (schoolYear) {
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
