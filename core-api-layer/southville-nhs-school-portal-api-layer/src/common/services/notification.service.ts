import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NotificationsService } from '../../notifications/notifications.service';
import { NotificationType, NotificationCategory } from '../../notifications/entities/notification.entity';
import { CreateNotificationDto } from '../../notifications/dto/create-notification.dto';

// Re-export for backward compatibility
export { NotificationCategory };

export interface NotificationOptions {
  expiresInDays?: number;
  category?: NotificationCategory;
  expectedRole?: string | null; // Optional role validation ('Admin', 'Teacher', 'Student', or null for any)
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private supabase: SupabaseClient | null = null;

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly configService: ConfigService,
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
   * Get user role name from user_id
   * @param userId - The user ID
   * @returns Promise<string | null> - The user's role name (e.g., 'Admin', 'Teacher', 'Student')
   */
  private async getUserRole(userId: string): Promise<string | null> {
    try {
      const supabase = this.getSupabaseClient();
      const { data: user, error } = await supabase
        .from('users')
        .select('role_id, roles!inner(name)')
        .eq('id', userId)
        .single();

      if (error) {
        this.logger.warn(`Error fetching role for user ${userId}:`, error);
        return null;
      }

      // Handle both object and array responses
      const roles: any = user?.roles;
      const roleName = Array.isArray(roles) ? roles[0]?.name : roles?.name;
      return roleName || null;
    } catch (error) {
      this.logger.error(`Error in getUserRole for user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Validate that user role matches expected role for notification
   * @param userId - The user ID
   * @param expectedRole - Expected role name ('Admin', 'Teacher', 'Student', or null for any)
   * @returns Promise<boolean> - True if role matches or validation is skipped
   */
  private async validateUserRole(
    userId: string,
    expectedRole: string | null,
  ): Promise<boolean> {
    // If no expected role specified, skip validation
    if (!expectedRole) {
      return true;
    }

    try {
      const userRole = await this.getUserRole(userId);
      if (!userRole) {
        this.logger.warn(
          `Could not determine role for user ${userId}, skipping validation`,
        );
        return true; // Allow notification if we can't determine role (fail open)
      }

      const roleMatches = userRole === expectedRole;
      if (!roleMatches) {
        this.logger.warn(
          `Role mismatch: User ${userId} has role '${userRole}' but notification expects '${expectedRole}'. Notification will be created but this may indicate a configuration issue.`,
        );
        // We log a warning but still allow the notification (fail open)
        // This prevents breaking existing functionality while alerting to potential issues
      }

      return true; // Always allow (fail open with warning)
    } catch (error) {
      this.logger.error(
        `Error validating role for user ${userId}:`,
        error,
      );
      return true; // Fail open - allow notification if validation fails
    }
  }

  /**
   * Create a notification for a single user
   * @param expectedRole - Optional role validation ('Admin', 'Teacher', 'Student', or null for any)
   */
  async notifyUser(
    userId: string,
    title: string,
    message: string,
    type: NotificationType = NotificationType.INFO,
    createdBy?: string,
    options?: NotificationOptions & { expectedRole?: string | null },
  ): Promise<void> {
    try {
      // Validate user role if expectedRole is specified
      if (options?.expectedRole !== undefined) {
        await this.validateUserRole(userId, options.expectedRole);
      }

      const createNotificationDto: CreateNotificationDto = {
        user_id: userId,
        type,
        title,
        message,
        category: options?.category,
        created_by: createdBy,
      };

      await this.notificationsService.create(
        createNotificationDto,
        createdBy,
      );
    } catch (error) {
      this.logger.error(
        `Failed to create notification for user ${userId}:`,
        error,
      );
      // Don't throw - notifications are non-critical
    }
  }

  /**
   * Create notifications for multiple users
   * @param expectedRole - Optional role validation ('Admin', 'Teacher', 'Student', or null for any)
   */
  async notifyUsers(
    userIds: string[],
    title: string,
    message: string,
    type: NotificationType = NotificationType.INFO,
    createdBy?: string,
    options?: NotificationOptions & { expectedRole?: string | null },
  ): Promise<void> {
    try {
      // Validate user roles if expectedRole is specified
      if (options?.expectedRole !== undefined) {
        // Validate all users in parallel (but limit concurrency)
        const batchSize = 10;
        const expectedRole = options.expectedRole ?? null;
        for (let i = 0; i < userIds.length; i += batchSize) {
          const batch = userIds.slice(i, i + batchSize);
          await Promise.all(
            batch.map((userId) =>
              this.validateUserRole(userId, expectedRole),
            ),
          );
        }
      }

      // Create notifications in parallel (but limit concurrency to avoid overwhelming the database)
      const batchSize = 10;
      for (let i = 0; i < userIds.length; i += batchSize) {
        const batch = userIds.slice(i, i + batchSize);
        await Promise.all(
          batch.map((userId) => {
            const createNotificationDto: CreateNotificationDto = {
              user_id: userId,
              type,
              title,
              message,
              category: options?.category,
              created_by: createdBy,
            };
            return this.notificationsService.create(
              createNotificationDto,
              createdBy,
            );
          }),
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to create notifications for ${userIds.length} users:`,
        error,
      );
      // Don't throw - notifications are non-critical
    }
  }

  /**
   * Create a global notification (visible to all users)
   * Note: For global notifications, use the alerts table instead.
   * This method is kept for backward compatibility but should use alerts.
   */
  async notifyAll(
    title: string,
    message: string,
    type: NotificationType = NotificationType.INFO,
    createdBy?: string,
    options?: NotificationOptions,
  ): Promise<void> {
    // Global notifications should use the alerts table, not notifications table
    // Notifications table is for user-specific event notifications only
    this.logger.warn(
      'notifyAll() called - global notifications should use alerts table, not notifications table',
    );
    // For now, we'll skip this - global notifications should be created via AlertsService
    // This maintains separation: alerts = global, notifications = user-specific
  }

  /**
   * Helper: Notify user about account creation
   */
  async notifyAccountCreated(
    userId: string,
    userRole: string,
    createdBy: string,
  ): Promise<void> {
    await this.notifyUser(
      userId,
      'Account Created',
      `Your ${userRole} account has been successfully created. Welcome!`,
      NotificationType.SUCCESS,
      createdBy,
      { expiresInDays: 7 },
    );
  }

  /**
   * Helper: Notify user about account status change
   */
  async notifyAccountStatusChanged(
    userId: string,
    status: string,
    createdBy?: string,
  ): Promise<void> {
    await this.notifyUser(
      userId,
      'Account Status Changed',
      `Your account status has been changed to: ${status}`,
      status === 'active' ? NotificationType.SUCCESS : NotificationType.WARNING,
      createdBy,
      { expiresInDays: 7 },
    );
  }

  /**
   * Helper: Notify user about password reset
   */
  async notifyPasswordReset(userId: string, createdBy: string): Promise<void> {
    await this.notifyUser(
      userId,
      'Password Reset',
      'Your password has been reset. Please log in with your new password.',
      NotificationType.INFO,
      createdBy,
      { expiresInDays: 1 },
    );
  }

  /**
   * Helper: Notify about schedule changes
   */
  async notifyScheduleChange(
    userIds: string[],
    action: 'created' | 'updated' | 'deleted',
    scheduleDetails: string,
    createdBy: string,
  ): Promise<void> {
    const actionText = {
      created: 'created',
      updated: 'updated',
      deleted: 'deleted',
    }[action];

    await this.notifyUsers(
      userIds,
      `Schedule ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`,
      `A class schedule has been ${actionText}: ${scheduleDetails}`,
      action === 'deleted' ? NotificationType.WARNING : NotificationType.INFO,
      createdBy,
      { expiresInDays: 7 },
    );
  }

  /**
   * Helper: Notify about grade entry
   */
  async notifyGradeEntered(
    userId: string,
    subject: string,
    createdBy: string,
  ): Promise<void> {
    await this.notifyUser(
      userId,
      'Grade Entered',
      `A new grade has been entered for ${subject}`,
      NotificationType.INFO,
      createdBy,
      { expiresInDays: 30 },
    );
  }

  /**
   * Helper: Notify about event/announcement
   */
  async notifyEventAnnouncement(
    userIds: string[],
    title: string,
    message: string,
    type: 'event' | 'announcement',
    createdBy: string,
  ): Promise<void> {
    await this.notifyUsers(
      userIds,
      `New ${type === 'event' ? 'Event' : 'Announcement'}: ${title}`,
      message,
      NotificationType.INFO,
      createdBy,
      { expiresInDays: 7 },
    );
  }

  /**
   * Helper: Notify about approval/rejection
   */
  async notifyApprovalStatus(
    userId: string,
    itemType: string,
    status: 'approved' | 'rejected',
    message?: string,
    createdBy?: string,
  ): Promise<void> {
    await this.notifyUser(
      userId,
      `${itemType} ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message ||
        `Your ${itemType} has been ${status}.`,
      status === 'approved' ? NotificationType.SUCCESS : NotificationType.WARNING,
      createdBy,
      { expiresInDays: 7 },
    );
  }

  /**
   * Helper: Notify about bulk operation completion
   */
  async notifyBulkOperationComplete(
    userId: string,
    operation: string,
    successCount: number,
    failureCount: number,
    createdBy: string,
  ): Promise<void> {
    const message =
      failureCount > 0
        ? `${operation} completed: ${successCount} succeeded, ${failureCount} failed.`
        : `${operation} completed successfully: ${successCount} items processed.`;

    await this.notifyUser(
      userId,
      'Bulk Operation Complete',
      message,
      failureCount > 0 ? NotificationType.WARNING : NotificationType.SUCCESS,
      createdBy,
      { expiresInDays: 1 },
    );
  }

  /**
   * Get users by role IDs and notify them
   * This method automatically validates that only users with the specified role receive notifications
   */
  async notifyUsersByRole(
    roleIds: string[],
    title: string,
    message: string,
    type: NotificationType = NotificationType.INFO,
    createdBy?: string,
    options?: NotificationOptions,
  ): Promise<void> {
    try {
      if (!roleIds || roleIds.length === 0) {
        this.logger.warn('notifyUsersByRole called with empty roleIds array');
        return;
      }

      // Get Supabase client
      const supabase = this.getSupabaseClient();

      // Query users with matching role_ids
      const { data: users, error } = await supabase
        .from('users')
        .select('id')
        .in('role_id', roleIds)
        .eq('status', 'active'); // Only notify active users

      if (error) {
        this.logger.error('Error fetching users by role:', error);
        return;
      }

      if (!users || users.length === 0) {
        this.logger.warn(`No active users found for role IDs: ${roleIds.join(', ')}`);
        return;
      }

      const userIds = users.map((u) => u.id);
      this.logger.log(
        `[NotificationService] Found ${userIds.length} users for roles ${roleIds.join(', ')}, creating notifications...`,
      );
      this.logger.log(`[NotificationService] User IDs to notify: ${userIds.join(', ')}`);

      await this.notifyUsers(userIds, title, message, type, createdBy, options);
      this.logger.log(`[NotificationService] Successfully created notifications for ${userIds.length} users`);
    } catch (error) {
      this.logger.error('Error in notifyUsersByRole:', error);
      // Don't throw - notifications are non-critical
    }
  }

  /**
   * Get users by section IDs and notify them
   * Note: Only students have sections, so this queries the students table
   */
  async notifyUsersBySection(
    sectionIds: string[],
    title: string,
    message: string,
    type: NotificationType = NotificationType.INFO,
    createdBy?: string,
    options?: NotificationOptions,
  ): Promise<void> {
    try {
      if (!sectionIds || sectionIds.length === 0) {
        this.logger.warn('notifyUsersBySection called with empty sectionIds array');
        return;
      }

      // Get Supabase client
      const supabase = this.getSupabaseClient();

      // Query students with matching section_ids
      const { data: students, error } = await supabase
        .from('students')
        .select('user_id')
        .in('section_id', sectionIds);

      if (error) {
        this.logger.error('Error fetching students by section:', error);
        return;
      }

      if (!students || students.length === 0) {
        this.logger.warn(
          `No students found for section IDs: ${sectionIds.join(', ')}`,
        );
        return;
      }

      // Get user IDs and filter for active users
      const studentUserIds = students.map((s) => s.user_id).filter(Boolean);
      if (studentUserIds.length === 0) {
        this.logger.warn('No valid user IDs found for students');
        return;
      }

      // Verify users are active
      const { data: activeUsers, error: usersError } = await supabase
        .from('users')
        .select('id')
        .in('id', studentUserIds)
        .eq('status', 'active');

      if (usersError) {
        this.logger.error('Error verifying active users:', usersError);
        return;
      }

      if (!activeUsers || activeUsers.length === 0) {
        this.logger.warn('No active users found for students');
        return;
      }

      const userIds = activeUsers.map((u) => u.id);
      this.logger.log(
        `Found ${userIds.length} active students for sections ${sectionIds.join(', ')}, creating notifications...`,
      );

      await this.notifyUsers(userIds, title, message, type, createdBy, options);
    } catch (error) {
      this.logger.error('Error in notifyUsersBySection:', error);
      // Don't throw - notifications are non-critical
    }
  }

  /**
   * Get users by both role IDs and section IDs and notify them
   * This combines role-based and section-based targeting
   */
  async notifyUsersByRolesAndSections(
    roleIds: string[],
    sectionIds: string[],
    title: string,
    message: string,
    type: NotificationType = NotificationType.INFO,
    createdBy?: string,
    options?: NotificationOptions,
  ): Promise<void> {
    try {
      const userIds = new Set<string>();

      // Get Supabase client
      const supabase = this.getSupabaseClient();

      // Get users by roles
      if (roleIds && roleIds.length > 0) {
        const { data: users } = await supabase
          .from('users')
          .select('id')
          .in('role_id', roleIds)
          .eq('status', 'active');

        if (users) {
          users.forEach((u) => userIds.add(u.id));
        }
      }

      // Get users by sections (students only)
      if (sectionIds && sectionIds.length > 0) {
        const { data: students } = await supabase
          .from('students')
          .select('user_id')
          .in('section_id', sectionIds);

        if (students) {
          const studentUserIds = students
            .map((s) => s.user_id)
            .filter(Boolean);

          // Verify these users are active
          if (studentUserIds.length > 0) {
            const { data: activeUsers } = await supabase
              .from('users')
              .select('id')
              .in('id', studentUserIds)
              .eq('status', 'active');

            if (activeUsers) {
              activeUsers.forEach((u) => userIds.add(u.id));
            }
          }
        }
      }

      if (userIds.size === 0) {
        this.logger.warn(
          'No users found for combined role and section targeting',
        );
        return;
      }

      const uniqueUserIds = Array.from(userIds);
      this.logger.log(
        `Found ${uniqueUserIds.length} unique users for combined targeting, creating notifications...`,
      );

      await this.notifyUsers(
        uniqueUserIds,
        title,
        message,
        type,
        createdBy,
        options,
      );
    } catch (error) {
      this.logger.error('Error in notifyUsersByRolesAndSections:', error);
      // Don't throw - notifications are non-critical
    }
  }
}

