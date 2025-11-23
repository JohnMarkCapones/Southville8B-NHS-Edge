import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { NewsAccessService } from './news-access.service';
import { NotificationService } from '../../common/services/notification.service';
import {
  NotificationType,
  NotificationCategory,
} from '../../notifications/entities/notification.entity';
import { ActivityMonitoringService } from '../../activity-monitoring/activity-monitoring.service';
import { ApproveNewsDto, RejectNewsDto } from '../dto';
import { NewsApproval } from '../entities';
import { StudentActivitiesService } from '../../student-activities/student-activities.service';
import { ActivityType } from '../../student-activities/entities/student-activity.entity';

/**
 * Service for handling news article approval workflow
 * Only Advisers and Co-Advisers can approve/reject articles
 */
@Injectable()
export class NewsApprovalService {
  private readonly logger = new Logger(NewsApprovalService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly newsAccessService: NewsAccessService,
    private readonly studentActivitiesService: StudentActivitiesService,
    private readonly notificationService: NotificationService,
    private readonly activityMonitoring: ActivityMonitoringService,
  ) {}

  /**
   * Submit article for approval
   * Changes status from draft to pending_approval
   * @param newsId News article ID
   * @param userId User ID (must be author)
   * @returns Promise<void>
   */
  async submitForApproval(newsId: string, userId: string): Promise<void> {
    const supabase = this.supabaseService.getServiceClient();

    // Get article
    const { data: article, error: fetchError } = await supabase
      .from('news')
      .select('author_id, status')
      .eq('id', newsId)
      .maybeSingle();

    if (fetchError || !article) {
      throw new NotFoundException(`Article with ID ${newsId} not found`);
    }

    // Check if user is the author
    if (article.author_id !== userId) {
      throw new ForbiddenException(
        'Only the article author can submit it for approval',
      );
    }

    // Check current status
    if (article.status !== 'draft') {
      throw new BadRequestException(
        `Article is already ${article.status}. Only draft articles can be submitted for approval.`,
      );
    }

    // Update status to pending_approval
    const { error: updateError } = await supabase
      .from('news')
      .update({
        status: 'pending_approval',
        updated_at: new Date().toISOString(),
      })
      .eq('id', newsId);

    if (updateError) {
      this.logger.error('Error submitting article for approval:', updateError);
      throw new BadRequestException(
        `Failed to submit article: ${updateError.message}`,
      );
    }

    this.logger.log(
      `Article ${newsId} submitted for approval by user ${userId}`,
    );

    // Notify advisors about article submission
    try {
      // Get article title
      const { data: articleData } = await supabase
        .from('news')
        .select('title')
        .eq('id', newsId)
        .single();

      // Get all advisors (teachers with Adviser or Co-Adviser position)
      // Get journalism domain first
      const journalismDomainId =
        await this.newsAccessService['getJournalismDomainId']();
      if (journalismDomainId) {
        // Get users with Adviser or Co-Adviser position in journalism domain
        const { data: domainRoles } = await supabase
          .from('user_domain_roles')
          .select(
            `
            user_id,
            domain_roles!inner(
              domain_id,
              name
            )
          `,
          )
          .eq('domain_id', journalismDomainId)
          .eq('domain_roles.name', 'Adviser')
          .or('domain_roles.name.eq.Co-Adviser');

        if (domainRoles) {
          const advisorUserIds = domainRoles
            .map((role) => role.user_id)
            .filter((id) => id);

          if (advisorUserIds.length > 0 && articleData) {
            await this.notificationService.notifyUsers(
              advisorUserIds,
              '📝 Article Submitted for Review',
              `Student submitted article "${articleData.title}" for your approval. Please review and approve/reject.`,
              NotificationType.INFO,
              userId,
              {
                category: NotificationCategory.COMMUNICATION,
                expiresInDays: 7,
              },
            );
            this.logger.log(
              `👩‍🏫 Notified ${advisorUserIds.length} advisors about article submission: ${articleData.title}`,
            );
          }
        }
      }
    } catch (error) {
      this.logger.warn(
        'Failed to create notifications for article submission:',
        error,
      );
    }
  }

  /**
   * Approve article
   * Changes status from pending_approval to approved
   * Creates approval record
   * Only Advisers and Co-Advisers can approve
   * @param newsId News article ID
   * @param approverId User ID (must be Adviser/Co-Adviser)
   * @param approveDto Approval data
   * @returns Promise<NewsApproval>
   */
  async approveArticle(
    newsId: string,
    approverId: string,
    approveDto: ApproveNewsDto,
  ): Promise<NewsApproval> {
    const supabase = this.supabaseService.getServiceClient();

    // Check if user can approve
    await this.newsAccessService.requireApprovalPermission(approverId);

    // Get article with author and title info
    const { data: article, error: fetchError } = await supabase
      .from('news')
      .select(
        'status, title, author_id, author:users!news_author_id_fkey(id, full_name)',
      )
      .eq('id', newsId)
      .maybeSingle();

    if (fetchError || !article) {
      throw new NotFoundException(`Article with ID ${newsId} not found`);
    }

    // Check current status
    if (article.status !== 'pending_approval') {
      throw new BadRequestException(
        `Article is ${article.status}. Only pending articles can be approved.`,
      );
    }

    // Update article status to approved
    const { error: updateError } = await supabase
      .from('news')
      .update({
        status: 'approved',
        updated_at: new Date().toISOString(),
      })
      .eq('id', newsId);

    if (updateError) {
      this.logger.error('Error approving article:', updateError);
      throw new BadRequestException(
        `Failed to approve article: ${updateError.message}`,
      );
    }

    // Create approval record
    const { data: approvalRecord, error: approvalError } = await supabase
      .from('news_approval')
      .insert({
        news_id: newsId,
        approver_id: approverId,
        status: 'approved',
        remarks: approveDto.remarks || null,
      })
      .select()
      .single();

    if (approvalError) {
      this.logger.error('Error creating approval record:', approvalError);
      throw new BadRequestException(
        `Failed to create approval record: ${approvalError.message}`,
      );
    }

    this.logger.log(`Article ${newsId} approved by ${approverId}`);

    // Activity monitoring - notify author about approval
    try {
      if (article.author_id) {
        await this.activityMonitoring.handleNewsApproved(
          newsId,
          article.title,
          approverId,
          article.author_id,
        );
      }
    } catch (error) {
      this.logger.warn(
        'Failed to handle news approval activity monitoring:',
        error,
      );
    }

    // Notify author about approval
    try {
      if (article.author_id) {
        await this.notificationService.notifyApprovalStatus(
          article.author_id,
          'News Article',
          'approved',
          `Your article "${article.title}" has been approved and is ready to publish!`,
          approverId,
        );
      }
    } catch (error) {
      this.logger.warn(
        'Failed to create notification for article approval:',
        error,
      );
    }

    // ✅ NEW: Notify all students about published news
    try {
      // Get all student user IDs
      const { data: students } = await supabase
        .from('students')
        .select('user_id');

      if (students && students.length > 0) {
        const studentUserIds = students.map((s) => s.user_id).filter(Boolean);

        if (studentUserIds.length > 0) {
          await this.notificationService.notifyUsers(
            studentUserIds,
            'New Article Published',
            `New article published: "${article.title}"`,
            NotificationType.INFO,
            approverId,
            {
              category: NotificationCategory.COMMUNICATION,
              expiresInDays: 7,
            },
          );
          this.logger.log(
            `📰 Notified ${studentUserIds.length} students about published article: ${article.title}`,
          );
        }
      }
    } catch (error) {
      this.logger.warn(
        'Failed to notify students about published news:',
        error,
      );
    }

    // Get approver info for activity
    const { data: approverData } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', approverId)
      .single();

    // Create activity timeline entry for the student author
    try {
      await this.studentActivitiesService.create({
        studentUserId: article.author_id,
        activityType: ActivityType.JOURNALISM_ARTICLE_APPROVED,
        title: `📰 Article Approved: "${article.title}"`,
        description: `Your article has been approved${approverData?.full_name ? ` by ${approverData.full_name}` : ''} and is ready to publish!`,
        metadata: {
          article_id: newsId,
          article_title: article.title,
          action_type: 'approved',
          approved_by: approverId,
          approver_name: approverData?.full_name || 'Unknown',
          remarks: approveDto.remarks || null,
        },
        relatedEntityId: newsId,
        relatedEntityType: 'news_article',
        icon: 'CheckCircle2',
        color: 'text-green-500',
        isHighlighted: true,
      });
      this.logger.log(
        `✅ Activity timeline entry created for article approval`,
      );
    } catch (activityError) {
      this.logger.error(
        'Failed to create activity timeline entry:',
        activityError,
      );
      // Don't throw - activity is optional, approval already succeeded
    }

    return {
      id: approvalRecord.id,
      news_id: approvalRecord.news_id,
      approver_id: approvalRecord.approver_id,
      status: approvalRecord.status,
      remarks: approvalRecord.remarks,
      action_at: approvalRecord.action_at,
    };
  }

  /**
   * Reject article
   * Changes status from pending_approval to rejected
   * Creates rejection record with required remarks
   * Only Advisers and Co-Advisers can reject
   * @param newsId News article ID
   * @param approverId User ID (must be Adviser/Co-Adviser)
   * @param rejectDto Rejection data (remarks required)
   * @returns Promise<NewsApproval>
   */
  async rejectArticle(
    newsId: string,
    approverId: string,
    rejectDto: RejectNewsDto,
  ): Promise<NewsApproval> {
    const supabase = this.supabaseService.getServiceClient();

    // Check if user can approve/reject
    await this.newsAccessService.requireApprovalPermission(approverId);

    // Get article with author and title info
    const { data: article, error: fetchError } = await supabase
      .from('news')
      .select(
        'status, title, author_id, author:users!news_author_id_fkey(id, full_name)',
      )
      .eq('id', newsId)
      .maybeSingle();

    if (fetchError || !article) {
      throw new NotFoundException(`Article with ID ${newsId} not found`);
    }

    // Check current status
    if (article.status !== 'pending_approval') {
      throw new BadRequestException(
        `Article is ${article.status}. Only pending articles can be rejected.`,
      );
    }

    // Update article status to rejected
    const { error: updateError } = await supabase
      .from('news')
      .update({
        status: 'rejected',
        updated_at: new Date().toISOString(),
      })
      .eq('id', newsId);

    if (updateError) {
      this.logger.error('Error rejecting article:', updateError);
      throw new BadRequestException(
        `Failed to reject article: ${updateError.message}`,
      );
    }

    // Create rejection record
    const { data: rejectionRecord, error: rejectionError } = await supabase
      .from('news_approval')
      .insert({
        news_id: newsId,
        approver_id: approverId,
        status: 'rejected',
        remarks: rejectDto.remarks,
      })
      .select()
      .single();

    if (rejectionError) {
      this.logger.error('Error creating rejection record:', rejectionError);
      throw new BadRequestException(
        `Failed to create rejection record: ${rejectionError.message}`,
      );
    }

    this.logger.log(`Article ${newsId} rejected by ${approverId}`);

    // Activity monitoring - notify author about rejection
    try {
      if (article.author_id) {
        await this.activityMonitoring.handleNewsRejected(
          newsId,
          article.title,
          approverId,
          article.author_id,
          rejectDto.remarks,
        );
      }
    } catch (error) {
      this.logger.warn(
        'Failed to handle news rejection activity monitoring:',
        error,
      );
    }

    // Notify author about rejection
    try {
      if (article.author_id) {
        await this.notificationService.notifyApprovalStatus(
          article.author_id,
          'News Article',
          'rejected',
          `Your article "${article.title}" has been rejected. Please review the feedback and revise.`,
          approverId,
        );
      }
    } catch (error) {
      this.logger.warn(
        'Failed to create notification for article rejection:',
        error,
      );
    }

    // Get approver info for activity
    const { data: approverData } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', approverId)
      .single();

    // Create activity timeline entry for the student author
    try {
      await this.studentActivitiesService.create({
        studentUserId: article.author_id,
        activityType: ActivityType.JOURNALISM_ARTICLE_REJECTED,
        title: `❌ Article Rejected: "${article.title}"`,
        description: `Your article has been rejected${approverData?.full_name ? ` by ${approverData.full_name}` : ''}. Please review the feedback and revise.`,
        metadata: {
          article_id: newsId,
          article_title: article.title,
          action_type: 'rejected',
          rejected_by: approverId,
          rejector_name: approverData?.full_name || 'Unknown',
          reason: rejectDto.remarks,
        },
        relatedEntityId: newsId,
        relatedEntityType: 'news_article',
        icon: 'XCircle',
        color: 'text-red-500',
        isHighlighted: true,
      });
      this.logger.log(
        `✅ Activity timeline entry created for article rejection`,
      );
    } catch (activityError) {
      this.logger.error(
        'Failed to create activity timeline entry:',
        activityError,
      );
      // Don't throw - activity is optional, rejection already succeeded
    }

    return {
      id: rejectionRecord.id,
      news_id: rejectionRecord.news_id,
      approver_id: rejectionRecord.approver_id,
      status: rejectionRecord.status,
      remarks: rejectionRecord.remarks,
      action_at: rejectionRecord.action_at,
    };
  }

  /**
   * Publish article
   * Changes status from approved to published OR from pending to published (with auto-approval)
   * Sets published_date
   * Only Advisers and Co-Advisers can publish
   * If review_status is pending and article is being published, it automatically approves it
   * @param newsId News article ID
   * @param publisherId User ID (must be Adviser/Co-Adviser)
   * @param forceApprove Optional - if true, will auto-approve pending articles when publishing
   * @returns Promise<void>
   */
  async publishArticle(
    newsId: string,
    publisherId: string,
    forceApprove?: boolean,
  ): Promise<void> {
    const supabase = this.supabaseService.getServiceClient();

    // Check if user can publish
    await this.newsAccessService.requireApprovalPermission(publisherId);

    // Get article with review_status
    const { data: article, error: fetchError } = await supabase
      .from('news')
      .select('status, review_status')
      .eq('id', newsId)
      .maybeSingle();

    if (fetchError || !article) {
      throw new NotFoundException(`Article with ID ${newsId} not found`);
    }

    // Build update payload
    const updatePayload: any = {
      status: 'published',
      published_date: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // If review_status is pending and forceApprove is true, auto-approve it
    if (
      article.review_status === 'pending' &&
      forceApprove &&
      article.status !== 'approved'
    ) {
      updatePayload.review_status = 'approved';
      this.logger.log(
        `Auto-approving article ${newsId} with pending review status`,
      );
    } else if (article.status === 'approved') {
      // If already approved, keep the review_status as approved
      updatePayload.review_status = 'approved';
    }

    // Update article status to published
    const { error: updateError } = await supabase
      .from('news')
      .update(updatePayload)
      .eq('id', newsId);

    if (updateError) {
      this.logger.error('Error publishing article:', updateError);
      throw new BadRequestException(
        `Failed to publish article: ${updateError.message}`,
      );
    }

    this.logger.log(`Article ${newsId} published by ${publisherId}`);

    // Notify author and global audience about publication
    try {
      const { data: articleData } = await supabase
        .from('news')
        .select('title, author_id')
        .eq('id', newsId)
        .single();

      if (articleData) {
        // Notify author
        if (articleData.author_id) {
          await this.notificationService.notifyUser(
            articleData.author_id,
            'Article Published',
            `Your article "${articleData.title}" has been published!`,
            NotificationType.SUCCESS,
            publisherId,
            { expiresInDays: 7 },
          );
        }

        // Global notification for new article
        await this.notificationService.notifyAll(
          `New Article Published: ${articleData.title}`,
          `A new article "${articleData.title}" has been published.`,
          NotificationType.INFO,
          publisherId,
          { expiresInDays: 7 },
        );
      }
    } catch (error) {
      this.logger.warn(
        'Failed to create notifications for article publication:',
        error,
      );
    }
  }

  /**
   * Unpublish article
   * Changes status from published back to draft
   * Only Advisers and Co-Advisers can unpublish
   * @param newsId News article ID
   * @param userId User ID (must be Adviser/Co-Adviser)
   * @returns Promise<void>
   */
  async unpublishArticle(newsId: string, userId: string): Promise<void> {
    const supabase = this.supabaseService.getServiceClient();

    // Check if user can unpublish
    await this.newsAccessService.requireApprovalPermission(userId);

    // Get article
    const { data: article, error: fetchError } = await supabase
      .from('news')
      .select('status')
      .eq('id', newsId)
      .maybeSingle();

    if (fetchError || !article) {
      throw new NotFoundException(`Article with ID ${newsId} not found`);
    }

    // Check current status
    if (article.status !== 'published') {
      throw new BadRequestException(
        `Article is ${article.status}. Only published articles can be unpublished.`,
      );
    }

    // Update article status to draft
    const { error: updateError } = await supabase
      .from('news')
      .update({
        status: 'draft',
        updated_at: new Date().toISOString(),
      })
      .eq('id', newsId);

    if (updateError) {
      this.logger.error('Error unpublishing article:', updateError);
      throw new BadRequestException(
        `Failed to unpublish article: ${updateError.message}`,
      );
    }

    this.logger.log(`Article ${newsId} unpublished by ${userId}`);
  }

  /**
   * Get approval history for an article
   * @param newsId News article ID
   * @returns Promise<NewsApproval[]>
   */
  async getApprovalHistory(newsId: string): Promise<NewsApproval[]> {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('news_approval')
      .select(
        `
        *,
        approver:users!news_approval_approver_id_fkey(id, full_name, email)
      `,
      )
      .eq('news_id', newsId)
      .order('action_at', { ascending: false });

    if (error) {
      this.logger.error('Error fetching approval history:', error);
      throw new BadRequestException(
        `Failed to fetch approval history: ${error.message}`,
      );
    }

    return data.map((record) => ({
      id: record.id,
      news_id: record.news_id,
      approver_id: record.approver_id,
      status: record.status,
      remarks: record.remarks,
      action_at: record.action_at,
      approver: record.approver,
    }));
  }

  /**
   * Get all pending articles (for Advisers)
   * @returns Promise<any[]>
   */
  async getPendingArticles(): Promise<any[]> {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('news')
      .select(
        `
        *,
        author:users!news_author_id_fkey(id, full_name, email),
        category:news_categories(id, name, slug)
      `,
      )
      .eq('status', 'pending_approval')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      this.logger.error('Error fetching pending articles:', error);
      throw new BadRequestException(
        `Failed to fetch pending articles: ${error.message}`,
      );
    }

    return data;
  }
}
