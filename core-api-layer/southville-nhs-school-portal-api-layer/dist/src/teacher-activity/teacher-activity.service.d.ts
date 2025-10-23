import { ConfigService } from '@nestjs/config';
export interface TeacherActivityDto {
    studentName: string;
    studentInitials: string;
    activity: string;
    timeAgo: string;
    timestamp: Date;
}
export declare class TeacherActivityService {
    private configService;
    private readonly logger;
    private supabase;
    constructor(configService: ConfigService);
    getRecentActivities(teacherId: string): Promise<TeacherActivityDto[]>;
    private getInitials;
    private formatTimeAgo;
}
