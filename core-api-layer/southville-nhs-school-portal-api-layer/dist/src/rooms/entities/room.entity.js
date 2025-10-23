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
exports.Room = void 0;
const swagger_1 = require("@nestjs/swagger");
class Room {
    id;
    floorId;
    name;
    roomNumber;
    capacity;
    status;
    displayOrder;
    createdAt;
    updatedAt;
    floor;
    building;
}
exports.Room = Room;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Room ID',
    }),
    __metadata("design:type", String)
], Room.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Floor ID',
    }),
    __metadata("design:type", String)
], Room.prototype, "floorId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Room 101',
        description: 'Room name',
        required: false,
    }),
    __metadata("design:type", String)
], Room.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '101',
        description: 'Room number (auto-generated: 101, 102, 103...)',
    }),
    __metadata("design:type", String)
], Room.prototype, "roomNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 30,
        description: 'Room capacity',
        required: false,
    }),
    __metadata("design:type", Number)
], Room.prototype, "capacity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Available',
        description: 'Room status',
        enum: ['Available', 'Occupied', 'Maintenance'],
    }),
    __metadata("design:type", String)
], Room.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: 'Display order for drag & drop',
        required: false,
    }),
    __metadata("design:type", Number)
], Room.prototype, "displayOrder", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2024-01-15T10:30:00Z',
        description: 'Creation timestamp',
    }),
    __metadata("design:type", String)
], Room.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2024-01-15T10:30:00Z',
        description: 'Last update timestamp',
    }),
    __metadata("design:type", String)
], Room.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Floor information',
        required: false,
    }),
    __metadata("design:type", Object)
], Room.prototype, "floor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Building information (through floor)',
        required: false,
    }),
    __metadata("design:type", Object)
], Room.prototype, "building", void 0);
//# sourceMappingURL=room.entity.js.map