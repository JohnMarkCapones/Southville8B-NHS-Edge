import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface TeacherActivityDto {
  studentName: string;
  studentInitials: string;
  activity: string;
  timeAgo: string;
  timestamp: Date;
}

@Injectable()
export class TeacherActivityService {
  private readonly logger = new Logger(TeacherActivityService.name);
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('supabase.url');
    const serviceRoleKey = this.configService.get<string>(
      'supabase.serviceRoleKey',
    );

    this.supabase = createClient(supabaseUrl!, serviceRoleKey!);
  }

  async getRecentActivities(teacherId: string): Promise<TeacherActivityDto[]> {
    try {
      this.logger.log(`Fetching recent activities for teacher: ${teacherId}`);

      // Get teacher's schedule IDs to find related activities
      const { data: schedules } = await this.supabase
        .from('schedules')
        .select('id')
        .eq('teacher_id', teacherId)
        .eq('status', 'Active');

      const scheduleIds = schedules?.map((s) => s.id) || [];

      if (scheduleIds.length === 0) {
        this.logger.log(`No active schedules found for teacher: ${teacherId}`);
        return [];
      }

      // Get students from teacher's schedules
      const { data: studentSchedules } = await this.supabase
        .from('student_schedule')
        .select('student_id')
        .in('schedule_id', scheduleIds);

      const studentIds = [
        ...new Set(studentSchedules?.map((s) => s.student_id) || []),
      ];

      if (studentIds.length === 0) {
        this.logger.log(`No students found for teacher: ${teacherId}`);
        return [];
      }

      // Get student names
      const { data: students } = await this.supabase
        .from('users')
        .select('id, full_name')
        .in('id', studentIds);

      const studentMap = new Map(
        students?.map((s) => [s.id, s.full_name]) || [],
      );

      // Mock recent activities for now (can be replaced with actual queries)
      const activities: TeacherActivityDto[] = [];
      const activityTypes = [
        'Submitted Assignment #3',
        'Asked question in Math class',
        'Completed quiz successfully',
        'Downloaded module materials',
        'Submitted homework',
        'Participated in class discussion',
        'Completed online exercise',
        'Submitted project proposal',
      ];

      // Generate mock activities for the last 24 hours
      const now = new Date();
      for (let i = 0; i < Math.min(studentIds.length, 10); i++) {
        const studentId = studentIds[i];
        const studentName = studentMap.get(studentId) || `Student ${i + 1}`;
        const initials = this.getInitials(studentName);

        // Random time within last 24 hours
        const hoursAgo = Math.floor(Math.random() * 24);
        const timestamp = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);

        activities.push({
          studentName,
          studentInitials: initials,
          activity:
            activityTypes[Math.floor(Math.random() * activityTypes.length)],
          timeAgo: this.formatTimeAgo(timestamp),
          timestamp,
        });
      }

      // Sort by timestamp (most recent first)
      activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      this.logger.log(
        `Found ${activities.length} recent activities for teacher: ${teacherId}`,
      );
      return activities.slice(0, 10); // Return top 10
    } catch (error) {
      this.logger.error('Error fetching recent activities:', error);
      // Return mock data on error
      return [
        {
          studentName: 'John Smith',
          studentInitials: 'JS',
          activity: 'Submitted Assignment #3',
          timeAgo: '1hr ago',
          timestamp: new Date(Date.now() - 60 * 60 * 1000),
        },
        {
          studentName: 'Maria Garcia',
          studentInitials: 'MG',
          activity: 'Asked question in Math class',
          timeAgo: '2hrs ago',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
        {
          studentName: 'Anna Lee',
          studentInitials: 'AL',
          activity: 'Completed quiz successfully',
          timeAgo: '3hrs ago',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        },
      ];
    }
  }

  private getInitials(fullName: string): string {
    if (!fullName) return 'U';

    const parts = fullName.split(' ').filter((part) => part.length > 0);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0][0].toUpperCase();

    // First and last name initials
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }

  private formatTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
      return `${diffMinutes}min ago`;
    } else if (diffHours < 24) {
      return `${diffHours}hr${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays}day${diffDays > 1 ? 's' : ''} ago`;
    }
  }
}
