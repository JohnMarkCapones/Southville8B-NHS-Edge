import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { NewsAccessService } from './news-access.service';
import { NewsImageService } from './news-image.service';
import { TagsService } from './tags.service';
import { CreateNewsDto, UpdateNewsDto, AddCoAuthorDto } from '../dto';
import { News } from '../entities';

/**
 * Main service for news CRUD operations
 * Handles creating, reading, updating, and deleting news articles
 */
@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly newsAccessService: NewsAccessService,
    private readonly newsImageService: NewsImageService,
    private readonly tagsService: TagsService,
  ) {}

  /**
   * Generate URL-friendly slug from title
   * @param title Article title
   * @returns slug
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * Check if a slug generated from a title already exists
   * @param title Article title
   * @returns Promise<{exists: boolean, slug: string}>
   */
  async checkSlugExists(
    title: string,
  ): Promise<{ exists: boolean; slug: string }> {
    const supabase = this.supabaseService.getServiceClient();
    const slug = this.generateSlug(title);

    const { data: existing } = await supabase
      .from('news')
      .select('id')
      .eq('slug', slug)
      .is('deleted_at', null)
      .maybeSingle();

    return {
      exists: !!existing,
      slug: slug,
    };
  }

  /**
   * Get journalism domain ID
   * @returns Promise<string>
   */
  private async getJournalismDomainId(): Promise<string> {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('domains')
      .select('id')
      .eq('type', 'journalism')
      .maybeSingle();

    if (error || !data) {
      throw new BadRequestException(
        'Journalism domain not found. Please contact administrator.',
      );
    }

    return data.id;
  }

  /**
   * Map database record to DTO
   * @param dbRecord Database record
   * @returns News
   */
  private mapToDto(dbRecord: any): News {
    return {
      id: dbRecord.id,
      title: dbRecord.title,
      slug: dbRecord.slug,
      author_id: dbRecord.author_id,
      author_name: dbRecord.author_name,
      credits: dbRecord.credits,
      domain_id: null, // Column doesn't exist in database
      article_json: dbRecord.article_json,
      article_html: dbRecord.article_html,
      description: dbRecord.description,
      featured_image_url: dbRecord.featured_image,
      r2_featured_image_key: dbRecord.r2_featured_image_key,
      category_id: dbRecord.category_id,
      status: dbRecord.status,
      visibility: dbRecord.visibility,
      review_status: dbRecord.review_status || 'pending', // Default to pending if null
      published_date: dbRecord.published_date,
      scheduled_date: dbRecord.scheduled_date,
      views: dbRecord.views,
      created_at: dbRecord.created_at,
      updated_at: dbRecord.updated_at,
      deleted_at: dbRecord.deleted_at,
      deleted_by: dbRecord.deleted_by,
      // Virtual fields
      author: dbRecord.author,
      domain: dbRecord.domain,
      category: dbRecord.category,
      tags: dbRecord.tags,
      co_authors: dbRecord.co_authors,
      approval_history: dbRecord.approval_history,
    };
  }

  /**
   * Create a new news article
   * @param createDto Create news DTO
   * @param userId User ID (author)
   * @returns Promise<News>
   */
  async create(createDto: CreateNewsDto, userId: string): Promise<News> {
    const supabase = this.supabaseService.getServiceClient();

    // Check if user has publishing position
    await this.newsAccessService.requirePublishingPosition(userId);

    // Generate slug from title and ensure uniqueness
    let slug = this.generateSlug(createDto.title);
    let counter = 2;

    // Check if slug already exists, if so append number
    while (true) {
      const { data: existing } = await supabase
        .from('news')
        .select('id')
        .eq('slug', slug)
        .is('deleted_at', null)
        .maybeSingle();

      if (!existing) {
        break; // Slug is unique
      }

      // Append counter to make it unique
      slug = `${this.generateSlug(createDto.title)}-${counter}`;
      counter++;
    }

    // Auto-generate description if not provided
    let description = createDto.description;
    if (!description || !description.trim()) {
      description = this.newsImageService.generateDescriptionFromHtml(
        createDto.articleHtml,
        500,
      );
      this.logger.debug('Auto-generated description from article HTML');
    }

    // Validate and get featured image
    const featuredImageUrl = this.newsImageService.validateAndGetFeaturedImage(
      createDto.featuredImageUrl,
      createDto.articleHtml,
    );

    // Create article
    const { data: article, error: createError } = await supabase
      .from('news')
      .insert({
        title: createDto.title,
        slug: slug,
        author_id: userId,
        author_name: createDto.authorName || null,
        credits: createDto.credits || null,
        article_json: createDto.articleJson,
        article_html: createDto.articleHtml,
        description: description,
        featured_image: featuredImageUrl || null,
        r2_featured_image_key: createDto.r2FeaturedImageKey || null,
        category_id: createDto.categoryId || null,
        visibility: createDto.visibility || 'public',
        review_status: createDto.reviewStatus || 'pending',
        scheduled_date: createDto.scheduledDate || null,
        status: 'draft',
      })
      .select()
      .single();

    if (createError) {
      this.logger.error('Error creating article:', createError);
      throw new BadRequestException(
        `Failed to create article: ${createError.message}`,
      );
    }

    this.logger.log(`Article created: ${article.id} by user ${userId}`);

    // Handle tags if provided
    if (createDto.tags && createDto.tags.length > 0) {
      try {
        await this.tagsService.updateNewsTags(article.id, createDto.tags);
      } catch (error) {
        this.logger.error('Error adding tags:', error);
        // Don't fail article creation if tags fail
      }
    }

    // Handle co-authors if provided
    if (createDto.coAuthorNames && createDto.coAuthorNames.length > 0) {
      try {
        await this.addCoAuthorsInternal(
          article.id,
          createDto.coAuthorNames,
          userId,
        );
      } catch (error) {
        this.logger.error('Error adding co-authors:', error);
        // Don't fail article creation if co-authors fail
      }
    }

    return this.mapToDto(article);
  }

  /**
   * Update an existing article
   * @param newsId Article ID
   * @param updateDto Update news DTO
   * @param userId User ID
   * @returns Promise<News>
   */
  async update(
    newsId: string,
    updateDto: UpdateNewsDto,
    userId: string,
  ): Promise<News> {
    const supabase = this.supabaseService.getServiceClient();

    // Check if user can edit this article
    const canEdit = await this.newsAccessService.canEditArticle(userId, newsId);
    if (!canEdit) {
      throw new ForbiddenException('You cannot edit this article');
    }

    // Get current article
    const { data: current, error: fetchError } = await supabase
      .from('news')
      .select('*')
      .eq('id', newsId)
      .maybeSingle();

    if (fetchError || !current) {
      throw new NotFoundException(`Article with ID ${newsId} not found`);
    }

    // Build update payload
    const updatePayload: any = {
      updated_at: new Date().toISOString(),
    };

    if (updateDto.title) {
      updatePayload.title = updateDto.title;
      updatePayload.slug = this.generateSlug(updateDto.title);

      // Check slug uniqueness
      const { data: slugExists } = await supabase
        .from('news')
        .select('id')
        .eq('slug', updatePayload.slug)
        .neq('id', newsId)
        .is('deleted_at', null)
        .maybeSingle();

      if (slugExists) {
        throw new ConflictException(
          'An article with similar title already exists',
        );
      }
    }

    if (updateDto.articleJson !== undefined) {
      updatePayload.article_json = updateDto.articleJson;
    }

    if (updateDto.articleHtml !== undefined) {
      updatePayload.article_html = updateDto.articleHtml;

      // Re-validate featured image if HTML changed
      if (!updateDto.featuredImageUrl) {
        updatePayload.featured_image =
          this.newsImageService.validateAndGetFeaturedImage(
            current.featured_image,
            updateDto.articleHtml,
          );
      }
    }

    if (updateDto.description !== undefined) {
      updatePayload.description = updateDto.description;
    } else if (updateDto.articleHtml) {
      // Auto-regenerate description if HTML changed but description not provided
      updatePayload.description =
        this.newsImageService.generateDescriptionFromHtml(
          updateDto.articleHtml,
          500,
        );
    }

    if (updateDto.featuredImageUrl !== undefined) {
      updatePayload.featured_image = updateDto.featuredImageUrl;
    }

    if (updateDto.r2FeaturedImageKey !== undefined) {
      updatePayload.r2_featured_image_key = updateDto.r2FeaturedImageKey;
    }

    if (updateDto.categoryId !== undefined) {
      updatePayload.category_id = updateDto.categoryId;
    }

    if (updateDto.visibility !== undefined) {
      updatePayload.visibility = updateDto.visibility;
    }

    if (updateDto.reviewStatus !== undefined) {
      updatePayload.review_status = updateDto.reviewStatus;
    }

    if (updateDto.scheduledDate !== undefined) {
      updatePayload.scheduled_date = updateDto.scheduledDate;
    }

    if (updateDto.authorName !== undefined) {
      updatePayload.author_name = updateDto.authorName;
    }

    if (updateDto.credits !== undefined) {
      updatePayload.credits = updateDto.credits;
    }

    // Update article
    const { data: updated, error: updateError } = await supabase
      .from('news')
      .update(updatePayload)
      .eq('id', newsId)
      .select()
      .single();

    if (updateError) {
      this.logger.error('Error updating article:', updateError);
      throw new BadRequestException(
        `Failed to update article: ${updateError.message}`,
      );
    }

    this.logger.log(`Article updated: ${newsId} by user ${userId}`);

    // Update tags if provided
    if (updateDto.tags !== undefined) {
      try {
        await this.tagsService.updateNewsTags(newsId, updateDto.tags);
      } catch (error) {
        this.logger.error('Error updating tags:', error);
      }
    }

    return this.mapToDto(updated);
  }

  /**
   * Soft delete an article
   * Only drafts can be deleted
   * @param newsId Article ID
   * @param userId User ID
   * @returns Promise<void>
   */
  async remove(newsId: string, userId: string): Promise<void> {
    const supabase = this.supabaseService.getServiceClient();

    // Check if user can delete this article
    const canDelete = await this.newsAccessService.canDeleteArticle(
      userId,
      newsId,
    );

    if (!canDelete) {
      throw new ForbiddenException(
        'You cannot delete this article. Only draft articles can be deleted.',
      );
    }

    // Soft delete
    const { error } = await supabase
      .from('news')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: userId,
      })
      .eq('id', newsId);

    if (error) {
      this.logger.error('Error deleting article:', error);
      throw new BadRequestException(
        `Failed to delete article: ${error.message}`,
      );
    }

    this.logger.log(`Article deleted: ${newsId} by user ${userId}`);
  }

  /**
   * Restore a soft-deleted article by clearing deleted_at and deleted_by
   * Admins only (guarded at controller level)
   * @param newsId Article ID
   * @param userId Admin user ID (for logging/audit)
   */
  async restore(newsId: string, userId: string): Promise<News> {
    const supabase = this.supabaseService.getServiceClient();

    // Ensure the record exists (even if deleted)
    const { data: existing, error: fetchError } = await supabase
      .from('news')
      .select('*')
      .eq('id', newsId)
      .maybeSingle();

    if (fetchError || !existing) {
      throw new NotFoundException(`Article with ID ${newsId} not found`);
    }

    // Clear deleted fields
    const { data, error } = await supabase
      .from('news')
      .update({
        deleted_at: null,
        deleted_by: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', newsId)
      .select()
      .single();

    if (error) {
      this.logger.error('Error restoring article:', error);
      throw new BadRequestException(
        `Failed to restore article: ${error.message}`,
      );
    }

    this.logger.log(`Article restored: ${newsId} by admin ${userId}`);
    return this.mapToDto(data);
  }

  /**
   * Admin-only: Quick update article status
   * Bypasses normal DTO validation for admin operations
   * @param newsId Article ID
   * @param status New status
   * @param userId Admin user ID
   * @returns Promise<News>
   */
  async updateStatus(
    newsId: string,
    status: string,
    userId: string,
  ): Promise<News> {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('news')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', newsId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(
        `Failed to update status: ${error.message}`,
      );
    }

    this.logger.log(
      `Article status updated: ${newsId} to ${status} by ${userId}`,
    );
    return this.mapToDto(data);
  }

  /**
   * Admin-only: Quick update article visibility
   * @param newsId Article ID
   * @param visibility New visibility
   * @param userId Admin user ID
   * @returns Promise<News>
   */
  async updateVisibility(
    newsId: string,
    visibility: string,
    userId: string,
  ): Promise<News> {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('news')
      .update({ visibility, updated_at: new Date().toISOString() })
      .eq('id', newsId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(
        `Failed to update visibility: ${error.message}`,
      );
    }

    this.logger.log(
      `Article visibility updated: ${newsId} to ${visibility} by ${userId}`,
    );
    return this.mapToDto(data);
  }

  /**
   * Admin-only: Update featured image
   * @param newsId Article ID
   * @param featuredImageUrl New featured image URL (or null to remove)
   * @param userId Admin user ID
   * @returns Promise<News>
   */
  async updateFeaturedImage(
    newsId: string,
    featuredImageUrl: string | null,
    userId: string,
  ): Promise<News> {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('news')
      .update({
        featured_image: featuredImageUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', newsId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(
        `Failed to update featured image: ${error.message}`,
      );
    }

    this.logger.log(`Article featured image updated: ${newsId} by ${userId}`);
    return this.mapToDto(data);
  }

  /**
   * Get all articles with filters
   * @param filters Query filters
   * @returns Promise<News[]>
   */
  async findAll(filters?: {
    status?: string;
    visibility?: string;
    categoryId?: string;
    authorId?: string;
    limit?: number;
    offset?: number;
    includeDeleted?: boolean;
  }): Promise<News[]> {
    const supabase = this.supabaseService.getServiceClient();

    let query = supabase
      .from('news')
      .select(
        `
        *,
        author:users!news_author_id_fkey(id, full_name, email),
        category:news_categories(id, name, slug)
      `,
      )
      .order('created_at', { ascending: false });

    // Filter by deleted status
    if (filters?.includeDeleted) {
      // Only show deleted articles (archived)
      query = query.not('deleted_at', 'is', null);
    } else {
      // Only show active articles (not deleted)
      query = query.is('deleted_at', null);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.visibility) {
      query = query.eq('visibility', filters.visibility);
    }

    if (filters?.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }

    if (filters?.authorId) {
      query = query.eq('author_id', filters.authorId);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit || 20) - 1,
      );
    }

    const { data, error } = await query;

    if (error) {
      this.logger.error('Error fetching articles:', error);
      throw new BadRequestException('Failed to fetch articles');
    }

    return data.map((article) => this.mapToDto(article));
  }

  /**
   * Get article by ID
   * @param id Article ID
   * @returns Promise<News>
   */
  async findOne(id: string): Promise<News> {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('news')
      .select(
        `
        *,
        author:users!news_author_id_fkey(id, full_name, email),
        category:news_categories(id, name, slug),
        tags:news_tags(tag:tags(id, name, slug)),
        co_authors:news_co_authors(
          id, co_author_name, role
        )
      `,
      )
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error || !data) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }

    return this.mapToDto(data);
  }

  /**
   * Get article by slug
   * @param slug Article slug
   * @returns Promise<News>
   */
  async findBySlug(slug: string): Promise<News> {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('news')
      .select(
        `
        *,
        author:users!news_author_id_fkey(id, full_name, email),
        category:news_categories(id, name, slug),
        tags:news_tags(tag:tags(id, name, slug)),
        co_authors:news_co_authors(
          id, co_author_name, role
        )
      `,
      )
      .eq('slug', slug)
      .is('deleted_at', null)
      .maybeSingle();

    if (error || !data) {
      throw new NotFoundException(`Article with slug "${slug}" not found`);
    }

    // Increment view count
    await this.incrementViews(data.id);

    return this.mapToDto(data);
  }

  /**
   * Find article by slug for public access (simplified query)
   * @param slug Article slug
   * @returns Promise<News>
   */
  async findBySlugPublic(slug: string): Promise<News> {
    const supabase = this.supabaseService.getServiceClient();

    // Use a simpler query for public access to avoid complex joins
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .eq('visibility', 'public')
      .is('deleted_at', null)
      .maybeSingle();

    if (error || !data) {
      throw new NotFoundException(`Article with slug "${slug}" not found`);
    }

    // Increment view count
    await this.incrementViews(data.id);

    return this.mapToDto(data);
  }

  /**
   * Find article by ID for public access (no authentication required)
   * @param id Article ID
   * @returns Promise<News>
   */
  async findOnePublic(id: string): Promise<News> {
    const supabase = this.supabaseService.getServiceClient();

    // Use service client to bypass RLS for public access
    // Removed status and visibility restrictions to allow viewing/editing all articles
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) {
      this.logger.error(`Error fetching article ${id}:`, error);
      throw new NotFoundException(`Article with ID ${id} not found`);
    }

    if (!data) {
      this.logger.warn(`Article ${id} not found or has been deleted`);
      throw new NotFoundException(`Article with ID ${id} not found`);
    }

    this.logger.log(`Article ${id} found successfully`);

    // Increment view count
    await this.incrementViews(data.id);

    return this.mapToDto(data);
  }

  /**
   * Increment article view count
   * @param newsId Article ID
   * @returns Promise<void>
   */
  private async incrementViews(newsId: string): Promise<void> {
    const supabase = this.supabaseService.getServiceClient();

    await supabase.rpc('increment_news_views', { news_id: newsId });

    // Note: You'll need to create this function in Supabase:
    // CREATE OR REPLACE FUNCTION increment_news_views(news_id uuid)
    // RETURNS void AS $$
    // BEGIN
    //   UPDATE news SET views = views + 1 WHERE id = news_id;
    // END;
    // $$ LANGUAGE plpgsql;
  }

  /**
   * Add co-authors to an article (internal helper)
   * @param newsId Article ID
   * @param userIds Co-author user IDs
   * @param addedBy User ID of person adding co-authors
   * @returns Promise<void>
   */
  private async addCoAuthorsInternal(
    newsId: string,
    coAuthorNames: string[],
    addedBy: string,
  ): Promise<void> {
    const supabase = this.supabaseService.getServiceClient();

    // Insert co-authors (names, not user IDs)
    const coAuthors = coAuthorNames.map((name) => ({
      news_id: newsId,
      co_author_name: name.trim(),
      added_by: addedBy,
    }));

    const { error } = await supabase
      .from('news_co_authors')
      .insert(coAuthors)
      .select();

    if (error) {
      // Ignore duplicate errors
      if (error.code !== '23505') {
        throw new BadRequestException(
          `Failed to add co-authors: ${error.message}`,
        );
      }
    }
  }

  /**
   * Add a co-author to an article
   * @param newsId Article ID
   * @param addCoAuthorDto Co-author data
   * @param userId User ID (must be author or adviser)
   * @returns Promise<void>
   */
  async addCoAuthor(
    newsId: string,
    addCoAuthorDto: AddCoAuthorDto,
    userId: string,
  ): Promise<void> {
    const supabase = this.supabaseService.getServiceClient();

    // Get article
    const { data: article } = await supabase
      .from('news')
      .select('author_id')
      .eq('id', newsId)
      .maybeSingle();

    if (!article) {
      throw new NotFoundException(`Article with ID ${newsId} not found`);
    }

    // Check if user is author or can edit article
    const canEdit = await this.newsAccessService.canEditArticle(userId, newsId);
    if (!canEdit) {
      throw new ForbiddenException('You cannot add co-authors to this article');
    }

    // Add co-author (no need to verify journalism membership since it's now free text)
    const { error } = await supabase
      .from('news_co_authors')
      .insert({
        news_id: newsId,
        co_author_name: addCoAuthorDto.coAuthorName.trim(),
        role: addCoAuthorDto.role || 'co-author',
        added_by: userId,
      })
      .select();

    if (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          'This co-author is already added to the article',
        );
      }
      throw new BadRequestException(
        `Failed to add co-author: ${error.message}`,
      );
    }

    this.logger.log(
      `Co-author added to article ${newsId}: ${addCoAuthorDto.coAuthorName}`,
    );
  }

  /**
   * Remove a co-author from an article
   * @param newsId Article ID
   * @param coAuthorName Co-author name to remove
   * @param userId User ID (must be author or adviser)
   * @returns Promise<void>
   */
  async removeCoAuthor(
    newsId: string,
    coAuthorName: string,
    userId: string,
  ): Promise<void> {
    const supabase = this.supabaseService.getServiceClient();

    // Check if user can edit article
    const canEdit = await this.newsAccessService.canEditArticle(userId, newsId);
    if (!canEdit) {
      throw new ForbiddenException(
        'You cannot remove co-authors from this article',
      );
    }

    // Remove co-author
    const { error } = await supabase
      .from('news_co_authors')
      .delete()
      .eq('news_id', newsId)
      .eq('co_author_name', coAuthorName);

    if (error) {
      throw new BadRequestException(
        `Failed to remove co-author: ${error.message}`,
      );
    }

    this.logger.log(
      `Co-author removed from article ${newsId}: ${coAuthorName}`,
    );
  }

  /**
   * Get user's own articles
   * @param userId User ID
   * @returns Promise<News[]>
   */
  async findMyArticles(userId: string): Promise<News[]> {
    return this.findAll({ authorId: userId });
  }

  /**
   * Get KPI statistics for news articles
   * Can be filtered by author or show all (for admins/teachers reviewing articles)
   * @param userId Optional user ID to filter by author
   * @returns Promise with counts for different review statuses and total published
   */
  async getNewsStats(userId?: string): Promise<{
    pendingReview: number;
    published: number;
    needsRevision: number;
    approved: number;
    rejected: number;
    draft: number;
    total: number;
    studentSubmissions: number;
  }> {
    const supabase = this.supabaseService.getServiceClient();

    // Build query to get all news articles
    let query = supabase
      .from('news')
      .select('review_status, status, author_id')
      .is('deleted_at', null);

    // Filter by author if userId provided (for teachers viewing their own stats)
    if (userId) {
      query = query.eq('author_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      this.logger.error('Error fetching news stats:', error);
      throw new BadRequestException('Failed to fetch news statistics');
    }

    // Count by review_status
    const pendingReview =
      data?.filter(
        (item) =>
          item.review_status === 'pending' ||
          item.review_status === 'in_review',
      ).length || 0;

    const needsRevision =
      data?.filter((item) => item.review_status === 'needs_revision').length ||
      0;

    const approved =
      data?.filter((item) => item.review_status === 'approved').length || 0;

    const rejected =
      data?.filter((item) => item.review_status === 'rejected').length || 0;

    // Count by status
    const published =
      data?.filter((item) => item.status === 'published').length || 0;

    const draft = data?.filter((item) => item.status === 'draft').length || 0;

    // Total is simply the length of data array
    const total = data?.length || 0;

    // Get student submissions count by querying users table separately
    let studentSubmissions = 0;
    if (data && data.length > 0) {
      const authorIds = data.map((item) => item.author_id);
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id')
        .in('id', authorIds)
        .eq('role', 'Student');

      if (!usersError && users) {
        const studentIds = new Set(users.map((u) => u.id));
        studentSubmissions = data.filter((item) =>
          studentIds.has(item.author_id),
        ).length;
      }
    }

    return {
      pendingReview,
      published,
      needsRevision,
      approved,
      rejected,
      draft,
      total,
      studentSubmissions,
    };
  }
}
