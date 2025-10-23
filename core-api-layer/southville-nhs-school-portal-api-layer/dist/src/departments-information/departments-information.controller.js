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
exports.DepartmentsInformationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const departments_information_service_1 = require("./departments-information.service");
const create_departments_information_dto_1 = require("./dto/create-departments-information.dto");
const update_departments_information_dto_1 = require("./dto/update-departments-information.dto");
const department_information_entity_1 = require("./entities/department-information.entity");
const supabase_auth_guard_1 = require("../auth/supabase-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const create_user_dto_1 = require("../users/dto/create-user.dto");
let DepartmentsInformationController = class DepartmentsInformationController {
    departmentsInformationService;
    constructor(departmentsInformationService) {
        this.departmentsInformationService = departmentsInformationService;
    }
    async create(createDepartmentsInformationDto) {
        return this.departmentsInformationService.create(createDepartmentsInformationDto);
    }
    async findAll(page, limit, departmentId) {
        return this.departmentsInformationService.findAll({
            page,
            limit,
            departmentId,
        });
    }
    async findByDepartment(departmentId) {
        return this.departmentsInformationService.findByDepartment(departmentId);
    }
    async findOne(id) {
        return this.departmentsInformationService.findOne(id);
    }
    async update(id, updateDepartmentsInformationDto) {
        return this.departmentsInformationService.update(id, updateDepartmentsInformationDto);
    }
    async remove(id) {
        return this.departmentsInformationService.remove(id);
    }
};
exports.DepartmentsInformationController = DepartmentsInformationController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create new department information (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Department information created successfully',
        type: department_information_entity_1.DepartmentInformation,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin access required',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_departments_information_dto_1.CreateDepartmentsInformationDto]),
    __metadata("design:returntype", Promise)
], DepartmentsInformationController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all departments information (Public)' }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        required: false,
        type: Number,
        description: 'Page number for pagination',
        example: 1,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Number of items per page',
        example: 10,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'departmentId',
        required: false,
        type: String,
        description: 'Filter by department ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Departments information retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/DepartmentInformation' },
                },
                total: { type: 'number' },
                page: { type: 'number' },
                limit: { type: 'number' },
                totalPages: { type: 'number' },
            },
        },
    }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('departmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", Promise)
], DepartmentsInformationController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('department/:departmentId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all information for a specific department (Public)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Department information retrieved successfully',
        type: [department_information_entity_1.DepartmentInformation],
    }),
    __param(0, (0, common_1.Param)('departmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DepartmentsInformationController.prototype, "findByDepartment", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get department information by ID (Public)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Department information retrieved successfully',
        type: department_information_entity_1.DepartmentInformation,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Department information not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DepartmentsInformationController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update department information (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Department information updated successfully',
        type: department_information_entity_1.DepartmentInformation,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin access required',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Department information not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_departments_information_dto_1.UpdateDepartmentsInformationDto]),
    __metadata("design:returntype", Promise)
], DepartmentsInformationController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete department information (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Department information deleted successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin access required',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Department information not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DepartmentsInformationController.prototype, "remove", null);
exports.DepartmentsInformationController = DepartmentsInformationController = __decorate([
    (0, swagger_1.ApiTags)('Departments Information'),
    (0, common_1.Controller)('departments-information'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [departments_information_service_1.DepartmentsInformationService])
], DepartmentsInformationController);
//# sourceMappingURL=departments-information.controller.js.map