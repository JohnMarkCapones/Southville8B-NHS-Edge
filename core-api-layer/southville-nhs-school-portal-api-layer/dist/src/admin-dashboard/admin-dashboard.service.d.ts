import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
export interface AdminDashboardMetrics {
    totalStudents: number;
    activeTeachers: number;
    totalSections: number;
    onlineUsersCount: number;
    lastUpdated: string;
}
export declare class AdminDashboardService {
    private configService;
    private readonly logger;
    private supabase;
    private metricsSubject;
    constructor(configService: ConfigService);
    private startMetricsPolling;
    private fetchMetrics;
    getMetricsStream(): Observable<MessageEvent>;
    triggerMetricsUpdate(): Promise<AdminDashboardMetrics>;
}
