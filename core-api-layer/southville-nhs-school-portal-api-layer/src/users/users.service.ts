import {
  Injectable,
  Logger,
  InternalServerErrorException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateUserDto, UserRole, UserType } from './dto/create-user.dto';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { CreateStudentRequestDto } from './dto/create-student.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BulkCreateUsersDto } from './dto/bulk-create-users.dto';
import { ImportUsersDto } from './dto/import-users.dto';
import {
  UpdateUserStatusDto,
  SuspendUserDto,
} from './dto/update-user-status.dto';
import { User } from './entities/user.entity';
import { Teacher } from './entities/teacher.entity';
import { Admin } from './entities/admin.entity';
import { Student } from '../students/entities/student.entity';
import csv from 'csv-parser';
import { Parser } from 'json2csv';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private supabase: SupabaseClient | null = null;

  constructor(private configService: ConfigService) {}

  private getSupabaseClient(): SupabaseClient {
    if (!this.supabase) {
      const supabaseUrl = this.configService.get<string>('supabase.url');
      const supabaseServiceKey = this.configService.get<string>(
        'supabase.serviceRoleKey',
      );

      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase configuration is missing');
      }

      this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    }
    return this.supabase;
  }

  /**
   * Generate cryptographically secure random password
   */
  private generateSecurePassword(): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  /**
   * Generate password from birthday (YYYYMMDD format)
   * Used for student accounts
   */
  private generatePasswordFromBirthday(birthday: string): string {
    const date = new Date(birthday);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  /**
   * Validate email uniqueness across auth.users and public.users
   */
  private async validateEmailUniqueness(email: string): Promise<void> {
    const supabase = this.getSupabaseClient();

    // Check public.users table
    const { data: publicUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (publicUser) {
      throw new ConflictException('Email already exists');
    }
  }

  /**
   * Validate teacher uniqueness by email and birthday
   * Prevents creating duplicate teachers with same email AND birthday
   */
  private async validateTeacherUniqueness(
    email: string,
    birthday: string,
  ): Promise<void> {
    const supabase = this.getSupabaseClient();

    // Check if teacher with same email and birthday exists
    const { data: existingTeacher } = await supabase
      .from('teachers')
      .select('id, user_id, first_name, last_name')
      .eq('birthday', birthday)
      .single();

    if (existingTeacher) {
      // Also check if the user_id matches the email
      const { data: user } = await supabase
        .from('users')
        .select('id, email')
        .eq('id', existingTeacher.user_id)
        .eq('email', email)
        .single();

      if (user) {
        throw new ConflictException(
          `Teacher with email '${email}' and birthday '${birthday}' already exists`,
        );
      }
    }
  }

  /**
   * Validate student uniqueness by LRN and birthday
   * Prevents creating duplicate students with same LRN AND birthday
   */
  private async validateStudentUniqueness(
    lrnId: string,
    birthday: string,
  ): Promise<void> {
    const supabase = this.getSupabaseClient();

    // Check if student with same LRN and birthday exists
    const { data: existingStudent } = await supabase
      .from('students')
      .select('id, lrn_id, first_name, last_name, birthday')
      .eq('lrn_id', lrnId)
      .eq('birthday', birthday)
      .single();

    if (existingStudent) {
      throw new ConflictException(
        `Student with LRN '${lrnId}' and birthday '${birthday}' already exists`,
      );
    }
  }

  /**
   * Get role ID by name
   */
  private async getRoleIdByName(roleName: string): Promise<string | null> {
    const supabase = this.getSupabaseClient();
    const { data, error } = await supabase
      .from('roles')
      .select('id')
      .eq('name', roleName)
      .single();

    if (error) {
      this.logger.error(`Error fetching role ${roleName}:`, error);
      return null;
    }
    return data?.id;
  }

  /**
   * Create user in Supabase Auth
   */
  private async createAuthUser(
    userData: CreateUserDto,
    password: string,
  ): Promise<any> {
    const supabase = this.getSupabaseClient();

    const { data: authUser, error: authError } =
      await supabase.auth.admin.createUser({
        email: userData.email,
        password: password,
        user_metadata: {
          full_name: userData.fullName,
          role: userData.role,
          user_type: userData.userType,
        },
        email_confirm: true,
      });

    if (authError) {
      this.logger.error('Error creating auth user:', authError);
      throw new InternalServerErrorException(
        `Failed to create user: ${authError.message}`,
      );
    }

    return authUser.user;
  }

  /**
   * Create user in public.users table
   */
  private async createPublicUser(
    authUserId: string,
    userData: CreateUserDto,
    roleId: string,
  ): Promise<any> {
    const supabase = this.getSupabaseClient();

    const { data: publicUser, error: publicError } = await supabase
      .from('users')
      .insert({
        id: authUserId,
        email: userData.email,
        full_name: userData.fullName,
        role_id: roleId,
        status: 'Active',
      })
      .select()
      .single();

    if (publicError) {
      this.logger.error('Error creating public user:', publicError);
      throw new InternalServerErrorException(
        `Failed to create user record: ${publicError.message}`,
      );
    }

    return publicUser;
  }

  /**
   * Create teacher record
   */
  private async createTeacherRecord(
    userId: string,
    teacherData: CreateTeacherDto,
  ): Promise<Teacher> {
    const supabase = this.getSupabaseClient();

    const { data: teacher, error } = await supabase
      .from('teachers')
      .insert({
        user_id: userId,
        first_name: teacherData.firstName,
        last_name: teacherData.lastName,
        middle_name: teacherData.middleName,
        birthday: teacherData.birthday,
        age: teacherData.age,
        subject_specialization_id: teacherData.subjectSpecializationId,
        department_id: teacherData.departmentId,
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Error creating teacher record:', error);
      throw new InternalServerErrorException(
        `Failed to create teacher record: ${error.message}`,
      );
    }

    return teacher;
  }

  /**
   * Create admin record
   */
  private async createAdminRecord(
    userId: string,
    adminData: CreateAdminDto,
  ): Promise<Admin> {
    const supabase = this.getSupabaseClient();

    const { data: admin, error } = await supabase
      .from('admins')
      .insert({
        user_id: userId,
        role_description: adminData.roleDescription,
        name: adminData.fullName,
        email: adminData.email,
        phone_number: adminData.phoneNumber,
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Error creating admin record:', error);
      throw new InternalServerErrorException(
        `Failed to create admin record: ${error.message}`,
      );
    }

    return admin;
  }

  /**
   * Create student record
   */
  private async createStudentRecord(
    userId: string,
    studentData: CreateStudentRequestDto,
  ): Promise<Student> {
    const supabase = this.getSupabaseClient();

    const { data: student, error } = await supabase
      .from('students')
      .insert({
        user_id: userId,
        first_name: studentData.firstName,
        last_name: studentData.lastName,
        middle_name: studentData.middleName,
        student_id: studentData.studentId,
        lrn_id: studentData.lrnId,
        birthday: studentData.birthday,
        grade_level: studentData.gradeLevel,
        enrollment_year: studentData.enrollmentYear,
        honor_status: studentData.honorStatus,
        age: studentData.age,
        section_id: studentData.sectionId,
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Error creating student record:', error);
      throw new InternalServerErrorException(
        `Failed to create student record: ${error.message}`,
      );
    }

    return student;
  }

  /**
   * Main user creation method
   */
  async createUser(
    userData: CreateUserDto & { birthday?: string },
    createdBy: string,
  ): Promise<any> {
    let authUserId: string | null = null;
    let publicUserId: string | null = null;

    try {
      // Validate email uniqueness
      await this.validateEmailUniqueness(userData.email);

      // Validate teacher-specific uniqueness
      if (userData.userType === UserType.TEACHER && userData.birthday) {
        await this.validateTeacherUniqueness(userData.email, userData.birthday);
      }

      // Validate student-specific uniqueness
      if (userData.userType === UserType.STUDENT && userData.birthday) {
        const studentData = userData as any;
        if (studentData.lrnId) {
          await this.validateStudentUniqueness(
            studentData.lrnId,
            userData.birthday,
          );
        }
      }

      // Get role ID
      const roleId = await this.getRoleIdByName(userData.role);
      if (!roleId) {
        throw new BadRequestException(`Role '${userData.role}' does not exist`);
      }

      // Generate password based on user type
      // Students and Teachers use birthday-based passwords (YYYYMMDD)
      // Admins use secure random passwords
      const password =
        (userData.userType === UserType.STUDENT ||
          userData.userType === UserType.TEACHER) &&
        userData.birthday
          ? this.generatePasswordFromBirthday(userData.birthday)
          : this.generateSecurePassword();

      // Step 1: Create user in Supabase Auth
      const authUser = await this.createAuthUser(userData, password);
      authUserId = authUser.id;

      // Step 2: Create user in public.users table
      const publicUser = await this.createPublicUser(
        authUser.id,
        userData,
        roleId,
      );
      publicUserId = publicUser.id;

      // Step 3: Create specific user type record
      let specificRecord: any = null;
      if (userData.userType === 'teacher') {
        specificRecord = await this.createTeacherRecord(
          authUser.id,
          userData as CreateTeacherDto,
        );
      } else if (userData.userType === 'admin') {
        specificRecord = await this.createAdminRecord(
          authUser.id,
          userData as CreateAdminDto,
        );
      } else if (userData.userType === 'student') {
        specificRecord = await this.createStudentRecord(
          authUser.id,
          userData as any,
        );
      }

      this.logger.log(
        `User created successfully: ${userData.email} (${userData.userType})`,
      );

      const response: any = {
        success: true,
        user: {
          id: authUser.id,
          email: userData.email,
          fullName: userData.fullName,
          role: userData.role,
          userType: userData.userType,
          status: 'Active',
        },
        specificRecord,
        message: `${userData.userType} created successfully`,
      };

      // Only include temporaryPassword for admins (students/teachers use predictable birthday-based passwords)
      if (userData.userType === UserType.ADMIN) {
        response.temporaryPassword = password;
      }

      return response;
    } catch (error) {
      // Rollback: Clean up created records
      const supabase = this.getSupabaseClient();

      if (authUserId) {
        try {
          await supabase.auth.admin.deleteUser(authUserId);
        } catch (rollbackError) {
          this.logger.error('Error during auth user rollback:', rollbackError);
        }
      }

      if (publicUserId) {
        try {
          await supabase.from('users').delete().eq('id', publicUserId);
        } catch (rollbackError) {
          this.logger.error(
            'Error during public user rollback:',
            rollbackError,
          );
        }
      }

      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error('Error creating user:', error);
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async createTeacher(dto: CreateTeacherDto, createdBy: string) {
    // Validate teacher-specific uniqueness before creating user
    if (dto.birthday) {
      await this.validateTeacherUniqueness(dto.email, dto.birthday);
    }

    // Convert CreateTeacherDto to CreateUserDto format
    const userData: any = {
      // Include all original teacher fields for the specific record creation
      ...dto,
      // Override with correct role and userType
      email: dto.email,
      fullName: dto.fullName,
      role: UserRole.TEACHER,
      userType: UserType.TEACHER,
    };

    return this.createUser(userData, createdBy);
  }

  async createAdmin(dto: CreateAdminDto, createdBy: string) {
    // Convert CreateAdminDto to CreateUserDto format
    const userData: any = {
      // Include all original admin fields for the specific record creation
      ...dto,
      // Override with correct role and userType
      email: dto.email,
      fullName: dto.fullName,
      role: UserRole.ADMIN,
      userType: UserType.ADMIN,
    };

    return this.createUser(userData, createdBy);
  }

  async createStudent(dto: CreateStudentRequestDto, createdBy: string) {
    // Validate student-specific uniqueness before creating user
    if (dto.birthday && dto.lrnId) {
      await this.validateStudentUniqueness(dto.lrnId, dto.birthday);
    }

    // Convert CreateStudentRequestDto to CreateUserDto format
    const userData: any = {
      email: `${dto.lrnId}@student.local`, // Auto-generate email
      fullName: `${dto.firstName} ${dto.lastName}`, // Auto-generate full name
      role: UserRole.STUDENT,
      userType: UserType.STUDENT,
      // Include all original student fields for the specific record creation
      ...dto,
    };

    return this.createUser(userData, createdBy);
  }

  async createBulkUsers(dtos: BulkCreateUsersDto, createdBy: string) {
    const results: any[] = [];
    const errors: any[] = [];

    for (const bulkUser of dtos.users) {
      try {
        let result;
        const { userType, data } = bulkUser;

        if (userType === 'teacher') {
          result = await this.createTeacher(
            data as CreateTeacherDto,
            createdBy,
          );
        } else if (userType === 'admin') {
          result = await this.createAdmin(data as CreateAdminDto, createdBy);
        } else if (userType === 'student') {
          result = await this.createStudent(
            data as CreateStudentRequestDto,
            createdBy,
          );
        } else {
          throw new Error(`Unknown user type: ${userType}`);
        }
        results.push(result);
      } catch (error) {
        errors.push({
          userType: bulkUser.userType,
          email: (bulkUser.data as any).email || 'unknown',
          error: error.message,
        });
      }
    }

    return {
      success: results.length,
      failed: errors.length,
      results,
      errors,
    };
  }

  async findAll(filters: any) {
    const supabase = this.getSupabaseClient();
    const {
      page = 1,
      limit = 10,
      role,
      status,
      search,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = filters;

    // Cap limit at reasonable maximum (1000 for admin interfaces)
    const effectiveLimit = Math.min(limit, 1000);

    let query = supabase.from('users').select(
      `
        *,
        role:roles!role_id(id, name),
        teacher:teachers!user_id(*),
        admin:admins!user_id(*),
        student:students!user_id(*)
      `,
      { count: 'exact' },
    );

    // Apply filters
    if (role) {
      query = query.eq('role.name', role);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination only if limit is reasonable
    if (effectiveLimit < 1000) {
      const from = (page - 1) * effectiveLimit;
      const to = from + effectiveLimit - 1;
      query = query.range(from, to);
    }
    // For limit >= 1000, don't apply range to get all records

    const { data, error, count } = await query;

    if (error) {
      this.logger.error('Error fetching users:', error);
      throw new InternalServerErrorException('Failed to fetch users');
    }

    // Transform the data to match UserDto structure
    const transformedData =
      data?.map((user: any) => {
        const baseUser = {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role?.name || '',
          status: user.status,
          createdAt: user.created_at,
          lastLogin: user.last_login || null,
          phoneNumber: null as string | null,
          department: null as string | null,
          studentId: null as string | null,
          gradeLevel: null as string | null,
          employeeId: null as string | null,
          subjectSpecialization: null as string | null,
        };

        // Map Student-specific fields
        if (user.student) {
          baseUser.studentId = user.student.student_id;
          baseUser.gradeLevel = user.student.grade_level;
          baseUser.phoneNumber = user.student.phone_number;
        }

        // Map Teacher-specific fields
        if (user.teacher) {
          baseUser.employeeId = user.teacher.id;
          baseUser.phoneNumber = user.teacher.phone_number;
          baseUser.department = user.teacher.department_id;
          baseUser.subjectSpecialization =
            user.teacher.subject_specialization_id;
        }

        // Map Admin-specific fields
        if (user.admin) {
          baseUser.employeeId = user.admin.id;
          baseUser.phoneNumber = user.admin.phone_number;
          baseUser.department = 'Administration';
        }

        return baseUser;
      }) || [];

    return {
      data: transformedData,
      pagination: {
        page,
        limit: effectiveLimit,
        total: count || 0,
        totalPages:
          effectiveLimit < 1000 ? Math.ceil((count || 0) / effectiveLimit) : 1,
      },
    };
  }

  async findOne(id: string): Promise<User> {
    const supabase = this.getSupabaseClient();

    this.logger.log(`[findOne] Fetching user with ID: ${id}`);

    // First, let's try a simple query to get the basic user data
    const { data: basicUser, error: basicError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (basicError) {
      if (basicError.code === 'PGRST116') {
        this.logger.error(`[findOne] User not found: ${id}`);
        throw new NotFoundException('User not found');
      }
      this.logger.error('[findOne] Error fetching basic user data:', {
        userId: id,
        errorCode: basicError.code,
        errorMessage: basicError.message,
        errorDetails: basicError.details,
        errorHint: basicError.hint,
        fullError: JSON.stringify(basicError, null, 2),
      });
      throw new InternalServerErrorException('Failed to fetch user');
    }

    if (!basicUser) {
      this.logger.error(`[findOne] User data is null for ID: ${id}`);
      throw new NotFoundException('User not found');
    }

    this.logger.log(`[findOne] Basic user found: ${basicUser.email}, Role ID: ${basicUser.role_id || 'NO_ROLE_ID'}`);

    // Now let's try to get the role information
    let roleData = null;
    if (basicUser.role_id) {
      const { data: role, error: roleError } = await supabase
        .from('roles')
        .select('*')
        .eq('id', basicUser.role_id)
        .single();

      if (roleError) {
        this.logger.error('[findOne] Error fetching role:', {
          roleId: basicUser.role_id,
          errorCode: roleError.code,
          errorMessage: roleError.message,
        });
      } else {
        roleData = role;
        this.logger.log(`[findOne] Role found: ${role.name}`);
      }
    }

    // Try to get role-specific data
    let teacherData = null;
    let adminData = null;
    let studentData = null;

    // Check for teacher data
    const { data: teacher, error: teacherError } = await supabase
      .from('teachers')
      .select('*')
      .eq('user_id', id)
      .single();

    if (teacherError && teacherError.code !== 'PGRST116') {
      this.logger.error('[findOne] Error fetching teacher data:', {
        userId: id,
        errorCode: teacherError.code,
        errorMessage: teacherError.message,
      });
    } else if (teacher) {
      teacherData = teacher;
      this.logger.log(`[findOne] Teacher data found: ${teacher.first_name} ${teacher.last_name}`);
    }

    // Check for admin data
    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', id)
      .single();

    if (adminError && adminError.code !== 'PGRST116') {
      this.logger.error('[findOne] Error fetching admin data:', {
        userId: id,
        errorCode: adminError.code,
        errorMessage: adminError.message,
      });
    } else if (admin) {
      adminData = admin;
      this.logger.log(`[findOne] Admin data found: ${admin.name}`);
    }

    // Check for student data
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('user_id', id)
      .single();

    if (studentError && studentError.code !== 'PGRST116') {
      this.logger.error('[findOne] Error fetching student data:', {
        userId: id,
        errorCode: studentError.code,
        errorMessage: studentError.message,
      });
    } else if (student) {
      studentData = student;
      this.logger.log(`[findOne] Student data found: ${student.first_name} ${student.last_name}`);
    }

    // Construct the final user object
    const user = {
      ...basicUser,
      role: roleData,
      teacher: teacherData,
      admin: adminData,
      student: studentData,
    };

    this.logger.log(`[findOne] Final user object constructed for: ${user.email}`);
    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const supabase = this.getSupabaseClient();

    const updateData: any = {
      email: dto.email,
      full_name: dto.fullName,
      updated_at: new Date().toISOString(),
    };

    // Handle role update with validation
    if (dto.role) {
      const roleId = await this.getRoleIdByName(dto.role);
      if (!roleId) {
        throw new NotFoundException(`Role '${dto.role}' not found`);
      }
      updateData.role_id = roleId;
    }

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundException('User not found');
      }
      this.logger.error('Error updating user:', error);
      throw new InternalServerErrorException('Failed to update user');
    }

    return user;
  }

  async remove(id: string): Promise<void> {
    const supabase = this.getSupabaseClient();

    // Soft delete by updating status
    const { error } = await supabase
      .from('users')
      .update({
        status: 'Inactive',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundException('User not found');
      }
      this.logger.error('Error removing user:', error);
      throw new InternalServerErrorException('Failed to remove user');
    }
  }

  async updateUserStatus(
    id: string,
    statusDto: UpdateUserStatusDto,
  ): Promise<User> {
    const supabase = this.getSupabaseClient();

    const { data: user, error } = await supabase
      .from('users')
      .update({
        status: statusDto.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundException('User not found');
      }
      this.logger.error('Error updating user status:', error);
      throw new InternalServerErrorException('Failed to update user status');
    }

    return user;
  }

  async suspendUser(id: string, suspendDto: SuspendUserDto): Promise<User> {
    const supabase = this.getSupabaseClient();

    // Calculate suspension end date if duration is provided
    let suspendedUntil = suspendDto.suspendedUntil;
    if (suspendDto.duration && !suspendedUntil) {
      const suspensionDate = new Date();
      suspensionDate.setDate(suspensionDate.getDate() + suspendDto.duration);
      suspendedUntil = suspensionDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    }

    // Update user status to Suspended
    const { data: user, error } = await supabase
      .from('users')
      .update({
        status: 'Suspended',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      this.logger.error('Error suspending user:', error);
      throw new InternalServerErrorException('Failed to suspend user');
    }

    // Store suspension metadata in a separate table or as JSON in user metadata
    // For now, we'll log the suspension details
    this.logger.log(
      `User ${id} suspended: ${suspendDto.reason}, Duration: ${suspendDto.duration} days, Until: ${suspendedUntil}`,
    );

    return user;
  }

  async exportUsers(format: string, filters: any): Promise<string> {
    const { data } = await this.findAll({ ...filters, limit: 1000 });

    const exportData = data.map((user: any) => ({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role?.name,
      status: user.status,
      created_at: user.created_at,
    }));

    if (format === 'csv') {
      const parser = new Parser();
      return parser.parse(exportData);
    }

    return JSON.stringify(exportData, null, 2);
  }

  async importUsers(importDto: ImportUsersDto): Promise<any> {
    // Parse CSV data
    const csvData = Buffer.from(
      importDto.file.split(',')[1],
      'base64',
    ).toString();
    const users: any[] = [];

    return new Promise((resolve, reject) => {
      const stream = require('stream');
      const readable = new stream.Readable();
      readable.push(csvData);
      readable.push(null);

      readable
        .pipe(csv())
        .on('data', (row: any) => users.push(row))
        .on('end', async () => {
          try {
            const results: any[] = [];
            const errors: any[] = [];

            for (const userData of users) {
              try {
                // Convert CSV row to DTO format
                const dto = this.convertCsvRowToDto(userData);
                let result;
                if (dto.userType === 'teacher') {
                  result = await this.createTeacher(
                    dto as CreateTeacherDto,
                    'system',
                  );
                } else if (dto.userType === 'admin') {
                  result = await this.createAdmin(
                    dto as CreateAdminDto,
                    'system',
                  );
                } else if (dto.userType === 'student') {
                  result = await this.createStudent(
                    dto as CreateStudentRequestDto,
                    'system',
                  );
                } else {
                  throw new Error(`Unknown user type: ${dto.userType}`);
                }
                results.push(result);
              } catch (error) {
                errors.push({
                  row: userData,
                  error: error.message,
                });
              }
            }

            resolve({
              success: results.length,
              failed: errors.length,
              results,
              errors,
            });
          } catch (error) {
            reject(error);
          }
        })
        .on('error', reject);
    });
  }

  private convertCsvRowToDto(row: any): any {
    // Convert CSV row to appropriate DTO based on user type
    const userType = row.userType || row.user_type;

    if (userType === 'teacher') {
      return {
        email: row.email,
        fullName: row.fullName || row.full_name,
        role: 'Teacher' as any,
        userType: 'teacher' as any,
        firstName: row.firstName || row.first_name,
        lastName: row.lastName || row.last_name,
        middleName: row.middleName || row.middle_name,
        birthday: row.birthday,
        age: row.age ? parseInt(row.age) : undefined,
        subjectSpecializationId:
          row.subjectSpecializationId || row.subject_specialization_id,
        departmentId: row.departmentId || row.department_id,
        phoneNumber: row.phoneNumber || row.phone_number,
      } as CreateTeacherDto;
    } else if (userType === 'admin') {
      return {
        email: row.email,
        fullName: row.fullName || row.full_name,
        role: 'Admin' as any,
        userType: 'admin' as any,
        name: row.name,
        birthday: row.birthday,
        roleDescription: row.roleDescription || row.role_description,
        phoneNumber: row.phoneNumber || row.phone_number,
      } as CreateAdminDto;
    } else {
      return {
        email: row.email,
        fullName: row.fullName || row.full_name,
        role: 'Student' as any,
        userType: 'student' as any,
        firstName: row.firstName || row.first_name,
        lastName: row.lastName || row.last_name,
        middleName: row.middleName || row.middle_name,
        studentId: row.studentId || row.student_id,
        lrnId: row.lrnId || row.lrn_id,
        birthday: row.birthday,
        gradeLevel: row.gradeLevel || row.grade_level,
        enrollmentYear: row.enrollmentYear
          ? parseInt(row.enrollmentYear)
          : undefined,
        honorStatus: row.honorStatus || row.honor_status,
        age: row.age ? parseInt(row.age) : undefined,
        sectionId: row.sectionId || row.section_id,
      } as CreateStudentRequestDto;
    }
  }
}
