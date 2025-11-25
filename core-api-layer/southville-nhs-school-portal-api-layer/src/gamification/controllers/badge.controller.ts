import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Logger } from '@nestjs/common';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles, UserRole } from '../../auth/decorators/roles.decorator';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateBadgeDto, UpdateBadgeDto } from '../dto/badge.dto';

@Controller('badges')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class BadgeController {
  private readonly logger = new Logger(BadgeController.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Get all badges
   * GET /badges
   */
  @Get()
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  async getAllBadges(@Query('includeInactive') includeInactive?: string) {
    const client = this.supabaseService.getClient();

    let query = client.from('badges').select('*').order('display_order');

    if (includeInactive !== 'true') {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      this.logger.error('Error fetching badges:', error);
      throw new Error('Failed to fetch badges');
    }

    return data;
  }

  /**
   * Get badge by ID
   * GET /badges/:id
   */
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  async getBadgeById(@Param('id') id: string) {
    const client = this.supabaseService.getClient();

    const { data, error } = await client.from('badges').select('*').eq('id', id).single();

    if (error) {
      this.logger.error('Error fetching badge:', error);
      throw new Error('Badge not found');
    }

    return data;
  }

  /**
   * Create new badge (Admin only)
   * POST /badges
   */
  @Post()
  @Roles(UserRole.ADMIN)
  async createBadge(@Body() dto: CreateBadgeDto) {
    const serviceClient = this.supabaseService.getServiceClient();

    try {
      const { data, error } = await serviceClient
        .from('badges')
        .insert({
          badge_key: dto.badgeKey,
          name: dto.name,
          description: dto.description || null,
          icon: dto.icon || null,
          color: dto.color || null,
          image_url: dto.imageUrl || null,
          category: dto.category,
          tier: dto.tier,
          rarity: dto.rarity,
          points_reward: dto.pointsReward || 0,
          criteria: dto.criteria || null,
          is_progressive: dto.isProgressive || false,
          progress_target: dto.progressTarget || null,
          is_active: dto.isActive !== undefined ? dto.isActive : true,
          is_hidden: dto.isHidden || false,
          display_order: dto.displayOrder || 0,
        })
        .select()
        .single();

      if (error) {
        this.logger.error('Error creating badge:', error);
        throw new Error(`Failed to create badge: ${error.message}`);
      }

      return data;
    } catch (error) {
      this.logger.error('Error in createBadge:', error);
      throw error;
    }
  }

  /**
   * Update badge (Admin only)
   * PUT /badges/:id
   */
  @Put(':id')
  @Roles(UserRole.ADMIN)
  async updateBadge(@Param('id') id: string, @Body() dto: UpdateBadgeDto) {
    const serviceClient = this.supabaseService.getServiceClient();

    try {
      const updateData: any = {};

      if (dto.name !== undefined) updateData.name = dto.name;
      if (dto.description !== undefined) updateData.description = dto.description;
      if (dto.icon !== undefined) updateData.icon = dto.icon;
      if (dto.color !== undefined) updateData.color = dto.color;
      if (dto.pointsReward !== undefined) updateData.points_reward = dto.pointsReward;
      if (dto.isActive !== undefined) updateData.is_active = dto.isActive;
      if (dto.isHidden !== undefined) updateData.is_hidden = dto.isHidden;
      if (dto.displayOrder !== undefined) updateData.display_order = dto.displayOrder;
      if (dto.criteria !== undefined) updateData.criteria = dto.criteria;

      const { data, error } = await serviceClient.from('badges').update(updateData).eq('id', id).select().single();

      if (error) {
        this.logger.error('Error updating badge:', error);
        throw new Error(`Failed to update badge: ${error.message}`);
      }

      return data;
    } catch (error) {
      this.logger.error('Error in updateBadge:', error);
      throw error;
    }
  }

  /**
   * Delete badge (Admin only)
   * DELETE /badges/:id
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async deleteBadge(@Param('id') id: string) {
    const serviceClient = this.supabaseService.getServiceClient();

    try {
      // Soft delete - just deactivate
      const { error } = await serviceClient.from('badges').update({ is_active: false }).eq('id', id);

      if (error) {
        this.logger.error('Error deleting badge:', error);
        throw new Error(`Failed to delete badge: ${error.message}`);
      }

      return { success: true, message: 'Badge deactivated successfully' };
    } catch (error) {
      this.logger.error('Error in deleteBadge:', error);
      throw error;
    }
  }

  /**
   * Get badge statistics (Admin only)
   * GET /badges/:id/stats
   */
  @Get(':id/stats')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async getBadgeStats(@Param('id') id: string) {
    const client = this.supabaseService.getClient();

    try {
      // Get badge info
      const { data: badge } = await client.from('badges').select('*').eq('id', id).single();

      if (!badge) {
        throw new Error('Badge not found');
      }

      // Count students who earned this badge
      const { count: earnedCount } = await client
        .from('student_badges')
        .select('*', { count: 'exact', head: true })
        .eq('badge_id', id);

      // Count total students
      const { count: totalStudents } = await client
        .from('student_gamification')
        .select('*', { count: 'exact', head: true });

      // Get recent earners
      const { data: recentEarners } = await client
        .from('student_badges')
        .select(
          `
          earned_at,
          student:students!student_id (
            first_name,
            last_name,
            grade_level
          )
        `,
        )
        .eq('badge_id', id)
        .order('earned_at', { ascending: false })
        .limit(10);

      return {
        badge,
        stats: {
          totalEarned: earnedCount || 0,
          totalStudents: totalStudents || 0,
          earnedPercentage: totalStudents ? ((earnedCount || 0) / totalStudents) * 100 : 0,
        },
        recentEarners: recentEarners || [],
      };
    } catch (error) {
      this.logger.error('Error fetching badge stats:', error);
      throw error;
    }
  }

  /**
   * Manually award badge to student (Admin/Teacher only)
   * POST /badges/:id/award
   */
  @Post(':id/award')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async awardBadgeManually(@Param('id') badgeId: string, @Body('studentId') studentId: string) {
    const serviceClient = this.supabaseService.getServiceClient();

    try {
      // Check if already earned
      const { data: existing } = await serviceClient
        .from('student_badges')
        .select('id')
        .eq('student_id', studentId)
        .eq('badge_id', badgeId)
        .single();

      if (existing) {
        throw new Error('Student has already earned this badge');
      }

      // Award badge
      const { data, error } = await serviceClient
        .from('student_badges')
        .insert({
          student_id: studentId,
          badge_id: badgeId,
          current_progress: 100,
          metadata: { manually_awarded: true },
        })
        .select()
        .single();

      if (error) {
        this.logger.error('Error awarding badge:', error);
        throw new Error(`Failed to award badge: ${error.message}`);
      }

      return { success: true, data };
    } catch (error) {
      this.logger.error('Error in awardBadgeManually:', error);
      throw error;
    }
  }
}
