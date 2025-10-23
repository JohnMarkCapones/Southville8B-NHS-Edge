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
exports.Hotspot = void 0;
const swagger_1 = require("@nestjs/swagger");
class Hotspot {
    id;
    location_id;
    label;
    x_position;
    y_position;
    link_to_location_id;
    created_at;
    location;
    linked_location;
}
exports.Hotspot = Hotspot;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Hotspot ID (UUID)' }),
    __metadata("design:type", String)
], Hotspot.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Location ID where this hotspot belongs',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], Hotspot.prototype, "location_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Hotspot label/name',
        example: 'Library Entrance',
    }),
    __metadata("design:type", String)
], Hotspot.prototype, "label", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'X position as percentage (0-100)',
        example: 45.5,
    }),
    __metadata("design:type", Number)
], Hotspot.prototype, "x_position", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Y position as percentage (0-100)',
        example: 32.8,
    }),
    __metadata("design:type", Number)
], Hotspot.prototype, "y_position", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of location to link to (for tour navigation)',
        example: '123e4567-e89b-12d3-a456-426614174001',
        required: false,
    }),
    __metadata("design:type", String)
], Hotspot.prototype, "link_to_location_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Created at timestamp' }),
    __metadata("design:type", String)
], Hotspot.prototype, "created_at", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Location where this hotspot belongs',
        required: false,
    }),
    __metadata("design:type", Object)
], Hotspot.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Linked location for tour navigation',
        required: false,
    }),
    __metadata("design:type", Object)
], Hotspot.prototype, "linked_location", void 0);
//# sourceMappingURL=hotspot.entity.js.map