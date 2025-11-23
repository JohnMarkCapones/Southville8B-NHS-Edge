import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { LevelService } from './level.service';
import { BadgeService } from './badge.service';
import { AwardPointsDto, AwardPointsResponse } from '../dto/award-points.dto';
import { StudentActivitiesService } from '../../student-activities/student-activities.service';
import { ActivityType } from '../../student-activities/entities/student-activity.entity';

export interface AwardPointsParams {
  studentId: string;
  points: number;
  reason: string;
  type: string;
  category: 'quiz' | 'activity' | 'streak' | 'bonus' | 'penalty';
  metadata?: Record<string, any>;
  relatedEntityId?: string;
  relatedEntityType?: string;
  createdBy?: string;
  isManual?: boolean;
}

@Injectable()
export class PointsService {
  private readonly logger = new Logger(PointsService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly levelService: LevelService,
    private readonly badgeService: BadgeService,
    @Inject(forwardRef(() => StudentActivitiesService))
    private readonly studentActivitiesService: StudentActivitiesService,
  ) {}

  /**
   * Award points to a student (atomic transaction)
   */
  async awardPoints(params: AwardPointsParams): Promise<AwardPointsResponse> {
    const serviceClient = this.supabaseService.getServiceClient();

    try {
      // Call database function for atomic transaction
      const { data, error } = await serviceClient.rpc('award_points_transaction', {
        p_student_id: params.studentId,
        p_points: params.points,
        p_transaction_type: params.type,
        p_category: params.category,
        p_reason: params.reason,
        p_metadata: params.metadata || null,
        p_related_entity_id: params.relatedEntityId || null,
        p_related_entity_type: params.relatedEntityType || null,
        p_created_by: params.createdBy || null,
        p_is_manual: params.isManual || false,
      });

      if (error) {
        this.logger.error('Error awarding points:', error);
        throw new Error(`Failed to award points: ${error.message}`);
      }

      const result = data as { success: boolean; old_total: number; new_total: number; points_awarded: number };

      // Check for level up
      const levelUpData = this.levelService.checkLevelUp(result.old_total, result.new_total);

      // Award level up bonus if applicable
      if (levelUpData.leveledUp && levelUpData.bonus > 0) {
        await this.awardPoints({
          studentId: params.studentId,
          points: levelUpData.bonus,
          reason: `Level ${levelUpData.newLevel} reached!`,
          type: 'level_up_bonus',
          category: 'bonus',
          metadata: {
            old_level: levelUpData.oldLevel,
            new_level: levelUpData.newLevel,
          },
        });
      }

      // Update student level
      await this.updateStudentLevel(params.studentId);

      // Create activity log (async, don't block)
      this.createActivityLog(params, result.new_total, levelUpData).catch((err) => {
        this.logger.error('Error creating activity log:', err);
      });

      // Check for badge eligibility (async, don't wait)
      this.checkAllBadgeEligibility(params.studentId, params.category, params.metadata).catch((err) => {
        this.logger.error('Error checking badge eligibility:', err);
      });

      return {
        success: result.success,
        old_total: result.old_total,
        new_total: result.new_total,
        points_awarded: result.points_awarded,
        level_up: levelUpData.leveledUp,
        new_level: levelUpData.leveledUp ? levelUpData.newLevel : undefined,
      };
    } catch (error) {
      this.logger.error('Error in awardPoints:', error);
      throw error;
    }
  }

  /**
   * Award points from DTO (used by controllers)
   */
  async awardPointsFromDto(dto: AwardPointsDto, createdBy?: string): Promise<AwardPointsResponse> {
    return this.awardPoints({
      studentId: dto.studentId,
      points: dto.points,
      reason: dto.reason,
      type: dto.transactionType,
      category: dto.category,
      metadata: dto.metadata,
      relatedEntityId: dto.relatedEntityId,
      relatedEntityType: dto.relatedEntityType,
      createdBy,
      isManual: dto.isManual,
    });
  }

  /**
   * Award points for quiz completion
   */
  async awardQuizPoints(attempt: any): Promise<AwardPointsResponse> {
    const quiz = attempt.quiz || {};
    const score = attempt.score || 0;
    const maxScore = attempt.max_possible_score || 100;

    // Calculate base points
    let totalPoints = (score / maxScore) * 100;

    // Perfect score bonus (50% bonus)
    const isPerfect = score === maxScore;
    if (isPerfect) {
      totalPoints *= 1.5;
    }

    // Speed bonus (20% bonus if completed in less than 50% of time)
    const timeLimit = quiz.time_limit;
    const timeTaken = attempt.time_taken_seconds;
    const isSpeedBonus = timeLimit && timeTaken && timeTaken < timeLimit * 0.5;
    if (isSpeedBonus) {
      totalPoints *= 1.2;
    }

    // First attempt bonus (10% bonus)
    const isFirstAttempt = attempt.attempt_number === 1;
    if (isFirstAttempt) {
      totalPoints *= 1.1;
    }

    // Round to nearest integer
    totalPoints = Math.round(totalPoints);

    // Award points
    return this.awardPoints({
      studentId: attempt.student_id,
      points: totalPoints,
      reason: `Completed ${quiz.title || 'Quiz'} (${score}/${maxScore})`,
      type: 'quiz_completed',
      category: 'quiz',
      metadata: {
        quiz_id: attempt.quiz_id,
        attempt_id: attempt.attempt_id,
        score,
        max_score: maxScore,
        time_taken: timeTaken,
        is_perfect: isPerfect,
        is_speed_bonus: isSpeedBonus,
        is_first_attempt: isFirstAttempt,
      },
      relatedEntityId: attempt.attempt_id,
      relatedEntityType: 'quiz_attempt',
    });
  }

  /**
   * Update student level based on total points
   */
  async updateStudentLevel(studentId: string): Promise<void> {
    const serviceClient = this.supabaseService.getServiceClient();

    try {
      const { error } = await serviceClient.rpc('update_student_level', {
        p_student_id: studentId,
      });

      if (error) {
        this.logger.error('Error updating student level:', error);
      }
    } catch (error) {
      this.logger.error('Error in updateStudentLevel:', error);
    }
  }

  /**
   * Check all badge eligibility after points are awarded
   */
  private async checkAllBadgeEligibility(
    studentId: string,
    category: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      // Check for quiz-related badges
      if (category === 'quiz') {
        if (metadata?.is_perfect) {
          await this.badgeService.checkAndAwardBadge(studentId, 'quiz_perfect_score');
        }
        if (metadata?.is_speed_bonus) {
          await this.badgeService.checkAndAwardBadge(studentId, 'quiz_speed');
        }
        await this.badgeService.checkAndAwardBadge(studentId, 'quiz_completion');
      }

      // Check for points milestone badges
      await this.badgeService.checkAndAwardBadge(studentId, 'points_milestone');

      // Check for level milestone badges
      await this.badgeService.checkAndAwardBadge(studentId, 'level_reached');
    } catch (error) {
      this.logger.error('Error checking badge eligibility:', error);
    }
  }

  /**
   * Get point summary for a student
   */
  async getPointSummary(studentId: string) {
    const serviceClient = this.supabaseService.getServiceClient();

    const { data: gamification, error: gamError } = await serviceClient
      .from('student_gamification')
      .select('*')
      .eq('student_id', studentId)
      .single();

    if (gamError || !gamification) {
      throw new Error('Student gamification profile not found');
    }

    const { data: transactions, error: transError } = await serviceClient
      .from('point_transactions')
      .select('points, category')
      .eq('student_id', studentId);

    if (transError) {
      throw new Error('Failed to fetch transactions');
    }

    const totalEarned = transactions
      .filter((t) => t.points > 0)
      .reduce((sum, t) => sum + t.points, 0);

    const totalSpent = Math.abs(
      transactions
        .filter((t) => t.points < 0)
        .reduce((sum, t) => sum + t.points, 0),
    );

    return {
      total_earned: totalEarned,
      total_spent: totalSpent,
      current_balance: gamification.total_points,
      by_category: {
        quiz: gamification.quiz_points,
        activity: gamification.activity_points,
        streak: gamification.streak_points,
        bonus: gamification.bonus_points,
        penalty: 0, // Calculate if needed
      },
    };
  }

  /**
   * Create activity log for points awarded
   */
  private async createActivityLog(
    params: AwardPointsParams,
    newTotal: number,
    levelUpData: { leveledUp: boolean; oldLevel: number; newLevel: number; bonus: number },
  ): Promise<void> {
    try {
      // Get student user_id from student_id
      const client = this.supabaseService.getClient();
      const { data: student, error: studentError } = await client
        .from('students')
        .select('user_id')
        .eq('id', params.studentId)
        .single();

      if (studentError || !student) {
        this.logger.warn(`Could not find student user_id for student ${params.studentId}`);
        return;
      }

      // Create points awarded activity
      await this.studentActivitiesService.create({
        studentUserId: student.user_id,
        activityType: ActivityType.POINTS_AWARDED,
        title: `+${params.points} Points`,
        description: params.reason,
        metadata: {
          points: params.points,
          category: params.category,
          type: params.type,
          new_total: newTotal,
          ...params.metadata,
        },
        relatedEntityId: params.relatedEntityId,
        relatedEntityType: params.relatedEntityType,
        icon: 'Zap',
        color: 'text-yellow-500',
        isHighlighted: params.points >= 100, // Highlight large point awards
        isVisible: true,
      });

      // Create level up activity if applicable
      if (levelUpData.leveledUp) {
        const levelTitle = this.levelService.getLevelTitle(levelUpData.newLevel);
        await this.studentActivitiesService.create({
          studentUserId: student.user_id,
          activityType: ActivityType.LEVEL_UP,
          title: `Level Up! Now ${levelTitle} (Level ${levelUpData.newLevel})`,
          description: `You've reached level ${levelUpData.newLevel}! ${levelUpData.bonus > 0 ? `Bonus: +${levelUpData.bonus} points` : ''}`,
          metadata: {
            old_level: levelUpData.oldLevel,
            new_level: levelUpData.newLevel,
            level_title: levelTitle,
            bonus_points: levelUpData.bonus,
          },
          icon: 'TrendingUp',
          color: 'text-purple-500',
          isHighlighted: true,
          isVisible: true,
        });
      }
    } catch (error) {
      this.logger.error('Error creating activity log:', error);
      // Don't throw - activity logging is non-critical
    }
  }
}
