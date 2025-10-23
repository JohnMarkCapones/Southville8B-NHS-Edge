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
var CampusFacilitiesController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampusFacilitiesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const campus_facilities_service_1 = require("./campus-facilities.service");
const create_campus_facility_dto_1 = require("./dto/create-campus-facility.dto");
const update_campus_facility_dto_1 = require("./dto/update-campus-facility.dto");
const supabase_auth_guard_1 = require("../auth/supabase-auth.guard");
const policies_guard_1 = require("../auth/guards/policies.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const auth_user_decorator_1 = require("../auth/auth-user.decorator");
const create_user_dto_1 = require("../users/dto/create-user.dto");
let CampusFacilitiesController = CampusFacilitiesController_1 = class CampusFacilitiesController {
    campusFacilitiesService;
    logger = new common_1.Logger(CampusFacilitiesController_1.name);
    constructor(campusFacilitiesService) {
        this.campusFacilitiesService = campusFacilitiesService;
    }
    async create(createCampusFacilityDto, imageFile, user) {
        this.logger.log('Creating campus facility for admin user');
        return this.campusFacilitiesService.create(createCampusFacilityDto, imageFile);
    }
    async findAll(user, page = 1, limit = 10, search, sortBy = 'created_at', sortOrder = 'desc', buildingId, floorId, type, status, domainId) {
        return this.campusFacilitiesService.findAll({
            page,
            limit,
            search,
            sortBy,
            sortOrder,
            buildingId,
            floorId,
            type,
            status,
            domainId,
        });
    }
    async findOne(id, user) {
        console.log(`Fetching campus facility ${id} for user: ${user.email} (${user.id})`);
        return this.campusFacilitiesService.findOne(id);
    }
    async update(id, updateCampusFacilityDto, imageFile, user) {
        console.log(`Updating campus facility ${id} for user: ${user?.email} (${user?.id})`);
        return this.campusFacilitiesService.update(id, updateCampusFacilityDto, imageFile);
    }
    async remove(id, user) {
        console.log(`Deleting campus facility ${id} for user: ${user.email} (${user.id})`);
        await this.campusFacilitiesService.remove(id);
        return { message: 'Campus facility deleted successfully' };
    }
};
exports.CampusFacilitiesController = CampusFacilitiesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image')),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new campus facility (Admin only)' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        description: 'Campus facility data with optional image',
        schema: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    description: 'Campus facility name',
                    example: 'Library',
                },
                description: {
                    type: 'string',
                    description: 'Campus facility description',
                    example: 'A modern library with extensive collection of books',
                },
                image: {
                    type: 'string',
                    format: 'binary',
                    description: 'Campus facility image (JPEG, PNG, WebP, max 5MB)',
                },
            },
            required: ['name'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Campus facility created successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad Request - Invalid file type or size',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_campus_facility_dto_1.CreateCampusFacilityDto, Object, Object]),
    __metadata("design:returntype", Promise)
], CampusFacilitiesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN, create_user_dto_1.UserRole.TEACHER, create_user_dto_1.UserRole.STUDENT),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all campus facilities with pagination and filtering',
    }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String }),
    (0, swagger_1.ApiQuery)({
        name: 'sortBy',
        required: false,
        enum: ['created_at', 'name', 'updated_at', 'type', 'status'],
    }),
    (0, swagger_1.ApiQuery)({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] }),
    (0, swagger_1.ApiQuery)({ name: 'buildingId', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'floorId', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false, enum: create_campus_facility_dto_1.FacilityType }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: create_campus_facility_dto_1.FacilityStatus }),
    (0, swagger_1.ApiQuery)({ name: 'domainId', required: false, type: String }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Campus facilities retrieved successfully',
    }),
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
    __param(6, (0, common_1.Query)('buildingId')),
    __param(7, (0, common_1.Query)('floorId')),
    __param(8, (0, common_1.Query)('type')),
    __param(9, (0, common_1.Query)('status')),
    __param(10, (0, common_1.Query)('domainId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], CampusFacilitiesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN, create_user_dto_1.UserRole.TEACHER, create_user_dto_1.UserRole.STUDENT),
    (0, swagger_1.ApiOperation)({ summary: 'Get campus facility by ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Campus facility retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Campus facility not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CampusFacilitiesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image')),
    (0, swagger_1.ApiOperation)({ summary: 'Update campus facility by ID (Admin only)' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        description: 'Campus facility data with optional image',
        schema: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    description: 'Campus facility name',
                    example: 'Library',
                },
                description: {
                    type: 'string',
                    description: 'Campus facility description',
                    example: 'A modern library with extensive collection of books',
                },
                image: {
                    type: 'string',
                    format: 'binary',
                    description: 'Campus facility image (JPEG, PNG, WebP, max 5MB)',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Campus facility updated successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Campus facility not found' }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad Request - Invalid file type or size',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __param(3, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_campus_facility_dto_1.UpdateCampusFacilityDto, Object, Object]),
    __metadata("design:returntype", Promise)
], CampusFacilitiesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete campus facility by ID (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Campus facility deleted successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Campus facility not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CampusFacilitiesController.prototype, "remove", null);
exports.CampusFacilitiesController = CampusFacilitiesController = CampusFacilitiesController_1 = __decorate([
    (0, swagger_1.ApiTags)('Campus Facilities'),
    (0, common_1.Controller)('campus-facilities'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, policies_guard_1.PoliciesGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [campus_facilities_service_1.CampusFacilitiesService])
], CampusFacilitiesController);
//# sourceMappingURL=campus-facilities.controller.js.map