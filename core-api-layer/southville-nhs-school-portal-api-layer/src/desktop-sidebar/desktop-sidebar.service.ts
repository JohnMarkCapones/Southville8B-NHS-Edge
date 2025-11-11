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
  totalAnnouncements: number;
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

  async getStudentDistribution(): Promise<{
    total: number;
    grades: { grade: string; count: number }[];
  }> {
    try {
      // Fetch all grade_level values; small dataset so client-side aggregation is acceptable
      const { data, error } = await this.supabase
        .from('students')
        .select('grade_level');

      if (error) {
        this.logger.error('Error fetching student distribution', error);
        throw error;
      }

      const counts: Record<string, number> = {
        'Grade 7': 0,
        'Grade 8': 0,
        'Grade 9': 0,
        'Grade 10': 0,
      };

      for (const row of data ?? []) {
        const gl = (row as any).grade_level as string | null;
        if (gl && counts.hasOwnProperty(gl)) counts[gl] += 1;
      }

      const total = Object.values(counts).reduce((a, b) => a + b, 0);

      return {
        total,
        grades: [
          { grade: 'Grade 7', count: counts['Grade 7'] },
          { grade: 'Grade 8', count: counts['Grade 8'] },
          { grade: 'Grade 9', count: counts['Grade 9'] },
          { grade: 'Grade 10', count: counts['Grade 10'] },
        ],
      };
    } catch (err) {
      this.logger.error('getStudentDistribution failed', err);
      return {
        total: 0,
        grades: [
          { grade: 'Grade 7', count: 0 },
          { grade: 'Grade 8', count: 0 },
          { grade: 'Grade 9', count: 0 },
          { grade: 'Grade 10', count: 0 },
        ],
      };
    }
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
    userId: string,
  ): Promise<TeacherSidebarMetrics> {
    try {
      this.logger.debug(`[SSE] Fetching metrics for userId: ${userId}`);

      // Step 1: Get teacher record to get teacher.id
      const { data: teacher } = await this.supabase
        .from('teachers')
        .select('id')
        .eq('user_id', userId)
        .single();

      this.logger.debug(
        `[SSE] Teacher lookup result: ${JSON.stringify(teacher)}`,
      );

      if (!teacher) {
        this.logger.warn(`No teacher found for user_id: ${userId}`);
        return {
          totalClasses: 6,
          totalAnnouncements: 24,
          totalStudents: 180,
          unreadMessages: 12,
          lastUpdated: new Date().toISOString(),
        };
      }

      // Step 2: Fetch teacher's active classes count using teacher.id
      const { count: totalClasses } = await this.supabase
        .from('schedules')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', teacher.id)
        .eq('status', 'Active');

      this.logger.debug(`[SSE] Total classes count: ${totalClasses}`);

      // Step 3: Fetch unique students count from teacher's schedules using teacher.id
      const { data: studentSchedules } = await this.supabase
        .from('student_schedule')
        .select('student_id')
        .in(
          'schedule_id',
          await this.supabase
            .from('schedules')
            .select('id')
            .eq('teacher_id', teacher.id)
            .eq('status', 'Active')
            .then((result) => result.data?.map((s) => s.id) || []),
        );

      const uniqueStudents = new Set(
        studentSchedules?.map((s) => s.student_id) || [],
      ).size;

      // Step 4: Fetch teacher's announcements count using userId (not author_id)
      const { count: totalAnnouncements } = await this.supabase
        .from('announcements')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      this.logger.debug(
        `[SSE] Announcements query - userId: ${userId}, count: ${totalAnnouncements}`,
      );

      // Add a verification query to see actual announcements
      const { data: announcementsList, error: announcementsError } =
        await this.supabase
          .from('announcements')
          .select('id, title, user_id')
          .eq('user_id', userId);

      this.logger.debug(
        `[SSE] Announcements list: ${JSON.stringify(announcementsList)}`,
      );
      if (announcementsError) {
        this.logger.error(
          `[SSE] Announcements query error: ${JSON.stringify(announcementsError)}`,
        );
      }

      // Mock unread messages for now
      const unreadMessages = Math.floor(Math.random() * 15); // Random between 0-15

      const finalMetrics = {
        totalClasses: totalClasses || 0,
        totalAnnouncements: totalAnnouncements || 0,
        totalStudents: uniqueStudents,
        unreadMessages,
        lastUpdated: new Date().toISOString(),
      };

      this.logger.debug(
        `[SSE] Final metrics: ${JSON.stringify({
          totalClasses: totalClasses || 0,
          totalAnnouncements: totalAnnouncements || 0,
          totalStudents: uniqueStudents,
          unreadMessages,
        })}`,
      );

      return finalMetrics;
    } catch (error) {
      this.logger.error('Error fetching teacher sidebar metrics:', error);
      this.logger.error(`[SSE] Full error details: ${JSON.stringify(error)}`);
      // Return default values on error
      return {
        totalClasses: 6,
        totalAnnouncements: 24,
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
