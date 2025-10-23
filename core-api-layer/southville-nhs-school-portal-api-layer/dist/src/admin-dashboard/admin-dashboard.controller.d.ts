import { MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AdminDashboardService, AdminDashboardMetrics } from './admin-dashboard.service';
export declare class AdminDashboardController {
    private readonly adminDashboardService;
    constructor(adminDashboardService: AdminDashboardService);
    getMetrics(): Promise<AdminDashboardMetrics>;
    streamMetrics(): Observable<MessageEvent>;
}
