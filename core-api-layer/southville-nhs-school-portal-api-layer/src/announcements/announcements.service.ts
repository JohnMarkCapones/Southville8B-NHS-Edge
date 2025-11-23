import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Announcement } from './entities/announcement.entity';
import { Tag } from './entities/tag.entity';
import { NotificationService } from '../common/services/notification.service';
import {
  NotificationType,
  NotificationCategory,
} from '../notifications/entities/notification.entity';

@Injectable()
export class AnnouncementsService {
  private readonly logger = new Logger(AnnouncementsService.name);
  private supabase: SupabaseClient;
  private readonly CACHE_TTL = 300; // 5 minutes

  constructor(
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private notificationService: NotificationService,
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
    dto: CreateAnnouncementDto,
    userId: string,
  ): Promise<Announcement> {
    const supabase = this.getSupabaseClient();

    try {
      // Validate role IDs exist (if provided)
      if (dto.targetRoleIds && dto.targetRoleIds.length > 0) {
        const validRoles = await this.validateRoleIds(dto.targetRoleIds);
        if (!validRoles) {
          throw new BadRequestException('One or more role IDs are invalid');
        }
      }

      // Ensure at least one targeting method is provided
      if (
        (!dto.targetRoleIds || dto.targetRoleIds.length === 0) &&
        (!dto.sectionIds || dto.sectionIds.length === 0)
      ) {
        throw new BadRequestException(
          'Either targetRoleIds or sectionIds must be provided',
        );
      }

      // Validate tag IDs exist (if provided)
      if (dto.tagIds && dto.tagIds.length > 0) {
        const validTags = await this.validateTagIds(dto.tagIds);
        if (!validTags) {
          throw new BadRequestException('One or more tag IDs are invalid');
        }
      }

      // Validate section IDs exist (if provided)
      if (dto.sectionIds && dto.sectionIds.length > 0) {
        const validSections = await this.validateSectionIds(dto.sectionIds);
        if (!validSections) {
          throw new BadRequestException('One or more section IDs are invalid');
        }
      }

      // Create announcement
      const { data: announcement, error: announcementError } = await supabase
        .from('announcements')
        .insert({
          user_id: userId,
          title: dto.title,
          content: dto.content,
          expires_at: dto.expiresAt,
          type: dto.type,
          visibility: dto.visibility,
        })
        .select()
        .single();

      if (announcementError) {
        this.logger.error('Error creating announcement:', announcementError);
        throw new InternalServerErrorException('Failed to create announcement');
      }

      // Create announcement targets (only if roles provided)
      if (dto.targetRoleIds && dto.targetRoleIds.length > 0) {
        const targetInserts = dto.targetRoleIds.map((roleId) => ({
          announcement_id: announcement.id,
          role_id: roleId,
        }));

        const { error: targetsError } = await supabase
          .from('announcement_targets')
          .insert(targetInserts);

        if (targetsError) {
          this.logger.error(
            'Error creating announcement targets:',
            targetsError,
          );
          await supabase
            .from('announcements')
            .delete()
            .eq('id', announcement.id);
          throw new InternalServerErrorException(
            'Failed to create announcement targets',
          );
        }
      }

      // Create announcement tags (if provided)
      if (dto.tagIds && dto.tagIds.length > 0) {
        const tagInserts = dto.tagIds.map((tagId) => ({
          announcement_id: announcement.id,
          tag_id: tagId,
        }));

        const { error: tagsError } = await supabase
          .from('announcement_tags')
          .insert(tagInserts);

        if (tagsError) {
          this.logger.error('Error creating announcement tags:', tagsError);
          // Rollback announcement, targets, and sections
          if (dto.targetRoleIds && dto.targetRoleIds.length > 0) {
            await supabase
              .from('announcement_targets')
              .delete()
              .eq('announcement_id', announcement.id);
          }
          await supabase
            .from('announcements')
            .delete()
            .eq('id', announcement.id);
          throw new InternalServerErrorException(
            'Failed to create announcement tags',
          );
        }
      }

      // Create announcement sections (if provided)
      this.logger.log(
        `Creating announcement sections. sectionIds: ${JSON.stringify(dto.sectionIds)}`,
      );
      if (dto.sectionIds && dto.sectionIds.length > 0) {
        const sectionInserts = dto.sectionIds.map((sectionId) => ({
          announcement_id: announcement.id,
          section_id: sectionId,
        }));

        const { error: sectionsError } = await supabase
          .from('announcement_sections')
          .insert(sectionInserts);

        if (sectionsError) {
          this.logger.error(
            'Error creating announcement sections:',
            sectionsError,
          );
          // Rollback announcement, targets, and tags
          if (dto.tagIds && dto.tagIds.length > 0) {
            await supabase
              .from('announcement_tags')
              .delete()
              .eq('announcement_id', announcement.id);
          }
          if (dto.targetRoleIds && dto.targetRoleIds.length > 0) {
            await supabase
              .from('announcement_targets')
              .delete()
              .eq('announcement_id', announcement.id);
          }
          await supabase
            .from('announcements')
            .delete()
            .eq('id', announcement.id);
          throw new InternalServerErrorException(
            'Failed to create announcement sections',
          );
        }
      }

      // Invalidate relevant caches
      await this.invalidateAnnouncementCaches();

      this.logger.log(`Announcement created successfully: ${announcement.id}`);

      // Notify target audience about new announcement
      const announcementData = await this.findOne(announcement.id);

      // Get target users based on roleIds and sectionIds
      if (
        (dto.targetRoleIds && dto.targetRoleIds.length > 0) ||
        (dto.sectionIds && dto.sectionIds.length > 0)
      ) {
        await this.notificationService.notifyUsersByRolesAndSections(
          dto.targetRoleIds || [],
          dto.sectionIds || [],
          `New Announcement: ${announcementData.title}`,
          `${announcementData.content?.substring(0, 100) || 'A new announcement has been posted.'}...`,
          NotificationType.INFO,
          userId,
          {
            category: NotificationCategory.EVENT_ANNOUNCEMENT,
            expiresInDays: 7,
          },
        );
        this.logger.log(
          `Created notifications for announcement: ${announcementData.title} (roles: ${dto.targetRoleIds?.length || 0}, sections: ${dto.sectionIds?.length || 0})`,
        );
      } else {
        this.logger.warn(
          `No target roles or sections specified for announcement: ${announcementData.title}`,
        );
      }

      return announcementData;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      this.logger.error('Unexpected error creating announcement:', error);
      throw new InternalServerErrorException('Failed to create announcement');
    }
  }

  async findAll(
    filters: any,
  ): Promise<{ data: Announcement[]; pagination: any }> {
    const cacheKey = `announcements:${JSON.stringify(filters)}`;

    // Try to get from cache
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for key: ${cacheKey}`);
      return cached as { data: Announcement[]; pagination: any };
    }

    const supabase = this.getSupabaseClient();
    const {
      page = 1,
      limit = 10,
      visibility,
      type,
      roleId,
      teacherId,
      sectionId,
      includeExpired = false,
    } = filters;

    let query = supabase.from('announcements').select(
      `
        *,
        user:users!fk_user(id, full_name, email),
        tags:announcement_tags(
          tag:tags(id, name, color)
        ),
        targetRoles:announcement_targets(
          role:roles(id, name)
        ),
        sections:announcement_sections(
          section:sections(id, name, grade_level)
        )
      `,
      { count: 'exact' },
    );

    // Apply filters
    if (visibility) {
      query = query.eq('visibility', visibility);
    }

    if (type) {
      query = query.eq('type', type);
    }

    if (!includeExpired) {
      const now = new Date().toISOString();
      query = query.or(`expires_at.is.null,expires_at.gt.${now}`);
    }

    if (roleId) {
      // Get announcement IDs that target this role
      const { data: targetAnnouncements } = await supabase
        .from('announcement_targets')
        .select('announcement_id')
        .eq('role_id', roleId);

      const announcementIds =
        targetAnnouncements?.map((t) => t.announcement_id) || [];

      if (announcementIds.length > 0) {
        query = query.in('id', announcementIds);
      } else {
        // No announcements target this role, return empty result
        query = query.eq('id', '00000000-0000-0000-0000-000000000000'); // Non-existent ID
      }
    }

    if (teacherId) {
      query = query.eq('user_id', teacherId);
    }

    if (sectionId) {
      // Get announcement IDs that target this section
      const { data: sectionAnnouncements } = await supabase
        .from('announcement_sections')
        .select('announcement_id')
        .eq('section_id', sectionId);

      const announcementIds =
        sectionAnnouncements?.map((s) => s.announcement_id) || [];

      if (announcementIds.length > 0) {
        query = query.in('id', announcementIds);
      } else {
        // No announcements target this section, return empty result
        query = query.eq('id', '00000000-0000-0000-0000-000000000000'); // Non-existent ID
      }
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    // Order by creation date (newest first)
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      this.logger.error('Error fetching announcements:', error);
      throw new InternalServerErrorException('Failed to fetch announcements');
    }

    // Transform the data to match our entity structure
    const transformedData =
      data?.map((announcement) => ({
        id: announcement.id,
        userId: announcement.user_id,
        title: announcement.title,
        content: announcement.content,
        createdAt: announcement.created_at,
        updatedAt: announcement.updated_at,
        expiresAt: announcement.expires_at,
        type: announcement.type,
        visibility: announcement.visibility,
        user: announcement.user,
        tags: announcement.tags?.map((t) => t.tag),
        targetRoles: announcement.targetRoles?.map((tr) => tr.role),
        sections: announcement.sections?.map((s) => s.section) || [],
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

    // Store in cache
    await this.cacheManager.set(cacheKey, result, this.CACHE_TTL);
    this.logger.debug(`Cache set for key: ${cacheKey}`);

    return result;
  }

  async findOne(id: string): Promise<Announcement> {
    const cacheKey = `announcement:${id}`;

    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached as Announcement;
    }

    const supabase = this.getSupabaseClient();

    const { data, error } = await supabase
      .from('announcements')
      .select(
        `
          *,
          user:users!fk_user(id, full_name, email),
          tags:announcement_tags(
            tag:tags(id, name, color)
          ),
          targetRoles:announcement_targets(
            role:roles(id, name)
          )
        `,
      )
      .eq('id', id)
      .single();

    if (error) {
      this.logger.error('Error fetching announcement:', error);
      throw new NotFoundException('Announcement not found');
    }

    const announcement = {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      content: data.content,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      expiresAt: data.expires_at,
      type: data.type,
      visibility: data.visibility,
      user: data.user,
      tags: data.tags?.map((t) => t.tag),
      targetRoles: data.targetRoles?.map((tr) => tr.role),
    };

    // Cache individual announcement
    await this.cacheManager.set(cacheKey, announcement, this.CACHE_TTL);

    return announcement;
  }

  async update(
    id: string,
    dto: UpdateAnnouncementDto,
    userId: string,
    userRole: string,
  ): Promise<Announcement> {
    const supabase = this.getSupabaseClient();

    try {
      // Security: Check ownership or admin privilege
      const existing = await this.findOne(id);

      if (existing.userId !== userId && userRole?.toLowerCase() !== 'admin') {
        this.logger.warn(
          `Unauthorized update attempt on announcement ${id} by user ${userId}`,
        );
        throw new ForbiddenException(
          'You can only update your own announcements',
        );
      }

      // Validate role IDs exist (if provided)
      if (dto.targetRoleIds) {
        const validRoles = await this.validateRoleIds(dto.targetRoleIds);
        if (!validRoles) {
          throw new BadRequestException('One or more role IDs are invalid');
        }
      }

      // Validate tag IDs exist (if provided)
      if (dto.tagIds) {
        const validTags = await this.validateTagIds(dto.tagIds);
        if (!validTags) {
          throw new BadRequestException('One or more tag IDs are invalid');
        }
      }

      // Update announcement
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (dto.title) updateData.title = dto.title;
      if (dto.content) updateData.content = dto.content;
      if (dto.expiresAt !== undefined) updateData.expires_at = dto.expiresAt;
      if (dto.type !== undefined) updateData.type = dto.type;
      if (dto.visibility) updateData.visibility = dto.visibility;

      const { error: updateError } = await supabase
        .from('announcements')
        .update(updateData)
        .eq('id', id);

      if (updateError) {
        this.logger.error('Error updating announcement:', updateError);
        throw new InternalServerErrorException('Failed to update announcement');
      }

      // Update targets if provided
      if (dto.targetRoleIds) {
        // Delete existing targets
        await supabase
          .from('announcement_targets')
          .delete()
          .eq('announcement_id', id);

        // Insert new targets
        const targetInserts = dto.targetRoleIds.map((roleId) => ({
          announcement_id: id,
          role_id: roleId,
        }));

        const { error: targetsError } = await supabase
          .from('announcement_targets')
          .insert(targetInserts);

        if (targetsError) {
          this.logger.error(
            'Error updating announcement targets:',
            targetsError,
          );
          throw new InternalServerErrorException(
            'Failed to update announcement targets',
          );
        }
      }

      // Update tags if provided
      if (dto.tagIds !== undefined) {
        // Delete existing tags
        await supabase
          .from('announcement_tags')
          .delete()
          .eq('announcement_id', id);

        // Insert new tags (if any)
        if (dto.tagIds.length > 0) {
          const tagInserts = dto.tagIds.map((tagId) => ({
            announcement_id: id,
            tag_id: tagId,
          }));

          const { error: tagsError } = await supabase
            .from('announcement_tags')
            .insert(tagInserts);

          if (tagsError) {
            this.logger.error('Error updating announcement tags:', tagsError);
            throw new InternalServerErrorException(
              'Failed to update announcement tags',
            );
          }
        }
      }

      // Invalidate caches
      await this.invalidateAnnouncementCaches();
      await this.cacheManager.del(`announcement:${id}`);

      this.logger.log(`Announcement updated successfully: ${id}`);

      // Notify target audience about announcement update
      try {
        const announcementData = await this.findOne(id);
        const targetUserIds = await this.getTargetUsersForAnnouncement(id);

        if (targetUserIds.length > 0) {
          await this.notificationService.notifyUsers(
            targetUserIds,
            `Announcement Updated: ${announcementData.title}`,
            `The announcement "${announcementData.title}" has been updated.`,
            NotificationType.INFO,
            userId,
            {
              category: NotificationCategory.EVENT_ANNOUNCEMENT,
              expiresInDays: 7,
            },
          );
          this.logger.log(
            `📢 Notified ${targetUserIds.length} users about announcement update: ${announcementData.title}`,
          );
        }
      } catch (notificationError) {
        this.logger.warn(
          'Failed to create notifications for announcement update:',
          notificationError,
        );
      }

      return await this.findOne(id);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ForbiddenException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      this.logger.error('Unexpected error updating announcement:', error);
      throw new InternalServerErrorException('Failed to update announcement');
    }
  }

  async remove(id: string, userId: string, userRole: string): Promise<Announcement> {
    const supabase = this.getSupabaseClient();

    // Fetch the full announcement to check ownership AND to return for audit log
    const { data: announcement, error: fetchError } = await supabase
      .from('announcements')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !announcement) {
      throw new NotFoundException(`Announcement with ID ${id} not found`);
    }

    // Check ownership: Teachers can only delete their own, Admins/SuperAdmins can delete any
    this.logger.log(`Delete permission check - userRole: "${userRole}", userId: ${userId}, announcement.user_id: ${announcement.user_id}`);
    const isAdmin = userRole === 'Admin' || userRole === 'SuperAdmin';
    if (!isAdmin && announcement.user_id !== userId) {
      this.logger.warn(`Delete forbidden - isAdmin: ${isAdmin}, userRole: "${userRole}"`);
      throw new ForbiddenException(
        'You can only delete your own announcements',
      );
    }

    // Proceed with deletion
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);

    if (error) {
      this.logger.error('Error deleting announcement:', error);
      throw new InternalServerErrorException(
        `Failed to delete announcement: ${error.message}`,
      );
    }

    // Invalidate caches
    await this.invalidateAnnouncementCaches();
    await this.cacheManager.del(`announcement:${id}`);

    this.logger.log(`Announcement deleted successfully: ${id}`);

    // Return the entity so audit interceptor can capture the title
    return announcement;
  }

  async getAnnouncementsForUser(
    userId: string,
    userRoleId: string,
    filters: any = {},
  ): Promise<{ data: Announcement[]; pagination: any }> {
    const supabase = this.getSupabaseClient();
    const { page = 1, limit = 10, includeExpired = false } = filters;

    let query = supabase.from('announcements').select(
      `
        *,
        user:users!fk_user(id, full_name, email),
        tags:announcement_tags(
          tag:tags(id, name, color)
        ),
        targetRoles:announcement_targets(
          role:roles(id, name)
        )
      `,
      { count: 'exact' },
    );

    // Filter by user's role or announcements with no specific targets
    query = query.or(
      `announcement_targets.role_id.eq.${userRoleId},announcement_targets.role_id.is.null`,
    );

    // Only show public announcements
    query = query.eq('visibility', 'public');

    if (!includeExpired) {
      const now = new Date().toISOString();
      query = query.or(`expires_at.is.null,expires_at.gt.${now}`);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    // Order by creation date (newest first)
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      this.logger.error('Error fetching user announcements:', error);
      throw new InternalServerErrorException(
        'Failed to fetch user announcements',
      );
    }

    // Transform the data
    const transformedData =
      data?.map((announcement) => ({
        id: announcement.id,
        userId: announcement.user_id,
        title: announcement.title,
        content: announcement.content,
        createdAt: announcement.created_at,
        updatedAt: announcement.updated_at,
        expiresAt: announcement.expires_at,
        type: announcement.type,
        visibility: announcement.visibility,
        user: announcement.user,
        tags: announcement.tags?.map((t) => t.tag),
        targetRoles: announcement.targetRoles?.map((tr) => tr.role),
      })) || [];

    return {
      data: transformedData,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / Number(limit)),
      },
    };
  }

  // Tag management methods
  async createTag(dto: CreateTagDto): Promise<Tag> {
    const supabase = this.getSupabaseClient();

    // Check if tag name is unique
    const isUnique = await this.checkTagNameUnique(dto.name);
    if (!isUnique) {
      throw new BadRequestException('Tag name already exists');
    }

    const { data, error } = await supabase
      .from('tags')
      .insert({
        name: dto.name,
        color: dto.color,
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Error creating tag:', error);
      throw new InternalServerErrorException('Failed to create tag');
    }

    // Invalidate tags cache
    await this.cacheManager.del('tags:all');

    this.logger.log(`Tag created successfully: ${data.id}`);
    return data;
  }

  async findAllTags(): Promise<Tag[]> {
    const cacheKey = 'tags:all';

    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached as Tag[];
    }

    const supabase = this.getSupabaseClient();

    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name');

    if (error) {
      this.logger.error('Error fetching tags:', error);
      throw new InternalServerErrorException('Failed to fetch tags');
    }

    await this.cacheManager.set(cacheKey, data, 3600); // Cache for 1 hour
    return data || [];
  }

  async updateTag(id: string, dto: UpdateTagDto): Promise<Tag> {
    const supabase = this.getSupabaseClient();

    // Check if tag exists
    const existing = await this.findTagById(id);

    // Check if new name is unique (if changing name)
    if (dto.name && dto.name !== existing.name) {
      const isUnique = await this.checkTagNameUnique(dto.name, id);
      if (!isUnique) {
        throw new BadRequestException('Tag name already exists');
      }
    }

    const { data, error } = await supabase
      .from('tags')
      .update(dto)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      this.logger.error('Error updating tag:', error);
      throw new InternalServerErrorException('Failed to update tag');
    }

    // Invalidate tags cache
    await this.cacheManager.del('tags:all');

    this.logger.log(`Tag updated successfully: ${id}`);
    return data;
  }

  async removeTag(id: string): Promise<void> {
    const supabase = this.getSupabaseClient();

    // Check if tag exists
    await this.findTagById(id);

    const { error } = await supabase.from('tags').delete().eq('id', id);

    if (error) {
      this.logger.error('Error deleting tag:', error);
      throw new InternalServerErrorException('Failed to delete tag');
    }

    // Invalidate tags cache
    await this.cacheManager.del('tags:all');

    this.logger.log(`Tag deleted successfully: ${id}`);
  }

  async getStats(teacherId: string): Promise<any> {
    const supabase = this.getSupabaseClient();

    try {
      // Get total announcements by teacher
      const { count: totalCount, error: totalError } = await supabase
        .from('announcements')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', teacherId);

      if (totalError) {
        this.logger.error('Error fetching total announcements:', totalError);
        throw new InternalServerErrorException(
          'Failed to fetch total announcements',
        );
      }

      // Get active announcements (not expired, regardless of visibility)
      const now = new Date().toISOString();
      const { count: activeCount, error: activeError } = await supabase
        .from('announcements')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', teacherId)
        .or(`expires_at.is.null,expires_at.gt.${now}`);

      if (activeError) {
        this.logger.error('Error fetching active announcements:', activeError);
        throw new InternalServerErrorException(
          'Failed to fetch active announcements',
        );
      }

      return {
        totalCount: totalCount || 0,
        activeCount: activeCount || 0,
        totalViews: 0, // Placeholder
        engagementRate: 0, // Placeholder
      };
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.error('Unexpected error getting stats:', error);
      throw new InternalServerErrorException('Failed to get stats');
    }
  }

  // Helper methods
  private async validateRoleIds(roleIds: string[]): Promise<boolean> {
    const supabase = this.getSupabaseClient();
    const { data: roles } = await supabase
      .from('roles')
      .select('id')
      .in('id', roleIds);

    return !!(roles && roles.length === roleIds.length);
  }

  private async validateTagIds(tagIds: string[]): Promise<boolean> {
    const supabase = this.getSupabaseClient();
    const { data: tags } = await supabase
      .from('tags')
      .select('id')
      .in('id', tagIds);

    return !!(tags && tags.length === tagIds.length);
  }

  private async validateSectionIds(sectionIds: string[]): Promise<boolean> {
    const supabase = this.getSupabaseClient();
    const { data: sections } = await supabase
      .from('sections')
      .select('id')
      .in('id', sectionIds);

    return !!(sections && sections.length === sectionIds.length);
  }

  private async checkTagNameUnique(
    name: string,
    excludeId?: string,
  ): Promise<boolean> {
    const supabase = this.getSupabaseClient();
    let query = supabase.from('tags').select('id').ilike('name', name);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data } = await query;
    return !data || data.length === 0;
  }

  private async findTagById(id: string): Promise<Tag> {
    const supabase = this.getSupabaseClient();
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new NotFoundException('Tag not found');
    }

    return data;
  }

  private async invalidateAnnouncementCaches(): Promise<void> {
    try {
      // For cache-manager, we'll use a different approach since store.keys() doesn't exist
      // We'll track cache keys manually or use a different invalidation strategy
      this.logger.debug('Invalidating announcement caches');
    } catch (error) {
      this.logger.warn('Error invalidating announcement caches:', error);
    }
  }

  /**
   * Get target user IDs for an announcement based on targetRoleIds and sectionIds
   */
  private async getTargetUsersForAnnouncement(
    announcementId: string,
  ): Promise<string[]> {
    try {
      const supabase = this.getSupabaseClient();
      const roleIds: string[] = [];
      const sectionIds: string[] = [];

      // Get target roles
      const { data: targetRoles } = await supabase
        .from('announcement_targets')
        .select('role_id')
        .eq('announcement_id', announcementId);

      if (targetRoles) {
        roleIds.push(...targetRoles.map((tr) => tr.role_id).filter(Boolean));
      }

      // Get target sections
      const { data: targetSections } = await supabase
        .from('announcement_sections')
        .select('section_id')
        .eq('announcement_id', announcementId);

      if (targetSections) {
        sectionIds.push(
          ...targetSections.map((ts) => ts.section_id).filter(Boolean),
        );
      }

      // If no targeting, return empty array
      if (roleIds.length === 0 && sectionIds.length === 0) {
        this.logger.warn(
          `No target roles or sections found for announcement: ${announcementId}`,
        );
        return [];
      }

      // Use NotificationService helper to get users
      const userIds = new Set<string>();

      // Get users by roles
      if (roleIds.length > 0) {
        const { data: users } = await supabase
          .from('users')
          .select('id')
          .in('role_id', roleIds)
          .eq('status', 'active');

        if (users) {
          users.forEach((u) => userIds.add(u.id));
        }
      }

      // Get users by sections (students only)
      if (sectionIds.length > 0) {
        const { data: students } = await supabase
          .from('students')
          .select('user_id')
          .in('section_id', sectionIds);

        if (students) {
          const studentUserIds = students.map((s) => s.user_id).filter(Boolean);

          // Verify these users are active
          if (studentUserIds.length > 0) {
            const { data: activeUsers } = await supabase
              .from('users')
              .select('id')
              .in('id', studentUserIds)
              .eq('status', 'active');

            if (activeUsers) {
              activeUsers.forEach((u) => userIds.add(u.id));
            }
          }
        }
      }

      return Array.from(userIds);
    } catch (error) {
      this.logger.error('Error in getTargetUsersForAnnouncement:', error);
      return [];
    }
  }
}
