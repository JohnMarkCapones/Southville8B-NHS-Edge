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
exports.CreateCalendarDayDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateCalendarDayDto {
    academic_calendar_id;
    date;
    day_of_week;
    week_number;
    is_weekend = false;
    is_holiday = false;
    is_current_day = false;
    marker_icon;
    marker_color;
    note;
}
exports.CreateCalendarDayDto = CreateCalendarDayDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the academic calendar this day belongs to',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateCalendarDayDto.prototype, "academic_calendar_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Exact date (ISO 8601 date string, e.g., "2025-10-15")',
        example: '2025-10-15',
    }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateCalendarDayDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Day name (e.g., "Monday")',
        example: 'Monday',
        maxLength: 10,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(10),
    __metadata("design:type", String)
], CreateCalendarDayDto.prototype, "day_of_week", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Week number in the month (1–6)',
        example: 1,
        minimum: 1,
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateCalendarDayDto.prototype, "week_number", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'True if Saturday or Sunday',
        example: false,
        default: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateCalendarDayDto.prototype, "is_weekend", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'True if marked as a holiday',
        example: false,
        default: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateCalendarDayDto.prototype, "is_holiday", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'True if today',
        example: false,
        default: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateCalendarDayDto.prototype, "is_current_day", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional marker icon (e.g., "⭐", "📌")',
        example: '⭐',
        maxLength: 50,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateCalendarDayDto.prototype, "marker_icon", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional highlight color (e.g., "red", "#FF0000")',
        example: 'red',
        maxLength: 20,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", String)
], CreateCalendarDayDto.prototype, "marker_color", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional note or description for the day',
        example: 'No classes due to holiday',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCalendarDayDto.prototype, "note", void 0);
//# sourceMappingURL=create-calendar-day.dto.js.map