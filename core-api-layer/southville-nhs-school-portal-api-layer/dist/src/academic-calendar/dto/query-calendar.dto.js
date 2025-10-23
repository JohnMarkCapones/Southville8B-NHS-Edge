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
exports.QueryCalendarDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class QueryCalendarDto {
    year;
    month_name;
    term;
    date;
    includeDays = false;
    includeMarkers = false;
    page = 1;
    limit = 10;
    sortBy = 'start_date';
    sortOrder = 'ASC';
}
exports.QueryCalendarDto = QueryCalendarDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by academic year (e.g., "2024-2025")',
        example: '2024-2025',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryCalendarDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by month name (e.g., "October")',
        example: 'October',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryCalendarDto.prototype, "month_name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by term (e.g., "First Term")',
        example: 'First Term',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryCalendarDto.prototype, "term", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter calendars that include this date (ISO 8601 date string)',
        example: '2024-10-15',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], QueryCalendarDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Include calendar days in the response',
        example: true,
        default: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === true || String(value).toLowerCase() === 'true'),
    __metadata("design:type", Boolean)
], QueryCalendarDto.prototype, "includeDays", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Include calendar markers in the response',
        example: true,
        default: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === true || String(value).toLowerCase() === 'true'),
    __metadata("design:type", Boolean)
], QueryCalendarDto.prototype, "includeMarkers", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Page number for pagination',
        example: 1,
        minimum: 1,
        default: 1,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryCalendarDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Number of items per page',
        example: 10,
        minimum: 1,
        maximum: 100,
        default: 10,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QueryCalendarDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Sort by field',
        example: 'start_date',
        enum: [
            'year',
            'month_name',
            'term',
            'start_date',
            'end_date',
            'created_at',
        ],
        default: 'start_date',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['year', 'month_name', 'term', 'start_date', 'end_date', 'created_at']),
    __metadata("design:type", String)
], QueryCalendarDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Sort order',
        example: 'ASC',
        enum: ['ASC', 'DESC'],
        default: 'ASC',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['ASC', 'DESC']),
    (0, class_transformer_1.Transform)(({ value }) => String(value || 'ASC').toUpperCase()),
    __metadata("design:type", String)
], QueryCalendarDto.prototype, "sortOrder", void 0);
//# sourceMappingURL=query-calendar.dto.js.map