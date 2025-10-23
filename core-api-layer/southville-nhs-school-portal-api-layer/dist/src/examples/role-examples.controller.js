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
exports.RoleExamplesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const supabase_auth_guard_1 = require("../auth/supabase-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const auth_user_decorator_1 = require("../auth/auth-user.decorator");
const auth_service_1 = require("../auth/auth.service");
let RoleExamplesController = class RoleExamplesController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async adminOnly(user) {
        const actualRole = await this.authService.getUserRoleFromDatabase(user.id);
        return {
            message: 'Admin access granted',
            user: user.email,
            role: actualRole || 'Unknown',
            data: 'Sensitive admin data',
            hierarchyNote: actualRole !== 'Admin'
                ? `Access granted via role hierarchy (${actualRole} → Admin)`
                : undefined,
        };
    }
    async teacherOnly(user) {
        const actualRole = await this.authService.getUserRoleFromDatabase(user.id);
        return {
            message: 'Teacher access granted',
            user: user.email,
            role: actualRole || 'Unknown',
            data: 'Teacher-specific data',
            hierarchyNote: actualRole !== 'Teacher'
                ? `Access granted via role hierarchy (${actualRole} → Teacher)`
                : undefined,
        };
    }
    async studentOnly(user) {
        const actualRole = await this.authService.getUserRoleFromDatabase(user.id);
        return {
            message: 'Student access granted',
            user: user.email,
            role: actualRole || 'Unknown',
            data: 'Student-specific data',
            hierarchyNote: actualRole !== 'Student'
                ? `Access granted via role hierarchy (${actualRole} → Student)`
                : undefined,
        };
    }
    async adminTeacher(user) {
        const actualRole = await this.authService.getUserRoleFromDatabase(user.id);
        return {
            message: 'Admin or Teacher access granted',
            user: user.email,
            role: actualRole || 'Unknown',
            data: 'Staff-level data',
            hierarchyNote: actualRole !== 'Admin' && actualRole !== 'Teacher'
                ? `Access granted via role hierarchy (${actualRole} → Admin/Teacher)`
                : undefined,
        };
    }
    async allRoles(user) {
        const actualRole = await this.authService.getUserRoleFromDatabase(user.id);
        return {
            message: 'Access granted to all roles',
            user: user.email,
            role: actualRole || 'Unknown',
            data: 'General data for all users',
        };
    }
    async authenticatedOnly(user) {
        const actualRole = await this.authService.getUserRoleFromDatabase(user.id);
        return {
            message: 'Access granted to any authenticated user',
            user: user.email,
            role: actualRole || 'Unknown',
            data: 'General authenticated data',
        };
    }
};
exports.RoleExamplesController = RoleExamplesController;
__decorate([
    (0, common_1.Get)('admin-only'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Admin only endpoint' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Admin access granted' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin role required' }),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RoleExamplesController.prototype, "adminOnly", null);
__decorate([
    (0, common_1.Get)('teacher-only'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Teacher only endpoint' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Teacher access granted' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Teacher role required',
    }),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RoleExamplesController.prototype, "teacherOnly", null);
__decorate([
    (0, common_1.Get)('student-only'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.STUDENT),
    (0, swagger_1.ApiOperation)({ summary: 'Student only endpoint' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Student access granted' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Student role required',
    }),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RoleExamplesController.prototype, "studentOnly", null);
__decorate([
    (0, common_1.Get)('admin-teacher'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Admin and Teacher endpoint' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Access granted' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin or Teacher role required',
    }),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RoleExamplesController.prototype, "adminTeacher", null);
__decorate([
    (0, common_1.Get)('all-roles'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(roles_decorator_1.UserRole.ADMIN, roles_decorator_1.UserRole.TEACHER, roles_decorator_1.UserRole.STUDENT),
    (0, swagger_1.ApiOperation)({ summary: 'All roles endpoint' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Access granted' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Valid role required' }),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RoleExamplesController.prototype, "allRoles", null);
__decorate([
    (0, common_1.Get)('authenticated-only'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Authenticated users only' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Access granted' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RoleExamplesController.prototype, "authenticatedOnly", null);
exports.RoleExamplesController = RoleExamplesController = __decorate([
    (0, swagger_1.ApiTags)('Role Examples'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('examples'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], RoleExamplesController);
//# sourceMappingURL=role-examples.controller.js.map