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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DesktopSidebarController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const rxjs_1 = require("rxjs");
const desktop_sidebar_service_1 = require("./desktop-sidebar.service");
const supabase_auth_guard_1 = require("../auth/supabase-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const create_user_dto_1 = require("../users/dto/create-user.dto");
const auth_user_decorator_1 = require("../auth/auth-user.decorator");
let DesktopSidebarController = class DesktopSidebarController {
    desktopSidebarService;
    constructor(desktopSidebarService) {
        this.desktopSidebarService = desktopSidebarService;
    }
    streamMetrics() {
        return this.desktopSidebarService.getMetricsStream();
    }
    async getMetrics() {
        return await this.desktopSidebarService.triggerMetricsUpdate();
    }
    streamTeacherMetrics(user) {
        return this.desktopSidebarService.getTeacherMetricsStream(user.id);
    }
    async getTeacherMetrics(user) {
        return await this.desktopSidebarService.triggerTeacherMetricsUpdate(user.id);
    }
};
exports.DesktopSidebarController = DesktopSidebarController;
__decorate([
    (0, common_1.Sse)('kpi/stream'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Get real-time sidebar KPI metrics stream',
        description: 'Server-Sent Events stream for live sidebar KPI metrics updates (Events, Teachers, Students, Sections)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'SSE stream of sidebar KPI metrics',
        schema: {
            type: 'object',
            properties: {
                data: { type: 'string', description: 'JSON string of metrics' },
                type: { type: 'string', description: 'Event type' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin access required',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", rxjs_1.Observable)
], DesktopSidebarController.prototype, "streamMetrics", null);
__decorate([
    (0, common_1.Get)('kpi'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Get current sidebar KPI metrics',
        description: 'Get current sidebar KPI metrics (one-time request)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Current sidebar KPI metrics',
        schema: {
            type: 'object',
            properties: {
                events: { type: 'number', description: 'Number of approved events' },
                teachers: { type: 'number', description: 'Number of teachers' },
                students: { type: 'number', description: 'Number of students' },
                sections: { type: 'number', description: 'Number of sections' },
                lastUpdated: { type: 'string', description: 'Last update timestamp' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin access required',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DesktopSidebarController.prototype, "getMetrics", null);
__decorate([
    (0, common_1.Sse)('teacher/kpi/stream'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get real-time teacher sidebar KPI metrics stream',
        description: 'Server-Sent Events stream for live teacher sidebar KPI metrics updates (Classes, Assignments, Students, Messages)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'SSE stream of teacher sidebar KPI metrics',
        schema: {
            type: 'object',
            properties: {
                data: { type: 'string', description: 'JSON string of teacher metrics' },
                type: { type: 'string', description: 'Event type' },
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
    __metadata("design:returntype", rxjs_1.Observable)
], DesktopSidebarController.prototype, "streamTeacherMetrics", null);
__decorate([
    (0, common_1.Get)('teacher/kpi'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({
        summary: 'Get current teacher sidebar KPI metrics',
        description: 'Get current teacher sidebar KPI metrics (one-time request)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Current teacher sidebar KPI metrics',
        schema: {
            type: 'object',
            properties: {
                totalClasses: {
                    type: 'number',
                    description: 'Number of active classes',
                },
                pendingAssignments: {
                    type: 'number',
                    description: 'Number of pending assignments',
                },
                totalStudents: { type: 'number', description: 'Number of students' },
                unreadMessages: {
                    type: 'number',
                    description: 'Number of unread messages',
                },
                lastUpdated: { type: 'string', description: 'Last update timestamp' },
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
], DesktopSidebarController.prototype, "getTeacherMetrics", null);
exports.DesktopSidebarController = DesktopSidebarController = __decorate([
    (0, swagger_1.ApiTags)('Desktop Sidebar'),
    (0, common_1.Controller)('desktop-sidebar'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [desktop_sidebar_service_1.DesktopSidebarService])
], DesktopSidebarController);
//# sourceMappingURL=desktop-sidebar.controller.js.map