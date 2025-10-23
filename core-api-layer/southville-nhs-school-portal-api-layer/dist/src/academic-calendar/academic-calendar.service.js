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
var AcademicCalendarService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcademicCalendarService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
let AcademicCalendarService = AcademicCalendarService_1 = class AcademicCalendarService {
    configService;
    logger = new common_1.Logger(AcademicCalendarService_1.name);
    supabase = null;
    constructor(configService) {
        this.configService = configService;
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
    async create(dto) {
        try {
            const supabase = this.getSupabaseClient();
            const startDate = new Date(dto.start_date);
            const endDate = new Date(dto.end_date);
            if (startDate >= endDate) {
                throw new common_1.BadRequestException('Start date must be before end date');
            }
            const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            const { data: existingCalendar } = await supabase
                .from('academic_calendar')
                .select('id')
                .eq('year', dto.year)
                .eq('month_name', dto.month_name)
                .eq('term', dto.term)
                .single();
            if (existingCalendar) {
                throw new common_1.ConflictException(`Calendar already exists for ${dto.year} ${dto.month_name} ${dto.term}`);
            }
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
                throw new common_1.BadRequestException(`Failed to create calendar: ${error.message}`);
            }
            if (dto.auto_generate_days) {
                await this.generateDays(calendar.id);
            }
            this.logger.log(`Academic calendar created: ${calendar.year} ${calendar.month_name} (ID: ${calendar.id})`);
            return calendar;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException ||
                error instanceof common_1.ConflictException) {
                throw error;
            }
            this.logger.error('Unexpected error creating academic calendar:', error);
            throw new common_1.InternalServerErrorException('Failed to create academic calendar');
        }
    }
    async generateDays(calendarId) {
        try {
            const supabase = this.getSupabaseClient();
            const { data: calendar, error: calendarError } = await supabase
                .from('academic_calendar')
                .select('start_date, end_date')
                .eq('id', calendarId)
                .single();
            if (calendarError || !calendar) {
                throw new common_1.NotFoundException('Academic calendar not found');
            }
            await supabase
                .from('academic_calendar_days')
                .delete()
                .eq('academic_calendar_id', calendarId);
            const days = this.generateCalendarDays(new Date(calendar.start_date), new Date(calendar.end_date));
            const daysData = days.map((day) => ({
                academic_calendar_id: calendarId,
                date: day.date.toISOString().split('T')[0],
                day_of_week: day.day_of_week,
                week_number: day.week_number,
                is_weekend: day.is_weekend,
                is_holiday: day.is_holiday,
                is_current_day: day.is_current_day,
            }));
            const { error: daysError } = await supabase
                .from('academic_calendar_days')
                .insert(daysData);
            if (daysError) {
                this.logger.error('Error generating calendar days:', daysError);
                throw new common_1.BadRequestException(`Failed to generate days: ${daysError.message}`);
            }
            this.logger.log(`Generated ${daysData.length} days for calendar ${calendarId}`);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.logger.error('Unexpected error generating calendar days:', error);
            throw new common_1.InternalServerErrorException('Failed to generate calendar days');
        }
    }
    generateCalendarDays(startDate, endDate) {
        const days = [];
        let currentDate = new Date(startDate);
        let weekNumber = 1;
        const firstDayOfWeek = startDate.getDay();
        while (currentDate <= endDate) {
            const dayOfWeek = currentDate.toLocaleDateString('en-US', {
                weekday: 'long',
            });
            const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
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
    async findAll(queryDto) {
        try {
            const supabase = this.getSupabaseClient();
            const { year, month_name, term, date, includeDays = false, includeMarkers = false, page = 1, limit = 10, sortBy = 'start_date', sortOrder = 'ASC', } = queryDto;
            let query = supabase
                .from('academic_calendar')
                .select('*', { count: 'exact' });
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
            query = query.order(sortBy, { ascending: sortOrder === 'ASC' });
            const from = (page - 1) * limit;
            const to = from + limit - 1;
            query = query.range(from, to);
            const { data: calendars, error, count } = await query;
            if (error) {
                this.logger.error('Error fetching academic calendars:', error);
                throw new common_1.InternalServerErrorException('Failed to fetch calendars');
            }
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
        }
        catch (error) {
            if (error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            this.logger.error('Unexpected error fetching calendars:', error);
            throw new common_1.InternalServerErrorException('Failed to fetch calendars');
        }
    }
    async findOne(id, includeDays = false) {
        try {
            const supabase = this.getSupabaseClient();
            const { data: calendar, error } = await supabase
                .from('academic_calendar')
                .select('*')
                .eq('id', id)
                .single();
            if (error) {
                this.logger.error(`Error fetching calendar ${id}:`, error);
                throw new common_1.NotFoundException(`Calendar with ID ${id} not found`);
            }
            if (includeDays) {
                const { data: days } = await supabase
                    .from('academic_calendar_days')
                    .select('*')
                    .eq('academic_calendar_id', id)
                    .order('date');
                calendar.days = days || [];
            }
            return calendar;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error('Unexpected error fetching calendar:', error);
            throw new common_1.InternalServerErrorException('Failed to fetch calendar');
        }
    }
    async update(id, dto) {
        try {
            const supabase = this.getSupabaseClient();
            const existingCalendar = await this.findOne(id);
            const effectiveStartDate = dto.start_date || existingCalendar.start_date;
            const effectiveEndDate = dto.end_date || existingCalendar.end_date;
            const startDate = new Date(effectiveStartDate);
            const endDate = new Date(effectiveEndDate);
            if (startDate >= endDate) {
                throw new common_1.BadRequestException('Start date must be before end date');
            }
            const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            const updateData = {
                ...dto,
                total_days: totalDays,
                updated_at: new Date().toISOString(),
            };
            const datesChanged = (dto.start_date &&
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
                throw new common_1.BadRequestException(`Failed to update calendar: ${error.message}`);
            }
            if (datesChanged) {
                await this.generateDays(id);
                this.logger.log(`Calendar days regenerated for calendar ${id}`);
            }
            this.logger.log(`Calendar updated: ${calendar.year} ${calendar.month_name} (ID: ${calendar.id})`);
            return calendar;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.logger.error('Unexpected error updating calendar:', error);
            throw new common_1.InternalServerErrorException('Failed to update calendar');
        }
    }
    async remove(id) {
        try {
            const supabase = this.getSupabaseClient();
            await this.findOne(id);
            const { error } = await supabase
                .from('academic_calendar')
                .delete()
                .eq('id', id);
            if (error) {
                this.logger.error(`Error deleting calendar ${id}:`, error);
                throw new common_1.InternalServerErrorException('Failed to delete calendar');
            }
            this.logger.log(`Calendar deleted: ${id}`);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            if (error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            this.logger.error('Unexpected error deleting calendar:', error);
            throw new common_1.InternalServerErrorException('Failed to delete calendar');
        }
    }
    async updateDay(dayId, dto) {
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
                throw new common_1.NotFoundException(`Calendar day with ID ${dayId} not found`);
            }
            this.logger.log(`Calendar day updated: ${day.date} (ID: ${day.id})`);
            return day;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error('Unexpected error updating calendar day:', error);
            throw new common_1.InternalServerErrorException('Failed to update calendar day');
        }
    }
    async addMarker(dto, calendarId, dayId) {
        try {
            const supabase = this.getSupabaseClient();
            const markerData = {
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
                throw new common_1.BadRequestException(`Failed to create marker: ${error.message}`);
            }
            this.logger.log(`Marker created: ${marker.label || marker.color} (ID: ${marker.id})`);
            return marker;
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.logger.error('Unexpected error creating marker:', error);
            throw new common_1.InternalServerErrorException('Failed to create marker');
        }
    }
    async updateCurrentDay() {
        try {
            const supabase = this.getSupabaseClient();
            const today = new Date().toISOString().split('T')[0];
            await supabase
                .from('academic_calendar_days')
                .update({ is_current_day: false })
                .eq('is_current_day', true);
            const { error } = await supabase
                .from('academic_calendar_days')
                .update({ is_current_day: true })
                .eq('date', today);
            if (error) {
                this.logger.error('Error updating current day:', error);
                throw new common_1.InternalServerErrorException('Failed to update current day');
            }
            this.logger.log(`Current day updated to: ${today}`);
        }
        catch (error) {
            if (error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            this.logger.error('Unexpected error updating current day:', error);
            throw new common_1.InternalServerErrorException('Failed to update current day');
        }
    }
    async findDayById(dayId) {
        try {
            const supabase = this.getSupabaseClient();
            const { data: day, error } = await supabase
                .from('academic_calendar_days')
                .select('*')
                .eq('id', dayId)
                .single();
            if (error || !day) {
                throw new common_1.NotFoundException(`Calendar day with ID ${dayId} not found`);
            }
            return day;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Error fetching calendar day ${dayId}:`, error);
            throw new common_1.InternalServerErrorException('Failed to fetch calendar day');
        }
    }
    async getCurrentCalendar() {
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
        }
        catch (error) {
            this.logger.error('Unexpected error fetching current calendar:', error);
            throw new common_1.InternalServerErrorException('Failed to fetch current calendar');
        }
    }
};
exports.AcademicCalendarService = AcademicCalendarService;
exports.AcademicCalendarService = AcademicCalendarService = AcademicCalendarService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AcademicCalendarService);
//# sourceMappingURL=academic-calendar.service.js.map