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
var GwaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GwaService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
let GwaService = GwaService_1 = class GwaService {
    configService;
    logger = new common_1.Logger(GwaService_1.name);
    supabase;
    constructor(configService) {
        this.configService = configService;
        const supabaseUrl = this.configService.get('supabase.url');
        const serviceRoleKey = this.configService.get('supabase.serviceRoleKey');
        this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, serviceRoleKey);
    }
    async getAdvisoryStudentsWithGwa(teacherId, gradingPeriod, schoolYear) {
        try {
            this.logger.log(`Getting advisory students for teacher: ${teacherId}, period: ${gradingPeriod}, year: ${schoolYear}`);
            const { data: teacher, error: teacherError } = await this.supabase
                .from('teachers')
                .select('advisory_section_id')
                .eq('user_id', teacherId)
                .single();
            if (teacherError || !teacher?.advisory_section_id) {
                this.logger.error('Teacher not found or no advisory section assigned');
                throw new common_1.NotFoundException('Teacher not found or no advisory section assigned');
            }
            const { data: section, error: sectionError } = await this.supabase
                .from('sections')
                .select('name, grade_level')
                .eq('id', teacher.advisory_section_id)
                .single();
            if (sectionError || !section) {
                this.logger.error('Section not found');
                throw new common_1.NotFoundException('Section not found');
            }
            const { data: studentsWithGwa, error: studentsError } = await this.supabase
                .from('students')
                .select(`
          id,
          student_id,
          first_name,
          last_name,
          students_gwa!left(
            id,
            gwa,
            remarks,
            honor_status
          )
        `)
                .eq('section_id', teacher.advisory_section_id)
                .eq('students_gwa.grading_period', gradingPeriod)
                .eq('students_gwa.school_year', schoolYear);
            if (studentsError) {
                this.logger.error('Error fetching students with GWA:', studentsError);
                throw new Error(`Failed to fetch students: ${studentsError.message}`);
            }
            const students = studentsWithGwa?.map((student) => ({
                student_id: student.id,
                student_name: `${student.first_name} ${student.last_name}`,
                student_number: student.student_id,
                gwa: student.students_gwa?.[0]?.gwa,
                remarks: student.students_gwa?.[0]?.remarks,
                honor_status: student.students_gwa?.[0]?.honor_status || 'None',
                gwa_id: student.students_gwa?.[0]?.id,
            })) || [];
            this.logger.log(`Found ${students.length} students in advisory section: ${section.name}`);
            return {
                students,
                section_name: section.name,
                grade_level: section.grade_level,
            };
        }
        catch (error) {
            this.logger.error('Error in getAdvisoryStudentsWithGwa:', error);
            throw error;
        }
    }
    async createGwaEntry(dto, recordedBy) {
        try {
            this.logger.log(`Creating GWA entry for student: ${dto.student_id}`);
            await this.validateTeacherPermission(dto.student_id, recordedBy);
            const { data: teacher, error: teacherError } = await this.supabase
                .from('teachers')
                .select('id')
                .eq('user_id', recordedBy)
                .single();
            if (teacherError || !teacher) {
                this.logger.error('Teacher not found for user:', recordedBy);
                throw new common_1.NotFoundException('Teacher not found');
            }
            const { data, error } = await this.supabase
                .from('students_gwa')
                .insert({
                student_id: dto.student_id,
                gwa: dto.gwa,
                grading_period: dto.grading_period,
                school_year: dto.school_year,
                remarks: dto.remarks,
                honor_status: dto.honor_status,
                recorded_by: teacher.id,
            })
                .select()
                .single();
            if (error) {
                this.logger.error('Error creating GWA entry:', error);
                throw new Error(`Failed to create GWA entry: ${error.message}`);
            }
            this.logger.log(`GWA entry created successfully: ${data.id}`);
            return data;
        }
        catch (error) {
            this.logger.error('Error in createGwaEntry:', error);
            throw error;
        }
    }
    async updateGwaEntry(id, dto, teacherUserId) {
        try {
            this.logger.log(`Updating GWA entry: ${id}`);
            const { data: teacher, error: teacherError } = await this.supabase
                .from('teachers')
                .select('id')
                .eq('user_id', teacherUserId)
                .single();
            if (teacherError || !teacher) {
                this.logger.error('Teacher not found for user:', teacherUserId);
                throw new common_1.NotFoundException('Teacher not found');
            }
            const { data: existingEntry, error: fetchError } = await this.supabase
                .from('students_gwa')
                .select('recorded_by')
                .eq('id', id)
                .single();
            if (fetchError || !existingEntry) {
                throw new common_1.NotFoundException('GWA entry not found');
            }
            if (existingEntry.recorded_by !== teacher.id) {
                throw new common_1.ForbiddenException('You can only update GWA entries you created');
            }
            const updateData = {
                updated_at: new Date().toISOString(),
            };
            if (dto.gwa !== undefined)
                updateData.gwa = dto.gwa;
            if (dto.remarks !== undefined)
                updateData.remarks = dto.remarks;
            if (dto.honor_status !== undefined)
                updateData.honor_status = dto.honor_status;
            const { data, error } = await this.supabase
                .from('students_gwa')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();
            if (error) {
                this.logger.error('Error updating GWA entry:', error);
                throw new Error(`Failed to update GWA entry: ${error.message}`);
            }
            this.logger.log(`GWA entry updated successfully: ${id}`);
            return data;
        }
        catch (error) {
            this.logger.error('Error in updateGwaEntry:', error);
            throw error;
        }
    }
    async deleteGwaEntry(id, teacherUserId) {
        try {
            this.logger.log(`Deleting GWA entry: ${id}`);
            const { data: teacher, error: teacherError } = await this.supabase
                .from('teachers')
                .select('id')
                .eq('user_id', teacherUserId)
                .single();
            if (teacherError || !teacher) {
                this.logger.error('Teacher not found for user:', teacherUserId);
                throw new common_1.NotFoundException('Teacher not found');
            }
            const { data: existingEntry, error: fetchError } = await this.supabase
                .from('students_gwa')
                .select('recorded_by')
                .eq('id', id)
                .single();
            if (fetchError || !existingEntry) {
                throw new common_1.NotFoundException('GWA entry not found');
            }
            if (existingEntry.recorded_by !== teacher.id) {
                throw new common_1.ForbiddenException('You can only delete GWA entries you created');
            }
            const { error } = await this.supabase
                .from('students_gwa')
                .delete()
                .eq('id', id);
            if (error) {
                this.logger.error('Error deleting GWA entry:', error);
                throw new Error(`Failed to delete GWA entry: ${error.message}`);
            }
            this.logger.log(`GWA entry deleted successfully: ${id}`);
        }
        catch (error) {
            this.logger.error('Error in deleteGwaEntry:', error);
            throw error;
        }
    }
    async validateTeacherPermission(studentId, teacherId) {
        const { data: student, error: studentError } = await this.supabase
            .from('students')
            .select('section_id')
            .eq('id', studentId)
            .single();
        if (studentError || !student) {
            throw new common_1.NotFoundException('Student not found');
        }
        const { data: teacher, error: teacherError } = await this.supabase
            .from('teachers')
            .select('advisory_section_id')
            .eq('user_id', teacherId)
            .single();
        if (teacherError || !teacher) {
            throw new common_1.NotFoundException('Teacher not found');
        }
        if (teacher.advisory_section_id !== student.section_id) {
            throw new common_1.ForbiddenException('You can only enter GWA for students in your advisory section');
        }
    }
};
exports.GwaService = GwaService;
exports.GwaService = GwaService = GwaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GwaService);
//# sourceMappingURL=gwa.service.js.map