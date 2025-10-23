import { MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { DesktopSidebarService, SidebarMetrics, TeacherSidebarMetrics } from './desktop-sidebar.service';
export declare class DesktopSidebarController {
    private readonly desktopSidebarService;
    constructor(desktopSidebarService: DesktopSidebarService);
    streamMetrics(): Observable<MessageEvent>;
    getMetrics(): Promise<SidebarMetrics>;
    streamTeacherMetrics(user: any): Observable<MessageEvent>;
    getTeacherMetrics(user: any): Promise<TeacherSidebarMetrics>;
}
