import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { NotificationService } from '../common/services/notification.service';
import {
  NotificationType,
  NotificationCategory,
} from '../notifications/entities/notification.entity';
import { ActivityMonitoringService } from '../activity-monitoring/activity-monitoring.service';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { SupabaseUser } from '../auth/interfaces/supabase-user.interface';

@Injectable()
export class ClubsService {
  private readonly logger = new Logger(ClubsService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly notificationService: NotificationService,
    private readonly activityMonitoring: ActivityMonitoringService,
  ) {}

  /**
   * Creates a new club
   * @param createClubDto - Club creation data
   * @returns Promise<Club> - Created club
   */
  async create(createClubDto: CreateClubDto): Promise<any> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      // Verify domain exists (if provided)
      if (createClubDto.domain_id) {
        const { data: domain, error: domainError } = await supabase
          .from('domains')
          .select('id, type, name')
          .eq('id', createClubDto.domain_id)
          .single();

        if (domainError || !domain) {
          throw new NotFoundException(
            `Domain with ID ${createClubDto.domain_id} not found`,
          );
        }

        if (domain.type !== 'club') {
          throw new BadRequestException(
            `Domain type must be 'club', got '${domain.type}'`,
          );
        }
      }

      // Extract nested data
      const { goals, benefits, faqs, ...clubData } = createClubDto;

      // 1. Create club
      const { data: club, error: clubError } = await supabase
        .from('clubs')
        .insert(clubData)
        .select(
          `
          *,
          president:president_id(id, full_name, email),
          vp:vp_id(id, full_name, email),
          secretary:secretary_id(id, full_name, email),
          advisor:advisor_id(id, full_name, email),
          co_advisor:co_advisor_id(id, full_name, email),
          domain:domain_id(id, type, name)
        `,
        )
        .single();

      if (clubError) {
        this.logger.error('Error creating club:', clubError);
        throw new BadRequestException(
          `Failed to create club: ${clubError.message}`,
        );
      }

      // 2. Insert goals (if provided)
      if (goals && goals.length > 0) {
        const goalsToInsert = goals.map((goal) => ({
          club_id: club.id,
          goal_text: goal.goal_text,
          order_index: goal.order_index,
        }));

        const { error: goalsError } = await supabase
          .from('club_goals')
          .insert(goalsToInsert);

        if (goalsError) {
          // Rollback club creation
          await supabase.from('clubs').delete().eq('id', club.id);
          this.logger.error('Error inserting club goals:', goalsError);
          throw new InternalServerErrorException(
            'Failed to create club goals. Club creation rolled back.',
          );
        }
      }

      // 3. Insert benefits (if provided)
      if (benefits && benefits.length > 0) {
        const benefitsToInsert = benefits.map((benefit) => ({
          club_id: club.id,
          title: benefit.title,
          description: benefit.description,
          order_index: benefit.order_index,
        }));

        const { error: benefitsError } = await supabase
          .from('club_benefits')
          .insert(benefitsToInsert);

        if (benefitsError) {
          // Rollback club creation
          await supabase.from('clubs').delete().eq('id', club.id);
          this.logger.error('Error inserting club benefits:', benefitsError);
          throw new InternalServerErrorException(
            'Failed to create club benefits. Club creation rolled back.',
          );
        }
      }

      // 4. Insert FAQs (if provided)
      if (faqs && faqs.length > 0) {
        const faqsToInsert = faqs.map((faq) => ({
          club_id: club.id,
          question: faq.question,
          answer: faq.answer,
          order_index: faq.order_index,
        }));

        const { error: faqsError } = await supabase
          .from('club_faqs')
          .insert(faqsToInsert);

        if (faqsError) {
          // Rollback club creation
          await supabase.from('clubs').delete().eq('id', club.id);
          this.logger.error('Error inserting club FAQs:', faqsError);
          throw new InternalServerErrorException(
            'Failed to create club FAQs. Club creation rolled back.',
          );
        }
      }

      this.logger.log(`Created club: ${club.name} (ID: ${club.id})`);

      // Activity monitoring - notify admins about new club
      try {
        await this.activityMonitoring.handleClubCreated(
          club.id,
          club.name,
          'system',
        );
      } catch (error) {
        this.logger.warn(
          'Failed to handle club creation activity monitoring:',
          error,
        );
      }

      // Notify club advisors about new club creation
      try {
        const advisorIds: string[] = [];
        if (club.advisor_id) advisorIds.push(club.advisor_id);
        if (club.co_advisor_id) advisorIds.push(club.co_advisor_id);

        if (advisorIds.length > 0) {
          // Get teacher user_ids
          const { data: teachers } = await supabase
            .from('teachers')
            .select('user_id')
            .in('id', advisorIds);

          if (teachers) {
            const teacherUserIds = teachers
              .map((t) => t.user_id)
              .filter((id) => id);
            if (teacherUserIds.length > 0) {
              await this.notificationService.notifyUsers(
                teacherUserIds,
                'New Club Created',
                `You have been assigned as an advisor for the club "${club.name}".`,
                NotificationType.INFO,
                undefined,
                { expiresInDays: 7 },
              );
            }
          }
        }
      } catch (error) {
        this.logger.warn(
          'Failed to create notifications for club creation:',
          error,
        );
      }

      // ✅ NEW: Notify all students about new club
      try {
        const { data: students } = await supabase
          .from('students')
          .select('user_id');

        if (students && students.length > 0) {
          const studentUserIds = students.map((s) => s.user_id).filter(Boolean);

          if (studentUserIds.length > 0) {
            await this.notificationService.notifyUsers(
              studentUserIds,
              'New Club Available',
              `A new club has been created: "${club.name}". Check it out and join!`,
              NotificationType.INFO,
              undefined,
              {
                category: NotificationCategory.COMMUNICATION,
                expiresInDays: 14,
              },
            );
            this.logger.log(
              `🎉 Notified ${studentUserIds.length} students about new club: ${club.name}`,
            );
          }
        }
      } catch (error) {
        this.logger.warn('Failed to notify students about new club:', error);
      }

      return club;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      this.logger.error('Unexpected error creating club:', error);
      throw new BadRequestException('Failed to create club');
    }
  }

  /**
   * Gets all clubs
   * @returns Promise<Club[]> - Array of clubs
   */
  async findAll(): Promise<any[]> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      const { data, error } = await supabase
        .from('clubs')
        .select(
          `
          *,
          president:president_id(id, full_name, email),
          vp:vp_id(id, full_name, email),
          secretary:secretary_id(id, full_name, email),
          advisor:advisor_id(id, full_name, email),
          co_advisor:co_advisor_id(id, full_name, email),
          domain:domain_id(id, type, name)
        `,
        )
        .order('created_at', { ascending: false });

      if (error) {
        this.logger.error('Error fetching clubs:', error);
        throw new BadRequestException(
          `Failed to fetch clubs: ${error.message}`,
        );
      }

      return data || [];
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Unexpected error fetching clubs:', error);
      throw new BadRequestException('Failed to fetch clubs');
    }
  }

  /**
   * Gets a club by ID
   * @param id - Club ID
   * @returns Promise<Club> - Club data
   */
  async findOne(id: string): Promise<any> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      // Fetch club with goals, benefits, and FAQs in parallel
      const [clubResult, goalsResult, benefitsResult, faqsResult] =
        await Promise.all([
          supabase
            .from('clubs')
            .select(
              `
          *,
          president:president_id(id, full_name, email),
          vp:vp_id(id, full_name, email),
          secretary:secretary_id(id, full_name, email),
          advisor:advisor_id(id, full_name, email),
          co_advisor:co_advisor_id(id, full_name, email),
          domain:domain_id(id, type, name)
        `,
            )
            .eq('id', id)
            .single(),
          supabase
            .from('club_goals')
            .select('*')
            .eq('club_id', id)
            .order('order_index', { ascending: true }),
          supabase
            .from('club_benefits')
            .select('*')
            .eq('club_id', id)
            .order('order_index', { ascending: true }),
          supabase
            .from('club_faqs')
            .select('*')
            .eq('club_id', id)
            .order('order_index', { ascending: true }),
        ]);

      if (clubResult.error || !clubResult.data) {
        throw new NotFoundException(`Club with ID ${id} not found`);
      }

      // Combine results
      const club = {
        ...clubResult.data,
        goals: goalsResult.data || [],
        benefits: benefitsResult.data || [],
        faqs: faqsResult.data || [],
      };

      return club;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error fetching club ${id}:`, error);
      throw new BadRequestException('Failed to fetch club');
    }
  }

  /**
   * Updates a club
   * @param id - Club ID
   * @param updateClubDto - Update data
   * @returns Promise<Club> - Updated club
   */
  async update(id: string, updateClubDto: UpdateClubDto): Promise<any> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      // Verify club exists
      const existingClub = await this.findOne(id);

      // Validate domain_id if provided
      if (updateClubDto.domain_id) {
        const { data: domain, error: domainError } = await supabase
          .from('domains')
          .select('id, type')
          .eq('id', updateClubDto.domain_id)
          .single();

        if (domainError || !domain) {
          throw new BadRequestException('Invalid domain_id: domain not found');
        }

        if (domain.type !== 'club') {
          throw new BadRequestException(
            `Invalid domain_id: domain type must be 'club', got '${domain.type}'`,
          );
        }
      }

      // Update club
      const { data, error } = await supabase
        .from('clubs')
        .update({
          ...updateClubDto,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select(
          `
          *,
          president:president_id(id, full_name, email),
          vp:vp_id(id, full_name, email),
          secretary:secretary_id(id, full_name, email),
          advisor:advisor_id(id, full_name, email),
          domain:domain_id(id, type, name)
        `,
        )
        .single();

      if (error) {
        this.logger.error(`Error updating club ${id}:`, error);
        throw new BadRequestException(
          `Failed to update club: ${error.message}`,
        );
      }

      this.logger.log(`Updated club: ${data.name} (ID: ${data.id})`);
      return data;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`Unexpected error updating club ${id}:`, error);
      throw new BadRequestException('Failed to update club');
    }
  }

  /**
   * Deletes a club
   * @param id - Club ID
   * @returns Promise<void>
   */
  async remove(id: string): Promise<void> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      // Verify club exists
      await this.findOne(id);

      const { error } = await supabase.from('clubs').delete().eq('id', id);

      if (error) {
        this.logger.error(`Error deleting club ${id}:`, error);
        throw new BadRequestException(
          `Failed to delete club: ${error.message}`,
        );
      }

      this.logger.log(`Deleted club with ID: ${id}`);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`Unexpected error deleting club ${id}:`, error);
      throw new BadRequestException('Failed to delete club');
    }
  }

  /**
   * Gets club members (placeholder for future implementation)
   * @param clubId - Club ID
   * @returns Promise<any[]> - Club members
   */
  async getMembers(clubId: string): Promise<any[]> {
    // TODO: Implement when student_club_memberships table is ready
    return [];
  }

  /**
   * Adds a member to a club (placeholder for future implementation)
   * @param clubId - Club ID
   * @param memberData - Member data
   * @returns Promise<any> - Added member
   */
  async addMember(clubId: string, memberData: any): Promise<any> {
    // TODO: Implement when student_club_memberships table is ready
    throw new BadRequestException('Member management not yet implemented');
  }

  /**
   * Updates club finances (placeholder for future implementation)
   * @param clubId - Club ID
   * @param financesData - Finances data
   * @returns Promise<any> - Updated finances
   */
  async updateFinances(clubId: string, financesData: any): Promise<any> {
    // TODO: Implement when club finances table is ready
    return {
      clubId,
      message: 'Finances updated successfully',
      data: financesData,
    };
  }

  /**
   * Join a club
   * @param clubId - Club ID to join
   * @param user - Authenticated user
   * @returns Promise<{success: boolean}>
   */
  async joinClub(
    clubId: string,
    user: SupabaseUser,
  ): Promise<{ success: boolean }> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      // Verify club exists
      const { data: club, error: clubError } = await supabase
        .from('clubs')
        .select('id, name')
        .eq('id', clubId)
        .single();

      if (clubError || !club) {
        throw new NotFoundException(`Club with ID ${clubId} not found`);
      }

      // Get student record for the user
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (studentError || !student) {
        throw new NotFoundException('Student record not found for user');
      }

      // Check if student is already a member
      const { data: existingMembership, error: membershipCheckError } =
        await supabase
          .from('club_memberships')
          .select('id, status')
          .eq('student_id', student.id)
          .eq('club_id', clubId)
          .single();

      if (membershipCheckError && membershipCheckError.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is expected if no membership exists
        this.logger.error(
          'Error checking existing membership:',
          membershipCheckError,
        );
        throw new InternalServerErrorException(
          'Failed to check existing membership',
        );
      }

      if (existingMembership) {
        if (existingMembership.status === 'active') {
          throw new ConflictException('You are already a member of this club');
        } else if (existingMembership.status === 'pending') {
          throw new ConflictException(
            'You already have a pending membership request for this club',
          );
        }
      }

      // Create new membership
      const { data: newMembership, error: createError } = await supabase
        .from('club_memberships')
        .insert({
          student_id: student.id,
          club_id: clubId,
          status: 'active', // For now, auto-approve. In real implementation, this might be 'pending'
          joined_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (createError) {
        this.logger.error('Error creating club membership:', createError);
        throw new InternalServerErrorException('Failed to join club');
      }

      this.logger.log(
        `Student ${user.email} successfully joined club: ${club.name} (${clubId})`,
      );

      // Notify club advisors about new member
      try {
        const { data: clubData } = await supabase
          .from('clubs')
          .select('advisor_id, co_advisor_id, name')
          .eq('id', clubId)
          .single();

        if (clubData) {
          const advisorIds: string[] = [];
          if (clubData.advisor_id) advisorIds.push(clubData.advisor_id);
          if (clubData.co_advisor_id) advisorIds.push(clubData.co_advisor_id);

          if (advisorIds.length > 0) {
            const { data: teachers } = await supabase
              .from('teachers')
              .select('user_id')
              .in('id', advisorIds);

            if (teachers) {
              const teacherUserIds = teachers
                .map((t) => t.user_id)
                .filter((id) => id);
              if (teacherUserIds.length > 0) {
                await this.notificationService.notifyUsers(
                  teacherUserIds,
                  'New Club Member',
                  `A new student has joined the club "${clubData.name}".`,
                  NotificationType.INFO,
                  user.id,
                  { expiresInDays: 7 },
                );
              }
            }
          }
        }
      } catch (error) {
        this.logger.warn(
          'Failed to create notifications for club join:',
          error,
        );
      }

      return { success: true };
    } catch (error) {
      this.logger.error('Error joining club:', error);
      throw error;
    }
  }

  /**
   * Get all club positions
   * @returns Promise<Position[]> - Array of positions
   */
  async getPositions(): Promise<any[]> {
    try {
      const supabase = this.supabaseService.getServiceClient();

      const { data, error } = await supabase
        .from('club_positions')
        .select('id, name')
        .order('name', { ascending: true });

      if (error) {
        this.logger.error('Error fetching club positions:', error);
        throw new BadRequestException(
          `Failed to fetch club positions: ${error.message}`,
        );
      }

      return data || [];
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Unexpected error fetching club positions:', error);
      throw new BadRequestException('Failed to fetch club positions');
    }
  }
}
