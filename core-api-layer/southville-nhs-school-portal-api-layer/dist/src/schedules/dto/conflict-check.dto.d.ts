import { DayOfWeek, Semester } from '../entities/schedule.entity';
export declare class ConflictCheckDto {
    excludeScheduleId?: string;
    teacherId?: string;
    roomId?: string;
    sectionId?: string;
    dayOfWeek?: DayOfWeek;
    startTime?: string;
    endTime?: string;
    schoolYear?: number;
    semester?: Semester;
}
