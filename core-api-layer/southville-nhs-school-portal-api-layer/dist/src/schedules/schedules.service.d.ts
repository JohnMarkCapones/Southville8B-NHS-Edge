import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { Schedule } from './entities/schedule.entity';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { BulkCreateSchedulesDto } from './dto/bulk-create-schedules.dto';
import { AssignStudentsDto } from './dto/assign-students.dto';
import { ConflictCheckDto } from './dto/conflict-check.dto';
import { SearchSchedulesDto } from './dto/search-schedules.dto';
export declare class SchedulesService {
    private configService;
    private cacheManager;
    private readonly logger;
    private readonly CACHE_TTL;
    private readonly DETAILED_CACHE_TTL;
    private readonly SEARCH_CACHE_TTL;
    private supabase;
    constructor(configService: ConfigService, cacheManager: Cache);
    private getSupabaseClient;
    create(dto: CreateScheduleDto): Promise<Schedule>;
    bulkCreate(dto: BulkCreateSchedulesDto): Promise<Schedule[]>;
    findAll(filters: SearchSchedulesDto): Promise<{
        data: Schedule[];
        pagination: any;
    }>;
    findOne(id: string): Promise<Schedule>;
    update(id: string, dto: UpdateScheduleDto): Promise<Schedule>;
    remove(id: string): Promise<void>;
    assignStudents(scheduleId: string, dto: AssignStudentsDto): Promise<void>;
    removeStudents(scheduleId: string, studentIds: string[]): Promise<void>;
    getStudentSchedule(studentId: string): Promise<Schedule[]>;
    validateScheduleConflicts(dto: ConflictCheckDto): Promise<{
        hasConflicts: boolean;
        conflicts: any[];
    }>;
    private validateForeignKeys;
    private checkConflicts;
    private invalidateRelatedCaches;
    private invalidateAllCaches;
    getTeacherTodaySchedules(teacherId: string, dayOfWeek: string): Promise<Schedule[]>;
}
