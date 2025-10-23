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
var BuildingsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildingsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const buildings_service_1 = require("./buildings.service");
const create_building_dto_1 = require("./dto/create-building.dto");
const update_building_dto_1 = require("./dto/update-building.dto");
const supabase_auth_guard_1 = require("../auth/supabase-auth.guard");
const policies_guard_1 = require("../auth/guards/policies.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const auth_user_decorator_1 = require("../auth/auth-user.decorator");
const create_user_dto_1 = require("../users/dto/create-user.dto");
let BuildingsController = BuildingsController_1 = class BuildingsController {
    buildingsService;
    logger = new common_1.Logger(BuildingsController_1.name);
    constructor(buildingsService) {
        this.buildingsService = buildingsService;
    }
    async create(createBuildingDto, user) {
        this.logger.log('Creating building for admin user');
        return this.buildingsService.create(createBuildingDto);
    }
    async findAll(user, page = 1, limit = 10, search, sortBy = 'created_at', sortOrder = 'desc') {
        return this.buildingsService.findAll({
            page,
            limit,
            search,
            sortBy,
            sortOrder,
        });
    }
    async findOne(id, user) {
        console.log(`Fetching building ${id} for user: ${user.email} (${user.id})`);
        return this.buildingsService.findOne(id);
    }
    async getStats(id, user) {
        console.log(`Fetching building stats ${id} for user: ${user.email} (${user.id})`);
        return this.buildingsService.getBuildingStats(id);
    }
    async update(id, updateBuildingDto, user) {
        console.log(`Updating building ${id} for user: ${user.email} (${user.id})`);
        console.log('RAW BODY received in controller:', JSON.stringify(updateBuildingDto));
        console.log('DTO keys:', Object.keys(updateBuildingDto));
        console.log('DTO values:', Object.values(updateBuildingDto));
        return this.buildingsService.update(id, updateBuildingDto);
    }
    async remove(id, user) {
        console.log(`Deleting building ${id} for user: ${user.email} (${user.id})`);
        await this.buildingsService.remove(id);
        return { message: 'Building deleted successfully' };
    }
};
exports.BuildingsController = BuildingsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new building (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Building created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Conflict - Building code already exists',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_building_dto_1.CreateBuildingDto, Object]),
    __metadata("design:returntype", Promise)
], BuildingsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN, create_user_dto_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Get all buildings with pagination and filtering' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String }),
    (0, swagger_1.ApiQuery)({
        name: 'sortBy',
        required: false,
        enum: ['created_at', 'building_name', 'code'],
    }),
    (0, swagger_1.ApiQuery)({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Buildings retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    }),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('sortBy')),
    __param(5, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String, String, String]),
    __metadata("design:returntype", Promise)
], BuildingsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN, create_user_dto_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Get building by ID with nested floors and rooms' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Building retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Building not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BuildingsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/stats'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN, create_user_dto_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Get building statistics' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Building statistics retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Building not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BuildingsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update building by ID (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Building updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Building not found' }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Conflict - Building code already exists',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_building_dto_1.UpdateBuildingDto, Object]),
    __metadata("design:returntype", Promise)
], BuildingsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete building by ID (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Building deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Building not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BuildingsController.prototype, "remove", null);
exports.BuildingsController = BuildingsController = BuildingsController_1 = __decorate([
    (0, swagger_1.ApiTags)('Buildings'),
    (0, common_1.Controller)('buildings'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, policies_guard_1.PoliciesGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [buildings_service_1.BuildingsService])
], BuildingsController);
//# sourceMappingURL=buildings.controller.js.map