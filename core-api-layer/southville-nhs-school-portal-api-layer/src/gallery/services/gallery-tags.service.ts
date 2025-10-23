import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { GalleryTag } from '../entities';
import { CreateTagDto, UpdateTagDto } from '../dto';
import {
  generateSlugFromTitle,
  makeSlugUnique,
} from '../dto/validators/is-valid-slug.validator';

/**
 * Gallery Tags Service
 * Manages tags for categorizing gallery items
 */
@Injectable()
export class GalleryTagsService {
  private readonly logger = new Logger(GalleryTagsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Create a new tag
   * @param createTagDto - Tag creation data
   * @param userId - User ID creating the tag
   * @returns Created tag
   */
  async create(
    createTagDto: CreateTagDto,
    userId: string,
  ): Promise<GalleryTag> {
    try {
      // Generate slug if not provided
      let slug = createTagDto.slug || generateSlugFromTitle(createTagDto.name);

      // Ensure slug uniqueness
      slug = await this.ensureUniqueSlug(slug);

      const { data: tag, error } = await this.supabaseService
        .getServiceClient()
        .from('gallery_tags')
        .insert({
          name: createTagDto.name,
          slug,
          description: createTagDto.description,
          color: createTagDto.color,
          created_by: userId,
          usage_count: 0,
        })
        .select()
        .single();

      if (error) {
        this.logger.error('Failed to create tag:', error);
        throw new BadRequestException('Failed to create tag');
      }

      this.logger.log(`Tag created: ${tag.id}`);
      return tag;
    } catch (error) {
      if (error.code === '23505') {
        // Unique constraint violation
        throw new ConflictException(
          'Tag with this name or slug already exists',
        );
      }
      throw error;
    }
  }

  /**
   * Get all tags
   * @param sortBy - Sort field (usage_count or name)
   * @returns List of tags
   */
  async findAll(
    sortBy: 'usage_count' | 'name' = 'usage_count',
  ): Promise<GalleryTag[]> {
    try {
      let query = this.supabaseService
        .getClient()
        .from('gallery_tags')
        .select('*');

      if (sortBy === 'usage_count') {
        query = query.order('usage_count', { ascending: false });
      } else {
        query = query.order('name', { ascending: true });
      }

      const { data: tags, error } = await query;

      if (error) {
        this.logger.error('Failed to fetch tags:', error);
        throw new BadRequestException('Failed to fetch tags');
      }

      return tags || [];
    } catch (error) {
      this.logger.error('Error fetching tags:', error);
      throw error;
    }
  }

  /**
   * Get a single tag by ID
   * @param id - Tag ID
   * @returns Tag
   */
  async findOne(id: string): Promise<GalleryTag> {
    try {
      const { data: tag, error } = await this.supabaseService
        .getClient()
        .from('gallery_tags')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !tag) {
        throw new NotFoundException('Tag not found');
      }

      return tag;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error fetching tag:', error);
      throw new BadRequestException('Failed to fetch tag');
    }
  }

  /**
   * Get a tag by slug
   * @param slug - Tag slug
   * @returns Tag
   */
  async findBySlug(slug: string): Promise<GalleryTag> {
    try {
      const { data: tag, error } = await this.supabaseService
        .getClient()
        .from('gallery_tags')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error || !tag) {
        throw new NotFoundException('Tag not found');
      }

      return tag;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error fetching tag by slug:', error);
      throw new BadRequestException('Failed to fetch tag');
    }
  }

  /**
   * Update a tag
   * @param id - Tag ID
   * @param updateTagDto - Update data
   * @returns Updated tag
   */
  async update(id: string, updateTagDto: UpdateTagDto): Promise<GalleryTag> {
    try {
      // Verify tag exists
      await this.findOne(id);

      const updateData: any = {};

      if (updateTagDto.name) {
        updateData.name = updateTagDto.name;
      }

      if (updateTagDto.slug) {
        // Ensure new slug is unique (excluding current tag)
        const slugExists = await this.isSlugTaken(updateTagDto.slug, id);
        if (slugExists) {
          throw new ConflictException('Slug already in use');
        }
        updateData.slug = updateTagDto.slug;
      }

      if (updateTagDto.description !== undefined) {
        updateData.description = updateTagDto.description;
      }

      if (updateTagDto.color !== undefined) {
        updateData.color = updateTagDto.color;
      }

      const { data: tag, error } = await this.supabaseService
        .getServiceClient()
        .from('gallery_tags')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        this.logger.error('Failed to update tag:', error);
        throw new BadRequestException('Failed to update tag');
      }

      this.logger.log(`Tag updated: ${id}`);
      return tag;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      this.logger.error('Error updating tag:', error);
      throw new BadRequestException('Failed to update tag');
    }
  }

  /**
   * Delete a tag
   * @param id - Tag ID
   */
  async remove(id: string): Promise<void> {
    try {
      // Verify tag exists
      await this.findOne(id);

      // Delete tag (cascade will remove item_tag associations)
      const { error } = await this.supabaseService
        .getServiceClient()
        .from('gallery_tags')
        .delete()
        .eq('id', id);

      if (error) {
        this.logger.error('Failed to delete tag:', error);
        throw new BadRequestException('Failed to delete tag');
      }

      this.logger.log(`Tag deleted: ${id}`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error deleting tag:', error);
      throw new BadRequestException('Failed to delete tag');
    }
  }

  /**
   * Add tags to a gallery item
   * @param itemId - Gallery item ID
   * @param tagIds - Array of tag IDs
   * @param userId - User ID adding the tags
   */
  async addTagsToItem(
    itemId: string,
    tagIds: string[],
    userId: string,
  ): Promise<void> {
    try {
      // Verify all tags exist
      for (const tagId of tagIds) {
        await this.findOne(tagId);
      }

      // Insert item-tag associations (ignoring duplicates)
      const itemTags = tagIds.map((tagId) => ({
        item_id: itemId,
        tag_id: tagId,
        created_by: userId,
      }));

      const { error } = await this.supabaseService
        .getServiceClient()
        .from('gallery_item_tags')
        .insert(itemTags);

      if (error && error.code !== '23505') {
        // Ignore duplicate constraint errors
        this.logger.error('Failed to add tags to item:', error);
        throw new BadRequestException('Failed to add tags to item');
      }

      this.logger.log(`Tags added to item ${itemId}: ${tagIds.join(', ')}`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error adding tags to item:', error);
      throw new BadRequestException('Failed to add tags to item');
    }
  }

  /**
   * Remove a tag from a gallery item
   * @param itemId - Gallery item ID
   * @param tagId - Tag ID to remove
   */
  async removeTagFromItem(itemId: string, tagId: string): Promise<void> {
    try {
      const { error } = await this.supabaseService
        .getServiceClient()
        .from('gallery_item_tags')
        .delete()
        .eq('item_id', itemId)
        .eq('tag_id', tagId);

      if (error) {
        this.logger.error('Failed to remove tag from item:', error);
        throw new BadRequestException('Failed to remove tag from item');
      }

      this.logger.log(`Tag ${tagId} removed from item ${itemId}`);
    } catch (error) {
      this.logger.error('Error removing tag from item:', error);
      throw new BadRequestException('Failed to remove tag from item');
    }
  }

  /**
   * Get tags for a gallery item
   * @param itemId - Gallery item ID
   * @returns Array of tags
   */
  async getItemTags(itemId: string): Promise<GalleryTag[]> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('gallery_item_tags')
        .select(
          `
          tag_id,
          gallery_tags (*)
        `,
        )
        .eq('item_id', itemId);

      if (error) {
        this.logger.error('Failed to get item tags:', error);
        return [];
      }

      return (data || []).map((item: any) => item.gallery_tags).filter(Boolean);
    } catch (error) {
      this.logger.error('Error getting item tags:', error);
      return [];
    }
  }

  /**
   * Ensure slug is unique, append counter if needed
   * @param baseSlug - Base slug
   * @param excludeId - Tag ID to exclude from uniqueness check
   * @returns Unique slug
   */
  private async ensureUniqueSlug(
    baseSlug: string,
    excludeId?: string,
  ): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (await this.isSlugTaken(slug, excludeId)) {
      slug = makeSlugUnique(baseSlug, counter);
      counter++;
    }

    return slug;
  }

  /**
   * Check if slug is already taken
   * @param slug - Slug to check
   * @param excludeId - Tag ID to exclude from check
   * @returns True if taken
   */
  private async isSlugTaken(
    slug: string,
    excludeId?: string,
  ): Promise<boolean> {
    try {
      let query = this.supabaseService
        .getClient()
        .from('gallery_tags')
        .select('id')
        .eq('slug', slug);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query.limit(1);

      if (error) {
        this.logger.error('Error checking slug:', error);
        return false;
      }

      return (data?.length || 0) > 0;
    } catch (error) {
      this.logger.error('Error in isSlugTaken:', error);
      return false;
    }
  }
}
