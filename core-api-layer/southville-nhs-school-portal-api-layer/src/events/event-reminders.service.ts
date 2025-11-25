import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NotificationService } from '../common/services/notification.service';
import {
  NotificationType,
  NotificationCategory,
} from '../notifications/entities/notification.entity';

@Injectable()
export class EventRemindersService {
  private readonly logger = new Logger(EventRemindersService.name);
  private supabase: SupabaseClient;

  constructor(
    private configService: ConfigService,
    private notificationService: NotificationService,
  ) {}

  private getSupabaseClient(): SupabaseClient {
    if (!this.supabase) {
      const supabaseUrl = this.configService.get<string>('supabase.url');
      const supabaseServiceKey = this.configService.get<string>(
        'supabase.serviceRoleKey',
      );

      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase configuration is missing');
      }

      this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    }
    return this.supabase;
  }

  /**
   * Send reminders for events happening tomorrow
   * This should be called daily (e.g., via a scheduled task or cron job)
   */
  async sendDailyEventReminders(): Promise<void> {
    try {
      const supabase = this.getSupabaseClient();

      // Calculate tomorrow's date range
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      const dayAfterStr = dayAfterTomorrow.toISOString().split('T')[0];

      this.logger.log(
        `🔔 Checking for events on ${tomorrowStr} to send reminders`,
      );

      // Fetch events happening tomorrow that are published
      const { data: events, error } = await supabase
        .from('events')
        .select('id, title, date, time, location, visibility, club_id')
        .eq('status', 'published')
        .gte('date', tomorrowStr)
        .lt('date', dayAfterStr);

      if (error) {
        this.logger.error('Error fetching events for reminders:', error);
        return;
      }

      if (!events || events.length === 0) {
        this.logger.log('No events found for tomorrow');
        return;
      }

      this.logger.log(`Found ${events.length} event(s) for tomorrow`);

      // Send reminders for each event
      for (const event of events) {
        await this.sendEventReminder(event);
      }

      this.logger.log(
        `✅ Completed sending reminders for ${events.length} event(s)`,
      );
    } catch (error) {
      this.logger.error('Error in sendDailyEventReminders:', error);
    }
  }

  /**
   * Send reminder for a specific event
   */
  private async sendEventReminder(event: any): Promise<void> {
    try {
      const targetUserIds = await this.getTargetUsersForEvent(event);

      if (targetUserIds.length === 0) {
        this.logger.warn(`No target users found for event: ${event.title}`);
        return;
      }

      const eventTime = event.time || 'TBA';
      const eventLocation = event.location || 'TBA';
      const eventDate = new Date(event.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      await this.notificationService.notifyUsers(
        targetUserIds,
        `Reminder: ${event.title} Tomorrow`,
        `Don't forget about "${event.title}" happening tomorrow (${eventDate}) at ${eventTime}. Location: ${eventLocation}`,
        NotificationType.INFO,
        undefined,
        {
          category: NotificationCategory.EVENT_ANNOUNCEMENT,
          expiresInDays: 2, // Reminder expires after 2 days
        },
      );

      this.logger.log(
        `📅 Sent reminder to ${targetUserIds.length} user(s) for event: ${event.title}`,
      );
    } catch (error) {
      this.logger.error(`Error sending reminder for event ${event.id}:`, error);
    }
  }

  /**
   * Get target user IDs for an event based on visibility and club_id
   */
  private async getTargetUsersForEvent(event: any): Promise<string[]> {
    try {
      const supabase = this.getSupabaseClient();
      const userIds: string[] = [];

      // If event is public, notify all active users
      if (
        event.visibility === 'public' ||
        (Array.isArray(event.visibility) && event.visibility.includes('public'))
      ) {
        const { data: users, error } = await supabase
          .from('users')
          .select('id')
          .eq('status', 'active');

        if (error) {
          this.logger.error('Error fetching users for public event:', error);
          return [];
        }

        if (users) {
          userIds.push(...users.map((u) => u.id));
        }
      }
      // If event is private and has club_id, notify club members
      else if (event.club_id) {
        const { data: memberships, error } = await supabase
          .from('club_memberships')
          .select('user_id')
          .eq('club_id', event.club_id)
          .eq('status', 'active');

        if (error) {
          this.logger.error(
            'Error fetching club members for private event:',
            error,
          );
          return [];
        }

        if (memberships) {
          const memberUserIds = memberships
            .map((m) => m.user_id)
            .filter(Boolean);

          // Verify these users are active
          if (memberUserIds.length > 0) {
            const { data: activeUsers } = await supabase
              .from('users')
              .select('id')
              .in('id', memberUserIds)
              .eq('status', 'active');

            if (activeUsers) {
              userIds.push(...activeUsers.map((u) => u.id));
            }
          }
        }
      }
      // If event is private without club_id, notify admins only
      else {
        // Get admin role ID
        const { data: adminRole } = await supabase
          .from('roles')
          .select('id')
          .eq('name', 'Admin')
          .single();

        if (adminRole) {
          const { data: admins, error } = await supabase
            .from('users')
            .select('id')
            .eq('role_id', adminRole.id)
            .eq('status', 'active');

          if (error) {
            this.logger.error(
              'Error fetching admins for private event:',
              error,
            );
            return [];
          }

          if (admins) {
            userIds.push(...admins.map((u) => u.id));
          }
        }
      }

      // Remove duplicates
      return Array.from(new Set(userIds));
    } catch (error) {
      this.logger.error('Error in getTargetUsersForEvent:', error);
      return [];
    }
  }

  /**
   * Send immediate reminder for events happening in 1 hour
   * This can be called hourly if needed
   */
  async sendHourlyEventReminders(): Promise<void> {
    try {
      const supabase = this.getSupabaseClient();

      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

      const todayStr = now.toISOString().split('T')[0];

      this.logger.log(
        `🔔 Checking for events starting around ${oneHourLater.toLocaleTimeString()}`,
      );

      // Fetch events happening today
      const { data: events, error } = await supabase
        .from('events')
        .select('id, title, date, time, location, visibility, club_id')
        .eq('status', 'published')
        .eq('date', todayStr);

      if (error) {
        this.logger.error('Error fetching events for hourly reminders:', error);
        return;
      }

      if (!events || events.length === 0) {
        return;
      }

      // Filter events that start in approximately 1 hour
      for (const event of events) {
        if (!event.time) continue;

        try {
          // Parse event time (assumes format like "14:00" or "2:00 PM")
          const eventDateTime = new Date(`${event.date}T${event.time}`);
          const timeDiff = eventDateTime.getTime() - now.getTime();
          const hoursDiff = timeDiff / (1000 * 60 * 60);

          // Send reminder if event is between 50-70 minutes away
          if (hoursDiff >= 0.83 && hoursDiff <= 1.17) {
            await this.sendHourlyReminder(event);
          }
        } catch (timeError) {
          this.logger.warn(
            `Could not parse time for event ${event.id}:`,
            timeError,
          );
        }
      }
    } catch (error) {
      this.logger.error('Error in sendHourlyEventReminders:', error);
    }
  }

  /**
   * Send 1-hour reminder for a specific event
   */
  private async sendHourlyReminder(event: any): Promise<void> {
    try {
      const targetUserIds = await this.getTargetUsersForEvent(event);

      if (targetUserIds.length === 0) {
        return;
      }

      const eventTime = event.time || 'TBA';
      const eventLocation = event.location || 'TBA';

      await this.notificationService.notifyUsers(
        targetUserIds,
        `Starting Soon: ${event.title}`,
        `"${event.title}" starts in approximately 1 hour at ${eventTime}. Location: ${eventLocation}`,
        NotificationType.INFO,
        undefined,
        {
          category: NotificationCategory.EVENT_ANNOUNCEMENT,
          expiresInDays: 1,
        },
      );

      this.logger.log(
        `⏰ Sent 1-hour reminder to ${targetUserIds.length} user(s) for event: ${event.title}`,
      );
    } catch (error) {
      this.logger.error(
        `Error sending hourly reminder for event ${event.id}:`,
        error,
      );
    }
  }
}
