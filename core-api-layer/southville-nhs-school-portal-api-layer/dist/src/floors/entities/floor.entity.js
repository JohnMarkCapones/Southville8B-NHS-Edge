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
exports.Floor = void 0;
const swagger_1 = require("@nestjs/swagger");
class Floor {
    id;
    buildingId;
    name;
    number;
    createdAt;
    updatedAt;
    building;
    rooms;
}
exports.Floor = Floor;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Floor ID',
    }),
    __metadata("design:type", String)
], Floor.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Building ID',
    }),
    __metadata("design:type", String)
], Floor.prototype, "buildingId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Ground Floor',
        description: 'Floor name',
    }),
    __metadata("design:type", String)
], Floor.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: 'Floor number',
    }),
    __metadata("design:type", Number)
], Floor.prototype, "number", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2024-01-15T10:30:00Z',
        description: 'Creation timestamp',
    }),
    __metadata("design:type", String)
], Floor.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2024-01-15T10:30:00Z',
        description: 'Last update timestamp',
    }),
    __metadata("design:type", String)
], Floor.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Building information',
        required: false,
    }),
    __metadata("design:type", Object)
], Floor.prototype, "building", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Rooms on this floor',
        required: false,
    }),
    __metadata("design:type", Array)
], Floor.prototype, "rooms", void 0);
//# sourceMappingURL=floor.entity.js.map