import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateReviewCommentDto, UpdateReviewCommentDto } from '../dto';
import { NewsReviewComment } from '../entities';

/**
 * Service for managing news review comments
 * Handles CRUD operations for feedback/review comments on news articles
 */
@Injectable()
export class NewsReviewCommentsService {
  private readonly logger = new Logger(NewsReviewCommentsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Get all review comments for a news article
   * @param newsId News article ID
   * @returns Promise<NewsReviewComment[]>
   */
  async getCommentsByNewsId(newsId: string): Promise<NewsReviewComment[]> {
    // Use service client to bypass RLS for joins
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('news_review_comments')
      .select(
        `
        *,
        reviewer:reviewer_id(
          id,
          full_name,
          email
        )
      `,
      )
      .eq('news_id', newsId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true });

    if (error) {
      this.logger.error('Error fetching review comments:', error);
      throw new BadRequestException(
        `Failed to fetch review comments: ${error.message}`,
      );
    }

    this.logger.debug('Review comments data:', JSON.stringify(data, null, 2));
    return data || [];
  }

  /**
   * Create a new review comment
   * @param newsId News article ID
   * @param reviewerId User ID of the reviewer
   * @param createDto Comment data
   * @returns Promise<NewsReviewComment>
   */
  async createComment(
    newsId: string,
    reviewerId: string,
    createDto: CreateReviewCommentDto,
  ): Promise<NewsReviewComment> {
    const supabase = this.supabaseService.getServiceClient();

    // Check if news article exists
    const { data: newsExists, error: newsError } = await supabase
      .from('news')
      .select('id')
      .eq('id', newsId)
      .is('deleted_at', null)
      .maybeSingle();

    if (newsError || !newsExists) {
      throw new NotFoundException(`News article with ID ${newsId} not found`);
    }

    // Create review comment
    const { data, error } = await supabase
      .from('news_review_comments')
      .insert({
        news_id: newsId,
        reviewer_id: reviewerId,
        comment: createDto.comment,
      })
      .select(
        `
        *,
        reviewer:reviewer_id(
          id,
          full_name,
          email
        )
      `,
      )
      .single();

    if (error) {
      this.logger.error('Error creating review comment:', error);
      throw new BadRequestException(
        `Failed to create review comment: ${error.message}`,
      );
    }

    this.logger.log(
      `Review comment created for news ${newsId} by user ${reviewerId}`,
    );
    return data;
  }

  /**
   * Update a review comment
   * @param commentId Comment ID
   * @param userId User ID (must be comment owner)
   * @param updateDto Updated comment data
   * @returns Promise<NewsReviewComment>
   */
  async updateComment(
    commentId: string,
    userId: string,
    updateDto: UpdateReviewCommentDto,
  ): Promise<NewsReviewComment> {
    const supabase = this.supabaseService.getServiceClient();

    // Check if comment exists and user owns it
    const { data: existing, error: fetchError } = await supabase
      .from('news_review_comments')
      .select('reviewer_id')
      .eq('id', commentId)
      .is('deleted_at', null)
      .maybeSingle();

    if (fetchError || !existing) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    if (existing.reviewer_id !== userId) {
      throw new ForbiddenException('You can only update your own comments');
    }

    // Update comment
    const { data, error } = await supabase
      .from('news_review_comments')
      .update({
        comment: updateDto.comment,
      })
      .eq('id', commentId)
      .select(
        `
        *,
        reviewer:reviewer_id(
          id,
          full_name,
          email
        )
      `,
      )
      .single();

    if (error) {
      this.logger.error('Error updating review comment:', error);
      throw new BadRequestException(
        `Failed to update review comment: ${error.message}`,
      );
    }

    this.logger.log(`Review comment ${commentId} updated by user ${userId}`);
    return data;
  }

  /**
   * Soft delete a review comment
   * @param commentId Comment ID
   * @param userId User ID (must be comment owner or admin)
   * @returns Promise<void>
   */
  async deleteComment(commentId: string, userId: string): Promise<void> {
    const supabase = this.supabaseService.getServiceClient();

    // Check if comment exists and user owns it
    const { data: existing, error: fetchError } = await supabase
      .from('news_review_comments')
      .select('reviewer_id')
      .eq('id', commentId)
      .is('deleted_at', null)
      .maybeSingle();

    if (fetchError || !existing) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    // Check if user owns the comment or is admin
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (userError) {
      throw new BadRequestException('Failed to verify user permissions');
    }

    const isOwner = existing.reviewer_id === userId;
    const isAdmin = ['admin', 'superadmin'].includes(user.role);

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    // Soft delete
    const { error } = await supabase
      .from('news_review_comments')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: userId,
      })
      .eq('id', commentId);

    if (error) {
      this.logger.error('Error deleting review comment:', error);
      throw new BadRequestException(
        `Failed to delete review comment: ${error.message}`,
      );
    }

    this.logger.log(`Review comment ${commentId} deleted by user ${userId}`);
  }
}
