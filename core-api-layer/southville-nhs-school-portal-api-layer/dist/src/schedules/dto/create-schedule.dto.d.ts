import { DayOfWeek, Semester } from '../entities/schedule.entity';
export declare class CreateScheduleDto {
    subjectId: string;
    teacherId: string;
    sectionId: string;
    roomId: string;
    buildingId: string;
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
    schoolYear: string;
    semester: Semester;
}
