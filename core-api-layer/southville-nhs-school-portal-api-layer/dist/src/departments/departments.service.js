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
var DepartmentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
let DepartmentsService = DepartmentsService_1 = class DepartmentsService {
    supabaseService;
    logger = new common_1.Logger(DepartmentsService_1.name);
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async create(createDto, userId) {
        try {
            const existingDept = await this.findByName(createDto.departmentName);
            if (existingDept) {
                throw new common_1.ConflictException('Department with this name already exists');
            }
            if (createDto.headId) {
                await this.validateTeacherExists(createDto.headId);
            }
            const { data, error } = await this.supabaseService
                .getServiceClient()
                .from('departments')
                .insert({
                department_name: createDto.departmentName,
                description: createDto.description,
                head_id: createDto.headId,
                is_active: createDto.isActive ?? true,
            })
                .select(`
          *,
          head:head_id(id, full_name, email)
        `)
                .single();
            if (error) {
                this.logger.error('Error creating department:', error);
                throw new common_1.InternalServerErrorException('Failed to create department');
            }
            this.logger.log(`Department created: ${data.department_name} by user ${userId}`);
            return data;
        }
        catch (error) {
            if (error instanceof common_1.ConflictException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.logger.error('Error creating department:', error);
            throw new common_1.InternalServerErrorException('Failed to create department');
        }
    }
    async findAll(query) {
        try {
            const { page = 1, limit = 10, isActive, search } = query;
            const offset = (page - 1) * limit;
            let supabaseQuery = this.supabaseService
                .getServiceClient()
                .from('departments')
                .select(`
          *,
          head:head_id(id, full_name, email)
        `, { count: 'exact' })
                .order('created_at', { ascending: false });
            if (isActive !== undefined) {
                supabaseQuery = supabaseQuery.eq('is_active', isActive);
            }
            if (search) {
                supabaseQuery = supabaseQuery.ilike('department_name', `%${search}%`);
            }
            supabaseQuery = supabaseQuery.range(offset, offset + limit - 1);
            const { data, error, count } = await supabaseQuery;
            if (error) {
                this.logger.error('Error fetching departments:', error);
                throw new common_1.InternalServerErrorException('Failed to fetch departments');
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
        catch (error) {
            this.logger.error('Error fetching departments:', error);
            throw new common_1.InternalServerErrorException('Failed to fetch departments');
        }
    }
    async findOne(id) {
        try {
            const { data, error } = await this.supabaseService
                .getServiceClient()
                .from('departments')
                .select(`
          *,
          head:head_id(id, full_name, email)
        `)
                .eq('id', id)
                .single();
            if (error || !data) {
                throw new common_1.NotFoundException('Department not found');
            }
            return data;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error('Error fetching department:', error);
            throw new common_1.InternalServerErrorException('Failed to fetch department');
        }
    }
    async findByName(name) {
        try {
            const { data, error } = await this.supabaseService
                .getServiceClient()
                .from('departments')
                .select('*')
                .eq('department_name', name)
                .single();
            if (error) {
                return null;
            }
            return data;
        }
        catch (error) {
            this.logger.error('Error finding department by name:', error);
            return null;
        }
    }
    async update(id, updateDto, userId) {
        try {
            await this.findOne(id);
            if (updateDto.departmentName) {
                const existingDept = await this.findByName(updateDto.departmentName);
                if (existingDept && existingDept.id !== id) {
                    throw new common_1.ConflictException('Department with this name already exists');
                }
            }
            if (updateDto.headId) {
                await this.validateTeacherExists(updateDto.headId);
            }
            const updateData = {};
            if (updateDto.departmentName !== undefined) {
                updateData.department_name = updateDto.departmentName;
            }
            if (updateDto.description !== undefined) {
                updateData.description = updateDto.description;
            }
            if (updateDto.headId !== undefined) {
                updateData.head_id = updateDto.headId;
            }
            if (updateDto.isActive !== undefined) {
                updateData.is_active = updateDto.isActive;
            }
            const { data, error } = await this.supabaseService
                .getServiceClient()
                .from('departments')
                .update(updateData)
                .eq('id', id)
                .select(`
          *,
          head:head_id(id, full_name, email)
        `)
                .single();
            if (error) {
                this.logger.error('Error updating department:', error);
                throw new common_1.InternalServerErrorException('Failed to update department');
            }
            this.logger.log(`Department updated: ${data.department_name} by user ${userId}`);
            return data;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.ConflictException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.logger.error('Error updating department:', error);
            throw new common_1.InternalServerErrorException('Failed to update department');
        }
    }
    async remove(id, userId) {
        try {
            const department = await this.findOne(id);
            const { error } = await this.supabaseService
                .getServiceClient()
                .from('departments')
                .update({ is_active: false })
                .eq('id', id);
            if (error) {
                this.logger.error('Error soft deleting department:', error);
                throw new common_1.InternalServerErrorException('Failed to delete department');
            }
            this.logger.log(`Department soft deleted: ${department.department_name} by user ${userId}`);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error('Error deleting department:', error);
            throw new common_1.InternalServerErrorException('Failed to delete department');
        }
    }
    async activate(id, userId) {
        try {
            const { data, error } = await this.supabaseService
                .getServiceClient()
                .from('departments')
                .update({ is_active: true })
                .eq('id', id)
                .select(`
          *,
          head:head_id(id, full_name, email)
        `)
                .single();
            if (error || !data) {
                throw new common_1.NotFoundException('Department not found');
            }
            this.logger.log(`Department activated: ${data.department_name} by user ${userId}`);
            return data;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error('Error activating department:', error);
            throw new common_1.InternalServerErrorException('Failed to activate department');
        }
    }
    async deactivate(id, userId) {
        try {
            const { data, error } = await this.supabaseService
                .getServiceClient()
                .from('departments')
                .update({ is_active: false })
                .eq('id', id)
                .select(`
          *,
          head:head_id(id, full_name, email)
        `)
                .single();
            if (error || !data) {
                throw new common_1.NotFoundException('Department not found');
            }
            this.logger.log(`Department deactivated: ${data.department_name} by user ${userId}`);
            return data;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error('Error deactivating department:', error);
            throw new common_1.InternalServerErrorException('Failed to deactivate department');
        }
    }
    async assignHead(deptId, teacherId, userId) {
        try {
            await this.validateTeacherExists(teacherId);
            const { data, error } = await this.supabaseService
                .getServiceClient()
                .from('departments')
                .update({ head_id: teacherId })
                .eq('id', deptId)
                .select(`
          *,
          head:head_id(id, full_name, email)
        `)
                .single();
            if (error || !data) {
                throw new common_1.NotFoundException('Department not found');
            }
            this.logger.log(`Department head assigned: ${data.department_name} to teacher ${teacherId} by user ${userId}`);
            return data;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.logger.error('Error assigning department head:', error);
            throw new common_1.InternalServerErrorException('Failed to assign department head');
        }
    }
    async validateTeacherExists(teacherId) {
        try {
            const { data, error } = await this.supabaseService
                .getServiceClient()
                .from('teachers')
                .select('id')
                .eq('id', teacherId)
                .single();
            if (error || !data) {
                throw new common_1.BadRequestException('Teacher not found');
            }
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.logger.error('Error validating teacher:', error);
            throw new common_1.BadRequestException('Failed to validate teacher');
        }
    }
};
exports.DepartmentsService = DepartmentsService;
exports.DepartmentsService = DepartmentsService = DepartmentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], DepartmentsService);
//# sourceMappingURL=departments.service.js.map