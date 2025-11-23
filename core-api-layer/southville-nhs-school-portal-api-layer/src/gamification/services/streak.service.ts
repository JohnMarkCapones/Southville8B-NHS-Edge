import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { PointsService } from './points.service';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
}

@Injectable()
export class StreakService {
  private readonly logger = new Logger(StreakService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    // Note: PointsService will be injected later to avoid circular dependency
  ) {}

  /**
   * Update student streak (call this on daily login/activity)
   */
  async updateStreak(studentId: string): Promise<StreakData> {
    const serviceClient = this.supabaseService.getServiceClient();

    try {
      // Get current gamification data
      const { data: gamification, error: fetchError } = await serviceClient
        .from('student_gamification')
        .select('current_streak, longest_streak, last_activity_date')
        .eq('student_id', studentId)
        .single();

      if (fetchError || !gamification) {
        this.logger.error('Failed to fetch gamification data:', fetchError);
        throw new Error('Student gamification profile not found');
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize to start of day

      const lastActivity = gamification.last_activity_date
        ? new Date(gamification.last_activity_date)
        : null;

      if (lastActivity) {
        lastActivity.setHours(0, 0, 0, 0);
      }

      // Calculate days difference
      const daysDiff = lastActivity
        ? Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
        : -1;

      let newStreak = gamification.current_streak;
      let streakBroken = false;

      if (daysDiff === 0) {
        // Same day - no change
        return {
          currentStreak: newStreak,
          longestStreak: gamification.longest_streak,
          lastActivityDate: gamification.last_activity_date,
        };
      } else if (daysDiff === 1 || daysDiff === -1) {
        // Consecutive day - increment
        newStreak++;
      } else {
        // Streak broken - reset
        streakBroken = true;
        newStreak = 1;
      }

      // Update longest streak if needed
      const longestStreak = Math.max(gamification.longest_streak, newStreak);

      // Update database
      const { error: updateError } = await serviceClient
        .from('student_gamification')
        .update({
          current_streak: newStreak,
          longest_streak: longestStreak,
          last_activity_date: today.toISOString().split('T')[0],
        })
        .eq('student_id', studentId);

      if (updateError) {
        this.logger.error('Failed to update streak:', updateError);
        throw new Error('Failed to update streak');
      }

      // Check for streak milestones and award points
      if (!streakBroken) {
        await this.checkStreakMilestones(studentId, newStreak);
      }

      return {
        currentStreak: newStreak,
        longestStreak,
        lastActivityDate: today.toISOString().split('T')[0],
      };
    } catch (error) {
      this.logger.error('Error updating streak:', error);
      throw error;
    }
  }

  /**
   * Check and award points for streak milestones
   */
  private async checkStreakMilestones(studentId: string, streak: number): Promise<void> {
    const MILESTONES: Record<number, number> = {
      3: 20,
      7: 50,
      14: 100,
      21: 150,
      30: 250,
      60: 500,
      90: 750,
      180: 1500,
      365: 5000,
    };

    const points = MILESTONES[streak];
    if (!points) return;

    try {
      // Use PointsService to award points (imported via forwardRef to avoid circular dependency)
      const pointsService = this.getPointsService();
      if (pointsService) {
        await pointsService.awardPoints({
          studentId,
          points,
          reason: `${streak}-day streak milestone reached!`,
          type: 'streak_milestone',
          category: 'streak',
          metadata: {
            streak_days: streak,
            milestone: true,
          },
        });

        this.logger.log(`Awarded ${points} points for ${streak}-day streak to student ${studentId}`);
      }
    } catch (error) {
      this.logger.error('Error awarding streak milestone points:', error);
    }
  }

  /**
   * Get points service (lazy load to avoid circular dependency)
   */
  private getPointsService(): PointsService | null {
    try {
      // This will be injected properly via the module
      return null; // Placeholder - will be handled in the actual implementation
    } catch {
      return null;
    }
  }

  /**
   * Get student streak data
   */
  async getStreakData(studentId: string): Promise<StreakData> {
    const serviceClient = this.supabaseService.getServiceClient();

    const { data, error } = await serviceClient
      .from('student_gamification')
      .select('current_streak, longest_streak, last_activity_date')
      .eq('student_id', studentId)
      .single();

    if (error || !data) {
      throw new Error('Failed to fetch streak data');
    }

    return {
      currentStreak: data.current_streak,
      longestStreak: data.longest_streak,
      lastActivityDate: data.last_activity_date,
    };
  }

  /**
   * Calculate streak calendar data (for frontend visualization)
   */
  async getStreakCalendar(studentId: string, months: number = 6): Promise<Array<{ date: string; hasActivity: boolean }>> {
    // This would query activity logs or daily login records
    // For now, return a simplified version based on current streak
    const streakData = await this.getStreakData(studentId);
    const calendar: Array<{ date: string; hasActivity: boolean }> = [];

    const today = new Date();
    const startDate = new Date();
    startDate.setMonth(today.getMonth() - months);

    // Generate calendar data (simplified - in real implementation, query actual activity logs)
    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      const daysAgo = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      const hasActivity = daysAgo < streakData.currentStreak;

      calendar.push({
        date: d.toISOString().split('T')[0],
        hasActivity,
      });
    }

    return calendar;
  }
}
