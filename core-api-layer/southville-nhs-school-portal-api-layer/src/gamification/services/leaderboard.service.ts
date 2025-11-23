import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { LeaderboardQueryDto, LeaderboardResponse, LeaderboardEntry } from '../dto/leaderboard-query.dto';

@Injectable()
export class LeaderboardService {
  private readonly logger = new Logger(LeaderboardService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Get leaderboard based on query parameters
   */
  async getLeaderboard(query: LeaderboardQueryDto, currentUserId?: string): Promise<LeaderboardResponse> {
    const serviceClient = this.supabaseService.getServiceClient();

    try {
      const { scope = 'global', scopeValue, page = 1, limit = 50 } = query;
      const offset = (page - 1) * limit;

      // Build base query
      let leaderboardQuery = serviceClient
        .from('student_gamification')
        .select(
          `
          *,
          student:students!student_id (
            id,
            first_name,
            last_name,
            grade_level,
            section_id,
            sections (name)
          )
        `,
          { count: 'exact' },
        )
        .order('total_points', { ascending: false })
        .order('level', { ascending: false })
        .order('current_streak', { ascending: false });

      // Apply scope filters
      if (scope === 'grade' && scopeValue) {
        leaderboardQuery = leaderboardQuery.eq('student.grade_level', parseInt(scopeValue));
      } else if (scope === 'section' && scopeValue) {
        leaderboardQuery = leaderboardQuery.eq('student.section_id', scopeValue);
      }

      // Apply pagination
      leaderboardQuery = leaderboardQuery.range(offset, offset + limit - 1);

      const { data: students, error, count } = await leaderboardQuery;

      if (error) {
        this.logger.error('Error fetching leaderboard:', error);
        throw new Error('Failed to fetch leaderboard');
      }

      // Transform data to leaderboard entries
      const entries: LeaderboardEntry[] = (students || []).map((student, index) => {
        const studentData = Array.isArray(student.student) ? student.student[0] : student.student;
        const sectionData = studentData?.sections ? (Array.isArray(studentData.sections) ? studentData.sections[0] : studentData.sections) : null;

        return {
          rank: offset + index + 1,
          student: {
            id: student.student_id,
            name: `${studentData?.first_name || 'Unknown'} ${studentData?.last_name?.charAt(0) || ''}.`,
            gradeLevel: studentData?.grade_level,
            section: sectionData?.name,
          },
          stats: {
            totalPoints: student.total_points,
            level: student.level,
            currentStreak: student.current_streak,
            totalBadges: student.total_badges,
          },
          trend: 'same', // TODO: Implement trend tracking
          isCurrentUser: false, // Will be set below
        };
      });

      // Find current user's position
      let currentUser: LeaderboardEntry | null = null;
      if (currentUserId) {
        const { data: userStudent } = await serviceClient
          .from('students')
          .select('id')
          .eq('user_id', currentUserId)
          .single();

        if (userStudent) {
          const currentUserIndex = entries.findIndex((e) => e.student.id === userStudent.id);
          if (currentUserIndex >= 0) {
            entries[currentUserIndex].isCurrentUser = true;
            currentUser = entries[currentUserIndex];
          } else {
            // User not in current page, fetch their data
            currentUser = await this.getCurrentUserRank(userStudent.id, scope, scopeValue);
            if (currentUser) {
              currentUser.isCurrentUser = true;
            }
          }
        }
      }

      return {
        entries,
        pagination: {
          page,
          limit,
          total: count || 0,
        },
        currentUser,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error in getLeaderboard:', error);
      throw error;
    }
  }

  /**
   * Get current user's rank in leaderboard
   */
  private async getCurrentUserRank(
    studentId: string,
    scope: string,
    scopeValue?: string,
  ): Promise<LeaderboardEntry | null> {
    const serviceClient = this.supabaseService.getServiceClient();

    try {
      // Get user's gamification data
      const { data: gamification } = await serviceClient
        .from('student_gamification')
        .select(
          `
          *,
          student:students!student_id (
            id,
            first_name,
            last_name,
            grade_level,
            section_id,
            sections (name)
          )
        `,
        )
        .eq('student_id', studentId)
        .single();

      if (!gamification) return null;

      // Calculate rank based on scope
      let rankQuery = serviceClient
        .from('student_gamification')
        .select('total_points', { count: 'exact', head: true })
        .gt('total_points', gamification.total_points);

      if (scope === 'grade') {
        rankQuery = rankQuery.eq('student.grade_level', scopeValue);
      } else if (scope === 'section') {
        rankQuery = rankQuery.eq('student.section_id', scopeValue);
      }

      const { count } = await rankQuery;
      const rank = (count || 0) + 1;

      const studentData = Array.isArray(gamification.student) ? gamification.student[0] : gamification.student;
      const sectionData = studentData?.sections ? (Array.isArray(studentData.sections) ? studentData.sections[0] : studentData.sections) : null;

      return {
        rank,
        student: {
          id: studentId,
          name: `${studentData?.first_name || 'Unknown'} ${studentData?.last_name?.charAt(0) || ''}.`,
          gradeLevel: studentData?.grade_level,
          section: sectionData?.name,
        },
        stats: {
          totalPoints: gamification.total_points,
          level: gamification.level,
          currentStreak: gamification.current_streak,
          totalBadges: gamification.total_badges,
        },
        trend: 'same',
        isCurrentUser: true,
      };
    } catch (error) {
      this.logger.error('Error getting current user rank:', error);
      return null;
    }
  }

  /**
   * Refresh leaderboard cache (called by cron job)
   */
  async refreshLeaderboardCache(): Promise<void> {
    const serviceClient = this.supabaseService.getServiceClient();

    try {
      // Refresh global leaderboard
      await serviceClient.rpc('refresh_leaderboard_cache', {
        p_scope: 'global',
        p_scope_value: null,
      });

      // Refresh grade-level leaderboards
      for (const grade of [7, 8, 9, 10]) {
        await serviceClient.rpc('refresh_leaderboard_cache', {
          p_scope: 'grade',
          p_scope_value: grade.toString(),
        });
      }

      this.logger.log('Leaderboard cache refreshed successfully');
    } catch (error) {
      this.logger.error('Error refreshing leaderboard cache:', error);
    }
  }

  /**
   * Update student ranks (called after points are awarded)
   */
  async updateStudentRanks(studentId: string): Promise<void> {
    const serviceClient = this.supabaseService.getServiceClient();

    try {
      // Get student data
      const { data: student } = await serviceClient
        .from('students')
        .select('grade_level, section_id')
        .eq('id', studentId)
        .single();

      if (!student) return;

      // Calculate global rank
      const { count: globalCount } = await serviceClient
        .from('student_gamification')
        .select('*', { count: 'exact', head: true })
        .gt('total_points', 0); // Placeholder - should compare with student's points

      const globalRank = (globalCount || 0) + 1;

      // Calculate grade rank
      const { count: gradeCount } = await serviceClient
        .from('student_gamification')
        .select('*, student:students!student_id(grade_level)', { count: 'exact', head: true })
        .eq('student.grade_level', student.grade_level)
        .gt('total_points', 0); // Placeholder

      const gradeRank = (gradeCount || 0) + 1;

      // Calculate section rank
      const { count: sectionCount } = await serviceClient
        .from('student_gamification')
        .select('*, student:students!student_id(section_id)', { count: 'exact', head: true })
        .eq('student.section_id', student.section_id)
        .gt('total_points', 0); // Placeholder

      const sectionRank = (sectionCount || 0) + 1;

      // Update ranks
      await serviceClient
        .from('student_gamification')
        .update({
          global_rank: globalRank,
          grade_rank: gradeRank,
          section_rank: sectionRank,
        })
        .eq('student_id', studentId);
    } catch (error) {
      this.logger.error('Error updating student ranks:', error);
    }
  }

  /**
   * Get top N students from leaderboard
   */
  async getTopStudents(limit: number = 10, scope: string = 'global', scopeValue?: string): Promise<LeaderboardEntry[]> {
    const query: LeaderboardQueryDto = {
      scope: scope as any,
      scopeValue,
      page: 1,
      limit: Math.min(limit, 100),
    };

    const result = await this.getLeaderboard(query);
    return result.entries;
  }
}
