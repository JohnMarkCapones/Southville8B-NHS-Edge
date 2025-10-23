import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Announcement } from './entities/announcement.entity';
import { Tag } from './entities/tag.entity';
export declare class AnnouncementsController {
    private readonly announcementsService;
    private readonly logger;
    constructor(announcementsService: AnnouncementsService);
    create(createAnnouncementDto: CreateAnnouncementDto, user: any): Promise<Announcement>;
    findAll(page: number, limit: number, visibility?: string, type?: string, roleId?: string, includeExpired?: boolean): Promise<{
        data: Announcement[];
        pagination: any;
    }>;
    getMyAnnouncements(user: any, page: number, limit: number, includeExpired?: boolean): Promise<{
        data: Announcement[];
        pagination: any;
    }>;
    findOne(id: string): Promise<Announcement>;
    update(id: string, updateAnnouncementDto: UpdateAnnouncementDto, user: any): Promise<Announcement>;
    remove(id: string): Promise<{
        message: string;
    }>;
    createTag(createTagDto: CreateTagDto): Promise<Tag>;
    findAllTags(): Promise<Tag[]>;
    updateTag(id: string, updateTagDto: UpdateTagDto): Promise<Tag>;
    removeTag(id: string): Promise<{
        message: string;
    }>;
}
