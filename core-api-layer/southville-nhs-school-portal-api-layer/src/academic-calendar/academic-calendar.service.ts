import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateAcademicCalendarDto } from './dto/create-academic-calendar.dto';
import { UpdateAcademicCalendarDto } from './dto/update-academic-calendar.dto';
import { CreateCalendarDayDto } from './dto/create-calendar-day.dto';
import { UpdateCalendarDayDto } from './dto/update-calendar-day.dto';
import { CreateMarkerDto } from './dto/create-marker.dto';
import { UpdateMarkerDto } from './dto/update-marker.dto';
import { QueryCalendarDto } from './dto/query-calendar.dto';
import { AcademicCalendar } from './entities/academic-calendar.entity';
import { AcademicCalendarDay } from './entities/academic-calendar-day.entity';
import { AcademicCalendarMarker } from './entities/academic-calendar-marker.entity';

@Injectable()
export class AcademicCalendarService {
  private readonly logger = new Logger(AcademicCalendarService.name);
  private supabase: SupabaseClient | null = null;

  constructor(private configService: ConfigService) {}

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

  /**
   * Create a new academic calendar
   */
  async create(dto: CreateAcademicCalendarDto): Promise<AcademicCalendar> {
    try {
      const supabase = this.getSupabaseClient();

      // Validate dates
      const startDate = new Date(dto.start_date);
      const endDate = new Date(dto.end_date);

      if (startDate >= endDate) {
        throw new BadRequestException('Start date must be before end date');
      }

      // Calculate total days
      const totalDays =
        Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
        ) + 1;

      // Check for overlapping calendars
      const { data: existingCalendar } = await supabase
        .from('academic_calendar')
        .select('id')
        .eq('year', dto.year)
        .eq('month_name', dto.month_name)
        .eq('term', dto.term)
        .single();

      if (existingCalendar) {
        throw new ConflictException(
          `Calendar already exists for ${dto.year} ${dto.month_name} ${dto.term}`,
        );
      }

      // Create calendar record
      const { data: calendar, error } = await supabase
        .from('academic_calendar')
        .insert({
          year: dto.year,
          month_name: dto.month_name,
          term: dto.term,
          start_date: dto.start_date,
          end_date: dto.end_date,
          total_days: totalDays,
          description: dto.description,
        })
        .select('*')
        .single();

      if (error) {
        this.logger.error('Error creating academic calendar:', error);
        throw new BadRequestException(
          `Failed to create calendar: ${error.message}`,
        );
      }

      // Auto-generate days if requested
      if (dto.auto_generate_days) {
        await this.generateDays(calendar.id);
      }

      this.logger.log(
        `Academic calendar created: ${calendar.year} ${calendar.month_name} (ID: ${calendar.id})`,
      );
      return calendar;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      this.logger.error('Unexpected error creating academic calendar:', error);
      throw new InternalServerErrorException(
        'Failed to create academic calendar',
      );
    }
  }

  /**
   * Generate calendar days for a given calendar
   */
  async generateDays(calendarId: string): Promise<void> {
    try {
      const supabase = this.getSupabaseClient();

      // Get calendar details
      const { data: calendar, error: calendarError } = await supabase
        .from('academic_calendar')
        .select('start_date, end_date')
        .eq('id', calendarId)
        .single();

      if (calendarError || !calendar) {
        throw new NotFoundException('Academic calendar not found');
      }

      // Delete existing days
      await supabase
        .from('academic_calendar_days')
        .delete()
        .eq('academic_calendar_id', calendarId);

      // Generate new days
      const days = this.generateCalendarDays(
        new Date(calendar.start_date),
        new Date(calendar.end_date),
      );

      // Prepare data for bulk insert
      const daysData = days.map((day) => ({
        academic_calendar_id: calendarId,
        date: day.date.toISOString().split('T')[0],
        day_of_week: day.day_of_week,
        week_number: day.week_number,
        is_weekend: day.is_weekend,
        is_holiday: day.is_holiday,
        is_current_day: day.is_current_day,
      }));

      // Bulk insert days
      const { error: daysError } = await supabase
        .from('academic_calendar_days')
        .insert(daysData);

      if (daysError) {
        this.logger.error('Error generating calendar days:', daysError);
        throw new BadRequestException(
          `Failed to generate days: ${daysError.message}`,
        );
      }

      this.logger.log(
        `Generated ${daysData.length} days for calendar ${calendarId}`,
      );
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error('Unexpected error generating calendar days:', error);
      throw new InternalServerErrorException(
        'Failed to generate calendar days',
      );
    }
  }

  /**
   * Generate calendar days algorithm
   */
  private generateCalendarDays(startDate: Date, endDate: Date): any[] {
    const days: any[] = [];
    let currentDate = new Date(startDate);
    let weekNumber = 1;
    const firstDayOfWeek = startDate.getDay();

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
      });
      const isWeekend =
        currentDate.getDay() === 0 || currentDate.getDay() === 6;

      // Calculate week number (reset on Sunday)
      if (currentDate.getDay() === 0 && currentDate > startDate) {
        weekNumber++;
      }

      days.push({
        date: new Date(currentDate),
        day_of_week: dayOfWeek,
        week_number: weekNumber,
        is_weekend: isWeekend,
        is_holiday: false,
        is_current_day: false,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  }

  /**
   * Get all calendars with filtering and pagination
   */
  async findAll(queryDto: QueryCalendarDto): Promise<{
    data: AcademicCalendar[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const supabase = this.getSupabaseClient();
      const {
        year,
        month_name,
        term,
        date,
        includeDays = false,
        includeMarkers = false,
        page = 1,
        limit = 10,
        sortBy = 'start_date',
        sortOrder = 'ASC',
      } = queryDto;

      let query = supabase
        .from('academic_calendar')
        .select('*', { count: 'exact' });

      // Apply filters
      if (year) {
        query = query.eq('year', year);
      }
      if (month_name) {
        query = query.eq('month_name', month_name);
      }
      if (term) {
        query = query.eq('term', term);
      }
      if (date) {
        query = query.lte('start_date', date).gte('end_date', date);
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'ASC' });

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data: calendars, error, count } = await query;

      if (error) {
        this.logger.error('Error fetching academic calendars:', error);
        throw new InternalServerErrorException('Failed to fetch calendars');
      }

      // Load related data if requested
      if (includeDays || includeMarkers) {
        for (const calendar of calendars || []) {
          if (includeDays) {
            const { data: days } = await supabase
              .from('academic_calendar_days')
              .select('*')
              .eq('academic_calendar_id', calendar.id)
              .order('date');
            calendar.days = days || [];
          }
          if (includeMarkers) {
            const { data: markers } = await supabase
              .from('academic_calendar_markers')
              .select('*')
              .eq('academic_calendar_id', calendar.id)
              .order('order_priority');
            calendar.markers = markers || [];
          }
        }
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        data: calendars || [],
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.error('Unexpected error fetching calendars:', error);
      throw new InternalServerErrorException('Failed to fetch calendars');
    }
  }

  /**
   * Get a single calendar by ID
   */
  async findOne(
    id: string,
    includeDays: boolean = false,
  ): Promise<AcademicCalendar> {
    try {
      const supabase = this.getSupabaseClient();

      const { data: calendar, error } = await supabase
        .from('academic_calendar')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        this.logger.error(`Error fetching calendar ${id}:`, error);
        throw new NotFoundException(`Calendar with ID ${id} not found`);
      }

      // Load days if requested
      if (includeDays) {
        const { data: days } = await supabase
          .from('academic_calendar_days')
          .select('*')
          .eq('academic_calendar_id', id)
          .order('date');
        calendar.days = days || [];
      }

      return calendar;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Unexpected error fetching calendar:', error);
      throw new InternalServerErrorException('Failed to fetch calendar');
    }
  }

  /**
   * Update a calendar
   */
  async update(
    id: string,
    dto: UpdateAcademicCalendarDto,
  ): Promise<AcademicCalendar> {
    try {
      const supabase = this.getSupabaseClient();

      // Get existing calendar to check current values
      const existingCalendar = await this.findOne(id);

      // Resolve effective start_date and end_date
      const effectiveStartDate = dto.start_date || existingCalendar.start_date;
      const effectiveEndDate = dto.end_date || existingCalendar.end_date;

      // Validate date range
      const startDate = new Date(effectiveStartDate);
      const endDate = new Date(effectiveEndDate);

      if (startDate >= endDate) {
        throw new BadRequestException('Start date must be before end date');
      }

      // Recompute total_days based on effective range
      const totalDays =
        Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
        ) + 1;

      // Prepare update data
      const updateData: any = {
        ...dto,
        total_days: totalDays,
        updated_at: new Date().toISOString(),
      };

      // Check if dates changed from existing record
      const datesChanged =
        (dto.start_date &&
          dto.start_date !==
            existingCalendar.start_date.toISOString().split('T')[0]) ||
        (dto.end_date &&
          dto.end_date !==
            existingCalendar.end_date.toISOString().split('T')[0]);

      const { data: calendar, error } = await supabase
        .from('academic_calendar')
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        this.logger.error(`Error updating calendar ${id}:`, error);
        throw new BadRequestException(
          `Failed to update calendar: ${error.message}`,
        );
      }

      // Regenerate days if dates changed
      if (datesChanged) {
        await this.generateDays(id);
        this.logger.log(`Calendar days regenerated for calendar ${id}`);
      }

      this.logger.log(
        `Calendar updated: ${calendar.year} ${calendar.month_name} (ID: ${calendar.id})`,
      );
      return calendar;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error('Unexpected error updating calendar:', error);
      throw new InternalServerErrorException('Failed to update calendar');
    }
  }

  /**
   * Delete a calendar
   */
  async remove(id: string): Promise<void> {
    try {
      const supabase = this.getSupabaseClient();

      // Check if calendar exists
      await this.findOne(id);

      const { error } = await supabase
        .from('academic_calendar')
        .delete()
        .eq('id', id);

      if (error) {
        this.logger.error(`Error deleting calendar ${id}:`, error);
        throw new InternalServerErrorException('Failed to delete calendar');
      }

      this.logger.log(`Calendar deleted: ${id}`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.error('Unexpected error deleting calendar:', error);
      throw new InternalServerErrorException('Failed to delete calendar');
    }
  }

  /**
   * Update a calendar day
   */
  async updateDay(
    dayId: number,
    dto: UpdateCalendarDayDto,
  ): Promise<AcademicCalendarDay> {
    try {
      const supabase = this.getSupabaseClient();

      const { data: day, error } = await supabase
        .from('academic_calendar_days')
        .update(dto)
        .eq('id', dayId)
        .select('*')
        .single();

      if (error) {
        this.logger.error(`Error updating day ${dayId}:`, error);
        throw new NotFoundException(`Calendar day with ID ${dayId} not found`);
      }

      this.logger.log(`Calendar day updated: ${day.date} (ID: ${day.id})`);
      return day;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Unexpected error updating calendar day:', error);
      throw new InternalServerErrorException('Failed to update calendar day');
    }
  }

  /**
   * Add a marker to calendar or day
   */
  async addMarker(
    dto: CreateMarkerDto,
    calendarId: string,
    dayId?: number,
  ): Promise<AcademicCalendarMarker> {
    try {
      const supabase = this.getSupabaseClient();

      const markerData: any = {
        academic_calendar_id: calendarId,
        color: dto.color,
        icon: dto.icon,
        label: dto.label,
        order_priority: dto.order_priority,
      };

      if (dayId) {
        markerData.academic_calendar_day_id = dayId;
      }

      const { data: marker, error } = await supabase
        .from('academic_calendar_markers')
        .insert(markerData)
        .select('*')
        .single();

      if (error) {
        this.logger.error('Error creating marker:', error);
        throw new BadRequestException(
          `Failed to create marker: ${error.message}`,
        );
      }

      this.logger.log(
        `Marker created: ${marker.label || marker.color} (ID: ${marker.id})`,
      );
      return marker;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Unexpected error creating marker:', error);
      throw new InternalServerErrorException('Failed to create marker');
    }
  }

  /**
   * Update current day flag (for background job)
   */
  async updateCurrentDay(): Promise<void> {
    try {
      const supabase = this.getSupabaseClient();
      const today = new Date().toISOString().split('T')[0];

      // Reset all current day flags
      await supabase
        .from('academic_calendar_days')
        .update({ is_current_day: false })
        .eq('is_current_day', true);

      // Set today's date as current day
      const { error } = await supabase
        .from('academic_calendar_days')
        .update({ is_current_day: true })
        .eq('date', today);

      if (error) {
        this.logger.error('Error updating current day:', error);
        throw new InternalServerErrorException('Failed to update current day');
      }

      this.logger.log(`Current day updated to: ${today}`);
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.error('Unexpected error updating current day:', error);
      throw new InternalServerErrorException('Failed to update current day');
    }
  }

  /**
   * Find a calendar day by ID
   */
  async findDayById(dayId: number): Promise<AcademicCalendarDay> {
    try {
      const supabase = this.getSupabaseClient();

      const { data: day, error } = await supabase
        .from('academic_calendar_days')
        .select('*')
        .eq('id', dayId)
        .single();

      if (error || !day) {
        throw new NotFoundException(`Calendar day with ID ${dayId} not found`);
      }

      return day;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error fetching calendar day ${dayId}:`, error);
      throw new InternalServerErrorException('Failed to fetch calendar day');
    }
  }

  /**
   * Get current month calendar
   */
  async getCurrentCalendar(): Promise<AcademicCalendar | null> {
    try {
      const supabase = this.getSupabaseClient();
      const today = new Date().toISOString().split('T')[0];

      const { data: calendar, error } = await supabase
        .from('academic_calendar')
        .select('*')
        .lte('start_date', today)
        .gte('end_date', today)
        .single();

      if (error) {
        this.logger.log('No current calendar found');
        return null;
      }

      return calendar;
    } catch (error) {
      this.logger.error('Unexpected error fetching current calendar:', error);
      throw new InternalServerErrorException(
        'Failed to fetch current calendar',
      );
    }
  }
}
