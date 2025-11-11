import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles, UserRole } from '../../auth/decorators/roles.decorator';
import { AuthUser } from '../../auth/auth-user.decorator';
import { R2StorageService } from '../../storage/r2-storage/r2-storage.service';
import { CloudflareImagesService } from '../../gallery/services/cloudflare-images.service';
import { NewsService } from '../services/news.service';
import { NewsApprovalService } from '../services/news-approval.service';
import { NewsReviewCommentsService } from '../services/news-review-comments.service';
import {
  CreateNewsDto,
  UpdateNewsDto,
  ApproveNewsDto,
  RejectNewsDto,
  AddCoAuthorDto,
  CreateReviewCommentDto,
  UpdateReviewCommentDto,
} from '../dto';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

/**
 * Controller for news articles
 * Handles CRUD operations and approval workflow
 */
@ApiTags('news')
@Controller('news')
export class NewsController {
  private readonly logger = new Logger(NewsController.name);

  constructor(
    private readonly newsService: NewsService,
    private readonly newsApprovalService: NewsApprovalService,
    private readonly newsReviewCommentsService: NewsReviewCommentsService,
    private readonly r2StorageService: R2StorageService,
    private readonly cloudflareImagesService: CloudflareImagesService,
  ) {}

  // ============================================
  // PUBLIC ENDPOINTS (No authentication required)
  // ============================================

  /**
   * Get all published news articles
   * Public endpoint - no authentication required
   */
  @Get('public')
  @ApiOperation({ summary: 'Get all published news articles (public)' })
  @ApiResponse({ status: 200, description: 'Articles retrieved successfully' })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async findAllPublic(
    @Query('categoryId') categoryId?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.newsService.findAll({
      status: 'published',
      visibility: 'public',
      categoryId,
      limit: limit ? parseInt(limit.toString()) : 20,
      offset: offset ? parseInt(offset.toString()) : 0,
    });
  }

  /**
   * Get article by slug
   * Public endpoint - no authentication required
   */
  @Get('public/slug/:slug')
  @ApiOperation({ summary: 'Get article by slug (public)' })
  @ApiResponse({ status: 200, description: 'Article retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async findBySlugPublic(@Param('slug') slug: string) {
    return this.newsService.findBySlugPublic(slug);
  }

  /**
   * Check if a slug exists
   * Public endpoint - used for duplicate title detection
   */
  @Get('check-slug/:title')
  @ApiOperation({ summary: 'Check if a slug generated from title exists' })
  @ApiResponse({
    status: 200,
    description: 'Slug check result',
    schema: {
      type: 'object',
      properties: {
        exists: {
          type: 'boolean',
          description: 'Whether the slug already exists',
        },
        slug: { type: 'string', description: 'The generated slug' },
      },
    },
  })
  async checkSlug(@Param('title') title: string) {
    return this.newsService.checkSlugExists(title);
  }

  // ============================================
  // AUTHENTICATED ENDPOINTS
  // ============================================

  /**
   * Create a new article
   * Only journalism members with publishing positions can create
   */
  @Post()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new article' })
  @ApiResponse({ status: 201, description: 'Article created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not a journalism member or invalid position',
  })
  async create(
    @Body() createDto: CreateNewsDto,
    @AuthUser('id') userId: string,
  ) {
    return this.newsService.create(createDto, userId);
  }

  /**
   * Upload image for Tiptap editor
   * Returns R2 URL to be inserted into article content
   * Only journalism members can upload images
   */
  @Post('upload-image')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiBearerAuth('JWT-auth')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Image file upload for Tiptap editor',
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Image file (JPG, PNG, GIF, WebP, SVG)',
        },
      },
      required: ['image'],
    },
  })
  @ApiOperation({ summary: 'Upload image for article content (Tiptap)' })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Cloudflare Images public URL' },
        cf_image_id: { type: 'string', description: 'Cloudflare Image ID' },
        cf_image_url: { type: 'string', description: 'Cloudflare Images URL' },
        fileName: { type: 'string', description: 'Original file name' },
        fileSize: { type: 'number', description: 'File size in bytes' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid file type or upload failed',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not a journalism member',
  })
  async uploadImage(@Req() request: any, @AuthUser('id') userId: string) {
    try {
      this.logger.debug(`Processing image upload for user: ${userId}`);

      // Parse multipart data using Fastify
      const parts = request.parts();
      let imageBuffer: Buffer | null = null;
      let imageMimeType: string | null = null;
      let imageFilename: string | null = null;

      // Iterate through parts to find the image file
      for await (const part of parts) {
        if (part.type === 'file' && part.fieldname === 'image') {
          // Validate MIME type
          const validImageTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
          ];

          if (!validImageTypes.includes(part.mimetype)) {
            throw new BadRequestException(
              `Invalid image type: ${part.mimetype}. Allowed types: JPG, PNG, GIF, WebP, SVG`,
            );
          }

          // Read file stream into buffer
          const chunks: Buffer[] = [];
          for await (const chunk of part.file) {
            chunks.push(chunk);
          }
          imageBuffer = Buffer.concat(chunks);
          imageMimeType = part.mimetype;
          imageFilename = part.filename;

          this.logger.debug(
            `Image file received: ${imageFilename} (${imageMimeType}, ${imageBuffer.length} bytes)`,
          );
          break;
        }
      }

      // Validate that image was provided
      if (!imageBuffer || !imageMimeType || !imageFilename) {
        throw new BadRequestException('No image file provided');
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (imageBuffer.length > maxSize) {
        throw new BadRequestException(
          `Image too large: ${(imageBuffer.length / (1024 * 1024)).toFixed(2)}MB. Maximum allowed: 10MB`,
        );
      }

      // Sanitize filename
      const ext = path.extname(imageFilename);
      const sanitizedName = imageFilename
        .replace(ext, '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 50);

      this.logger.debug(
        `Uploading image to Cloudflare Images: ${imageFilename}`,
      );

      // Create file object for Cloudflare Images Service
      const fileObject = {
        buffer: imageBuffer,
        originalname: imageFilename,
        mimetype: imageMimeType,
        size: imageBuffer.length,
        fieldname: 'image',
        encoding: '7bit',
        destination: '',
        filename: imageFilename,
        path: '',
      } as Express.Multer.File;

      // Upload to Cloudflare Images
      const uploadResult = await this.cloudflareImagesService.uploadImage(
        fileObject,
        {
          uploadedBy: userId,
          context: 'news',
        },
      );

      this.logger.log(
        `Image uploaded successfully to Cloudflare Images: ${uploadResult.cf_image_id}`,
      );

      // Return Cloudflare Images URL and metadata
      return {
        url: uploadResult.cf_image_url,
        cf_image_id: uploadResult.cf_image_id,
        cf_image_url: uploadResult.cf_image_url,
        fileName: imageFilename,
        fileSize: uploadResult.file_size_bytes,
        mimeType: uploadResult.mime_type,
      };
    } catch (error) {
      this.logger.error('Error uploading image to Cloudflare Images:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(
        `Failed to upload image to Cloudflare Images: ${error.message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Get all articles with filters
   * Authenticated users can see articles based on visibility
   */
  @Get()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all articles (with filters)' })
  @ApiResponse({ status: 200, description: 'Articles retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'visibility', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'authorId', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({
    name: 'includeDeleted',
    required: false,
    type: Boolean,
    description: 'Include deleted/archived articles',
  })
  async findAll(
    @Query('status') status?: string,
    @Query('visibility') visibility?: string,
    @Query('categoryId') categoryId?: string,
    @Query('authorId') authorId?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('includeDeleted') includeDeleted?: string,
  ) {
    return this.newsService.findAll({
      status,
      visibility,
      categoryId,
      authorId,
      limit: limit ? parseInt(limit.toString()) : 20,
      offset: offset ? parseInt(offset.toString()) : 0,
      includeDeleted: includeDeleted === 'true',
    });
  }

  /**
   * Get current user's own articles
   */
  @Get('my-articles')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get my own articles' })
  @ApiResponse({ status: 200, description: 'Articles retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findMyArticles(@AuthUser('id') userId: string) {
    return this.newsService.findMyArticles(userId);
  }

  /**
   * Get pending approval articles
   * Only Advisers and Co-Advisers can access
   */
  @Get('pending-approval')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get all pending approval articles (Advisers only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Pending articles retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not an Adviser' })
  async getPendingArticles(@AuthUser('id') userId: string) {
    // Permission check will be done in service
    return this.newsApprovalService.getPendingArticles();
  }

  /**
   * Get article by ID (Public endpoint)
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get article by ID (public)' })
  @ApiResponse({ status: 200, description: 'Article retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async findOne(@Param('id') id: string) {
    return this.newsService.findOnePublic(id);
  }

  /**
   * Update an article
   * Author or Advisers can update (only draft/pending)
   */
  @Patch(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update article' })
  @ApiResponse({ status: 200, description: 'Article updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Cannot edit this article',
  })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateNewsDto,
    @AuthUser('id') userId: string,
  ) {
    return this.newsService.update(id, updateDto, userId);
  }

  /**
   * Quick update article status
   * Admins can update any article status
   */
  @Patch(':id/status')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update article status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @AuthUser('id') userId: string,
  ) {
    return this.newsService.updateStatus(id, status, userId);
  }

  /**
   * Quick update article visibility
   * Admins can update any article visibility
   */
  @Patch(':id/visibility')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update article visibility' })
  @ApiResponse({ status: 200, description: 'Visibility updated successfully' })
  async updateVisibility(
    @Param('id') id: string,
    @Body('visibility') visibility: string,
    @AuthUser('id') userId: string,
  ) {
    return this.newsService.updateVisibility(id, visibility, userId);
  }

  /**
   * Quick update featured image
   * Admins can update any article featured image
   */
  @Patch(':id/featured-image')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update article featured image' })
  @ApiResponse({
    status: 200,
    description: 'Featured image updated successfully',
  })
  async updateFeaturedImage(
    @Param('id') id: string,
    @Body('featuredImageUrl') featuredImageUrl: string,
    @AuthUser('id') userId: string,
  ) {
    return this.newsService.updateFeaturedImage(id, featuredImageUrl, userId);
  }

  /**
   * Remove featured image
   * Admins can remove featured image from any article
   */
  @Delete(':id/featured-image')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Remove article featured image' })
  @ApiResponse({
    status: 200,
    description: 'Featured image removed successfully',
  })
  async removeFeaturedImage(
    @Param('id') id: string,
    @AuthUser('id') userId: string,
  ) {
    return this.newsService.updateFeaturedImage(id, null, userId);
  }

  /**
   * Delete an article
   * Author or Advisers can delete (only drafts)
   */
  @Delete(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete article (soft delete)' })
  @ApiResponse({ status: 204, description: 'Article deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Cannot delete this article',
  })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async remove(@Param('id') id: string, @AuthUser('id') userId: string) {
    await this.newsService.remove(id, userId);
  }

  /**
   * Restore a soft-deleted article
   * Admins can restore any deleted article
   */
  @Patch(':id/restore')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Restore article (clear deleted_at/deleted_by)' })
  @ApiResponse({ status: 200, description: 'Article restored successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admins only' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async restore(@Param('id') id: string, @AuthUser('id') userId: string) {
    return this.newsService.restore(id, userId);
  }

  // ============================================
  // APPROVAL WORKFLOW ENDPOINTS
  // ============================================

  /**
   * Submit article for approval
   * Author submits their draft article
   */
  @Post(':id/submit')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Submit article for approval' })
  @ApiResponse({ status: 200, description: 'Article submitted for approval' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Article not in draft status',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not the author' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async submitForApproval(
    @Param('id') id: string,
    @AuthUser('id') userId: string,
  ) {
    await this.newsApprovalService.submitForApproval(id, userId);
    return { message: 'Article submitted for approval successfully' };
  }

  /**
   * Approve article
   * Only Advisers and Co-Advisers can approve
   */
  @Post(':id/approve')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Approve article (Advisers only)' })
  @ApiResponse({ status: 200, description: 'Article approved successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Article not pending',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not an Adviser' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async approve(
    @Param('id') id: string,
    @Body() approveDto: ApproveNewsDto,
    @AuthUser('id') userId: string,
  ) {
    return this.newsApprovalService.approveArticle(id, userId, approveDto);
  }

  /**
   * Reject article
   * Only Advisers and Co-Advisers can reject
   */
  @Post(':id/reject')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Reject article (Advisers only)' })
  @ApiResponse({ status: 200, description: 'Article rejected successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Article not pending or missing remarks',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not an Adviser' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async reject(
    @Param('id') id: string,
    @Body() rejectDto: RejectNewsDto,
    @AuthUser('id') userId: string,
  ) {
    return this.newsApprovalService.rejectArticle(id, userId, rejectDto);
  }

  /**
   * Publish article
   * Only Advisers and Co-Advisers can publish (after approval)
   * If forceApprove=true, will auto-approve pending articles when publishing
   */
  @Post(':id/publish')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Publish article (Advisers only)' })
  @ApiResponse({ status: 200, description: 'Article published successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Article not approved',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not an Adviser' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  @ApiQuery({
    name: 'forceApprove',
    required: false,
    type: Boolean,
    description: 'Auto-approve pending articles when publishing',
  })
  async publish(
    @Param('id') id: string,
    @AuthUser('id') userId: string,
    @Query('forceApprove') forceApprove?: string,
  ) {
    const shouldForceApprove = forceApprove === 'true';
    await this.newsApprovalService.publishArticle(
      id,
      userId,
      shouldForceApprove,
    );
    return { message: 'Article published successfully' };
  }

  /**
   * Unpublish article
   * Only Advisers and Co-Advisers can unpublish
   */
  @Post(':id/unpublish')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Unpublish article (Advisers only)' })
  @ApiResponse({ status: 200, description: 'Article unpublished successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Article not published',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not an Adviser' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async unpublish(@Param('id') id: string, @AuthUser('id') userId: string) {
    await this.newsApprovalService.unpublishArticle(id, userId);
    return { message: 'Article unpublished successfully' };
  }

  /**
   * Get approval history for an article
   */
  @Get(':id/approval-history')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get approval history for article' })
  @ApiResponse({
    status: 200,
    description: 'Approval history retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getApprovalHistory(@Param('id') id: string) {
    return this.newsApprovalService.getApprovalHistory(id);
  }

  // ============================================
  // CO-AUTHORS ENDPOINTS
  // ============================================

  /**
   * Add co-author to article
   * Author or Advisers can add
   */
  @Post(':id/co-authors')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add co-author to article' })
  @ApiResponse({ status: 201, description: 'Co-author added successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - User not journalism member',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  @ApiResponse({ status: 409, description: 'User already a co-author' })
  async addCoAuthor(
    @Param('id') id: string,
    @Body() addCoAuthorDto: AddCoAuthorDto,
    @AuthUser('id') userId: string,
  ) {
    await this.newsService.addCoAuthor(id, addCoAuthorDto, userId);
    return { message: 'Co-author added successfully' };
  }

  /**
   * Remove co-author from article
   * Author or Advisers can remove
   */
  @Delete(':id/co-authors/:coAuthorName')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove co-author from article' })
  @ApiResponse({ status: 204, description: 'Co-author removed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async removeCoAuthor(
    @Param('id') id: string,
    @Param('coAuthorName') coAuthorName: string,
    @AuthUser('id') userId: string,
  ) {
    await this.newsService.removeCoAuthor(id, coAuthorName, userId);
  }

  // ============================================
  // STATISTICS ENDPOINTS
  // ============================================

  /**
   * Get news statistics (KPI counts)
   * Students get their own stats, Teachers get their own stats, Admins get all stats
   */
  @Get('stats')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get news statistics (KPI counts)' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        pendingReview: {
          type: 'number',
          description: 'Articles pending review or in review',
        },
        published: { type: 'number', description: 'Published articles' },
        needsRevision: {
          type: 'number',
          description: 'Articles needing revision',
        },
        approved: { type: 'number', description: 'Approved articles' },
        rejected: { type: 'number', description: 'Rejected articles' },
        draft: { type: 'number', description: 'Draft articles' },
        total: { type: 'number', description: 'Total articles' },
        studentSubmissions: {
          type: 'number',
          description: 'Articles submitted by students',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({
    name: 'all',
    required: false,
    type: Boolean,
    description: 'Get all stats (Admin/Teacher) instead of user-specific stats',
  })
  async getStats(
    @AuthUser('id') userId: string,
    @AuthUser('roles') roles: string[],
    @Query('all') all?: string,
  ) {
    // Admins and Teachers can get all stats if 'all' query param is true
    const isAdmin = roles?.includes(UserRole.ADMIN);
    const isTeacher = roles?.includes(UserRole.TEACHER);
    const getAllStats = all === 'true' && (isAdmin || isTeacher);

    // Teachers and Admins can get all stats, Students get their own stats
    const filterByUser = getAllStats ? undefined : userId;

    return this.newsService.getNewsStats(filterByUser);
  }

  // ============================================
  // REVIEW COMMENTS ENDPOINTS
  // ============================================

  /**
   * Get all review comments for a news article
   */
  @Get(':id/review-comments')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all review comments for a news article' })
  @ApiResponse({
    status: 200,
    description: 'Review comments retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async getReviewComments(@Param('id') newsId: string) {
    return this.newsReviewCommentsService.getCommentsByNewsId(newsId);
  }

  /**
   * Create a review comment on a news article
   */
  @Post(':id/review-comments')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Add a review comment to a news article (Teachers/Admins only)',
  })
  @ApiResponse({
    status: 201,
    description: 'Review comment created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not a Teacher or Admin',
  })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async createReviewComment(
    @Param('id') newsId: string,
    @AuthUser('id') userId: string,
    @Body() createDto: CreateReviewCommentDto,
  ) {
    return this.newsReviewCommentsService.createComment(
      newsId,
      userId,
      createDto,
    );
  }

  /**
   * Update a review comment
   */
  @Patch('review-comments/:commentId')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a review comment (owner only)' })
  @ApiResponse({
    status: 200,
    description: 'Review comment updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not the comment owner',
  })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async updateReviewComment(
    @Param('commentId') commentId: string,
    @AuthUser('id') userId: string,
    @Body() updateDto: UpdateReviewCommentDto,
  ) {
    return this.newsReviewCommentsService.updateComment(
      commentId,
      userId,
      updateDto,
    );
  }

  /**
   * Delete a review comment (soft delete)
   */
  @Delete('review-comments/:commentId')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a review comment (owner or admin only)',
  })
  @ApiResponse({
    status: 204,
    description: 'Review comment deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not the comment owner or admin',
  })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async deleteReviewComment(
    @Param('commentId') commentId: string,
    @AuthUser('id') userId: string,
  ) {
    await this.newsReviewCommentsService.deleteComment(commentId, userId);
  }
}
