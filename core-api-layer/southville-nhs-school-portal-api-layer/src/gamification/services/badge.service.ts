import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { Badge, BadgeCriteria, BadgeWithProgress } from '../entities/badge.entity';
import { StudentBadge } from '../entities/student-badge.entity';
import { StudentActivitiesService } from '../../student-activities/student-activities.service';
import { ActivityType } from '../../student-activities/entities/student-activity.entity';

export interface BadgeEligibility {
  eligible: boolean;
  progress: number; // 0-100
  progressCount?: number;
  progressTarget?: number;
}

@Injectable()
export class BadgeService {
  private readonly logger = new Logger(BadgeService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    @Inject(forwardRef(() => StudentActivitiesService))
    private readonly studentActivitiesService: StudentActivitiesService,
  ) {}

  /**
   * Check if student is eligible for a badge and award if eligible
   */
  async checkAndAwardBadge(studentId: string, criteriaType: string): Promise<boolean> {
    const serviceClient = this.supabaseService.getServiceClient();

    try {
      // Get all active badges with this criteria type
      const { data: badges, error: badgeError } = await serviceClient
        .from('badges')
        .select('*')
        .eq('is_active', true)
        .filter('criteria->>type', 'eq', criteriaType);

      if (badgeError || !badges || badges.length === 0) {
        return false;
      }

      let awardedAny = false;

      // Check each badge
      for (const badge of badges) {
        // Check if already earned
        const { data: existing } = await serviceClient
          .from('student_badges')
          .select('id')
          .eq('student_id', studentId)
          .eq('badge_id', badge.id)
          .single();

        if (existing) continue; // Already earned

        // Check eligibility
        const eligibility = await this.checkBadgeEligibility(studentId, badge);

        if (eligibility.eligible) {
          await this.awardBadge(studentId, badge.id, {
            progress: eligibility.progress,
            progressCount: eligibility.progressCount,
          });
          awardedAny = true;
        } else if (badge.is_progressive && eligibility.progress > 0) {
          // Update progress for progressive badges
          await this.updateBadgeProgress(studentId, badge.id, eligibility);
        }
      }

      return awardedAny;
    } catch (error) {
      this.logger.error('Error in checkAndAwardBadge:', error);
      return false;
    }
  }

  /**
   * Check badge eligibility for a specific badge
   */
  async checkBadgeEligibility(studentId: string, badge: Badge): Promise<BadgeEligibility> {
    const criteria = badge.criteria as BadgeCriteria;
    if (!criteria) {
      return { eligible: false, progress: 0 };
    }

    const serviceClient = this.supabaseService.getServiceClient();

    try {
      switch (criteria.type) {
        case 'quiz_completion': {
          const { count } = await serviceClient
            .from('quiz_attempts')
            .select('*', { count: 'exact', head: true })
            .eq('student_id', studentId)
            .eq('status', 'graded');

          const progress = Math.min(100, ((count || 0) / (criteria.count || 1)) * 100);
          return {
            eligible: (count || 0) >= (criteria.count || 0),
            progress: Math.round(progress),
            progressCount: count || 0,
            progressTarget: criteria.count,
          };
        }

        case 'quiz_perfect_score': {
          const { count } = await serviceClient
            .from('quiz_attempts')
            .select('*', { count: 'exact', head: true })
            .eq('student_id', studentId)
            .eq('status', 'graded')
            .filter('score', 'eq', 'max_possible_score');

          const progress = Math.min(100, ((count || 0) / (criteria.count || 1)) * 100);
          return {
            eligible: (count || 0) >= (criteria.count || 0),
            progress: Math.round(progress),
            progressCount: count || 0,
            progressTarget: criteria.count,
          };
        }

        case 'quiz_speed': {
          // Count quizzes completed in less than specified percentage of time
          const { data: attempts } = await serviceClient
            .from('quiz_attempts')
            .select('quiz_id, time_taken_seconds')
            .eq('student_id', studentId)
            .eq('status', 'graded');

          if (!attempts) return { eligible: false, progress: 0 };

          // Get quiz time limits
          const quizIds = attempts.map((a) => a.quiz_id);
          const { data: quizzes } = await serviceClient
            .from('quizzes')
            .select('quiz_id, time_limit')
            .in('quiz_id', quizIds);

          const quizMap = new Map(quizzes?.map((q) => [q.quiz_id, q.time_limit]) || []);

          const speedCount = attempts.filter((attempt) => {
            const timeLimit = quizMap.get(attempt.quiz_id);
            if (!timeLimit || !attempt.time_taken_seconds) return false;
            const threshold = timeLimit * (criteria.time_percentage || 50) / 100;
            return attempt.time_taken_seconds < threshold;
          }).length;

          const progress = Math.min(100, (speedCount / (criteria.count || 1)) * 100);
          return {
            eligible: speedCount >= (criteria.count || 0),
            progress: Math.round(progress),
            progressCount: speedCount,
            progressTarget: criteria.count,
          };
        }

        case 'quiz_first_attempt_perfect': {
          const { data: attempts } = await serviceClient
            .from('quiz_attempts')
            .select('*')
            .eq('student_id', studentId)
            .eq('attempt_number', 1)
            .eq('status', 'graded')
            .filter('score', 'eq', 'max_possible_score');

          const count = attempts?.length || 0;
          const progress = Math.min(100, (count / (criteria.count || 1)) * 100);
          return {
            eligible: count >= (criteria.count || 0),
            progress: Math.round(progress),
            progressCount: count,
            progressTarget: criteria.count,
          };
        }

        case 'quiz_points_earned': {
          const { data: gamification } = await serviceClient
            .from('student_gamification')
            .select('quiz_points')
            .eq('student_id', studentId)
            .single();

          const points = gamification?.quiz_points || 0;
          const progress = Math.min(100, (points / (criteria.points || 1)) * 100);
          return {
            eligible: points >= (criteria.points || 0),
            progress: Math.round(progress),
            progressCount: points,
            progressTarget: criteria.points,
          };
        }

        case 'streak_milestone': {
          const { data: gamification } = await serviceClient
            .from('student_gamification')
            .select('current_streak')
            .eq('student_id', studentId)
            .single();

          const streak = gamification?.current_streak || 0;
          const progress = Math.min(100, (streak / (criteria.days || 1)) * 100);
          return {
            eligible: streak >= (criteria.days || 0),
            progress: Math.round(progress),
            progressCount: streak,
            progressTarget: criteria.days,
          };
        }

        case 'club_joined': {
          const { count } = await serviceClient
            .from('club_memberships')
            .select('*', { count: 'exact', head: true })
            .eq('student_id', studentId);

          const progress = Math.min(100, ((count || 0) / (criteria.count || 1)) * 100);
          return {
            eligible: (count || 0) >= (criteria.count || 0),
            progress: Math.round(progress),
            progressCount: count || 0,
            progressTarget: criteria.count,
          };
        }

        case 'level_reached': {
          const { data: gamification } = await serviceClient
            .from('student_gamification')
            .select('level')
            .eq('student_id', studentId)
            .single();

          const level = gamification?.level || 1;
          return {
            eligible: level >= (criteria.level || 0),
            progress: level >= (criteria.level || 0) ? 100 : 0,
            progressCount: level,
            progressTarget: criteria.level,
          };
        }

        case 'points_milestone': {
          const { data: gamification } = await serviceClient
            .from('student_gamification')
            .select('total_points')
            .eq('student_id', studentId)
            .single();

          const points = gamification?.total_points || 0;
          const progress = Math.min(100, (points / (criteria.points || 1)) * 100);
          return {
            eligible: points >= (criteria.points || 0),
            progress: Math.round(progress),
            progressCount: points,
            progressTarget: criteria.points,
          };
        }

        case 'leaderboard_rank': {
          const { data: gamification } = await serviceClient
            .from('student_gamification')
            .select('global_rank, grade_rank, section_rank')
            .eq('student_id', studentId)
            .single();

          if (!gamification) return { eligible: false, progress: 0 };

          let rank: number | null = null;
          if (criteria.scope === 'global') rank = gamification.global_rank;
          else if (criteria.scope === 'grade') rank = gamification.grade_rank;
          else if (criteria.scope === 'section') rank = gamification.section_rank;

          return {
            eligible: rank !== null && rank <= (criteria.max_rank || 0),
            progress: rank !== null && rank <= (criteria.max_rank || 0) ? 100 : 0,
            progressCount: rank || undefined,
            progressTarget: criteria.max_rank,
          };
        }

        case 'badge_count': {
          const { data: gamification } = await serviceClient
            .from('student_gamification')
            .select('total_badges')
            .eq('student_id', studentId)
            .single();

          const badges = gamification?.total_badges || 0;
          const progress = Math.min(100, (badges / (criteria.count || 1)) * 100);
          return {
            eligible: badges >= (criteria.count || 0),
            progress: Math.round(progress),
            progressCount: badges,
            progressTarget: criteria.count,
          };
        }

        default:
          return { eligible: false, progress: 0 };
      }
    } catch (error) {
      this.logger.error(`Error checking badge eligibility for ${criteria.type}:`, error);
      return { eligible: false, progress: 0 };
    }
  }

  /**
   * Award a badge to a student
   */
  async awardBadge(
    studentId: string,
    badgeId: string,
    options?: { progress?: number; progressCount?: number; metadata?: Record<string, any> },
  ): Promise<StudentBadge> {
    const serviceClient = this.supabaseService.getServiceClient();

    try {
      // Insert student badge
      const { data: studentBadge, error: insertError } = await serviceClient
        .from('student_badges')
        .insert({
          student_id: studentId,
          badge_id: badgeId,
          current_progress: options?.progress || 100,
          progress_count: options?.progressCount || 0,
          metadata: options?.metadata || null,
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(`Failed to award badge: ${insertError.message}`);
      }

      // Get badge details for points reward
      const { data: badge } = await serviceClient.from('badges').select('*').eq('id', badgeId).single();

      if (badge && badge.points_reward > 0) {
        // Award badge points (import PointsService would create circular dependency, so we'll handle this in the controller)
        this.logger.log(`Badge awarded: ${badge.name} (+${badge.points_reward} points)`);
      }

      // Create activity log for badge earned (async, don't block)
      if (badge) {
        this.createBadgeEarnedActivity(studentId, badge).catch((err) => {
          this.logger.error('Error creating badge earned activity:', err);
        });
      }

      return studentBadge;
    } catch (error) {
      this.logger.error('Error awarding badge:', error);
      throw error;
    }
  }

  /**
   * Update progress for a progressive badge
   */
  async updateBadgeProgress(studentId: string, badgeId: string, eligibility: BadgeEligibility): Promise<void> {
    const serviceClient = this.supabaseService.getServiceClient();

    try {
      await serviceClient
        .from('student_badges')
        .upsert({
          student_id: studentId,
          badge_id: badgeId,
          current_progress: eligibility.progress,
          progress_count: eligibility.progressCount || 0,
        })
        .eq('student_id', studentId)
        .eq('badge_id', badgeId);
    } catch (error) {
      this.logger.error('Error updating badge progress:', error);
    }
  }

  /**
   * Get all badges for a student (earned and unearned)
   */
  async getStudentBadges(
    studentId: string,
    filter?: 'earned' | 'unearned' | 'all',
  ): Promise<{ earned: BadgeWithProgress[]; unearned: BadgeWithProgress[] }> {
    const serviceClient = this.supabaseService.getServiceClient();

    // Get all active badges
    const { data: allBadges } = await serviceClient
      .from('badges')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    // Get student's earned badges
    const { data: studentBadges } = await serviceClient
      .from('student_badges')
      .select('*')
      .eq('student_id', studentId);

    const earnedBadgeIds = new Set(studentBadges?.map((sb) => sb.badge_id) || []);
    const studentBadgeMap = new Map(studentBadges?.map((sb) => [sb.badge_id, sb]) || []);

    const earned: BadgeWithProgress[] = [];
    const unearned: BadgeWithProgress[] = [];

    for (const badge of allBadges || []) {
      if (earnedBadgeIds.has(badge.id)) {
        const studentBadge = studentBadgeMap.get(badge.id) as any;
        earned.push({
          ...badge,
          earned: true,
          earned_at: studentBadge?.earned_at,
          progress: studentBadge?.current_progress || 100,
          progress_count: studentBadge?.progress_count,
        });
      } else {
        // Check progress for progressive badges
        let progress = 0;
        let progressCount = 0;
        if (badge.is_progressive) {
          const eligibility = await this.checkBadgeEligibility(studentId, badge);
          progress = eligibility.progress;
          progressCount = eligibility.progressCount || 0;
        }

        unearned.push({
          ...badge,
          earned: false,
          progress,
          progress_count: progressCount,
        });
      }
    }

    return { earned, unearned };
  }

  /**
   * Toggle badge showcase status
   */
  async toggleShowcase(studentId: string, badgeId: string, isShowcased: boolean): Promise<void> {
    const serviceClient = this.supabaseService.getServiceClient();

    await serviceClient
      .from('student_badges')
      .update({ is_showcased: isShowcased })
      .eq('student_id', studentId)
      .eq('badge_id', badgeId);
  }

  /**
   * Create activity log for badge earned
   */
  private async createBadgeEarnedActivity(studentId: string, badge: Badge): Promise<void> {
    try {
      // Get student user_id from student_id
      const client = this.supabaseService.getClient();
      const { data: student, error: studentError } = await client
        .from('students')
        .select('user_id')
        .eq('id', studentId)
        .single();

      if (studentError || !student) {
        this.logger.warn(`Could not find student user_id for student ${studentId}`);
        return;
      }

      // Create badge earned activity
      await this.studentActivitiesService.create({
        studentUserId: student.user_id,
        activityType: ActivityType.BADGE_EARNED,
        title: `🏆 Badge Earned: ${badge.name}`,
        description: badge.description || `You've earned the ${badge.name} badge!`,
        metadata: {
          badge_id: badge.id,
          badge_key: badge.badge_key,
          badge_name: badge.name,
          tier: badge.tier,
          rarity: badge.rarity,
          points_reward: badge.points_reward,
        },
        relatedEntityId: badge.id,
        relatedEntityType: 'badge',
        icon: badge.icon || 'Award',
        color: badge.color || 'text-yellow-500',
        isHighlighted: true,
        isVisible: true,
      });
    } catch (error) {
      this.logger.error('Error creating badge earned activity:', error);
      // Don't throw - activity logging is non-critical
    }
  }
}
