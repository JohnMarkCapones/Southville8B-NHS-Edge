import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import {
  GalleryItem,
  GalleryItemWithDetails,
} from '../entities/gallery-item.entity';
import {
  CreateItemDto,
  UpdateItemDto,
  QueryItemsDto,
  ReorderItemsDto,
} from '../dto';
import { GalleryStorageService } from './gallery-storage.service';

/**
 * Gallery Items Service (Simplified - No Albums)
 * Manages photos/videos in a flat gallery structure
 */
@Injectable()
export class GalleryItemsService {
  private readonly logger = new Logger(GalleryItemsService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly galleryStorageService: GalleryStorageService,
  ) {}

  /**
   * Create a gallery item (upload file)
   * @param createItemDto - Item metadata
   * @param file - File to upload
   * @param userId - User ID uploading
   * @returns Created item
   */
  async create(
    createItemDto: CreateItemDto,
    file: Express.Multer.File,
    userId: string,
  ): Promise<GalleryItem> {
    try {
      // Get or create default album
      const defaultAlbumId = await this.getOrCreateDefaultAlbum(userId);

      // Upload file to R2 (simplified - no album slug needed)
      const uploadResult = await this.galleryStorageService.uploadGalleryItem(
        file,
        userId,
      );

      // Create database record
      const { data: item, error } = await this.supabaseService
        .getServiceClient()
        .from('gallery_items')
        .insert({
          album_id: defaultAlbumId,
          file_url: uploadResult.file_url,
          r2_file_key: uploadResult.r2_file_key,
          thumbnail_url: uploadResult.thumbnail_url,
          r2_thumbnail_key: uploadResult.r2_thumbnail_key,
          original_filename: file.originalname,
          file_size_bytes: uploadResult.file_size_bytes,
          mime_type: uploadResult.mime_type,
          media_type: uploadResult.media_type,
          title: createItemDto.title,
          caption: createItemDto.caption,
          alt_text: createItemDto.alt_text,
          display_order: createItemDto.display_order || 0,
          is_featured: createItemDto.is_featured || false,
          photographer_name: createItemDto.photographer_name,
          photographer_credit: createItemDto.photographer_credit,
          taken_at: createItemDto.taken_at,
          location: createItemDto.location,
          views_count: 0,
          downloads_count: 0,
          uploaded_by: userId,
        })
        .select()
        .single();

      if (error) {
        this.logger.error('Failed to create item:', error);
        // Cleanup: delete uploaded file from R2
        await this.galleryStorageService.deleteGalleryItem(
          uploadResult.r2_file_key,
        );
        throw new BadRequestException('Failed to create gallery item');
      }

      this.logger.log(`Gallery item created: ${item.id}`);
      return item;
    } catch (error) {
      this.logger.error('Error creating gallery item:', error);
      throw error;
    }
  }

  /**
   * Get or create default album for gallery items
   */
  private async getOrCreateDefaultAlbum(userId: string): Promise<string> {
    try {
      // Try to find existing default album
      const { data: existingAlbum, error: findError } =
        await this.supabaseService
          .getServiceClient()
          .from('gallery_albums')
          .select('id')
          .eq('slug', 'default-gallery')
          .eq('is_deleted', false)
          .single();

      if (existingAlbum && !findError) {
        return existingAlbum.id;
      }

      // Create default album if it doesn't exist
      const { data: newAlbum, error: createError } = await this.supabaseService
        .getServiceClient()
        .from('gallery_albums')
        .insert({
          title: 'Default Gallery',
          slug: 'default-gallery',
          description: 'Default album for gallery items',
          category: 'other',
          visibility: 'public',
          is_featured: false,
          created_by: userId,
        })
        .select('id')
        .single();

      if (createError || !newAlbum) {
        this.logger.error('Failed to create default album:', createError);
        throw new BadRequestException('Failed to create default album');
      }

      return newAlbum.id;
    } catch (error) {
      this.logger.error('Error getting/creating default album:', error);
      throw new BadRequestException('Failed to get or create default album');
    }
  }

  /**
   * Bulk upload gallery items
   * @param files - Array of files
   * @param userId - User ID
   * @param category - Category for all items
   * @returns Array of created items
   */
  async bulkCreate(
    files: Express.Multer.File[],
    userId: string,
  ): Promise<GalleryItem[]> {
    const createdItems: GalleryItem[] = [];
    const errors: any[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const item = await this.create(
          {
            display_order: i,
          },
          file,
          userId,
        );
        createdItems.push(item);
      } catch (error) {
        this.logger.error(`Failed to upload file ${file.originalname}:`, error);
        errors.push({
          filename: file.originalname,
          error: error.message,
        });
      }
    }

    if (errors.length > 0) {
      this.logger.warn(`Bulk upload completed with ${errors.length} errors`);
    }

    return createdItems;
  }

  /**
   * Find all items with pagination and filtering
   * @param query - Query parameters
   * @returns Paginated items
   */
  async findAll(query: QueryItemsDto): Promise<{
    items: GalleryItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const page = query.page || 1;
      const limit = query.limit || 20;
      const offset = (page - 1) * limit;

      // Build query
      let queryBuilder = this.supabaseService
        .getClient()
        .from('gallery_items')
        .select('*', { count: 'exact' });

      // Exclude deleted items unless explicitly requested
      if (!query.includeDeleted) {
        queryBuilder = queryBuilder.eq('is_deleted', false);
      }

      // Apply filters
      if (query.search) {
        queryBuilder = queryBuilder.or(
          `title.ilike.%${query.search}%,caption.ilike.%${query.search}%`,
        );
      }

      if (query.media_type) {
        queryBuilder = queryBuilder.eq('media_type', query.media_type);
      }

      if (query.is_featured !== undefined) {
        queryBuilder = queryBuilder.eq('is_featured', query.is_featured);
      }

      if (query.tag_id) {
        // Join with item_tags to filter by tag
        queryBuilder = queryBuilder
          .select(
            `
            *,
            gallery_item_tags!inner(tag_id)
          `,
          )
          .eq('gallery_item_tags.tag_id', query.tag_id);
      }

      // Apply sorting
      const sortBy = query.sortBy || 'created_at';
      const sortOrder = query.sortOrder || 'desc';
      queryBuilder = queryBuilder.order(sortBy, {
        ascending: sortOrder === 'asc',
      });

      // Apply pagination
      queryBuilder = queryBuilder.range(offset, offset + limit - 1);

      const { data: items, error, count } = await queryBuilder;

      if (error) {
        this.logger.error('Failed to fetch items:', error);
        throw new BadRequestException('Failed to fetch gallery items');
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        items: items || [],
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      this.logger.error('Error fetching items:', error);
      throw error;
    }
  }

  /**
   * Get featured items for homepage
   * @param limit - Number of items to retrieve
   * @returns Featured items
   */
  async findFeatured(limit: number = 10): Promise<GalleryItem[]> {
    try {
      const { data: items, error } = await this.supabaseService
        .getClient()
        .from('gallery_items')
        .select('*')
        .eq('is_featured', true)
        .eq('is_deleted', false)
        .order('display_order', { ascending: true })
        .limit(limit);

      if (error) {
        this.logger.error('Failed to fetch featured items:', error);
        return [];
      }

      return items || [];
    } catch (error) {
      this.logger.error('Error fetching featured items:', error);
      return [];
    }
  }

  /**
   * Get a single item by ID
   * @param id - Item ID
   * @returns Item with details
   */
  async findOne(id: string): Promise<GalleryItemWithDetails> {
    try {
      const { data: item, error } = await this.supabaseService
        .getClient()
        .from('gallery_items')
        .select(
          `
          *,
          uploader:users!uploaded_by(id, full_name, email)
        `,
        )
        .eq('id', id)
        .single();

      if (error || !item) {
        throw new NotFoundException('Gallery item not found');
      }

      return item;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error fetching item:', error);
      throw new BadRequestException('Failed to fetch gallery item');
    }
  }

  /**
   * Update an item's metadata (not the file itself)
   * @param id - Item ID
   * @param updateItemDto - Update data
   * @param userId - User ID updating
   * @returns Updated item
   */
  async update(
    id: string,
    updateItemDto: UpdateItemDto,
    userId: string,
  ): Promise<GalleryItem> {
    try {
      // Verify item exists
      await this.findOne(id);

      const updateData: any = { updated_by: userId };

      // Copy fields
      Object.assign(updateData, updateItemDto);

      // Remove undefined values
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      const { data: item, error } = await this.supabaseService
        .getServiceClient()
        .from('gallery_items')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        this.logger.error('Failed to update item:', error);
        throw new BadRequestException('Failed to update gallery item');
      }

      this.logger.log(`Gallery item updated: ${id}`);
      return item;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error updating item:', error);
      throw new BadRequestException('Failed to update gallery item');
    }
  }

  /**
   * Soft delete an item
   * @param id - Item ID
   * @param userId - User ID deleting
   */
  async remove(id: string, userId: string): Promise<void> {
    try {
      // Verify item exists
      await this.findOne(id);

      // Soft delete in database
      const { error } = await this.supabaseService
        .getServiceClient()
        .from('gallery_items')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
          deleted_by: userId,
        })
        .eq('id', id);

      if (error) {
        this.logger.error('Failed to delete item:', error);
        throw new BadRequestException('Failed to delete gallery item');
      }

      this.logger.log(`Gallery item soft deleted: ${id}`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error deleting item:', error);
      throw new BadRequestException('Failed to delete gallery item');
    }
  }

  /**
   * Reorder items
   * @param reorderItemsDto - Array of items with new display orders
   * @param userId - User ID reordering
   */
  async reorderItems(
    reorderItemsDto: ReorderItemsDto,
    userId: string,
  ): Promise<void> {
    try {
      // Update each item's display order
      for (const itemOrder of reorderItemsDto.items) {
        await this.supabaseService
          .getServiceClient()
          .from('gallery_items')
          .update({
            display_order: itemOrder.display_order,
            updated_by: userId,
          })
          .eq('id', itemOrder.item_id);
      }

      this.logger.log(`Items reordered`);
    } catch (error) {
      this.logger.error('Error reordering items:', error);
      throw new BadRequestException('Failed to reorder items');
    }
  }

  /**
   * Generate download URL for an item
   * @param id - Item ID
   * @param expiresIn - Expiration time in seconds
   * @returns Download URL and expiration
   */
  async generateDownloadUrl(
    id: string,
    expiresIn: number = 3600,
  ): Promise<{ downloadUrl: string; expiresAt: string }> {
    try {
      const item = await this.findOne(id);

      const downloadUrl = await this.galleryStorageService.generateDownloadUrl(
        item.r2_file_key,
        expiresIn,
      );

      const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

      return {
        downloadUrl,
        expiresAt,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error generating download URL:', error);
      throw new BadRequestException('Failed to generate download URL');
    }
  }
}
