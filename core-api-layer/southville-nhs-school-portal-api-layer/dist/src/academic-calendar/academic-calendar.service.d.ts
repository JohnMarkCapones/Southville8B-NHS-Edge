import { ConfigService } from '@nestjs/config';
import { CreateAcademicCalendarDto } from './dto/create-academic-calendar.dto';
import { UpdateAcademicCalendarDto } from './dto/update-academic-calendar.dto';
import { UpdateCalendarDayDto } from './dto/update-calendar-day.dto';
import { CreateMarkerDto } from './dto/create-marker.dto';
import { QueryCalendarDto } from './dto/query-calendar.dto';
import { AcademicCalendar } from './entities/academic-calendar.entity';
import { AcademicCalendarDay } from './entities/academic-calendar-day.entity';
import { AcademicCalendarMarker } from './entities/academic-calendar-marker.entity';
export declare class AcademicCalendarService {
    private configService;
    private readonly logger;
    private supabase;
    constructor(configService: ConfigService);
    private getSupabaseClient;
    create(dto: CreateAcademicCalendarDto): Promise<AcademicCalendar>;
    generateDays(calendarId: string): Promise<void>;
    private generateCalendarDays;
    findAll(queryDto: QueryCalendarDto): Promise<{
        data: AcademicCalendar[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string, includeDays?: boolean): Promise<AcademicCalendar>;
    update(id: string, dto: UpdateAcademicCalendarDto): Promise<AcademicCalendar>;
    remove(id: string): Promise<void>;
    updateDay(dayId: number, dto: UpdateCalendarDayDto): Promise<AcademicCalendarDay>;
    addMarker(dto: CreateMarkerDto, calendarId: string, dayId?: number): Promise<AcademicCalendarMarker>;
    updateCurrentDay(): Promise<void>;
    findDayById(dayId: number): Promise<AcademicCalendarDay>;
    getCurrentCalendar(): Promise<AcademicCalendar | null>;
}
