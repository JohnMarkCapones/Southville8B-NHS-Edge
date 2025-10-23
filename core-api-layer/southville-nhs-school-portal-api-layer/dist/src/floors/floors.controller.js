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
exports.FloorsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const floors_service_1 = require("./floors.service");
const create_floor_dto_1 = require("./dto/create-floor.dto");
const update_floor_dto_1 = require("./dto/update-floor.dto");
const supabase_auth_guard_1 = require("../auth/supabase-auth.guard");
const policies_guard_1 = require("../auth/guards/policies.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const auth_user_decorator_1 = require("../auth/auth-user.decorator");
const create_user_dto_1 = require("../users/dto/create-user.dto");
let FloorsController = class FloorsController {
    floorsService;
    constructor(floorsService) {
        this.floorsService = floorsService;
    }
    async create(createFloorDto, user) {
        console.log(`Creating floor for user: ${user.email} (${user.id})`);
        return this.floorsService.create(createFloorDto);
    }
    async findAll(user, page = 1, limit = 10, search, buildingId, sortBy = 'created_at', sortOrder = 'desc') {
        return this.floorsService.findAll({
            page,
            limit,
            search,
            buildingId,
            sortBy,
            sortOrder,
        });
    }
    async findByBuilding(buildingId, user) {
        return this.floorsService.findByBuilding(buildingId);
    }
    async findOne(id, user) {
        console.log(`Fetching floor ${id} for user: ${user.email} (${user.id})`);
        return this.floorsService.findOne(id);
    }
    async update(id, updateFloorDto, user) {
        console.log(`Updating floor ${id} for user: ${user.email} (${user.id})`);
        return this.floorsService.update(id, updateFloorDto);
    }
    async remove(id, user) {
        console.log(`Deleting floor ${id} for user: ${user.email} (${user.id})`);
        await this.floorsService.remove(id);
        return { message: 'Floor deleted successfully' };
    }
};
exports.FloorsController = FloorsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new floor (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Floor created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request - Building not found' }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Conflict - Floor number already exists',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_floor_dto_1.CreateFloorDto, Object]),
    __metadata("design:returntype", Promise)
], FloorsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN, create_user_dto_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Get all floors with pagination and filtering' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'buildingId', required: false, type: String }),
    (0, swagger_1.ApiQuery)({
        name: 'sortBy',
        required: false,
        enum: ['created_at', 'name', 'number'],
    }),
    (0, swagger_1.ApiQuery)({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Floors retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    }),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('buildingId')),
    __param(5, (0, common_1.Query)('sortBy')),
    __param(6, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String, String, String, String]),
    __metadata("design:returntype", Promise)
], FloorsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('building/:buildingId'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN, create_user_dto_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Get floors by building ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Floors retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    }),
    __param(0, (0, common_1.Param)('buildingId')),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FloorsController.prototype, "findByBuilding", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN, create_user_dto_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Get floor by ID with rooms' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Floor retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Floor not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FloorsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update floor by ID (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Floor updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Floor not found' }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Conflict - Floor number already exists',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_floor_dto_1.UpdateFloorDto, Object]),
    __metadata("design:returntype", Promise)
], FloorsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete floor by ID (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Floor deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Floor not found' }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad Request - Cannot delete floor with rooms',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FloorsController.prototype, "remove", null);
exports.FloorsController = FloorsController = __decorate([
    (0, swagger_1.ApiTags)('Floors'),
    (0, common_1.Controller)('floors'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, policies_guard_1.PoliciesGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [floors_service_1.FloorsService])
], FloorsController);
//# sourceMappingURL=floors.controller.js.map