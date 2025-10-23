"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SchedulesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulesService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
const cache_manager_1 = require("@nestjs/cache-manager");
let SchedulesService = SchedulesService_1 = class SchedulesService {
    configService;
    cacheManager;
    logger = new common_1.Logger(SchedulesService_1.name);
    CACHE_TTL = 300;
    DETAILED_CACHE_TTL = 600;
    SEARCH_CACHE_TTL = 180;
    supabase;
    constructor(configService, cacheManager) {
        this.configService = configService;
        this.cacheManager = cacheManager;
    }
    getSupabaseClient() {
        if (!this.supabase) {
            const supabaseUrl = this.configService.get('supabase.url');
            const supabaseServiceKey = this.configService.get('supabase.serviceRoleKey');
            if (!supabaseUrl || !supabaseServiceKey) {
                throw new Error('Supabase configuration is missing');
            }
            this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey);
        }
        return this.supabase;
    }
    async create(dto) {
        const supabase = this.getSupabaseClient();
        try {
            await this.validateForeignKeys(dto);
            const hasConflicts = await this.checkConflicts(dto);
            if (hasConflicts) {
                throw new common_1.ConflictException('Schedule conflicts detected');
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
                throw new common_1.InternalServerErrorException('Failed to create schedule');
            }
            await this.invalidateRelatedCaches(dto);
            return await this.findOne(schedule.id);
        }
        catch (error) {
            if (error instanceof common_1.ConflictException ||
                error instanceof common_1.BadRequestException ||
                error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            this.logger.error('Unexpected error creating schedule:', error);
            throw new common_1.InternalServerErrorException('Failed to create schedule');
        }
    }
    async bulkCreate(dto) {
        const supabase = this.getSupabaseClient();
        try {
            for (const scheduleDto of dto.schedules) {
                await this.validateForeignKeys(scheduleDto);
            }
            const conflictResults = await Promise.all(dto.schedules.map((scheduleDto) => this.checkConflicts(scheduleDto)));
            const conflictingSchedules = dto.schedules.filter((_, index) => conflictResults[index]);
            if (conflictingSchedules.length > 0) {
                throw new common_1.ConflictException(`Conflicts detected in ${conflictingSchedules.length} schedules`);
            }
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
                throw new common_1.InternalServerErrorException('Failed to bulk create schedules');
            }
            await this.invalidateAllCaches();
            const schedulesWithRelations = await Promise.all(schedules.map((schedule) => this.findOne(schedule.id)));
            return schedulesWithRelations;
        }
        catch (error) {
            if (error instanceof common_1.ConflictException ||
                error instanceof common_1.BadRequestException ||
                error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            this.logger.error('Unexpected error bulk creating schedules:', error);
            throw new common_1.InternalServerErrorException('Failed to bulk create schedules');
        }
    }
    async findAll(filters) {
        try {
            console.log('FindAll schedules query:', JSON.stringify(filters));
            const cacheKey = `schedules:all:${JSON.stringify(filters)}`;
            const cached = await this.cacheManager.get(cacheKey);
            if (cached) {
                this.logger.log(`Cache hit for ${cacheKey}`);
                return cached;
            }
            this.logger.log(`Cache miss for ${cacheKey}`);
            const supabase = this.getSupabaseClient();
            const { page = 1, limit = 10, sectionId, teacherId, dayOfWeek, schoolYear, semester, search, } = filters;
            let query = supabase.from('schedules').select(`
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
        subject:subjects(id, subject_name, description, grade_level, color_hex),
        teacher:teachers(id, first_name, last_name, middle_name),
        section:sections(id, name, grade_level, teacher_id),
        room:rooms(id, room_number, capacity, floor_id),
        building:buildings(id, building_name)
      `, { count: 'exact' });
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
                query = query.or(`teacher.first_name.ilike.%${search}%,teacher.last_name.ilike.%${search}%,subject.subject_name.ilike.%${search}%,section.name.ilike.%${search}%`);
            }
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit - 1;
            console.log('Executing Supabase query with filters:', {
                sectionId,
                teacherId,
                dayOfWeek,
                schoolYear,
                semester,
                search,
                page,
                limit,
            });
            const { data, error, count } = await query.range(startIndex, endIndex);
            if (error) {
                console.error('Supabase error in findAll:', error);
                this.logger.error('Error fetching schedules:', error);
                throw new common_1.InternalServerErrorException(`Failed to fetch schedules: ${error.message}`);
            }
            console.log('FindAll schedules success. Count:', count, 'Data length:', data?.length);
            const transformedData = data?.map((schedule) => ({
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
                    }
                    : undefined,
                building: schedule.building
                    ? {
                        id: schedule.building.id,
                        buildingName: schedule.building.building_name,
                    }
                    : undefined,
            })) || [];
            const pagination = {
                total: count,
                page,
                limit,
                pages: Math.ceil((count || 0) / limit),
            };
            await this.cacheManager.set(cacheKey, { data: transformedData, pagination }, this.CACHE_TTL);
            console.log('FindAll schedules completed successfully. Returning data.');
            return { data: transformedData, pagination };
        }
        catch (error) {
            console.error('Error in findAll schedules:', error);
            this.logger.error('Error in findAll schedules:', error);
            throw error;
        }
    }
    async findOne(id) {
        const cacheKey = `schedule:${id}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            this.logger.log(`Cache hit for ${cacheKey}`);
            return cached;
        }
        this.logger.log(`Cache miss for ${cacheKey}`);
        const supabase = this.getSupabaseClient();
        const { data, error } = await supabase
            .from('schedules')
            .select(`
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
        subject:subjects(id, subject_name, description, grade_level, color_hex),
        teacher:teachers(id, first_name, last_name, middle_name, user:users(id, full_name, email)),
        section:sections(id, name, grade_level, teacher_id),
        room:rooms(id, room_number, capacity, floor_id),
        building:buildings(id, building_name),
        students:student_schedule(student:students(id, first_name, last_name, middle_name, student_id, lrn_id, grade_level))
      `)
            .eq('id', id)
            .single();
        if (error) {
            this.logger.error('Error fetching schedule:', error);
            throw new common_1.NotFoundException(`Schedule with ID "${id}" not found`);
        }
        const transformedData = {
            id: data.id,
            subjectId: data.subject_id,
            teacherId: data.teacher_id,
            sectionId: data.section_id,
            roomId: data.room_id,
            buildingId: data.building_id,
            dayOfWeek: data.day_of_week,
            startTime: data.start_time,
            endTime: data.end_time,
            schoolYear: data.school_year,
            semester: data.semester,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            subject: data.subject
                ? {
                    id: data.subject.id,
                    subjectName: data.subject.subject_name,
                    description: data.subject.description,
                    gradeLevel: data.subject.grade_level,
                    colorHex: data.subject.color_hex,
                }
                : undefined,
            teacher: data.teacher
                ? {
                    id: data.teacher.id,
                    firstName: data.teacher.first_name,
                    lastName: data.teacher.last_name,
                    middleName: data.teacher.middle_name,
                    user: data.teacher.user
                        ? {
                            id: data.teacher.user.id,
                            fullName: data.teacher.user.full_name,
                            email: data.teacher.user.email,
                        }
                        : undefined,
                }
                : undefined,
            section: data.section
                ? {
                    id: data.section.id,
                    name: data.section.name,
                    gradeLevel: data.section.grade_level,
                    teacherId: data.section.teacher_id,
                }
                : undefined,
            room: data.room
                ? {
                    id: data.room.id,
                    roomNumber: data.room.room_number,
                    capacity: data.room.capacity,
                    floorId: data.room.floor_id,
                }
                : undefined,
            building: data.building
                ? {
                    id: data.building.id,
                    buildingName: data.building.building_name,
                }
                : undefined,
            students: data.students?.map((ss) => ss.student),
        };
        await this.cacheManager.set(cacheKey, transformedData, this.DETAILED_CACHE_TTL);
        return transformedData;
    }
    async update(id, dto) {
        const supabase = this.getSupabaseClient();
        try {
            const existing = await this.findOne(id);
            if (dto.subjectId ||
                dto.teacherId ||
                dto.sectionId ||
                dto.roomId ||
                dto.buildingId) {
                await this.validateForeignKeys(dto);
            }
            if (dto.startTime ||
                dto.endTime ||
                dto.dayOfWeek ||
                dto.teacherId ||
                dto.roomId ||
                dto.sectionId) {
                const conflictDto = {
                    ...existing,
                    ...dto,
                };
                const hasConflicts = await this.checkConflicts(conflictDto, id);
                if (hasConflicts) {
                    throw new common_1.ConflictException('Schedule conflicts detected');
                }
            }
            const updateData = {};
            if (dto.subjectId)
                updateData.subject_id = dto.subjectId;
            if (dto.teacherId)
                updateData.teacher_id = dto.teacherId;
            if (dto.sectionId)
                updateData.section_id = dto.sectionId;
            if (dto.roomId)
                updateData.room_id = dto.roomId;
            if (dto.buildingId)
                updateData.building_id = dto.buildingId;
            if (dto.dayOfWeek)
                updateData.day_of_week = dto.dayOfWeek;
            if (dto.startTime)
                updateData.start_time = dto.startTime;
            if (dto.endTime)
                updateData.end_time = dto.endTime;
            if (dto.schoolYear)
                updateData.school_year = dto.schoolYear;
            if (dto.semester)
                updateData.semester = dto.semester;
            const { data: updatedSchedule, error } = await supabase
                .from('schedules')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();
            if (error) {
                this.logger.error('Error updating schedule:', error);
                throw new common_1.InternalServerErrorException('Failed to update schedule');
            }
            await this.invalidateRelatedCaches(existing);
            if (dto.teacherId || dto.sectionId) {
                await this.invalidateRelatedCaches(dto);
            }
            return await this.findOne(id);
        }
        catch (error) {
            if (error instanceof common_1.ConflictException ||
                error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException ||
                error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            this.logger.error('Unexpected error updating schedule:', error);
            throw new common_1.InternalServerErrorException('Failed to update schedule');
        }
    }
    async remove(id) {
        const supabase = this.getSupabaseClient();
        try {
            const existing = await this.findOne(id);
            const { error: studentScheduleError } = await supabase
                .from('student_schedule')
                .delete()
                .eq('schedule_id', id);
            if (studentScheduleError) {
                this.logger.error('Error deleting student schedules:', studentScheduleError);
                throw new common_1.InternalServerErrorException('Failed to delete associated student schedules');
            }
            const { error: scheduleError } = await supabase
                .from('schedules')
                .delete()
                .eq('id', id);
            if (scheduleError) {
                this.logger.error('Error deleting schedule:', scheduleError);
                throw new common_1.InternalServerErrorException('Failed to delete schedule');
            }
            await this.invalidateRelatedCaches(existing);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            this.logger.error('Unexpected error deleting schedule:', error);
            throw new common_1.InternalServerErrorException('Failed to delete schedule');
        }
    }
    async assignStudents(scheduleId, dto) {
        const supabase = this.getSupabaseClient();
        try {
            await this.findOne(scheduleId);
            const schedule = await this.findOne(scheduleId);
            const { data: students, error: studentsError } = await supabase
                .from('students')
                .select('id, section_id')
                .in('id', dto.studentIds);
            if (studentsError) {
                this.logger.error('Error validating students:', studentsError);
                throw new common_1.InternalServerErrorException('Failed to validate students');
            }
            const invalidStudents = students?.filter((student) => student.section_id !== schedule.sectionId) || [];
            if (invalidStudents.length > 0) {
                throw new common_1.BadRequestException(`${invalidStudents.length} students do not belong to the schedule's section`);
            }
            const assignments = dto.studentIds.map((studentId) => ({
                schedule_id: scheduleId,
                student_id: studentId,
            }));
            const { error } = await supabase
                .from('student_schedule')
                .insert(assignments);
            if (error) {
                this.logger.error('Error assigning students:', error);
                throw new common_1.InternalServerErrorException('Failed to assign students to schedule');
            }
            await this.cacheManager.del(`schedule:${scheduleId}`);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException ||
                error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            this.logger.error('Unexpected error assigning students:', error);
            throw new common_1.InternalServerErrorException('Failed to assign students to schedule');
        }
    }
    async removeStudents(scheduleId, studentIds) {
        const supabase = this.getSupabaseClient();
        try {
            await this.findOne(scheduleId);
            const { error } = await supabase
                .from('student_schedule')
                .delete()
                .eq('schedule_id', scheduleId)
                .in('student_id', studentIds);
            if (error) {
                this.logger.error('Error removing students:', error);
                throw new common_1.InternalServerErrorException('Failed to remove students from schedule');
            }
            await this.cacheManager.del(`schedule:${scheduleId}`);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            this.logger.error('Unexpected error removing students:', error);
            throw new common_1.InternalServerErrorException('Failed to remove students from schedule');
        }
    }
    async getStudentSchedule(studentId) {
        const cacheKey = `schedules:student:${studentId}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            this.logger.log(`Cache hit for ${cacheKey}`);
            return cached;
        }
        this.logger.log(`Cache miss for ${cacheKey}`);
        const supabase = this.getSupabaseClient();
        const { data, error } = await supabase
            .from('student_schedule')
            .select(`
        schedule:schedules(
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
          subject:subjects(id, subject_name, description, grade_level, color_hex),
          teacher:teachers(id, first_name, last_name, middle_name, user:users(id, full_name, email)),
          section:sections(id, name, grade_level, teacher_id),
          room:rooms(id, room_number, capacity, floor_id),
          building:buildings(id, building_name)
        )
      `)
            .eq('student_id', studentId);
        if (error) {
            this.logger.error('Error fetching student schedule:', error);
            throw new common_1.InternalServerErrorException('Failed to fetch student schedule');
        }
        const schedules = data?.map((item) => ({
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
                }
                : undefined,
            building: item.schedule.building
                ? {
                    id: item.schedule.building.id,
                    buildingName: item.schedule.building.building_name,
                }
                : undefined,
        })) || [];
        await this.cacheManager.set(cacheKey, schedules, this.DETAILED_CACHE_TTL);
        return schedules;
    }
    async validateScheduleConflicts(dto) {
        const supabase = this.getSupabaseClient();
        try {
            const conflicts = [];
            if (dto.teacherId && dto.dayOfWeek && dto.startTime && dto.endTime) {
                const { data: teacherConflicts } = await supabase
                    .from('schedules')
                    .select('id, teacher:teachers(first_name, last_name), day_of_week, start_time, end_time')
                    .eq('teacher_id', dto.teacherId)
                    .eq('day_of_week', dto.dayOfWeek)
                    .neq('id', dto.excludeScheduleId || '00000000-0000-0000-0000-000000000000')
                    .or(`start_time.lte.${dto.startTime},end_time.gt.${dto.startTime},start_time.lt.${dto.endTime},end_time.gte.${dto.endTime}`);
                if (teacherConflicts && teacherConflicts.length > 0) {
                    conflicts.push({
                        type: 'teacher',
                        message: 'Teacher has conflicting schedule',
                        conflicts: teacherConflicts,
                    });
                }
            }
            if (dto.roomId && dto.dayOfWeek && dto.startTime && dto.endTime) {
                const { data: roomConflicts } = await supabase
                    .from('schedules')
                    .select('id, room:rooms(room_number), day_of_week, start_time, end_time')
                    .eq('room_id', dto.roomId)
                    .eq('day_of_week', dto.dayOfWeek)
                    .neq('id', dto.excludeScheduleId || '00000000-0000-0000-0000-000000000000')
                    .or(`start_time.lte.${dto.startTime},end_time.gt.${dto.startTime},start_time.lt.${dto.endTime},end_time.gte.${dto.endTime}`);
                if (roomConflicts && roomConflicts.length > 0) {
                    conflicts.push({
                        type: 'room',
                        message: 'Room has conflicting schedule',
                        conflicts: roomConflicts,
                    });
                }
            }
            if (dto.sectionId && dto.dayOfWeek && dto.startTime && dto.endTime) {
                const { data: sectionConflicts } = await supabase
                    .from('schedules')
                    .select('id, section:sections(name), day_of_week, start_time, end_time')
                    .eq('section_id', dto.sectionId)
                    .eq('day_of_week', dto.dayOfWeek)
                    .neq('id', dto.excludeScheduleId || '00000000-0000-0000-0000-000000000000')
                    .or(`start_time.lte.${dto.startTime},end_time.gt.${dto.startTime},start_time.lt.${dto.endTime},end_time.gte.${dto.endTime}`);
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
        }
        catch (error) {
            this.logger.error('Error validating schedule conflicts:', error);
            throw new common_1.InternalServerErrorException('Failed to validate schedule conflicts');
        }
    }
    async validateForeignKeys(dto) {
        const supabase = this.getSupabaseClient();
        const { data: subject } = await supabase
            .from('subjects')
            .select('id')
            .eq('id', dto.subjectId)
            .single();
        if (!subject) {
            throw new common_1.BadRequestException(`Subject with ID "${dto.subjectId}" not found`);
        }
        const { data: teacher } = await supabase
            .from('teachers')
            .select('id')
            .eq('id', dto.teacherId)
            .single();
        if (!teacher) {
            throw new common_1.BadRequestException(`Teacher with ID "${dto.teacherId}" not found`);
        }
        const { data: section } = await supabase
            .from('sections')
            .select('id')
            .eq('id', dto.sectionId)
            .single();
        if (!section) {
            throw new common_1.BadRequestException(`Section with ID "${dto.sectionId}" not found`);
        }
        const { data: room } = await supabase
            .from('rooms')
            .select('id')
            .eq('id', dto.roomId)
            .single();
        if (!room) {
            throw new common_1.BadRequestException(`Room with ID "${dto.roomId}" not found`);
        }
        const { data: building } = await supabase
            .from('buildings')
            .select('id')
            .eq('id', dto.buildingId)
            .single();
        if (!building) {
            throw new common_1.BadRequestException(`Building with ID "${dto.buildingId}" not found`);
        }
    }
    async checkConflicts(dto, excludeId) {
        const supabase = this.getSupabaseClient();
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
            throw new common_1.InternalServerErrorException(`Failed to validate schedule conflicts: ${error.message}`);
        }
        return data === true;
    }
    async invalidateRelatedCaches(dto) {
        const keysToDelete = [
            `schedules:all:${dto.sectionId}`,
            `schedules:section:${dto.sectionId}`,
            `schedules:teacher:${dto.teacherId}`,
        ];
        await Promise.all(keysToDelete.map((key) => this.cacheManager.del(key)));
    }
    async invalidateAllCaches() {
        const commonKeys = [
            'schedules:all',
            'schedules:section',
            'schedules:teacher',
            'schedules:student',
        ];
        await Promise.all(commonKeys.map((key) => this.cacheManager.del(key)));
    }
    async getTeacherTodaySchedules(teacherId, dayOfWeek) {
        const supabase = this.getSupabaseClient();
        const cacheKey = `schedules:teacher:today:${teacherId}:${dayOfWeek}`;
        try {
            const cached = await this.cacheManager.get(cacheKey);
            if (cached) {
                this.logger.log(`Cache hit for teacher today schedules: ${teacherId}`);
                return cached;
            }
            this.logger.log(`Fetching today's schedules for teacher: ${teacherId}, day: ${dayOfWeek}`);
            const { data, error } = await supabase
                .from('schedules')
                .select(`
          *,
          subject:subjects(id, name, code),
          section:sections(id, name, grade_level),
          room:rooms(id, name, room_number),
          building:buildings(id, building_name)
        `)
                .eq('teacher_id', teacherId)
                .eq('day_of_week', dayOfWeek)
                .eq('status', 'Active')
                .order('start_time', { ascending: true });
            if (error) {
                this.logger.error('Error fetching teacher today schedules:', error);
                throw new common_1.InternalServerErrorException(`Failed to fetch today's schedules: ${error.message}`);
            }
            const schedules = data?.map((item) => ({
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
                status: item.status,
                createdAt: item.created_at,
                updatedAt: item.updated_at,
                subject: item.subject,
                section: item.section,
                room: item.room,
                building: item.building,
            })) || [];
            await this.cacheManager.set(cacheKey, schedules, this.CACHE_TTL * 1000);
            this.logger.log(`Found ${schedules.length} schedules for teacher ${teacherId} on ${dayOfWeek}`);
            return schedules;
        }
        catch (error) {
            this.logger.error('Error in getTeacherTodaySchedules:', error);
            throw error;
        }
    }
};
exports.SchedulesService = SchedulesService;
exports.SchedulesService = SchedulesService = SchedulesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [config_1.ConfigService, Object])
], SchedulesService);
//# sourceMappingURL=schedules.service.js.map