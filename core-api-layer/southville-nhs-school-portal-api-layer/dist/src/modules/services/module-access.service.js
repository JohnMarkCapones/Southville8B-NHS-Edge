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
var ModuleAccessService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleAccessService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
let ModuleAccessService = ModuleAccessService_1 = class ModuleAccessService {
    supabaseService;
    logger = new common_1.Logger(ModuleAccessService_1.name);
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async canStudentAccessModule(studentUserId, moduleId) {
        try {
            const { data: module, error: moduleError } = await this.supabaseService
                .getServiceClient()
                .from('modules')
                .select(`
          id,
          is_global,
          is_deleted,
          subject_id
        `)
                .eq('id', moduleId)
                .single();
            if (moduleError || !module) {
                return { canAccess: false, reason: 'Module not found' };
            }
            if (module.is_deleted) {
                return { canAccess: false, reason: 'Module has been deleted' };
            }
            if (module.is_global) {
                return { canAccess: true };
            }
            const { data: studentSection, error: studentError } = await this.supabaseService
                .getServiceClient()
                .from('students')
                .select('section_id')
                .eq('user_id', studentUserId)
                .single();
            if (studentError || !studentSection) {
                return {
                    canAccess: false,
                    reason: 'Student not found or not enrolled',
                };
            }
            const { data: sectionModule, error: sectionError } = await this.supabaseService
                .getServiceClient()
                .from('section_modules')
                .select('visible')
                .eq('section_id', studentSection.section_id)
                .eq('module_id', moduleId)
                .single();
            if (sectionError || !sectionModule) {
                return {
                    canAccess: false,
                    reason: 'Module not assigned to student section',
                };
            }
            if (!sectionModule.visible) {
                return {
                    canAccess: false,
                    reason: 'Module not visible to student section',
                };
            }
            return { canAccess: true };
        }
        catch (error) {
            this.logger.error('Error checking student module access:', error);
            return { canAccess: false, reason: 'Internal error' };
        }
    }
    async canTeacherAccessModule(teacherUserId, moduleId) {
        try {
            const { data: module, error: moduleError } = await this.supabaseService
                .getServiceClient()
                .from('modules')
                .select(`
          id,
          uploaded_by,
          is_global,
          is_deleted,
          subject_id
        `)
                .eq('id', moduleId)
                .single();
            if (moduleError || !module) {
                return { canAccess: false, reason: 'Module not found' };
            }
            if (module.is_deleted) {
                return { canAccess: false, reason: 'Module has been deleted' };
            }
            if (module.uploaded_by === teacherUserId) {
                return { canAccess: true };
            }
            if (module.is_global && module.subject_id) {
                const { data: teacherSubject, error: teacherError } = await this.supabaseService
                    .getServiceClient()
                    .from('teachers')
                    .select('subject_specialization_id')
                    .eq('user_id', teacherUserId)
                    .single();
                if (teacherError || !teacherSubject) {
                    return { canAccess: false, reason: 'Teacher not found' };
                }
                if (teacherSubject.subject_specialization_id === module.subject_id) {
                    return { canAccess: true };
                }
                return {
                    canAccess: false,
                    reason: 'Teacher does not teach this subject',
                };
            }
            return {
                canAccess: false,
                reason: 'Module not accessible to this teacher',
            };
        }
        catch (error) {
            this.logger.error('Error checking teacher module access:', error);
            return { canAccess: false, reason: 'Internal error' };
        }
    }
    async getStudentSectionId(studentUserId) {
        try {
            const { data: student, error } = await this.supabaseService
                .getServiceClient()
                .from('students')
                .select('section_id')
                .eq('user_id', studentUserId)
                .single();
            if (error || !student) {
                return null;
            }
            return student.section_id;
        }
        catch (error) {
            this.logger.error('Error getting student section:', error);
            return null;
        }
    }
    async getTeacherSubjectId(teacherUserId) {
        try {
            const { data: teacher, error } = await this.supabaseService
                .getServiceClient()
                .from('teachers')
                .select('subject_specialization_id')
                .eq('user_id', teacherUserId)
                .single();
            if (error || !teacher) {
                return null;
            }
            return teacher.subject_specialization_id;
        }
        catch (error) {
            this.logger.error('Error getting teacher subject:', error);
            return null;
        }
    }
    async isSectionAuthorizedForModule(sectionId, moduleId) {
        try {
            const { data: sectionModule, error } = await this.supabaseService
                .getServiceClient()
                .from('section_modules')
                .select('visible')
                .eq('section_id', sectionId)
                .eq('module_id', moduleId)
                .single();
            if (error || !sectionModule) {
                return false;
            }
            return sectionModule.visible;
        }
        catch (error) {
            this.logger.error('Error checking section module authorization:', error);
            return false;
        }
    }
    async isAdmin(userId) {
        try {
            const { data: user, error } = await this.supabaseService
                .getServiceClient()
                .from('users')
                .select(`
          roles!inner(name)
        `)
                .eq('id', userId)
                .eq('roles.name', 'Admin')
                .single();
            return !error && !!user;
        }
        catch (error) {
            this.logger.error('Error checking admin status:', error);
            return false;
        }
    }
};
exports.ModuleAccessService = ModuleAccessService;
exports.ModuleAccessService = ModuleAccessService = ModuleAccessService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], ModuleAccessService);
//# sourceMappingURL=module-access.service.js.map