import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Schedule } from './entities/schedule.entity';
import { StudentSchedule } from './entities/student-schedule.entity';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { BulkCreateSchedulesDto } from './dto/bulk-create-schedules.dto';
import { AssignStudentsDto } from './dto/assign-students.dto';
import { ConflictCheckDto } from './dto/conflict-check.dto';
import { SearchSchedulesDto } from './dto/search-schedules.dto';

@Injectable()
export class SchedulesService {
  private readonly logger = new Logger(SchedulesService.name);
  private readonly CACHE_TTL = 300; // 5 minutes
  private readonly DETAILED_CACHE_TTL = 600; // 10 minutes
  private readonly SEARCH_CACHE_TTL = 180; // 3 minutes
  private supabase: SupabaseClient;

  constructor(
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

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

  async create(dto: CreateScheduleDto): Promise<Schedule> {
    const supabase = this.getSupabaseClient();

    try {
      // Validate foreign keys
      await this.validateForeignKeys(dto);

      // Check for conflicts
      await this.checkConflicts(dto);

      // Map grading period to semester for backwards compatibility
      // Q1, Q2 → 1st semester; Q3, Q4 → 2nd semester
      const semester = dto.gradingPeriod
        ? (dto.gradingPeriod === 'Q1' || dto.gradingPeriod === 'Q2') ? '1st' : '2nd'
        : '1st'; // Default to 1st semester if not provided

      const { data, error } = await supabase
        .from('schedules')
        .insert({
          subject_id: dto.subjectId,
          teacher_id: dto.teacherId,
          section_id: dto.sectionId,
          room_id: dto.roomId,
          building_id: dto.buildingId,
          day_of_week: dto.dayOfWeek,
          start_time: dto.startTime,
          end_time: dto.endTime,
          school_year: dto.schoolYear,
          semester: semester,
          grading_period: dto.gradingPeriod,
        })
        .select()
        .single();

      if (error) {
        this.logger.error('Error creating schedule:', error);
        throw new InternalServerErrorException(
          `Failed to create schedule: ${error.message}`,
        );
      }

      // Audit log
      await this.logAudit({ action: 'create', scheduleId: (data as any)?.id, actorUserId: null, before: null, after: data, changedFields: null })

      // Invalidate related caches
      await this.invalidateRelatedCaches(dto);

      this.logger.log(`Schedule created successfully: ${data.id}`);
      return data;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error('Error creating schedule:', error);
      throw new InternalServerErrorException('Failed to create schedule');
    }
  }

  async bulkCreate(dto: BulkCreateSchedulesDto): Promise<Schedule[]> {
    const supabase = this.getSupabaseClient();
    const results: Schedule[] = [];
    const errors: any[] = [];

    try {
      for (const scheduleDto of dto.schedules) {
        try {
          const schedule = await this.create(scheduleDto);
          results.push(schedule);
        } catch (error) {
          errors.push({
            schedule: scheduleDto,
            error: error.message,
          });
        }
      }

      this.logger.log(
        `Bulk create completed: ${results.length} successful, ${errors.length} failed`,
      );

      return results;
    } catch (error) {
      this.logger.error('Error in bulk create:', error);
      throw new InternalServerErrorException('Failed to bulk create schedules');
    }
  }

  async findAll(filters: any) {
    try {
      console.log('FindAll schedules query:', JSON.stringify(filters));

      const cacheKey = `schedules:all:${JSON.stringify(filters)}`;

      const supabase = this.getSupabaseClient();
      const {
        page = 1,
        limit = 10,
        sectionId,
        teacherId,
        dayOfWeek,
        schoolYear,
        semester,
        search,
      } = filters;

      let query = supabase.from('schedules').select(
        `
      id,
      subject_id,
      teacher_id,
      section_id,
      room_id,
      building_id,
      day_of_week,
      start_time,
      end_time,
      school_year,
      semester,
      status,
      is_published,
      published_at,
      recurring_rule,
      version,
      created_at,
      updated_at,
      subject:subjects(
        id,
        subject_name,
        description,
        grade_level,
        color_hex
      ),
      teacher:teachers(
        id,
        first_name,
        last_name,
        middle_name,
        user:users(
          id,
          full_name,
          email
        )
      ),
      section:sections(
        id,
        name,
        grade_level,
        teacher_id
      ),
      room:rooms(
        id,
        room_number,
        name,
        capacity,
        floor_id,
        floor:floors(
          id,
          number,
          building:buildings(
            id,
            building_name
          )
        )
      )
    `,
        { count: 'exact' },
      );

      // Apply filters
      if (sectionId) {
        query = query.eq('section_id', sectionId);
      }
      if (teacherId) {
        query = query.eq('teacher_id', teacherId);
      }
      if (dayOfWeek) {
        query = query.eq('day_of_week', dayOfWeek);
      }
      if (schoolYear) {
        query = query.eq('school_year', schoolYear);
      }
      if (semester) {
        query = query.eq('semester', semester);
      }
      if ((filters as any).status) {
        query = query.eq('status', (filters as any).status);
      }
      if (search) {
        query = query.or(
          `teacher.first_name.ilike.%${search}%,teacher.last_name.ilike.%${search}%,subject.subject_name.ilike.%${search}%,section.name.ilike.%${search}%`,
        );
      }

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit - 1;

      const { data, error, count } = await query.range(startIndex, endIndex);

      if (error) {
        console.error('Supabase error in findAll:', error);
        this.logger.error('Error fetching schedules:', error);
        throw new InternalServerErrorException(
          `Failed to fetch schedules: ${error.message}`,
        );
      }

      console.log(
        'FindAll schedules success. Count:',
        count,
        'Data length:',
        data?.length,
      );

      // Transform the data
      const transformedData =
        data?.map((schedule: any) => ({
          id: schedule.id,
          subjectId: schedule.subject_id,
          teacherId: schedule.teacher_id,
          sectionId: schedule.section_id,
          roomId: schedule.room_id,
          buildingId: schedule.building_id,
          dayOfWeek: schedule.day_of_week,
          startTime: schedule.start_time,
          endTime: schedule.end_time,
          schoolYear: schedule.school_year,
          semester: schedule.semester,
          createdAt: schedule.created_at,
          updatedAt: schedule.updated_at,
          subject: schedule.subject
            ? {
                id: schedule.subject.id,
                subjectName: schedule.subject.subject_name,
                description: schedule.subject.description,
                gradeLevel: schedule.subject.grade_level,
                colorHex: schedule.subject.color_hex,
              }
            : undefined,
          teacher: schedule.teacher
            ? {
                id: schedule.teacher.id,
                firstName: schedule.teacher.first_name,
                lastName: schedule.teacher.last_name,
                middleName: schedule.teacher.middle_name,
                user: schedule.teacher.user
                  ? {
                      id: schedule.teacher.user.id,
                      fullName: schedule.teacher.user.full_name,
                      email: schedule.teacher.user.email,
                    }
                  : undefined,
              }
            : undefined,
          section: schedule.section
            ? {
                id: schedule.section.id,
                name: schedule.section.name,
                gradeLevel: schedule.section.grade_level,
                teacherId: schedule.section.teacher_id,
              }
            : undefined,
          room: schedule.room
            ? {
                id: schedule.room.id,
                roomNumber: schedule.room.room_number,
                capacity: schedule.room.capacity,
                floorId: schedule.room.floor_id,
                floor: schedule.room.floor
                  ? {
                      id: schedule.room.floor.id,
                      floorNumber: schedule.room.floor.number,
                      building: schedule.room.floor.building
                        ? {
                            id: schedule.room.floor.building.id,
                            name: schedule.room.floor.building.building_name,
                          }
                        : undefined,
                    }
                  : undefined,
              }
            : undefined,
          building: schedule.room?.floor?.building
            ? {
                id: schedule.room.floor.building.id,
                buildingName: schedule.room.floor.building.building_name,
              }
            : undefined,
        })) || [];

      const pagination = {
        total: count,
        page,
        limit,
        pages: Math.ceil((count || 0) / limit),
      };

      // Cache the result
      await this.cacheManager.set(
        cacheKey,
        { data: transformedData, pagination },
        this.CACHE_TTL,
      );

      console.log('FindAll schedules completed successfully. Returning data.');
      return { data: transformedData, pagination };
    } catch (error) {
      console.error('Error in findAll schedules:', error);
      this.logger.error('Error in findAll schedules:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<Schedule> {
    const cacheKey = `schedule:${id}`;

    try {
      const cached = await this.cacheManager.get<Schedule>(cacheKey);
      if (cached) {
        this.logger.log(`Cache hit for schedule: ${id}`);
        return cached;
      }

      this.logger.log(`Cache miss for schedule: ${id}`);

      const supabase = this.getSupabaseClient();
      const { data, error } = await supabase
        .from('schedules')
        .select(
          `
        *,
        subject:subjects(*),
        teacher:teachers(*),
        section:sections(*),
        room:rooms(
          *,
          floor:floors(
            *,
            building:buildings(*)
          )
        ),
        building:buildings(*)
      `,
        )
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new NotFoundException('Schedule not found');
        }
        this.logger.error('Error fetching schedule:', error);
        throw new InternalServerErrorException('Failed to fetch schedule');
      }

      // Cache the result
      await this.cacheManager.set(cacheKey, data, this.CACHE_TTL);

      return data;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error fetching schedule:', error);
      throw new InternalServerErrorException('Failed to fetch schedule');
    }
  }

  async update(id: string, dto: UpdateScheduleDto): Promise<Schedule> {
    const supabase = this.getSupabaseClient();
    const cacheKey = `schedule:${id}`;

    try {
      // Check if schedule exists
      await this.findOne(id);

      const updateData: any = {};
      if (dto.subjectId !== undefined) updateData.subject_id = dto.subjectId;
      if (dto.teacherId !== undefined) updateData.teacher_id = dto.teacherId;
      if (dto.sectionId !== undefined) updateData.section_id = dto.sectionId;
      if (dto.roomId !== undefined) updateData.room_id = dto.roomId;
      if (dto.buildingId !== undefined) updateData.building_id = dto.buildingId;
      if (dto.dayOfWeek !== undefined) updateData.day_of_week = dto.dayOfWeek;
      if (dto.startTime !== undefined) updateData.start_time = dto.startTime;
      if (dto.endTime !== undefined) updateData.end_time = dto.endTime;
      if (dto.schoolYear !== undefined) updateData.school_year = dto.schoolYear;

      // Handle grading period and auto-map to semester
      if (dto.gradingPeriod !== undefined) {
        updateData.grading_period = dto.gradingPeriod;
        // Auto-map grading period to semester if semester not explicitly provided
        if (dto.semester === undefined) {
          updateData.semester = (dto.gradingPeriod === 'Q1' || dto.gradingPeriod === 'Q2') ? '1st' : '2nd';
        }
      }

      if (dto.semester !== undefined) updateData.semester = dto.semester;

      // before snapshot
      const before = await this.findOne(id).catch(()=>null)

      const { data, error } = await supabase
        .from('schedules')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        this.logger.error('Error updating schedule:', error);
        throw new InternalServerErrorException('Failed to update schedule');
      }

      // Audit log
      await this.logAudit({ action: 'update', scheduleId: id, actorUserId: null, before, after: data, changedFields: updateData })

      // Invalidate cache
      await this.cacheManager.del(cacheKey);

      return data;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error updating schedule:', error);
      throw new InternalServerErrorException('Failed to update schedule');
    }
  }

  async remove(id: string): Promise<void> {
    const supabase = this.getSupabaseClient();

    try {
      // Check if schedule exists
      await this.findOne(id);

      // before snapshot
      const before = await this.findOne(id).catch(()=>null)

      const { error } = await supabase.from('schedules').delete().eq('id', id);

      if (error) {
        this.logger.error('Error deleting schedule:', error);
        throw new InternalServerErrorException('Failed to delete schedule');
      }

      // Audit log
      await this.logAudit({ action: 'delete', scheduleId: id, actorUserId: null, before, after: null, changedFields: null })

      // Invalidate cache
      await this.cacheManager.del(`schedule:${id}`);

      this.logger.log(`Schedule deleted successfully: ${id}`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error deleting schedule:', error);
      throw new InternalServerErrorException('Failed to delete schedule');
    }
  }

  async assignStudents(
    scheduleId: string,
    dto: AssignStudentsDto,
  ): Promise<void> {
    const supabase = this.getSupabaseClient();

    try {
      // Check if schedule exists
      await this.findOne(scheduleId);

      // Validate students belong to the schedule's section
      const schedule = await this.findOne(scheduleId);
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id, section_id')
        .in('id', dto.studentIds);

      if (studentsError) {
        this.logger.error('Error validating students:', studentsError);
        throw new InternalServerErrorException('Failed to validate students');
      }

      const invalidStudents =
        students?.filter(
          (student) => student.section_id !== schedule.sectionId,
        ) || [];

      if (invalidStudents.length > 0) {
        throw new BadRequestException(
          `${invalidStudents.length} students do not belong to the schedule's section`,
        );
      }

      // Create student-schedule assignments
      const assignments = dto.studentIds.map((studentId) => ({
        schedule_id: scheduleId,
        student_id: studentId,
      }));

      const { error } = await supabase
        .from('student_schedule')
        .insert(assignments);

      if (error) {
        this.logger.error('Error assigning students:', error);
        throw new InternalServerErrorException('Failed to assign students');
      }

      // Invalidate cache
      await this.cacheManager.del(`schedule:${scheduleId}`);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Unexpected error assigning students:', error);
      throw new InternalServerErrorException('Failed to assign students');
    }
  }

  async removeStudents(
    scheduleId: string,
    studentIds: string[],
  ): Promise<void> {
    const supabase = this.getSupabaseClient();

    try {
      // Check if schedule exists
      await this.findOne(scheduleId);

      const { error } = await supabase
        .from('student_schedule')
        .delete()
        .eq('schedule_id', scheduleId)
        .in('student_id', studentIds);

      if (error) {
        this.logger.error('Error removing students:', error);
        throw new InternalServerErrorException('Failed to remove students');
      }

      // Invalidate cache
      await this.cacheManager.del(`schedule:${scheduleId}`);
    } catch (error) {
      this.logger.error('Error removing students:', error);
      throw new InternalServerErrorException('Failed to remove students');
    }
  }

  async getStudentSchedule(studentId: string): Promise<Schedule[]> {
    const cacheKey = `schedules:student:${studentId}`;

    try {
      const cached = await this.cacheManager.get<Schedule[]>(cacheKey);
      if (cached) {
        this.logger.log(`Cache hit for student schedules: ${studentId}`);
        return cached;
      }

      this.logger.log(`Cache miss for student schedules: ${studentId}`);

      const supabase = this.getSupabaseClient();

      // First, get the student's section_id
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('section_id')
        .eq('id', studentId)
        .single();

      if (studentError || !student) {
        this.logger.error('Error fetching student:', studentError);
        throw new NotFoundException('Student not found');
      }

      if (!student.section_id) {
        this.logger.warn(`Student ${studentId} has no section assigned`);
        return [];
      }

      // Get all schedules for the student's section
      const { data, error } = await supabase
        .from('schedules')
        .select(
          `
          *,
          subject:subjects(*),
          teacher:teachers(
            *,
            user:users(
              id,
              full_name,
              email
            )
          ),
          section:sections(*),
          room:rooms(
            *,
            floor:floors(
              *,
              building:buildings(*)
            )
          ),
          building:buildings(*)
        `,
        )
        .eq('section_id', student.section_id)
        .eq('status', 'published') // Only show published schedules
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) {
        this.logger.error('Error fetching student schedules:', error);
        throw new InternalServerErrorException(
          'Failed to fetch student schedules',
        );
      }

      const schedules =
        data?.map((item: any) => ({
          id: item.id,
          subjectId: item.subject_id,
          teacherId: item.teacher_id,
          sectionId: item.section_id,
          roomId: item.room_id,
          buildingId: item.building_id,
          dayOfWeek: item.day_of_week,
          startTime: item.start_time,
          endTime: item.end_time,
          schoolYear: item.school_year,
          semester: item.semester,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          subject: item.subject,
          teacher: item.teacher,
          section: item.section,
          room: item.room,
          building: item.building,
        })) || [];

      // Cache the result
      await this.cacheManager.set(cacheKey, schedules, this.DETAILED_CACHE_TTL);

      this.logger.log(`Found ${schedules.length} schedules for student ${studentId} in section ${student.section_id}`);
      return schedules;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error fetching student schedules:', error);
      throw new InternalServerErrorException(
        'Failed to fetch student schedules',
      );
    }
  }

  async validateScheduleConflicts(dto: ConflictCheckDto): Promise<{
    hasConflicts: boolean;
    conflicts: any[];
  }> {
    const supabase = this.getSupabaseClient();

    try {
      const conflicts = await this.checkConflictsForValidation(dto);

      return {
        hasConflicts: conflicts.length > 0,
        conflicts,
      };
    } catch (error) {
      this.logger.error('Error validating schedule conflicts:', error);
      throw new InternalServerErrorException('Failed to validate conflicts');
    }
  }

  private async validateForeignKeys(dto: CreateScheduleDto): Promise<void> {
    const supabase = this.getSupabaseClient();

    // Validate subject exists
    if (dto.subjectId) {
      const { data: subject, error: subjectError } = await supabase
        .from('subjects')
        .select('id')
        .eq('id', dto.subjectId)
        .single();

      if (subjectError || !subject) {
        throw new BadRequestException('Invalid subject ID');
      }
    }

    // Validate teacher exists
    if (dto.teacherId) {
      const { data: teacher, error: teacherError } = await supabase
        .from('teachers')
        .select('id')
        .eq('id', dto.teacherId)
        .single();

      if (teacherError || !teacher) {
        throw new BadRequestException('Invalid teacher ID');
      }
    }

    // Validate section exists
    if (dto.sectionId) {
      const { data: section, error: sectionError } = await supabase
        .from('sections')
        .select('id')
        .eq('id', dto.sectionId)
        .single();

      if (sectionError || !section) {
        throw new BadRequestException('Invalid section ID');
      }
    }

    // Validate room exists
    if (dto.roomId) {
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('id')
        .eq('id', dto.roomId)
        .single();

      if (roomError || !room) {
        throw new BadRequestException('Invalid room ID');
      }
    }
  }

  private async checkConflicts(
    dto: CreateScheduleDto,
    excludeId?: string,
  ): Promise<any[]> {
    const supabase = this.getSupabaseClient();

    try {
      const { data, error } = await supabase.rpc('check_schedule_conflicts', {
        p_teacher_id: dto.teacherId,
        p_room_id: dto.roomId,
        p_section_id: dto.sectionId,
        p_day_of_week: dto.dayOfWeek,
        p_start_time: dto.startTime,
        p_end_time: dto.endTime,
        p_exclude_schedule_id: excludeId || null,
      });

      if (error) {
        this.logger.error('Error checking conflicts:', error);
        throw new InternalServerErrorException('Failed to check conflicts');
      }

      return data || [];
    } catch (error) {
      this.logger.error('Error checking conflicts:', error);
      throw new InternalServerErrorException('Failed to check conflicts');
    }
  }

  private async checkConflictsForValidation(
    dto: ConflictCheckDto,
  ): Promise<any[]> {
    const supabase = this.getSupabaseClient();

    try {
      const { data, error } = await supabase.rpc('check_schedule_conflicts', {
        p_teacher_id: dto.teacherId,
        p_room_id: dto.roomId,
        p_section_id: dto.sectionId,
        p_day_of_week: dto.dayOfWeek,
        p_start_time: dto.startTime,
        p_end_time: dto.endTime,
        p_exclude_schedule_id: dto.excludeScheduleId || null,
      });

      if (error) {
        this.logger.error('Error checking conflicts for validation:', error);
        throw new InternalServerErrorException('Failed to check conflicts');
      }

      return data || [];
    } catch (error) {
      this.logger.error('Error checking conflicts for validation:', error);
      throw new InternalServerErrorException('Failed to check conflicts');
    }
  }

  private async invalidateRelatedCaches(dto: CreateScheduleDto): Promise<void> {
    // Clear specific cache keys that we know exist
    const keysToDelete = [
      `schedules:all:${dto.sectionId}`,
      `schedules:section:${dto.sectionId}`,
      `schedules:teacher:${dto.teacherId}`,
    ];

    await Promise.all(keysToDelete.map((key) => this.cacheManager.del(key)));
  }

  private async invalidateAllCaches(): Promise<void> {
    // Clear common cache keys - this is a simplified approach
    const commonKeys = [
      'schedules:all:*',
      'schedules:section:*',
      'schedules:teacher:*',
      'schedules:student:*',
    ];

    await Promise.all(commonKeys.map((key) => this.cacheManager.del(key)));
  }

  async getTeacherTodaySchedules(
    teacherId: string,
    dayOfWeek: string,
  ): Promise<Schedule[]> {
    const supabase = this.getSupabaseClient();

    try {
      const cacheKey = `schedules:teacher:today:${teacherId}:${dayOfWeek}`;

      const cached = await this.cacheManager.get<Schedule[]>(cacheKey);
      if (cached) {
        this.logger.log(`Cache hit for teacher today schedules: ${teacherId}`);
        return cached;
      }

      this.logger.log(
        `Fetching today's schedules for teacher: ${teacherId}, day: ${dayOfWeek}`,
      );

      const { data, error } = await supabase
        .from('schedules')
        .select(
          `
        *,
        subject:subjects(*),
        section:sections(*),
        room:rooms(
          *,
          floor:floors(
            *,
            building:buildings(*)
          )
        ),
        building:buildings(*)
      `,
        )
        .eq('teacher_id', teacherId)
        .eq('day_of_week', dayOfWeek)
        .order('start_time', { ascending: true });

      if (error) {
        this.logger.error('Error fetching teacher schedules:', error);
        throw new InternalServerErrorException(
          'Failed to fetch teacher schedules',
        );
      }

      const schedules =
        data?.map((item: any) => ({
          id: item.id,
          subjectId: item.subject_id,
          teacherId: item.teacher_id,
          sectionId: item.section_id,
          roomId: item.room_id,
          buildingId: item.building_id,
          dayOfWeek: item.day_of_week,
          startTime: item.start_time,
          endTime: item.end_time,
          schoolYear: item.school_year,
          semester: item.semester,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          status: item.status,
          is_published: item.is_published,
          published_at: item.published_at,
          recurring_rule: item.recurring_rule,
          version: item.version,
          subject: item.subject,
          section: item.section,
          room: item.room,
        })) || [];

      // Cache the result
      await this.cacheManager.set(cacheKey, schedules, this.CACHE_TTL * 1000);

      this.logger.log(
        `Found ${schedules.length} schedules for teacher ${teacherId} on ${dayOfWeek}`,
      );

      return schedules;
    } catch (error) {
      this.logger.error('Error fetching teacher schedules:', error);
      throw new InternalServerErrorException(
        'Failed to fetch teacher schedules',
      );
    }
  }

  async listTeachersBySubject(subjectId: string): Promise<any[]> {
    const supabase = this.getSupabaseClient();

    const seen = new Set<string>();
    const result: any[] = [];

    // If no subjectId provided, return all teachers
    if (!subjectId) {
      this.logger.log('[listTeachersBySubject] No subjectId provided, fetching all teachers');

      const { data: allTeachers, error: allTeachersError } = await supabase
        .from('teachers')
        .select('id, first_name, last_name, middle_name, user_id')
        .is('deleted_at', null)
        .order('first_name', { ascending: true });

      if (allTeachersError) {
        this.logger.error('[listTeachersBySubject] Error fetching all teachers', allTeachersError);
        return [];
      }

      if (allTeachers) {
        // Get user data for all teachers in one query
        const userIds = allTeachers.map((t: any) => t.user_id).filter(Boolean);
        let userDataMap = new Map<string, any>();

        if (userIds.length > 0) {
          const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, full_name, email')
            .in('id', userIds);

          if (!usersError && users) {
            users.forEach((u: any) => {
              userDataMap.set(u.id, u);
            });
          }
        }

        for (const t of allTeachers) {
          const id = t?.id;
          if (id) {
            const userData = userDataMap.get(t.user_id);
            result.push({
              id,
              first_name: t.first_name,
              last_name: t.last_name,
              middle_name: t.middle_name,
              full_name: userData?.full_name,
              email: userData?.email,
            });
          }
        }
      }

      this.logger.log(`[listTeachersBySubject] Returning ${result.length} total teachers`);
      return result;
    }

    this.logger.log(`[listTeachersBySubject] Looking for teachers for subject: ${subjectId}`);

    // First, get teachers with subject_specialization_id matching the subject
    // This is the primary way to find teachers qualified to teach a subject
    const { data: teachersBySpecialization, error: specializationError } = await supabase
      .from('teachers')
      .select('id, first_name, last_name, middle_name, user_id')
      .eq('subject_specialization_id', subjectId)
      .is('deleted_at', null)
      .order('first_name', { ascending: true });

    if (specializationError) {
      this.logger.error('[listTeachersBySubject] Error fetching teachers by specialization', {
        subjectId,
        error: specializationError,
      });
    } else {
      this.logger.log(
        `[listTeachersBySubject] Found ${teachersBySpecialization?.length || 0} teachers by specialization`,
      );
    }

    if (!specializationError && teachersBySpecialization) {
      // Get user data for all teachers in one query
      const userIds = teachersBySpecialization.map((t: any) => t.user_id).filter(Boolean);
      let userDataMap = new Map<string, any>();

      if (userIds.length > 0) {
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('id, full_name, email')
          .in('id', userIds);

        if (!usersError && users) {
          users.forEach((u: any) => {
            userDataMap.set(u.id, u);
          });
        }
      }

      for (const t of teachersBySpecialization) {
        const id = t?.id;
        if (id && !seen.has(id)) {
          seen.add(id);
          const userData = userDataMap.get(t.user_id);
          result.push({
            id,
            first_name: t.first_name,
            last_name: t.last_name,
            middle_name: t.middle_name,
            full_name: userData?.full_name,
            email: userData?.email,
          });
        }
      }
    }

    // Fallback: Also check teachers who have been scheduled to teach this subject
    // This covers cases where teachers might teach subjects outside their specialization
    const { data: schedulesData, error: schedulesError } = await supabase
      .from('schedules')
      .select('teacher_id')
      .eq('subject_id', subjectId)
      .not('teacher_id', 'is', null);

    if (schedulesError) {
      this.logger.error('[listTeachersBySubject] Error fetching schedules', {
        subjectId,
        error: schedulesError,
      });
    } else {
      this.logger.log(
        `[listTeachersBySubject] Found ${schedulesData?.length || 0} schedules for this subject`,
      );
    }

    if (!schedulesError && schedulesData) {
      const teacherIds = [...new Set(schedulesData.map((s: any) => s.teacher_id).filter(Boolean))];
      
      if (teacherIds.length > 0) {
        const { data: teachersFromSchedules, error: teachersError } = await supabase
          .from('teachers')
          .select('id, first_name, last_name, middle_name, user_id')
          .in('id', teacherIds)
          .is('deleted_at', null);

        if (!teachersError && teachersFromSchedules) {
          // Get user data for these teachers
          const userIds = teachersFromSchedules.map((t: any) => t.user_id).filter(Boolean);
          let userDataMap = new Map<string, any>();

          if (userIds.length > 0) {
            const { data: users, error: usersError } = await supabase
              .from('users')
              .select('id, full_name, email')
              .in('id', userIds);

            if (!usersError && users) {
              users.forEach((u: any) => {
                userDataMap.set(u.id, u);
              });
            }
          }

          for (const t of teachersFromSchedules) {
            const id = t?.id;
            if (id && !seen.has(id)) {
              seen.add(id);
              const userData = userDataMap.get(t.user_id);
              result.push({
                id,
                first_name: t.first_name,
                last_name: t.last_name,
                middle_name: t.middle_name,
                full_name: userData?.full_name,
                email: userData?.email,
              });
            }
          }
        }
      }
    }

    this.logger.log(
      `[listTeachersBySubject] Returning ${result.length} teachers for subject: ${subjectId}`,
    );

    return result;
  }

  /**
   * Admin – publish or unpublish a schedule
   */
  async setPublishState(id: string, publish: boolean): Promise<{ id: string; status: string; is_published: boolean; published_at: string | null }> {
    const supabase = this.getSupabaseClient();

    const updatePayload: any = publish
      ? { status: 'published', is_published: true, published_at: new Date().toISOString() }
      : { status: 'draft', is_published: false, published_at: null };

    const before = await this.findOne(id).catch(()=>null)

    const { data, error } = await supabase
      .from('schedules')
      .update(updatePayload)
      .eq('id', id)
      .select('id,status,is_published,published_at')
      .single();

    if (error) {
      throw new InternalServerErrorException('Failed to update publish state');
    }

    await this.logAudit({ action: publish ? 'publish' : 'unpublish', scheduleId: id, actorUserId: null, before, after: data, changedFields: updatePayload })

    await this.invalidateAllCaches();
    return data as any;
  }

  async getAuditLogs(scheduleId: string): Promise<any[]> {
    const supabase = this.getSupabaseClient();
    const { data, error } = await supabase
      .from('schedules_audit_log')
      .select('id, action, changed_fields, before, after, note, created_at, actor_user_id, actor:users!actor_user_id(id, full_name, email)')
      .eq('schedule_id', scheduleId)
      .order('created_at', { ascending: false })
    if (error) {
      this.logger.error('Failed to fetch audit logs', error)
      return []
    }
    return data || []
  }

  private async logAudit(params: { action: 'create'|'update'|'delete'|'publish'|'unpublish'; scheduleId: string; actorUserId: string | null; before: any; after: any; changedFields: any }) {
    try {
      const supabase = this.getSupabaseClient();
      await supabase.from('schedules_audit_log').insert({
        schedule_id: params.scheduleId,
        actor_user_id: params.actorUserId,
        action: params.action,
        before: params.before || null,
        after: params.after || null,
        changed_fields: params.changedFields || null,
      })
    } catch (e) {
      this.logger.warn('Audit log insert failed', e as any)
    }
  }

  /**
   * Admin – templates CRUD (list/create minimal)
   */
  async listTemplates(): Promise<any[]> {
    const supabase = this.getSupabaseClient();
    const { data, error } = await supabase
      .from('schedule_templates')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      throw new InternalServerErrorException('Failed to fetch schedule templates');
    }
    return data || [];
  }

  async createTemplate(input: { name: string; description?: string; grade_level?: string; payload: any; created_by?: string }): Promise<any> {
    const supabase = this.getSupabaseClient();
    const { data, error } = await supabase
      .from('schedule_templates')
      .insert({
        name: input.name,
        description: input.description ?? null,
        grade_level: input.grade_level ?? null,
        payload: input.payload,
        created_by: input.created_by ?? null,
      })
      .select('*')
      .single();
    if (error) {
      throw new InternalServerErrorException('Failed to create schedule template');
    }
    return data;
  }
}
   