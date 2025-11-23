import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { BannerNotification } from './entities/banner.entity';

@Injectable()
export class BannerNotificationsService {
  private readonly logger = new Logger(BannerNotificationsService.name);
  private supabase: SupabaseClient;
  private readonly CACHE_TTL = 300; // 5 minutes

  constructor(
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private getSupabaseClient(): SupabaseClient {
    if (!this.supabase) {
      const supabaseUrl = this.configService.get<string>('supabase.url');
      const supabaseServiceKey = this.configService.get<string>(
        'supabase.serviceRoleKey',
      );

      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase configuration is missing');
      }

      this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    }
    return this.supabase;
  }

  async create(
    dto: CreateBannerDto,
    userId: string,
  ): Promise<BannerNotification> {
    const supabase = this.getSupabaseClient();

    try {
      // Validate date range
      const startDate = new Date(dto.startDate);
      const endDate = new Date(dto.endDate);

      if (endDate <= startDate) {
        throw new BadRequestException('End date must be after start date');
      }

      // Validate action fields if hasAction is true
      if (dto.hasAction && (!dto.actionLabel || !dto.actionUrl)) {
        throw new BadRequestException(
          'Action label and URL are required when hasAction is true',
        );
      }

      // Create banner
      const { data: banner, error } = await supabase
        .from('banner_notifications')
        .insert({
          message: dto.message,
          short_message: dto.shortMessage,
          type: dto.type,
          is_active: dto.isActive,
          is_dismissible: dto.isDismissible,
          has_action: dto.hasAction,
          action_label: dto.actionLabel,
          action_url: dto.actionUrl,
          start_date: dto.startDate,
          end_date: dto.endDate,
          created_by: userId,
          template: dto.template,
        })
        .select()
        .single();

      if (error) {
        this.logger.error('Error creating banner:', error);
        throw new InternalServerErrorException('Failed to create banner');
      }

      // Invalidate cache
      await this.invalidateBannerCaches();

      this.logger.log(`Banner created successfully: ${banner.id}`);
      return await this.findOne(banner.id);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      this.logger.error('Unexpected error creating banner:', error);
      throw new InternalServerErrorException('Failed to create banner');
    }
  }

  async findAll(
    filters: any = {},
  ): Promise<{ data: BannerNotification[]; pagination: any }> {
    const cacheKey = `banners:${JSON.stringify(filters)}`;

    // Try cache
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for key: ${cacheKey}`);
      return cached as { data: BannerNotification[]; pagination: any };
    }

    const supabase = this.getSupabaseClient();
    const { page = 1, limit = 10, isActive, type } = filters;

    let query = supabase.from('banner_notifications').select(
      `*`,
      { count: 'exact' },
    );

    // Apply filters
    if (isActive !== undefined) {
      query = query.eq('is_active', isActive);
    }

    if (type) {
      query = query.eq('type', type);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    // Order by creation date (newest first)
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      this.logger.error('Error fetching banners:', error);
      throw new InternalServerErrorException('Failed to fetch banners');
    }

    // Transform data
    const transformedData =
      data?.map((banner) => ({
        id: banner.id,
        message: banner.message,
        shortMessage: banner.short_message,
        type: banner.type,
        isActive: banner.is_active,
        isDismissible: banner.is_dismissible,
        hasAction: banner.has_action,
        actionLabel: banner.action_label,
        actionUrl: banner.action_url,
        startDate: banner.start_date,
        endDate: banner.end_date,
        createdBy: banner.created_by,
        template: banner.template,
        createdAt: banner.created_at,
        updatedAt: banner.updated_at,
        creator: banner.creator,
      })) || [];

    const result = {
      data: transformedData,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / Number(limit)),
      },
    };

    // Cache result
    await this.cacheManager.set(cacheKey, result, this.CACHE_TTL);
    this.logger.debug(`Cache set for key: ${cacheKey}`);

    return result;
  }

  async findActive(): Promise<BannerNotification[]> {
    const cacheKey = 'banners:active';

    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached as BannerNotification[];
    }

    const supabase = this.getSupabaseClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('banner_notifications')
      .select('*')
      .eq('is_active', true)
      .lte('start_date', now)
      .gte('end_date', now)
      .order('created_at', { ascending: false });

    if (error) {
      this.logger.error('Error fetching active banners:', error);
      throw new InternalServerErrorException('Failed to fetch active banners');
    }

    const transformedData =
      data?.map((banner) => ({
        id: banner.id,
        message: banner.message,
        shortMessage: banner.short_message,
        type: banner.type,
        isActive: banner.is_active,
        isDismissible: banner.is_dismissible,
        hasAction: banner.has_action,
        actionLabel: banner.action_label,
        actionUrl: banner.action_url,
        startDate: banner.start_date,
        endDate: banner.end_date,
        createdBy: banner.created_by,
        template: banner.template,
        createdAt: banner.created_at,
        updatedAt: banner.updated_at,
      })) || [];

    // Cache for shorter time (1 minute) since this changes frequently
    await this.cacheManager.set(cacheKey, transformedData, 60);

    return transformedData;
  }

  async findOne(id: string): Promise<BannerNotification> {
    const cacheKey = `banner:${id}`;

    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached as BannerNotification;
    }

    const supabase = this.getSupabaseClient();

    const { data, error } = await supabase
      .from('banner_notifications')
      .select(`*`)
      .eq('id', id)
      .single();

    if (error) {
      this.logger.error('Error fetching banner:', error);
      throw new NotFoundException('Banner not found');
    }

    const banner = {
      id: data.id,
      message: data.message,
      shortMessage: data.short_message,
      type: data.type,
      isActive: data.is_active,
      isDismissible: data.is_dismissible,
      hasAction: data.has_action,
      actionLabel: data.action_label,
      actionUrl: data.action_url,
      startDate: data.start_date,
      endDate: data.end_date,
      createdBy: data.created_by,
      template: data.template,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      creator: data.creator,
    };

    await this.cacheManager.set(cacheKey, banner, this.CACHE_TTL);
    return banner;
  }

  async update(id: string, dto: UpdateBannerDto): Promise<{ before: BannerNotification; after: BannerNotification }> {
    const supabase = this.getSupabaseClient();

    try {
      // Get the banner before update (for audit logging)
      const beforeState = await this.findOne(id);

      // Validate date range if both dates are provided
      if (dto.startDate && dto.endDate) {
        const startDate = new Date(dto.startDate);
        const endDate = new Date(dto.endDate);

        if (endDate <= startDate) {
          throw new BadRequestException('End date must be after start date');
        }
      }

      // Validate action fields if hasAction is being set to true
      if (dto.hasAction && (!dto.actionLabel || !dto.actionUrl)) {
        throw new BadRequestException(
          'Action label and URL are required when hasAction is true',
        );
      }

      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (dto.message !== undefined) updateData.message = dto.message;
      if (dto.shortMessage !== undefined)
        updateData.short_message = dto.shortMessage;
      if (dto.type !== undefined) updateData.type = dto.type;
      if (dto.isActive !== undefined) updateData.is_active = dto.isActive;
      if (dto.isDismissible !== undefined)
        updateData.is_dismissible = dto.isDismissible;
      if (dto.hasAction !== undefined) updateData.has_action = dto.hasAction;
      if (dto.actionLabel !== undefined)
        updateData.action_label = dto.actionLabel;
      if (dto.actionUrl !== undefined) updateData.action_url = dto.actionUrl;
      if (dto.startDate !== undefined) updateData.start_date = dto.startDate;
      if (dto.endDate !== undefined) updateData.end_date = dto.endDate;
      if (dto.template !== undefined) updateData.template = dto.template;

      const { error } = await supabase
        .from('banner_notifications')
        .update(updateData)
        .eq('id', id);

      if (error) {
        this.logger.error('Error updating banner:', error);
        throw new InternalServerErrorException('Failed to update banner');
      }

      // Invalidate caches
      await this.invalidateBannerCaches();
      await this.cacheManager.del(`banner:${id}`);

      this.logger.log(`Banner updated successfully: ${id}`);
      const afterState = await this.findOne(id);

      // Return before and after states for audit logging
      return { before: beforeState, after: afterState };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      this.logger.error('Unexpected error updating banner:', error);
      throw new InternalServerErrorException('Failed to update banner');
    }
  }

  async toggleActive(id: string): Promise<{ before: BannerNotification; after: BannerNotification }> {
    const banner = await this.findOne(id);
    return this.update(id, { isActive: !banner.isActive });
  }

  async remove(id: string): Promise<BannerNotification> {
    const supabase = this.getSupabaseClient();

    // Get banner before deleting (for audit logging)
    const banner = await this.findOne(id);

    const { error } = await supabase
      .from('banner_notifications')
      .delete()
      .eq('id', id);

    if (error) {
      this.logger.error('Error deleting banner:', error);
      throw new InternalServerErrorException('Failed to delete banner');
    }

    // Invalidate caches
    await this.invalidateBannerCaches();
    await this.cacheManager.del(`banner:${id}`);

    this.logger.log(`Banner deleted successfully: ${id}`);

    // Return the deleted banner for audit logging
    return banner;
  }

  private async invalidateBannerCaches(): Promise<void> {
    try {
      await this.cacheManager.del('banners:active');
      this.logger.debug('Invalidated banner caches');
    } catch (error) {
      this.logger.warn('Error invalidating banner caches:', error);
    }
  }
}
