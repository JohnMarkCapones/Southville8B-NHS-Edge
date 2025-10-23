import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Observable, Subject, interval } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';

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

@Injectable()
export class DesktopSidebarService {
  private readonly logger = new Logger(DesktopSidebarService.name);
  private supabase: SupabaseClient;
  private metricsSubject = new Subject<SidebarMetrics>();
  private teacherMetricsSubject = new Subject<TeacherSidebarMetrics>();

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('supabase.url');
    const serviceRoleKey = this.configService.get<string>(
      'supabase.serviceRoleKey',
    );

    this.supabase = createClient(supabaseUrl!, serviceRoleKey!);

    // Start periodic metrics updates
    this.startMetricsPolling();
  }

  private startMetricsPolling() {
    // Update metrics every 30 seconds
    interval(30000)
      .pipe(
        startWith(0), // Immediate first update
        switchMap(() => this.fetchMetrics()),
      )
      .subscribe({
        next: (metrics) => {
          this.metricsSubject.next(metrics);
          this.logger.log(
            `Sidebar metrics updated: ${JSON.stringify(metrics)}`,
          );
        },
        error: (error) => {
          this.logger.error('Error updating sidebar metrics:', error);
        },
      });
  }

  private async fetchMetrics(): Promise<SidebarMetrics> {
    try {
      // Fetch events count (published + completed events only)
      const { count: eventsCount } = await this.supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .in('status', ['published', 'completed']);

      // Fetch teachers count (users with teacher role)
      const { count: teachersCount } = await this.supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Active')
        .eq('role_id', 'f8e53b78-9508-48b1-8d7f-4afa2e6f83c6'); // Teacher role UUID

      // Fetch students count (users with student role)
      const { count: studentsCount } = await this.supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Active')
        .eq('role_id', '129922d5-b2c3-4ac9-89d7-0f1bb9946551'); // Student role UUID

      // Fetch sections count
      const { count: sectionsCount } = await this.supabase
        .from('sections')
        .select('*', { count: 'exact', head: true });

      return {
        events: eventsCount || 0,
        teachers: teachersCount || 0,
        students: studentsCount || 0,
        sections: sectionsCount || 0,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error fetching sidebar metrics:', error);
      // Return default values on error
      return {
        events: 120,
        teachers: 45,
        students: 1512,
        sections: 144,
        lastUpdated: new Date().toISOString(),
      };
    }
  }

  // SSE stream for real-time metrics
  getMetricsStream(): Observable<MessageEvent> {
    return this.metricsSubject
      .asObservable()
      .pipe(
        map(
          (metrics) =>
            ({ type: 'metrics-update', data: metrics }) as MessageEvent,
        ),
      );
  }

  // Manual trigger for immediate update
  async triggerMetricsUpdate(): Promise<SidebarMetrics> {
    const metrics = await this.fetchMetrics();
    this.metricsSubject.next(metrics);
    return metrics;
  }

  // Teacher-specific metrics methods
  private async fetchTeacherMetrics(
    teacherId: string,
  ): Promise<TeacherSidebarMetrics> {
    try {
      // Fetch teacher's active classes count
      const { count: totalClasses } = await this.supabase
        .from('schedules')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', teacherId)
        .eq('status', 'Active');

      // Fetch unique students count from teacher's schedules
      const { data: studentSchedules } = await this.supabase
        .from('student_schedules')
        .select('student_id')
        .in(
          'schedule_id',
          await this.supabase
            .from('schedules')
            .select('id')
            .eq('teacher_id', teacherId)
            .eq('status', 'Active')
            .then((result) => result.data?.map((s) => s.id) || []),
        );

      const uniqueStudents = new Set(
        studentSchedules?.map((s) => s.student_id) || [],
      ).size;

      // Mock pending assignments for now (can be replaced with actual assignments table query)
      const pendingAssignments = Math.floor(Math.random() * 30) + 5; // Random between 5-35

      // Mock unread messages for now
      const unreadMessages = Math.floor(Math.random() * 15); // Random between 0-15

      return {
        totalClasses: totalClasses || 0,
        pendingAssignments,
        totalStudents: uniqueStudents,
        unreadMessages,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error fetching teacher sidebar metrics:', error);
      // Return default values on error
      return {
        totalClasses: 6,
        pendingAssignments: 24,
        totalStudents: 180,
        unreadMessages: 12,
        lastUpdated: new Date().toISOString(),
      };
    }
  }

  // SSE stream for teacher real-time metrics
  getTeacherMetricsStream(teacherId: string): Observable<MessageEvent> {
    // Start periodic teacher metrics updates
    interval(30000)
      .pipe(
        startWith(0), // Immediate first update
        switchMap(() => this.fetchTeacherMetrics(teacherId)),
      )
      .subscribe({
        next: (metrics) => {
          this.teacherMetricsSubject.next(metrics);
          this.logger.log(
            `Teacher sidebar metrics updated for ${teacherId}: ${JSON.stringify(metrics)}`,
          );
        },
        error: (error) => {
          this.logger.error('Error updating teacher sidebar metrics:', error);
        },
      });

    return this.teacherMetricsSubject
      .asObservable()
      .pipe(
        map(
          (metrics) =>
            ({ type: 'teacher-metrics-update', data: metrics }) as MessageEvent,
        ),
      );
  }

  // Manual trigger for immediate teacher metrics update
  async triggerTeacherMetricsUpdate(
    teacherId: string,
  ): Promise<TeacherSidebarMetrics> {
    const metrics = await this.fetchTeacherMetrics(teacherId);
    this.teacherMetricsSubject.next(metrics);
    return metrics;
  }
}
