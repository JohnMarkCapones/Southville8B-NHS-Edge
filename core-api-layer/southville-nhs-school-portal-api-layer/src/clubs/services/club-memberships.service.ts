import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateClubMembershipDto } from '../dto/create-club-membership.dto';
import { UpdateClubMembershipDto } from '../dto/update-club-membership.dto';
import { ClubMembership } from '../entities/club-membership.entity';

@Injectable()
export class ClubMembershipsService {
  private readonly logger = new Logger(ClubMembershipsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

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

    // Check if user is Admin
    const { data: user } = await supabase
      .from('users')
      .select('role_id, roles!inner(name)')
      .eq('id', userId)
      .single();

    if (user?.roles?.[0]?.name === 'Admin') return true;

    // Check if user is adviser, co-adviser, or president
    const { data: club } = await supabase
      .from('clubs')
      .select('advisor_id, co_advisor_id, president_id')
      .eq('id', clubId)
      .single();

    if (!club) return false;

    return (
      club.advisor_id === userId ||
      club.co_advisor_id === userId ||
      club.president_id === userId
    );
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

    // Check if membership already exists
    const { data: existing } = await supabase
      .from('student_club_memberships')
      .select('id')
      .eq('student_id', createDto.studentId)
      .eq('club_id', createDto.clubId)
      .eq('is_active', true)
      .maybeSingle();

    if (existing) {
      throw new BadRequestException('Student is already a member of this club');
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
        student:students(id, first_name, last_name, lrn_id),
        club:clubs(id, name),
        position:club_positions(id, name, level)
      `,
      )
      .single();

    if (error) {
      this.logger.error('Error creating membership:', error);
      throw new BadRequestException(
        `Failed to create membership: ${error.message}`,
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
        student:students(id, first_name, last_name, lrn_id, grade_level),
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
        student:students(id, first_name, last_name, lrn_id, grade_level),
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

    const { data, error } = await supabase
      .from('student_club_memberships')
      .update({
        position_id: updateDto.positionId,
        joined_at: updateDto.joinedAt,
        is_active: updateDto.isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(
        `
        *,
        student:students(id, first_name, last_name, lrn_id),
        club:clubs(id, name),
        position:club_positions(id, name, level)
      `,
      )
      .single();

    if (error || !data) {
      this.logger.error('Error updating membership:', error);
      throw new BadRequestException('Failed to update membership');
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
