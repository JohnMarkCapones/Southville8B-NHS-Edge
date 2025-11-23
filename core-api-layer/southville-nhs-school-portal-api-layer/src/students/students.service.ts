import {
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student } from './entities/student.entity';
import { CreateEmergencyContactDto } from './dto/create-emergency-contact.dto';
import { UpdateEmergencyContactDto } from './dto/update-emergency-contact.dto';
import { EmergencyContact } from './entities/emergency-contact.entity';
import { CreateStudentRankingDto } from './dto/create-student-ranking.dto';
import * as crypto from 'crypto';
import { UpdateStudentRankingDto } from './dto/update-student-ranking.dto';
import { StudentRanking } from './entities/student-ranking.entity';
import { ActivityMonitoringService } from '../activity-monitoring/activity-monitoring.service';

@Injectable()
export class StudentsService {
  private readonly logger = new Logger(StudentsService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly activityMonitoring: ActivityMonitoringService,
  ) {}

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
    const supabase = this.supabaseService.getServiceClient();

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
    const supabase = this.supabaseService.getServiceClient();
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
   * Get student ID from user ID
   * @param userId - The user ID
   * @returns The student ID
   */
  async getStudentIdByUserId(userId: string): Promise<string> {
    const supabase = this.supabaseService.getServiceClient();

    this.logger.log(`Looking up student for user ID: ${userId}`);

    const { data: student, error } = await supabase
      .from('students')
      .select('id, first_name, last_name, user_id')
      .eq('user_id', userId)
      .single();

    if (error) {
      this.logger.error(
        `Database error when looking up student for user ${userId}:`,
        {
          errorCode: error.code,
          errorMessage: error.message,
          errorDetails: error.details,
          errorHint: error.hint,
        },
      );

      if (error.code === 'PGRST116') {
        // No rows returned - student record doesn't exist
        this.logger.error(
          `No student record found for user ${userId}. User exists in auth but not in students table.`,
        );
        throw new NotFoundException(
          `Student record not found for user ${userId}. Please ensure the user has a corresponding student record.`,
        );
      }

      throw new InternalServerErrorException(
        `Database error: ${error.message}`,
      );
    }

    if (!student) {
      this.logger.error(`Student data is null for user ${userId}`);
      throw new NotFoundException(
        `Student record not found for user ${userId}`,
      );
    }

    this.logger.log(
      `Found student record: ${student.first_name} ${student.last_name} (ID: ${student.id}) for user ${userId}`,
    );
    return student.id;
  }

  /**
   * Create a student record for an existing user
   * This is useful when a user exists in Supabase Auth but doesn't have a student record
   * @param userId - The existing user ID
   * @param studentData - Basic student information
   * @returns The created student record
   */
  async createStudentRecordForExistingUser(
    userId: string,
    studentData: {
      firstName: string;
      lastName: string;
      studentId: string;
      lrnId: string;
      gradeLevel?: string;
      birthday?: string;
    },
  ): Promise<any> {
    try {
      this.logger.log(`Creating student record for existing user: ${userId}`);

      const supabase = this.supabaseService.getServiceClient();

      // Generate a student UUID
      const studentUuid = crypto.randomUUID();

      // Create the student record
      const { data: student, error } = await supabase
        .from('students')
        .insert({
          id: studentUuid,
          user_id: userId,
          first_name: studentData.firstName,
          last_name: studentData.lastName,
          student_id: studentData.studentId,
          lrn_id: studentData.lrnId,
          grade_level: studentData.gradeLevel || 'Grade 10',
          birthday: studentData.birthday,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        this.logger.error(
          `Error creating student record for user ${userId}:`,
          error,
        );
        throw new InternalServerErrorException(
          `Failed to create student record: ${error.message}`,
        );
      }

      this.logger.log(
        `Successfully created student record: ${student.first_name} ${student.last_name} (ID: ${student.id}) for user ${userId}`,
      );
      return student;
    } catch (error) {
      this.logger.error(
        `Error in createStudentRecordForExistingUser for user ${userId}:`,
        error,
      );
      throw error;
    }
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

      const supabase = this.supabaseService.getServiceClient();

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
        // Rollback: Delete auth user by ID
        await supabase.auth.admin.deleteUser(authUser.user.id);
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
        if (authUser?.user?.id) {
          await supabase.auth.admin.deleteUser(authUser.user.id);
          await supabase.from('users').delete().eq('id', authUser.user.id);
        }
        throw new InternalServerErrorException(
          `Failed to create student record: ${studentError.message}`,
        );
      }

      // Step 4: Create emergency contacts if provided
      if (createStudentDto.emergencyContacts?.length) {
        await this.createEmergencyContacts(
          student.id,
          createStudentDto.emergencyContacts,
        );
      }

      // Activity monitoring - notify advisory teacher if student is assigned to a section
      if (createStudentDto.sectionId) {
        try {
          const studentName = `${createStudentDto.firstName} ${createStudentDto.lastName}`;
          await this.activityMonitoring.handleAdvisoryActivity(
            createStudentDto.sectionId,
            'student_added',
            studentName,
            'system',
          );
        } catch (error) {
          this.logger.warn('Failed to handle advisory activity monitoring:', error);
          // Don't fail student creation if monitoring fails
        }
      }

      this.logger.log(`Student created successfully: ${email}`);

      return {
        success: true,
        // Include student_id at top level for audit logging
        student_id: student.student_id,
        id: authUser.user.id,
        email: email,
        fullName: `${createStudentDto.firstName} ${createStudentDto.lastName}`,
        role: 'Student',
        userType: 'student',
        status: 'Active',
        specificRecord: student,
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
    const supabase = this.supabaseService.getServiceClient();
    const {
      page = 1,
      limit = 10,
      search,
      gradeLevel,
      sectionId,
      sortBy = 'student_id',
      sortOrder = 'asc',
    } = filters;

    console.log('[STUDENTS SERVICE] findAll called with filters:', {
      page,
      limit,
      search,
      gradeLevel,
      sectionId,
      sortBy,
      sortOrder,
    });

    let query = supabase.from('students').select(
      `
        *,
        user:users(email, full_name, status, created_at),
        section:sections(name, grade_level)
      `,
      { count: 'exact' },
    );

    // Apply filters
    if (search) {
      console.log('[STUDENTS SERVICE] Applying search filter:', search);
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,student_id.ilike.%${search}%,lrn_id.ilike.%${search}%`,
      );
    }
    if (gradeLevel) {
      console.log('[STUDENTS SERVICE] Applying gradeLevel filter:', gradeLevel);
      query = query.eq('grade_level', gradeLevel);
    }
    if (sectionId) {
      console.log('[STUDENTS SERVICE] Applying sectionId filter:', sectionId);
      query = query.eq('section_id', sectionId);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    console.log('[STUDENTS SERVICE] Query result:', {
      hasData: !!data,
      dataLength: data?.length || 0,
      hasError: !!error,
      errorMessage: error?.message,
      count: count,
    });

    if (error) {
      console.error('[STUDENTS SERVICE] Query error:', error);
      this.logger.error('Error fetching students:', error);
      throw new InternalServerErrorException('Failed to fetch students');
    }

    console.log('[STUDENTS SERVICE] Returning data:', {
      dataLength: data?.length || 0,
      firstStudent: data?.[0] || null,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });

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
    const supabase = this.supabaseService.getServiceClient();

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
    const supabase = this.supabaseService.getServiceClient();

    // Get current student data to detect section changes
    const { data: currentStudent } = await supabase
      .from('students')
      .select('section_id, first_name, last_name')
      .eq('id', id)
      .single();

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

    // Activity monitoring - notify advisory teacher if section changed
    if (
      updateStudentDto.sectionId &&
      currentStudent?.section_id !== updateStudentDto.sectionId
    ) {
      try {
        const studentName = `${currentStudent?.first_name || ''} ${currentStudent?.last_name || ''}`.trim() || 'A student';
        
        // If student was moved from one section to another
        if (currentStudent?.section_id) {
          // Notify old advisory teacher (student removed)
          await this.activityMonitoring.handleAdvisoryActivity(
            currentStudent.section_id,
            'student_removed',
            studentName,
            'system',
          );
        }

        // Notify new advisory teacher (student added)
        await this.activityMonitoring.handleAdvisoryActivity(
          updateStudentDto.sectionId,
          'student_added',
          studentName,
          'system',
        );
      } catch (error) {
        this.logger.warn('Failed to handle advisory activity monitoring:', error);
        // Don't fail student update if monitoring fails
      }
    }

    return student;
  }

  async remove(id: string): Promise<any> {
    const supabase = this.supabaseService.getServiceClient();

    // Get full student data for audit logging
    const { data: student } = await supabase
      .from('students')
      .select('*')
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

    // Return the student for audit logging
    return student;
  }

  // Snake to camel case mapper for emergency contacts
  private mapEmergencyContactDbToDto(dbRecord: any): EmergencyContact {
    return {
      id: dbRecord.id,
      studentId: dbRecord.student_id,
      guardianName: dbRecord.guardian_name,
      relationship: dbRecord.relationship,
      phoneNumber: dbRecord.phone_number,
      email: dbRecord.email,
      address: dbRecord.address,
      isPrimary: dbRecord.is_primary,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at,
    };
  }

  // Create emergency contacts for a student
  private async createEmergencyContacts(
    studentId: string,
    contacts: CreateEmergencyContactDto[],
  ): Promise<void> {
    if (!contacts || contacts.length === 0) return;

    const supabase = this.supabaseService.getServiceClient();

    // Ensure only one primary contact
    let hasPrimary = false;
    const contactsToInsert = contacts.map((contact, index) => {
      let isPrimary = false;
      if (contact.isPrimary && !hasPrimary) {
        isPrimary = true;
        hasPrimary = true;
      } else if (!hasPrimary && index === 0) {
        isPrimary = true;
        hasPrimary = true;
      }

      return {
        student_id: studentId,
        guardian_name: contact.guardianName,
        relationship: contact.relationship,
        phone_number: contact.phoneNumber,
        email: contact.email,
        address: contact.address,
        is_primary: isPrimary,
      };
    });

    const { error } = await supabase
      .from('emergency_contacts')
      .insert(contactsToInsert);

    if (error) {
      this.logger.error('Error creating emergency contacts:', error);
      throw new InternalServerErrorException(
        `Failed to create emergency contacts: ${error.message}`,
      );
    }
  }

  // Get emergency contacts for a student
  async getEmergencyContacts(
    studentUserId: string,
  ): Promise<EmergencyContact[]> {
    const supabase = this.supabaseService.getServiceClient();

    // First resolve students.id from users.id
    const studentId = await this.getStudentIdByUserId(studentUserId);

    const { data: contacts, error } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('student_id', studentId)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) {
      this.logger.error('Error fetching emergency contacts:', error);
      throw new InternalServerErrorException(
        'Failed to fetch emergency contacts',
      );
    }

    return contacts.map((c) => this.mapEmergencyContactDbToDto(c));
  }

  // Add single emergency contact
  async addEmergencyContact(
    studentUserId: string,
    contactDto: CreateEmergencyContactDto,
  ): Promise<EmergencyContact> {
    const supabase = this.supabaseService.getServiceClient();

    // First resolve students.id from users.id
    const studentId = await this.getStudentIdByUserId(studentUserId);

    // If setting as primary, unset other primary contacts
    if (contactDto.isPrimary) {
      await supabase
        .from('emergency_contacts')
        .update({ is_primary: false })
        .eq('student_id', studentId);
    }

    const { data: contact, error } = await supabase
      .from('emergency_contacts')
      .insert({
        student_id: studentId,
        guardian_name: contactDto.guardianName,
        relationship: contactDto.relationship,
        phone_number: contactDto.phoneNumber,
        email: contactDto.email,
        address: contactDto.address,
        is_primary: contactDto.isPrimary || false,
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Error adding emergency contact:', error);
      throw new InternalServerErrorException('Failed to add emergency contact');
    }

    // Optionally ensure at least one primary contact exists
    if (!contactDto.isPrimary) {
      const { data: primaryCheck } = await supabase
        .from('emergency_contacts')
        .select('id')
        .eq('student_id', studentId)
        .eq('is_primary', true)
        .maybeSingle();

      // If no primary contact exists, make this one primary
      if (!primaryCheck && contact) {
        await supabase
          .from('emergency_contacts')
          .update({ is_primary: true })
          .eq('id', contact.id);
        contact.is_primary = true;
      }
    }

    return this.mapEmergencyContactDbToDto(contact);
  }

  // Update emergency contact
  async updateEmergencyContact(
    contactId: string,
    updateDto: UpdateEmergencyContactDto,
  ): Promise<EmergencyContact> {
    const supabase = this.supabaseService.getServiceClient();

    // If setting as primary, unset other primary contacts for this student
    if (updateDto.isPrimary) {
      const { data: existingContact } = await supabase
        .from('emergency_contacts')
        .select('student_id')
        .eq('id', contactId)
        .single();

      if (existingContact) {
        await supabase
          .from('emergency_contacts')
          .update({ is_primary: false })
          .eq('student_id', existingContact.student_id);
      }
    }

    const { data: contact, error } = await supabase
      .from('emergency_contacts')
      .update({
        guardian_name: updateDto.guardianName,
        relationship: updateDto.relationship,
        phone_number: updateDto.phoneNumber,
        email: updateDto.email,
        address: updateDto.address,
        is_primary: updateDto.isPrimary,
        updated_at: new Date().toISOString(),
      })
      .eq('id', contactId)
      .select()
      .single();

    if (error || !contact) {
      this.logger.error('Error updating emergency contact:', error);
      throw new NotFoundException('Emergency contact not found');
    }

    return this.mapEmergencyContactDbToDto(contact);
  }

  // Delete emergency contact
  async deleteEmergencyContact(contactId: string): Promise<void> {
    const supabase = this.supabaseService.getServiceClient();

    const { error } = await supabase
      .from('emergency_contacts')
      .delete()
      .eq('id', contactId);

    if (error) {
      this.logger.error('Error deleting emergency contact:', error);
      throw new InternalServerErrorException(
        'Failed to delete emergency contact',
      );
    }
  }

  // ==================== STUDENT RANKINGS METHODS ====================

  /**
   * Create a new student ranking
   */
  async createRanking(
    createDto: CreateStudentRankingDto,
  ): Promise<StudentRanking> {
    const supabase = this.supabaseService.getServiceClient();

    // Verify student exists and get their current grade level
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, grade_level')
      .eq('id', createDto.studentId)
      .single();

    if (studentError || !student) {
      throw new NotFoundException('Student not found');
    }

    // Validate grade level matches student's current grade
    if (student.grade_level !== createDto.gradeLevel) {
      throw new ConflictException(
        `Student's current grade level (${student.grade_level}) does not match provided grade level (${createDto.gradeLevel})`,
      );
    }

    // Check for duplicate ranking
    const { data: existing } = await supabase
      .from('student_rankings')
      .select('id')
      .eq('student_id', createDto.studentId)
      .eq('grade_level', createDto.gradeLevel)
      .eq('quarter', createDto.quarter)
      .eq('school_year', createDto.schoolYear)
      .single();

    if (existing) {
      throw new ConflictException(
        'Student already has a ranking for this grade level, quarter, and school year',
      );
    }

    // Create the ranking
    const { data, error } = await supabase
      .from('student_rankings')
      .insert({
        student_id: createDto.studentId,
        grade_level: createDto.gradeLevel,
        rank: createDto.rank,
        honor_status: createDto.honorStatus,
        quarter: createDto.quarter,
        school_year: createDto.schoolYear,
      })
      .select(
        `
        *,
        student:students(id, first_name, last_name, student_id, grade_level)
      `,
      )
      .single();

    if (error) {
      this.logger.error('Error creating student ranking:', error);
      throw new InternalServerErrorException(
        'Failed to create student ranking',
      );
    }

    // Auto-sync with students table if this is the latest quarter
    await this.syncStudentRankToMainTable(createDto.studentId);

    this.logger.log(
      `Created ranking for student ${createDto.studentId} - Rank ${createDto.rank}`,
    );
    return data;
  }

  /**
   * Get all student rankings with filters
   */
  async findAllRankings(
    filters: {
      page?: number;
      limit?: number;
      gradeLevel?: string;
      quarter?: string;
      schoolYear?: string;
      topN?: number;
    } = {},
  ): Promise<{
    data: StudentRanking[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const supabase = this.supabaseService.getServiceClient();
    const {
      page = 1,
      limit = 10,
      gradeLevel,
      quarter,
      schoolYear,
      topN = 100,
    } = filters;

    let query = supabase.from('student_rankings').select(
      `
        *,
        student:students(id, first_name, last_name, student_id, grade_level)
      `,
      { count: 'exact' },
    );

    // Apply filters
    if (gradeLevel) {
      query = query.eq('grade_level', gradeLevel);
    }
    if (quarter) {
      query = query.eq('quarter', quarter);
    }
    if (schoolYear) {
      query = query.eq('school_year', schoolYear);
    }

    // Apply top N limit and ordering
    query = query
      .lte('rank', topN)
      .order('rank', { ascending: true })
      .range((page - 1) * limit, page * limit - 1);

    const { data, error, count } = await query;

    if (error) {
      this.logger.error('Error fetching student rankings:', error);
      throw new InternalServerErrorException(
        'Failed to fetch student rankings',
      );
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return {
      data: data || [],
      total: count || 0,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Get a single ranking by ID
   */
  async findRankingById(id: string): Promise<StudentRanking> {
    const supabase = this.supabaseService.getServiceClient();

    const { data, error } = await supabase
      .from('student_rankings')
      .select(
        `
        *,
        student:students(id, first_name, last_name, student_id, grade_level)
      `,
      )
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException('Student ranking not found');
    }

    return data;
  }

  /**
   * Get all rankings for a specific student
   */
  async findRankingsByStudent(studentId: string): Promise<StudentRanking[]> {
    const supabase = this.supabaseService.getServiceClient();

    // Verify student exists
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id')
      .eq('id', studentId)
      .single();

    if (studentError || !student) {
      throw new NotFoundException('Student not found');
    }

    const { data, error } = await supabase
      .from('student_rankings')
      .select(
        `
        *,
        student:students(id, first_name, last_name, student_id, grade_level)
      `,
      )
      .eq('student_id', studentId)
      .order('school_year', { ascending: false })
      .order('quarter', { ascending: false });

    if (error) {
      this.logger.error('Error fetching student rankings:', error);
      throw new InternalServerErrorException(
        'Failed to fetch student rankings',
      );
    }

    return data || [];
  }

  /**
   * Update a student ranking
   */
  async updateRanking(
    id: string,
    updateDto: UpdateStudentRankingDto,
  ): Promise<StudentRanking> {
    const supabase = this.supabaseService.getServiceClient();

    // Get current ranking to check if we need to sync
    const { data: currentRanking, error: currentError } = await supabase
      .from('student_rankings')
      .select('student_id, grade_level, quarter, school_year')
      .eq('id', id)
      .single();

    if (currentError || !currentRanking) {
      throw new NotFoundException('Student ranking not found');
    }

    // If updating student_id, verify the new student exists
    if (updateDto.studentId) {
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('id, grade_level')
        .eq('id', updateDto.studentId)
        .single();

      if (studentError || !student) {
        throw new NotFoundException('Student not found');
      }

      // Validate grade level if provided
      if (
        updateDto.gradeLevel &&
        student.grade_level !== updateDto.gradeLevel
      ) {
        throw new ConflictException(
          `Student's current grade level (${student.grade_level}) does not match provided grade level (${updateDto.gradeLevel})`,
        );
      }
    }

    // Check for duplicate if updating key fields
    if (
      updateDto.studentId ||
      updateDto.gradeLevel ||
      updateDto.quarter ||
      updateDto.schoolYear
    ) {
      const studentId = updateDto.studentId || currentRanking.student_id;
      const gradeLevel = updateDto.gradeLevel || currentRanking.grade_level;
      const quarter = updateDto.quarter || currentRanking.quarter;
      const schoolYear = updateDto.schoolYear || currentRanking.school_year;

      const { data: existing } = await supabase
        .from('student_rankings')
        .select('id')
        .eq('student_id', studentId)
        .eq('grade_level', gradeLevel)
        .eq('quarter', quarter)
        .eq('school_year', schoolYear)
        .neq('id', id)
        .single();

      if (existing) {
        throw new ConflictException(
          'Student already has a ranking for this grade level, quarter, and school year',
        );
      }
    }

    // Update the ranking
    const { data, error } = await supabase
      .from('student_rankings')
      .update({
        ...(updateDto.studentId && { student_id: updateDto.studentId }),
        ...(updateDto.gradeLevel && { grade_level: updateDto.gradeLevel }),
        ...(updateDto.rank && { rank: updateDto.rank }),
        ...(updateDto.honorStatus !== undefined && {
          honor_status: updateDto.honorStatus,
        }),
        ...(updateDto.quarter && { quarter: updateDto.quarter }),
        ...(updateDto.schoolYear && { school_year: updateDto.schoolYear }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(
        `
        *,
        student:students(id, first_name, last_name, student_id, grade_level)
      `,
      )
      .single();

    if (error) {
      this.logger.error('Error updating student ranking:', error);
      throw new InternalServerErrorException(
        'Failed to update student ranking',
      );
    }

    // Auto-sync with students table if this is the latest quarter
    await this.syncStudentRankToMainTable(data.student_id);

    this.logger.log(`Updated ranking ${id} for student ${data.student_id}`);
    return data;
  }

  /**
   * Delete a student ranking
   */
  async deleteRanking(id: string): Promise<void> {
    const supabase = this.supabaseService.getServiceClient();

    // Get ranking info before deletion for logging
    const { data: ranking } = await supabase
      .from('student_rankings')
      .select('student_id, rank')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('student_rankings')
      .delete()
      .eq('id', id);

    if (error) {
      this.logger.error('Error deleting student ranking:', error);
      throw new InternalServerErrorException(
        'Failed to delete student ranking',
      );
    }

    // Re-sync the student's main table if this was their latest ranking
    if (ranking) {
      await this.syncStudentRankToMainTable(ranking.student_id);
    }

    this.logger.log(`Deleted ranking ${id}`);
  }

  /**
   * Sync student's latest ranking to the main students table
   */
  private async syncStudentRankToMainTable(studentId: string): Promise<void> {
    const supabase = this.supabaseService.getServiceClient();

    // Get the latest ranking for this student
    const { data: latestRanking, error } = await supabase
      .from('student_rankings')
      .select('rank, honor_status, quarter, school_year')
      .eq('student_id', studentId)
      .order('school_year', { ascending: false })
      .order('quarter', { ascending: false })
      .limit(1)
      .single();

    if (error || !latestRanking) {
      // No rankings found, clear the fields
      await supabase
        .from('students')
        .update({
          rank: null,
          honor_status: null,
        })
        .eq('id', studentId);
      return;
    }

    // Update the students table with the latest ranking
    const { error: updateError } = await supabase
      .from('students')
      .update({
        rank: latestRanking.rank,
        honor_status: latestRanking.honor_status,
      })
      .eq('id', studentId);

    if (updateError) {
      this.logger.warn(
        `Failed to sync ranking to students table for student ${studentId}:`,
        updateError,
      );
    }
  }
}
