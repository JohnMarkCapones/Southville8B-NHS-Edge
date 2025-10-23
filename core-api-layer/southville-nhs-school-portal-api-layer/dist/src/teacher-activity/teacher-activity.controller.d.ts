import { TeacherActivityService } from './teacher-activity.service';
export interface TeacherActivityDto {
    studentName: string;
    studentInitials: string;
    activity: string;
    timeAgo: string;
    timestamp: Date;
}
export declare class TeacherActivityController {
    private readonly teacherActivityService;
    private readonly logger;
    constructor(teacherActivityService: TeacherActivityService);
    getRecentActivities(user: any): Promise<TeacherActivityDto[]>;
}
