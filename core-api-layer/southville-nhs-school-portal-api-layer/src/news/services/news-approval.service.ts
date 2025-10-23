import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { NewsAccessService } from './news-access.service';
import { ApproveNewsDto, RejectNewsDto } from '../dto';
import { NewsApproval } from '../entities';

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
   * Changes status from approved to published
   * Sets published_date
   * Only Advisers and Co-Advisers can publish
   * @param newsId News article ID
   * @param publisherId User ID (must be Adviser/Co-Adviser)
   * @returns Promise<void>
   */
  async publishArticle(newsId: string, publisherId: string): Promise<void> {
    const supabase = this.supabaseService.getServiceClient();

    // Check if user can publish
    await this.newsAccessService.requireApprovalPermission(publisherId);

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
    if (article.status !== 'approved') {
      throw new BadRequestException(
        `Article is ${article.status}. Only approved articles can be published.`,
      );
    }

    // Update article status to published
    const { error: updateError } = await supabase
      .from('news')
      .update({
        status: 'published',
        published_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', newsId);

    if (updateError) {
      this.logger.error('Error publishing article:', updateError);
      throw new BadRequestException(
        `Failed to publish article: ${updateError.message}`,
      );
    }

    this.logger.log(`Article ${newsId} published by ${publisherId}`);
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
