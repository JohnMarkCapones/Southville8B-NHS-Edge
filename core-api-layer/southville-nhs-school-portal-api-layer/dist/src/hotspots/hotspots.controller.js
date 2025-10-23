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
exports.HotspotsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const hotspots_service_1 = require("./hotspots.service");
const create_hotspot_dto_1 = require("./dto/create-hotspot.dto");
const update_hotspot_dto_1 = require("./dto/update-hotspot.dto");
const hotspot_entity_1 = require("./entities/hotspot.entity");
const supabase_auth_guard_1 = require("../auth/supabase-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const create_user_dto_1 = require("../users/dto/create-user.dto");
let HotspotsController = class HotspotsController {
    hotspotsService;
    constructor(hotspotsService) {
        this.hotspotsService = hotspotsService;
    }
    async create(createHotspotDto) {
        return this.hotspotsService.create(createHotspotDto);
    }
    async findAll(page, limit, locationId) {
        return this.hotspotsService.findAll({ page, limit, locationId });
    }
    async findByLocation(locationId) {
        return this.hotspotsService.findByLocation(locationId);
    }
    async findOne(id) {
        return this.hotspotsService.findOne(id);
    }
    async update(id, updateHotspotDto) {
        return this.hotspotsService.update(id, updateHotspotDto);
    }
    async remove(id) {
        return this.hotspotsService.remove(id);
    }
};
exports.HotspotsController = HotspotsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new hotspot (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Hotspot created successfully',
        type: hotspot_entity_1.Hotspot,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin access required',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_hotspot_dto_1.CreateHotspotDto]),
    __metadata("design:returntype", Promise)
], HotspotsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all hotspots (Public)' }),
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
        name: 'locationId',
        required: false,
        type: String,
        description: 'Filter hotspots by location ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Hotspots retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Hotspot' },
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
    __param(2, (0, common_1.Query)('locationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", Promise)
], HotspotsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('location/:locationId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all hotspots for a specific location (Public)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Hotspots retrieved successfully',
        type: [hotspot_entity_1.Hotspot],
    }),
    __param(0, (0, common_1.Param)('locationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HotspotsController.prototype, "findByLocation", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a hotspot by ID (Public)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Hotspot retrieved successfully',
        type: hotspot_entity_1.Hotspot,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Hotspot not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HotspotsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update a hotspot (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Hotspot updated successfully',
        type: hotspot_entity_1.Hotspot,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin access required',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Hotspot not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_hotspot_dto_1.UpdateHotspotDto]),
    __metadata("design:returntype", Promise)
], HotspotsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a hotspot (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Hotspot deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin access required',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Hotspot not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HotspotsController.prototype, "remove", null);
exports.HotspotsController = HotspotsController = __decorate([
    (0, swagger_1.ApiTags)('Hotspots'),
    (0, common_1.Controller)('hotspots'),
    __metadata("design:paramtypes", [hotspots_service_1.HotspotsService])
], HotspotsController);
//# sourceMappingURL=hotspots.controller.js.map