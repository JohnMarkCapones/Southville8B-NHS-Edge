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
exports.RoomsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const rooms_service_1 = require("./rooms.service");
const create_room_dto_1 = require("./dto/create-room.dto");
const update_room_dto_1 = require("./dto/update-room.dto");
const move_room_dto_1 = require("./dto/move-room.dto");
const bulk_create_rooms_dto_1 = require("./dto/bulk-create-rooms.dto");
const reorder_rooms_dto_1 = require("./dto/reorder-rooms.dto");
const supabase_auth_guard_1 = require("../auth/supabase-auth.guard");
const policies_guard_1 = require("../auth/guards/policies.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const auth_user_decorator_1 = require("../auth/auth-user.decorator");
const create_user_dto_1 = require("../users/dto/create-user.dto");
let RoomsController = class RoomsController {
    roomsService;
    constructor(roomsService) {
        this.roomsService = roomsService;
    }
    async create(createRoomDto, user) {
        console.log(`Creating room for user: ${user.email} (${user.id})`);
        return this.roomsService.create(createRoomDto);
    }
    async createBulk(bulkCreateDto, user) {
        console.log(`Bulk creating rooms for user: ${user.email} (${user.id})`);
        return this.roomsService.createBulk(bulkCreateDto);
    }
    async findAll(user, page = 1, limit = 10, search, status, floorId, buildingId, sortBy = 'created_at', sortOrder = 'desc') {
        return this.roomsService.findAll({
            page,
            limit,
            search,
            status,
            floorId,
            buildingId,
            sortBy,
            sortOrder,
        });
    }
    async findByFloor(floorId, user) {
        return this.roomsService.findByFloor(floorId);
    }
    async findByBuilding(buildingId, user) {
        return this.roomsService.findByBuilding(buildingId);
    }
    async findOne(id, user) {
        console.log(`Fetching room ${id} for user: ${user.email} (${user.id})`);
        return this.roomsService.findOne(id);
    }
    async update(id, updateRoomDto, user) {
        console.log(`Updating room ${id} for user: ${user.email} (${user.id})`);
        return this.roomsService.update(id, updateRoomDto);
    }
    async moveRoom(id, moveRoomDto, user) {
        console.log(`Moving room ${id} for user: ${user.email} (${user.id})`);
        return this.roomsService.moveRoom(id, moveRoomDto);
    }
    async reorderRooms(floorId, reorderDto, user) {
        console.log(`Reordering rooms in floor ${floorId} for user: ${user.email} (${user.id})`);
        await this.roomsService.reorderRooms(floorId, reorderDto);
        return { message: 'Rooms reordered successfully' };
    }
    async remove(id, user) {
        console.log(`Deleting room ${id} for user: ${user.email} (${user.id})`);
        await this.roomsService.remove(id);
        return { message: 'Room deleted successfully' };
    }
};
exports.RoomsController = RoomsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new room (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Room created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request - Floor not found' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_room_dto_1.CreateRoomDto, Object]),
    __metadata("design:returntype", Promise)
], RoomsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('bulk'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create multiple rooms at once (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Rooms created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request - Floor not found' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bulk_create_rooms_dto_1.BulkCreateRoomsDto, Object]),
    __metadata("design:returntype", Promise)
], RoomsController.prototype, "createBulk", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN, create_user_dto_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Get all rooms with pagination and filtering' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String }),
    (0, swagger_1.ApiQuery)({
        name: 'status',
        required: false,
        enum: ['Available', 'Occupied', 'Maintenance'],
    }),
    (0, swagger_1.ApiQuery)({ name: 'floorId', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'buildingId', required: false, type: String }),
    (0, swagger_1.ApiQuery)({
        name: 'sortBy',
        required: false,
        enum: ['created_at', 'room_number', 'name'],
    }),
    (0, swagger_1.ApiQuery)({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Rooms retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    }),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('status')),
    __param(5, (0, common_1.Query)('floorId')),
    __param(6, (0, common_1.Query)('buildingId')),
    __param(7, (0, common_1.Query)('sortBy')),
    __param(8, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], RoomsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('floor/:floorId'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN, create_user_dto_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Get rooms by floor ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Rooms retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    }),
    __param(0, (0, common_1.Param)('floorId')),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RoomsController.prototype, "findByFloor", null);
__decorate([
    (0, common_1.Get)('building/:buildingId'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN, create_user_dto_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Get rooms by building ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Rooms retrieved successfully' }),
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
], RoomsController.prototype, "findByBuilding", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN, create_user_dto_1.UserRole.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Get room by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Room retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Room not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RoomsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update room by ID (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Room updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Room not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_room_dto_1.UpdateRoomDto, Object]),
    __metadata("design:returntype", Promise)
], RoomsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/move'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Move room to different floor (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Room moved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Room not found' }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad Request - Target floor not found',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, move_room_dto_1.MoveRoomDto, Object]),
    __metadata("design:returntype", Promise)
], RoomsController.prototype, "moveRoom", null);
__decorate([
    (0, common_1.Post)('floor/:floorId/reorder'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Reorder rooms in floor (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Rooms reordered successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    }),
    __param(0, (0, common_1.Param)('floorId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, reorder_rooms_dto_1.ReorderRoomsDto, Object]),
    __metadata("design:returntype", Promise)
], RoomsController.prototype, "reorderRooms", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(create_user_dto_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete room by ID (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Room deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Room not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RoomsController.prototype, "remove", null);
exports.RoomsController = RoomsController = __decorate([
    (0, swagger_1.ApiTags)('Rooms'),
    (0, common_1.Controller)('rooms'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard, policies_guard_1.PoliciesGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [rooms_service_1.RoomsService])
], RoomsController);
//# sourceMappingURL=rooms.controller.js.map