export declare class QueryCalendarDto {
    year?: string;
    month_name?: string;
    term?: string;
    date?: string;
    includeDays?: boolean;
    includeMarkers?: boolean;
    page?: number;
    limit?: number;
    sortBy?: 'year' | 'month_name' | 'term' | 'start_date' | 'end_date' | 'created_at';
    sortOrder?: 'ASC' | 'DESC';
}
