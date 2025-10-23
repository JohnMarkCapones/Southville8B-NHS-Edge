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
var DomainsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
let DomainsService = DomainsService_1 = class DomainsService {
    supabaseService;
    logger = new common_1.Logger(DomainsService_1.name);
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async create(createDomainDto, createdBy) {
        try {
            const supabase = this.supabaseService.getServiceClient();
            const { data, error } = await supabase
                .from('domains')
                .insert({
                ...createDomainDto,
                created_by: createdBy,
            })
                .select('*')
                .single();
            if (error) {
                this.logger.error('Error creating domain:', error);
                throw new common_1.BadRequestException(`Failed to create domain: ${error.message}`);
            }
            this.logger.log(`Created domain: ${data.name} (ID: ${data.id})`);
            return data;
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.logger.error('Unexpected error creating domain:', error);
            throw new common_1.BadRequestException('Failed to create domain');
        }
    }
    async createClubDomain(createClubDomainDto, createdBy) {
        try {
            const supabase = this.supabaseService.getServiceClient();
            const { data: domain, error: domainError } = await supabase
                .from('domains')
                .insert({
                type: 'club',
                name: createClubDomainDto.name,
                created_by: createdBy,
            })
                .select('*')
                .single();
            if (domainError) {
                this.logger.error('Error creating domain:', domainError);
                throw new common_1.BadRequestException(`Failed to create domain: ${domainError.message}`);
            }
            const { data: club, error: clubError } = await supabase
                .from('clubs')
                .insert({
                name: createClubDomainDto.name,
                description: createClubDomainDto.description,
                president_id: createClubDomainDto.president_id,
                vp_id: createClubDomainDto.vp_id,
                secretary_id: createClubDomainDto.secretary_id,
                advisor_id: createClubDomainDto.advisor_id,
                domain_id: domain.id,
            })
                .select(`
          *,
          president:president_id(id, full_name, email),
          vp:vp_id(id, full_name, email),
          secretary:secretary_id(id, full_name, email),
          advisor:advisor_id(id, full_name, email),
          domain:domain_id(id, type, name)
        `)
                .single();
            if (clubError) {
                this.logger.error('Error creating club:', clubError);
                await supabase.from('domains').delete().eq('id', domain.id);
                throw new common_1.BadRequestException(`Failed to create club: ${clubError.message}`);
            }
            await this.createDefaultDomainRoles(domain.id, createdBy);
            this.logger.log(`Created club domain: ${domain.name} with club ID: ${club.id}`);
            return {
                domain,
                club,
                message: 'Club domain created successfully',
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.logger.error('Unexpected error creating club domain:', error);
            throw new common_1.BadRequestException('Failed to create club domain');
        }
    }
    async createDefaultDomainRoles(domainId, createdBy) {
        try {
            const supabase = this.supabaseService.getServiceClient();
            const defaultRoles = [
                {
                    name: 'President',
                    permissions: [
                        'club.edit',
                        'club.delete',
                        'club.manage_finances',
                        'club.manage_members',
                        'club.view_members',
                    ],
                },
                {
                    name: 'Vice President',
                    permissions: [
                        'club.edit',
                        'club.manage_finances',
                        'club.manage_members',
                        'club.view_members',
                    ],
                },
                {
                    name: 'Treasurer',
                    permissions: ['club.manage_finances', 'club.view_members'],
                },
                {
                    name: 'Secretary',
                    permissions: [
                        'club.edit',
                        'club.manage_members',
                        'club.view_members',
                    ],
                },
                { name: 'Member', permissions: ['club.view_members'] },
            ];
            for (const roleData of defaultRoles) {
                const { data: domainRole, error: roleError } = await supabase
                    .from('domain_roles')
                    .insert({
                    domain_id: domainId,
                    name: roleData.name,
                })
                    .select('*')
                    .single();
                if (roleError) {
                    this.logger.warn(`Failed to create domain role ${roleData.name}:`, roleError);
                    continue;
                }
                for (const permissionKey of roleData.permissions) {
                    const { data: permission, error: permError } = await supabase
                        .from('permissions')
                        .select('id')
                        .eq('key', permissionKey)
                        .single();
                    if (permError || !permission) {
                        this.logger.warn(`Permission ${permissionKey} not found, skipping`);
                        continue;
                    }
                    await supabase.from('domain_role_permissions').insert({
                        domain_role_id: domainRole.id,
                        permission_id: permission.id,
                        allowed: true,
                    });
                }
            }
            this.logger.log(`Created default domain roles for domain ${domainId}`);
        }
        catch (error) {
            this.logger.error('Error creating default domain roles:', error);
        }
    }
    async findAll() {
        try {
            const supabase = this.supabaseService.getServiceClient();
            const { data, error } = await supabase
                .from('domains')
                .select(`
          *,
          created_by_user:created_by(id, full_name, email)
        `)
                .order('created_at', { ascending: false });
            if (error) {
                this.logger.error('Error fetching domains:', error);
                throw new common_1.BadRequestException(`Failed to fetch domains: ${error.message}`);
            }
            return data || [];
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.logger.error('Unexpected error fetching domains:', error);
            throw new common_1.BadRequestException('Failed to fetch domains');
        }
    }
    async findOne(id) {
        try {
            const supabase = this.supabaseService.getServiceClient();
            const { data, error } = await supabase
                .from('domains')
                .select(`
          *,
          created_by_user:created_by(id, full_name, email),
          domain_roles(id, name),
          clubs(id, name, description)
        `)
                .eq('id', id)
                .single();
            if (error || !data) {
                throw new common_1.NotFoundException(`Domain with ID ${id} not found`);
            }
            return data;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Error fetching domain ${id}:`, error);
            throw new common_1.BadRequestException('Failed to fetch domain');
        }
    }
};
exports.DomainsService = DomainsService;
exports.DomainsService = DomainsService = DomainsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], DomainsService);
//# sourceMappingURL=domains.service.js.map