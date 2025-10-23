import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
export interface SidebarMetrics {
    events: number;
    teachers: number;
    students: number;
    sections: number;
    lastUpdated: string;
}
export interface TeacherSidebarMetrics {
    totalClasses: number;
    pendingAssignments: number;
    totalStudents: number;
    unreadMessages: number;
    lastUpdated: string;
}
export declare class DesktopSidebarService {
    private configService;
    private readonly logger;
    private supabase;
    private metricsSubject;
    private teacherMetricsSubject;
    constructor(configService: ConfigService);
    private startMetricsPolling;
    private fetchMetrics;
    getMetricsStream(): Observable<MessageEvent>;
    triggerMetricsUpdate(): Promise<SidebarMetrics>;
    private fetchTeacherMetrics;
    getTeacherMetricsStream(teacherId: string): Observable<MessageEvent>;
    triggerTeacherMetricsUpdate(teacherId: string): Promise<TeacherSidebarMetrics>;
}
