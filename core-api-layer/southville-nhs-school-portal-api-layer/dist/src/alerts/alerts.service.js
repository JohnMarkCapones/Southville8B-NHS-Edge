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
var AlertsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let AlertsService = AlertsService_1 = class AlertsService {
    configService;
    logger = new common_1.Logger(AlertsService_1.name);
    supabase = null;
    constructor(configService) {
        this.configService = configService;
    }
    getSupabaseClient() {
        if (!this.supabase) {
            const supabaseUrl = this.configService.get('supabase.url');
            const supabaseServiceKey = this.configService.get('supabase.serviceRoleKey');
            if (!supabaseUrl || !supabaseServiceKey) {
                throw new Error('Supabase configuration is missing');
            }
            this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey);
        }
        return this.supabase;
    }
    async create(createAlertDto, userId) {
        try {
            const supabase = this.getSupabaseClient();
            const { data: alert, error } = await supabase
                .from('alerts')
                .insert({
                ...createAlertDto,
                created_by: userId,
            })
                .select('*')
                .single();
            if (error) {
                this.logger.error('Error creating alert:', error);
                throw new common_1.BadRequestException(`Failed to create alert: ${error.message}`);
            }
            this.logger.log(`Alert created: ${alert.title} (ID: ${alert.id})`);
            return alert;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.logger.error('Unexpected error creating alert:', error);
            throw new common_1.InternalServerErrorException('Failed to create alert');
        }
    }
    async findAll(queryDto, userId, userRole) {
        try {
            const supabase = this.getSupabaseClient();
            const { type, includeExpired = false, page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'DESC', } = queryDto;
            let query = supabase.from('alerts').select('*', { count: 'exact' });
            if (userId && userRole && userRole !== roles_decorator_1.UserRole.ADMIN) {
                query = query.or(`recipient_id.is.null,recipient_id.eq.${userId}`);
            }
            else if (!userId) {
                query = query.is('recipient_id', null);
            }
            if (type) {
                query = query.eq('type', type);
            }
            if (!includeExpired) {
                query = query.gt('expires_at', new Date().toISOString());
            }
            query = query.order(sortBy, { ascending: sortOrder === 'ASC' });
            const from = (page - 1) * limit;
            const to = from + limit - 1;
            query = query.range(from, to);
            const { data: alerts, error, count } = await query;
            if (error) {
                this.logger.error('Error fetching alerts:', error);
                throw new common_1.InternalServerErrorException('Failed to fetch alerts');
            }
            const total = count || 0;
            const totalPages = Math.ceil(total / limit);
            return {
                data: alerts || [],
                total,
                page,
                limit,
                totalPages,
            };
        }
        catch (error) {
            if (error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            this.logger.error('Unexpected error fetching alerts:', error);
            throw new common_1.InternalServerErrorException('Failed to fetch alerts');
        }
    }
    async findOne(id, userId, userRole) {
        try {
            const supabase = this.getSupabaseClient();
            let query = supabase.from('alerts').select('*').eq('id', id);
            if (userId && userRole && userRole !== roles_decorator_1.UserRole.ADMIN) {
                query = query.or(`recipient_id.is.null,recipient_id.eq.${userId}`);
            }
            else if (!userId) {
                query = query.is('recipient_id', null);
            }
            const { data: alert, error } = await query.single();
            if (error) {
                this.logger.error(`Error fetching alert ${id}:`, error);
                throw new common_1.NotFoundException(`Alert with ID ${id} not found`);
            }
            return alert;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error('Unexpected error fetching alert:', error);
            throw new common_1.InternalServerErrorException('Failed to fetch alert');
        }
    }
    async update(id, updateAlertDto, userId) {
        try {
            const supabase = this.getSupabaseClient();
            await this.findOne(id, userId, roles_decorator_1.UserRole.ADMIN);
            const { data: alert, error } = await supabase
                .from('alerts')
                .update({
                ...updateAlertDto,
            })
                .eq('id', id)
                .select('*')
                .single();
            if (error) {
                this.logger.error(`Error updating alert ${id}:`, error);
                throw new common_1.BadRequestException(`Failed to update alert: ${error.message}`);
            }
            this.logger.log(`Alert updated: ${alert.title} (ID: ${alert.id})`);
            return alert;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.logger.error('Unexpected error updating alert:', error);
            throw new common_1.InternalServerErrorException('Failed to update alert');
        }
    }
    async remove(id, userId) {
        try {
            const supabase = this.getSupabaseClient();
            await this.findOne(id, userId, roles_decorator_1.UserRole.ADMIN);
            const { error } = await supabase.from('alerts').delete().eq('id', id);
            if (error) {
                this.logger.error(`Error deleting alert ${id}:`, error);
                throw new common_1.InternalServerErrorException('Failed to delete alert');
            }
            this.logger.log(`Alert deleted: ${id}`);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            if (error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            this.logger.error('Unexpected error deleting alert:', error);
            throw new common_1.InternalServerErrorException('Failed to delete alert');
        }
    }
};
exports.AlertsService = AlertsService;
exports.AlertsService = AlertsService = AlertsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AlertsService);
//# sourceMappingURL=alerts.service.js.map