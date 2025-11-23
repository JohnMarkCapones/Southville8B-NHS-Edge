import { Controller, Get, Post, Body, Query, Req, UseGuards, Logger } from '@nestjs/common';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles, UserRole } from '../../auth/decorators/roles.decorator';
import { SupabaseService } from '../../supabase/supabase.service';
import { PointsService } from '../services/points.service';
import { BadgeService } from '../services/badge.service';
import { LevelService } from '../services/level.service';
import { LeaderboardService } from '../services/leaderboard.service';
import { StreakService } from '../services/streak.service';
import { AwardPointsDto } from '../dto/award-points.dto';
import { LeaderboardQueryDto } from '../dto/leaderboard-query.dto';
import { PointHistoryQueryDto } from '../dto/point-history.dto';
import { ShowcaseBadgeDto } from '../dto/badge.dto';

@Controller('gamification')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class GamificationController {
  private readonly logger = new Logger(GamificationController.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly pointsService: PointsService,
    private readonly badgeService: BadgeService,
    private readonly levelService: LevelService,
    private readonly leaderboardService: LeaderboardService,
    private readonly streakService: StreakService,
  ) {}

  /**
   * Get current user's gamification profile
   * GET /gamification/my-profile
   */
  @Get('my-profile')
  @Roles(UserRole.STUDENT)
  async getMyProfile(@Req() req: any) {
    const userId = req.user.id;

    try {
      // Get student ID from user ID
      const client = this.supabaseService.getClient();
      const { data: student, error: studentError } = await client
        .from('students')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (studentError || !student) {
        throw new Error('Student not found');
      }

      // Get gamification data
      const { data: gamification, error: gamError } = await client
        .from('student_gamification')
        .select('*')
        .eq('student_id', student.id)
        .single();

      if (gamError || !gamification) {
        throw new Error('Gamification profile not found');
      }

      // Calculate level details
      const levelData = this.levelService.calculateLevel(gamification.total_points);

      // Get recent badges (last 5)
      const { data: recentBadges } = await client
        .from('student_badges')
        .select(
          `
          *,
          badge:badges (*)
        `,
        )
        .eq('student_id', student.id)
        .order('earned_at', { ascending: false })
        .limit(5);

      return {
        student_id: student.id,
        points: {
          total: gamification.total_points,
          quiz: gamification.quiz_points,
          activity: gamification.activity_points,
          streak: gamification.streak_points,
          bonus: gamification.bonus_points,
        },
        level: {
          current: levelData.level,
          title: levelData.title,
          progress: levelData.progress,
          currentXP: levelData.currentLevelXP,
          nextLevelXP: levelData.nextLevelXP,
        },
        streak: {
          current: gamification.current_streak,
          longest: gamification.longest_streak,
          lastActivity: gamification.last_activity_date,
        },
        badges: {
          total: gamification.total_badges,
          recent: recentBadges || [],
        },
        ranks: {
          global: gamification.global_rank,
          grade: gamification.grade_rank,
          section: gamification.section_rank,
        },
      };
    } catch (error) {
      this.logger.error('Error fetching profile:', error);
      throw error;
    }
  }

  /**
   * Get my badges (earned and unearned)
   * GET /gamification/my-badges
   */
  @Get('my-badges')
  @Roles(UserRole.STUDENT)
  async getMyBadges(@Req() req: any, @Query('filter') filter?: 'earned' | 'unearned' | 'all') {
    const userId = req.user.id;

    // Get student ID
    const client = this.supabaseService.getClient();
    const { data: student } = await client.from('students').select('id').eq('user_id', userId).single();

    if (!student) {
      throw new Error('Student not found');
    }

    const badges = await this.badgeService.getStudentBadges(student.id, filter);

    // Group by category
    const categories = {
      academic: 0,
      participation: 0,
      streak: 0,
      social: 0,
      special: 0,
    };

    badges.earned.forEach((badge) => {
      if (categories[badge.category] !== undefined) {
        categories[badge.category]++;
      }
    });

    return {
      earned: badges.earned,
      unearned: badges.unearned,
      categories,
    };
  }

  /**
   * Get leaderboard
   * GET /gamification/leaderboard
   */
  @Get('leaderboard')
  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN)
  async getLeaderboard(@Query() query: LeaderboardQueryDto, @Req() req: any) {
    return this.leaderboardService.getLeaderboard(query, req.user.id);
  }

  /**
   * Get point transaction history
   * GET /gamification/point-history
   */
  @Get('point-history')
  @Roles(UserRole.STUDENT)
  async getPointHistory(@Query() query: PointHistoryQueryDto, @Req() req: any) {
    const userId = req.user.id;

    // Get student ID
    const client = this.supabaseService.getClient();
    const { data: student } = await client.from('students').select('id').eq('user_id', userId).single();

    if (!student) {
      throw new Error('Student not found');
    }

    const { page = 1, limit = 50, category, startDate, endDate } = query;
    const offset = (page - 1) * limit;

    // Build query
    let transactionQuery = client
      .from('point_transactions')
      .select('*', { count: 'exact' })
      .eq('student_id', student.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      transactionQuery = transactionQuery.eq('category', category);
    }

    if (startDate) {
      transactionQuery = transactionQuery.gte('created_at', startDate);
    }

    if (endDate) {
      transactionQuery = transactionQuery.lte('created_at', endDate);
    }

    const { data: transactions, error, count } = await transactionQuery;

    if (error) {
      throw new Error('Failed to fetch transactions');
    }

    // Get summary
    const summary = await this.pointsService.getPointSummary(student.id);

    return {
      transactions: (transactions || []).map((t) => ({
        id: t.id,
        points: t.points,
        type: t.transaction_type,
        category: t.category,
        reason: t.reason,
        metadata: t.metadata,
        createdAt: t.created_at,
        balanceAfter: t.balance_after,
      })),
      summary,
      pagination: {
        page,
        limit,
        total: count || 0,
      },
    };
  }

  /**
   * Toggle badge showcase
   * POST /gamification/showcase-badge
   */
  @Post('showcase-badge')
  @Roles(UserRole.STUDENT)
  async showcaseBadge(@Body() dto: ShowcaseBadgeDto, @Req() req: any) {
    const userId = req.user.id;

    // Get student ID
    const client = this.supabaseService.getClient();
    const { data: student } = await client.from('students').select('id').eq('user_id', userId).single();

    if (!student) {
      throw new Error('Student not found');
    }

    // Verify badge belongs to student
    const { data: studentBadge } = await client
      .from('student_badges')
      .select('badge_id')
      .eq('id', dto.studentBadgeId)
      .eq('student_id', student.id)
      .single();

    if (!studentBadge) {
      throw new Error('Badge not found or does not belong to student');
    }

    await this.badgeService.toggleShowcase(student.id, studentBadge.badge_id, dto.isShowcased);

    return { success: true };
  }

  /**
   * Award points manually (Teacher/Admin only)
   * POST /gamification/award-points
   */
  @Post('award-points')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async awardPoints(@Body() dto: AwardPointsDto, @Req() req: any) {
    const createdBy = req.user.id;
    return this.pointsService.awardPointsFromDto(dto, createdBy);
  }

  /**
   * Get gamification analytics (Admin only)
   * GET /gamification/analytics
   */
  @Get('analytics')
  @Roles(UserRole.ADMIN)
  async getAnalytics() {
    const serviceClient = this.supabaseService.getServiceClient();

    try {
      // Get overview stats
      const { count: totalStudents } = await serviceClient
        .from('student_gamification')
        .select('*', { count: 'exact', head: true });

      const { data: stats } = await serviceClient
        .from('student_gamification')
        .select('total_points, level, total_badges');

      const totalPoints = stats?.reduce((sum, s) => sum + s.total_points, 0) || 0;
      const avgPoints = totalStudents ? totalPoints / totalStudents : 0;
      const avgLevel = stats?.reduce((sum, s) => sum + s.level, 0) / (totalStudents || 1) || 0;
      const totalBadgesEarned = stats?.reduce((sum, s) => sum + s.total_badges, 0) || 0;

      // Get top performers
      const topPerformers = await this.leaderboardService.getTopStudents(10);

      return {
        overview: {
          totalStudents: totalStudents || 0,
          activeStudents: totalStudents || 0, // TODO: Define "active"
          totalPointsAwarded: totalPoints,
          averagePointsPerStudent: Math.round(avgPoints),
          averageLevel: avgLevel.toFixed(1),
          totalBadgesEarned,
        },
        topPerformers,
      };
    } catch (error) {
      this.logger.error('Error fetching analytics:', error);
      throw error;
    }
  }
}
