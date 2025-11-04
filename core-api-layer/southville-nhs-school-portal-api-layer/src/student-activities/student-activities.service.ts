import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateStudentActivityDto } from './dto/create-student-activity.dto';
import { QueryStudentActivitiesDto } from './dto/query-student-activities.dto';
import { UpdateStudentActivityDto } from './dto/update-student-activity.dto';
import {
  StudentActivity,
  StudentActivityDto,
} from './entities/student-activity.entity';

@Injectable()
export class StudentActivitiesService {
  private readonly logger = new Logger(StudentActivitiesService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Create a new student activity
   * Note: This should typically be called by backend services, not directly by students
   */
  async create(
    createDto: CreateStudentActivityDto,
  ): Promise<StudentActivityDto> {
    this.logger.log(
      `✅ Creating activity for student ${createDto.studentUserId}: ${createDto.activityType} - "${createDto.title}"`,
    );

    const serviceClient = this.supabaseService.getServiceClient();

    const activityData = {
      student_user_id: createDto.studentUserId,
      activity_type: createDto.activityType,
      title: createDto.title,
      description: createDto.description,
      metadata: createDto.metadata || {},
      related_entity_id: createDto.relatedEntityId,
      related_entity_type: createDto.relatedEntityType,
      icon: createDto.icon,
      color: createDto.color,
      is_highlighted: createDto.isHighlighted ?? false,
      is_visible: createDto.isVisible ?? true,
      activity_timestamp: createDto.activityTimestamp || new Date().toISOString(),
    };

    this.logger.debug(`Inserting activity data: ${JSON.stringify(activityData, null, 2)}`);

    const { data, error } = await serviceClient
      .from('student_activities')
      .insert(activityData)
      .select()
      .single();

    if (error) {
      this.logger.error('❌ Error creating student activity:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      throw new InternalServerErrorException(
        `Failed to create activity: ${error.message}`,
      );
    }

    this.logger.log(`💾 Activity created successfully with ID: ${data.id}`);
    return this.mapToDto(data);
  }

  /**
   * Get activities for a specific student with filtering and pagination
   */
  async findByStudent(
    studentUserId: string,
    query: QueryStudentActivitiesDto,
  ): Promise<{
    data: StudentActivityDto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    this.logger.log(
      `Fetching activities for student ${studentUserId} with filters:`,
      query,
    );

    // Use service client (no RLS policies)
    const client = this.supabaseService.getServiceClient();

    // Build query
    let supabaseQuery = client
      .from('student_activities')
      .select('*', { count: 'exact' })
      .eq('student_user_id', studentUserId);

    // Apply filters
    if (query.activityTypes && query.activityTypes.length > 0) {
      supabaseQuery = supabaseQuery.in('activity_type', query.activityTypes);
    }

    if (query.relatedEntityType) {
      supabaseQuery = supabaseQuery.eq(
        'related_entity_type',
        query.relatedEntityType,
      );
    }

    if (query.highlightedOnly) {
      supabaseQuery = supabaseQuery.eq('is_highlighted', true);
    }

    if (query.visibleOnly !== false) {
      supabaseQuery = supabaseQuery.eq('is_visible', true);
    }

    if (query.startDate) {
      supabaseQuery = supabaseQuery.gte('activity_timestamp', query.startDate);
    }

    if (query.endDate) {
      supabaseQuery = supabaseQuery.lte('activity_timestamp', query.endDate);
    }

    // Get total count first
    const { count: totalCount, error: countError } = await supabaseQuery;

    if (countError) {
      this.logger.error('Error counting activities:', countError);
      throw new InternalServerErrorException(
        `Failed to count activities: ${countError.message}`,
      );
    }

    const total = totalCount || 0;
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    // Fetch paginated data
    const { data, error } = await supabaseQuery
      .order('activity_timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      this.logger.error('Error fetching activities:', error);
      throw new InternalServerErrorException(
        `Failed to fetch activities: ${error.message}`,
      );
    }

    return {
      data: (data || []).map((activity) => this.mapToDto(activity)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single activity by ID
   */
  async findOne(
    activityId: string,
    studentUserId: string,
  ): Promise<StudentActivityDto> {
    this.logger.log(`Fetching activity ${activityId} for student ${studentUserId}`);

    // Use service client (no RLS policies)
    const client = this.supabaseService.getServiceClient();

    const { data, error } = await client
      .from('student_activities')
      .select('*')
      .eq('id', activityId)
      .eq('student_user_id', studentUserId)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Activity with ID ${activityId} not found`);
    }

    return this.mapToDto(data);
  }

  /**
   * Update activity visibility (students can hide/show their activities)
   */
  async updateVisibility(
    activityId: string,
    studentUserId: string,
    updateDto: UpdateStudentActivityDto,
  ): Promise<StudentActivityDto> {
    this.logger.log(
      `Updating visibility for activity ${activityId} by student ${studentUserId}`,
    );

    // Use service client (no RLS policies)
    const client = this.supabaseService.getServiceClient();

    // First check if activity belongs to student
    const { data: existingActivity } = await client
      .from('student_activities')
      .select('student_user_id')
      .eq('id', activityId)
      .single();

    if (!existingActivity || existingActivity.student_user_id !== studentUserId) {
      throw new ForbiddenException(
        'You can only update your own activities',
      );
    }

    // Update visibility
    const { data, error } = await client
      .from('student_activities')
      .update({ is_visible: updateDto.isVisible })
      .eq('id', activityId)
      .eq('student_user_id', studentUserId)
      .select()
      .single();

    if (error) {
      this.logger.error('Error updating activity:', error);
      throw new InternalServerErrorException(
        `Failed to update activity: ${error.message}`,
      );
    }

    return this.mapToDto(data);
  }

  /**
   * Delete an activity (admin/teacher only, typically via service role)
   */
  async remove(activityId: string): Promise<void> {
    this.logger.log(`Deleting activity ${activityId}`);

    const serviceClient = this.supabaseService.getServiceClient();

    const { error } = await serviceClient
      .from('student_activities')
      .delete()
      .eq('id', activityId);

    if (error) {
      this.logger.error('Error deleting activity:', error);
      throw new InternalServerErrorException(
        `Failed to delete activity: ${error.message}`,
      );
    }
  }

  /**
   * Get activity statistics for a student
   */
  async getStatistics(studentUserId: string): Promise<{
    totalActivities: number;
    activitiesByType: Record<string, number>;
    recentActivityCount: number;
    highlightedCount: number;
  }> {
    this.logger.log(`Fetching activity statistics for student ${studentUserId}`);

    // Use service client (no RLS policies)
    const client = this.supabaseService.getServiceClient();

    const { data, error } = await client
      .from('student_activities')
      .select('activity_type, is_highlighted, activity_timestamp')
      .eq('student_user_id', studentUserId)
      .eq('is_visible', true);

    if (error) {
      this.logger.error('Error fetching statistics:', error);
      throw new InternalServerErrorException(
        `Failed to fetch statistics: ${error.message}`,
      );
    }

    const activities = data || [];
    const totalActivities = activities.length;

    // Count by type
    const activitiesByType: Record<string, number> = {};
    activities.forEach((activity) => {
      const type = activity.activity_type;
      activitiesByType[type] = (activitiesByType[type] || 0) + 1;
    });

    // Count highlighted
    const highlightedCount = activities.filter(
      (a) => a.is_highlighted,
    ).length;

    // Count recent (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentActivityCount = activities.filter(
      (a) => new Date(a.activity_timestamp) >= sevenDaysAgo,
    ).length;

    return {
      totalActivities,
      activitiesByType,
      recentActivityCount,
      highlightedCount,
    };
  }

  /**
   * Map database entity to DTO
   */
  private mapToDto(activity: StudentActivity): StudentActivityDto {
    return {
      id: activity.id,
      studentUserId: activity.student_user_id,
      activityType: activity.activity_type,
      title: activity.title,
      description: activity.description,
      metadata: activity.metadata,
      relatedEntityId: activity.related_entity_id,
      relatedEntityType: activity.related_entity_type,
      icon: activity.icon,
      color: activity.color,
      isHighlighted: activity.is_highlighted,
      isVisible: activity.is_visible,
      activityTimestamp: activity.activity_timestamp,
      createdAt: activity.created_at,
      updatedAt: activity.updated_at,
    };
  }
}
