import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NotificationService } from '../common/services/notification.service';
import {
  NotificationType,
  NotificationCategory,
} from '../notifications/entities/notification.entity';

@Injectable()
export class ActivityMonitoringService {
  private readonly logger = new Logger(ActivityMonitoringService.name);
  private supabase: SupabaseClient | null = null;

  constructor(
    private readonly notificationService: NotificationService,
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
   * Get admin role ID
   */
  private async getAdminRoleId(): Promise<string | null> {
    try {
      const supabase = this.getSupabaseClient();
      const { data: adminRole, error } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'Admin')
        .single();

      if (error) {
        this.logger.error('Error fetching admin role ID:', error);
        return null;
      }

      this.logger.log(`[ActivityMonitoring] Admin role ID: ${adminRole?.id || 'not found'}`);
      return adminRole?.id || null;
    } catch (error) {
      this.logger.error('Error fetching admin role ID:', error);
      return null;
    }
  }

  /**
   * Handle user creation - notify admins
   */
  async handleUserCreated(
    userId: string,
    userEmail: string,
    userRole: string,
    createdBy: string,
  ): Promise<void> {
    try {
      this.logger.log(
        `[ActivityMonitoring] User created: ${userId} (${userEmail}, ${userRole}) by ${createdBy}`,
      );

      // Notify admins about new user creation
      this.logger.log(`[ActivityMonitoring] Attempting to notify admins about new user: ${userEmail}`);
      const adminRoleId = await this.getAdminRoleId();
      if (adminRoleId) {
        this.logger.log(`[ActivityMonitoring] Admin role ID found: ${adminRoleId}, calling notifyUsersByRole...`);
        await this.notificationService.notifyUsersByRole(
          [adminRoleId],
          'New User Created',
          `A new ${userRole} account has been created: ${userEmail}`,
          NotificationType.INFO,
          createdBy,
          {
            category: NotificationCategory.USER_ACCOUNT,
            expiresInDays: 7,
          },
        );
        this.logger.log(`[ActivityMonitoring] notifyUsersByRole completed for admin role ${adminRoleId}`);
      } else {
        this.logger.warn(`[ActivityMonitoring] Admin role ID not found, skipping admin notification`);
      }
    } catch (error) {
      this.logger.error('Error in handleUserCreated:', error);
      // Don't throw - monitoring should not fail main operations
    }
  }

  /**
   * Handle user update - notify user if status changed
   */
  async handleUserUpdated(
    userId: string,
    changes: { status?: string; [key: string]: any },
    updatedBy: string,
  ): Promise<void> {
    try {
      this.logger.log(
        `[ActivityMonitoring] User updated: ${userId} by ${updatedBy}`,
      );

      // If status changed, notify the user
      if (changes.status) {
        await this.notificationService.notifyUser(
          userId,
          'Account Status Changed',
          `Your account status has been changed to: ${changes.status}`,
          changes.status === 'active'
            ? NotificationType.SUCCESS
            : NotificationType.WARNING,
          updatedBy,
          {
            category: NotificationCategory.USER_ACCOUNT,
            expiresInDays: 7,
          },
        );
      }
    } catch (error) {
      this.logger.error('Error in handleUserUpdated:', error);
      // Don't throw - monitoring should not fail main operations
    }
  }

  /**
   * Handle user deletion - notify admins
   */
  async handleUserDeleted(
    userId: string,
    userEmail: string,
    deletedBy: string,
  ): Promise<void> {
    try {
      this.logger.log(
        `[ActivityMonitoring] User deleted: ${userId} (${userEmail}) by ${deletedBy}`,
      );

      // Notify admins about user deletion
      const adminRoleId = await this.getAdminRoleId();
      if (adminRoleId) {
        await this.notificationService.notifyUsersByRole(
          [adminRoleId],
          'User Deleted',
          `User account has been deleted: ${userEmail}`,
          NotificationType.WARNING,
          deletedBy,
          {
            category: NotificationCategory.USER_ACCOUNT,
            expiresInDays: 7,
          },
        );
      }
    } catch (error) {
      this.logger.error('Error in handleUserDeleted:', error);
      // Don't throw - monitoring should not fail main operations
    }
  }

  /**
   * Handle event creation - notifications handled by EventsService
   * This is a placeholder for future enhancements
   */
  async handleEventCreated(
    eventId: string,
    eventTitle: string,
    createdBy: string,
  ): Promise<void> {
    try {
      this.logger.log(
        `[ActivityMonitoring] Event created: ${eventId} (${eventTitle}) by ${createdBy}`,
      );
      // Event notifications are handled directly in EventsService
    } catch (error) {
      this.logger.error('Error in handleEventCreated:', error);
    }
  }

  /**
   * Handle event update
   */
  async handleEventUpdated(
    eventId: string,
    eventTitle: string,
    changes: any,
    updatedBy: string,
  ): Promise<void> {
    try {
      this.logger.log(
        `[ActivityMonitoring] Event updated: ${eventId} (${eventTitle}) by ${updatedBy}`,
      );
      // Event update notifications are handled directly in EventsService
    } catch (error) {
      this.logger.error('Error in handleEventUpdated:', error);
    }
  }

  /**
   * Handle event status change
   */
  async handleEventStatusChanged(
    eventId: string,
    eventTitle: string,
    newStatus: string,
    updatedBy: string,
  ): Promise<void> {
    try {
      this.logger.log(
        `[ActivityMonitoring] Event status changed: ${eventId} (${eventTitle}) to ${newStatus} by ${updatedBy}`,
      );
      // Event status change notifications are handled directly in EventsService
    } catch (error) {
      this.logger.error('Error in handleEventStatusChanged:', error);
    }
  }

  /**
   * Handle announcement creation - notifications handled by AnnouncementsService
   */
  async handleAnnouncementCreated(
    announcementId: string,
    announcementTitle: string,
    createdBy: string,
  ): Promise<void> {
    try {
      this.logger.log(
        `[ActivityMonitoring] Announcement created: ${announcementId} (${announcementTitle}) by ${createdBy}`,
      );
      // Announcement notifications are handled directly in AnnouncementsService
    } catch (error) {
      this.logger.error('Error in handleAnnouncementCreated:', error);
    }
  }

  /**
   * Handle schedule creation - notify affected students and teachers
   */
  async handleScheduleCreated(
    scheduleId: string,
    scheduleDetails: string,
    affectedUserIds: string[],
    createdBy: string,
  ): Promise<void> {
    try {
      this.logger.log(
        `[ActivityMonitoring] Schedule created: ${scheduleId} affecting ${affectedUserIds.length} users by ${createdBy}`,
      );

      if (affectedUserIds.length > 0) {
        await this.notificationService.notifyUsers(
          affectedUserIds,
          'New Schedule Created',
          `A new class schedule has been created: ${scheduleDetails}`,
          NotificationType.INFO,
          createdBy,
          {
            category: NotificationCategory.ACADEMIC,
            expiresInDays: 7,
          },
        );
      }
    } catch (error) {
      this.logger.error('Error in handleScheduleCreated:', error);
    }
  }

  /**
   * Handle schedule update - notify affected users
   */
  async handleScheduleUpdated(
    scheduleId: string,
    scheduleDetails: string,
    affectedUserIds: string[],
    changes: any,
    updatedBy: string,
  ): Promise<void> {
    try {
      this.logger.log(
        `[ActivityMonitoring] Schedule updated: ${scheduleId} affecting ${affectedUserIds.length} users by ${updatedBy}`,
      );

      if (affectedUserIds.length > 0) {
        await this.notificationService.notifyUsers(
          affectedUserIds,
          'Schedule Updated',
          `A class schedule has been updated: ${scheduleDetails}`,
          NotificationType.INFO,
          updatedBy,
          {
            category: NotificationCategory.ACADEMIC,
            expiresInDays: 7,
          },
        );
      }
    } catch (error) {
      this.logger.error('Error in handleScheduleUpdated:', error);
    }
  }

  /**
   * Handle schedule deletion - notify affected users
   */
  async handleScheduleDeleted(
    scheduleId: string,
    scheduleDetails: string,
    affectedUserIds: string[],
    deletedBy: string,
  ): Promise<void> {
    try {
      this.logger.log(
        `[ActivityMonitoring] Schedule deleted: ${scheduleId} affecting ${affectedUserIds.length} users by ${deletedBy}`,
      );

      if (affectedUserIds.length > 0) {
        await this.notificationService.notifyUsers(
          affectedUserIds,
          'Schedule Deleted',
          `A class schedule has been deleted: ${scheduleDetails}`,
          NotificationType.WARNING,
          deletedBy,
          {
            category: NotificationCategory.ACADEMIC,
            expiresInDays: 7,
          },
        );
      }
    } catch (error) {
      this.logger.error('Error in handleScheduleDeleted:', error);
    }
  }

  /**
   * Handle quiz published - notify assigned students
   */
  async handleQuizPublished(
    quizId: string,
    quizTitle: string,
    assignedStudentIds: string[],
    publishedBy: string,
  ): Promise<void> {
    try {
      this.logger.log(
        `[ActivityMonitoring] Quiz published: ${quizId} (${quizTitle}) assigned to ${assignedStudentIds.length} students by ${publishedBy}`,
      );

      if (assignedStudentIds.length > 0) {
        await this.notificationService.notifyUsers(
          assignedStudentIds,
          'New Quiz Published',
          `A new quiz has been published: ${quizTitle}`,
          NotificationType.INFO,
          publishedBy,
          {
            category: NotificationCategory.ACADEMIC,
            expiresInDays: 7,
          },
        );
      }
    } catch (error) {
      this.logger.error('Error in handleQuizPublished:', error);
    }
  }

  /**
   * Handle quiz submission - notify teacher
   */
  async handleQuizSubmitted(
    attemptId: string,
    quizId: string,
    quizTitle: string,
    studentId: string,
    studentName: string,
    teacherId: string,
  ): Promise<void> {
    try {
      this.logger.log(
        `[ActivityMonitoring] Quiz submitted: attempt ${attemptId} for quiz ${quizId} by student ${studentId}`,
      );

      await this.notificationService.notifyUser(
        teacherId,
        'Quiz Submission Received',
        `Student ${studentName} has submitted quiz: ${quizTitle}`,
        NotificationType.INFO,
        studentId,
        {
          category: NotificationCategory.ACADEMIC,
          expiresInDays: 7,
        },
      );
    } catch (error) {
      this.logger.error('Error in handleQuizSubmitted:', error);
    }
  }

  /**
   * Handle club creation - notify admins
   */
  async handleClubCreated(
    clubId: string,
    clubName: string,
    createdBy: string,
  ): Promise<void> {
    try {
      this.logger.log(
        `[ActivityMonitoring] Club created: ${clubId} (${clubName}) by ${createdBy}`,
      );

      // Notify admins about new club
      const adminRoleId = await this.getAdminRoleId();
      if (adminRoleId) {
        await this.notificationService.notifyUsersByRole(
          [adminRoleId],
          'New Club Created',
          `A new club has been created: ${clubName}`,
          NotificationType.INFO,
          createdBy,
          {
            category: NotificationCategory.COMMUNICATION,
            expiresInDays: 7,
          },
        );
      }
    } catch (error) {
      this.logger.error('Error in handleClubCreated:', error);
    }
  }

  /**
   * Handle membership change - notify club admins
   */
  async handleMembershipChanged(
    clubId: string,
    clubName: string,
    userId: string,
    userName: string,
    action: 'joined' | 'left' | 'removed' | 'approved',
    changedBy: string,
    clubAdminIds: string[],
  ): Promise<void> {
    try {
      this.logger.log(
        `[ActivityMonitoring] Membership ${action}: user ${userId} in club ${clubId} by ${changedBy}`,
      );

      if (clubAdminIds.length > 0) {
        const actionText = {
          joined: 'joined',
          left: 'left',
          removed: 'was removed from',
          approved: 'was approved to join',
        }[action];

        await this.notificationService.notifyUsers(
          clubAdminIds,
          `Member ${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Club`,
          `${userName} ${actionText} the club: ${clubName}`,
          action === 'removed' ? NotificationType.WARNING : NotificationType.INFO,
          changedBy,
          {
            category: NotificationCategory.COMMUNICATION,
            expiresInDays: 7,
          },
        );
      }
    } catch (error) {
      this.logger.error('Error in handleMembershipChanged:', error);
    }
  }

  /**
   * Handle news approval - notify author
   */
  async handleNewsApproved(
    newsId: string,
    newsTitle: string,
    approvedBy: string,
    authorId: string,
  ): Promise<void> {
    try {
      this.logger.log(
        `[ActivityMonitoring] News approved: ${newsId} (${newsTitle}) by ${approvedBy}`,
      );

      await this.notificationService.notifyUser(
        authorId,
        'News Article Approved',
        `Your news article "${newsTitle}" has been approved and published.`,
        NotificationType.SUCCESS,
        approvedBy,
        {
          category: NotificationCategory.COMMUNICATION,
          expiresInDays: 7,
        },
      );
    } catch (error) {
      this.logger.error('Error in handleNewsApproved:', error);
    }
  }

  /**
   * Handle news rejection - notify author
   */
  async handleNewsRejected(
    newsId: string,
    newsTitle: string,
    rejectedBy: string,
    authorId: string,
    reason?: string,
  ): Promise<void> {
    try {
      this.logger.log(
        `[ActivityMonitoring] News rejected: ${newsId} (${newsTitle}) by ${rejectedBy}`,
      );

      await this.notificationService.notifyUser(
        authorId,
        'News Article Rejected',
        `Your news article "${newsTitle}" has been rejected.${reason ? ` Reason: ${reason}` : ''}`,
        NotificationType.WARNING,
        rejectedBy,
        {
          category: NotificationCategory.COMMUNICATION,
          expiresInDays: 7,
        },
      );
    } catch (error) {
      this.logger.error('Error in handleNewsRejected:', error);
    }
  }

  /**
   * Handle grade entry - notify student
   */
  async handleGradeEntered(
    gwaId: string,
    studentId: string,
    subject: string,
    grade: string,
    enteredBy: string,
  ): Promise<void> {
    try {
      this.logger.log(
        `[ActivityMonitoring] Grade entered: ${gwaId} for student ${studentId} in ${subject} by ${enteredBy}`,
      );

      await this.notificationService.notifyUser(
        studentId,
        'Grade Entered',
        `A new grade has been entered for ${subject}: ${grade}`,
        NotificationType.INFO,
        enteredBy,
        {
          category: NotificationCategory.ACADEMIC,
          expiresInDays: 30,
        },
      );
    } catch (error) {
      this.logger.error('Error in handleGradeEntered:', error);
    }
  }

  /**
   * Handle advisory section activity - notify advisory teacher only (NOT admins)
   * @param sectionId - The section ID
   * @param activityType - Type of activity ('student_added', 'student_removed', 'announcement', 'meeting_scheduled')
   * @param details - Activity details (student name, announcement title, etc.)
   * @param performedBy - User ID who performed the action
   */
  async handleAdvisoryActivity(
    sectionId: string,
    activityType: 'student_added' | 'student_removed' | 'announcement' | 'meeting_scheduled',
    details: string,
    performedBy: string,
  ): Promise<void> {
    try {
      this.logger.log(
        `[ActivityMonitoring] Advisory activity: ${activityType} in section ${sectionId} by ${performedBy}`,
      );

      const supabase = this.getSupabaseClient();

      // Find the advisory teacher for this section
      const { data: teacher, error: teacherError } = await supabase
        .from('teachers')
        .select('user_id, first_name, last_name')
        .eq('advisory_section_id', sectionId)
        .single();

      if (teacherError || !teacher) {
        this.logger.warn(
          `No advisory teacher found for section ${sectionId}, skipping notification`,
        );
        return;
      }

      // Get section name for context
      const { data: section } = await supabase
        .from('sections')
        .select('name, grade_level')
        .eq('id', sectionId)
        .single();

      const sectionName = section?.name || 'your advisory section';

      // Create appropriate notification message based on activity type
      let title: string;
      let message: string;

      switch (activityType) {
        case 'student_added':
          title = 'New Student Added to Advisory Section';
          message = `${details} has been added to ${sectionName}.`;
          break;
        case 'student_removed':
          title = 'Student Removed from Advisory Section';
          message = `${details} has been removed from ${sectionName}.`;
          break;
        case 'announcement':
          title = 'New Advisory Announcement';
          message = `A new announcement has been posted for ${sectionName}: ${details}`;
          break;
        case 'meeting_scheduled':
          title = 'Advisory Meeting Scheduled';
          message = `An advisory meeting has been scheduled for ${sectionName}: ${details}`;
          break;
        default:
          title = 'Advisory Section Activity';
          message = `Activity in ${sectionName}: ${details}`;
      }

      // Notify ONLY the advisory teacher (NOT admins)
      await this.notificationService.notifyUser(
        teacher.user_id,
        title,
        message,
        activityType === 'student_removed' ? NotificationType.WARNING : NotificationType.INFO,
        performedBy,
        {
          category: NotificationCategory.ACADEMIC,
          expiresInDays: 7,
          expectedRole: 'Teacher', // Ensure only teachers receive this
        },
      );

      this.logger.log(
        `[ActivityMonitoring] Advisory activity notification sent to teacher ${teacher.user_id}`,
      );
    } catch (error) {
      this.logger.error('Error in handleAdvisoryActivity:', error);
      // Don't throw - monitoring should not fail main operations
    }
  }

  /**
   * Handle student performance alert - notify subject teacher only (NOT admins)
   * @param studentId - The student ID
   * @param studentName - The student's name
   * @param subject - The subject name
   * @param teacherUserId - The subject teacher's user ID
   * @param alertReason - Reason for the alert (e.g., "Grade dropped below 75")
   */
  async handlePerformanceAlert(
    studentId: string,
    studentName: string,
    subject: string,
    teacherUserId: string,
    alertReason: string,
  ): Promise<void> {
    try {
      this.logger.log(
        `[ActivityMonitoring] Performance alert: ${studentName} in ${subject} for teacher ${teacherUserId}`,
      );

      // Notify ONLY the subject teacher (NOT admins)
      await this.notificationService.notifyUser(
        teacherUserId,
        'Student Performance Alert',
        `${studentName}'s performance in ${subject} requires attention: ${alertReason}`,
        NotificationType.WARNING,
        'system',
        {
          category: NotificationCategory.ACADEMIC,
          expiresInDays: 14,
          expectedRole: 'Teacher', // Ensure only teachers receive this
        },
      );

      this.logger.log(
        `[ActivityMonitoring] Performance alert notification sent to teacher ${teacherUserId}`,
      );
    } catch (error) {
      this.logger.error('Error in handlePerformanceAlert:', error);
      // Don't throw - monitoring should not fail main operations
    }
  }
}

