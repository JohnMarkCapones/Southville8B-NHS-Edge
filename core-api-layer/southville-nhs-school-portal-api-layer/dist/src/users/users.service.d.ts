import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { CreateStudentRequestDto } from './dto/create-student.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BulkCreateUsersDto } from './dto/bulk-create-users.dto';
import { ImportUsersDto } from './dto/import-users.dto';
import { ImportStudentsCsvDto, BulkImportResultDto } from './dto/import-students-csv.dto';
import { UpdateUserStatusDto, SuspendUserDto } from './dto/update-user-status.dto';
import { User } from './entities/user.entity';
export declare class UsersService {
    private configService;
    private readonly logger;
    private supabase;
    constructor(configService: ConfigService);
    private getSupabaseClient;
    private generateSecurePassword;
    private generatePasswordFromBirthday;
    private validateEmailUniqueness;
    private validateTeacherUniqueness;
    private validateStudentUniqueness;
    private getRoleIdByName;
    private createAuthUser;
    private createPublicUser;
    private createTeacherRecord;
    private createAdminRecord;
    private createEmergencyContactRecord;
    private createStudentRecord;
    createUser(userData: CreateUserDto & {
        birthday?: string;
    }, createdBy: string): Promise<any>;
    createTeacher(dto: CreateTeacherDto, createdBy: string): Promise<any>;
    createAdmin(dto: CreateAdminDto, createdBy: string): Promise<any>;
    createStudent(dto: CreateStudentRequestDto, createdBy: string): Promise<any>;
    createBulkUsers(dtos: BulkCreateUsersDto, createdBy: string): Promise<{
        success: number;
        failed: number;
        results: any[];
        errors: any[];
    }>;
    findAll(filters: any): Promise<{
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
    findOne(id: string): Promise<User>;
    update(id: string, dto: UpdateUserDto): Promise<User>;
    remove(id: string): Promise<void>;
    updateUserStatus(id: string, statusDto: UpdateUserStatusDto): Promise<User>;
    suspendUser(id: string, suspendDto: SuspendUserDto): Promise<User>;
    exportUsers(format: string, filters: any): Promise<string>;
    importUsers(importDto: ImportUsersDto): Promise<any>;
    private convertCsvRowToDto;
    private parsePhoneNumber;
    private findOrThrowSection;
    private parseCsvStudentRows;
    importStudentsFromCsv(importDto: ImportStudentsCsvDto, createdBy: string): Promise<BulkImportResultDto>;
}
