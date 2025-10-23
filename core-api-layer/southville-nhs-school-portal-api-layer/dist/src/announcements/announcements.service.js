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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AnnouncementsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnouncementsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cache_manager_1 = require("@nestjs/cache-manager");
const supabase_js_1 = require("@supabase/supabase-js");
let AnnouncementsService = AnnouncementsService_1 = class AnnouncementsService {
    configService;
    cacheManager;
    logger = new common_1.Logger(AnnouncementsService_1.name);
    supabase;
    CACHE_TTL = 300;
    constructor(configService, cacheManager) {
        this.configService = configService;
        this.cacheManager = cacheManager;
    }
    getSupabaseClient() {
        if (!this.supabase) {
            const supabaseUrl = this.configService.get('supabase.url');
            const supabaseServiceKey = this.configService.get('supabase.serviceRoleKey');
            if (!supabaseUrl || !supabaseServiceKey) {
                throw new Error('Supabase configuration is missing');
            }
            this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey);
        }
        return this.supabase;
    }
    async create(dto, userId) {
        const supabase = this.getSupabaseClient();
        try {
            const validRoles = await this.validateRoleIds(dto.targetRoleIds);
            if (!validRoles) {
                throw new common_1.BadRequestException('One or more role IDs are invalid');
            }
            if (dto.tagIds && dto.tagIds.length > 0) {
                const validTags = await this.validateTagIds(dto.tagIds);
                if (!validTags) {
                    throw new common_1.BadRequestException('One or more tag IDs are invalid');
                }
            }
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
                throw new common_1.InternalServerErrorException('Failed to create announcement');
            }
            const targetInserts = dto.targetRoleIds.map((roleId) => ({
                announcement_id: announcement.id,
                role_id: roleId,
            }));
            const { error: targetsError } = await supabase
                .from('announcement_targets')
                .insert(targetInserts);
            if (targetsError) {
                this.logger.error('Error creating announcement targets:', targetsError);
                await supabase.from('announcements').delete().eq('id', announcement.id);
                throw new common_1.InternalServerErrorException('Failed to create announcement targets');
            }
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
                    await supabase
                        .from('announcement_targets')
                        .delete()
                        .eq('announcement_id', announcement.id);
                    await supabase
                        .from('announcements')
                        .delete()
                        .eq('id', announcement.id);
                    throw new common_1.InternalServerErrorException('Failed to create announcement tags');
                }
            }
            await this.invalidateAnnouncementCaches();
            this.logger.log(`Announcement created successfully: ${announcement.id}`);
            return await this.findOne(announcement.id);
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            this.logger.error('Unexpected error creating announcement:', error);
            throw new common_1.InternalServerErrorException('Failed to create announcement');
        }
    }
    async findAll(filters) {
        const cacheKey = `announcements:${JSON.stringify(filters)}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            this.logger.debug(`Cache hit for key: ${cacheKey}`);
            return cached;
        }
        const supabase = this.getSupabaseClient();
        const { page = 1, limit = 10, visibility, type, roleId, includeExpired = false, } = filters;
        let query = supabase.from('announcements').select(`
        *,
        user:users!fk_user(id, full_name, email),
        tags:announcement_tags(
          tag:tags(id, name, color)
        ),
        targetRoles:announcement_targets(
          role:roles(id, name)
        )
      `, { count: 'exact' });
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
            const { data: targetAnnouncements } = await supabase
                .from('announcement_targets')
                .select('announcement_id')
                .eq('role_id', roleId);
            const announcementIds = targetAnnouncements?.map((t) => t.announcement_id) || [];
            if (announcementIds.length > 0) {
                query = query.in('id', announcementIds);
            }
            else {
                query = query.eq('id', '00000000-0000-0000-0000-000000000000');
            }
        }
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);
        query = query.order('created_at', { ascending: false });
        const { data, error, count } = await query;
        if (error) {
            this.logger.error('Error fetching announcements:', error);
            throw new common_1.InternalServerErrorException('Failed to fetch announcements');
        }
        const transformedData = data?.map((announcement) => ({
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
        const result = {
            data: transformedData,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: count || 0,
                totalPages: Math.ceil((count || 0) / Number(limit)),
            },
        };
        await this.cacheManager.set(cacheKey, result, this.CACHE_TTL);
        this.logger.debug(`Cache set for key: ${cacheKey}`);
        return result;
    }
    async findOne(id) {
        const cacheKey = `announcement:${id}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        const supabase = this.getSupabaseClient();
        const { data, error } = await supabase
            .from('announcements')
            .select(`
          *,
          user:users!fk_user(id, full_name, email),
          tags:announcement_tags(
            tag:tags(id, name, color)
          ),
          targetRoles:announcement_targets(
            role:roles(id, name)
          )
        `)
            .eq('id', id)
            .single();
        if (error) {
            this.logger.error('Error fetching announcement:', error);
            throw new common_1.NotFoundException('Announcement not found');
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
        await this.cacheManager.set(cacheKey, announcement, this.CACHE_TTL);
        return announcement;
    }
    async update(id, dto, userId, userRole) {
        const supabase = this.getSupabaseClient();
        try {
            const existing = await this.findOne(id);
            if (existing.userId !== userId && userRole?.toLowerCase() !== 'admin') {
                this.logger.warn(`Unauthorized update attempt on announcement ${id} by user ${userId}`);
                throw new common_1.ForbiddenException('You can only update your own announcements');
            }
            if (dto.targetRoleIds) {
                const validRoles = await this.validateRoleIds(dto.targetRoleIds);
                if (!validRoles) {
                    throw new common_1.BadRequestException('One or more role IDs are invalid');
                }
            }
            if (dto.tagIds) {
                const validTags = await this.validateTagIds(dto.tagIds);
                if (!validTags) {
                    throw new common_1.BadRequestException('One or more tag IDs are invalid');
                }
            }
            const updateData = {
                updated_at: new Date().toISOString(),
            };
            if (dto.title)
                updateData.title = dto.title;
            if (dto.content)
                updateData.content = dto.content;
            if (dto.expiresAt !== undefined)
                updateData.expires_at = dto.expiresAt;
            if (dto.type !== undefined)
                updateData.type = dto.type;
            if (dto.visibility)
                updateData.visibility = dto.visibility;
            const { error: updateError } = await supabase
                .from('announcements')
                .update(updateData)
                .eq('id', id);
            if (updateError) {
                this.logger.error('Error updating announcement:', updateError);
                throw new common_1.InternalServerErrorException('Failed to update announcement');
            }
            if (dto.targetRoleIds) {
                await supabase
                    .from('announcement_targets')
                    .delete()
                    .eq('announcement_id', id);
                const targetInserts = dto.targetRoleIds.map((roleId) => ({
                    announcement_id: id,
                    role_id: roleId,
                }));
                const { error: targetsError } = await supabase
                    .from('announcement_targets')
                    .insert(targetInserts);
                if (targetsError) {
                    this.logger.error('Error updating announcement targets:', targetsError);
                    throw new common_1.InternalServerErrorException('Failed to update announcement targets');
                }
            }
            if (dto.tagIds !== undefined) {
                await supabase
                    .from('announcement_tags')
                    .delete()
                    .eq('announcement_id', id);
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
                        throw new common_1.InternalServerErrorException('Failed to update announcement tags');
                    }
                }
            }
            await this.invalidateAnnouncementCaches();
            await this.cacheManager.del(`announcement:${id}`);
            this.logger.log(`Announcement updated successfully: ${id}`);
            return await this.findOne(id);
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.ForbiddenException ||
                error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            this.logger.error('Unexpected error updating announcement:', error);
            throw new common_1.InternalServerErrorException('Failed to update announcement');
        }
    }
    async remove(id) {
        const supabase = this.getSupabaseClient();
        const existing = await this.findOne(id);
        const { error } = await supabase
            .from('announcements')
            .delete()
            .eq('id', id);
        if (error) {
            this.logger.error('Error deleting announcement:', error);
            throw new common_1.InternalServerErrorException('Failed to delete announcement');
        }
        await this.invalidateAnnouncementCaches();
        await this.cacheManager.del(`announcement:${id}`);
        this.logger.log(`Announcement deleted successfully: ${id}`);
    }
    async getAnnouncementsForUser(userId, userRoleId, filters = {}) {
        const supabase = this.getSupabaseClient();
        const { page = 1, limit = 10, includeExpired = false } = filters;
        let query = supabase.from('announcements').select(`
        *,
        user:users!fk_user(id, full_name, email),
        tags:announcement_tags(
          tag:tags(id, name, color)
        ),
        targetRoles:announcement_targets(
          role:roles(id, name)
        )
      `, { count: 'exact' });
        query = query.or(`announcement_targets.role_id.eq.${userRoleId},announcement_targets.role_id.is.null`);
        query = query.eq('visibility', 'public');
        if (!includeExpired) {
            const now = new Date().toISOString();
            query = query.or(`expires_at.is.null,expires_at.gt.${now}`);
        }
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);
        query = query.order('created_at', { ascending: false });
        const { data, error, count } = await query;
        if (error) {
            this.logger.error('Error fetching user announcements:', error);
            throw new common_1.InternalServerErrorException('Failed to fetch user announcements');
        }
        const transformedData = data?.map((announcement) => ({
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
    async createTag(dto) {
        const supabase = this.getSupabaseClient();
        const isUnique = await this.checkTagNameUnique(dto.name);
        if (!isUnique) {
            throw new common_1.BadRequestException('Tag name already exists');
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
            throw new common_1.InternalServerErrorException('Failed to create tag');
        }
        await this.cacheManager.del('tags:all');
        this.logger.log(`Tag created successfully: ${data.id}`);
        return data;
    }
    async findAllTags() {
        const cacheKey = 'tags:all';
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        const supabase = this.getSupabaseClient();
        const { data, error } = await supabase
            .from('tags')
            .select('*')
            .order('name');
        if (error) {
            this.logger.error('Error fetching tags:', error);
            throw new common_1.InternalServerErrorException('Failed to fetch tags');
        }
        await this.cacheManager.set(cacheKey, data, 3600);
        return data || [];
    }
    async updateTag(id, dto) {
        const supabase = this.getSupabaseClient();
        const existing = await this.findTagById(id);
        if (dto.name && dto.name !== existing.name) {
            const isUnique = await this.checkTagNameUnique(dto.name, id);
            if (!isUnique) {
                throw new common_1.BadRequestException('Tag name already exists');
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
            throw new common_1.InternalServerErrorException('Failed to update tag');
        }
        await this.cacheManager.del('tags:all');
        this.logger.log(`Tag updated successfully: ${id}`);
        return data;
    }
    async removeTag(id) {
        const supabase = this.getSupabaseClient();
        await this.findTagById(id);
        const { error } = await supabase.from('tags').delete().eq('id', id);
        if (error) {
            this.logger.error('Error deleting tag:', error);
            throw new common_1.InternalServerErrorException('Failed to delete tag');
        }
        await this.cacheManager.del('tags:all');
        this.logger.log(`Tag deleted successfully: ${id}`);
    }
    async validateRoleIds(roleIds) {
        const supabase = this.getSupabaseClient();
        const { data: roles } = await supabase
            .from('roles')
            .select('id')
            .in('id', roleIds);
        return !!(roles && roles.length === roleIds.length);
    }
    async validateTagIds(tagIds) {
        const supabase = this.getSupabaseClient();
        const { data: tags } = await supabase
            .from('tags')
            .select('id')
            .in('id', tagIds);
        return !!(tags && tags.length === tagIds.length);
    }
    async checkTagNameUnique(name, excludeId) {
        const supabase = this.getSupabaseClient();
        let query = supabase.from('tags').select('id').ilike('name', name);
        if (excludeId) {
            query = query.neq('id', excludeId);
        }
        const { data } = await query;
        return !data || data.length === 0;
    }
    async findTagById(id) {
        const supabase = this.getSupabaseClient();
        const { data, error } = await supabase
            .from('tags')
            .select('*')
            .eq('id', id)
            .single();
        if (error) {
            throw new common_1.NotFoundException('Tag not found');
        }
        return data;
    }
    async invalidateAnnouncementCaches() {
        try {
            this.logger.debug('Invalidating announcement caches');
        }
        catch (error) {
            this.logger.warn('Error invalidating announcement caches:', error);
        }
    }
};
exports.AnnouncementsService = AnnouncementsService;
exports.AnnouncementsService = AnnouncementsService = AnnouncementsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [config_1.ConfigService, Object])
], AnnouncementsService);
//# sourceMappingURL=announcements.service.js.map