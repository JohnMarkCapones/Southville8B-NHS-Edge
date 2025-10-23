import { AcademicCalendar } from './academic-calendar.entity';
import { AcademicCalendarMarker } from './academic-calendar-marker.entity';
export declare class AcademicCalendarDay {
    id: number;
    academic_calendar_id: string;
    date: Date;
    day_of_week: string;
    week_number: number;
    is_weekend: boolean;
    is_holiday: boolean;
    is_current_day: boolean;
    marker_icon: string;
    marker_color: string;
    note: string;
    created_at: Date;
    academic_calendar: AcademicCalendar;
    markers: AcademicCalendarMarker[];
}
