import {
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student } from './entities/student.entity';

@Injectable()
export class StudentsService {
  private readonly logger = new Logger(StudentsService.name);
  private supabase: SupabaseClient | null = null;

  constructor(private configService: ConfigService) {}

  private getSupabaseClient(): SupabaseClient {
    if (!this.supabase) {
      const supabaseUrl = this.configService.get<string>('supabase.url');
      const supabaseServiceKey = this.configService.get<string>(
        'supabase.serviceKey',
      );

      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase configuration is missing');
      }

      this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    }
    return this.supabase;
  }

  /**
   * Generate password from birthday (YYYYMMDD format)
   */
  private generatePasswordFromBirthday(birthday: string): string {
    const date = new Date(birthday);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  /**
   * Validate email uniqueness
   */
  private async validateEmailUniqueness(email: string): Promise<void> {
    const supabase = this.getSupabaseClient();

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

  async create(createStudentDto: CreateStudentDto): Promise<any> {
    try {
      // Set email for student (lrn_id@student.local)
      const email = `${createStudentDto.lrnId}@student.local`;

      // Validate email uniqueness
      await this.validateEmailUniqueness(email);

      // Get role ID
      const roleId = await this.getRoleIdByName('Student');
      if (!roleId) {
        throw new Error('Student role does not exist');
      }

      // Generate password from birthday
      const password = this.generatePasswordFromBirthday(
        createStudentDto.birthday,
      );

      const supabase = this.getSupabaseClient();

      // Step 1: Create user in Supabase Auth
      const { data: authUser, error: authError } =
        await supabase.auth.admin.createUser({
          email: email,
          password: password,
          user_metadata: {
            full_name: `${createStudentDto.firstName} ${createStudentDto.lastName}`,
            role: 'Student',
            user_type: 'student',
          },
          email_confirm: true,
        });

      if (authError) {
        this.logger.error('Error creating auth user:', authError);
        throw new InternalServerErrorException(
          `Failed to create user: ${authError.message}`,
        );
      }

      // Step 2: Create user in public.users table
      const { data: publicUser, error: publicError } = await supabase
        .from('users')
        .insert({
          id: authUser.user.id,
          email: email,
          full_name: `${createStudentDto.firstName} ${createStudentDto.lastName}`,
          role_id: roleId,
          status: 'Active',
        })
        .select()
        .single();

      if (publicError) {
        this.logger.error('Error creating public user:', publicError);
        // Rollback: Delete auth user
        await supabase.auth.admin.deleteUser(email);
        throw new InternalServerErrorException(
          `Failed to create user record: ${publicError.message}`,
        );
      }

      // Step 3: Create student record
      const { data: student, error: studentError } = await supabase
        .from('students')
        .insert({
          user_id: authUser.user.id,
          first_name: createStudentDto.firstName,
          last_name: createStudentDto.lastName,
          middle_name: createStudentDto.middleName,
          student_id: createStudentDto.studentId,
          lrn_id: createStudentDto.lrnId,
          birthday: createStudentDto.birthday,
          grade_level: createStudentDto.gradeLevel,
          enrollment_year: createStudentDto.enrollmentYear,
          honor_status: createStudentDto.honorStatus,
          age: createStudentDto.age,
          section_id: createStudentDto.sectionId,
        })
        .select()
        .single();

      if (studentError) {
        this.logger.error('Error creating student record:', studentError);
        // Rollback: Delete auth user and public user
        await supabase.auth.admin.deleteUser(email);
        await supabase.from('users').delete().eq('id', authUser.user.id);
        throw new InternalServerErrorException(
          `Failed to create student record: ${studentError.message}`,
        );
      }

      this.logger.log(`Student created successfully: ${email}`);

      return {
        success: true,
        user: {
          id: authUser.user.id,
          email: email,
          fullName: `${createStudentDto.firstName} ${createStudentDto.lastName}`,
          role: 'Student',
          userType: 'student',
          status: 'Active',
        },
        student,
        temporaryPassword: password,
        message: 'Student created successfully',
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error('Error creating student:', error);
      throw new InternalServerErrorException('Failed to create student');
    }
  }

  async findAll(filters: any = {}): Promise<any> {
    const supabase = this.getSupabaseClient();
    const {
      page = 1,
      limit = 10,
      search,
      gradeLevel,
      sectionId,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = filters;

    let query = supabase.from('students').select(`
        *,
        user:users(email, full_name, status, created_at),
        section:sections(name, grade_level)
      `);

    // Apply filters
    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,student_id.ilike.%${search}%,lrn_id.ilike.%${search}%`,
      );
    }
    if (gradeLevel) {
      query = query.eq('grade_level', gradeLevel);
    }
    if (sectionId) {
      query = query.eq('section_id', sectionId);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      this.logger.error('Error fetching students:', error);
      throw new InternalServerErrorException('Failed to fetch students');
    }

    return {
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  }

  async findOne(id: string): Promise<Student> {
    const supabase = this.getSupabaseClient();

    const { data: student, error } = await supabase
      .from('students')
      .select(
        `
        *,
        user:users(email, full_name, status, created_at),
        section:sections(name, grade_level)
      `,
      )
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundException('Student not found');
      }
      this.logger.error('Error fetching student:', error);
      throw new InternalServerErrorException('Failed to fetch student');
    }

    return student;
  }

  async update(
    id: string,
    updateStudentDto: UpdateStudentDto,
  ): Promise<Student> {
    const supabase = this.getSupabaseClient();

    const { data: student, error } = await supabase
      .from('students')
      .update({
        first_name: updateStudentDto.firstName,
        last_name: updateStudentDto.lastName,
        middle_name: updateStudentDto.middleName,
        student_id: updateStudentDto.studentId,
        lrn_id: updateStudentDto.lrnId,
        birthday: updateStudentDto.birthday,
        grade_level: updateStudentDto.gradeLevel,
        enrollment_year: updateStudentDto.enrollmentYear,
        honor_status: updateStudentDto.honorStatus,
        age: updateStudentDto.age,
        section_id: updateStudentDto.sectionId,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundException('Student not found');
      }
      this.logger.error('Error updating student:', error);
      throw new InternalServerErrorException('Failed to update student');
    }

    return student;
  }

  async remove(id: string): Promise<void> {
    const supabase = this.getSupabaseClient();

    // Get student to find user_id
    const { data: student } = await supabase
      .from('students')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Soft delete by updating user status
    const { error } = await supabase
      .from('users')
      .update({
        status: 'Inactive',
        updated_at: new Date().toISOString(),
      })
      .eq('id', student.user_id);

    if (error) {
      this.logger.error('Error removing student:', error);
      throw new InternalServerErrorException('Failed to remove student');
    }
  }
}
