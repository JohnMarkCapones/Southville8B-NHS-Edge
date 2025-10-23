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
var SchedulesController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const schedules_service_1 = require("./schedules.service");
const create_schedule_dto_1 = require("./dto/create-schedule.dto");
const update_schedule_dto_1 = require("./dto/update-schedule.dto");
const bulk_create_schedules_dto_1 = require("./dto/bulk-create-schedules.dto");
const assign_students_dto_1 = require("./dto/assign-students.dto");
const search_schedules_dto_1 = require("./dto/search-schedules.dto");
const conflict_check_dto_1 = require("./dto/conflict-check.dto");
const schedule_entity_1 = require("./entities/schedule.entity");
const supabase_auth_guard_1 = require("../auth/supabase-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const auth_user_decorator_1 = require("../auth/auth-user.decorator");
const create_user_dto_1 = require("../users/dto/create-user.dto");
const audit_interceptor_1 = require("./audit.interceptor");
let SchedulesController = SchedulesController_1 = class SchedulesController {
    schedulesService;
    logger = new common_1.Logger(SchedulesController_1.name);
    constructor(schedulesService) {
        this.schedulesService = schedulesService;
    }
    async create(createScheduleDto, user) {
        this.logger.log(`Creating schedule for user: ${user.id}, section: ${createScheduleDto.sectionId}`);
        return this.schedulesService.create(createScheduleDto);
    }
    async createBulk(bulkCreateSchedulesDto, user) {
        this.logger.log(`Creating ${bulkCreateSchedulesDto.schedules.length} schedules in bulk for user: ${user.id}`);
        return this.schedulesService.bulkCreate(bulkCreateSchedulesDto);
    }
    async findAll(page, limit, sectionId, teacherId, dayOfWeek, schoolYear, semester) {
        const filters = {
            page,
            limit,
            sectionId,
            teacherId,
            dayOfWeek,
            schoolYear,
            semester,
        };
        Object.keys(filters).forEach((key) => {
            if (filters[key] === undefined) {
                delete filters[key];
            }
        });
        return this.schedulesService.findAll(filters);
    }
    async searchSchedules(searchDto) {
        const result = await this.schedulesService.findAll(searchDto);
        return result.data;
    }
    async getSchedulesBySection(sectionId) {
        const result = await this.schedulesService.findAll({ sectionId });
        return result.data;
    }
    async getSchedulesByTeacher(teacherId) {
        const result = await this.schedulesService.findAll({ teacherId });
        return result.data;
    }
    async getStudentSchedules(studentId, user) {
        if (user.role === create_user_dto_1.UserRole.STUDENT && user.studentId !== studentId) {
            throw new common_1.ForbiddenException('You can only access your own schedule');
        }
        return this.schedulesService.getStudentSchedule(studentId);
    }
    async getMySchedule(user) {
        return this.schedulesService.getStudentSchedule(user.studentId);
    }
    async findOne(id) {
        return this.schedulesService.findOne(id);
    }
    async update(id, updateScheduleDto, user) {
        this.logger.log(`Updating schedule ${id} for user: ${user.id}`);
        return this.schedulesService.update(id, updateScheduleDto);
    }
    async remove(id, user) {
        this.logger.log(`Deleting schedule ${id} for user: ${user.id}`);
        return this.schedulesService.remove(id);
    }
    async assignStudents(scheduleId, assignStudentsDto, user) {
        this.logger.log(`Assigning ${assignStudentsDto.studentIds.length} students to schedule ${scheduleId} for user: ${user.id}`);
        return this.schedulesService.assignStudents(scheduleId, assignStudentsDto);
    }
    async removeStudents(scheduleId, dto, user) {
        this.logger.log(`Removing ${dto.studentIds.length} students from schedule ${scheduleId} for user: ${user.id}`);
        return this.schedulesService.removeStudents(scheduleId, dto.studentIds);
    }
    async checkConflicts(conflictCheckDto) {
        return this.schedulesService.validateScheduleConflicts(conflictCheckDto);
    }
    async getTeacherTodaySchedules(user) {
        this.logger.log(`Getting today's schedules for teacher: ${user.id}`);
        const today = new Date();
        const dayOfWeek = today.getDay();
        const dayNames = [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
        ];
        const todayDayName = dayNames[dayOfWeek];
        return this.schedulesService.getTeacherTodaySchedules(user.id, todayDayName);
    }
};
exports.SchedulesController = SchedulesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN, create_user_dto_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new schedule' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Schedule created successfully',
        type: schedule_entity_1.Schedule,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Schedule conflict detected' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_schedule_dto_1.CreateScheduleDto, Object]),
    __metadata("design:returntype", Promise)
], SchedulesController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('bulk'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN, create_user_dto_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Create multiple schedules in bulk' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Schedules created successfully',
        type: [schedule_entity_1.Schedule],
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bulk_create_schedules_dto_1.BulkCreateSchedulesDto, Object]),
    __metadata("design:returntype", Promise)
], SchedulesController.prototype, "createBulk", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN, create_user_dto_1.UserRole.TEACHER, create_user_dto_1.UserRole.STUDENT),
    (0, swagger_1.ApiOperation)({ summary: 'Get all schedules with pagination and filtering' }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        required: false,
        type: Number,
        description: 'Page number',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Items per page',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'sectionId',
        required: false,
        type: String,
        description: 'Filter by section ID',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'teacherId',
        required: false,
        type: String,
        description: 'Filter by teacher ID',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'dayOfWeek',
        required: false,
        enum: [
            'MONDAY',
            'TUESDAY',
            'WEDNESDAY',
            'THURSDAY',
            'FRIDAY',
            'SATURDAY',
            'SUNDAY',
        ],
        description: 'Filter by day of week',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'schoolYear',
        required: false,
        type: String,
        description: 'Filter by school year',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'semester',
        required: false,
        enum: ['FIRST', 'SECOND', 'SUMMER'],
        description: 'Filter by semester',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Schedules retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Schedule' },
                },
                pagination: {
                    type: 'object',
                    properties: {
                        page: { type: 'number' },
                        limit: { type: 'number' },
                        total: { type: 'number' },
                        pages: { type: 'number' },
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('sectionId')),
    __param(3, (0, common_1.Query)('teacherId')),
    __param(4, (0, common_1.Query)('dayOfWeek')),
    __param(5, (0, common_1.Query)('schoolYear')),
    __param(6, (0, common_1.Query)('semester')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], SchedulesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('search'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Search schedules by teacher name (Admin only)' }),
    (0, swagger_1.ApiQuery)({
        name: 'teacherName',
        required: true,
        type: String,
        description: 'Teacher name to search for',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        required: false,
        type: Number,
        description: 'Page number',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Items per page',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Search results retrieved successfully',
        type: [schedule_entity_1.Schedule],
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin access required',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_schedules_dto_1.SearchSchedulesDto]),
    __metadata("design:returntype", Promise)
], SchedulesController.prototype, "searchSchedules", null);
__decorate([
    (0, common_1.Get)('section/:sectionId'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN, create_user_dto_1.UserRole.TEACHER, create_user_dto_1.UserRole.STUDENT),
    (0, swagger_1.ApiOperation)({ summary: 'Get all schedules for a specific section' }),
    (0, swagger_1.ApiParam)({ name: 'sectionId', description: 'Section ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Section schedules retrieved successfully',
        type: [schedule_entity_1.Schedule],
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Section not found' }),
    __param(0, (0, common_1.Param)('sectionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SchedulesController.prototype, "getSchedulesBySection", null);
__decorate([
    (0, common_1.Get)('teacher/:teacherId'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN, create_user_dto_1.UserRole.TEACHER, create_user_dto_1.UserRole.STUDENT),
    (0, swagger_1.ApiOperation)({ summary: 'Get all schedules for a specific teacher' }),
    (0, swagger_1.ApiParam)({ name: 'teacherId', description: 'Teacher ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Teacher schedules retrieved successfully',
        type: [schedule_entity_1.Schedule],
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Teacher not found' }),
    __param(0, (0, common_1.Param)('teacherId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SchedulesController.prototype, "getSchedulesByTeacher", null);
__decorate([
    (0, common_1.Get)('student/:studentId'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN, create_user_dto_1.UserRole.TEACHER, create_user_dto_1.UserRole.STUDENT),
    (0, swagger_1.ApiOperation)({ summary: 'Get all schedules for a specific student' }),
    (0, swagger_1.ApiParam)({ name: 'studentId', description: 'Student ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Student schedules retrieved successfully',
        type: [schedule_entity_1.Schedule],
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Student not found' }),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SchedulesController.prototype, "getStudentSchedules", null);
__decorate([
    (0, common_1.Get)('my-schedule'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.STUDENT),
    (0, swagger_1.ApiOperation)({ summary: "Get authenticated student's schedule" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Student schedule retrieved successfully',
        type: [schedule_entity_1.Schedule],
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Student access required',
    }),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SchedulesController.prototype, "getMySchedule", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN, create_user_dto_1.UserRole.TEACHER, create_user_dto_1.UserRole.STUDENT),
    (0, swagger_1.ApiOperation)({ summary: 'Get schedule by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Schedule ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Schedule retrieved successfully',
        type: schedule_entity_1.Schedule,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Schedule not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SchedulesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN, create_user_dto_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Update schedule' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Schedule ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Schedule updated successfully',
        type: schedule_entity_1.Schedule,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Schedule not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Schedule conflict detected' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_schedule_dto_1.UpdateScheduleDto, Object]),
    __metadata("design:returntype", Promise)
], SchedulesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN, create_user_dto_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Delete schedule' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Schedule ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Schedule deleted successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Schedule not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SchedulesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/students'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN, create_user_dto_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Assign students to schedule' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Schedule ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Students assigned to schedule successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - insufficient permissions',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Schedule not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assign_students_dto_1.AssignStudentsDto, Object]),
    __metadata("design:returntype", Promise)
], SchedulesController.prototype, "assignStudents", null);
__decorate([
    (0, common_1.Delete)(':id/students'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN, create_user_dto_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Remove students from schedule' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Schedule ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Students removed from schedule successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - insufficient permissions',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Schedule not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assign_students_dto_1.AssignStudentsDto, Object]),
    __metadata("design:returntype", Promise)
], SchedulesController.prototype, "removeStudents", null);
__decorate([
    (0, common_1.Post)('check-conflicts'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN, create_user_dto_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Check for schedule conflicts' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Conflict check completed successfully',
        schema: {
            type: 'object',
            properties: {
                hasConflicts: { type: 'boolean' },
                conflicts: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            type: { type: 'string' },
                            message: { type: 'string' },
                            conflictingSchedule: { $ref: '#/components/schemas/Schedule' },
                        },
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [conflict_check_dto_1.ConflictCheckDto]),
    __metadata("design:returntype", Promise)
], SchedulesController.prototype, "checkConflicts", null);
__decorate([
    (0, common_1.Get)('teacher/today'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({
        summary: "Get today's schedules for authenticated teacher",
        description: "Returns all schedules for the authenticated teacher for today's day of the week",
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Today's teacher schedules retrieved successfully",
        type: [schedule_entity_1.Schedule],
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Teacher access required',
    }),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SchedulesController.prototype, "getTeacherTodaySchedules", null);
exports.SchedulesController = SchedulesController = SchedulesController_1 = __decorate([
    (0, swagger_1.ApiTags)('Schedules'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('schedules'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.UseInterceptors)(audit_interceptor_1.AuditInterceptor),
    __metadata("design:paramtypes", [schedules_service_1.SchedulesService])
], SchedulesController);
//# sourceMappingURL=schedules.controller.js.map