"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NewsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
const news_access_service_1 = require("./news-access.service");
const news_image_service_1 = require("./news-image.service");
const tags_service_1 = require("./tags.service");
let NewsService = NewsService_1 = class NewsService {
    supabaseService;
    newsAccessService;
    newsImageService;
    tagsService;
    logger = new common_1.Logger(NewsService_1.name);
    constructor(supabaseService, newsAccessService, newsImageService, tagsService) {
        this.supabaseService = supabaseService;
        this.newsAccessService = newsAccessService;
        this.newsImageService = newsImageService;
        this.tagsService = tagsService;
    }
    generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }
    async getJournalismDomainId() {
        const supabase = this.supabaseService.getServiceClient();
        const { data, error } = await supabase
            .from('domains')
            .select('id')
            .eq('type', 'journalism')
            .maybeSingle();
        if (error || !data) {
            throw new common_1.BadRequestException('Journalism domain not found. Please contact administrator.');
        }
        return data.id;
    }
    mapToDto(dbRecord) {
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
            author: dbRecord.author,
            domain: dbRecord.domain,
            category: dbRecord.category,
            tags: dbRecord.tags,
            co_authors: dbRecord.co_authors,
            approval_history: dbRecord.approval_history,
        };
    }
    async create(createDto, userId) {
        const supabase = this.supabaseService.getServiceClient();
        await this.newsAccessService.requirePublishingPosition(userId);
        const domainId = await this.getJournalismDomainId();
        const slug = this.generateSlug(createDto.title);
        const { data: existing } = await supabase
            .from('news')
            .select('id')
            .eq('slug', slug)
            .is('deleted_at', null)
            .maybeSingle();
        if (existing) {
            throw new common_1.ConflictException(`An article with similar title already exists. Please use a different title.`);
        }
        let description = createDto.description;
        if (!description || !description.trim()) {
            description = this.newsImageService.generateDescriptionFromHtml(createDto.articleHtml, 500);
            this.logger.debug('Auto-generated description from article HTML');
        }
        const featuredImageUrl = this.newsImageService.validateAndGetFeaturedImage(createDto.featuredImageUrl, createDto.articleHtml);
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
            throw new common_1.BadRequestException(`Failed to create article: ${createError.message}`);
        }
        this.logger.log(`Article created: ${article.id} by user ${userId}`);
        if (createDto.tags && createDto.tags.length > 0) {
            try {
                await this.tagsService.updateNewsTags(article.id, createDto.tags);
            }
            catch (error) {
                this.logger.error('Error adding tags:', error);
            }
        }
        if (createDto.coAuthorIds && createDto.coAuthorIds.length > 0) {
            try {
                await this.addCoAuthorsInternal(article.id, createDto.coAuthorIds, userId);
            }
            catch (error) {
                this.logger.error('Error adding co-authors:', error);
            }
        }
        return this.mapToDto(article);
    }
    async update(newsId, updateDto, userId) {
        const supabase = this.supabaseService.getServiceClient();
        const canEdit = await this.newsAccessService.canEditArticle(userId, newsId);
        if (!canEdit) {
            throw new common_1.ForbiddenException('You cannot edit this article');
        }
        const { data: current, error: fetchError } = await supabase
            .from('news')
            .select('*')
            .eq('id', newsId)
            .maybeSingle();
        if (fetchError || !current) {
            throw new common_1.NotFoundException(`Article with ID ${newsId} not found`);
        }
        const updatePayload = {
            updated_at: new Date().toISOString(),
        };
        if (updateDto.title) {
            updatePayload.title = updateDto.title;
            updatePayload.slug = this.generateSlug(updateDto.title);
            const { data: slugExists } = await supabase
                .from('news')
                .select('id')
                .eq('slug', updatePayload.slug)
                .neq('id', newsId)
                .is('deleted_at', null)
                .maybeSingle();
            if (slugExists) {
                throw new common_1.ConflictException('An article with similar title already exists');
            }
        }
        if (updateDto.articleJson !== undefined) {
            updatePayload.article_json = updateDto.articleJson;
        }
        if (updateDto.articleHtml !== undefined) {
            updatePayload.article_html = updateDto.articleHtml;
            if (!updateDto.featuredImageUrl) {
                updatePayload.featured_image_url =
                    this.newsImageService.validateAndGetFeaturedImage(current.featured_image_url, updateDto.articleHtml);
            }
        }
        if (updateDto.description !== undefined) {
            updatePayload.description = updateDto.description;
        }
        else if (updateDto.articleHtml) {
            updatePayload.description =
                this.newsImageService.generateDescriptionFromHtml(updateDto.articleHtml, 500);
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
        const { data: updated, error: updateError } = await supabase
            .from('news')
            .update(updatePayload)
            .eq('id', newsId)
            .select()
            .single();
        if (updateError) {
            this.logger.error('Error updating article:', updateError);
            throw new common_1.BadRequestException(`Failed to update article: ${updateError.message}`);
        }
        this.logger.log(`Article updated: ${newsId} by user ${userId}`);
        if (updateDto.tags !== undefined) {
            try {
                await this.tagsService.updateNewsTags(newsId, updateDto.tags);
            }
            catch (error) {
                this.logger.error('Error updating tags:', error);
            }
        }
        return this.mapToDto(updated);
    }
    async remove(newsId, userId) {
        const supabase = this.supabaseService.getServiceClient();
        const canDelete = await this.newsAccessService.canDeleteArticle(userId, newsId);
        if (!canDelete) {
            throw new common_1.ForbiddenException('You cannot delete this article. Only draft articles can be deleted.');
        }
        const { error } = await supabase
            .from('news')
            .update({
            deleted_at: new Date().toISOString(),
            deleted_by: userId,
        })
            .eq('id', newsId);
        if (error) {
            this.logger.error('Error deleting article:', error);
            throw new common_1.BadRequestException(`Failed to delete article: ${error.message}`);
        }
        this.logger.log(`Article deleted: ${newsId} by user ${userId}`);
    }
    async findAll(filters) {
        const supabase = this.supabaseService.getServiceClient();
        let query = supabase
            .from('news')
            .select(`
        *,
        author:users!news_author_id_fkey(id, full_name, email),
        category:news_categories(id, name, slug)
      `)
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
            throw new common_1.BadRequestException('Failed to fetch articles');
        }
        return data.map((article) => this.mapToDto(article));
    }
    async findOne(id) {
        const supabase = this.supabaseService.getServiceClient();
        const { data, error } = await supabase
            .from('news')
            .select(`
        *,
        author:users!news_author_id_fkey(id, full_name, email),
        category:news_categories(id, name, slug),
        tags:news_tags(tag:tags(id, name, slug)),
        co_authors:news_co_authors(
          id, role,
          user:users!news_co_authors_co_author_user_id_fkey(id, full_name, email)
        )
      `)
            .eq('id', id)
            .is('deleted_at', null)
            .maybeSingle();
        if (error || !data) {
            throw new common_1.NotFoundException(`Article with ID ${id} not found`);
        }
        return this.mapToDto(data);
    }
    async findBySlug(slug) {
        const supabase = this.supabaseService.getServiceClient();
        const { data, error } = await supabase
            .from('news')
            .select(`
        *,
        author:users!news_author_id_fkey(id, full_name, email),
        category:news_categories(id, name, slug),
        tags:news_tags(tag:tags(id, name, slug)),
        co_authors:news_co_authors(
          id, role,
          user:users!news_co_authors_co_author_user_id_fkey(id, full_name, email)
        )
      `)
            .eq('slug', slug)
            .is('deleted_at', null)
            .maybeSingle();
        if (error || !data) {
            throw new common_1.NotFoundException(`Article with slug "${slug}" not found`);
        }
        await this.incrementViews(data.id);
        return this.mapToDto(data);
    }
    async incrementViews(newsId) {
        const supabase = this.supabaseService.getServiceClient();
        await supabase.rpc('increment_news_views', { news_id: newsId });
    }
    async addCoAuthorsInternal(newsId, userIds, addedBy) {
        const supabase = this.supabaseService.getServiceClient();
        for (const userId of userIds) {
            const isMember = await this.newsAccessService.isJournalismMember(userId);
            if (!isMember) {
                throw new common_1.BadRequestException(`User ${userId} is not a journalism team member`);
            }
        }
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
            if (error.code !== '23505') {
                throw new common_1.BadRequestException(`Failed to add co-authors: ${error.message}`);
            }
        }
    }
    async addCoAuthor(newsId, addCoAuthorDto, userId) {
        const supabase = this.supabaseService.getServiceClient();
        const { data: article } = await supabase
            .from('news')
            .select('author_id')
            .eq('id', newsId)
            .maybeSingle();
        if (!article) {
            throw new common_1.NotFoundException(`Article with ID ${newsId} not found`);
        }
        const canEdit = await this.newsAccessService.canEditArticle(userId, newsId);
        if (!canEdit) {
            throw new common_1.ForbiddenException('You cannot add co-authors to this article');
        }
        const isMember = await this.newsAccessService.isJournalismMember(addCoAuthorDto.userId);
        if (!isMember) {
            throw new common_1.BadRequestException('Co-author must be a journalism team member');
        }
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
                throw new common_1.ConflictException('User is already a co-author');
            }
            throw new common_1.BadRequestException(`Failed to add co-author: ${error.message}`);
        }
        this.logger.log(`Co-author added to article ${newsId}: ${addCoAuthorDto.userId}`);
    }
    async removeCoAuthor(newsId, coAuthorUserId, userId) {
        const supabase = this.supabaseService.getServiceClient();
        const canEdit = await this.newsAccessService.canEditArticle(userId, newsId);
        if (!canEdit) {
            throw new common_1.ForbiddenException('You cannot remove co-authors from this article');
        }
        const { error } = await supabase
            .from('news_co_authors')
            .delete()
            .eq('news_id', newsId)
            .eq('user_id', coAuthorUserId);
        if (error) {
            throw new common_1.BadRequestException(`Failed to remove co-author: ${error.message}`);
        }
        this.logger.log(`Co-author removed from article ${newsId}: ${coAuthorUserId}`);
    }
    async findMyArticles(userId) {
        return this.findAll({ authorId: userId });
    }
};
exports.NewsService = NewsService;
exports.NewsService = NewsService = NewsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService,
        news_access_service_1.NewsAccessService,
        news_image_service_1.NewsImageService,
        tags_service_1.TagsService])
], NewsService);
//# sourceMappingURL=news.service.js.map