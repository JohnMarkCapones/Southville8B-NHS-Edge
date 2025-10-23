import { SupabaseService } from '../../supabase/supabase.service';
export interface ModuleAccessResult {
    canAccess: boolean;
    reason?: string;
}
export declare class ModuleAccessService {
    private readonly supabaseService;
    private readonly logger;
    constructor(supabaseService: SupabaseService);
    canStudentAccessModule(studentUserId: string, moduleId: string): Promise<ModuleAccessResult>;
    canTeacherAccessModule(teacherUserId: string, moduleId: string): Promise<ModuleAccessResult>;
    getStudentSectionId(studentUserId: string): Promise<string | null>;
    getTeacherSubjectId(teacherUserId: string): Promise<string | null>;
    isSectionAuthorizedForModule(sectionId: string, moduleId: string): Promise<boolean>;
    isAdmin(userId: string): Promise<boolean>;
}
