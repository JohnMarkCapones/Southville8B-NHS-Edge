import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class DesktopTeacherDashboardService {
  private readonly logger = new Logger(DesktopTeacherDashboardService.name);
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('supabase.url');
    const serviceRoleKey = this.configService.get<string>(
      'supabase.serviceRoleKey',
    );

    this.supabase = createClient(supabaseUrl!, serviceRoleKey!);
  }

  async getRecentActivities(
    userId: string,
    limit: number = 10,
  ): Promise<any[]> {
    try {
      this.logger.log(
        `Fetching recent activities for user: ${userId}, limit: ${limit}`,
      );

      const { data, error } = await this.supabase
        .from('teacher_activities')
        .select(
          `
          id,
          user_id,
          action_type,
          description,
          entity_type,
          entity_id,
          icon,
          color,
          created_at,
          users!user_id (
            full_name
          )
        `,
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.logger.error('Error fetching teacher activities:', error);
        return [];
      }

      // Map to response format
      const activities = data.map((activity) => ({
        id: activity.id,
        user_id: activity.user_id,
        user_name: (activity.users as any)?.full_name || 'Unknown User',
        action_type: activity.action_type,
        description: activity.description,
        entity_type: activity.entity_type,
        entity_id: activity.entity_id,
        icon: activity.icon,
        color: activity.color,
        created_at: activity.created_at,
      }));

      this.logger.log(
        `Found ${activities.length} activities for user: ${userId}`,
      );
      return activities;
    } catch (error) {
      this.logger.error('Error fetching teacher activities:', error);
      return [];
    }
  }
}
