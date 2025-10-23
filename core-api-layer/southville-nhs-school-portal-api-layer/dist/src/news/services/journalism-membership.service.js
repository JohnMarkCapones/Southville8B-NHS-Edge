"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var JournalismMembershipService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JournalismMembershipService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
let JournalismMembershipService = JournalismMembershipService_1 = class JournalismMembershipService {
    supabaseService;
    logger = new common_1.Logger(JournalismMembershipService_1.name);
    STUDENT_POSITIONS = [
        'Editor-in-Chief',
        'Co-Editor-in-Chief',
        'Publisher',
        'Writer',
        'Member',
    ];
    TEACHER_POSITIONS = ['Adviser', 'Co-Adviser'];
    UNIQUE_POSITIONS = ['Adviser', 'Editor-in-Chief'];
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async getJournalismDomainId() {
        const supabase = this.supabaseService.getServiceClient();
        const { data, error } = await supabase
            .from('domains')
            .select('id')
            .eq('type', 'journalism')
            .maybeSingle();
        if (error || !data) {
            throw new common_1.BadRequestException('Journalism domain not found. Please contact administrator.');
        }
        return data.id;
    }
    async getDomainRoleId(positionName) {
        const supabase = this.supabaseService.getServiceClient();
        const domainId = await this.getJournalismDomainId();
        const { data, error } = await supabase
            .from('domain_roles')
            .select('id')
            .eq('domain_id', domainId)
            .eq('name', positionName)
            .maybeSingle();
        if (error || !data) {
            throw new common_1.NotFoundException(`Position "${positionName}" not found in journalism domain`);
        }
        return data.id;
    }
    async isAdmin(userId) {
        const supabase = this.supabaseService.getServiceClient();
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('role_id')
            .eq('id', userId)
            .maybeSingle();
        this.logger.debug(`isAdmin check for user ${userId}: role_id = ${user?.role_id}`);
        if (userError || !user?.role_id) {
            this.logger.warn(`Failed to get user role_id: ${userError?.message}`);
            return false;
        }
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
        const isAdmin = (role.name === 'Admin' ||
            role.name === 'Super Admin' ||
            role.name === 'SuperAdmin');
        this.logger.debug(`User ${userId} isAdmin: ${isAdmin} (role: ${role.name})`);
        return isAdmin;
    }
    async isAdviser(userId) {
        const supabase = this.supabaseService.getServiceClient();
        const domainId = await this.getJournalismDomainId();
        const { data } = await supabase
            .from('user_domain_roles')
            .select(`
        id,
        domain_roles!inner(
          domain_id,
          name
        )
      `)
            .eq('user_id', userId)
            .eq('domain_roles.domain_id', domainId)
            .maybeSingle();
        if (!data)
            return false;
        const domainRoles = data.domain_roles;
        return domainRoles?.name === 'Adviser' || domainRoles?.name === 'Co-Adviser';
    }
    async canAssignPosition(requesterId, position) {
        if (this.TEACHER_POSITIONS.includes(position)) {
            throw new common_1.ForbiddenException(`The "${position}" position is for teachers and cannot be assigned through this API. Teacher positions should be managed separately.`);
        }
        if (!this.STUDENT_POSITIONS.includes(position)) {
            throw new common_1.ForbiddenException(`Invalid position: ${position}. Valid student positions are: ${this.STUDENT_POSITIONS.join(', ')}`);
        }
        const isAdminUser = await this.isAdmin(requesterId);
        const isAdviserUser = await this.isAdviser(requesterId);
        if (!isAdminUser && !isAdviserUser) {
            throw new common_1.ForbiddenException('Only Admins and Advisers can manage journalism student membership');
        }
    }
    async checkUniquePosition(position, excludeUserId) {
        if (!this.UNIQUE_POSITIONS.includes(position)) {
            return;
        }
        const supabase = this.supabaseService.getServiceClient();
        const roleId = await this.getDomainRoleId(position);
        let query = supabase
            .from('user_domain_roles')
            .select('user_id')
            .eq('domain_role_id', roleId);
        if (excludeUserId) {
            query = query.neq('user_id', excludeUserId);
        }
        const { data } = await query.maybeSingle();
        if (data) {
            throw new common_1.ConflictException(`The "${position}" position is already assigned to another user. Only one person can have this position.`);
        }
    }
    async addMember(addMemberDto, requesterId) {
        const supabase = this.supabaseService.getServiceClient();
        await this.canAssignPosition(requesterId, addMemberDto.position);
        await this.checkUniquePosition(addMemberDto.position);
        const domainId = await this.getJournalismDomainId();
        const roleId = await this.getDomainRoleId(addMemberDto.position);
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id, full_name, email, role_id, roles!inner(name)')
            .eq('id', addMemberDto.userId)
            .maybeSingle();
        if (userError || !user) {
            this.logger.error(`User lookup error: ${userError?.message}`);
            throw new common_1.NotFoundException(`User with ID ${addMemberDto.userId} not found`);
        }
        const userRole = user.roles?.name;
        if (userRole !== 'Student') {
            throw new common_1.ForbiddenException(`Only students can be assigned journalism positions. This user is a ${userRole}.`);
        }
        const { data: existing } = await supabase
            .from('user_domain_roles')
            .select(`
        id,
        domain_roles!inner(domain_id)
      `)
            .eq('user_id', addMemberDto.userId)
            .eq('domain_roles.domain_id', domainId)
            .maybeSingle();
        if (existing) {
            throw new common_1.ConflictException(`User is already a member of journalism team. Use update endpoint to change their position.`);
        }
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
            throw new common_1.BadRequestException(`Failed to add member: ${insertError.message}`);
        }
        this.logger.log(`User ${addMemberDto.userId} added to journalism as ${addMemberDto.position} by ${requesterId}`);
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
    async updateMemberPosition(userId, updateDto, requesterId) {
        const supabase = this.supabaseService.getServiceClient();
        await this.canAssignPosition(requesterId, updateDto.position);
        await this.checkUniquePosition(updateDto.position, userId);
        const domainId = await this.getJournalismDomainId();
        const newRoleId = await this.getDomainRoleId(updateDto.position);
        const { data: currentMembership, error: fetchError } = await supabase
            .from('user_domain_roles')
            .select(`
        id,
        domain_roles!inner(name, domain_id)
      `)
            .eq('user_id', userId)
            .eq('domain_roles.domain_id', domainId)
            .maybeSingle();
        if (fetchError || !currentMembership) {
            throw new common_1.NotFoundException(`User is not a member of journalism team. Use add endpoint to add them first.`);
        }
        const currentRole = currentMembership.domain_roles?.name;
        const { error: updateError } = await supabase
            .from('user_domain_roles')
            .update({
            domain_role_id: newRoleId,
        })
            .eq('id', currentMembership.id);
        if (updateError) {
            this.logger.error('Error updating member position:', updateError);
            throw new common_1.BadRequestException(`Failed to update position: ${updateError.message}`);
        }
        this.logger.log(`User ${userId} position changed from ${currentRole} to ${updateDto.position} by ${requesterId}`);
        return {
            userId,
            previousPosition: currentRole,
            newPosition: updateDto.position,
            updatedBy: requesterId,
            message: `Successfully updated position from ${currentRole} to ${updateDto.position}`,
        };
    }
    async removeMember(userId, requesterId) {
        const supabase = this.supabaseService.getServiceClient();
        const domainId = await this.getJournalismDomainId();
        const { data: membership, error: fetchError } = await supabase
            .from('user_domain_roles')
            .select(`
        id,
        domain_roles!inner(name, domain_id)
      `)
            .eq('user_id', userId)
            .eq('domain_roles.domain_id', domainId)
            .maybeSingle();
        if (fetchError || !membership) {
            throw new common_1.NotFoundException(`User is not a member of journalism team`);
        }
        const position = membership.domain_roles?.name;
        await this.canAssignPosition(requesterId, position);
        const { error: deleteError } = await supabase
            .from('user_domain_roles')
            .delete()
            .eq('id', membership.id);
        if (deleteError) {
            this.logger.error('Error removing member from journalism:', deleteError);
            throw new common_1.BadRequestException(`Failed to remove member: ${deleteError.message}`);
        }
        this.logger.log(`User ${userId} (${position}) removed from journalism by ${requesterId}`);
    }
    async getAllMembers() {
        const supabase = this.supabaseService.getServiceClient();
        const domainId = await this.getJournalismDomainId();
        const { data, error } = await supabase
            .from('user_domain_roles')
            .select(`
        id,
        user_id,
        users!inner(id, full_name, email),
        domain_roles!inner(name, domain_id)
      `)
            .eq('domain_roles.domain_id', domainId)
            .order('domain_roles(name)', { ascending: true });
        if (error) {
            this.logger.error('Error fetching journalism members:', error);
            throw new common_1.BadRequestException('Failed to fetch members');
        }
        return data.map((record) => {
            const user = record.users;
            const role = record.domain_roles;
            return {
                membershipId: record.id,
                userId: record.user_id,
                userName: user.full_name,
                userEmail: user.email,
                position: role.name,
            };
        });
    }
    async getMember(userId) {
        const supabase = this.supabaseService.getServiceClient();
        const domainId = await this.getJournalismDomainId();
        const { data, error } = await supabase
            .from('user_domain_roles')
            .select(`
        id,
        user_id,
        users!inner(id, full_name, email),
        domain_roles!inner(name, domain_id)
      `)
            .eq('user_id', userId)
            .eq('domain_roles.domain_id', domainId)
            .maybeSingle();
        if (error || !data) {
            throw new common_1.NotFoundException(`User is not a member of journalism team`);
        }
        const user = data.users;
        const role = data.domain_roles;
        return {
            membershipId: data.id,
            userId: data.user_id,
            userName: user.full_name,
            userEmail: user.email,
            position: role.name,
        };
    }
};
exports.JournalismMembershipService = JournalismMembershipService;
exports.JournalismMembershipService = JournalismMembershipService = JournalismMembershipService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], JournalismMembershipService);
//# sourceMappingURL=journalism-membership.service.js.map