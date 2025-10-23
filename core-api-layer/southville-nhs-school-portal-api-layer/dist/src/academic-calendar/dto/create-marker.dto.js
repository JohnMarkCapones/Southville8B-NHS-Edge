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
exports.CreateMarkerDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateMarkerDto {
    academic_calendar_id;
    academic_calendar_day_id;
    color;
    icon;
    label;
    order_priority = 0;
}
exports.CreateMarkerDto = CreateMarkerDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID of the academic calendar this marker applies to',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateMarkerDto.prototype, "academic_calendar_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID of the specific calendar day this marker applies to',
        example: 1,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateMarkerDto.prototype, "academic_calendar_day_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Color of the marker dot (e.g., "red", "#FF0000")',
        example: 'red',
        maxLength: 20,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", String)
], CreateMarkerDto.prototype, "color", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional icon or symbol (e.g., "🎉", "📚")',
        example: '🎉',
        maxLength: 50,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateMarkerDto.prototype, "icon", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Short text label for marker',
        example: 'Holiday',
        maxLength: 100,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateMarkerDto.prototype, "label", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Order to display if multiple markers exist',
        example: 0,
        minimum: 0,
        default: 0,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateMarkerDto.prototype, "order_priority", void 0);
//# sourceMappingURL=create-marker.dto.js.map