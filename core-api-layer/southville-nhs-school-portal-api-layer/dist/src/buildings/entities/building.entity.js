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
exports.Building = void 0;
const swagger_1 = require("@nestjs/swagger");
class Building {
    id;
    buildingName;
    code;
    capacity;
    createdAt;
    updatedAt;
    floors;
    stats;
}
exports.Building = Building;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Building ID',
    }),
    __metadata("design:type", String)
], Building.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Main Campus Building',
        description: 'Building name',
    }),
    __metadata("design:type", String)
], Building.prototype, "buildingName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'MCB',
        description: 'Building code',
    }),
    __metadata("design:type", String)
], Building.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1000,
        description: 'Building capacity',
        required: false,
    }),
    __metadata("design:type", Number)
], Building.prototype, "capacity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2024-01-15T10:30:00Z',
        description: 'Creation timestamp',
    }),
    __metadata("design:type", String)
], Building.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2024-01-15T10:30:00Z',
        description: 'Last update timestamp',
    }),
    __metadata("design:type", String)
], Building.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Floors in this building',
        required: false,
    }),
    __metadata("design:type", Array)
], Building.prototype, "floors", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Building statistics',
        required: false,
    }),
    __metadata("design:type", Object)
], Building.prototype, "stats", void 0);
//# sourceMappingURL=building.entity.js.map