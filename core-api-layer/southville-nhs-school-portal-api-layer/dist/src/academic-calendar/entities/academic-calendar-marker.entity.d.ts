import { AcademicCalendar } from './academic-calendar.entity';
import { AcademicCalendarDay } from './academic-calendar-day.entity';
export declare class AcademicCalendarMarker {
    id: number;
    academic_calendar_id: string;
    academic_calendar_day_id: number;
    color: string;
    icon: string;
    label: string;
    order_priority: number;
    created_at: Date;
    academic_calendar: AcademicCalendar;
    academic_calendar_day: AcademicCalendarDay;
}
