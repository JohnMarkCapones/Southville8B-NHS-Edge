import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { BulkCreateSchedulesDto } from './dto/bulk-create-schedules.dto';
import { AssignStudentsDto } from './dto/assign-students.dto';
import { SearchSchedulesDto } from './dto/search-schedules.dto';
import { ConflictCheckDto } from './dto/conflict-check.dto';
import { Schedule } from './entities/schedule.entity';
export declare class SchedulesController {
    private readonly schedulesService;
    private readonly logger;
    constructor(schedulesService: SchedulesService);
    create(createScheduleDto: CreateScheduleDto, user: any): Promise<Schedule>;
    createBulk(bulkCreateSchedulesDto: BulkCreateSchedulesDto, user: any): Promise<Schedule[]>;
    findAll(page: number, limit: number, sectionId?: string, teacherId?: string, dayOfWeek?: string, schoolYear?: string, semester?: string): Promise<{
        data: Schedule[];
        pagination: any;
    }>;
    searchSchedules(searchDto: SearchSchedulesDto): Promise<Schedule[]>;
    getSchedulesBySection(sectionId: string): Promise<Schedule[]>;
    getSchedulesByTeacher(teacherId: string): Promise<Schedule[]>;
    getStudentSchedules(studentId: string, user: any): Promise<Schedule[]>;
    getMySchedule(user: any): Promise<Schedule[]>;
    findOne(id: string): Promise<Schedule>;
    update(id: string, updateScheduleDto: UpdateScheduleDto, user: any): Promise<Schedule>;
    remove(id: string, user: any): Promise<void>;
    assignStudents(scheduleId: string, assignStudentsDto: AssignStudentsDto, user: any): Promise<void>;
    removeStudents(scheduleId: string, dto: AssignStudentsDto, user: any): Promise<void>;
    checkConflicts(conflictCheckDto: ConflictCheckDto): Promise<{
        hasConflicts: boolean;
        conflicts: any[];
    }>;
    getTeacherTodaySchedules(user: any): Promise<Schedule[]>;
}
