import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { NotificationService } from '../../common/services/notification.service';
import { NotificationType } from '../../notifications/entities/notification.entity';
import { StudentActivitiesService } from '../../student-activities/student-activities.service';
import { ActivityType } from '../../student-activities/entities/student-activity.entity';
import { ActivityMonitoringService } from '../../activity-monitoring/activity-monitoring.service';
import { CreateClubMembershipDto } from '../dto/create-club-membership.dto';
import { UpdateClubMembershipDto } from '../dto/update-club-membership.dto';
import { ClubMembership } from '../models/club-membership.model';

@Injectable()
export class ClubMembershipsService {
  private readonly logger = new Logger(ClubMembershipsService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly notificationService: NotificationService,
    private readonly studentActivitiesService: StudentActivitiesService,
    private readonly activityMonitoring: ActivityMonitoringService,
  ) {}

  /**
   * Map DB record to DTO (snake_case to camelCase)
   */
  private mapDbToDto(dbRecord: any): ClubMembership {
    return {
      id: dbRecord.id,
      studentId: dbRecord.student_id,
      clubId: dbRecord.club_id,
      positionId: dbRecord.position_id,
      joinedAt: dbRecord.joined_at,
      isActive: dbRecord.is_active,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at,
      student: dbRecord.student,
      club: dbRecord.club,
      position: dbRecord.position,
    };
  }

  /**
   * Check if user has access to manage club
   */
  private async checkClubAccess(
    userId: string,
    clubId: string,
  ): Promise<boolean> {
    const supabase = this.supabaseService.getServiceClient();

    // Check if user is Admin by getting their role
    const { data: userWithRole, error: userError } = await supabase
      .from('users')
      .select('id, role_id, roles!inner(name)')
      .eq('id', userId)
      .single();

    if (userError) {
      this.logger.error('Error fetching user role:', userError);
    }

    // Check role name - handle both object and array responses
    const roles: any = userWithRole?.roles;
    const roleName = Array.isArray(roles) ? roles[0]?.name : roles?.name;

    this.logger.debug(`User ${userId} has role: ${roleName}`);

    if (roleName === 'Admin') return true;

    // Check if user is adviser, co-adviser, or president of this club
    const { data: club, error: clubError } = await supabase
      .from('clubs')
      .select('advisor_id, co_advisor_id, president_id')
      .eq('id', clubId)
      .single();

    if (clubError) {
      this.logger.error('Error fetching club:', clubError);
    }

    if (!club) {
      this.logger.warn(`Club ${clubId} not found`);
      return false;
    }

    this.logger.debug(
      `Checking access - User: ${userId}, Advisor: ${club.advisor_id}, Co-Advisor: ${club.co_advisor_id}, President: ${club.president_id}`,
    );

    const hasAccess =
      club.advisor_id === userId ||
      club.co_advisor_id === userId ||
      club.president_id === userId;

    this.logger.debug(`Access granted: ${hasAccess}`);

    return hasAccess;
  }

  async create(
    createDto: CreateClubMembershipDto,
    userId: string,
  ): Promise<ClubMembership> {
    const supabase = this.supabaseService.getServiceClient();

    // Check access
    const hasAccess = await this.checkClubAccess(userId, createDto.clubId);
    if (!hasAccess) {
      throw new ForbiddenException(
        'You do not have access to manage this club',
      );
    }

    // Verify position exists (positions are not club-specific, they're global)
    const { data: position, error: posError } = await supabase
      .from('club_positions')
      .select('id, name')
      .eq('id', createDto.positionId)
      .single();

    if (posError || !position) {
      throw new BadRequestException('Invalid position ID');
    }

    // Check if membership already exists with limit(1)
    const { data: existing } = await supabase
      .from('student_club_memberships')
      .select('id')
      .eq('student_id', createDto.studentId)
      .eq('club_id', createDto.clubId)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();

    if (existing) {
      throw new ConflictException('Student is already a member of this club');
    }

    const { data, error } = await supabase
      .from('student_club_memberships')
      .insert({
        student_id: createDto.studentId,
        club_id: createDto.clubId,
        position_id: createDto.positionId,
        joined_at: createDto.joinedAt || new Date().toISOString(),
        is_active: createDto.isActive ?? true,
      })
      .select(
        `
        *,
        student:students(id, first_name, last_name),
        club:clubs(id, name),
        position:club_positions(id, name, level)
      `,
      )
      .single();

    if (error) {
      this.logger.error('Error creating membership:', {
        code: error.code,
        message: error.message,
        details: error.details,
      });

      // Handle unique constraint violation (race condition)
      if (error.code === '23505' || error.message?.includes('duplicate')) {
        throw new ConflictException('Membership already exists');
      }

      throw new BadRequestException(
        `Failed to create membership: ${error.message}`,
      );
    }

    // 🎯 CREATE ACTIVITY - Student joined club
    try {
      await this.studentActivitiesService.create({
        studentUserId: createDto.studentId,
        activityType: ActivityType.CLUB_JOINED,
        title: `Joined ${data.club?.name || 'a club'}`,
        description: `You are now a ${data.position?.name || 'member'}`,
        metadata: {
          club_id: data.club_id,
          club_name: data.club?.name,
          position_id: data.position_id,
          position: data.position?.name,
        },
        relatedEntityId: data.club_id,
        relatedEntityType: 'club',
        icon: 'Users',
        color: 'text-blue-500',
      });
    } catch (activityError) {
      // Don't fail membership creation if activity logging fails
      this.logger.error(
        'Failed to create club joined activity:',
        activityError,
      );
    }

    // Notify student directly about club membership
    try {
      const { data: student } = await supabase
        .from('students')
        .select('user_id')
        .eq('id', createDto.studentId)
        .single();

      if (student?.user_id) {
        const clubName = data.club?.name || 'a club';
        const positionName = data.position?.name || 'member';

        await this.notificationService.notifyUser(
          student.user_id,
          `Welcome to ${clubName}!`,
          `You have been added as ${positionName} to ${clubName}. Check your club dashboard for more details.`,
          NotificationType.SUCCESS,
          userId,
          { expiresInDays: 30 },
        );

        this.logger.log(
          `🎉 Notified student about membership in ${clubName} as ${positionName}`,
        );
      }
    } catch (notificationError) {
      this.logger.warn(
        'Failed to create direct notification for student membership:',
        notificationError,
      );
    }

    // Activity monitoring - notify club admins about membership change
    try {
      const studentName = data.student
        ? `${data.student.first_name} ${data.student.last_name}`
        : 'A student';
      const clubName = data.club?.name || 'a club';

      // Get club admin IDs (president, vp, secretary, advisors)
      const { data: clubData } = await supabase
        .from('clubs')
        .select('president_id, vp_id, secretary_id, advisor_id, co_advisor_id')
        .eq('id', createDto.clubId)
        .single();

      const adminIds: string[] = [];
      if (clubData?.president_id) adminIds.push(clubData.president_id);
      if (clubData?.vp_id) adminIds.push(clubData.vp_id);
      if (clubData?.secretary_id) adminIds.push(clubData.secretary_id);
      if (clubData?.advisor_id) adminIds.push(clubData.advisor_id);
      if (clubData?.co_advisor_id) adminIds.push(clubData.co_advisor_id);

      // Get user IDs for admins
      const { data: students } = await supabase
        .from('students')
        .select('user_id')
        .in(
          'id',
          adminIds.filter((id) => id),
        );

      const { data: teachers } = await supabase
        .from('teachers')
        .select('user_id')
        .in(
          'id',
          adminIds.filter((id) => id),
        );

      const adminUserIds: string[] = [];
      if (students)
        adminUserIds.push(...students.map((s) => s.user_id).filter(Boolean));
      if (teachers)
        adminUserIds.push(...teachers.map((t) => t.user_id).filter(Boolean));

      // Get student user_id
      const { data: student } = await supabase
        .from('students')
        .select('user_id')
        .eq('id', createDto.studentId)
        .single();

      await this.activityMonitoring.handleMembershipChanged(
        createDto.clubId,
        clubName,
        student?.user_id || createDto.studentId,
        studentName,
        'joined',
        userId,
        adminUserIds,
      );
    } catch (error) {
      this.logger.warn(
        'Failed to handle membership change activity monitoring:',
        error,
      );
    }

    return this.mapDbToDto(data);
  }

  async findAll(clubId?: string): Promise<ClubMembership[]> {
    const supabase = this.supabaseService.getServiceClient();

    let query = supabase
      .from('student_club_memberships')
      .select(
        `
        *,
        student:students(id, first_name, last_name, grade_level),
        club:clubs(id, name),
        position:club_positions(id, name, level)
      `,
      )
      .order('created_at', { ascending: false });

    if (clubId) {
      query = query.eq('club_id', clubId);
    }

    const { data, error } = await query;

    if (error) {
      this.logger.error('Error fetching memberships:', error);
      throw new BadRequestException('Failed to fetch memberships');
    }

    return data.map((m) => this.mapDbToDto(m));
  }

  async findOne(id: string): Promise<ClubMembership> {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('student_club_memberships')
      .select(
        `
        *,
        student:students(id, first_name, last_name, grade_level),
        club:clubs(id, name),
        position:club_positions(id, name, level)
      `,
      )
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException('Membership not found');
    }

    return this.mapDbToDto(data);
  }

  async update(
    id: string,
    updateDto: UpdateClubMembershipDto,
    userId: string,
  ): Promise<ClubMembership> {
    const supabase = this.supabaseService.getServiceClient();

    // Get existing membership
    const existing = await this.findOne(id);

    // Check access
    const hasAccess = await this.checkClubAccess(userId, existing.clubId);
    if (!hasAccess) {
      throw new ForbiddenException(
        'You do not have access to manage this club',
      );
    }

    // Build update payload only with present fields
    const updatePayload: any = {
      updated_at: new Date().toISOString(),
    };

    // Validate position if provided
    if (updateDto.positionId) {
      const { data: position, error: posError } = await supabase
        .from('club_positions')
        .select('id')
        .eq('id', updateDto.positionId)
        .single();

      if (posError || !position) {
        throw new BadRequestException('Invalid position ID');
      }

      updatePayload.position_id = updateDto.positionId;
    }

    // Check for duplicate active membership if activating
    if (updateDto.isActive === true && !existing.isActive) {
      const { data: duplicates } = await supabase
        .from('student_club_memberships')
        .select('id')
        .eq('student_id', existing.studentId)
        .eq('club_id', existing.clubId)
        .eq('is_active', true)
        .neq('id', id)
        .limit(1);

      if (duplicates && duplicates.length > 0) {
        throw new ConflictException(
          'Student already has an active membership in this club',
        );
      }
    }

    if (updateDto.joinedAt !== undefined) {
      updatePayload.joined_at = updateDto.joinedAt;
    }

    if (updateDto.isActive !== undefined) {
      updatePayload.is_active = updateDto.isActive;
    }

    // Perform update
    const { data, error } = await supabase
      .from('student_club_memberships')
      .update(updatePayload)
      .eq('id', id)
      .select(
        `
        *,
        student:students(id, first_name, last_name, grade_level),
        club:clubs(id, name),
        position:club_positions(id, name, level)
      `,
      )
      .single();

    if (error || !data) {
      this.logger.error('Error updating membership:', error);
      throw new BadRequestException('Failed to update membership');
    }

    // 🎯 CREATE ACTIVITY - Position changed (promoted/demoted)
    if (updateDto.positionId && existing.positionId !== updateDto.positionId) {
      try {
        await this.studentActivitiesService.create({
          studentUserId: existing.studentId,
          activityType: ActivityType.CLUB_POSITION_CHANGED,
          title: `Promoted in ${data.club?.name || 'club'}`,
          description: `Your role changed from ${existing.position?.name || 'member'} to ${data.position?.name || 'member'}`,
          metadata: {
            club_id: data.club_id,
            club_name: data.club?.name,
            old_position_id: existing.positionId,
            old_position: existing.position?.name,
            new_position_id: data.position_id,
            new_position: data.position?.name,
          },
          relatedEntityId: data.club_id,
          relatedEntityType: 'club',
          icon: 'Trophy',
          color: 'text-yellow-500',
          isHighlighted: true, // Promotions are important!
        });
      } catch (activityError) {
        this.logger.error(
          'Failed to create position change activity:',
          activityError,
        );
      }
    }

    // ✅ NEW: Notify student when membership is approved (reactivated from pending)
    if (updateDto.isActive === true && !existing.isActive) {
      try {
        // Get student user_id
        const { data: student } = await supabase
          .from('students')
          .select('user_id, first_name, last_name')
          .eq('id', existing.studentId)
          .single();

        if (student?.user_id) {
          await this.notificationService.notifyUser(
            student.user_id,
            'Club Membership Approved',
            `Congratulations! You have been approved to join ${data.club?.name || 'the club'}.`,
            NotificationType.SUCCESS,
            userId,
            { expiresInDays: 7 },
          );
          this.logger.log(
            `✅ Notified student ${student.first_name} about membership approval for ${data.club?.name}`,
          );
        }
      } catch (error) {
        this.logger.warn(
          'Failed to notify student about membership approval:',
          error,
        );
      }
    }

    return this.mapDbToDto(data);
  }

  async remove(id: string, userId: string): Promise<void> {
    const supabase = this.supabaseService.getServiceClient();

    // Get existing membership
    const existing = await this.findOne(id);

    // Check access
    const hasAccess = await this.checkClubAccess(userId, existing.clubId);
    if (!hasAccess) {
      throw new ForbiddenException(
        'You do not have access to manage this club',
      );
    }

    const { error } = await supabase
      .from('student_club_memberships')
      .delete()
      .eq('id', id);

    if (error) {
      this.logger.error('Error deleting membership:', error);
      throw new BadRequestException('Failed to delete membership');
    }
  }

  async findByStudent(studentId: string): Promise<ClubMembership[]> {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('student_club_memberships')
      .select(
        `
        *,
        club:clubs(id, name, description),
        position:club_positions(id, name, level)
      `,
      )
      .eq('student_id', studentId)
      .eq('is_active', true)
      .order('joined_at', { ascending: false });

    if (error) {
      this.logger.error('Error fetching student memberships:', error);
      throw new BadRequestException('Failed to fetch student memberships');
    }

    return data.map((m) => this.mapDbToDto(m));
  }
}
