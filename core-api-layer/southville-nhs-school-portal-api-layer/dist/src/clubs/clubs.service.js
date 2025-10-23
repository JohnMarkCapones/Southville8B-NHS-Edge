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
var ClubsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClubsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
let ClubsService = ClubsService_1 = class ClubsService {
    supabaseService;
    logger = new common_1.Logger(ClubsService_1.name);
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async create(createClubDto) {
        try {
            const supabase = this.supabaseService.getServiceClient();
            const { data: domain, error: domainError } = await supabase
                .from('domains')
                .select('id, type, name')
                .eq('id', createClubDto.domain_id)
                .single();
            if (domainError || !domain) {
                throw new common_1.NotFoundException(`Domain with ID ${createClubDto.domain_id} not found`);
            }
            if (domain.type !== 'club') {
                throw new common_1.BadRequestException(`Domain type must be 'club', got '${domain.type}'`);
            }
            const { data, error } = await supabase
                .from('clubs')
                .insert(createClubDto)
                .select(`
          *,
          president:president_id(id, full_name, email),
          vp:vp_id(id, full_name, email),
          secretary:secretary_id(id, full_name, email),
          advisor:advisor_id(id, full_name, email),
          co_advisor:co_advisor_id(id, full_name, email),
          domain:domain_id(id, type, name)
        `)
                .single();
            if (error) {
                this.logger.error('Error creating club:', error);
                throw new common_1.BadRequestException(`Failed to create club: ${error.message}`);
            }
            this.logger.log(`Created club: ${data.name} (ID: ${data.id})`);
            return data;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.logger.error('Unexpected error creating club:', error);
            throw new common_1.BadRequestException('Failed to create club');
        }
    }
    async findAll() {
        try {
            const supabase = this.supabaseService.getServiceClient();
            const { data, error } = await supabase
                .from('clubs')
                .select(`
          *,
          president:president_id(id, full_name, email),
          vp:vp_id(id, full_name, email),
          secretary:secretary_id(id, full_name, email),
          advisor:advisor_id(id, full_name, email),
          co_advisor:co_advisor_id(id, full_name, email),
          domain:domain_id(id, type, name)
        `)
                .order('created_at', { ascending: false });
            if (error) {
                this.logger.error('Error fetching clubs:', error);
                throw new common_1.BadRequestException(`Failed to fetch clubs: ${error.message}`);
            }
            return data || [];
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.logger.error('Unexpected error fetching clubs:', error);
            throw new common_1.BadRequestException('Failed to fetch clubs');
        }
    }
    async findOne(id) {
        try {
            const supabase = this.supabaseService.getServiceClient();
            const { data, error } = await supabase
                .from('clubs')
                .select(`
          *,
          president:president_id(id, full_name, email),
          vp:vp_id(id, full_name, email),
          secretary:secretary_id(id, full_name, email),
          advisor:advisor_id(id, full_name, email),
          co_advisor:co_advisor_id(id, full_name, email),
          domain:domain_id(id, type, name)
        `)
                .eq('id', id)
                .single();
            if (error || !data) {
                throw new common_1.NotFoundException(`Club with ID ${id} not found`);
            }
            return data;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Error fetching club ${id}:`, error);
            throw new common_1.BadRequestException('Failed to fetch club');
        }
    }
    async update(id, updateClubDto) {
        try {
            const supabase = this.supabaseService.getServiceClient();
            const existingClub = await this.findOne(id);
            if (updateClubDto.domain_id) {
                const { data: domain, error: domainError } = await supabase
                    .from('domains')
                    .select('id, type')
                    .eq('id', updateClubDto.domain_id)
                    .single();
                if (domainError || !domain) {
                    throw new common_1.BadRequestException('Invalid domain_id: domain not found');
                }
                if (domain.type !== 'club') {
                    throw new common_1.BadRequestException(`Invalid domain_id: domain type must be 'club', got '${domain.type}'`);
                }
            }
            const { data, error } = await supabase
                .from('clubs')
                .update({
                ...updateClubDto,
                updated_at: new Date().toISOString(),
            })
                .eq('id', id)
                .select(`
          *,
          president:president_id(id, full_name, email),
          vp:vp_id(id, full_name, email),
          secretary:secretary_id(id, full_name, email),
          advisor:advisor_id(id, full_name, email),
          domain:domain_id(id, type, name)
        `)
                .single();
            if (error) {
                this.logger.error(`Error updating club ${id}:`, error);
                throw new common_1.BadRequestException(`Failed to update club: ${error.message}`);
            }
            this.logger.log(`Updated club: ${data.name} (ID: ${data.id})`);
            return data;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.logger.error(`Unexpected error updating club ${id}:`, error);
            throw new common_1.BadRequestException('Failed to update club');
        }
    }
    async remove(id) {
        try {
            const supabase = this.supabaseService.getServiceClient();
            await this.findOne(id);
            const { error } = await supabase.from('clubs').delete().eq('id', id);
            if (error) {
                this.logger.error(`Error deleting club ${id}:`, error);
                throw new common_1.BadRequestException(`Failed to delete club: ${error.message}`);
            }
            this.logger.log(`Deleted club with ID: ${id}`);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.logger.error(`Unexpected error deleting club ${id}:`, error);
            throw new common_1.BadRequestException('Failed to delete club');
        }
    }
    async getMembers(clubId) {
        return [];
    }
    async addMember(clubId, memberData) {
        throw new common_1.BadRequestException('Member management not yet implemented');
    }
    async updateFinances(clubId, financesData) {
        return {
            clubId,
            message: 'Finances updated successfully',
            data: financesData,
        };
    }
};
exports.ClubsService = ClubsService;
exports.ClubsService = ClubsService = ClubsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], ClubsService);
//# sourceMappingURL=clubs.service.js.map