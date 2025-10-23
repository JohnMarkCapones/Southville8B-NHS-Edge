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
  async createUser(userData: CreateUserDto, createdBy: string): Promise<any> {
    let authUserId: string | null = null;
    let publicUserId: string | null = null;

    try {
      // Validate email uniqueness
      await this.validateEmailUniqueness(userData.email);

      // Get role ID
      const roleId = await this.getRoleIdByName(userData.role);
      if (!roleId) {
        throw new BadRequestException(`Role '${userData.role}' does not exist`);
      }

      // Generate secure password
      const password = this.generateSecurePassword();

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

      return {
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
        temporaryPassword: password,
        message: `${userData.userType} created successfully`,
      };
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
          email: bulkUser.data.email || 'unknown',
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

    let query = supabase.from('users').select(
      `
        *,
        role:roles(name),
        teacher:teachers(*, subject_specialization:subjects(*), department:departments(*)),
        admin:admins(*),
        student:students(*)
      `,
      { count: 'exact' },
    );

    // Apply filters
    if (role) {
      // Get role ID from role name first
      const { data: roleData } = await supabase
        .from('roles')
        .select('id')
        .eq('name', role)
        .single();

      if (roleData) {
        query = query.eq('role_id', roleData.id);
      }
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      this.logger.error('Error fetching users:', error);
      throw new InternalServerErrorException('Failed to fetch users');
    }

    return {
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
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

    this.logger.log(
      `[findOne] Basic user found: ${basicUser.email}, Role ID: ${basicUser.role_id || 'NO_ROLE_ID'}`,
    );

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
      this.logger.log(
        `[findOne] Teacher data found: ${teacher.first_name} ${teacher.last_name}`,
      );
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

    // Check for student data (with section join)
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*, sections(*)')
      .eq('user_id', id)
      .single();

    if (studentError && studentError.code !== 'PGRST116') {
      this.logger.error('[findOne] Error fetching student data:', {
        userId: id,
        errorCode: studentError.code,
        errorMessage: studentError.message,
      });
    } else if (student) {
      // If Supabase auto-join didn't work (no FK), manually fetch section
      if (student.section_id && !student.sections) {
        const { data: section, error: sectionError } = await supabase
          .from('sections')
          .select('*')
          .eq('id', student.section_id)
          .single();

        if (!sectionError && section) {
          student.sections = section;
        } else if (sectionError) {
          this.logger.error('[findOne] Error fetching section:', {
            sectionId: student.section_id,
            errorCode: sectionError.code,
            errorMessage: sectionError.message,
          });
        }
      }

      studentData = student;
      this.logger.log(
        `[findOne] Student data found: ${student.first_name} ${student.last_name}`,
      );
    }

    // Construct the final user object
    const user = {
      ...basicUser,
      role: roleData,
      teacher: teacherData,
      admin: adminData,
      student: studentData,
    };

    this.logger.log(
      `[findOne] Final user object constructed for: ${user.email}`,
    );
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

  /**
   * Get user's primary domain role from PBAC system
   * Uses the user_primary_domain_roles view created in database
   * @param userId - User UUID
   * @returns Primary domain role or null if user has no domain roles
   */
  async getUserPrimaryDomainRole(userId: string): Promise<{
    role_name: string;
    domain_type: string;
    domain_name: string;
  } | null> {
    const supabase = this.getSupabaseClient();

    try {
      const { data, error } = await supabase
        .from('user_primary_domain_roles')
        .select('primary_role, domain_type, domain_name')
        .eq('user_id', userId)
        .single();

      if (error) {
        // PGRST116 means no rows found, which is fine (user has no domain roles)
        if (error.code === 'PGRST116') {
          this.logger.debug(`User ${userId} has no domain roles assigned`);
          return null;
        }
        this.logger.error(
          `Error fetching domain role for user ${userId}:`,
          error,
        );
        return null;
      }

      if (!data) {
        return null;
      }

      return {
        role_name: data.primary_role,
        domain_type: data.domain_type,
        domain_name: data.domain_name,
      };
    } catch (error) {
      this.logger.error(
        `Unexpected error getting domain role for user ${userId}:`,
        error,
      );
      return null;
    }
  }

  /**
   * Sync last login timestamp from Supabase Auth to users table
   * This should be called after successful authentication
   * @param userId - User UUID
   */
  async syncLastLogin(userId: string): Promise<void> {
    const supabase = this.getSupabaseClient();

    try {
      // Get last_sign_in_at from Supabase Auth
      const { data: authUser, error: authError } =
        await supabase.auth.admin.getUserById(userId);

      if (authError) {
        this.logger.warn(
          `Could not fetch auth data for user ${userId}: ${authError.message}`,
        );
        return;
      }

      if (!authUser || !authUser.user) {
        this.logger.warn(`No auth user data found for user ${userId}`);
        return;
      }

      const lastSignIn = authUser.user.last_sign_in_at;

      if (lastSignIn) {
        // Update users table with last login timestamp
        const { error: updateError } = await supabase
          .from('users')
          .update({ last_login_at: lastSignIn })
          .eq('id', userId);

        if (updateError) {
          this.logger.error(
            `Error updating last_login_at for user ${userId}:`,
            updateError,
          );
        } else {
          this.logger.log(
            `Synced last login for user ${userId}: ${lastSignIn}`,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Unexpected error syncing last login for user ${userId}:`,
        error,
      );
    }
  }
}
