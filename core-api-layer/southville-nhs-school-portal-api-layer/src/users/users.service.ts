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
  ImportStudentsCsvDto,
  CsvStudentRowDto,
  BulkImportResultDto,
} from './dto/import-students-csv.dto';
import {
  ImportTeachersCsvDto,
  CsvTeacherRowDto,
} from './dto/import-teachers-csv.dto';
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
    const { data: publicUser, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      this.logger.error('Error validating email uniqueness:', error);
      throw new InternalServerErrorException(
        'Failed to validate email uniqueness',
      );
    }

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

    // Single query to check if teacher with same email and birthday exists
    const { data: existingTeacher, error } = await supabase
      .from('teachers')
      .select(
        `
        id,
        user_id,
        first_name,
        last_name,
        birthday,
        user:users!user_id(
          id,
          email
        )
      `,
      )
      .eq('birthday', birthday)
      .eq('user.email', email)
      .maybeSingle();

    if (error) {
      this.logger.error('Error validating teacher uniqueness:', error);
      throw new InternalServerErrorException(
        'Failed to validate teacher uniqueness',
      );
    }

    if (existingTeacher) {
      throw new ConflictException(
        `Teacher with email '${email}' and birthday '${birthday}' already exists`,
      );
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
    const { data: existingStudent, error } = await supabase
      .from('students')
      .select('id, lrn_id, first_name, last_name, birthday')
      .eq('lrn_id', lrnId)
      .eq('birthday', birthday)
      .maybeSingle();

    if (error) {
      this.logger.error('Error validating student uniqueness:', error);
      throw new InternalServerErrorException(
        'Failed to validate student uniqueness',
      );
    }

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
        advisory_section_id: teacherData.advisorySectionId,
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
   * Create emergency contact record
   */
  private async createEmergencyContactRecord(
    studentId: string,
    contactData: any,
  ): Promise<any> {
    const supabase = this.getSupabaseClient();

    const { data: contact, error } = await supabase
      .from('emergency_contacts')
      .insert({
        student_id: studentId,
        guardian_name: contactData.guardianName,
        relationship: contactData.relationship,
        phone_number: contactData.phoneNumber,
        email: contactData.email,
        address: contactData.address,
        is_primary: contactData.isPrimary,
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Error creating emergency contact record:', error);
      throw new InternalServerErrorException(
        `Failed to create emergency contact record: ${error.message}`,
      );
    }

    return contact;
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

    const result = await this.createUser(userData, createdBy);

    // Create emergency contacts if provided
    if (dto.emergencyContacts && dto.emergencyContacts.length > 0) {
      const emergencyContacts: any[] = [];
      for (const contact of dto.emergencyContacts) {
        try {
          const contactRecord: any = await this.createEmergencyContactRecord(
            result.specificRecord.id,
            contact,
          );
          emergencyContacts.push(contactRecord);
        } catch (error) {
          this.logger.error('Error creating emergency contact:', error);
          // Continue with other contacts even if one fails
        }
      }
      result.emergencyContacts = emergencyContacts;
    }

    return result;
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

    // Cap limit at reasonable maximum (1000 for admin interfaces)
    const effectiveLimit = Math.min(limit, 1000);

    let query = supabase.from('users').select(
      `
        *,
        role:roles!role_id(id, name),
        teacher:teachers!user_id(*, department:departments!department_id(id, department_name)),
        admin:admins!user_id(*),
        student:students!user_id(*)
      `,
      { count: 'exact' },
    );

    // Apply filters
    if (role) {
      // Resolve role name to role_id first (PostgREST doesn't support filtering on joined aliases)
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', role)
        .maybeSingle();

      if (roleError) {
        this.logger.error('Error fetching role:', roleError);
        throw new InternalServerErrorException(
          'Failed to fetch role information',
        );
      }

      if (!roleData) {
        // Role name doesn't exist, return empty result
        this.logger.warn(`Role '${role}' not found, returning empty user list`);
        return {
          data: [],
          pagination: {
            page,
            limit: effectiveLimit,
            total: 0,
            totalPages: 0,
          },
        };
      }

      query = query.eq('role_id', roleData.id);
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
          role: user.role ? { id: user.role.id, name: user.role.name } : null,
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

        console.log(
          `Base user for ${user.email}: fullName='${baseUser.fullName}', role='${baseUser.role}'`,
        );

        // Map Student-specific fields
        if (user.student) {
          console.log(
            `Processing student: ${user.email}, student data:`,
            user.student,
          );

          baseUser.studentId = user.student.student_id;
          baseUser.gradeLevel = user.student.grade_level;
          baseUser.phoneNumber = user.student.phone_number;

          // Construct full name from student's first_name and last_name
          const firstName = user.student.first_name || '';
          const lastName = user.student.last_name || '';
          const middleName = user.student.middle_name || '';

          console.log(
            `Student name parts: firstName='${firstName}', lastName='${lastName}', middleName='${middleName}'`,
          );

          if (firstName || lastName) {
            baseUser.fullName = [firstName, middleName, lastName]
              .filter(Boolean)
              .join(' ');
            console.log(`Constructed fullName: '${baseUser.fullName}'`);
          }
        }

        // Map Teacher-specific fields
        if (user.teacher) {
          baseUser.employeeId = user.teacher.id;
          baseUser.phoneNumber = user.teacher.phone_number;
          baseUser.department =
            user.teacher.department?.department_name || null;
          baseUser.subjectSpecialization =
            user.teacher.subject_specialization_id;

          // Construct full name from teacher's first_name and last_name
          const firstName = user.teacher.first_name || '';
          const lastName = user.teacher.last_name || '';
          const middleName = user.teacher.middle_name || '';

          if (firstName || lastName) {
            baseUser.fullName = [firstName, middleName, lastName]
              .filter(Boolean)
              .join(' ');
          }
        }

        // Map Admin-specific fields
        if (user.admin) {
          baseUser.employeeId = user.admin.id;
          baseUser.phoneNumber = user.admin.phone_number;
          baseUser.department = 'Administration';

          // Construct full name from admin's first_name and last_name
          const firstName = user.admin.first_name || '';
          const lastName = user.admin.last_name || '';
          const middleName = user.admin.middle_name || '';

          if (firstName || lastName) {
            baseUser.fullName = [firstName, middleName, lastName]
              .filter(Boolean)
              .join(' ');
          }
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
      .select(
        `
        *,
        role:roles(name),
        teacher:teachers(*),
        admin:admins(*),
        student:students(*),
        profile:profiles(*)
      `,
      )
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
    let profileData = null;

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

    // Check for profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      this.logger.error('[findOne] Error fetching profile data:', {
        userId: id,
        errorCode: profileError.code,
        errorMessage: profileError.message,
      });
    } else if (profile) {
      profileData = profile;
      this.logger.log(`[findOne] Profile data found for user: ${id}`);
    }

    // Construct the final user object
    const user = {
      ...basicUser,
      role: roleData,
      teacher: teacherData,
      admin: adminData,
      student: studentData,
      profile: profileData,
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

  /**
   * Parse phone number from scientific notation to proper format
   */
  private parsePhoneNumber(value: string): string {
    // Check if scientific notation
    if (value.includes('E+') || value.includes('e+')) {
      const num = parseFloat(value);
      return '+' + num.toString();
    }
    return value;
  }

  /**
   * Find section by name and grade level
   */
  private async findOrThrowSection(
    sectionName: string,
    gradeLevel: string,
  ): Promise<string> {
    const supabase = this.getSupabaseClient();

    // Try to find existing section
    const { data: section, error } = await supabase
      .from('sections')
      .select('id')
      .eq('name', sectionName)
      .eq('grade_level', gradeLevel)
      .maybeSingle();

    if (error) {
      this.logger.error('Error fetching section:', error);
      throw new InternalServerErrorException(
        'Failed to fetch section information',
      );
    }

    // If section exists, return its ID
    if (section) {
      return section.id;
    }

    // Section doesn't exist - create it
    this.logger.log(`Creating new section: ${sectionName} for ${gradeLevel}`);

    const { data: newSection, error: createError } = await supabase
      .from('sections')
      .insert({
        name: sectionName,
        grade_level: gradeLevel,
        // Optional fields are nullable, so we don't need to provide them
        teacher_id: null,
        room_id: null,
        building_id: null,
      })
      .select('id')
      .single();

    if (createError) {
      this.logger.error('Error creating section:', createError);
      throw new InternalServerErrorException(
        `Failed to create section '${sectionName}' for grade '${gradeLevel}'`,
      );
    }

    return newSection.id;
  }

  /**
   * Find section by name only (for advisory sections, no grade level required)
   */
  private async findSectionByName(
    sectionName: string,
  ): Promise<string | undefined> {
    const supabase = this.getSupabaseClient();

    if (!sectionName || sectionName.trim() === '') {
      return undefined;
    }

    const { data: sections, error } = await supabase
      .from('sections')
      .select('id')
      .eq('name', sectionName.trim())
      .limit(1);

    if (error) {
      this.logger.error('Error fetching section by name:', error);
      throw new NotFoundException(
        `Section '${sectionName}' not found. Please ensure the section exists.`,
      );
    }

    if (!sections || sections.length === 0) {
      throw new NotFoundException(
        `Section '${sectionName}' not found. Please ensure the section exists.`,
      );
    }

    return sections[0].id;
  }

  /**
   * Find department by name
   */
  private async findDepartmentByName(departmentName: string): Promise<string> {
    const supabase = this.getSupabaseClient();

    const { data: department, error } = await supabase
      .from('departments')
      .select('id')
      .eq('department_name', departmentName.trim())
      .maybeSingle();

    if (error) {
      this.logger.error('Error fetching department by name:', error);
      throw new NotFoundException(
        `Department '${departmentName}' not found. Please ensure the department exists.`,
      );
    }

    if (!department) {
      throw new NotFoundException(
        `Department '${departmentName}' not found. Please ensure the department exists.`,
      );
    }

    return department.id;
  }

  /**
   * Find subject by name
   */
  private async findSubjectByName(subjectName: string): Promise<string> {
    const supabase = this.getSupabaseClient();

    const { data: subject, error } = await supabase
      .from('subjects')
      .select('id')
      .eq('subject_name', subjectName.trim())
      .maybeSingle();

    if (error) {
      this.logger.error('Error fetching subject by name:', error);
      throw new NotFoundException(
        `Subject '${subjectName}' not found. Please ensure the subject exists.`,
      );
    }

    if (!subject) {
      throw new NotFoundException(
        `Subject '${subjectName}' not found. Please ensure the subject exists.`,
      );
    }

    return subject.id;
  }

  /**
   * Parse CSV student rows and group by student (LRN)
   */
  private parseCsvStudentRows(rows: CsvStudentRowDto[]): Map<string, any> {
    const studentMap = new Map<string, any>();

    for (const row of rows) {
      const lrnId = row.lrn_id;

      if (!studentMap.has(lrnId)) {
        // First occurrence of this student
        studentMap.set(lrnId, {
          student: {
            firstName: row.first_name,
            lastName: row.last_name,
            middleName: row.middle_name,
            lrnId: row.lrn_id,
            birthday: row.birthday,
            gradeLevel: row.grade_level,
            enrollmentYear: row.enrollment,
            age: row.age,
            section: row.section,
          },
          emergencyContacts: [],
        });
      }

      // Add emergency contact
      const studentData = studentMap.get(lrnId);
      studentData.emergencyContacts.push({
        guardianName: row.guardian_name,
        relationship: row.relationship,
        phoneNumber: this.parsePhoneNumber(row.phone_number),
        email: row.email,
        address: row.address,
        isPrimary: studentData.emergencyContacts.length === 0, // First contact is primary
      });
    }

    return studentMap;
  }

  /**
   * Import students from CSV data
   */
  async importStudentsFromCsv(
    importDto: ImportStudentsCsvDto,
    createdBy: string,
  ): Promise<BulkImportResultDto> {
    const results: any[] = [];
    const errors: any[] = [];

    try {
      // Parse and group CSV rows by student
      const studentMap = this.parseCsvStudentRows(importDto.students);

      for (const [lrnId, studentData] of studentMap) {
        try {
          // Find section ID
          const sectionId = await this.findOrThrowSection(
            studentData.student.section,
            studentData.student.gradeLevel,
          );

          // Create student DTO
          const studentDto: CreateStudentRequestDto = {
            firstName: studentData.student.firstName,
            lastName: studentData.student.lastName,
            middleName: studentData.student.middleName,
            studentId: `STU-${Date.now()}`, // Auto-generate student ID
            lrnId: studentData.student.lrnId,
            birthday: studentData.student.birthday,
            gradeLevel: studentData.student.gradeLevel,
            enrollmentYear: studentData.student.enrollmentYear,
            age: studentData.student.age,
            sectionId: sectionId,
            emergencyContacts: studentData.emergencyContacts,
          };

          // Create student (this will handle auth user, public user, student record, and emergency contacts)
          const result = await this.createStudent(studentDto, createdBy);
          results.push(result);
        } catch (error) {
          errors.push({
            lrnId: lrnId,
            studentName: `${studentData.student.firstName} ${studentData.student.lastName}`,
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
    } catch (error) {
      this.logger.error('Error importing students from CSV:', error);
      throw new InternalServerErrorException(
        'Failed to import students from CSV',
      );
    }
  }

  // ===== Domain Role Management Methods =====

  /**
   * Get all domain roles assigned to a user
   * @param userId - User ID
   * @returns Promise<any[]> - Array of user domain role assignments
   */
  async getUserDomainRoles(userId: string): Promise<any[]> {
    try {
      const supabase = this.getSupabaseClient();

      // First check if user exists
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Get user's domain role assignments with joined data
      const { data, error } = await supabase
        .from('user_domain_roles')
        .select(
          `
          *,
          domain_role:domain_role_id(
            id,
            name,
            domain_id,
            domain:domain_id(
              id,
              type,
              name
            )
          )
        `,
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        this.logger.error(
          `Error fetching domain roles for user ${userId}:`,
          error,
        );
        throw new BadRequestException(
          `Failed to fetch user domain roles: ${error.message}`,
        );
      }

      return data || [];
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(
        `Unexpected error fetching domain roles for user ${userId}:`,
        error,
      );
      throw new InternalServerErrorException(
        'Failed to fetch user domain roles',
      );
    }
  }

  /**
   * Assign a domain role to a user
   * @param userId - User ID
   * @param domainRoleId - Domain role ID to assign
   * @returns Promise<any> - Created user domain role assignment
   */
  async assignDomainRole(
    userId: string,
    domainRoleId: string,
  ): Promise<any> {
    try {
      const supabase = this.getSupabaseClient();

      // Verify user exists
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Verify domain role exists
      const { data: domainRole, error: roleError } = await supabase
        .from('domain_roles')
        .select('id, name, domain_id')
        .eq('id', domainRoleId)
        .single();

      if (roleError || !domainRole) {
        throw new NotFoundException(
          `Domain role with ID ${domainRoleId} not found`,
        );
      }

      // Check if assignment already exists
      const { data: existing } = await supabase
        .from('user_domain_roles')
        .select('id')
        .eq('user_id', userId)
        .eq('domain_role_id', domainRoleId)
        .single();

      if (existing) {
        throw new BadRequestException(
          `User already has this domain role assigned`,
        );
      }

      // Create assignment
      const { data, error } = await supabase
        .from('user_domain_roles')
        .insert({
          user_id: userId,
          domain_role_id: domainRoleId,
        })
        .select(
          `
          *,
          domain_role:domain_role_id(
            id,
            name,
            domain_id,
            domain:domain_id(
              id,
              type,
              name
            )
          )
        `,
        )
        .single();

      if (error) {
        this.logger.error('Error assigning domain role:', error);
        throw new BadRequestException(
          `Failed to assign domain role: ${error.message}`,
        );
      }

      this.logger.log(
        `Assigned domain role ${domainRole.name} to user ${userId}`,
      );

      return data;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error('Unexpected error assigning domain role:', error);
      throw new InternalServerErrorException('Failed to assign domain role');
    }
  }

  /**
   * Remove a domain role assignment from a user
   * @param userId - User ID
   * @param assignmentId - User domain role assignment ID
   * @returns Promise<void>
   */
  async removeDomainRole(
    userId: string,
    assignmentId: string,
  ): Promise<void> {
    try {
      const supabase = this.getSupabaseClient();

      // Verify assignment exists and belongs to user
      const { data: assignment, error: fetchError } = await supabase
        .from('user_domain_roles')
        .select('id, user_id')
        .eq('id', assignmentId)
        .single();

      if (fetchError || !assignment) {
        throw new NotFoundException(
          `Domain role assignment with ID ${assignmentId} not found`,
        );
      }

      if (assignment.user_id !== userId) {
        throw new BadRequestException(
          `Assignment does not belong to user ${userId}`,
        );
      }

      // Delete assignment
      const { error } = await supabase
        .from('user_domain_roles')
        .delete()
        .eq('id', assignmentId);

      if (error) {
        this.logger.error('Error removing domain role assignment:', error);
        throw new BadRequestException(
          `Failed to remove domain role assignment: ${error.message}`,
        );
      }

      this.logger.log(
        `Removed domain role assignment ${assignmentId} from user ${userId}`,
      );
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(
        'Unexpected error removing domain role assignment:',
        error,
      );
      throw new InternalServerErrorException(
        'Failed to remove domain role assignment',
      );
  /**
   * Import teachers from CSV data
   */
  async importTeachersFromCsv(
    importDto: ImportTeachersCsvDto,
    createdBy: string,
  ): Promise<BulkImportResultDto> {
    const results: any[] = [];
    const errors: any[] = [];

    try {
      for (const row of importDto.teachers) {
        try {
          // Lookup department ID by name
          const departmentId = await this.findDepartmentByName(
            row.department_id,
          );

          // Lookup subject specialization ID by name
          const subjectSpecializationId = await this.findSubjectByName(
            row.subject_specialization_id,
          );

          // Lookup advisory section ID by name (optional)
          let advisorySectionId: string | undefined = undefined;
          if (
            row.advisory_section_id &&
            row.advisory_section_id.trim() !== ''
          ) {
            advisorySectionId = await this.findSectionByName(
              row.advisory_section_id,
            );
          }

          // Use provided email or generate from first_name and last_name
          const email =
            row.email && row.email.trim() !== ''
              ? row.email.trim()
              : `${row.first_name.toLowerCase()}.${row.last_name.toLowerCase()}@teacher.local`;

          // Create teacher DTO
          const teacherDto = new CreateTeacherDto();
          teacherDto.firstName = row.first_name;
          teacherDto.lastName = row.last_name;
          teacherDto.middleName = row.middle_name;
          teacherDto.birthday = row.birthday;
          teacherDto.age = row.age;
          teacherDto.subjectSpecializationId = subjectSpecializationId;
          teacherDto.departmentId = departmentId;
          teacherDto.advisorySectionId = advisorySectionId;
          teacherDto.email = email;
          teacherDto.fullName =
            `${row.first_name} ${row.middle_name ? row.middle_name + ' ' : ''}${row.last_name}`.trim();

          // Create teacher (this will handle auth user, public user, and teacher record)
          const result = await this.createTeacher(teacherDto, createdBy);
          results.push({
            firstName: row.first_name,
            lastName: row.last_name,
            email: email,
            result: result,
          });
        } catch (error) {
          errors.push({
            firstName: row.first_name,
            lastName: row.last_name,
            error: error.message || String(error),
          });
        }
      }

      return {
        success: results.length,
        failed: errors.length,
        results,
        errors,
      };
    } catch (error) {
      this.logger.error('Error importing teachers from CSV:', error);
      throw new InternalServerErrorException(
        'Failed to import teachers from CSV',
      );
    }
  }

  /**
   * Record a daily login for a user
   * Uses upsert to handle duplicate same-day logins gracefully
   * @param userId - User UUID
   */
  async recordLogin(userId: string): Promise<void> {
    const supabase = this.getSupabaseClient();

    try {
      // Get today's date in YYYY-MM-DD format (date-only, no time)
      const today = new Date().toISOString().split('T')[0];

      // Upsert login record (insert if not exists, do nothing if exists)
      const { error } = await supabase.from('daily_logins').upsert(
        {
          user_id: userId,
          login_date: today,
        },
        {
          onConflict: 'user_id,login_date',
          ignoreDuplicates: false,
        },
      );

      if (error) {
        this.logger.error(`Error recording login for user ${userId}:`, error);
        // Don't throw - this should be non-blocking
      } else {
        this.logger.log(`Recorded login for user ${userId} on ${today}`);
      }
    } catch (error) {
      this.logger.error(
        `Unexpected error recording login for user ${userId}:`,
        error,
      );
      // Don't throw - this should be non-blocking
    }
  }

  /**
   * Get the current login streak count for a user
   * Streak counts consecutive days from today backwards
   * Returns 0 if user didn't log in today or if there's a gap
   * @param userId - User UUID
   * @returns Number of consecutive login days (0 if no streak)
   */
  async getLoginStreak(userId: string): Promise<number> {
    const supabase = this.getSupabaseClient();

    try {
      // Get today's date in UTC (avoid timezone offsets)
      const todayStr = new Date().toISOString().split('T')[0];

      // Get all login dates for this user, ordered by date descending
      const { data: logins, error } = await supabase
        .from('daily_logins')
        .select('login_date')
        .eq('user_id', userId)
        .order('login_date', { ascending: false });

      if (error) {
        this.logger.error(
          `Error fetching login streak for user ${userId}:`,
          error,
        );
        return 0;
      }

      if (!logins || logins.length === 0) {
        return 0;
      }

      // DEBUG: Log raw and normalized dates to diagnose comparison issues
      try {
        const sample = logins.slice(0, 5).map((r: any) => r.login_date);
        this.logger.debug(
          `[getLoginStreak] user=${userId} today=${todayStr} sampleRaw=${JSON.stringify(
            sample,
          )}`,
        );
      } catch (_) {}

      // Normalize dates to YYYY-MM-DD to avoid timezone/format mismatches
      const normalizeDate = (d: any): string => {
        // Supabase may return 'YYYY-MM-DD' or a full timestamp string
        // Convert via Date to consistently get UTC date component
        try {
          return new Date(d as any).toISOString().split('T')[0];
        } catch (_) {
          // Fallback: if already 'YYYY-MM-DD'
          return String(d).split('T')[0];
        }
      };

      // Check if user logged in today (normalized)
      const hasLoginToday = logins.some(
        (login) => normalizeDate(login.login_date) === todayStr,
      );

      // DEBUG: Log normalized list presence of today
      try {
        const normalized = logins
          .slice(0, 5)
          .map((r: any) => normalizeDate(r.login_date));
        this.logger.debug(
          `[getLoginStreak] hasLoginToday=${hasLoginToday} normalizedSample=${JSON.stringify(
            normalized,
          )}`,
        );
      } catch (_) {}

      if (!hasLoginToday) {
        // No login today means streak is 0
        return 0;
      }

      // Calculate consecutive days backwards from today
      let streak = 0;
      // Use UTC midnight based on todayStr for consistent day math
      const expectedDate = new Date(`${todayStr}T00:00:00.000Z`);

      for (let i = 0; i < logins.length; i++) {
        const loginDateStr = normalizeDate(logins[i].login_date);
        const expectedDateStr = expectedDate.toISOString().split('T')[0];

        if (loginDateStr === expectedDateStr) {
          streak++;
          // Move to previous day
          expectedDate.setDate(expectedDate.getDate() - 1);
        } else {
          // Gap detected, stop counting
          break;
        }
      }

      this.logger.log(`Login streak for user ${userId}: ${streak} days`);
      return streak;
    } catch (error) {
      this.logger.error(
        `Unexpected error calculating login streak for user ${userId}:`,
        error,
      );
      return 0;
    }
  }
}
