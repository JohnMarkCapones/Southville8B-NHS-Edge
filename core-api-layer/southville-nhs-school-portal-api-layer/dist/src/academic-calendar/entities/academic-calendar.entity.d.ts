import { AcademicCalendarDay } from './academic-calendar-day.entity';
import { AcademicCalendarMarker } from './academic-calendar-marker.entity';
export declare class AcademicCalendar {
    id: string;
    year: string;
    month_name: string;
    term: string;
    start_date: Date;
    end_date: Date;
    total_days: number;
    description: string;
    created_at: Date;
    updated_at: Date;
    days: AcademicCalendarDay[];
    markers: AcademicCalendarMarker[];
}
