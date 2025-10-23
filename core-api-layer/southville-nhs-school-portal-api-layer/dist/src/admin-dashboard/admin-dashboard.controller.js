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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminDashboardController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const rxjs_1 = require("rxjs");
const admin_dashboard_service_1 = require("./admin-dashboard.service");
const common_2 = require("@nestjs/common");
const supabase_auth_guard_1 = require("../auth/supabase-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const create_user_dto_1 = require("../users/dto/create-user.dto");
let AdminDashboardController = class AdminDashboardController {
    adminDashboardService;
    constructor(adminDashboardService) {
        this.adminDashboardService = adminDashboardService;
    }
    async getMetrics() {
        return await this.adminDashboardService.triggerMetricsUpdate();
    }
    streamMetrics() {
        return this.adminDashboardService.getMetricsStream();
    }
};
exports.AdminDashboardController = AdminDashboardController;
__decorate([
    (0, common_1.Get)('metrics'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Get desktop admin dashboard metrics',
        description: 'Get current desktop admin dashboard metrics (one-time request)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Current admin dashboard metrics',
        schema: {
            type: 'object',
            properties: {
                totalStudents: {
                    type: 'number',
                    description: 'Number of active students',
                },
                activeTeachers: {
                    type: 'number',
                    description: 'Number of active teachers',
                },
                totalSections: { type: 'number', description: 'Number of sections' },
                onlineUsersCount: {
                    type: 'number',
                    description: 'Number of online users',
                },
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
], AdminDashboardController.prototype, "getMetrics", null);
__decorate([
    (0, common_1.Sse)('metrics/stream'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Get real-time desktop admin dashboard metrics stream',
        description: 'Server-Sent Events stream for live desktop admin dashboard metrics updates',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'SSE stream of admin dashboard metrics',
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
], AdminDashboardController.prototype, "streamMetrics", null);
exports.AdminDashboardController = AdminDashboardController = __decorate([
    (0, swagger_1.ApiTags)('Desktop Admin Dashboard'),
    (0, common_1.Controller)('desktop-admin-dashboard'),
    (0, common_2.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [admin_dashboard_service_1.AdminDashboardService])
], AdminDashboardController);
//# sourceMappingURL=admin-dashboard.controller.js.map