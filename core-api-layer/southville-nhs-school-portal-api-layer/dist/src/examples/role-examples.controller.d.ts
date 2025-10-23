import { SupabaseUser } from '../auth/interfaces/supabase-user.interface';
import { AuthService } from '../auth/auth.service';
export declare class RoleExamplesController {
    private readonly authService;
    constructor(authService: AuthService);
    adminOnly(user: SupabaseUser): Promise<{
        message: string;
        user: string;
        role: string;
        data: string;
        hierarchyNote: string | undefined;
    }>;
    teacherOnly(user: SupabaseUser): Promise<{
        message: string;
        user: string;
        role: string;
        data: string;
        hierarchyNote: string | undefined;
    }>;
    studentOnly(user: SupabaseUser): Promise<{
        message: string;
        user: string;
        role: string;
        data: string;
        hierarchyNote: string | undefined;
    }>;
    adminTeacher(user: SupabaseUser): Promise<{
        message: string;
        user: string;
        role: string;
        data: string;
        hierarchyNote: string | undefined;
    }>;
    allRoles(user: SupabaseUser): Promise<{
        message: string;
        user: string;
        role: string;
        data: string;
    }>;
    authenticatedOnly(user: SupabaseUser): Promise<{
        message: string;
        user: string;
        role: string;
        data: string;
    }>;
}
