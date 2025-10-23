export declare class CreateAcademicCalendarDto {
    year: string;
    month_name: string;
    term: string;
    start_date: string;
    end_date: string;
    description?: string;
    auto_generate_days?: boolean;
    private _dateRangeValidation?;
}
