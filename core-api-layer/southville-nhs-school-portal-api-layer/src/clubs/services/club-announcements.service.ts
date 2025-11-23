import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { NotificationService } from '../../common/services/notification.service';
import { NotificationType } from '../../notifications/entities/notification.entity';
import { CreateClubAnnouncementDto } from '../dto/create-club-announcement.dto';
import { UpdateClubAnnouncementDto } from '../dto/update-club-announcement.dto';
import {
  ClubAnnouncement,
  ClubAnnouncementWithAuthor,
} from '../entities/club-announcement.entity';

@Injectable()
export class ClubAnnouncementsService {
  private readonly logger = new Logger(ClubAnnouncementsService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Creates a new club announcement
   * @param createDto - Announcement creation data
   * @param userId - ID of the user creating the announcement
   * @returns Promise<ClubAnnouncementWithAuthor> - Created announcement
   */
  async create(
    createDto: CreateClubAnnouncementDto,
    userId: string,
  ): Promise<ClubAnnouncementWithAuthor> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      // Verify club exists
      const { data: club, error: clubError } = await supabase
        .from('clubs')
        .select('id, name')
        .eq('id', createDto.club_id)
        .single();

      if (clubError || !club) {
        throw new NotFoundException(
          `Club with ID ${createDto.club_id} not found`,
        );
      }

      // Create announcement
      const { data, error } = await supabase
        .from('club_announcements')
        .insert({
          club_id: createDto.club_id,
          title: createDto.title,
          content: createDto.content,
          priority: createDto.priority || 'normal',
          created_by: userId,
        })
        .select('*')
        .single();

      if (error) {
        this.logger.error('Error creating club announcement:', error);
        throw new BadRequestException(
          `Failed to create announcement: ${error.message}`,
        );
      }

      this.logger.log(
        `Created announcement "${data.title}" for club ${club.name} (${club.id})`,
      );

      // ✅ NEW: Notify all club members about new announcement
      try {
        // Get all active club members
        const { data: memberships } = await supabase
          .from('student_club_memberships')
          .select('student_id')
          .eq('club_id', createDto.club_id)
          .eq('is_active', true);

        if (memberships && memberships.length > 0) {
          // Get student user_ids
          const studentIds = memberships.map((m) => m.student_id);
          const { data: students } = await supabase
            .from('students')
            .select('user_id')
            .in('id', studentIds);

          if (students && students.length > 0) {
            const studentUserIds = students
              .map((s) => s.user_id)
              .filter(Boolean);

            if (studentUserIds.length > 0) {
              await this.notificationService.notifyUsers(
                studentUserIds,
                `New Announcement: ${club.name}`,
                `${data.title}`,
                NotificationType.INFO,
                userId,
                { expiresInDays: 7 },
              );
              this.logger.log(
                `📢 Notified ${studentUserIds.length} members about announcement: ${data.title}`,
              );
            }
          }
        }
      } catch (error) {
        this.logger.warn('Failed to notify members about announcement:', error);
      }

      return data;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error('Unexpected error creating announcement:', error);
      throw new BadRequestException('Failed to create announcement');
    }
  }

  /**
   * Gets all announcements for a specific club
   * @param clubId - Club ID
   * @returns Promise<ClubAnnouncementWithAuthor[]> - Array of announcements
   */
  async findByClub(clubId: string): Promise<ClubAnnouncementWithAuthor[]> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      const { data, error } = await supabase
        .from('club_announcements')
        .select('*')
        .eq('club_id', clubId)
        .order('created_at', { ascending: false });

      if (error) {
        this.logger.error(
          `Error fetching announcements for club ${clubId}:`,
          error,
        );
        throw new BadRequestException(
          `Failed to fetch announcements: ${error.message}`,
        );
      }

      return data || [];
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Unexpected error fetching announcements:', error);
      throw new BadRequestException('Failed to fetch announcements');
    }
  }

  /**
   * Gets a single announcement by ID
   * @param id - Announcement ID
   * @returns Promise<ClubAnnouncementWithAuthor> - Announcement data
   */
  async findOne(id: string): Promise<ClubAnnouncementWithAuthor> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      const { data, error } = await supabase
        .from('club_announcements')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        throw new NotFoundException(`Announcement with ID ${id} not found`);
      }

      return data;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error fetching announcement ${id}:`, error);
      throw new BadRequestException('Failed to fetch announcement');
    }
  }

  /**
   * Updates an announcement
   * @param id - Announcement ID
   * @param updateDto - Update data
   * @param userId - ID of the user updating the announcement
   * @returns Promise<ClubAnnouncementWithAuthor> - Updated announcement
   */
  async update(
    id: string,
    updateDto: UpdateClubAnnouncementDto,
    userId: string,
  ): Promise<ClubAnnouncementWithAuthor> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      // Verify announcement exists and check ownership
      const existing = await this.findOne(id);

      if (existing.created_by !== userId) {
        throw new ForbiddenException(
          'You do not have permission to update this announcement',
        );
      }

      // Update announcement
      const { data, error } = await supabase
        .from('club_announcements')
        .update({
          ...updateDto,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        this.logger.error(`Error updating announcement ${id}:`, error);
        throw new BadRequestException(
          `Failed to update announcement: ${error.message}`,
        );
      }

      this.logger.log(`Updated announcement: ${data.title} (ID: ${data.id})`);

      // Notify club members about announcement update
      try {
        const supabase = this.supabaseService.getServiceClient();

        // Get active club members
        const { data: memberships } = await supabase
          .from('student_club_memberships')
          .select('student_id')
          .eq('club_id', existing.club_id)
          .eq('is_active', true);

        if (memberships && memberships.length > 0) {
          const studentIds = memberships.map((m) => m.student_id);

          // Get user IDs for these students
          const { data: students } = await supabase
            .from('students')
            .select('user_id')
            .in('id', studentIds);

          if (students && students.length > 0) {
            const studentUserIds = students
              .map((s) => s.user_id)
              .filter(Boolean);

            if (studentUserIds.length > 0) {
              // Get club name
              const { data: club } = await supabase
                .from('clubs')
                .select('name')
                .eq('id', existing.club_id)
                .single();

              await this.notificationService.notifyUsers(
                studentUserIds,
                `Announcement Updated: ${club?.name || 'Club'}`,
                data.title,
                NotificationType.INFO,
                userId,
                { expiresInDays: 7 },
              );

              this.logger.log(
                `📢 Notified ${studentUserIds.length} club members about announcement update`,
              );
            }
          }
        }
      } catch (notificationError) {
        this.logger.warn(
          'Failed to create notifications for club announcement update:',
          notificationError,
        );
      }

      return data;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      this.logger.error(`Unexpected error updating announcement ${id}:`, error);
      throw new BadRequestException('Failed to update announcement');
    }
  }

  /**
   * Deletes an announcement
   * @param id - Announcement ID
   * @param userId - ID of the user deleting the announcement
   * @returns Promise<void>
   */
  async remove(id: string, userId: string): Promise<void> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      // Verify announcement exists and check ownership
      const existing = await this.findOne(id);

      if (existing.created_by !== userId) {
        throw new ForbiddenException(
          'You do not have permission to delete this announcement',
        );
      }

      const { error } = await supabase
        .from('club_announcements')
        .delete()
        .eq('id', id);

      if (error) {
        this.logger.error(`Error deleting announcement ${id}:`, error);
        throw new BadRequestException(
          `Failed to delete announcement: ${error.message}`,
        );
      }

      this.logger.log(`Deleted announcement with ID: ${id}`);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      this.logger.error(`Unexpected error deleting announcement ${id}:`, error);
      throw new BadRequestException('Failed to delete announcement');
    }
  }
}
