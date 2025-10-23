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
var TeacherActivityController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeacherActivityController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const teacher_activity_service_1 = require("./teacher-activity.service");
const supabase_auth_guard_1 = require("../auth/supabase-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const auth_user_decorator_1 = require("../auth/auth-user.decorator");
const create_user_dto_1 = require("../users/dto/create-user.dto");
let TeacherActivityController = TeacherActivityController_1 = class TeacherActivityController {
    teacherActivityService;
    logger = new common_1.Logger(TeacherActivityController_1.name);
    constructor(teacherActivityService) {
        this.teacherActivityService = teacherActivityService;
    }
    async getRecentActivities(user) {
        this.logger.log(`Getting recent activities for teacher: ${user.id}`);
        return this.teacherActivityService.getRecentActivities(user.id);
    }
};
exports.TeacherActivityController = TeacherActivityController;
__decorate([
    (0, common_1.Get)('recent'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get recent student activities for authenticated teacher',
        description: "Returns recent activities from students in the teacher's classes (submissions, quiz attempts, downloads)",
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Recent student activities retrieved successfully',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    studentName: { type: 'string', description: 'Student full name' },
                    studentInitials: { type: 'string', description: 'Student initials' },
                    activity: { type: 'string', description: 'Activity description' },
                    timeAgo: { type: 'string', description: 'Human-readable time ago' },
                    timestamp: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Activity timestamp',
                    },
                },
            },
        },
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
], TeacherActivityController.prototype, "getRecentActivities", null);
exports.TeacherActivityController = TeacherActivityController = TeacherActivityController_1 = __decorate([
    (0, swagger_1.ApiTags)('Teacher Activity'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('teacher-activity'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [teacher_activity_service_1.TeacherActivityService])
], TeacherActivityController);
//# sourceMappingURL=teacher-activity.controller.js.map