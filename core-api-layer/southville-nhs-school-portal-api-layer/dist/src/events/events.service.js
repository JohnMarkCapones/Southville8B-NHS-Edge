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
var EventsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cache_manager_1 = require("@nestjs/cache-manager");
const supabase_js_1 = require("@supabase/supabase-js");
let EventsService = EventsService_1 = class EventsService {
    configService;
    cacheManager;
    logger = new common_1.Logger(EventsService_1.name);
    CACHE_TTL = 300;
    UPCOMING_CACHE_TTL = 600;
    supabase;
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
            await this.validateOrganizer(dto.organizerId);
            if (dto.tagIds && dto.tagIds.length > 0) {
                await this.validateTagIds(dto.tagIds);
            }
            const { data: event, error } = await supabase
                .from('events')
                .insert({
                title: dto.title,
                description: dto.description,
                date: dto.date,
                time: dto.time,
                location: dto.location,
                organizer_id: dto.organizerId,
                event_image: dto.eventImage,
                status: dto.status,
                visibility: dto.visibility,
            })
                .select()
                .single();
            if (error) {
                this.logger.error('Error creating event:', error);
                throw new common_1.InternalServerErrorException('Failed to create event');
            }
            if (dto.tagIds && dto.tagIds.length > 0) {
                const tagInserts = dto.tagIds.map((tagId) => ({
                    event_id: event.id,
                    tag_id: tagId,
                }));
                const { error: tagsError } = await supabase
                    .from('event_tags')
                    .insert(tagInserts);
                if (tagsError) {
                    this.logger.error('Error creating event tags:', tagsError);
                    await supabase.from('events').delete().eq('id', event.id);
                    throw new common_1.InternalServerErrorException('Failed to create event tags');
                }
            }
            if (dto.additionalInfo && dto.additionalInfo.length > 0) {
                const infoInserts = dto.additionalInfo.map((info, index) => ({
                    event_id: event.id,
                    title: info.title,
                    content: info.content,
                    order_index: info.orderIndex ?? index,
                }));
                const { error: infoError } = await supabase
                    .from('event_additional_info')
                    .insert(infoInserts);
                if (infoError) {
                    this.logger.error('Error creating additional info:', infoError);
                    await supabase.from('event_tags').delete().eq('event_id', event.id);
                    await supabase.from('events').delete().eq('id', event.id);
                    throw new common_1.InternalServerErrorException('Failed to create additional info');
                }
            }
            if (dto.highlights && dto.highlights.length > 0) {
                const highlightInserts = dto.highlights.map((highlight, index) => ({
                    event_id: event.id,
                    title: highlight.title,
                    content: highlight.content,
                    image_url: highlight.imageUrl,
                    order_index: highlight.orderIndex ?? index,
                }));
                const { error: highlightsError } = await supabase
                    .from('event_highlights')
                    .insert(highlightInserts);
                if (highlightsError) {
                    this.logger.error('Error creating highlights:', highlightsError);
                    await supabase
                        .from('event_additional_info')
                        .delete()
                        .eq('event_id', event.id);
                    await supabase.from('event_tags').delete().eq('event_id', event.id);
                    await supabase.from('events').delete().eq('id', event.id);
                    throw new common_1.InternalServerErrorException('Failed to create highlights');
                }
            }
            if (dto.schedule && dto.schedule.length > 0) {
                const scheduleInserts = dto.schedule.map((schedule, index) => ({
                    event_id: event.id,
                    activity_time: schedule.activityTime,
                    activity_description: schedule.activityDescription,
                    order_index: schedule.orderIndex ?? index,
                }));
                const { error: scheduleError } = await supabase
                    .from('event_schedule')
                    .insert(scheduleInserts);
                if (scheduleError) {
                    this.logger.error('Error creating schedule:', scheduleError);
                    await supabase
                        .from('event_highlights')
                        .delete()
                        .eq('event_id', event.id);
                    await supabase
                        .from('event_additional_info')
                        .delete()
                        .eq('event_id', event.id);
                    await supabase.from('event_tags').delete().eq('event_id', event.id);
                    await supabase.from('events').delete().eq('id', event.id);
                    throw new common_1.InternalServerErrorException('Failed to create schedule');
                }
            }
            if (dto.faq && dto.faq.length > 0) {
                const faqInserts = dto.faq.map((faq) => ({
                    event_id: event.id,
                    question: faq.question,
                    answer: faq.answer,
                }));
                const { error: faqError } = await supabase
                    .from('events_faq')
                    .insert(faqInserts);
                if (faqError) {
                    this.logger.error('Error creating FAQ:', faqError);
                    await supabase
                        .from('event_schedule')
                        .delete()
                        .eq('event_id', event.id);
                    await supabase
                        .from('event_highlights')
                        .delete()
                        .eq('event_id', event.id);
                    await supabase
                        .from('event_additional_info')
                        .delete()
                        .eq('event_id', event.id);
                    await supabase.from('event_tags').delete().eq('event_id', event.id);
                    await supabase.from('events').delete().eq('id', event.id);
                    throw new common_1.InternalServerErrorException('Failed to create FAQ');
                }
            }
            await this.invalidateEventCaches();
            this.logger.log(`Event created successfully: ${event.id}`);
            return await this.findOne(event.id);
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            this.logger.error('Unexpected error creating event:', error);
            throw new common_1.InternalServerErrorException('Failed to create event');
        }
    }
    async findAll(filters) {
        const cacheKey = `events:${JSON.stringify(filters)}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        const supabase = this.getSupabaseClient();
        const { page = 1, limit = 10, status, visibility, startDate, endDate, organizerId, tagId, search, } = filters;
        let query = supabase.from('events').select(`
      *,
      organizer:users!events_organizer_id_fkey(id, full_name, email)
    `, { count: 'exact' });
        if (status) {
            query = query.eq('status', status);
        }
        if (visibility) {
            query = query.eq('visibility', visibility);
        }
        if (startDate) {
            query = query.gte('date', startDate);
        }
        if (endDate) {
            query = query.lte('date', endDate);
        }
        if (organizerId) {
            query = query.eq('organizer_id', organizerId);
        }
        if (search) {
            query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
        }
        if (tagId) {
            const { data: eventTags, error: tagError } = await supabase
                .from('event_tags')
                .select('event_id')
                .eq('tag_id', tagId);
            if (tagError) {
                this.logger.error('Error fetching events by tag:', tagError);
                throw new common_1.InternalServerErrorException('Failed to fetch events by tag');
            }
            const eventIds = eventTags?.map((et) => et.event_id) || [];
            if (eventIds.length > 0) {
                query = query.in('id', eventIds);
            }
            else {
                return {
                    data: [],
                    pagination: {
                        total: 0,
                        page,
                        limit,
                        pages: 0,
                    },
                };
            }
        }
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);
        query = query.order('date', { ascending: false });
        const { data, error, count } = await query;
        if (error) {
            this.logger.error('Error fetching events:', error);
            throw new common_1.InternalServerErrorException('Failed to fetch events');
        }
        const transformedData = data?.map((event) => ({
            id: event.id,
            title: event.title,
            description: event.description,
            date: event.date,
            time: event.time,
            location: event.location,
            organizerId: event.organizer_id,
            eventImage: event.event_image,
            status: event.status,
            visibility: event.visibility,
            createdAt: event.created_at,
            updatedAt: event.updated_at,
            organizer: event.organizer,
            tags: event.tags?.map((t) => t.tag),
            additionalInfo: event.additionalInfo?.sort((a, b) => a.order_index - b.order_index),
            highlights: event.highlights?.sort((a, b) => a.order_index - b.order_index),
            schedule: event.schedule?.sort((a, b) => a.order_index - b.order_index),
            faq: event.faq,
        })) || [];
        const result = {
            data: transformedData,
            pagination: {
                page,
                limit,
                total: count || 0,
                pages: Math.ceil((count || 0) / limit),
            },
        };
        await this.cacheManager.set(cacheKey, result, this.CACHE_TTL);
        return result;
    }
    async findOne(id) {
        const cacheKey = `event:${id}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        const supabase = this.getSupabaseClient();
        const { data, error } = await supabase
            .from('events')
            .select(`
        *,
        organizer:users!events_organizer_id_fkey(id, full_name, email),
        tags:event_tags(tag:tags(id, name, color)),
        additionalInfo:event_additional_info(id, title, content, order_index),
        highlights:event_highlights(id, title, content, image_url, order_index),
        schedule:event_schedule(id, activity_time, activity_description, order_index),
        faq:events_faq(id, question, answer)
      `)
            .eq('id', id)
            .single();
        if (error) {
            this.logger.error('Error fetching event:', error);
            throw new common_1.NotFoundException('Event not found');
        }
        const transformedEvent = {
            id: data.id,
            title: data.title,
            description: data.description,
            date: data.date,
            time: data.time,
            location: data.location,
            organizerId: data.organizer_id,
            eventImage: data.event_image,
            status: data.status,
            visibility: data.visibility,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            organizer: data.organizer,
            tags: data.tags?.map((t) => t.tag),
            additionalInfo: data.additionalInfo?.sort((a, b) => a.order_index - b.order_index),
            highlights: data.highlights?.sort((a, b) => a.order_index - b.order_index),
            schedule: data.schedule?.sort((a, b) => a.order_index - b.order_index),
            faq: data.faq,
        };
        await this.cacheManager.set(cacheKey, transformedEvent, this.CACHE_TTL);
        return transformedEvent;
    }
    async findUpcoming() {
        const cacheKey = 'events:upcoming';
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        const today = new Date().toISOString().split('T')[0];
        const result = await this.findAll({
            startDate: today,
            status: 'published',
            visibility: 'public',
            limit: 20,
        });
        await this.cacheManager.set(cacheKey, result, this.UPCOMING_CACHE_TTL);
        return result;
    }
    async findByOrganizer(organizerId, filters = {}) {
        return this.findAll({ ...filters, organizerId });
    }
    async update(id, dto, userId, userRole) {
        const supabase = this.getSupabaseClient();
        try {
            const existing = await this.findOne(id);
            if (existing.organizerId !== userId &&
                userRole?.toLowerCase() !== 'admin') {
                this.logger.warn(`Unauthorized update attempt on event ${id} by user ${userId}`);
                throw new common_1.ForbiddenException('You can only update your own events');
            }
            if (dto.organizerId) {
                await this.validateOrganizer(dto.organizerId);
            }
            if (dto.tagIds && dto.tagIds.length > 0) {
                await this.validateTagIds(dto.tagIds);
            }
            const updateData = {
                updated_at: new Date().toISOString(),
            };
            if (dto.title)
                updateData.title = dto.title;
            if (dto.description)
                updateData.description = dto.description;
            if (dto.date)
                updateData.date = dto.date;
            if (dto.time)
                updateData.time = dto.time;
            if (dto.location)
                updateData.location = dto.location;
            if (dto.organizerId)
                updateData.organizer_id = dto.organizerId;
            if (dto.eventImage !== undefined)
                updateData.event_image = dto.eventImage;
            if (dto.status)
                updateData.status = dto.status;
            if (dto.visibility)
                updateData.visibility = dto.visibility;
            const { error } = await supabase
                .from('events')
                .update(updateData)
                .eq('id', id);
            if (error) {
                this.logger.error('Error updating event:', error);
                throw new common_1.InternalServerErrorException('Failed to update event');
            }
            if (dto.tagIds !== undefined) {
                await supabase.from('event_tags').delete().eq('event_id', id);
                if (dto.tagIds.length > 0) {
                    const tagInserts = dto.tagIds.map((tagId) => ({
                        event_id: id,
                        tag_id: tagId,
                    }));
                    const { error: tagsError } = await supabase
                        .from('event_tags')
                        .insert(tagInserts);
                    if (tagsError) {
                        this.logger.error('Error updating event tags:', tagsError);
                        throw new common_1.InternalServerErrorException('Failed to update event tags');
                    }
                }
            }
            await this.invalidateEventCaches();
            await this.cacheManager.del(`event:${id}`);
            this.logger.log(`Event updated successfully: ${id}`);
            return await this.findOne(id);
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.ForbiddenException ||
                error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            this.logger.error('Unexpected error updating event:', error);
            throw new common_1.InternalServerErrorException('Failed to update event');
        }
    }
    async remove(id) {
        const supabase = this.getSupabaseClient();
        try {
            await this.findOne(id);
            const { error } = await supabase.from('events').delete().eq('id', id);
            if (error) {
                this.logger.error('Error deleting event:', error);
                throw new common_1.InternalServerErrorException('Failed to delete event');
            }
            await this.invalidateEventCaches();
            await this.cacheManager.del(`event:${id}`);
            this.logger.log(`Event deleted successfully: ${id}`);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error('Unexpected error deleting event:', error);
            throw new common_1.InternalServerErrorException('Failed to delete event');
        }
    }
    async addAdditionalInfo(eventId, dto) {
        const supabase = this.getSupabaseClient();
        await this.findOne(eventId);
        const { data, error } = await supabase
            .from('event_additional_info')
            .insert({
            event_id: eventId,
            title: dto.title,
            content: dto.content,
            order_index: dto.orderIndex ?? 0,
        })
            .select()
            .single();
        if (error) {
            this.logger.error('Error adding additional info:', error);
            throw new common_1.InternalServerErrorException('Failed to add additional info');
        }
        await this.cacheManager.del(`event:${eventId}`);
        return {
            id: data.id,
            eventId: data.event_id,
            title: data.title,
            content: data.content,
            orderIndex: data.order_index,
            createdAt: data.created_at,
        };
    }
    async updateAdditionalInfo(eventId, infoId, dto) {
        const supabase = this.getSupabaseClient();
        await this.findOne(eventId);
        const updateData = {};
        if (dto.title)
            updateData.title = dto.title;
        if (dto.content)
            updateData.content = dto.content;
        if (dto.orderIndex !== undefined)
            updateData.order_index = dto.orderIndex;
        const { data, error } = await supabase
            .from('event_additional_info')
            .update(updateData)
            .eq('id', infoId)
            .eq('event_id', eventId)
            .select()
            .single();
        if (error) {
            this.logger.error('Error updating additional info:', error);
            throw new common_1.InternalServerErrorException('Failed to update additional info');
        }
        await this.cacheManager.del(`event:${eventId}`);
        return {
            id: data.id,
            eventId: data.event_id,
            title: data.title,
            content: data.content,
            orderIndex: data.order_index,
            createdAt: data.created_at,
        };
    }
    async removeAdditionalInfo(eventId, infoId) {
        const supabase = this.getSupabaseClient();
        const { error } = await supabase
            .from('event_additional_info')
            .delete()
            .eq('id', infoId)
            .eq('event_id', eventId);
        if (error) {
            this.logger.error('Error removing additional info:', error);
            throw new common_1.InternalServerErrorException('Failed to remove additional info');
        }
        await this.cacheManager.del(`event:${eventId}`);
    }
    async addHighlight(eventId, dto) {
        const supabase = this.getSupabaseClient();
        await this.findOne(eventId);
        const { data, error } = await supabase
            .from('event_highlights')
            .insert({
            event_id: eventId,
            title: dto.title,
            content: dto.content,
            image_url: dto.imageUrl,
            order_index: dto.orderIndex ?? 0,
        })
            .select()
            .single();
        if (error) {
            this.logger.error('Error adding highlight:', error);
            throw new common_1.InternalServerErrorException('Failed to add highlight');
        }
        await this.cacheManager.del(`event:${eventId}`);
        return {
            id: data.id,
            eventId: data.event_id,
            title: data.title,
            content: data.content,
            imageUrl: data.image_url,
            orderIndex: data.order_index,
            createdAt: data.created_at,
        };
    }
    async updateHighlight(eventId, highlightId, dto) {
        const supabase = this.getSupabaseClient();
        await this.findOne(eventId);
        const updateData = {};
        if (dto.title)
            updateData.title = dto.title;
        if (dto.content)
            updateData.content = dto.content;
        if (dto.imageUrl !== undefined)
            updateData.image_url = dto.imageUrl;
        if (dto.orderIndex !== undefined)
            updateData.order_index = dto.orderIndex;
        const { data, error } = await supabase
            .from('event_highlights')
            .update(updateData)
            .eq('id', highlightId)
            .eq('event_id', eventId)
            .select()
            .single();
        if (error) {
            this.logger.error('Error updating highlight:', error);
            throw new common_1.InternalServerErrorException('Failed to update highlight');
        }
        await this.cacheManager.del(`event:${eventId}`);
        return {
            id: data.id,
            eventId: data.event_id,
            title: data.title,
            content: data.content,
            imageUrl: data.image_url,
            orderIndex: data.order_index,
            createdAt: data.created_at,
        };
    }
    async removeHighlight(eventId, highlightId) {
        const supabase = this.getSupabaseClient();
        const { error } = await supabase
            .from('event_highlights')
            .delete()
            .eq('id', highlightId)
            .eq('event_id', eventId);
        if (error) {
            this.logger.error('Error removing highlight:', error);
            throw new common_1.InternalServerErrorException('Failed to remove highlight');
        }
        await this.cacheManager.del(`event:${eventId}`);
    }
    async addScheduleItem(eventId, dto) {
        const supabase = this.getSupabaseClient();
        await this.findOne(eventId);
        const { data, error } = await supabase
            .from('event_schedule')
            .insert({
            event_id: eventId,
            activity_time: dto.activityTime,
            activity_description: dto.activityDescription,
            order_index: dto.orderIndex ?? 0,
        })
            .select()
            .single();
        if (error) {
            this.logger.error('Error adding schedule item:', error);
            throw new common_1.InternalServerErrorException('Failed to add schedule item');
        }
        await this.cacheManager.del(`event:${eventId}`);
        return {
            id: data.id,
            eventId: data.event_id,
            activityTime: data.activity_time,
            activityDescription: data.activity_description,
            orderIndex: data.order_index,
            createdAt: data.created_at,
        };
    }
    async updateScheduleItem(eventId, scheduleId, dto) {
        const supabase = this.getSupabaseClient();
        await this.findOne(eventId);
        const updateData = {};
        if (dto.activityTime)
            updateData.activity_time = dto.activityTime;
        if (dto.activityDescription)
            updateData.activity_description = dto.activityDescription;
        if (dto.orderIndex !== undefined)
            updateData.order_index = dto.orderIndex;
        const { data, error } = await supabase
            .from('event_schedule')
            .update(updateData)
            .eq('id', scheduleId)
            .eq('event_id', eventId)
            .select()
            .single();
        if (error) {
            this.logger.error('Error updating schedule item:', error);
            throw new common_1.InternalServerErrorException('Failed to update schedule item');
        }
        await this.cacheManager.del(`event:${eventId}`);
        return {
            id: data.id,
            eventId: data.event_id,
            activityTime: data.activity_time,
            activityDescription: data.activity_description,
            orderIndex: data.order_index,
            createdAt: data.created_at,
        };
    }
    async removeScheduleItem(eventId, scheduleId) {
        const supabase = this.getSupabaseClient();
        const { error } = await supabase
            .from('event_schedule')
            .delete()
            .eq('id', scheduleId)
            .eq('event_id', eventId);
        if (error) {
            this.logger.error('Error removing schedule item:', error);
            throw new common_1.InternalServerErrorException('Failed to remove schedule item');
        }
        await this.cacheManager.del(`event:${eventId}`);
    }
    async addFaq(eventId, dto) {
        const supabase = this.getSupabaseClient();
        await this.findOne(eventId);
        const { data, error } = await supabase
            .from('events_faq')
            .insert({
            event_id: eventId,
            question: dto.question,
            answer: dto.answer,
        })
            .select()
            .single();
        if (error) {
            this.logger.error('Error adding FAQ:', error);
            throw new common_1.InternalServerErrorException('Failed to add FAQ');
        }
        await this.cacheManager.del(`event:${eventId}`);
        return {
            id: data.id,
            eventId: data.event_id,
            question: data.question,
            answer: data.answer,
            createdAt: data.created_at,
        };
    }
    async updateFaq(eventId, faqId, dto) {
        const supabase = this.getSupabaseClient();
        await this.findOne(eventId);
        const updateData = {};
        if (dto.question)
            updateData.question = dto.question;
        if (dto.answer)
            updateData.answer = dto.answer;
        const { data, error } = await supabase
            .from('events_faq')
            .update(updateData)
            .eq('id', faqId)
            .eq('event_id', eventId)
            .select()
            .single();
        if (error) {
            this.logger.error('Error updating FAQ:', error);
            throw new common_1.InternalServerErrorException('Failed to update FAQ');
        }
        await this.cacheManager.del(`event:${eventId}`);
        return {
            id: data.id,
            eventId: data.event_id,
            question: data.question,
            answer: data.answer,
            createdAt: data.created_at,
        };
    }
    async removeFaq(eventId, faqId) {
        const supabase = this.getSupabaseClient();
        const { error } = await supabase
            .from('events_faq')
            .delete()
            .eq('id', faqId)
            .eq('event_id', eventId);
        if (error) {
            this.logger.error('Error removing FAQ:', error);
            throw new common_1.InternalServerErrorException('Failed to remove FAQ');
        }
        await this.cacheManager.del(`event:${eventId}`);
    }
    async reorderItems(eventId, entityType, dto) {
        const supabase = this.getSupabaseClient();
        await this.findOne(eventId);
        const tableMap = {
            'additional-info': 'event_additional_info',
            highlights: 'event_highlights',
            schedule: 'event_schedule',
        };
        const tableName = tableMap[entityType];
        if (!tableName) {
            throw new common_1.BadRequestException('Invalid entity type for reordering');
        }
        for (let i = 0; i < dto.itemIds.length; i++) {
            const { error } = await supabase
                .from(tableName)
                .update({ order_index: i })
                .eq('id', dto.itemIds[i])
                .eq('event_id', eventId);
            if (error) {
                this.logger.error(`Error reordering ${entityType}:`, error);
                throw new common_1.InternalServerErrorException(`Failed to reorder ${entityType}`);
            }
        }
        await this.cacheManager.del(`event:${eventId}`);
    }
    async validateOrganizer(organizerId) {
        const supabase = this.getSupabaseClient();
        const { data } = await supabase
            .from('users')
            .select('id')
            .eq('id', organizerId)
            .single();
        if (!data) {
            throw new common_1.BadRequestException('Invalid organizer ID');
        }
    }
    async validateTagIds(tagIds) {
        const supabase = this.getSupabaseClient();
        const { data } = await supabase.from('tags').select('id').in('id', tagIds);
        if (!data || data.length !== tagIds.length) {
            throw new common_1.BadRequestException('One or more tag IDs are invalid');
        }
    }
    async getTags() {
        const cacheKey = 'events:tags';
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        const supabase = this.getSupabaseClient();
        try {
            const { data, error } = await supabase
                .from('tags')
                .select('id, name, slug')
                .order('name', { ascending: true });
            if (error) {
                this.logger.error('Error fetching tags:', error);
                throw new common_1.InternalServerErrorException('Failed to fetch tags');
            }
            const tags = (data || []).map((tag) => ({
                id: tag.id,
                name: tag.name,
                slug: tag.slug,
            }));
            await this.cacheManager.set(cacheKey, tags, this.UPCOMING_CACHE_TTL);
            return tags;
        }
        catch (error) {
            this.logger.error('Error fetching tags:', error);
            throw new common_1.InternalServerErrorException('Failed to fetch tags');
        }
    }
    async getStatistics() {
        const cacheKey = 'events:statistics';
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        const supabase = this.getSupabaseClient();
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        try {
            const [totalResult, thisWeekResult, publishedResult, draftResult, cancelledResult, upcomingResult, pastResult,] = await Promise.all([
                supabase.from('events').select('id', { count: 'exact', head: true }),
                supabase
                    .from('events')
                    .select('id', { count: 'exact', head: true })
                    .gte('created_at', startOfWeek.toISOString()),
                supabase
                    .from('events')
                    .select('id', { count: 'exact', head: true })
                    .eq('status', 'published'),
                supabase
                    .from('events')
                    .select('id', { count: 'exact', head: true })
                    .eq('status', 'draft'),
                supabase
                    .from('events')
                    .select('id', { count: 'exact', head: true })
                    .eq('status', 'cancelled'),
                supabase
                    .from('events')
                    .select('id', { count: 'exact', head: true })
                    .eq('status', 'published')
                    .gte('date', now.toISOString().split('T')[0]),
                supabase
                    .from('events')
                    .select('id', { count: 'exact', head: true })
                    .or(`status.eq.completed,and(date.lt.${now.toISOString().split('T')[0]})`),
            ]);
            const errors = [
                totalResult.error,
                thisWeekResult.error,
                publishedResult.error,
                draftResult.error,
                cancelledResult.error,
                upcomingResult.error,
                pastResult.error,
            ].filter(Boolean);
            if (errors.length > 0) {
                this.logger.error('Error fetching event statistics:', errors);
                throw new common_1.InternalServerErrorException('Failed to fetch event statistics');
            }
            const statistics = {
                totalEvents: totalResult.count || 0,
                thisWeekEvents: thisWeekResult.count || 0,
                publishedEvents: publishedResult.count || 0,
                draftEvents: draftResult.count || 0,
                cancelledEvents: cancelledResult.count || 0,
                upcomingEvents: upcomingResult.count || 0,
                pastEvents: pastResult.count || 0,
            };
            await this.cacheManager.set(cacheKey, statistics, this.CACHE_TTL);
            return statistics;
        }
        catch (error) {
            this.logger.error('Error calculating event statistics:', error);
            throw new common_1.InternalServerErrorException('Failed to calculate event statistics');
        }
    }
    async invalidateEventCaches() {
        const patterns = ['events:*', 'events:upcoming', 'events:statistics'];
        for (const pattern of patterns) {
        }
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = EventsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [config_1.ConfigService, Object])
], EventsService);
//# sourceMappingURL=events.service.js.map