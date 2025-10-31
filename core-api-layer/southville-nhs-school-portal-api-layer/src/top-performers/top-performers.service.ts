import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import {
  TopPerformersQueryDto,
  StatsQueryDto,
} from './dto/top-performers-query.dto';
import {
  TopPerformer,
  TopPerformersStats,
  TopPerformersListResponse,
  StudentPerformanceDetails,
} from './entities/top-performer.entity';

@Injectable()
export class TopPerformersService {
  private readonly logger = new Logger(TopPerformersService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Get top performers with filtering and pagination
   */
  async getTopPerformers(
    query: TopPerformersQueryDto,
  ): Promise<TopPerformersListResponse> {
    try {
      this.logger.log(
        `Fetching top performers with query: ${JSON.stringify(query)}`,
      );

      const supabase = this.supabaseService.getClient();
      const {
        page = 1,
        limit = 10,
        search,
        gradeLevel,
        timePeriod,
        topN = 10,
      } = query;

      // Build the base query for students with GWA data
      let queryBuilder = supabase.from('students').select(`
          id,
          user_id,
          first_name,
          last_name,
          student_id,
          grade_level,
          section_id,
          sections!inner(
            id,
            name
          ),
          students_gwa!inner(
            id,
            gwa,
            grading_period,
            school_year,
            honor_status,
            remarks,
            created_at
          )
        `);
      // Apply filters
      if (search) {
        queryBuilder = queryBuilder.or(
          `first_name.ilike.%${search}%,last_name.ilike.%${search}%,student_id.ilike.%${search}%`,
        );
      }

      if (gradeLevel && gradeLevel !== 'all') {
        queryBuilder = queryBuilder.eq('grade_level', parseInt(gradeLevel));
      }

      // Apply time period filter
      if (timePeriod) {
        const currentDate = new Date();
        let startDate: Date;
        const endDate: Date = currentDate;

        switch (timePeriod) {
          case 'current-quarter':
            // Get current quarter based on current date
            const currentMonth = currentDate.getMonth();
            if (currentMonth >= 0 && currentMonth <= 2) {
              startDate = new Date(currentDate.getFullYear(), 0, 1); // Q1
            } else if (currentMonth >= 3 && currentMonth <= 5) {
              startDate = new Date(currentDate.getFullYear(), 3, 1); // Q2
            } else if (currentMonth >= 6 && currentMonth <= 8) {
              startDate = new Date(currentDate.getFullYear(), 6, 1); // Q3
            } else {
              startDate = new Date(currentDate.getFullYear(), 9, 1); // Q4
            }
            break;
          case 'semester':
            startDate = new Date(currentDate.getFullYear(), 0, 1);
            break;
          case 'school-year':
            startDate = new Date(currentDate.getFullYear() - 1, 5, 1); // June of previous year
            break;
          case 'all-time':
          default:
            startDate = new Date(2020, 0, 1); // Far back date
            break;
        }

        queryBuilder = queryBuilder
          .gte('students_gwa.created_at', startDate.toISOString())
          .lte('students_gwa.created_at', endDate.toISOString());
      }

      // Execute query
      const {
        data: students,
        error,
        count,
      } = await queryBuilder.range((page - 1) * limit, page * limit - 1);

      if (error) {
        this.logger.error('Error fetching top performers:', error);
        throw new BadRequestException(
          `Failed to fetch top performers: ${error.message}`,
        );
      }

      // Transform and sort data by GWA (lower is better)
      const performers: TopPerformer[] = (students || [])
        .map((student) => ({
          id: student.id,
          rank: 0, // Will be set after sorting
          studentId: student.student_id,
          name: `${student.first_name} ${student.last_name}`,
          gradeLevel: student.grade_level,
          section: (student.sections as any)?.name || 'Unknown',
          gwa: student.students_gwa?.[0]?.gwa || 0,
          recognitionDate:
            student.students_gwa?.[0]?.created_at || new Date().toISOString(),
          status: 'Active' as const,
          academicYearId: student.students_gwa?.[0]?.school_year,
          gradingPeriod: student.students_gwa?.[0]?.grading_period,
          honorStatus: student.students_gwa?.[0]?.honor_status,
          remarks: student.students_gwa?.[0]?.remarks,
        }))
        .sort((a, b) => a.gwa - b.gwa) // Sort by GWA ascending (lower is better)
        .map((performer, index) => ({
          ...performer,
          rank: index + 1 + (page - 1) * limit,
        }))
        .slice(0, topN);

      // Get statistics
      const stats = await this.getTopPerformersStats({
        timePeriod,
        gradeLevel,
      });

      const totalPages = Math.ceil((count || 0) / limit);

      return {
        performers,
        total: count || 0,
        page,
        limit,
        totalPages,
        stats,
      };
    } catch (error) {
      this.logger.error('Unexpected error fetching top performers:', error);
      throw new BadRequestException('Failed to fetch top performers');
    }
  }

  /**
   * Get top performers statistics
   */
  async getTopPerformersStats(
    query: StatsQueryDto,
  ): Promise<TopPerformersStats> {
    try {
      this.logger.log(
        `Fetching top performers stats with query: ${JSON.stringify(query)}`,
      );

      const supabase = this.supabaseService.getClient();
      const { gradeLevel, timePeriod } = query;

      // Build base query for students with GWA
      let queryBuilder = supabase.from('students').select(`
          id,
          grade_level,
          students_gwa!inner(
            gwa,
            created_at
          )
        `);
      // Apply grade level filter
      if (gradeLevel && gradeLevel !== 'all') {
        queryBuilder = queryBuilder.eq('grade_level', parseInt(gradeLevel));
      }

      // Apply time period filter (same logic as above)
      if (timePeriod) {
        const currentDate = new Date();
        let startDate: Date;
        const endDate: Date = currentDate;

        switch (timePeriod) {
          case 'current-quarter':
            const currentMonth = currentDate.getMonth();
            if (currentMonth >= 0 && currentMonth <= 2) {
              startDate = new Date(currentDate.getFullYear(), 0, 1);
            } else if (currentMonth >= 3 && currentMonth <= 5) {
              startDate = new Date(currentDate.getFullYear(), 3, 1);
            } else if (currentMonth >= 6 && currentMonth <= 8) {
              startDate = new Date(currentDate.getFullYear(), 6, 1);
            } else {
              startDate = new Date(currentDate.getFullYear(), 9, 1);
            }
            break;
          case 'semester':
            startDate = new Date(currentDate.getFullYear(), 0, 1);
            break;
          case 'school-year':
            startDate = new Date(currentDate.getFullYear() - 1, 5, 1);
            break;
          case 'all-time':
          default:
            startDate = new Date(2020, 0, 1);
            break;
        }

        queryBuilder = queryBuilder
          .gte('students_gwa.created_at', startDate.toISOString())
          .lte('students_gwa.created_at', endDate.toISOString());
      }

      const { data: students, error } = await queryBuilder;

      if (error) {
        this.logger.error('Error fetching stats:', error);
        throw new BadRequestException(
          `Failed to fetch stats: ${error.message}`,
        );
      }

      const studentData = students || [];
      const totalHonorStudents = studentData.length;
      const honorRollStudents = studentData.filter(
        (s) => s.students_gwa?.[0]?.gwa <= 1.5,
      ).length;
      const perfectGwaStudents = studentData.filter(
        (s) => s.students_gwa?.[0]?.gwa === 1.0,
      ).length;

      // Calculate grade distribution
      const gradeDistribution = {
        grade7: studentData.filter((s) => s.grade_level === 7).length,
        grade8: studentData.filter((s) => s.grade_level === 8).length,
        grade9: studentData.filter((s) => s.grade_level === 9).length,
        grade10: studentData.filter((s) => s.grade_level === 10).length,
      };

      // Calculate average GWA
      const gwaValues = studentData
        .map((s) => s.students_gwa?.[0]?.gwa)
        .filter((gwa) => gwa !== undefined);
      const averageGwa =
        gwaValues.length > 0
          ? gwaValues.reduce((sum, gwa) => sum + gwa, 0) / gwaValues.length
          : 0;

      // Find top student
      const topStudent =
        studentData.length > 0
          ? studentData.reduce((top, current) => {
              const currentGwa = current.students_gwa?.[0]?.gwa || 0;
              const topGwa = top.students_gwa?.[0]?.gwa || 0;
              return currentGwa < topGwa ? current : top;
            })
          : null;

      return {
        totalHonorStudents,
        honorRollStudents,
        perfectGwaStudents,
        gradeDistribution,
        averageGwa: Math.round(averageGwa * 100) / 100,
        topStudent: topStudent
          ? {
              name: `${(topStudent as any).first_name || ''} ${(topStudent as any).last_name || ''}`.trim(),
              gwa: topStudent.students_gwa?.[0]?.gwa || 0,
              gradeLevel: topStudent.grade_level,
            }
          : undefined,
      };
    } catch (error) {
      this.logger.error('Unexpected error fetching stats:', error);
      throw new BadRequestException(
        'Failed to fetch top performers statistics',
      );
    }
  }

  /**
   * Get detailed student performance information
   */
  async getStudentPerformanceDetails(
    studentId: string,
  ): Promise<StudentPerformanceDetails> {
    try {
      this.logger.log(`Fetching performance details for student: ${studentId}`);

      const supabase = this.supabaseService.getClient();

      // Get student basic info
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select(
          `
          id,
          first_name,
          last_name,
          student_id,
          grade_level,
          section_id,
          sections!inner(
            name
          )
        `,
        )
        .eq('id', studentId)
        .single();

      if (studentError || !student) {
        throw new NotFoundException(`Student with ID ${studentId} not found`);
      }

      // Get GWA history
      const { data: gwaHistory, error: gwaError } = await supabase
        .from('students_gwa')
        .select('grading_period, gwa, school_year, created_at')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (gwaError) {
        this.logger.error('Error fetching GWA history:', gwaError);
      }

      // Get current rank (simplified - would need more complex query in real implementation)
      const { data: allStudents, error: rankError } = await supabase.from(
        'students',
      ).select(`
          id,
          students_gwa!inner(gwa)
        `);
      let rank = 1;
      if (!rankError && allStudents) {
        const currentStudentGwa = gwaHistory?.[0]?.gwa || 0;
        // Sort students by GWA and find rank
        const sortedStudents = allStudents
          .map((s) => ({ id: s.id, gwa: s.students_gwa?.[0]?.gwa || 0 }))
          .sort((a, b) => a.gwa - b.gwa);
        rank = sortedStudents.findIndex((s) => s.id === studentId) + 1;
      }

      return {
        studentId: student.id,
        name: `${student.first_name} ${student.last_name}`,
        gradeLevel: student.grade_level,
        section: (student.sections as any)?.name || 'Unknown',
        gwa: gwaHistory?.[0]?.gwa || 0,
        rank,
        gwaHistory: (gwaHistory || []).map((gwa) => ({
          gradingPeriod: gwa.grading_period,
          gwa: gwa.gwa,
          academicYear: gwa.school_year,
        })),
        achievements: [], // Would need achievements table
        subjects: [], // Would need subjects/grades table
      };
    } catch (error) {
      this.logger.error('Unexpected error fetching student details:', error);
      throw new BadRequestException(
        'Failed to fetch student performance details',
      );
    }
  }
}
