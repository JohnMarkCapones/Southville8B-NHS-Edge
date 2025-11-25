import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { AddMemberDto, UpdateMemberPositionDto } from '../dto';

/**
 * Service for managing journalism team membership
 * Handles adding/removing members and assigning positions
 */
@Injectable()
export class JournalismMembershipService {
  private readonly logger = new Logger(JournalismMembershipService.name);

  // Valid student positions (what Advisers can assign to students)
  private readonly STUDENT_POSITIONS = [
    'Editor-in-Chief',
    'Co-Editor-in-Chief',
    'Publisher',
    'Writer',
    'Member',
  ];

  // Teacher positions (Adviser, Co-Adviser) - managed separately, not through this API
  private readonly TEACHER_POSITIONS = ['Adviser', 'Co-Adviser'];

  // Unique positions (only 1 person can have these)
  private readonly UNIQUE_POSITIONS = ['Adviser', 'Editor-in-Chief'];

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Get journalism domain ID
   * @returns Promise<string>
   */
  private async getJournalismDomainId(): Promise<string> {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('domains')
      .select('id')
      .eq('type', 'journalism')
      .maybeSingle();

    if (error || !data) {
      throw new BadRequestException(
        'Journalism domain not found. Please contact administrator.',
      );
    }

    return data.id;
  }

  /**
   * Get domain role ID by position name
   * @param positionName Position name
   * @returns Promise<string>
   */
  private async getDomainRoleId(positionName: string): Promise<string> {
    const supabase = this.supabaseService.getServiceClient();
    const domainId = await this.getJournalismDomainId();

    const { data, error } = await supabase
      .from('domain_roles')
      .select('id')
      .eq('domain_id', domainId)
      .eq('name', positionName)
      .maybeSingle();

    if (error || !data) {
      throw new NotFoundException(
        `Position "${positionName}" not found in journalism domain`,
      );
    }

    return data.id;
  }

  /**
   * Check if user is Admin or Super Admin
   * @param userId User ID
   * @returns Promise<boolean>
   */
  private async isAdmin(userId: string): Promise<boolean> {
    const supabase = this.supabaseService.getServiceClient();

    // Step 1: Get user's role_id
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role_id')
      .eq('id', userId)
      .maybeSingle();

    this.logger.debug(
      `isAdmin check for user ${userId}: role_id = ${user?.role_id}`,
    );

    if (userError || !user?.role_id) {
      this.logger.warn(`Failed to get user role_id: ${userError?.message}`);
      return false;
    }

    // Step 2: Get role name from roles table
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .select('name')
      .eq('id', user.role_id)
      .maybeSingle();

    this.logger.debug(`Role lookup for role_id ${user.role_id}: ${role?.name}`);

    if (roleError || !role) {
      this.logger.warn(`Failed to get role name: ${roleError?.message}`);
      return false;
    }

    const isAdmin =
      role.name === 'Admin' ||
      role.name === 'Super Admin' ||
      role.name === 'SuperAdmin';

    this.logger.debug(
      `User ${userId} isAdmin: ${isAdmin} (role: ${role.name})`,
    );

    return isAdmin;
  }

  /**
   * Check if user is Adviser in journalism
   * @param userId User ID
   * @returns Promise<boolean>
   */
  private async isAdviser(userId: string): Promise<boolean> {
    const supabase = this.supabaseService.getServiceClient();
    const domainId = await this.getJournalismDomainId();

    const { data } = await supabase
      .from('user_domain_roles')
      .select(
        `
        id,
        domain_roles!inner(
          domain_id,
          name
        )
      `,
      )
      .eq('user_id', userId)
      .eq('domain_roles.domain_id', domainId)
      .maybeSingle();

    if (!data) return false;

    const domainRoles = data.domain_roles as any;
    return (
      domainRoles?.name === 'Adviser' || domainRoles?.name === 'Co-Adviser'
    );
  }

  /**
   * Check if requester can assign this position
   * @param requesterId Requester user ID
   * @param position Position to assign
   * @throws ForbiddenException if not allowed
   */
  private async canAssignPosition(
    requesterId: string,
    position: string,
  ): Promise<void> {
    // Teacher positions (Adviser, Co-Adviser) should not be assigned through this API
    if (this.TEACHER_POSITIONS.includes(position)) {
      throw new ForbiddenException(
        `The "${position}" position is for teachers and cannot be assigned through this API. Teacher positions should be managed separately.`,
      );
    }

    // Only student positions are allowed
    if (!this.STUDENT_POSITIONS.includes(position)) {
      throw new ForbiddenException(
        `Invalid position: ${position}. Valid student positions are: ${this.STUDENT_POSITIONS.join(', ')}`,
      );
    }

    // Check if requester is Admin or Adviser
    const isAdminUser = await this.isAdmin(requesterId);
    const isAdviserUser = await this.isAdviser(requesterId);

    if (!isAdminUser && !isAdviserUser) {
      throw new ForbiddenException(
        'Only Admins and Advisers can manage journalism student membership',
      );
    }
  }

  /**
   * Check if position is already taken (for unique positions)
   * @param position Position name
   * @param excludeUserId User ID to exclude from check (for updates)
   * @throws ConflictException if position is taken
   */
  private async checkUniquePosition(
    position: string,
    excludeUserId?: string,
  ): Promise<void> {
    if (!this.UNIQUE_POSITIONS.includes(position)) {
      return; // Not a unique position, no check needed
    }

    const supabase = this.supabaseService.getServiceClient();
    const roleId = await this.getDomainRoleId(position);

    // user_domain_roles doesn't have domain_id, only domain_role_id
    // The roleId already represents a unique position in the journalism domain
    let query = supabase
      .from('user_domain_roles')
      .select('user_id')
      .eq('domain_role_id', roleId);

    if (excludeUserId) {
      query = query.neq('user_id', excludeUserId);
    }

    const { data } = await query.maybeSingle();

    if (data) {
      throw new ConflictException(
        `The "${position}" position is already assigned to another user. Only one person can have this position.`,
      );
    }
  }

  /**
   * Add a user to journalism domain with a position
   * @param addMemberDto Add member DTO
   * @param requesterId User ID making the request
   * @returns Promise<any>
   */
  async addMember(
    addMemberDto: AddMemberDto,
    requesterId: string,
  ): Promise<any> {
    const supabase = this.supabaseService.getServiceClient();

    // Check permissions
    await this.canAssignPosition(requesterId, addMemberDto.position);

    // Check if position is unique and already taken
    await this.checkUniquePosition(addMemberDto.position);

    // Get domain and role IDs
    const domainId = await this.getJournalismDomainId();
    const roleId = await this.getDomainRoleId(addMemberDto.position);

    // Check if user exists and get their role
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, full_name, email, role_id, roles!inner(name)')
      .eq('id', addMemberDto.userId)
      .maybeSingle();

    if (userError || !user) {
      this.logger.error(`User lookup error: ${userError?.message}`);
      throw new NotFoundException(
        `User with ID ${addMemberDto.userId} not found`,
      );
    }

    // Verify user is a student (only students can be assigned journalism positions)
    const userRole = (user.roles as any)?.name;
    if (userRole !== 'Student') {
      throw new ForbiddenException(
        `Only students can be assigned journalism positions. This user is a ${userRole}.`,
      );
    }

    // Check if user is already a member (join through domain_roles to filter by domain)
    const { data: existing } = await supabase
      .from('user_domain_roles')
      .select(
        `
        id,
        domain_roles!inner(domain_id)
      `,
      )
      .eq('user_id', addMemberDto.userId)
      .eq('domain_roles.domain_id', domainId)
      .maybeSingle();

    if (existing) {
      throw new ConflictException(
        `User is already a member of journalism team. Use update endpoint to change their position.`,
      );
    }

    // Add user to domain (user_domain_roles only has user_id and domain_role_id, no domain_id column)
    const { data: membership, error: insertError } = await supabase
      .from('user_domain_roles')
      .insert({
        user_id: addMemberDto.userId,
        domain_role_id: roleId,
      })
      .select()
      .single();

    if (insertError) {
      this.logger.error('Error adding member to journalism:', insertError);
      throw new BadRequestException(
        `Failed to add member: ${insertError.message}`,
      );
    }

    this.logger.log(
      `User ${addMemberDto.userId} added to journalism as ${addMemberDto.position} by ${requesterId}`,
    );

    return {
      id: membership.id,
      userId: addMemberDto.userId,
      userName: user.full_name,
      userEmail: user.email,
      position: addMemberDto.position,
      addedBy: requesterId,
      message: `Successfully added ${user.full_name} as ${addMemberDto.position}`,
    };
  }

  /**
   * Update a member's position
   * @param userId User ID to update
   * @param updateDto Update position DTO
   * @param requesterId User ID making the request
   * @returns Promise<any>
   */
  async updateMemberPosition(
    userId: string,
    updateDto: UpdateMemberPositionDto,
    requesterId: string,
  ): Promise<any> {
    const supabase = this.supabaseService.getServiceClient();

    // Check permissions
    await this.canAssignPosition(requesterId, updateDto.position);

    // Check if new position is unique and already taken (exclude current user)
    await this.checkUniquePosition(updateDto.position, userId);

    // Get domain and new role IDs
    const domainId = await this.getJournalismDomainId();
    const newRoleId = await this.getDomainRoleId(updateDto.position);

    // Check if user is a member (join through domain_roles to filter by domain)
    const { data: currentMembership, error: fetchError } = await supabase
      .from('user_domain_roles')
      .select(
        `
        id,
        domain_roles!inner(name, domain_id)
      `,
      )
      .eq('user_id', userId)
      .eq('domain_roles.domain_id', domainId)
      .maybeSingle();

    if (fetchError || !currentMembership) {
      throw new NotFoundException(
        `User is not a member of journalism team. Use add endpoint to add them first.`,
      );
    }

    const currentRole = (currentMembership.domain_roles as any)?.name;

    // Update position
    const { error: updateError } = await supabase
      .from('user_domain_roles')
      .update({
        domain_role_id: newRoleId,
      })
      .eq('id', currentMembership.id);

    if (updateError) {
      this.logger.error('Error updating member position:', updateError);
      throw new BadRequestException(
        `Failed to update position: ${updateError.message}`,
      );
    }

    this.logger.log(
      `User ${userId} position changed from ${currentRole} to ${updateDto.position} by ${requesterId}`,
    );

    return {
      userId,
      previousPosition: currentRole,
      newPosition: updateDto.position,
      updatedBy: requesterId,
      message: `Successfully updated position from ${currentRole} to ${updateDto.position}`,
    };
  }

  /**
   * Remove a user from journalism domain
   * @param userId User ID to remove
   * @param requesterId User ID making the request
   * @returns Promise<void>
   */
  async removeMember(userId: string, requesterId: string): Promise<void> {
    const supabase = this.supabaseService.getServiceClient();
    const domainId = await this.getJournalismDomainId();

    // Get current membership info (join through domain_roles to filter by domain)
    // FIX: Use .limit(1).single() instead of .maybeSingle() to handle duplicate memberships
    // If user has multiple positions, remove the first one found
    const { data: membership, error: fetchError } = await supabase
      .from('user_domain_roles')
      .select(
        `
        id,
        domain_roles!inner(name, domain_id)
      `,
      )
      .eq('user_id', userId)
      .eq('domain_roles.domain_id', domainId)
      .limit(1)
      .single();

    if (fetchError || !membership) {
      throw new NotFoundException(`User is not a member of journalism team`);
    }

    const position = (membership.domain_roles as any)?.name;

    // Check permissions
    await this.canAssignPosition(requesterId, position);

    // Delete membership
    const { error: deleteError } = await supabase
      .from('user_domain_roles')
      .delete()
      .eq('id', membership.id);

    if (deleteError) {
      this.logger.error('Error removing member from journalism:', deleteError);
      throw new BadRequestException(
        `Failed to remove member: ${deleteError.message}`,
      );
    }

    this.logger.log(
      `User ${userId} (${position}) removed from journalism by ${requesterId}`,
    );
  }

  /**
   * Get all journalism members
   * @returns Promise<any[]>
   */
  async getAllMembers(): Promise<any[]> {
    const supabase = this.supabaseService.getServiceClient();
    const domainId = await this.getJournalismDomainId();

    // Join through domain_roles to filter by domain_id
    const { data, error } = await supabase
      .from('user_domain_roles')
      .select(
        `
        id,
        user_id,
        users!inner(id, full_name, email),
        domain_roles!inner(name, domain_id)
      `,
      )
      .eq('domain_roles.domain_id', domainId)
      .order('domain_roles(name)', { ascending: true });

    if (error) {
      this.logger.error('Error fetching journalism members:', error);
      throw new BadRequestException('Failed to fetch members');
    }

    return data.map((record) => {
      const user = record.users as any;
      const role = record.domain_roles as any;

      return {
        membershipId: record.id,
        userId: record.user_id,
        userName: user.full_name,
        userEmail: user.email,
        position: role.name,
      };
    });
  }

  /**
   * Get a specific member's details
   * @param userId User ID
   * @returns Promise<any>
   */
  async getMember(userId: string): Promise<any> {
    const supabase = this.supabaseService.getServiceClient();
    const domainId = await this.getJournalismDomainId();

    // Join through domain_roles to filter by domain_id
    const { data, error } = await supabase
      .from('user_domain_roles')
      .select(
        `
        id,
        user_id,
        users!inner(id, full_name, email),
        domain_roles!inner(name, domain_id)
      `,
      )
      .eq('user_id', userId)
      .eq('domain_roles.domain_id', domainId)
      .maybeSingle();

    if (error || !data) {
      throw new NotFoundException(`User is not a member of journalism team`);
    }

    const user = data.users as any;
    const role = data.domain_roles as any;

    return {
      membershipId: data.id,
      userId: data.user_id,
      userName: user.full_name,
      userEmail: user.email,
      position: role.name,
    };
  }
}
