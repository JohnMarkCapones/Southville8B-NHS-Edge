import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

/**
 * Service for checking journalism membership and permissions
 * Handles all access control logic for the news module
 */
@Injectable()
export class NewsAccessService {
  private readonly logger = new Logger(NewsAccessService.name);

  // Positions that can create/submit articles
  private readonly PUBLISHING_POSITIONS = [
    'Adviser',
    'Co-Adviser',
    'Editor-in-Chief',
    'Co-Editor-in-Chief',
    'Publisher',
    'Writer',
  ];

  // Positions that can approve articles (Teachers only)
  private readonly APPROVER_POSITIONS = ['Adviser', 'Co-Adviser'];

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Get the journalism domain ID
   * @returns Promise<string | null>
   */
  private async getJournalismDomainId(): Promise<string | null> {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('domains')
      .select('id')
      .eq('type', 'journalism')
      .maybeSingle();

    if (error) {
      this.logger.error('Error fetching journalism domain:', error);
      return null;
    }

    return data?.id || null;
  }

  /**
   * Check if user is a member of journalism team
   * @param userId User ID
   * @returns Promise<boolean>
   */
  async isJournalismMember(userId: string): Promise<boolean> {
    const supabase = this.supabaseService.getServiceClient();
    const domainId = await this.getJournalismDomainId();

    if (!domainId) {
      this.logger.warn('Journalism domain not found');
      return false;
    }

    // Check if user has any role in journalism domain
    const { data, error } = await supabase
      .from('user_domain_roles')
      .select(
        `
        id,
        domain_roles!inner(
          domain_id
        )
      `,
      )
      .eq('user_id', userId)
      .eq('domain_roles.domain_id', domainId)
      .limit(1);

    if (error) {
      this.logger.error('Error checking journalism membership:', error);
      return false;
    }

    return data && data.length > 0;
  }

  /**
   * Get user's journalism position name
   * @param userId User ID
   * @returns Promise<string | null>
   */
  async getJournalismPosition(userId: string): Promise<string | null> {
    const supabase = this.supabaseService.getServiceClient();
    const domainId = await this.getJournalismDomainId();

    if (!domainId) return null;

    // Get user's domain role in journalism
    const { data, error } = await supabase
      .from('user_domain_roles')
      .select(
        `
        id,
        domain_roles!inner(
          domain_id,
          name
        )
      `,
      )
      .eq('user_id', userId)
      .eq('domain_roles.domain_id', domainId)
      .maybeSingle();

    if (error || !data) {
      this.logger.debug(`No journalism position found for user ${userId}`);
      return null;
    }

    // domain_roles.name matches the position name
    // TypeScript workaround: domain_roles is an object, not an array
    const domainRoles = data.domain_roles as any;
    return domainRoles?.name || null;
  }

  /**
   * Check if user has a publishing position
   * (Writer, Publisher, EIC, Co-EIC, Adviser, Co-Adviser)
   * @param userId User ID
   * @returns Promise<boolean>
   */
  async canPublishNews(userId: string): Promise<boolean> {
    const position = await this.getJournalismPosition(userId);

    if (!position) {
      this.logger.debug(`User ${userId} has no journalism position`);
      return false;
    }

    const canPublish = this.PUBLISHING_POSITIONS.includes(position);
    this.logger.debug(
      `User ${userId} has position ${position}, can publish: ${canPublish}`,
    );

    return canPublish;
  }

  /**
   * Check if user can approve articles
   * Only Adviser and Co-Adviser (Teachers) can approve
   * @param userId User ID
   * @returns Promise<boolean>
   */
  async canApproveNews(userId: string): Promise<boolean> {
    const position = await this.getJournalismPosition(userId);

    if (!position) {
      return false;
    }

    const canApprove = this.APPROVER_POSITIONS.includes(position);
    this.logger.debug(
      `User ${userId} has position ${position}, can approve: ${canApprove}`,
    );

    return canApprove;
  }

  /**
   * Check if user can edit a specific article
   * Rules:
   * - Author can edit their own drafts/pending articles
   * - Advisers can edit any draft/pending article
   * - Published articles cannot be edited
   * @param userId User ID
   * @param newsId News article ID
   * @returns Promise<boolean>
   */
  async canEditArticle(userId: string, newsId: string): Promise<boolean> {
    const supabase = this.supabaseService.getServiceClient();

    // Get article details
    const { data: article, error } = await supabase
      .from('news')
      .select('author_id, status')
      .eq('id', newsId)
      .maybeSingle();

    if (error || !article) {
      this.logger.warn(`Article ${newsId} not found`);
      return false;
    }

    // Published articles cannot be edited
    if (article.status === 'published' || article.status === 'archived') {
      this.logger.debug(
        `Article ${newsId} is ${article.status}, cannot be edited`,
      );
      return false;
    }

    // Check if user is the author
    if (article.author_id === userId) {
      this.logger.debug(`User ${userId} is author of article ${newsId}`);
      return true;
    }

    // Check if user is Adviser/Co-Adviser (can edit any article)
    const position = await this.getJournalismPosition(userId);
    if (position && this.APPROVER_POSITIONS.includes(position)) {
      this.logger.debug(
        `User ${userId} is ${position}, can edit article ${newsId}`,
      );
      return true;
    }

    return false;
  }

  /**
   * Check if user can delete a specific article
   * Rules:
   * - Author can delete their own drafts
   * - Advisers can delete any draft
   * - Cannot delete pending/approved/published articles
   * @param userId User ID
   * @param newsId News article ID
   * @returns Promise<boolean>
   */
  async canDeleteArticle(userId: string, newsId: string): Promise<boolean> {
    const supabase = this.supabaseService.getServiceClient();

    // Get article details
    const { data: article, error } = await supabase
      .from('news')
      .select('author_id, status')
      .eq('id', newsId)
      .maybeSingle();

    if (error || !article) {
      return false;
    }

    // Can only delete drafts
    if (article.status !== 'draft') {
      this.logger.debug(
        `Article ${newsId} is ${article.status}, cannot be deleted`,
      );
      return false;
    }

    // Check if user is the author
    if (article.author_id === userId) {
      return true;
    }

    // Check if user is Adviser/Co-Adviser
    const position = await this.getJournalismPosition(userId);
    return position !== null && this.APPROVER_POSITIONS.includes(position);
  }

  /**
   * Verify user has journalism membership or throw exception
   * @param userId User ID
   * @throws ForbiddenException if user is not a journalism member
   */
  async requireJournalismMembership(userId: string): Promise<void> {
    const isMember = await this.isJournalismMember(userId);

    if (!isMember) {
      throw new ForbiddenException(
        'You must be a member of the journalism team to perform this action',
      );
    }
  }

  /**
   * Verify user has publishing position or throw exception
   * @param userId User ID
   * @throws ForbiddenException if user cannot publish
   */
  async requirePublishingPosition(userId: string): Promise<void> {
    const canPublish = await this.canPublishNews(userId);

    if (!canPublish) {
      throw new ForbiddenException(
        'You must have a publishing position (Writer, Publisher, Editor-in-Chief, Co-Editor-in-Chief, Adviser, or Co-Adviser) to create articles',
      );
    }
  }

  /**
   * Verify user can approve or throw exception
   * @param userId User ID
   * @throws ForbiddenException if user cannot approve
   */
  async requireApprovalPermission(userId: string): Promise<void> {
    const canApprove = await this.canApproveNews(userId);

    if (!canApprove) {
      throw new ForbiddenException(
        'Only Advisers and Co-Advisers can approve articles',
      );
    }
  }
}
