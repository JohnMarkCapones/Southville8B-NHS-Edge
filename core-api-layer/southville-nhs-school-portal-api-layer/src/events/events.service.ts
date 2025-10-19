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
import { Event } from './entities/event.entity';
import { EventAdditionalInfo } from './entities/event-additional-info.entity';
import { EventHighlight } from './entities/event-highlight.entity';
import { EventSchedule } from './entities/event-schedule.entity';
import { EventFaq } from './entities/event-faq.entity';
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

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);
  private readonly CACHE_TTL = 300; // 5 minutes
  private readonly UPCOMING_CACHE_TTL = 600; // 10 minutes
  private supabase: SupabaseClient;

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

  async create(dto: CreateEventDto, userId: string): Promise<Event> {
    const supabase = this.getSupabaseClient();

    try {
      // Validate organizer exists
      await this.validateOrganizer(dto.organizerId);

      // Validate tags if provided
      if (dto.tagIds && dto.tagIds.length > 0) {
        await this.validateTagIds(dto.tagIds);
      }

      // Create event
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
        throw new InternalServerErrorException('Failed to create event');
      }

      // Create event tags (if provided)
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
          // Rollback event
          await supabase.from('events').delete().eq('id', event.id);
          throw new InternalServerErrorException('Failed to create event tags');
        }
      }

      // Create additional info (if provided)
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
          // Rollback event and tags
          await supabase.from('event_tags').delete().eq('event_id', event.id);
          await supabase.from('events').delete().eq('id', event.id);
          throw new InternalServerErrorException(
            'Failed to create additional info',
          );
        }
      }

      // Create highlights (if provided)
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
          // Rollback event, tags, and additional info
          await supabase
            .from('event_additional_info')
            .delete()
            .eq('event_id', event.id);
          await supabase.from('event_tags').delete().eq('event_id', event.id);
          await supabase.from('events').delete().eq('id', event.id);
          throw new InternalServerErrorException('Failed to create highlights');
        }
      }

      // Create schedule (if provided)
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
          // Rollback all previous inserts
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
          throw new InternalServerErrorException('Failed to create schedule');
        }
      }

      // Create FAQ (if provided)
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
          // Rollback all previous inserts
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
          throw new InternalServerErrorException('Failed to create FAQ');
        }
      }

      // Invalidate cache
      await this.invalidateEventCaches();

      this.logger.log(`Event created successfully: ${event.id}`);
      return await this.findOne(event.id);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      this.logger.error('Unexpected error creating event:', error);
      throw new InternalServerErrorException('Failed to create event');
    }
  }

  async findAll(filters: any): Promise<{ data: Event[]; pagination: any }> {
    const cacheKey = `events:${JSON.stringify(filters)}`;

    // Try to get from cache
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached as { data: Event[]; pagination: any };
    }

    const supabase = this.getSupabaseClient();
    const {
      page = 1,
      limit = 10,
      status,
      visibility,
      startDate,
      endDate,
      organizerId,
      tagId,
      search,
    } = filters;

    // Start with a simple query to avoid complex joins that might fail
    let query = supabase.from('events').select(
      `*`,
      { count: 'exact' },
    );

    // Apply filters
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
      // Get event IDs that have this tag
      const { data: eventTags, error: tagError } = await supabase
        .from('event_tags')
        .select('event_id')
        .eq('tag_id', tagId);

      if (tagError) {
        this.logger.error('Error fetching events by tag:', tagError);
        throw new InternalServerErrorException('Failed to fetch events by tag');
      }

      const eventIds = eventTags?.map((et) => et.event_id) || [];

      if (eventIds.length > 0) {
        query = query.in('id', eventIds);
      } else {
        // No events have this tag, return empty result
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

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    // Order by date descending
    query = query.order('date', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      this.logger.error('Error fetching events:', error);
      throw new InternalServerErrorException('Failed to fetch events');
    }

    // Transform the data to match our entity structure
    const transformedData =
      data?.map((event) => ({
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
        additionalInfo: event.additionalInfo?.sort(
          (a, b) => a.order_index - b.order_index,
        ),
        highlights: event.highlights?.sort(
          (a, b) => a.order_index - b.order_index,
        ),
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

    // Cache the result
    await this.cacheManager.set(cacheKey, result, this.CACHE_TTL);

    return result;
  }

  async findOne(id: string): Promise<Event> {
    const cacheKey = `event:${id}`;

    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached as Event;
    }

    const supabase = this.getSupabaseClient();

    const { data, error } = await supabase
      .from('events')
      .select(
        `
        *,
        organizer:users!events_organizer_id_fkey(id, full_name, email),
        tags:event_tags(tag:tags(id, name, color)),
        additionalInfo:event_additional_info(id, title, content, order_index),
        highlights:event_highlights(id, title, content, image_url, order_index),
        schedule:event_schedule(id, activity_time, activity_description, order_index),
        faq:events_faq(id, question, answer)
      `,
      )
      .eq('id', id)
      .single();

    if (error) {
      this.logger.error('Error fetching event:', error);
      throw new NotFoundException('Event not found');
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
      additionalInfo: data.additionalInfo?.sort(
        (a, b) => a.order_index - b.order_index,
      ),
      highlights: data.highlights?.sort(
        (a, b) => a.order_index - b.order_index,
      ),
      schedule: data.schedule?.sort((a, b) => a.order_index - b.order_index),
      faq: data.faq,
    };

    // Cache the result
    await this.cacheManager.set(cacheKey, transformedEvent, this.CACHE_TTL);

    return transformedEvent;
  }

  async findUpcoming(): Promise<{ data: Event[]; pagination: any }> {
    const cacheKey = 'events:upcoming';

    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached as { data: Event[]; pagination: any };
    }

    const today = new Date().toISOString().split('T')[0];
    const result = await this.findAll({
      startDate: today,
      status: 'published',
      visibility: 'public',
      limit: 20,
    });

    // Cache the result
    await this.cacheManager.set(cacheKey, result, this.UPCOMING_CACHE_TTL);

    return result;
  }

  async findByOrganizer(
    organizerId: string,
    filters: any = {},
  ): Promise<{ data: Event[]; pagination: any }> {
    return this.findAll({ ...filters, organizerId });
  }

  async update(
    id: string,
    dto: UpdateEventDto,
    userId: string,
    userRole: string,
  ): Promise<Event> {
    const supabase = this.getSupabaseClient();

    try {
      // Security: Check ownership or admin privilege
      const existing = await this.findOne(id);

      if (
        existing.organizerId !== userId &&
        userRole?.toLowerCase() !== 'admin'
      ) {
        this.logger.warn(
          `Unauthorized update attempt on event ${id} by user ${userId}`,
        );
        throw new ForbiddenException('You can only update your own events');
      }

      // Validate organizer if being updated
      if (dto.organizerId) {
        await this.validateOrganizer(dto.organizerId);
      }

      // Validate tags if being updated
      if (dto.tagIds && dto.tagIds.length > 0) {
        await this.validateTagIds(dto.tagIds);
      }

      // Update event
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (dto.title) updateData.title = dto.title;
      if (dto.description) updateData.description = dto.description;
      if (dto.date) updateData.date = dto.date;
      if (dto.time) updateData.time = dto.time;
      if (dto.location) updateData.location = dto.location;
      if (dto.organizerId) updateData.organizer_id = dto.organizerId;
      if (dto.eventImage !== undefined) updateData.event_image = dto.eventImage;
      if (dto.status) updateData.status = dto.status;
      if (dto.visibility) updateData.visibility = dto.visibility;

      const { error } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', id);

      if (error) {
        this.logger.error('Error updating event:', error);
        throw new InternalServerErrorException('Failed to update event');
      }

      // Update tags if provided
      if (dto.tagIds !== undefined) {
        // Delete existing tags
        await supabase.from('event_tags').delete().eq('event_id', id);

        // Insert new tags
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
            throw new InternalServerErrorException(
              'Failed to update event tags',
            );
          }
        }
      }

      // Invalidate cache
      await this.invalidateEventCaches();
      await this.cacheManager.del(`event:${id}`);

      this.logger.log(`Event updated successfully: ${id}`);
      return await this.findOne(id);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ForbiddenException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      this.logger.error('Unexpected error updating event:', error);
      throw new InternalServerErrorException('Failed to update event');
    }
  }

  async remove(id: string): Promise<void> {
    const supabase = this.getSupabaseClient();

    try {
      await this.findOne(id); // Verify event exists

      const { error } = await supabase.from('events').delete().eq('id', id);

      if (error) {
        this.logger.error('Error deleting event:', error);
        throw new InternalServerErrorException('Failed to delete event');
      }

      // Invalidate cache
      await this.invalidateEventCaches();
      await this.cacheManager.del(`event:${id}`);

      this.logger.log(`Event deleted successfully: ${id}`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Unexpected error deleting event:', error);
      throw new InternalServerErrorException('Failed to delete event');
    }
  }

  // Sub-entity management methods
  async addAdditionalInfo(
    eventId: string,
    dto: CreateEventAdditionalInfoDto,
  ): Promise<EventAdditionalInfo> {
    const supabase = this.getSupabaseClient();

    await this.findOne(eventId); // Verify event exists

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
      throw new InternalServerErrorException('Failed to add additional info');
    }

    // Invalidate cache
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

  async updateAdditionalInfo(
    eventId: string,
    infoId: string,
    dto: UpdateEventAdditionalInfoDto,
  ): Promise<EventAdditionalInfo> {
    const supabase = this.getSupabaseClient();

    await this.findOne(eventId); // Verify event exists

    const updateData: any = {};
    if (dto.title) updateData.title = dto.title;
    if (dto.content) updateData.content = dto.content;
    if (dto.orderIndex !== undefined) updateData.order_index = dto.orderIndex;

    const { data, error } = await supabase
      .from('event_additional_info')
      .update(updateData)
      .eq('id', infoId)
      .eq('event_id', eventId)
      .select()
      .single();

    if (error) {
      this.logger.error('Error updating additional info:', error);
      throw new InternalServerErrorException(
        'Failed to update additional info',
      );
    }

    // Invalidate cache
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

  async removeAdditionalInfo(eventId: string, infoId: string): Promise<void> {
    const supabase = this.getSupabaseClient();

    const { error } = await supabase
      .from('event_additional_info')
      .delete()
      .eq('id', infoId)
      .eq('event_id', eventId);

    if (error) {
      this.logger.error('Error removing additional info:', error);
      throw new InternalServerErrorException(
        'Failed to remove additional info',
      );
    }

    // Invalidate cache
    await this.cacheManager.del(`event:${eventId}`);
  }

  async addHighlight(
    eventId: string,
    dto: CreateEventHighlightDto,
  ): Promise<EventHighlight> {
    const supabase = this.getSupabaseClient();

    await this.findOne(eventId); // Verify event exists

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
      throw new InternalServerErrorException('Failed to add highlight');
    }

    // Invalidate cache
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

  async updateHighlight(
    eventId: string,
    highlightId: string,
    dto: UpdateEventHighlightDto,
  ): Promise<EventHighlight> {
    const supabase = this.getSupabaseClient();

    await this.findOne(eventId); // Verify event exists

    const updateData: any = {};
    if (dto.title) updateData.title = dto.title;
    if (dto.content) updateData.content = dto.content;
    if (dto.imageUrl !== undefined) updateData.image_url = dto.imageUrl;
    if (dto.orderIndex !== undefined) updateData.order_index = dto.orderIndex;

    const { data, error } = await supabase
      .from('event_highlights')
      .update(updateData)
      .eq('id', highlightId)
      .eq('event_id', eventId)
      .select()
      .single();

    if (error) {
      this.logger.error('Error updating highlight:', error);
      throw new InternalServerErrorException('Failed to update highlight');
    }

    // Invalidate cache
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

  async removeHighlight(eventId: string, highlightId: string): Promise<void> {
    const supabase = this.getSupabaseClient();

    const { error } = await supabase
      .from('event_highlights')
      .delete()
      .eq('id', highlightId)
      .eq('event_id', eventId);

    if (error) {
      this.logger.error('Error removing highlight:', error);
      throw new InternalServerErrorException('Failed to remove highlight');
    }

    // Invalidate cache
    await this.cacheManager.del(`event:${eventId}`);
  }

  async addScheduleItem(
    eventId: string,
    dto: CreateEventScheduleDto,
  ): Promise<EventSchedule> {
    const supabase = this.getSupabaseClient();

    await this.findOne(eventId); // Verify event exists

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
      throw new InternalServerErrorException('Failed to add schedule item');
    }

    // Invalidate cache
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

  async updateScheduleItem(
    eventId: string,
    scheduleId: string,
    dto: UpdateEventScheduleDto,
  ): Promise<EventSchedule> {
    const supabase = this.getSupabaseClient();

    await this.findOne(eventId); // Verify event exists

    const updateData: any = {};
    if (dto.activityTime) updateData.activity_time = dto.activityTime;
    if (dto.activityDescription)
      updateData.activity_description = dto.activityDescription;
    if (dto.orderIndex !== undefined) updateData.order_index = dto.orderIndex;

    const { data, error } = await supabase
      .from('event_schedule')
      .update(updateData)
      .eq('id', scheduleId)
      .eq('event_id', eventId)
      .select()
      .single();

    if (error) {
      this.logger.error('Error updating schedule item:', error);
      throw new InternalServerErrorException('Failed to update schedule item');
    }

    // Invalidate cache
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

  async removeScheduleItem(eventId: string, scheduleId: string): Promise<void> {
    const supabase = this.getSupabaseClient();

    const { error } = await supabase
      .from('event_schedule')
      .delete()
      .eq('id', scheduleId)
      .eq('event_id', eventId);

    if (error) {
      this.logger.error('Error removing schedule item:', error);
      throw new InternalServerErrorException('Failed to remove schedule item');
    }

    // Invalidate cache
    await this.cacheManager.del(`event:${eventId}`);
  }

  async addFaq(eventId: string, dto: CreateEventFaqDto): Promise<EventFaq> {
    const supabase = this.getSupabaseClient();

    await this.findOne(eventId); // Verify event exists

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
      throw new InternalServerErrorException('Failed to add FAQ');
    }

    // Invalidate cache
    await this.cacheManager.del(`event:${eventId}`);

    return {
      id: data.id,
      eventId: data.event_id,
      question: data.question,
      answer: data.answer,
      createdAt: data.created_at,
    };
  }

  async updateFaq(
    eventId: string,
    faqId: string,
    dto: UpdateEventFaqDto,
  ): Promise<EventFaq> {
    const supabase = this.getSupabaseClient();

    await this.findOne(eventId); // Verify event exists

    const updateData: any = {};
    if (dto.question) updateData.question = dto.question;
    if (dto.answer) updateData.answer = dto.answer;

    const { data, error } = await supabase
      .from('events_faq')
      .update(updateData)
      .eq('id', faqId)
      .eq('event_id', eventId)
      .select()
      .single();

    if (error) {
      this.logger.error('Error updating FAQ:', error);
      throw new InternalServerErrorException('Failed to update FAQ');
    }

    // Invalidate cache
    await this.cacheManager.del(`event:${eventId}`);

    return {
      id: data.id,
      eventId: data.event_id,
      question: data.question,
      answer: data.answer,
      createdAt: data.created_at,
    };
  }

  async removeFaq(eventId: string, faqId: string): Promise<void> {
    const supabase = this.getSupabaseClient();

    const { error } = await supabase
      .from('events_faq')
      .delete()
      .eq('id', faqId)
      .eq('event_id', eventId);

    if (error) {
      this.logger.error('Error removing FAQ:', error);
      throw new InternalServerErrorException('Failed to remove FAQ');
    }

    // Invalidate cache
    await this.cacheManager.del(`event:${eventId}`);
  }

  async reorderItems(
    eventId: string,
    entityType: string,
    dto: ReorderEventItemsDto,
  ): Promise<void> {
    const supabase = this.getSupabaseClient();

    await this.findOne(eventId); // Verify event exists

    const tableMap = {
      'additional-info': 'event_additional_info',
      highlights: 'event_highlights',
      schedule: 'event_schedule',
    };

    const tableName = tableMap[entityType];
    if (!tableName) {
      throw new BadRequestException('Invalid entity type for reordering');
    }

    // Update order_index for each item
    for (let i = 0; i < dto.itemIds.length; i++) {
      const { error } = await supabase
        .from(tableName)
        .update({ order_index: i })
        .eq('id', dto.itemIds[i])
        .eq('event_id', eventId);

      if (error) {
        this.logger.error(`Error reordering ${entityType}:`, error);
        throw new InternalServerErrorException(
          `Failed to reorder ${entityType}`,
        );
      }
    }

    // Invalidate cache
    await this.cacheManager.del(`event:${eventId}`);
  }

  // Helper methods
  private async validateOrganizer(organizerId: string): Promise<void> {
    const supabase = this.getSupabaseClient();

    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('id', organizerId)
      .single();

    if (!data) {
      throw new BadRequestException('Invalid organizer ID');
    }
  }

  private async validateTagIds(tagIds: string[]): Promise<void> {
    const supabase = this.getSupabaseClient();

    const { data } = await supabase.from('tags').select('id').in('id', tagIds);

    if (!data || data.length !== tagIds.length) {
      throw new BadRequestException('One or more tag IDs are invalid');
    }
  }

  private async invalidateEventCaches(): Promise<void> {
    // Note: In a production environment, you might want to implement
    // a more sophisticated cache invalidation strategy
    const patterns = ['events:*', 'events:upcoming'];

    for (const pattern of patterns) {
      // Since cache-manager doesn't expose keys(), we'll rely on TTL expiration
      // In production, consider using Redis with pattern-based deletion
    }
  }
}
