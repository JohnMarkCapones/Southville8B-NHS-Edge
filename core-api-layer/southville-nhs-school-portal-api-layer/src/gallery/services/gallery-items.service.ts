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
import { CloudflareImagesService } from './cloudflare-images.service';

/**
 * Gallery Items Service (Simplified - No Albums)
 * Manages photos/videos in a flat gallery structure
 */
@Injectable()
export class GalleryItemsService {
  private readonly logger = new Logger(GalleryItemsService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly cloudflareImagesService: CloudflareImagesService,
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
      // Upload file to Cloudflare Images
      const uploadResult = await this.cloudflareImagesService.uploadImage(
        file,
        {
          userId: userId,
          originalFilename: file.originalname,
          uploadedAt: new Date().toISOString(),
        },
      );

      // Create database record
      const { data: item, error } = await this.supabaseService
        .getServiceClient()
        .from('gallery_items')
        .insert({
          cf_image_id: uploadResult.cf_image_id,
          cf_image_url: uploadResult.cf_image_url,
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
        // Cleanup: delete uploaded file from Cloudflare Images
        await this.cloudflareImagesService.deleteImage(
          uploadResult.cf_image_id,
        );
        throw new BadRequestException('Failed to create gallery item');
      }

      this.logger.log(
        `Gallery item created: ${item.id} (CF Images: ${uploadResult.cf_image_id})`,
      );
      return item;
    } catch (error) {
      this.logger.error('Error creating gallery item:', error);
      throw error;
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
      this.logger.log(`Finding gallery item: ${id}`);

      const { data: item, error } = await this.supabaseService
        .getServiceClient()
        .from('gallery_items')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        this.logger.error(`Supabase error for item ${id}:`, error);
        throw new NotFoundException('Gallery item not found');
      }

      if (!item) {
        this.logger.warn(`No item found with ID: ${id}`);
        throw new NotFoundException('Gallery item not found');
      }

      this.logger.log(`Found item: ${item.id}`);

      // Return item with empty uploader for now (can add later if needed)
      return {
        ...item,
        uploader: null,
      };
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
      // Check if item exists using service client (includes deleted items)
      const { data: existingItem, error: fetchError } =
        await this.supabaseService
          .getServiceClient()
          .from('gallery_items')
          .select('id, is_deleted')
          .eq('id', id)
          .single();

      if (fetchError || !existingItem) {
        throw new NotFoundException('Gallery item not found');
      }

      // Don't allow updating deleted items (except for restore operation)
      if (existingItem.is_deleted) {
        throw new BadRequestException(
          'Cannot update a deleted item. Restore it first.',
        );
      }

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
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
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
      // Check if item exists using service client (includes deleted items)
      const { data: existingItem, error: fetchError } =
        await this.supabaseService
          .getServiceClient()
          .from('gallery_items')
          .select('id, is_deleted')
          .eq('id', id)
          .single();

      if (fetchError || !existingItem) {
        throw new NotFoundException('Gallery item not found');
      }

      // If already deleted, return early (idempotent delete)
      if (existingItem.is_deleted) {
        this.logger.log(`Gallery item ${id} is already deleted`);
        return;
      }

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
   * Restore a soft-deleted item
   * @param id - Item ID to restore
   * @param userId - User ID restoring the item
   */
  async restore(id: string, userId: string): Promise<void> {
    try {
      // Check if item exists (including deleted items)
      const { data: item, error: fetchError } = await this.supabaseService
        .getServiceClient()
        .from('gallery_items')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !item) {
        throw new NotFoundException('Gallery item not found');
      }

      if (!item.is_deleted && !item.deleted_at) {
        throw new BadRequestException('Item is not deleted');
      }

      // Restore the item (undelete)
      const { error: updateError } = await this.supabaseService
        .getServiceClient()
        .from('gallery_items')
        .update({
          is_deleted: false,
          deleted_at: null,
          deleted_by: null,
          updated_by: userId,
        })
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }

      this.logger.log(`Gallery item ${id} restored by user ${userId}`);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error('Error restoring item:', error);
      throw new BadRequestException('Failed to restore gallery item');
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
   * @param expiresIn - Expiration time in seconds (not used for CF Images)
   * @returns Download URL and expiration
   */
  async generateDownloadUrl(
    id: string,
    expiresIn: number = 3600,
  ): Promise<{ downloadUrl: string; expiresAt: string }> {
    try {
      const item = await this.findOne(id);

      // For Cloudflare Images, use the 'original' variant URL
      // No presigned URL needed since we enabled "Always allow public access"
      const downloadUrl = this.cloudflareImagesService.getOriginalUrl(
        item.cf_image_id,
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
