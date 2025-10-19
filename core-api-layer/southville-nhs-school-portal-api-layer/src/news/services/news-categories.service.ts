import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateNewsCategoryDto } from '../dto';
import { NewsCategory } from '../entities';

/**
 * Service for managing news categories
 * Advisers can create/update/delete categories
 */
@Injectable()
export class NewsCategoriesService {
  private readonly logger = new Logger(NewsCategoriesService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Generate slug from category name
   * @param name Category name
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
   * @returns NewsCategory
   */
  private mapToDto(dbRecord: any): NewsCategory {
    return {
      id: dbRecord.id,
      name: dbRecord.name,
      slug: dbRecord.slug,
      description: dbRecord.description,
      created_at: dbRecord.created_at,
      updated_at: dbRecord.updated_at,
    };
  }

  /**
   * Create a new category
   * @param createDto Create category DTO
   * @returns Promise<NewsCategory>
   */
  async create(createDto: CreateNewsCategoryDto): Promise<NewsCategory> {
    const supabase = this.supabaseService.getServiceClient();
    const slug = this.generateSlug(createDto.name);

    this.logger.debug(`Creating category: ${createDto.name} (${slug})`);

    const { data, error } = await supabase
      .from('news_categories')
      .insert({
        name: createDto.name,
        slug: slug,
        description: createDto.description || null,
      })
      .select()
      .single();

    if (error) {
      // Check for unique constraint violation
      if (error.code === '23505' || error.message?.includes('duplicate')) {
        throw new ConflictException(
          `Category with name "${createDto.name}" already exists`,
        );
      }

      this.logger.error('Error creating category:', error);
      throw new BadRequestException(
        `Failed to create category: ${error.message}`,
      );
    }

    this.logger.log(`Category created: ${data.id}`);
    return this.mapToDto(data);
  }

  /**
   * Get all categories
   * @returns Promise<NewsCategory[]>
   */
  async findAll(): Promise<NewsCategory[]> {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('news_categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      this.logger.error('Error fetching categories:', error);
      throw new BadRequestException('Failed to fetch categories');
    }

    return data.map((category) => this.mapToDto(category));
  }

  /**
   * Get category by ID
   * @param id Category ID
   * @returns Promise<NewsCategory>
   */
  async findOne(id: string): Promise<NewsCategory> {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('news_categories')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return this.mapToDto(data);
  }

  /**
   * Get category by slug
   * @param slug Category slug
   * @returns Promise<NewsCategory>
   */
  async findBySlug(slug: string): Promise<NewsCategory> {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('news_categories')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !data) {
      throw new NotFoundException(`Category with slug "${slug}" not found`);
    }

    return this.mapToDto(data);
  }

  /**
   * Update category
   * @param id Category ID
   * @param updateDto Update category DTO
   * @returns Promise<NewsCategory>
   */
  async update(
    id: string,
    updateDto: Partial<CreateNewsCategoryDto>,
  ): Promise<NewsCategory> {
    const supabase = this.supabaseService.getServiceClient();

    // Verify category exists
    await this.findOne(id);

    const updatePayload: any = {
      updated_at: new Date().toISOString(),
    };

    if (updateDto.name) {
      updatePayload.name = updateDto.name;
      updatePayload.slug = this.generateSlug(updateDto.name);
    }

    if (updateDto.description !== undefined) {
      updatePayload.description = updateDto.description;
    }

    const { data, error } = await supabase
      .from('news_categories')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505' || error.message?.includes('duplicate')) {
        throw new ConflictException(
          `Category with name "${updateDto.name}" already exists`,
        );
      }

      this.logger.error('Error updating category:', error);
      throw new BadRequestException(
        `Failed to update category: ${error.message}`,
      );
    }

    this.logger.log(`Category updated: ${id}`);
    return this.mapToDto(data);
  }

  /**
   * Delete category
   * @param id Category ID
   * @returns Promise<void>
   */
  async remove(id: string): Promise<void> {
    const supabase = this.supabaseService.getServiceClient();

    // Verify category exists
    await this.findOne(id);

    const { error } = await supabase
      .from('news_categories')
      .delete()
      .eq('id', id);

    if (error) {
      this.logger.error('Error deleting category:', error);
      throw new BadRequestException(
        `Failed to delete category: ${error.message}`,
      );
    }

    this.logger.log(`Category deleted: ${id}`);
  }
}
