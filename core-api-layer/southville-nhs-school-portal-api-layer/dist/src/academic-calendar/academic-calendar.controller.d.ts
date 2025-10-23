import { AcademicCalendarService } from './academic-calendar.service';
import { CreateAcademicCalendarDto } from './dto/create-academic-calendar.dto';
import { UpdateAcademicCalendarDto } from './dto/update-academic-calendar.dto';
import { UpdateCalendarDayDto } from './dto/update-calendar-day.dto';
import { CreateMarkerDto } from './dto/create-marker.dto';
import { QueryCalendarDto } from './dto/query-calendar.dto';
import { AcademicCalendar } from './entities/academic-calendar.entity';
import { AcademicCalendarDay } from './entities/academic-calendar-day.entity';
import { AcademicCalendarMarker } from './entities/academic-calendar-marker.entity';
export declare class AcademicCalendarController {
    private readonly academicCalendarService;
    private readonly logger;
    constructor(academicCalendarService: AcademicCalendarService);
    create(createAcademicCalendarDto: CreateAcademicCalendarDto): Promise<AcademicCalendar>;
    findAll(queryDto: QueryCalendarDto): Promise<{
        data: AcademicCalendar[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getCurrentCalendar(): Promise<AcademicCalendar | null>;
    findOne(id: string, includeDays?: boolean): Promise<AcademicCalendar>;
    update(id: string, updateAcademicCalendarDto: UpdateAcademicCalendarDto): Promise<AcademicCalendar>;
    remove(id: string): Promise<{
        message: string;
    }>;
    generateDays(id: string): Promise<{
        message: string;
    }>;
    getCalendarDays(id: string): Promise<AcademicCalendarDay[]>;
    updateDay(dayId: string, updateCalendarDayDto: UpdateCalendarDayDto): Promise<AcademicCalendarDay>;
    addCalendarMarker(id: string, createMarkerDto: CreateMarkerDto): Promise<AcademicCalendarMarker>;
    addDayMarker(dayId: number, createMarkerDto: CreateMarkerDto): Promise<AcademicCalendarMarker>;
    updateCurrentDay(): Promise<{
        message: string;
    }>;
}
