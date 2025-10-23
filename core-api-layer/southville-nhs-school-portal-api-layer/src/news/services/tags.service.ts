import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { Tag } from '../entities';

/**
 * Service for managing tags
 * Tags are auto-created when used in articles
 */
@Injectable()
export class TagsService {
  private readonly logger = new Logger(TagsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Generate slug from tag name
   * @param name Tag name
   * @returns slug
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * Map database record to DTO
   * @param dbRecord Database record
   * @returns Tag
   */
  private mapToDto(dbRecord: any): Tag {
    return {
      id: dbRecord.id,
      name: dbRecord.name,
      slug: dbRecord.slug,
      created_at: dbRecord.created_at,
    };
  }

  /**
   * Get or create a tag by name
   * Auto-creates tag if it doesn't exist
   * @param name Tag name
   * @returns Promise<Tag>
   */
  async getOrCreate(name: string): Promise<Tag> {
    const supabase = this.supabaseService.getServiceClient();
    const trimmedName = name.trim();
    const slug = this.generateSlug(trimmedName);

    // Try to find existing tag
    const { data: existing, error: findError } = await supabase
      .from('tags')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (findError) {
      this.logger.error('Error finding tag:', findError);
      throw new BadRequestException('Failed to find tag');
    }

    // Return existing tag if found
    if (existing) {
      this.logger.debug(`Tag already exists: ${trimmedName} (${slug})`);
      return this.mapToDto(existing);
    }

    // Create new tag
    this.logger.debug(`Creating new tag: ${trimmedName} (${slug})`);

    const { data, error } = await supabase
      .from('tags')
      .insert({
        name: trimmedName,
        slug: slug,
      })
      .select()
      .single();

    if (error) {
      // Handle race condition - tag might have been created by another request
      if (error.code === '23505' || error.message?.includes('duplicate')) {
        this.logger.debug('Tag created by another request, fetching...');

        const { data: newExisting } = await supabase
          .from('tags')
          .select('*')
          .eq('slug', slug)
          .single();

        if (newExisting) {
          return this.mapToDto(newExisting);
        }
      }

      this.logger.error('Error creating tag:', error);
      throw new BadRequestException(`Failed to create tag: ${error.message}`);
    }

    this.logger.log(`Tag created: ${data.id} (${data.name})`);
    return this.mapToDto(data);
  }

  /**
   * Get or create multiple tags
   * @param names Array of tag names
   * @returns Promise<Tag[]>
   */
  async getOrCreateMultiple(names: string[]): Promise<Tag[]> {
    const uniqueNames = [...new Set(names.map((n) => n.trim()))];
    const tags: Tag[] = [];

    for (const name of uniqueNames) {
      if (name) {
        // Skip empty strings
        const tag = await this.getOrCreate(name);
        tags.push(tag);
      }
    }

    return tags;
  }

  /**
   * Get all tags
   * @returns Promise<Tag[]>
   */
  async findAll(): Promise<Tag[]> {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      this.logger.error('Error fetching tags:', error);
      throw new BadRequestException('Failed to fetch tags');
    }

    return data.map((tag) => this.mapToDto(tag));
  }

  /**
   * Get popular tags (used in most articles)
   * @param limit Number of tags to return
   * @returns Promise<Tag[]>
   */
  async findPopular(limit: number = 10): Promise<Tag[]> {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('tags')
      .select(
        `
        *,
        news_tags(count)
      `,
      )
      .limit(limit)
      .order('news_tags(count)', { ascending: false });

    if (error) {
      this.logger.error('Error fetching popular tags:', error);
      throw new BadRequestException('Failed to fetch popular tags');
    }

    return data.map((tag) => this.mapToDto(tag));
  }

  /**
   * Link tags to a news article
   * @param newsId News article ID
   * @param tagIds Array of tag IDs
   * @returns Promise<void>
   */
  async linkToNews(newsId: string, tagIds: string[]): Promise<void> {
    if (tagIds.length === 0) return;

    const supabase = this.supabaseService.getServiceClient();

    // Create junction table entries
    const junctions = tagIds.map((tagId) => ({
      news_id: newsId,
      tag_id: tagId,
    }));

    const { error } = await supabase
      .from('news_tags')
      .insert(junctions)
      .select();

    if (error) {
      // Ignore duplicate key errors (tag already linked)
      if (error.code !== '23505') {
        this.logger.error('Error linking tags to news:', error);
        throw new BadRequestException(`Failed to link tags: ${error.message}`);
      }
    }

    this.logger.debug(`Linked ${tagIds.length} tags to news ${newsId}`);
  }

  /**
   * Unlink all tags from a news article
   * @param newsId News article ID
   * @returns Promise<void>
   */
  async unlinkFromNews(newsId: string): Promise<void> {
    const supabase = this.supabaseService.getServiceClient();

    const { error } = await supabase
      .from('news_tags')
      .delete()
      .eq('news_id', newsId);

    if (error) {
      this.logger.error('Error unlinking tags from news:', error);
      throw new BadRequestException(`Failed to unlink tags: ${error.message}`);
    }

    this.logger.debug(`Unlinked all tags from news ${newsId}`);
  }

  /**
   * Update tags for a news article
   * Removes old tags and adds new ones
   * @param newsId News article ID
   * @param tagNames Array of tag names
   * @returns Promise<Tag[]>
   */
  async updateNewsTags(newsId: string, tagNames: string[]): Promise<Tag[]> {
    // Get or create all tags
    const tags = await this.getOrCreateMultiple(tagNames);

    // Unlink existing tags
    await this.unlinkFromNews(newsId);

    // Link new tags
    await this.linkToNews(
      newsId,
      tags.map((t) => t.id),
    );

    return tags;
  }
}
