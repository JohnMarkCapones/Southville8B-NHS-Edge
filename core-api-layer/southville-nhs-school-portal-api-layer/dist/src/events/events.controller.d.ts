import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CreateEventAdditionalInfoDto } from './dto/create-event.dto';
import { UpdateEventAdditionalInfoDto } from './dto/update-event-additional-info.dto';
import { CreateEventHighlightDto } from './dto/create-event.dto';
import { UpdateEventHighlightDto } from './dto/update-event-highlight.dto';
import { CreateEventScheduleDto } from './dto/create-event.dto';
import { UpdateEventScheduleDto } from './dto/update-event-schedule.dto';
import { CreateEventFaqDto } from './dto/create-event.dto';
import { UpdateEventFaqDto } from './dto/update-event-faq.dto';
import { ReorderEventItemsDto } from './dto/reorder-event-items.dto';
import { EventStatisticsDto } from './dto/event-statistics.dto';
import { TagDto } from './dto/tag.dto';
import { Event } from './entities/event.entity';
import { EventAdditionalInfo } from './entities/event-additional-info.entity';
import { EventHighlight } from './entities/event-highlight.entity';
import { EventSchedule } from './entities/event-schedule.entity';
import { EventFaq } from './entities/event-faq.entity';
import { R2StorageService } from '../storage/r2-storage/r2-storage.service';
export declare class EventsController {
    private readonly eventsService;
    private readonly r2StorageService;
    private readonly logger;
    constructor(eventsService: EventsService, r2StorageService: R2StorageService);
    private enrichEventWithPresignedUrl;
    create(createEventDto: CreateEventDto, user: any): Promise<Event>;
    findAll(page?: number, limit?: number, status?: string, visibility?: string, startDate?: string, endDate?: string, organizerId?: string, tagId?: string, search?: string): Promise<{
        data: Event[];
        pagination: any;
    }>;
    getStatistics(): Promise<EventStatisticsDto>;
    getTags(): Promise<TagDto[]>;
    uploadImage(request: any, userId: string): Promise<{
        url: string;
        fileName: string;
        fileSize: number;
    }>;
    findUpcoming(): Promise<{
        data: Event[];
        pagination: any;
    }>;
    findByOrganizer(organizerId: string, page?: number, limit?: number): Promise<{
        data: Event[];
        pagination: any;
    }>;
    findOne(id: string): Promise<Event>;
    update(id: string, updateEventDto: UpdateEventDto, user: any): Promise<Event>;
    remove(id: string): Promise<void>;
    addAdditionalInfo(eventId: string, dto: CreateEventAdditionalInfoDto): Promise<EventAdditionalInfo>;
    updateAdditionalInfo(eventId: string, infoId: string, dto: UpdateEventAdditionalInfoDto): Promise<EventAdditionalInfo>;
    removeAdditionalInfo(eventId: string, infoId: string): Promise<void>;
    addHighlight(eventId: string, dto: CreateEventHighlightDto): Promise<EventHighlight>;
    updateHighlight(eventId: string, highlightId: string, dto: UpdateEventHighlightDto): Promise<EventHighlight>;
    removeHighlight(eventId: string, highlightId: string): Promise<void>;
    addScheduleItem(eventId: string, dto: CreateEventScheduleDto): Promise<EventSchedule>;
    updateScheduleItem(eventId: string, scheduleId: string, dto: UpdateEventScheduleDto): Promise<EventSchedule>;
    removeScheduleItem(eventId: string, scheduleId: string): Promise<void>;
    addFaq(eventId: string, dto: CreateEventFaqDto): Promise<EventFaq>;
    updateFaq(eventId: string, faqId: string, dto: UpdateEventFaqDto): Promise<EventFaq>;
    removeFaq(eventId: string, faqId: string): Promise<void>;
    reorderItems(eventId: string, entityType: string, dto: ReorderEventItemsDto): Promise<void>;
}
