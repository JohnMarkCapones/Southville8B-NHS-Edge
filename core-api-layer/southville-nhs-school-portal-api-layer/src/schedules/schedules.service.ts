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
          semester: dto.semester,
        })
        .select()
        .single();

      if (error) {
        this.logger.error('Error creating schedule:', error);
        throw new InternalServerErrorException(
          `Failed to create schedule: ${error.message}`,
        );
      }

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
                name: schedule.room.floor.building.building_name,
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
        room:rooms(*)
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
      if (dto.semester !== undefined) updateData.semester = dto.semester;

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

      const { error } = await supabase.from('schedules').delete().eq('id', id);

      if (error) {
        this.logger.error('Error deleting schedule:', error);
        throw new InternalServerErrorException('Failed to delete schedule');
      }

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
      const { data, error } = await supabase
        .from('student_schedule')
        .select(
          `
        schedule:schedules(
          *,
          subject:subjects(*),
          teacher:teachers(*),
          section:sections(*),
          room:rooms(*)
        )
      `,
        )
        .eq('student_id', studentId);

      if (error) {
        this.logger.error('Error fetching student schedules:', error);
        throw new InternalServerErrorException('Failed to fetch student schedules');
      }

      const schedules =
        data?.map((item: any) => ({
          id: item.schedule.id,
          subjectId: item.schedule.subject_id,
          teacherId: item.schedule.teacher_id,
          sectionId: item.schedule.section_id,
          roomId: item.schedule.room_id,
          buildingId: item.schedule.building_id,
          dayOfWeek: item.schedule.day_of_week,
          startTime: item.schedule.start_time,
          endTime: item.schedule.end_time,
          schoolYear: item.schedule.school_year,
          semester: item.schedule.semester,
          createdAt: item.schedule.created_at,
          updatedAt: item.schedule.updated_at,
          subject: item.schedule.subject,
          teacher: item.schedule.teacher,
          section: item.schedule.section,
          room: item.schedule.room,
          building: item.schedule.building,
        })) || [];

      // Cache the result
      await this.cacheManager.set(cacheKey, schedules, this.DETAILED_CACHE_TTL);

      return schedules;
    } catch (error) {
      this.logger.error('Error fetching student schedules:', error);
      throw new InternalServerErrorException('Failed to fetch student schedules');
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
        room:rooms(*)
      `,
        )
        .eq('teacher_id', teacherId)
        .eq('day_of_week', dayOfWeek)
        .order('start_time', { ascending: true });

      if (error) {
        this.logger.error('Error fetching teacher schedules:', error);
        throw new InternalServerErrorException('Failed to fetch teacher schedules');
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
      throw new InternalServerErrorException('Failed to fetch teacher schedules');
    }
  }
}
