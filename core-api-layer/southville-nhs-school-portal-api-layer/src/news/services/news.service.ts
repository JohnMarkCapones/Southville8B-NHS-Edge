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
      domain_id: dbRecord.domain_id,
      article_json: dbRecord.article_json,
      article_html: dbRecord.article_html,
      description: dbRecord.description,
      featured_image_url: dbRecord.featured_image_url,
      r2_featured_image_key: dbRecord.r2_featured_image_key,
      category_id: dbRecord.category_id,
      status: dbRecord.status,
      visibility: dbRecord.visibility,
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

    // Get journalism domain ID
    const domainId = await this.getJournalismDomainId();

    // Generate slug from title
    const slug = this.generateSlug(createDto.title);

    // Check if slug already exists
    const { data: existing } = await supabase
      .from('news')
      .select('id')
      .eq('slug', slug)
      .is('deleted_at', null)
      .maybeSingle();

    if (existing) {
      throw new ConflictException(
        `An article with similar title already exists. Please use a different title.`,
      );
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
        domain_id: domainId,
        article_json: createDto.articleJson,
        article_html: createDto.articleHtml,
        description: description,
        featured_image_url: featuredImageUrl,
        r2_featured_image_key: createDto.r2FeaturedImageKey || null,
        category_id: createDto.categoryId || null,
        visibility: createDto.visibility || 'public',
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
    if (createDto.coAuthorIds && createDto.coAuthorIds.length > 0) {
      try {
        await this.addCoAuthorsInternal(
          article.id,
          createDto.coAuthorIds,
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
        updatePayload.featured_image_url =
          this.newsImageService.validateAndGetFeaturedImage(
            current.featured_image_url,
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
      updatePayload.featured_image_url = updateDto.featuredImageUrl;
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

    if (updateDto.scheduledDate !== undefined) {
      updatePayload.scheduled_date = updateDto.scheduledDate;
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
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

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
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
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
          id, role,
          user:users!news_co_authors_co_author_user_id_fkey(id, full_name, email)
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
          id, role,
          user:users!news_co_authors_co_author_user_id_fkey(id, full_name, email)
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
    userIds: string[],
    addedBy: string,
  ): Promise<void> {
    const supabase = this.supabaseService.getServiceClient();

    // Verify all users are journalism members
    for (const userId of userIds) {
      const isMember =
        await this.newsAccessService.isJournalismMember(userId);
      if (!isMember) {
        throw new BadRequestException(
          `User ${userId} is not a journalism team member`,
        );
      }
    }

    // Insert co-authors
    const coAuthors = userIds.map((userId) => ({
      news_id: newsId,
      user_id: userId,
      role: 'co-author',
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

    // Verify co-author is journalism member
    const isMember = await this.newsAccessService.isJournalismMember(
      addCoAuthorDto.userId,
    );
    if (!isMember) {
      throw new BadRequestException(
        'Co-author must be a journalism team member',
      );
    }

    // Add co-author
    const { error } = await supabase
      .from('news_co_authors')
      .insert({
        news_id: newsId,
        user_id: addCoAuthorDto.userId,
        role: addCoAuthorDto.role || 'co-author',
        added_by: userId,
      })
      .select();

    if (error) {
      if (error.code === '23505') {
        throw new ConflictException('User is already a co-author');
      }
      throw new BadRequestException(
        `Failed to add co-author: ${error.message}`,
      );
    }

    this.logger.log(`Co-author added to article ${newsId}: ${addCoAuthorDto.userId}`);
  }

  /**
   * Remove a co-author from an article
   * @param newsId Article ID
   * @param coAuthorUserId Co-author user ID to remove
   * @param userId User ID (must be author or adviser)
   * @returns Promise<void>
   */
  async removeCoAuthor(
    newsId: string,
    coAuthorUserId: string,
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
      .eq('user_id', coAuthorUserId);

    if (error) {
      throw new BadRequestException(
        `Failed to remove co-author: ${error.message}`,
      );
    }

    this.logger.log(`Co-author removed from article ${newsId}: ${coAuthorUserId}`);
  }

  /**
   * Get user's own articles
   * @param userId User ID
   * @returns Promise<News[]>
   */
  async findMyArticles(userId: string): Promise<News[]> {
    return this.findAll({ authorId: userId });
  }
}
