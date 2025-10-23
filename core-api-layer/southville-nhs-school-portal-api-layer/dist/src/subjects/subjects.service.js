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
var SubjectsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubjectsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
let SubjectsService = SubjectsService_1 = class SubjectsService {
    supabaseService;
    logger = new common_1.Logger(SubjectsService_1.name);
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    getSupabaseClient() {
        return this.supabaseService.getServiceClient();
    }
    async findAll(query) {
        try {
            const { page = 1, limit = 10, departmentId, gradeLevel, search } = query;
            const offset = (page - 1) * limit;
            let supabaseQuery = this.getSupabaseClient()
                .from('subjects')
                .select(`
          *,
          department:department_id(id, department_name, description)
        `, { count: 'exact' })
                .order('subject_name', { ascending: true });
            if (departmentId) {
                supabaseQuery = supabaseQuery.eq('department_id', departmentId);
            }
            if (gradeLevel !== undefined && gradeLevel !== null) {
                supabaseQuery = supabaseQuery.eq('grade_level', gradeLevel);
            }
            if (search) {
                supabaseQuery = supabaseQuery.ilike('subject_name', `%${search}%`);
            }
            supabaseQuery = supabaseQuery.range(offset, offset + limit - 1);
            const { data, error, count } = await supabaseQuery;
            if (error) {
                this.logger.error('Error fetching subjects:', error);
                throw new common_1.InternalServerErrorException('Failed to fetch subjects');
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
            this.logger.error('Error fetching subjects:', error);
            throw new common_1.InternalServerErrorException('Failed to fetch subjects');
        }
    }
    async findOne(id) {
        try {
            const { data, error } = await this.getSupabaseClient()
                .from('subjects')
                .select(`
          *,
          department:department_id(id, department_name, description)
        `)
                .eq('id', id)
                .maybeSingle();
            if (error) {
                this.logger.error('Error fetching subject:', error);
                throw new common_1.InternalServerErrorException('Failed to fetch subject');
            }
            if (!data) {
                this.logger.warn(`Subject with id ${id} not found`);
                throw new common_1.NotFoundException('Subject not found');
            }
            return data;
        }
        catch (error) {
            this.logger.error('Error fetching subject:', error);
            throw new common_1.InternalServerErrorException('Failed to fetch subject');
        }
    }
};
exports.SubjectsService = SubjectsService;
exports.SubjectsService = SubjectsService = SubjectsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], SubjectsService);
//# sourceMappingURL=subjects.service.js.map