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
exports.CreateHotspotDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateHotspotDto {
    locationId;
    label;
    xPosition;
    yPosition;
    linkToLocationId;
}
exports.CreateHotspotDto = CreateHotspotDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)({
        description: 'Location ID where this hotspot belongs',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], CreateHotspotDto.prototype, "locationId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(255),
    (0, swagger_1.ApiProperty)({
        description: 'Hotspot label/name',
        example: 'Library Entrance',
        minLength: 1,
        maxLength: 255,
    }),
    __metadata("design:type", String)
], CreateHotspotDto.prototype, "label", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    (0, swagger_1.ApiProperty)({
        description: 'X position as percentage (0-100)',
        example: 45.5,
        minimum: 0,
        maximum: 100,
    }),
    __metadata("design:type", Number)
], CreateHotspotDto.prototype, "xPosition", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    (0, swagger_1.ApiProperty)({
        description: 'Y position as percentage (0-100)',
        example: 32.8,
        minimum: 0,
        maximum: 100,
    }),
    __metadata("design:type", Number)
], CreateHotspotDto.prototype, "yPosition", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    (0, swagger_1.ApiProperty)({
        description: 'ID of location to link to (for tour navigation)',
        example: '123e4567-e89b-12d3-a456-426614174001',
        required: false,
    }),
    __metadata("design:type", String)
], CreateHotspotDto.prototype, "linkToLocationId", void 0);
//# sourceMappingURL=create-hotspot.dto.js.map