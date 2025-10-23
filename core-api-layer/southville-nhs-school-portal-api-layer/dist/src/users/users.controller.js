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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const supabase_auth_guard_1 = require("../auth/supabase-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const policies_guard_1 = require("../auth/guards/policies.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const create_user_dto_1 = require("./dto/create-user.dto");
const auth_user_decorator_1 = require("../auth/auth-user.decorator");
const users_service_1 = require("./users.service");
const create_teacher_dto_1 = require("./dto/create-teacher.dto");
const create_admin_dto_1 = require("./dto/create-admin.dto");
const create_student_dto_1 = require("./dto/create-student.dto");
const update_user_dto_1 = require("./dto/update-user.dto");
const bulk_create_users_dto_1 = require("./dto/bulk-create-users.dto");
const import_students_csv_dto_1 = require("./dto/import-students-csv.dto");
const update_user_status_dto_1 = require("./dto/update-user-status.dto");
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    async createTeacher(createTeacherDto, user) {
        return this.usersService.createTeacher(createTeacherDto, user.id);
    }
    async createAdmin(createAdminDto, user) {
        return this.usersService.createAdmin(createAdminDto, user.id);
    }
    async createStudent(createStudentDto, user) {
        return this.usersService.createStudent(createStudentDto, user.id);
    }
    async createBulkUsers(bulkCreateDto, user) {
        return this.usersService.createBulkUsers(bulkCreateDto, user.id);
    }
    async importStudentsCsv(importDto, user) {
        return this.usersService.importStudentsFromCsv(importDto, user.id);
    }
    async findAll(user, page = 1, limit = 100, role, status, search, sortBy = 'created_at', sortOrder = 'desc') {
        return this.usersService.findAll({
            page,
            limit,
            role,
            status,
            search,
            sortBy,
            sortOrder,
        });
    }
    async exportUsers(user, format = 'csv', role) {
        return this.usersService.exportUsers(format, { role });
    }
    async getCurrentUser(user) {
        return this.usersService.findOne(user.id);
    }
    async findOne(id, user) {
        if (user.role === 'Student' && user.id !== id) {
            throw new common_1.ForbiddenException('Students can only view their own data');
        }
        return this.usersService.findOne(id);
    }
    async update(id, updateUserDto, user) {
        return this.usersService.update(id, updateUserDto);
    }
    async remove(id, user) {
        return this.usersService.remove(id);
    }
    async updateUserStatus(id, statusDto, user) {
        return this.usersService.updateUserStatus(id, statusDto);
    }
    async suspendUser(id, suspendDto, user) {
        return this.usersService.suspendUser(id, suspendDto);
    }
    async getUserProfile(id, user) {
        if (user.role === 'Student' && user.id !== id) {
            throw new common_1.ForbiddenException('Students can only view their own profile');
        }
        return this.usersService.findOne(id);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Post)('teacher'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new teacher (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Teacher created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_teacher_dto_1.CreateTeacherDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createTeacher", null);
__decorate([
    (0, common_1.Post)('admin'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new admin (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Admin created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_admin_dto_1.CreateAdminDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createAdmin", null);
__decorate([
    (0, common_1.Post)('student'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new student (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Student created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_student_dto_1.CreateStudentRequestDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createStudent", null);
__decorate([
    (0, common_1.Post)('bulk'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create multiple users (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Users created successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bulk_create_users_dto_1.BulkCreateUsersDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createBulkUsers", null);
__decorate([
    (0, common_1.Post)('import-students-csv'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Import students from CSV (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Students imported successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid CSV data' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [import_students_csv_dto_1.ImportStudentsCsvDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "importStudentsCsv", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN, create_user_dto_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Get users with pagination and filtering' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({
        name: 'role',
        required: false,
        enum: ['Admin', 'Teacher', 'Student'],
    }),
    (0, swagger_1.ApiQuery)({
        name: 'status',
        required: false,
        enum: ['Active', 'Inactive', 'Suspended'],
    }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String }),
    (0, swagger_1.ApiQuery)({
        name: 'sortBy',
        required: false,
        enum: ['created_at', 'email', 'full_name'],
    }),
    (0, swagger_1.ApiQuery)({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] }),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __param(3, (0, common_1.Query)('role')),
    __param(4, (0, common_1.Query)('status')),
    __param(5, (0, common_1.Query)('search')),
    __param(6, (0, common_1.Query)('sortBy')),
    __param(7, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('export'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Export users to CSV (Admin only)' }),
    (0, swagger_1.ApiQuery)({ name: 'format', required: false, enum: ['csv'] }),
    (0, swagger_1.ApiQuery)({
        name: 'role',
        required: false,
        enum: ['Admin', 'Teacher', 'Student'],
    }),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Query)('format')),
    __param(2, (0, common_1.Query)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "exportUsers", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN, create_user_dto_1.UserRole.TEACHER, create_user_dto_1.UserRole.STUDENT),
    (0, swagger_1.ApiOperation)({
        summary: 'Get current authenticated user profile',
        description: 'Returns the profile of the currently authenticated user with role-specific data (teacher/admin/student)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Current user profile retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getCurrentUser", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN, create_user_dto_1.UserRole.TEACHER, create_user_dto_1.UserRole.STUDENT),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN, create_user_dto_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Update a user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateUserDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a user (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update user status (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User status updated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_status_dto_1.UpdateUserStatusDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateUserStatus", null);
__decorate([
    (0, common_1.Post)(':id/suspend'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Suspend user (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User suspended successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_status_dto_1.SuspendUserDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "suspendUser", null);
__decorate([
    (0, common_1.Get)(':id/profile'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN, create_user_dto_1.UserRole.TEACHER, create_user_dto_1.UserRole.STUDENT),
    (0, swagger_1.ApiOperation)({ summary: 'Get user profile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profile retrieved successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserProfile", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, policies_guard_1.PoliciesGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map