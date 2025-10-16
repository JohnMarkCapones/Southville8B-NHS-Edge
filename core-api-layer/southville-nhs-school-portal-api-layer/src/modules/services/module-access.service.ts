import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

export interface ModuleAccessResult {
  canAccess: boolean;
  reason?: string;
}

@Injectable()
export class ModuleAccessService {
  private readonly logger = new Logger(ModuleAccessService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Check if student can access module
   */
  async canStudentAccessModule(
    studentUserId: string,
    moduleId: string,
  ): Promise<ModuleAccessResult> {
    try {
      // Get module details
      const { data: module, error: moduleError } = await this.supabaseService
        .getClient()
        .from('modules')
        .select(
          `
          id,
          is_global,
          is_deleted,
          subject_id
        `,
        )
        .eq('id', moduleId)
        .single();

      if (moduleError || !module) {
        return { canAccess: false, reason: 'Module not found' };
      }

      if (module.is_deleted) {
        return { canAccess: false, reason: 'Module has been deleted' };
      }

      // If global module, all students can access
      if (module.is_global) {
        return { canAccess: true };
      }

      // For section-specific modules, check if student is enrolled in a section that has access
      const { data: studentSection, error: studentError } =
        await this.supabaseService
          .getClient()
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

      // Check if student's section has access to this module
      const { data: sectionModule, error: sectionError } =
        await this.supabaseService
          .getClient()
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
    } catch (error) {
      this.logger.error('Error checking student module access:', error);
      return { canAccess: false, reason: 'Internal error' };
    }
  }

  /**
   * Check if teacher can access module
   */
  async canTeacherAccessModule(
    teacherUserId: string,
    moduleId: string,
  ): Promise<ModuleAccessResult> {
    try {
      // Get module details
      const { data: module, error: moduleError } = await this.supabaseService
        .getClient()
        .from('modules')
        .select(
          `
          id,
          uploaded_by,
          is_global,
          is_deleted,
          subject_id
        `,
        )
        .eq('id', moduleId)
        .single();

      if (moduleError || !module) {
        return { canAccess: false, reason: 'Module not found' };
      }

      if (module.is_deleted) {
        return { canAccess: false, reason: 'Module has been deleted' };
      }

      // If teacher uploaded it, they can access it
      if (module.uploaded_by === teacherUserId) {
        return { canAccess: true };
      }

      // If global module, check if teacher teaches the same subject
      if (module.is_global && module.subject_id) {
        const { data: teacherSubject, error: teacherError } =
          await this.supabaseService
            .getClient()
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

      // Teachers cannot access non-global modules from other teachers
      return {
        canAccess: false,
        reason: 'Module not accessible to this teacher',
      };
    } catch (error) {
      this.logger.error('Error checking teacher module access:', error);
      return { canAccess: false, reason: 'Internal error' };
    }
  }

  /**
   * Get student's section enrollment
   */
  async getStudentSectionId(studentUserId: string): Promise<string | null> {
    try {
      const { data: student, error } = await this.supabaseService
        .getClient()
        .from('students')
        .select('section_id')
        .eq('user_id', studentUserId)
        .single();

      if (error || !student) {
        return null;
      }

      return student.section_id;
    } catch (error) {
      this.logger.error('Error getting student section:', error);
      return null;
    }
  }

  /**
   * Get teacher's subject specialization
   */
  async getTeacherSubjectId(teacherUserId: string): Promise<string | null> {
    try {
      const { data: teacher, error } = await this.supabaseService
        .getClient()
        .from('teachers')
        .select('subject_specialization_id')
        .eq('user_id', teacherUserId)
        .single();

      if (error || !teacher) {
        return null;
      }

      return teacher.subject_specialization_id;
    } catch (error) {
      this.logger.error('Error getting teacher subject:', error);
      return null;
    }
  }

  /**
   * Verify section has access to module
   */
  async isSectionAuthorizedForModule(
    sectionId: string,
    moduleId: string,
  ): Promise<boolean> {
    try {
      const { data: sectionModule, error } = await this.supabaseService
        .getClient()
        .from('section_modules')
        .select('visible')
        .eq('section_id', sectionId)
        .eq('module_id', moduleId)
        .single();

      if (error || !sectionModule) {
        return false;
      }

      return sectionModule.visible;
    } catch (error) {
      this.logger.error('Error checking section module authorization:', error);
      return false;
    }
  }

  /**
   * Check if user is admin
   */
  async isAdmin(userId: string): Promise<boolean> {
    try {
      const { data: user, error } = await this.supabaseService
        .getClient()
        .from('users')
        .select(
          `
          roles!inner(name)
        `,
        )
        .eq('id', userId)
        .eq('roles.name', 'Admin')
        .single();

      return !error && !!user;
    } catch (error) {
      this.logger.error('Error checking admin status:', error);
      return false;
    }
  }
}
