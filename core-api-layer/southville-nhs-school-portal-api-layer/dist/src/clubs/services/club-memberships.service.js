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
var ClubMembershipsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClubMembershipsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
let ClubMembershipsService = ClubMembershipsService_1 = class ClubMembershipsService {
    supabaseService;
    logger = new common_1.Logger(ClubMembershipsService_1.name);
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    mapDbToDto(dbRecord) {
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
    async checkClubAccess(userId, clubId) {
        const supabase = this.supabaseService.getServiceClient();
        const { data: user } = await supabase
            .from('users')
            .select('role_id, roles(name)')
            .eq('id', userId)
            .single();
        const roleName = user?.roles?.[0]?.name;
        if (roleName === 'Admin')
            return true;
        const { data: club } = await supabase
            .from('clubs')
            .select('advisor_id, co_advisor_id, president_id')
            .eq('id', clubId)
            .single();
        if (!club)
            return false;
        return (club.advisor_id === userId ||
            club.co_advisor_id === userId ||
            club.president_id === userId);
    }
    async create(createDto, userId) {
        const supabase = this.supabaseService.getServiceClient();
        const hasAccess = await this.checkClubAccess(userId, createDto.clubId);
        if (!hasAccess) {
            throw new common_1.ForbiddenException('You do not have access to manage this club');
        }
        const { data: position, error: posError } = await supabase
            .from('club_positions')
            .select('id, name')
            .eq('id', createDto.positionId)
            .single();
        if (posError || !position) {
            throw new common_1.BadRequestException('Invalid position ID');
        }
        const { data: existing } = await supabase
            .from('student_club_memberships')
            .select('id')
            .eq('student_id', createDto.studentId)
            .eq('club_id', createDto.clubId)
            .eq('is_active', true)
            .limit(1)
            .maybeSingle();
        if (existing) {
            throw new common_1.ConflictException('Student is already a member of this club');
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
            .select(`
        *,
        student:students(id, first_name, last_name),
        club:clubs(id, name),
        position:club_positions(id, name, level)
      `)
            .single();
        if (error) {
            this.logger.error('Error creating membership:', {
                code: error.code,
                message: error.message,
                details: error.details,
            });
            if (error.code === '23505' || error.message?.includes('duplicate')) {
                throw new common_1.ConflictException('Membership already exists');
            }
            throw new common_1.BadRequestException(`Failed to create membership: ${error.message}`);
        }
        return this.mapDbToDto(data);
    }
    async findAll(clubId) {
        const supabase = this.supabaseService.getServiceClient();
        let query = supabase
            .from('student_club_memberships')
            .select(`
        *,
        student:students(id, first_name, last_name, grade_level),
        club:clubs(id, name),
        position:club_positions(id, name, level)
      `)
            .order('created_at', { ascending: false });
        if (clubId) {
            query = query.eq('club_id', clubId);
        }
        const { data, error } = await query;
        if (error) {
            this.logger.error('Error fetching memberships:', error);
            throw new common_1.BadRequestException('Failed to fetch memberships');
        }
        return data.map((m) => this.mapDbToDto(m));
    }
    async findOne(id) {
        const supabase = this.supabaseService.getServiceClient();
        const { data, error } = await supabase
            .from('student_club_memberships')
            .select(`
        *,
        student:students(id, first_name, last_name, grade_level),
        club:clubs(id, name),
        position:club_positions(id, name, level)
      `)
            .eq('id', id)
            .single();
        if (error || !data) {
            throw new common_1.NotFoundException('Membership not found');
        }
        return this.mapDbToDto(data);
    }
    async update(id, updateDto, userId) {
        const supabase = this.supabaseService.getServiceClient();
        const existing = await this.findOne(id);
        const hasAccess = await this.checkClubAccess(userId, existing.clubId);
        if (!hasAccess) {
            throw new common_1.ForbiddenException('You do not have access to manage this club');
        }
        const updatePayload = {
            updated_at: new Date().toISOString(),
        };
        if (updateDto.positionId) {
            const { data: position, error: posError } = await supabase
                .from('club_positions')
                .select('id')
                .eq('id', updateDto.positionId)
                .single();
            if (posError || !position) {
                throw new common_1.BadRequestException('Invalid position ID');
            }
            updatePayload.position_id = updateDto.positionId;
        }
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
                throw new common_1.ConflictException('Student already has an active membership in this club');
            }
        }
        if (updateDto.joinedAt !== undefined) {
            updatePayload.joined_at = updateDto.joinedAt;
        }
        if (updateDto.isActive !== undefined) {
            updatePayload.is_active = updateDto.isActive;
        }
        const { data, error } = await supabase
            .from('student_club_memberships')
            .update(updatePayload)
            .eq('id', id)
            .select(`
        *,
        student:students(id, first_name, last_name, grade_level),
        club:clubs(id, name),
        position:club_positions(id, name, level)
      `)
            .single();
        if (error || !data) {
            this.logger.error('Error updating membership:', error);
            throw new common_1.BadRequestException('Failed to update membership');
        }
        return this.mapDbToDto(data);
    }
    async remove(id, userId) {
        const supabase = this.supabaseService.getServiceClient();
        const existing = await this.findOne(id);
        const hasAccess = await this.checkClubAccess(userId, existing.clubId);
        if (!hasAccess) {
            throw new common_1.ForbiddenException('You do not have access to manage this club');
        }
        const { error } = await supabase
            .from('student_club_memberships')
            .delete()
            .eq('id', id);
        if (error) {
            this.logger.error('Error deleting membership:', error);
            throw new common_1.BadRequestException('Failed to delete membership');
        }
    }
    async findByStudent(studentId) {
        const supabase = this.supabaseService.getServiceClient();
        const { data, error } = await supabase
            .from('student_club_memberships')
            .select(`
        *,
        club:clubs(id, name, description),
        position:club_positions(id, name, level)
      `)
            .eq('student_id', studentId)
            .eq('is_active', true)
            .order('joined_at', { ascending: false });
        if (error) {
            this.logger.error('Error fetching student memberships:', error);
            throw new common_1.BadRequestException('Failed to fetch student memberships');
        }
        return data.map((m) => this.mapDbToDto(m));
    }
};
exports.ClubMembershipsService = ClubMembershipsService;
exports.ClubMembershipsService = ClubMembershipsService = ClubMembershipsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], ClubMembershipsService);
//# sourceMappingURL=club-memberships.service.js.map