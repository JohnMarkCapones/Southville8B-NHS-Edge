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
var SectionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SectionsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
let SectionsService = SectionsService_1 = class SectionsService {
    configService;
    logger = new common_1.Logger(SectionsService_1.name);
    supabase;
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
    async create(createSectionDto) {
        try {
            const supabase = this.getSupabaseClient();
            if (createSectionDto.teacherId) {
                const { data: teacher, error: teacherError } = await supabase
                    .from('users')
                    .select('id, role:roles(name)')
                    .eq('id', createSectionDto.teacherId)
                    .single();
                if (teacherError || !teacher) {
                    throw new common_1.BadRequestException('Teacher not found');
                }
                if (teacher.role?.name !== 'Teacher') {
                    throw new common_1.BadRequestException('User is not a teacher');
                }
            }
            const { data: section, error } = await supabase
                .from('sections')
                .insert({
                name: createSectionDto.name,
                grade_level: createSectionDto.gradeLevel,
                teacher_id: createSectionDto.teacherId,
                room_id: createSectionDto.roomId,
                building_id: createSectionDto.buildingId,
            })
                .select(`
          *,
          teacher:users(id, full_name, email)
        `)
                .single();
            if (error) {
                this.logger.error('Error creating section:', error);
                throw new common_1.InternalServerErrorException(`Failed to create section: ${error.message}`);
            }
            this.logger.log(`Section created successfully: ${section.name}`);
            return section;
        }
        catch (error) {
            if (error instanceof common_1.ConflictException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.logger.error('Error creating section:', error);
            throw new common_1.InternalServerErrorException('Failed to create section');
        }
    }
    async findAll(filters = {}) {
        const supabase = this.getSupabaseClient();
        const { page = 1, limit = 10, search, gradeLevel, teacherId, sortBy = 'created_at', sortOrder = 'desc', } = filters;
        let query = supabase.from('sections').select(`
      *,
      teacher:users(id, full_name, email),
      students:students(id, first_name, last_name, student_id)
    `, { count: 'exact' });
        if (search) {
            query = query.or(`name.ilike.%${search}%,grade_level.ilike.%${search}%`);
        }
        if (gradeLevel) {
            query = query.eq('grade_level', gradeLevel);
        }
        if (teacherId) {
            query = query.eq('teacher_id', teacherId);
        }
        query = query.order(sortBy, { ascending: sortOrder === 'asc' });
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);
        const { data: sections, error, count } = await query;
        if (error) {
            this.logger.error('Error fetching sections:', error);
            throw new common_1.InternalServerErrorException('Failed to fetch sections');
        }
        const totalPages = Math.ceil((count || 0) / limit);
        return {
            data: sections,
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        };
    }
    async findOne(id) {
        const supabase = this.getSupabaseClient();
        const { data: section, error } = await supabase
            .from('sections')
            .select(`
        *,
        teacher:users(id, full_name, email),
        students:students(id, first_name, last_name, student_id)
      `)
            .eq('id', id)
            .single();
        if (error) {
            this.logger.error('Error fetching section:', error);
            throw new common_1.NotFoundException('Section not found');
        }
        return section;
    }
    async update(id, updateSectionDto) {
        const supabase = this.getSupabaseClient();
        if (updateSectionDto.teacherId) {
            const { data: teacher, error: teacherError } = await supabase
                .from('users')
                .select('id, role:roles(name)')
                .eq('id', updateSectionDto.teacherId)
                .single();
            if (teacherError || !teacher) {
                throw new common_1.BadRequestException('Teacher not found');
            }
            if (teacher.role?.name !== 'Teacher') {
                throw new common_1.BadRequestException('User is not a teacher');
            }
        }
        const { data: section, error } = await supabase
            .from('sections')
            .update({
            name: updateSectionDto.name,
            grade_level: updateSectionDto.gradeLevel,
            teacher_id: updateSectionDto.teacherId,
            room_id: updateSectionDto.roomId,
            building_id: updateSectionDto.buildingId,
            updated_at: new Date().toISOString(),
        })
            .eq('id', id)
            .select(`
        *,
        teacher:users(id, full_name, email)
      `)
            .single();
        if (error) {
            this.logger.error('Error updating section:', error);
            throw new common_1.InternalServerErrorException(`Failed to update section: ${error.message}`);
        }
        if (!section) {
            throw new common_1.NotFoundException('Section not found');
        }
        this.logger.log(`Section updated successfully: ${section.name}`);
        return section;
    }
    async remove(id) {
        const supabase = this.getSupabaseClient();
        const { data: students, error: studentsError } = await supabase
            .from('students')
            .select('id')
            .eq('section_id', id)
            .limit(1);
        if (studentsError) {
            this.logger.error('Error checking students:', studentsError);
            throw new common_1.InternalServerErrorException('Failed to check section students');
        }
        if (students && students.length > 0) {
            throw new common_1.BadRequestException('Cannot delete section with assigned students');
        }
        const { error } = await supabase.from('sections').delete().eq('id', id);
        if (error) {
            this.logger.error('Error deleting section:', error);
            throw new common_1.InternalServerErrorException(`Failed to delete section: ${error.message}`);
        }
        this.logger.log(`Section deleted successfully: ${id}`);
    }
    async getSectionsByTeacher(teacherId) {
        const supabase = this.getSupabaseClient();
        const { data: sections, error } = await supabase
            .from('sections')
            .select(`
        *,
        teacher:users(id, full_name, email),
        students:students(id, first_name, last_name, student_id)
      `)
            .eq('teacher_id', teacherId)
            .order('name');
        if (error) {
            this.logger.error('Error fetching teacher sections:', error);
            throw new common_1.InternalServerErrorException('Failed to fetch teacher sections');
        }
        return sections || [];
    }
    async getSectionsByGradeLevel(gradeLevel) {
        const supabase = this.getSupabaseClient();
        const { data: sections, error } = await supabase
            .from('sections')
            .select(`
        *,
        teacher:users(id, full_name, email),
        students:students(id, first_name, last_name, student_id)
      `)
            .eq('grade_level', gradeLevel)
            .order('name');
        if (error) {
            this.logger.error('Error fetching grade level sections:', error);
            throw new common_1.InternalServerErrorException('Failed to fetch grade level sections');
        }
        return sections || [];
    }
};
exports.SectionsService = SectionsService;
exports.SectionsService = SectionsService = SectionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SectionsService);
//# sourceMappingURL=sections.service.js.map