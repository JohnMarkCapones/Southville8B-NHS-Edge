import { Injectable, Logger } from '@nestjs/common';
import { AlertsService } from '../../alerts/alerts.service';
import { AlertType } from '../../alerts/entities/alert.entity';
import { CreateAlertDto } from '../../alerts/dto/create-alert.dto';

export enum NotificationCategory {
  USER_ACCOUNT = 'user_account',
  ACADEMIC = 'academic',
  EVENT_ANNOUNCEMENT = 'event_announcement',
  SYSTEM = 'system',
  COMMUNICATION = 'communication',
}

export interface NotificationOptions {
  expiresInDays?: number;
  category?: NotificationCategory;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly alertsService: AlertsService) {}

  /**
   * Create a notification for a single user
   */
  async notifyUser(
    userId: string,
    title: string,
    message: string,
    type: AlertType = AlertType.INFO,
    createdBy?: string,
    options?: NotificationOptions,
  ): Promise<void> {
    try {
      const expiresAt = options?.expiresInDays
        ? new Date(Date.now() + options.expiresInDays * 24 * 60 * 60 * 1000)
        : undefined;

      const createAlertDto: CreateAlertDto = {
        type,
        title,
        message,
        recipient_id: userId,
        expires_at: expiresAt?.toISOString(),
      };

      await this.alertsService.create(
        createAlertDto,
        createdBy || userId,
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
   */
  async notifyUsers(
    userIds: string[],
    title: string,
    message: string,
    type: AlertType = AlertType.INFO,
    createdBy?: string,
    options?: NotificationOptions,
  ): Promise<void> {
    try {
      const expiresAt = options?.expiresInDays
        ? new Date(Date.now() + options.expiresInDays * 24 * 60 * 60 * 1000)
        : undefined;

      // Create notifications in parallel (but limit concurrency to avoid overwhelming the database)
      const batchSize = 10;
      for (let i = 0; i < userIds.length; i += batchSize) {
        const batch = userIds.slice(i, i + batchSize);
        await Promise.all(
          batch.map((userId) => {
            const createAlertDto: CreateAlertDto = {
              type,
              title,
              message,
              recipient_id: userId,
              expires_at: expiresAt?.toISOString(),
            };
            return this.alertsService.create(
              createAlertDto,
              createdBy || userId,
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
   */
  async notifyAll(
    title: string,
    message: string,
    type: AlertType = AlertType.INFO,
    createdBy?: string,
    options?: NotificationOptions,
  ): Promise<void> {
    try {
      const expiresAt = options?.expiresInDays
        ? new Date(Date.now() + options.expiresInDays * 24 * 60 * 60 * 1000)
        : undefined;

      const createAlertDto: CreateAlertDto = {
        type,
        title,
        message,
        recipient_id: null, // null = global alert
        expires_at: expiresAt?.toISOString(),
      };

      await this.alertsService.create(createAlertDto, createdBy || 'system');
    } catch (error) {
      this.logger.error('Failed to create global notification:', error);
      // Don't throw - notifications are non-critical
    }
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
      AlertType.SUCCESS,
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
    createdBy: string,
  ): Promise<void> {
    await this.notifyUser(
      userId,
      'Account Status Changed',
      `Your account status has been changed to: ${status}`,
      status === 'active' ? AlertType.SUCCESS : AlertType.WARNING,
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
      AlertType.INFO,
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
      action === 'deleted' ? AlertType.WARNING : AlertType.INFO,
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
      AlertType.INFO,
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
      AlertType.INFO,
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
      status === 'approved' ? AlertType.SUCCESS : AlertType.WARNING,
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
      failureCount > 0 ? AlertType.WARNING : AlertType.SUCCESS,
      createdBy,
      { expiresInDays: 1 },
    );
  }
}

