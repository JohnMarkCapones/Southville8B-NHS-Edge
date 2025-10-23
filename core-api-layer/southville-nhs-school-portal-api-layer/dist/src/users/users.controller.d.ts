import { SupabaseUser } from '../auth/interfaces/supabase-user.interface';
import { UsersService } from './users.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { CreateStudentRequestDto } from './dto/create-student.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BulkCreateUsersDto } from './dto/bulk-create-users.dto';
import { ImportStudentsCsvDto } from './dto/import-students-csv.dto';
import { UpdateUserStatusDto, SuspendUserDto } from './dto/update-user-status.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    createTeacher(createTeacherDto: CreateTeacherDto, user: SupabaseUser): Promise<any>;
    createAdmin(createAdminDto: CreateAdminDto, user: SupabaseUser): Promise<any>;
    createStudent(createStudentDto: CreateStudentRequestDto, user: SupabaseUser): Promise<any>;
    createBulkUsers(bulkCreateDto: BulkCreateUsersDto, user: SupabaseUser): Promise<{
        success: number;
        failed: number;
        results: any[];
        errors: any[];
    }>;
    importStudentsCsv(importDto: ImportStudentsCsvDto, user: SupabaseUser): Promise<import("./dto/import-students-csv.dto").BulkImportResultDto>;
    findAll(user: SupabaseUser, page?: number, limit?: number, role?: string, status?: string, search?: string, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<{
        data: {
            id: any;
            email: any;
            fullName: any;
            role: any;
            status: any;
            createdAt: any;
            lastLogin: any;
            phoneNumber: string | null;
            department: string | null;
            studentId: string | null;
            gradeLevel: string | null;
            employeeId: string | null;
            subjectSpecialization: string | null;
        }[];
        pagination: {
            page: any;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    exportUsers(user: SupabaseUser, format?: 'csv', role?: string): Promise<string>;
    getCurrentUser(user: SupabaseUser): Promise<import("./entities/user.entity").User>;
    findOne(id: string, user: SupabaseUser): Promise<import("./entities/user.entity").User>;
    update(id: string, updateUserDto: UpdateUserDto, user: SupabaseUser): Promise<import("./entities/user.entity").User>;
    remove(id: string, user: SupabaseUser): Promise<void>;
    updateUserStatus(id: string, statusDto: UpdateUserStatusDto, user: SupabaseUser): Promise<import("./entities/user.entity").User>;
    suspendUser(id: string, suspendDto: SuspendUserDto, user: SupabaseUser): Promise<import("./entities/user.entity").User>;
    getUserProfile(id: string, user: SupabaseUser): Promise<import("./entities/user.entity").User>;
}
