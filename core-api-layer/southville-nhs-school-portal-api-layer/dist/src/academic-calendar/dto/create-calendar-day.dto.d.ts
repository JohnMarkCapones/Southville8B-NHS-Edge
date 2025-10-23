export declare class CreateCalendarDayDto {
    academic_calendar_id: string;
    date: string;
    day_of_week: string;
    week_number: number;
    is_weekend?: boolean;
    is_holiday?: boolean;
    is_current_day?: boolean;
    marker_icon?: string;
    marker_color?: string;
    note?: string;
}
