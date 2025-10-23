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
var AcademicCalendarController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcademicCalendarController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const academic_calendar_service_1 = require("./academic-calendar.service");
const create_academic_calendar_dto_1 = require("./dto/create-academic-calendar.dto");
const update_academic_calendar_dto_1 = require("./dto/update-academic-calendar.dto");
const update_calendar_day_dto_1 = require("./dto/update-calendar-day.dto");
const create_marker_dto_1 = require("./dto/create-marker.dto");
const query_calendar_dto_1 = require("./dto/query-calendar.dto");
const academic_calendar_entity_1 = require("./entities/academic-calendar.entity");
const academic_calendar_day_entity_1 = require("./entities/academic-calendar-day.entity");
const academic_calendar_marker_entity_1 = require("./entities/academic-calendar-marker.entity");
const supabase_auth_guard_1 = require("../auth/supabase-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let AcademicCalendarController = AcademicCalendarController_1 = class AcademicCalendarController {
    academicCalendarService;
    logger = new common_1.Logger(AcademicCalendarController_1.name);
    constructor(academicCalendarService) {
        this.academicCalendarService = academicCalendarService;
    }
    async create(createAcademicCalendarDto) {
        return this.academicCalendarService.create(createAcademicCalendarDto);
    }
    async findAll(queryDto) {
        return this.academicCalendarService.findAll(queryDto);
    }
    async getCurrentCalendar() {
        return this.academicCalendarService.getCurrentCalendar();
    }
    async findOne(id, includeDays) {
        return this.academicCalendarService.findOne(id, includeDays);
    }
    async update(id, updateAcademicCalendarDto) {
        return this.academicCalendarService.update(id, updateAcademicCalendarDto);
    }
    async remove(id) {
        await this.academicCalendarService.remove(id);
        return { message: 'Academic calendar deleted successfully' };
    }
    async generateDays(id) {
        await this.academicCalendarService.generateDays(id);
        return { message: 'Calendar days regenerated successfully' };
    }
    async getCalendarDays(id) {
        const calendar = await this.academicCalendarService.findOne(id, true);
        return calendar.days || [];
    }
    async updateDay(dayId, updateCalendarDayDto) {
        return this.academicCalendarService.updateDay(parseInt(dayId), updateCalendarDayDto);
    }
    async addCalendarMarker(id, createMarkerDto) {
        return this.academicCalendarService.addMarker(createMarkerDto, id);
    }
    async addDayMarker(dayId, createMarkerDto) {
        const day = await this.academicCalendarService.findDayById(dayId);
        if (!day) {
            throw new common_1.NotFoundException(`Calendar day with ID ${dayId} not found`);
        }
        return this.academicCalendarService.addMarker(createMarkerDto, day.academic_calendar_id, dayId);
    }
    async updateCurrentDay() {
        await this.academicCalendarService.updateCurrentDay();
        return { message: 'Current day updated successfully' };
    }
};
exports.AcademicCalendarController = AcademicCalendarController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new academic calendar (Admin only)',
        description: 'Create a new academic calendar with optional auto-generation of days',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Academic calendar created successfully',
        type: academic_calendar_entity_1.AcademicCalendar,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad Request - Invalid input data',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin access required',
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Conflict - Calendar already exists for the same period',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_academic_calendar_dto_1.CreateAcademicCalendarDto]),
    __metadata("design:returntype", Promise)
], AcademicCalendarController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all academic calendars',
        description: 'Retrieve all academic calendars with optional filtering and pagination',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'year',
        required: false,
        description: 'Filter by academic year',
        type: String,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'month_name',
        required: false,
        description: 'Filter by month name',
        type: String,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'term',
        required: false,
        description: 'Filter by academic term',
        type: String,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'date',
        required: false,
        description: 'Filter calendars that include this date',
        type: String,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'include_days',
        required: false,
        description: 'Include calendar days in response',
        type: Boolean,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'include_markers',
        required: false,
        description: 'Include calendar markers in response',
        type: Boolean,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        required: false,
        description: 'Page number for pagination',
        type: Number,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        description: 'Number of items per page',
        type: Number,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'sortBy',
        required: false,
        description: 'Sort by field',
        enum: ['created_at', 'start_date', 'end_date', 'year', 'month_name'],
    }),
    (0, swagger_1.ApiQuery)({
        name: 'sortOrder',
        required: false,
        description: 'Sort order',
        enum: ['ASC', 'DESC'],
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Academic calendars retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/AcademicCalendar' },
                },
                total: { type: 'number' },
                page: { type: 'number' },
                limit: { type: 'number' },
                totalPages: { type: 'number' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_calendar_dto_1.QueryCalendarDto]),
    __metadata("design:returntype", Promise)
], AcademicCalendarController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('current'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get current month calendar',
        description: 'Retrieve the academic calendar for the current month',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Current calendar retrieved successfully',
        type: academic_calendar_entity_1.AcademicCalendar,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'No current calendar found',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AcademicCalendarController.prototype, "getCurrentCalendar", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get a specific academic calendar by ID',
        description: 'Retrieve a single academic calendar with optional days',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Academic calendar ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'includeDays',
        required: false,
        description: 'Include calendar days in response',
        type: Boolean,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Academic calendar retrieved successfully',
        type: academic_calendar_entity_1.AcademicCalendar,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Academic calendar not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('includeDays')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], AcademicCalendarController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update an academic calendar (Admin only)',
        description: 'Update an existing academic calendar',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Academic calendar ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Academic calendar updated successfully',
        type: academic_calendar_entity_1.AcademicCalendar,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad Request - Invalid input data',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin access required',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Academic calendar not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_academic_calendar_dto_1.UpdateAcademicCalendarDto]),
    __metadata("design:returntype", Promise)
], AcademicCalendarController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete an academic calendar (Admin only)',
        description: 'Permanently delete an academic calendar and all related data',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Academic calendar ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Academic calendar deleted successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin access required',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Academic calendar not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicCalendarController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/generate-days'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Regenerate calendar days (Admin only)',
        description: 'Regenerate all calendar days for a specific calendar',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Academic calendar ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Calendar days regenerated successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin access required',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Academic calendar not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicCalendarController.prototype, "generateDays", null);
__decorate([
    (0, common_1.Get)(':id/days'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all days for a calendar',
        description: 'Retrieve all calendar days for a specific academic calendar',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Academic calendar ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Calendar days retrieved successfully',
        type: [academic_calendar_day_entity_1.AcademicCalendarDay],
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Academic calendar not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicCalendarController.prototype, "getCalendarDays", null);
__decorate([
    (0, common_1.Patch)('days/:dayId'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update a calendar day (Admin only)',
        description: 'Update a specific calendar day',
    }),
    (0, swagger_1.ApiParam)({
        name: 'dayId',
        description: 'Calendar day ID',
        example: '1',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Calendar day updated successfully',
        type: academic_calendar_day_entity_1.AcademicCalendarDay,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad Request - Invalid input data',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin access required',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Calendar day not found',
    }),
    __param(0, (0, common_1.Param)('dayId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_calendar_day_dto_1.UpdateCalendarDayDto]),
    __metadata("design:returntype", Promise)
], AcademicCalendarController.prototype, "updateDay", null);
__decorate([
    (0, common_1.Post)(':id/markers'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Add marker to calendar (Admin only)',
        description: 'Add a marker to an academic calendar',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Academic calendar ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Marker added successfully',
        type: academic_calendar_marker_entity_1.AcademicCalendarMarker,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad Request - Invalid input data',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin access required',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_marker_dto_1.CreateMarkerDto]),
    __metadata("design:returntype", Promise)
], AcademicCalendarController.prototype, "addCalendarMarker", null);
__decorate([
    (0, common_1.Post)('days/:dayId/markers'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Add marker to calendar day (Admin only)',
        description: 'Add a marker to a specific calendar day',
    }),
    (0, swagger_1.ApiParam)({
        name: 'dayId',
        description: 'Calendar day ID',
        example: '1',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Marker added successfully',
        type: academic_calendar_marker_entity_1.AcademicCalendarMarker,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad Request - Invalid input data',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin access required',
    }),
    __param(0, (0, common_1.Param)('dayId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_marker_dto_1.CreateMarkerDto]),
    __metadata("design:returntype", Promise)
], AcademicCalendarController.prototype, "addDayMarker", null);
__decorate([
    (0, common_1.Post)('update-current-day'),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Update current day flag (Admin only)',
        description: 'Update the current day flag for all calendar days (for cron jobs)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Current day updated successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin access required',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AcademicCalendarController.prototype, "updateCurrentDay", null);
exports.AcademicCalendarController = AcademicCalendarController = AcademicCalendarController_1 = __decorate([
    (0, swagger_1.ApiTags)('Academic Calendar'),
    (0, common_1.Controller)('academic-calendar'),
    __metadata("design:paramtypes", [academic_calendar_service_1.AcademicCalendarService])
], AcademicCalendarController);
//# sourceMappingURL=academic-calendar.controller.js.map