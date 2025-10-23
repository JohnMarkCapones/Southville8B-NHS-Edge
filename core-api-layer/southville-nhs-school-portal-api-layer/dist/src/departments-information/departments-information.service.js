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
var DepartmentsInformationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentsInformationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
let DepartmentsInformationService = DepartmentsInformationService_1 = class DepartmentsInformationService {
    configService;
    logger = new common_1.Logger(DepartmentsInformationService_1.name);
    supabase = null;
    constructor(configService) {
        this.configService = configService;
    }
    getSupabaseClient() {
        if (!this.supabase) {
            const supabaseUrl = this.configService.get('supabase.url');
            const supabaseServiceKey = this.configService.get('supabase.serviceRoleKey');
            if (!supabaseUrl || !supabaseServiceKey) {
                throw new common_1.InternalServerErrorException('Database configuration is missing. Please contact administrator.');
            }
            this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey);
        }
        return this.supabase;
    }
    async create(createDepartmentsInformationDto) {
        const supabase = this.getSupabaseClient();
        const { data, error } = await supabase
            .from('departments_information')
            .insert({
            department_id: createDepartmentsInformationDto.departmentId,
            office_name: createDepartmentsInformationDto.officeName,
            contact_person: createDepartmentsInformationDto.contactPerson,
            description: createDepartmentsInformationDto.description,
            email: createDepartmentsInformationDto.email,
            contact_number: createDepartmentsInformationDto.contactNumber,
        })
            .select()
            .single();
        if (error) {
            this.logger.error('Error creating department information:', error);
            throw new common_1.InternalServerErrorException('Failed to create department information');
        }
        this.logger.log(`Created department information: ${data.office_name}`);
        return data;
    }
    async findAll(filters = {}) {
        const supabase = this.getSupabaseClient();
        const { page = 1, limit = 10, departmentId } = filters;
        let query = supabase
            .from('departments_information')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: true });
        if (departmentId) {
            query = query.eq('department_id', departmentId);
        }
        query = query.range((page - 1) * limit, page * limit - 1);
        const { data, error, count } = await query;
        if (error) {
            this.logger.error('Error fetching departments information:', error);
            throw new common_1.InternalServerErrorException('Failed to fetch departments information');
        }
        const totalPages = Math.ceil((count || 0) / limit);
        return {
            data: data || [],
            total: count || 0,
            page,
            limit,
            totalPages,
        };
    }
    async findByDepartment(departmentId) {
        const supabase = this.getSupabaseClient();
        const { data, error } = await supabase
            .from('departments_information')
            .select('*')
            .eq('department_id', departmentId)
            .order('created_at', { ascending: true });
        if (error) {
            this.logger.error('Error fetching department information by department:', error);
            throw new common_1.InternalServerErrorException('Failed to fetch department information');
        }
        return data || [];
    }
    async findOne(id) {
        const supabase = this.getSupabaseClient();
        const { data, error } = await supabase
            .from('departments_information')
            .select('*')
            .eq('id', id)
            .single();
        if (error || !data) {
            throw new common_1.NotFoundException('Department information not found');
        }
        return data;
    }
    async update(id, updateDepartmentsInformationDto) {
        const supabase = this.getSupabaseClient();
        await this.findOne(id);
        const updateData = {};
        if (updateDepartmentsInformationDto.departmentId !== undefined)
            updateData.department_id = updateDepartmentsInformationDto.departmentId;
        if (updateDepartmentsInformationDto.officeName !== undefined)
            updateData.office_name = updateDepartmentsInformationDto.officeName;
        if (updateDepartmentsInformationDto.contactPerson !== undefined)
            updateData.contact_person = updateDepartmentsInformationDto.contactPerson;
        if (updateDepartmentsInformationDto.description !== undefined)
            updateData.description = updateDepartmentsInformationDto.description;
        if (updateDepartmentsInformationDto.email !== undefined)
            updateData.email = updateDepartmentsInformationDto.email;
        if (updateDepartmentsInformationDto.contactNumber !== undefined)
            updateData.contact_number = updateDepartmentsInformationDto.contactNumber;
        const { data, error } = await supabase
            .from('departments_information')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();
        if (error) {
            this.logger.error('Error updating department information:', error);
            throw new common_1.InternalServerErrorException('Failed to update department information');
        }
        this.logger.log(`Updated department information: ${data.office_name}`);
        return data;
    }
    async remove(id) {
        const supabase = this.getSupabaseClient();
        await this.findOne(id);
        const { error } = await supabase
            .from('departments_information')
            .delete()
            .eq('id', id);
        if (error) {
            this.logger.error('Error deleting department information:', error);
            throw new common_1.InternalServerErrorException('Failed to delete department information');
        }
        this.logger.log(`Deleted department information with ID: ${id}`);
    }
};
exports.DepartmentsInformationService = DepartmentsInformationService;
exports.DepartmentsInformationService = DepartmentsInformationService = DepartmentsInformationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], DepartmentsInformationService);
//# sourceMappingURL=departments-information.service.js.map