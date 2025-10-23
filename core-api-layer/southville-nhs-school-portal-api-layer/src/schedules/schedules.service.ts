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
      // Validate foreign keys exist
      await this.validateForeignKeys(dto);

      // Check for conflicts
      const hasConflicts = await this.checkConflicts(dto);
      if (hasConflicts) {
        throw new ConflictException('Schedule conflicts detected');
      }

      const { data: schedule, error } = await supabase
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
        throw new InternalServerErrorException('Failed to create schedule');
      }

      // Invalidate related caches
      await this.invalidateRelatedCaches(dto);

      return await this.findOne(schedule.id);
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      this.logger.error('Unexpected error creating schedule:', error);
      throw new InternalServerErrorException('Failed to create schedule');
    }
  }

  async bulkCreate(dto: BulkCreateSchedulesDto): Promise<Schedule[]> {
    const supabase = this.getSupabaseClient();

    try {
      // Validate all foreign keys first
      for (const scheduleDto of dto.schedules) {
        await this.validateForeignKeys(scheduleDto);
      }

      // Check for conflicts across all schedules
      const conflictResults = await Promise.all(
        dto.schedules.map((scheduleDto) => this.checkConflicts(scheduleDto)),
      );

      const conflictingSchedules = dto.schedules.filter(
        (_, index) => conflictResults[index],
      );

      if (conflictingSchedules.length > 0) {
        throw new ConflictException(
          `Conflicts detected in ${conflictingSchedules.length} schedules`,
        );
      }

      // Prepare bulk insert data
      const schedulesData = dto.schedules.map((scheduleDto) => ({
        subject_id: scheduleDto.subjectId,
        teacher_id: scheduleDto.teacherId,
        section_id: scheduleDto.sectionId,
        room_id: scheduleDto.roomId,
        building_id: scheduleDto.buildingId,
        day_of_week: scheduleDto.dayOfWeek,
        start_time: scheduleDto.startTime,
        end_time: scheduleDto.endTime,
        school_year: scheduleDto.schoolYear,
        semester: scheduleDto.semester,
      }));

      const { data: schedules, error } = await supabase
        .from('schedules')
        .insert(schedulesData)
        .select();

      if (error) {
        this.logger.error('Error bulk creating schedules:', error);
        throw new InternalServerErrorException(
          'Failed to bulk create schedules',
        );
      }

      // Invalidate all related caches
      await this.invalidateAllCaches();

      // Return schedules with relations
      const schedulesWithRelations = await Promise.all(
        schedules.map((schedule) => this.findOne(schedule.id)),
      );

      return schedulesWithRelations;
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      this.logger.error('Unexpected error bulk creating schedules:', error);
      throw new InternalServerErrorException('Failed to bulk create schedules');
    }
  }

  async findAll(
    filters: SearchSchedulesDto,
  ): Promise<{ data: Schedule[]; pagination: any }> {
    const cacheKey = `schedules:all:${JSON.stringify(filters)}`;

    // Try to get from cache
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      this.logger.log(`Cache hit for ${cacheKey}`);
      return cached as { data: Schedule[]; pagination: any };
    }
    this.logger.log(`Cache miss for ${cacheKey}`);

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
      subject:subjects!inner(id, subject_name, description, grade_level, color_hex),
      teacher:teachers!inner(id, first_name, last_name, middle_name, user:users!inner(id, full_name, email)),
      section:sections!inner(id, name, grade_level, teacher_id),
      room:rooms!inner(
        id,
        room_number,
        capacity,
        floor_id,
        floor:floors(
          id,
          number,
          building:buildings(id, building_name)
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

    // Apply search
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
      this.logger.error('Error fetching schedules:', error);
      throw new InternalServerErrorException('Failed to fetch schedules');
    }

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

    return { data: transformedData, pagination };
  }

  async findOne(id: string): Promise<Schedule> {
    const cacheKey = `schedule:${id}`;

    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      this.logger.log(`Cache hit for ${cacheKey}`);
      return cached as Schedule;
    }
    this.logger.log(`Cache miss for ${cacheKey}`);

    const supabase = this.getSupabaseClient();
    const { data, error } = await supabase
      .from('schedules')
      .select(
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
        subject:subjects!inner(id, subject_name, description, grade_level, color_hex),
        teacher:teachers!inner(id, first_name, last_name, middle_name, user:users!inner(id, full_name, email)),
        section:sections!inner(id, name, grade_level, teacher_id),
        room:rooms!inner(
          id,
          room_number,
          capacity,
          floor_id,
          floor:floors(
            id,
            number,
            building:buildings(id, building_name)
          )
        ),
        students:student_schedule(student:students(id, first_name, last_name, middle_name, student_id, lrn_id, grade_level))
      `,
      )
      .eq('id', id)
      .single();

    if (error) {
      this.logger.error('Error fetching schedule:', error);
      throw new NotFoundException(`Schedule with ID "${id}" not found`);
    }

    const transformedData: Schedule = {
      id: (data as any).id,
      subjectId: (data as any).subject_id,
      teacherId: (data as any).teacher_id,
      sectionId: (data as any).section_id,
      roomId: (data as any).room_id,
      buildingId: (data as any).building_id,
      dayOfWeek: (data as any).day_of_week,
      startTime: (data as any).start_time,
      endTime: (data as any).end_time,
      schoolYear: (data as any).school_year,
      semester: (data as any).semester,
      createdAt: (data as any).created_at,
      updatedAt: (data as any).updated_at,
      subject: (data as any).subject
        ? {
            id: (data as any).subject.id,
            subjectName: (data as any).subject.subject_name,
            description: (data as any).subject.description,
            gradeLevel: (data as any).subject.grade_level,
            colorHex: (data as any).subject.color_hex,
          }
        : undefined,
      teacher: (data as any).teacher
        ? {
            id: (data as any).teacher.id,
            firstName: (data as any).teacher.first_name,
            lastName: (data as any).teacher.last_name,
            middleName: (data as any).teacher.middle_name,
            user: (data as any).teacher.user
              ? {
                  id: (data as any).teacher.user.id,
                  fullName: (data as any).teacher.user.full_name,
                  email: (data as any).teacher.user.email,
                }
              : undefined,
          }
        : undefined,
      section: (data as any).section
        ? {
            id: (data as any).section.id,
            name: (data as any).section.name,
            gradeLevel: (data as any).section.grade_level,
            teacherId: (data as any).section.teacher_id,
          }
        : undefined,
      room: (data as any).room
        ? {
            id: (data as any).room.id,
            roomNumber: (data as any).room.room_number,
            capacity: (data as any).room.capacity,
            floorId: (data as any).room.floor_id,
            floor: (data as any).room.floor
              ? {
                  id: (data as any).room.floor.id,
                  floorNumber: (data as any).room.floor.number,
                  building: (data as any).room.floor.building
                    ? {
                        id: (data as any).room.floor.building.id,
                        name: (data as any).room.floor.building.building_name,
                      }
                    : undefined,
                }
              : undefined,
          }
        : undefined,
      building: (data as any).room?.floor?.building
        ? {
            id: (data as any).room.floor.building.id,
            name: (data as any).room.floor.building.building_name,
          }
        : undefined,
      students: (data as any).students?.map((ss: any) => ss.student),
    };

    await this.cacheManager.set(
      cacheKey,
      transformedData,
      this.DETAILED_CACHE_TTL,
    );

    return transformedData;
  }

  async update(id: string, dto: UpdateScheduleDto): Promise<Schedule> {
    const supabase = this.getSupabaseClient();

    try {
      // Check if schedule exists
      const existing = await this.findOne(id);

      // Validate foreign keys if provided
      if (
        dto.subjectId ||
        dto.teacherId ||
        dto.sectionId ||
        dto.roomId ||
        dto.buildingId
      ) {
        await this.validateForeignKeys(dto as CreateScheduleDto);
      }

      // Check for conflicts if time-related fields are being updated
      if (
        dto.startTime ||
        dto.endTime ||
        dto.dayOfWeek ||
        dto.teacherId ||
        dto.roomId ||
        dto.sectionId
      ) {
        const conflictDto = {
          ...existing,
          ...dto,
        };
        const hasConflicts = await this.checkConflicts(conflictDto, id);
        if (hasConflicts) {
          throw new ConflictException('Schedule conflicts detected');
        }
      }

      const updateData: any = {};
      if (dto.subjectId) updateData.subject_id = dto.subjectId;
      if (dto.teacherId) updateData.teacher_id = dto.teacherId;
      if (dto.sectionId) updateData.section_id = dto.sectionId;
      if (dto.roomId) updateData.room_id = dto.roomId;
      if (dto.buildingId) updateData.building_id = dto.buildingId;
      if (dto.dayOfWeek) updateData.day_of_week = dto.dayOfWeek;
      if (dto.startTime) updateData.start_time = dto.startTime;
      if (dto.endTime) updateData.end_time = dto.endTime;
      if (dto.schoolYear) updateData.school_year = dto.schoolYear;
      if (dto.semester) updateData.semester = dto.semester;

      const { data: updatedSchedule, error } = await supabase
        .from('schedules')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        this.logger.error('Error updating schedule:', error);
        throw new InternalServerErrorException('Failed to update schedule');
      }

      // Invalidate related caches
      await this.invalidateRelatedCaches(existing);
      if (dto.teacherId || dto.sectionId) {
        await this.invalidateRelatedCaches(dto as CreateScheduleDto);
      }

      return await this.findOne(id);
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      this.logger.error('Unexpected error updating schedule:', error);
      throw new InternalServerErrorException('Failed to update schedule');
    }
  }

  async remove(id: string): Promise<void> {
    const supabase = this.getSupabaseClient();

    try {
      // Check if schedule exists
      const existing = await this.findOne(id);

      // Delete associated student schedules first
      const { error: studentScheduleError } = await supabase
        .from('student_schedule')
        .delete()
        .eq('schedule_id', id);

      if (studentScheduleError) {
        this.logger.error(
          'Error deleting student schedules:',
          studentScheduleError,
        );
        throw new InternalServerErrorException(
          'Failed to delete associated student schedules',
        );
      }

      // Delete the schedule
      const { error: scheduleError } = await supabase
        .from('schedules')
        .delete()
        .eq('id', id);

      if (scheduleError) {
        this.logger.error('Error deleting schedule:', scheduleError);
        throw new InternalServerErrorException('Failed to delete schedule');
      }

      // Invalidate related caches
      await this.invalidateRelatedCaches(existing);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      this.logger.error('Unexpected error deleting schedule:', error);
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

      // Prepare student schedule assignments
      const assignments = dto.studentIds.map((studentId) => ({
        schedule_id: scheduleId,
        student_id: studentId,
      }));

      const { error } = await supabase
        .from('student_schedule')
        .insert(assignments);

      if (error) {
        this.logger.error('Error assigning students:', error);
        throw new InternalServerErrorException(
          'Failed to assign students to schedule',
        );
      }

      // Invalidate schedule cache
      await this.cacheManager.del(`schedule:${scheduleId}`);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      this.logger.error('Unexpected error assigning students:', error);
      throw new InternalServerErrorException(
        'Failed to assign students to schedule',
      );
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
        throw new InternalServerErrorException(
          'Failed to remove students from schedule',
        );
      }

      // Invalidate schedule cache
      await this.cacheManager.del(`schedule:${scheduleId}`);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      this.logger.error('Unexpected error removing students:', error);
      throw new InternalServerErrorException(
        'Failed to remove students from schedule',
      );
    }
  }

  async getStudentSchedule(studentId: string): Promise<Schedule[]> {
    const cacheKey = `schedules:student:${studentId}`;

    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      this.logger.log(`Cache hit for ${cacheKey}`);
      return cached as Schedule[];
    }
    this.logger.log(`Cache miss for ${cacheKey}`);

    const supabase = this.getSupabaseClient();
    const { data, error } = await supabase
      .from('student_schedule')
      .select(
        `
        schedule:schedules!inner(
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
          subject:subjects!inner(id, subject_name, description, grade_level, color_hex),
          teacher:teachers!inner(id, first_name, last_name, middle_name, user:users!inner(id, full_name, email)),
          section:sections!inner(id, name, grade_level, teacher_id),
          room:rooms!inner(
            id,
            room_number,
            capacity,
            floor_id,
            floor:floors(
              id,
              number,
              building:buildings(id, building_name)
            )
          )
        )
      `,
      )
      .eq('student_id', studentId);

    if (error) {
      this.logger.error('Error fetching student schedule:', error);
      throw new InternalServerErrorException(
        'Failed to fetch student schedule',
      );
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
        subject: item.schedule.subject
          ? {
              id: item.schedule.subject.id,
              subjectName: item.schedule.subject.subject_name,
              description: item.schedule.subject.description,
              gradeLevel: item.schedule.subject.grade_level,
              colorHex: item.schedule.subject.color_hex,
            }
          : undefined,
        teacher: item.schedule.teacher
          ? {
              id: item.schedule.teacher.id,
              firstName: item.schedule.teacher.first_name,
              lastName: item.schedule.teacher.last_name,
              middleName: item.schedule.teacher.middle_name,
              user: item.schedule.teacher.user
                ? {
                    id: item.schedule.teacher.user.id,
                    fullName: item.schedule.teacher.user.full_name,
                    email: item.schedule.teacher.user.email,
                  }
                : undefined,
            }
          : undefined,
        section: item.schedule.section
          ? {
              id: item.schedule.section.id,
              name: item.schedule.section.name,
              gradeLevel: item.schedule.section.grade_level,
              teacherId: item.schedule.section.teacher_id,
            }
          : undefined,
        room: item.schedule.room
          ? {
              id: item.schedule.room.id,
              roomNumber: item.schedule.room.room_number,
              capacity: item.schedule.room.capacity,
              floorId: item.schedule.room.floor_id,
              floor: item.schedule.room.floor
                ? {
                    id: item.schedule.room.floor.id,
                    floorNumber: item.schedule.room.floor.number,
                    building: item.schedule.room.floor.building
                      ? {
                          id: item.schedule.room.floor.building.id,
                          name: item.schedule.room.floor.building.building_name,
                        }
                      : undefined,
                  }
                : undefined,
            }
          : undefined,
        building: item.schedule.room?.floor?.building
          ? {
              id: item.schedule.room.floor.building.id,
              name: item.schedule.room.floor.building.building_name,
            }
          : undefined,
      })) || [];

    await this.cacheManager.set(cacheKey, schedules, this.DETAILED_CACHE_TTL);

    return schedules;
  }

  async validateScheduleConflicts(
    dto: ConflictCheckDto,
  ): Promise<{ hasConflicts: boolean; conflicts: any[] }> {
    const supabase = this.getSupabaseClient();

    try {
      const conflicts: any[] = [];

      // Check teacher conflicts
      if (dto.teacherId && dto.dayOfWeek && dto.startTime && dto.endTime) {
        const { data: teacherConflicts } = await supabase
          .from('schedules')
          .select(
            'id, teacher:teachers(first_name, last_name), day_of_week, start_time, end_time',
          )
          .eq('teacher_id', dto.teacherId)
          .eq('day_of_week', dto.dayOfWeek)
          .neq(
            'id',
            dto.excludeScheduleId || '00000000-0000-0000-0000-000000000000',
          )
          .or(
            `start_time.lte.${dto.startTime},end_time.gt.${dto.startTime},start_time.lt.${dto.endTime},end_time.gte.${dto.endTime}`,
          );

        if (teacherConflicts && teacherConflicts.length > 0) {
          conflicts.push({
            type: 'teacher',
            message: 'Teacher has conflicting schedule',
            conflicts: teacherConflicts,
          });
        }
      }

      // Check room conflicts
      if (dto.roomId && dto.dayOfWeek && dto.startTime && dto.endTime) {
        const { data: roomConflicts } = await supabase
          .from('schedules')
          .select(
            'id, room:rooms(room_number), day_of_week, start_time, end_time',
          )
          .eq('room_id', dto.roomId)
          .eq('day_of_week', dto.dayOfWeek)
          .neq(
            'id',
            dto.excludeScheduleId || '00000000-0000-0000-0000-000000000000',
          )
          .or(
            `start_time.lte.${dto.startTime},end_time.gt.${dto.startTime},start_time.lt.${dto.endTime},end_time.gte.${dto.endTime}`,
          );

        if (roomConflicts && roomConflicts.length > 0) {
          conflicts.push({
            type: 'room',
            message: 'Room has conflicting schedule',
            conflicts: roomConflicts,
          });
        }
      }

      // Check section conflicts
      if (dto.sectionId && dto.dayOfWeek && dto.startTime && dto.endTime) {
        const { data: sectionConflicts } = await supabase
          .from('schedules')
          .select(
            'id, section:sections(name), day_of_week, start_time, end_time',
          )
          .eq('section_id', dto.sectionId)
          .eq('day_of_week', dto.dayOfWeek)
          .neq(
            'id',
            dto.excludeScheduleId || '00000000-0000-0000-0000-000000000000',
          )
          .or(
            `start_time.lte.${dto.startTime},end_time.gt.${dto.startTime},start_time.lt.${dto.endTime},end_time.gte.${dto.endTime}`,
          );

        if (sectionConflicts && sectionConflicts.length > 0) {
          conflicts.push({
            type: 'section',
            message: 'Section has conflicting schedule',
            conflicts: sectionConflicts,
          });
        }
      }

      return {
        hasConflicts: conflicts.length > 0,
        conflicts,
      };
    } catch (error) {
      this.logger.error('Error validating schedule conflicts:', error);
      throw new InternalServerErrorException(
        'Failed to validate schedule conflicts',
      );
    }
  }

  private async validateForeignKeys(dto: CreateScheduleDto): Promise<void> {
    const supabase = this.getSupabaseClient();

    // Validate subject exists
    const { data: subject } = await supabase
      .from('subjects')
      .select('id')
      .eq('id', dto.subjectId)
      .single();

    if (!subject) {
      throw new BadRequestException(
        `Subject with ID "${dto.subjectId}" not found`,
      );
    }

    // Validate teacher exists
    const { data: teacher } = await supabase
      .from('teachers')
      .select('id')
      .eq('id', dto.teacherId)
      .single();

    if (!teacher) {
      throw new BadRequestException(
        `Teacher with ID "${dto.teacherId}" not found`,
      );
    }

    // Validate section exists
    const { data: section } = await supabase
      .from('sections')
      .select('id')
      .eq('id', dto.sectionId)
      .single();

    if (!section) {
      throw new BadRequestException(
        `Section with ID "${dto.sectionId}" not found`,
      );
    }

    // Validate room exists
    const { data: room } = await supabase
      .from('rooms')
      .select('id')
      .eq('id', dto.roomId)
      .single();

    if (!room) {
      throw new BadRequestException(`Room with ID "${dto.roomId}" not found`);
    }

    // Validate building exists
    const { data: building } = await supabase
      .from('buildings')
      .select('id')
      .eq('id', dto.buildingId)
      .single();

    if (!building) {
      throw new BadRequestException(
        `Building with ID "${dto.buildingId}" not found`,
      );
    }
  }

  private async checkConflicts(
    dto: CreateScheduleDto,
    excludeId?: string,
  ): Promise<boolean> {
    const supabase = this.getSupabaseClient();

    // Use the PostgreSQL function for conflict checking
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
      throw new InternalServerErrorException(
        `Failed to validate schedule conflicts: ${error.message}`,
      );
    }

    return data === true;
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
    // In production, you might want to implement a more sophisticated cache key tracking system
    const commonKeys = [
      'schedules:all',
      'schedules:section',
      'schedules:teacher',
      'schedules:student',
    ];

    await Promise.all(commonKeys.map((key) => this.cacheManager.del(key)));
  }
}
