import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Announcement } from './entities/announcement.entity';
import { Tag } from './entities/tag.entity';
export declare class AnnouncementsService {
    private configService;
    private cacheManager;
    private readonly logger;
    private supabase;
    private readonly CACHE_TTL;
    constructor(configService: ConfigService, cacheManager: Cache);
    private getSupabaseClient;
    create(dto: CreateAnnouncementDto, userId: string): Promise<Announcement>;
    findAll(filters: any): Promise<{
        data: Announcement[];
        pagination: any;
    }>;
    findOne(id: string): Promise<Announcement>;
    update(id: string, dto: UpdateAnnouncementDto, userId: string, userRole: string): Promise<Announcement>;
    remove(id: string): Promise<void>;
    getAnnouncementsForUser(userId: string, userRoleId: string, filters?: any): Promise<{
        data: Announcement[];
        pagination: any;
    }>;
    createTag(dto: CreateTagDto): Promise<Tag>;
    findAllTags(): Promise<Tag[]>;
    updateTag(id: string, dto: UpdateTagDto): Promise<Tag>;
    removeTag(id: string): Promise<void>;
    private validateRoleIds;
    private validateTagIds;
    private checkTagNameUnique;
    private findTagById;
    private invalidateAnnouncementCaches;
}
