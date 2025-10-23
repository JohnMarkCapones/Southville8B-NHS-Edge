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
exports.CreateAcademicCalendarDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const is_date_range_valid_validator_1 = require("./validators/is-date-range-valid.validator");
class CreateAcademicCalendarDto {
    year;
    month_name;
    term;
    start_date;
    end_date;
    description;
    auto_generate_days = true;
    _dateRangeValidation;
}
exports.CreateAcademicCalendarDto = CreateAcademicCalendarDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Academic year',
        example: '2024-2025',
        maxLength: 20,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", String)
], CreateAcademicCalendarDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Month name',
        example: 'October',
        maxLength: 50,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateAcademicCalendarDto.prototype, "month_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Academic term',
        example: 'First Term',
        maxLength: 50,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateAcademicCalendarDto.prototype, "term", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Start date of the calendar period',
        example: '2024-10-01',
    }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateAcademicCalendarDto.prototype, "start_date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'End date of the calendar period',
        example: '2024-10-31',
    }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateAcademicCalendarDto.prototype, "end_date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Description of the calendar period',
        example: 'First term of academic year 2024-2025',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAcademicCalendarDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether to automatically generate calendar days',
        example: true,
        default: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateAcademicCalendarDto.prototype, "auto_generate_days", void 0);
__decorate([
    (0, class_validator_1.Validate)(is_date_range_valid_validator_1.IsDateRangeValidConstraint),
    __metadata("design:type", Object)
], CreateAcademicCalendarDto.prototype, "_dateRangeValidation", void 0);
//# sourceMappingURL=create-academic-calendar.dto.js.map