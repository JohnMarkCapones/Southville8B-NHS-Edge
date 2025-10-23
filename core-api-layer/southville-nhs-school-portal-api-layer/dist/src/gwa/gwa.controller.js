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
var GwaController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GwaController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const gwa_service_1 = require("./gwa.service");
const create_gwa_dto_1 = require("./dto/create-gwa.dto");
const update_gwa_dto_1 = require("./dto/update-gwa.dto");
const supabase_auth_guard_1 = require("../auth/supabase-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const auth_user_decorator_1 = require("../auth/auth-user.decorator");
const create_user_dto_1 = require("../users/dto/create-user.dto");
let GwaController = GwaController_1 = class GwaController {
    gwaService;
    logger = new common_1.Logger(GwaController_1.name);
    constructor(gwaService) {
        this.gwaService = gwaService;
    }
    async getAdvisoryStudentsWithGwa(user, gradingPeriod, schoolYear) {
        this.logger.log(`Getting advisory students for teacher: ${user.id}, period: ${gradingPeriod}, year: ${schoolYear}`);
        return this.gwaService.getAdvisoryStudentsWithGwa(user.id, gradingPeriod, schoolYear);
    }
    async createGwaEntry(user, createGwaDto) {
        this.logger.log(`Creating GWA entry for student: ${createGwaDto.student_id}`);
        return this.gwaService.createGwaEntry(createGwaDto, user.id);
    }
    async updateGwaEntry(user, id, updateGwaDto) {
        this.logger.log(`Updating GWA entry: ${id}`);
        return this.gwaService.updateGwaEntry(id, updateGwaDto, user.id);
    }
    async deleteGwaEntry(user, id) {
        this.logger.log(`Deleting GWA entry: ${id}`);
        await this.gwaService.deleteGwaEntry(id, user.id);
        return { message: 'GWA entry deleted successfully' };
    }
};
exports.GwaController = GwaController;
__decorate([
    (0, common_1.Get)('teacher/advisory-students'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({
        summary: "Get students in teacher's advisory section with GWA records",
        description: "Returns all students in the authenticated teacher's advisory section along with their GWA records for the specified grading period and school year",
    }),
    (0, swagger_1.ApiQuery)({
        name: 'grading_period',
        description: 'Grading period (Q1, Q2, Q3, Q4)',
        example: 'Q1',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'school_year',
        description: 'School year (e.g., "2024-2025")',
        example: '2024-2025',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Students with GWA records retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                students: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            student_id: { type: 'string', description: 'Student UUID' },
                            student_name: {
                                type: 'string',
                                description: 'Student full name',
                            },
                            student_number: { type: 'string', description: 'Student number' },
                            gwa: { type: 'number', description: 'GWA value (50-100)' },
                            remarks: { type: 'string', description: 'Optional remarks' },
                            honor_status: { type: 'string', description: 'Honor status' },
                            gwa_id: {
                                type: 'string',
                                description: 'GWA record ID (null if no entry)',
                            },
                        },
                    },
                },
                section_name: { type: 'string', description: 'Advisory section name' },
                grade_level: { type: 'string', description: 'Grade level' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Teacher access required',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Teacher or section not found' }),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Query)('grading_period')),
    __param(2, (0, common_1.Query)('school_year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], GwaController.prototype, "getAdvisoryStudentsWithGwa", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({
        summary: 'Create new GWA entry',
        description: "Creates a new GWA entry for a student in the teacher's advisory section",
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'GWA entry created successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string', description: 'GWA entry ID' },
                student_id: { type: 'string', description: 'Student ID' },
                gwa: { type: 'number', description: 'GWA value' },
                grading_period: { type: 'string', description: 'Grading period' },
                school_year: { type: 'string', description: 'School year' },
                remarks: { type: 'string', description: 'Remarks' },
                honor_status: { type: 'string', description: 'Honor status' },
                recorded_by: { type: 'string', description: 'Teacher who recorded' },
                created_at: { type: 'string', format: 'date-time' },
                updated_at: { type: 'string', format: 'date-time' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - Invalid data' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Teacher access required or not advisor of student',
    }),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_gwa_dto_1.CreateGwaDto]),
    __metadata("design:returntype", Promise)
], GwaController.prototype, "createGwaEntry", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({
        summary: 'Update existing GWA entry',
        description: 'Updates an existing GWA entry. Only the teacher who created the entry can update it.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'GWA entry updated successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string', description: 'GWA entry ID' },
                student_id: { type: 'string', description: 'Student ID' },
                gwa: { type: 'number', description: 'GWA value' },
                grading_period: { type: 'string', description: 'Grading period' },
                school_year: { type: 'string', description: 'School year' },
                remarks: { type: 'string', description: 'Remarks' },
                honor_status: { type: 'string', description: 'Honor status' },
                recorded_by: { type: 'string', description: 'Teacher who recorded' },
                created_at: { type: 'string', format: 'date-time' },
                updated_at: { type: 'string', format: 'date-time' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - Invalid data' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Teacher access required or not owner of entry',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'GWA entry not found' }),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_gwa_dto_1.UpdateGwaDto]),
    __metadata("design:returntype", Promise)
], GwaController.prototype, "updateGwaEntry", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete GWA entry',
        description: 'Deletes a GWA entry. Only the teacher who created the entry can delete it.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'GWA entry deleted successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Teacher access required or not owner of entry',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'GWA entry not found' }),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], GwaController.prototype, "deleteGwaEntry", null);
exports.GwaController = GwaController = GwaController_1 = __decorate([
    (0, swagger_1.ApiTags)('GWA Management'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('gwa'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [gwa_service_1.GwaService])
], GwaController);
//# sourceMappingURL=gwa.controller.js.map