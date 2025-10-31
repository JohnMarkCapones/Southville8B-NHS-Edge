import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { GalleryItemsService } from './services/gallery-items.service';
import { GalleryDownloadLoggerService } from './services/gallery-download-logger.service';
import { GalleryItem } from './entities/gallery-item.entity';
import {
  CreateItemDto,
  UpdateItemDto,
  QueryItemsDto,
  ReorderItemsDto,
} from './dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../auth/decorators/roles.decorator';
import { AuthUser } from '../auth/auth-user.decorator';

/**
 * Gallery Controller (Simplified - No Albums)
 * Manages photo/video gallery
 */
@ApiTags('Gallery')
@Controller('gallery')
export class GalleryController {
  constructor(
    private readonly galleryItemsService: GalleryItemsService,
    private readonly downloadLoggerService: GalleryDownloadLoggerService,
  ) {}

  /**
   * Upload a photo/video
   */
  @Post()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a photo/video to gallery' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        title: { type: 'string' },
        caption: { type: 'string' },
        alt_text: { type: 'string' },
        display_order: { type: 'number' },
        is_featured: { type: 'boolean' },
        photographer_name: { type: 'string' },
        photographer_credit: { type: 'string' },
        taken_at: { type: 'string', format: 'date-time' },
        location: { type: 'string' },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 201, description: 'Item uploaded', type: GalleryItem })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(
    @Req() request: any,
    @AuthUser() user: any,
  ): Promise<GalleryItem> {
    try {
      const parts = request.parts();
      const fields: Record<string, any> = {};
      let fileData: any = null;
      let fileBuffer: Buffer | null = null;

      for await (const part of parts) {
        if (part.type === 'file') {
          const chunks: Buffer[] = [];
          for await (const chunk of part.file) {
            chunks.push(chunk);
          }
          fileBuffer = Buffer.concat(chunks);
          fileData = {
            filename: part.filename,
            mimetype: part.mimetype,
            encoding: part.encoding,
            fieldname: part.fieldname,
          };
        } else {
          fields[part.fieldname] = part.value;
        }
      }

      if (!fileData || !fileBuffer) {
        throw new BadRequestException('No file uploaded');
      }

      const file: Express.Multer.File = {
        fieldname: fileData.fieldname,
        originalname: fileData.filename,
        encoding: fileData.encoding,
        mimetype: fileData.mimetype,
        size: fileBuffer.length,
        buffer: fileBuffer,
        stream: null as any,
        destination: '',
        filename: fileData.filename,
        path: '',
      };

      const createItemDto: CreateItemDto = {
        title: fields.title,
        caption: fields.caption,
        alt_text: fields.alt_text,
        display_order: fields.display_order
          ? parseInt(fields.display_order, 10)
          : 0,
        is_featured: fields.is_featured === 'true',
        photographer_name: fields.photographer_name,
        photographer_credit: fields.photographer_credit,
        taken_at: fields.taken_at,
        location: fields.location,
      };

      return this.galleryItemsService.create(createItemDto, file, user.id);
    } catch (error) {
      throw new BadRequestException(`Failed to upload item: ${error.message}`);
    }
  }

  /**
   * Get all gallery items
   */
  @Get()
  @ApiOperation({ summary: 'Get all gallery items' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'media_type', required: false, enum: ['image', 'video'] })
  @ApiQuery({ name: 'is_featured', required: false, type: Boolean })
  @ApiQuery({ name: 'tag_id', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({
    status: 200,
    description: 'Paginated items',
    schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: { $ref: '#/components/schemas/GalleryItem' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  async findAll(@Query() query: QueryItemsDto): Promise<{
    items: GalleryItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.galleryItemsService.findAll(query);
  }

  /**
   * Get featured items
   */
  @Get('featured')
  @ApiOperation({ summary: 'Get featured items for homepage' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Featured items',
    type: [GalleryItem],
  })
  async findFeatured(@Query('limit') limit?: number): Promise<GalleryItem[]> {
    return this.galleryItemsService.findFeatured(
      limit ? parseInt(limit as any, 10) : 10,
    );
  }

  /**
   * Get item by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get item by ID' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  @ApiResponse({ status: 200, description: 'Item details', type: GalleryItem })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<GalleryItem> {
    return this.galleryItemsService.findOne(id);
  }

  /**
   * Update item metadata
   */
  @Put(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update item metadata' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  @ApiResponse({ status: 200, description: 'Item updated', type: GalleryItem })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateItemDto: UpdateItemDto,
    @AuthUser() user: any,
  ): Promise<GalleryItem> {
    return this.galleryItemsService.update(id, updateItemDto, user.id);
  }

  /**
   * Delete an item (soft delete)
   */
  @Delete(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an item (soft delete)' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  @ApiResponse({ status: 204, description: 'Item deleted' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthUser() user: any,
  ): Promise<void> {
    return this.galleryItemsService.remove(id, user.id);
  }

  /**
   * Restore a soft-deleted item
   */
  @Post(':id/restore')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore a soft-deleted gallery item' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  @ApiResponse({ status: 200, description: 'Item restored successfully' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async restore(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthUser() user: any,
  ): Promise<{ message: string }> {
    await this.galleryItemsService.restore(id, user.id);
    return { message: 'Gallery item restored successfully' };
  }

  /**
   * Reorder items
   */
  @Post('reorder')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Reorder gallery items' })
  @ApiResponse({ status: 204, description: 'Items reordered' })
  async reorderItems(
    @Body() reorderItemsDto: ReorderItemsDto,
    @AuthUser() user: any,
  ): Promise<void> {
    return this.galleryItemsService.reorderItems(reorderItemsDto, user.id);
  }

  /**
   * Generate download URL
   */
  @Post(':id/download')
  @ApiOperation({ summary: 'Generate download URL for item' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  @ApiResponse({
    status: 200,
    description: 'Download URL generated',
    schema: {
      type: 'object',
      properties: {
        downloadUrl: { type: 'string' },
        expiresAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async generateDownloadUrl(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthUser() user?: any,
    @Req() request?: any,
  ): Promise<{ downloadUrl: string; expiresAt: string }> {
    const result = await this.galleryItemsService.generateDownloadUrl(id);

    // Log download
    const userId = user?.id;
    const ipAddress = request?.ip || request?.headers['x-forwarded-for'];
    const userAgent = request?.headers['user-agent'];

    await this.downloadLoggerService.logDownload(
      id,
      userId,
      ipAddress,
      userAgent,
      true,
    );

    return result;
  }
}
