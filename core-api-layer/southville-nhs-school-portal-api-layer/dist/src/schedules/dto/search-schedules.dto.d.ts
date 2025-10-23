import { DayOfWeek, Semester } from '../entities/schedule.entity';
export declare class SearchSchedulesDto {
    search?: string;
    sectionId?: string;
    teacherId?: string;
    dayOfWeek?: DayOfWeek;
    schoolYear?: string;
    semester?: Semester;
    page?: number;
    limit?: number;
}
