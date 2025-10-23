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
exports.QueryGwaDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const gwa_entity_1 = require("../entities/gwa.entity");
class QueryGwaDto {
    studentId;
    gradingPeriod;
    schoolYear;
    page = 1;
    limit = 10;
    sortBy = 'created_at';
    sortOrder = 'DESC';
}
exports.QueryGwaDto = QueryGwaDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    (0, swagger_1.ApiProperty)({
        description: 'Filter by student ID',
        required: false,
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], QueryGwaDto.prototype, "studentId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(gwa_entity_1.GradingPeriod),
    (0, swagger_1.ApiProperty)({
        description: 'Filter by grading period',
        required: false,
        enum: gwa_entity_1.GradingPeriod,
        example: gwa_entity_1.GradingPeriod.Q1,
    }),
    __metadata("design:type", String)
], QueryGwaDto.prototype, "gradingPeriod", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\d{4}-\d{4}$/, {
        message: 'School year must be in format YYYY-YYYY (e.g., 2024-2025)',
    }),
    (0, swagger_1.ApiProperty)({
        description: 'Filter by school year',
        required: false,
        example: '2024-2025',
        pattern: '^\\d{4}-\\d{4}$',
    }),
    __metadata("design:type", String)
], QueryGwaDto.prototype, "schoolYear", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    (0, swagger_1.ApiProperty)({
        description: 'Page number for pagination',
        required: false,
        example: 1,
        minimum: 1,
        maximum: 100,
    }),
    __metadata("design:type", Number)
], QueryGwaDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    (0, swagger_1.ApiProperty)({
        description: 'Number of items per page',
        required: false,
        example: 10,
        minimum: 1,
        maximum: 100,
    }),
    __metadata("design:type", Number)
], QueryGwaDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['created_at', 'updated_at', 'gwa', 'grading_period', 'school_year']),
    (0, swagger_1.ApiProperty)({
        description: 'Sort by field',
        required: false,
        example: 'created_at',
        enum: ['created_at', 'updated_at', 'gwa', 'grading_period', 'school_year'],
    }),
    __metadata("design:type", String)
], QueryGwaDto.prototype, "sortBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['ASC', 'DESC']),
    (0, swagger_1.ApiProperty)({
        description: 'Sort order',
        required: false,
        example: 'desc',
        enum: ['asc', 'desc'],
    }),
    __metadata("design:type", String)
], QueryGwaDto.prototype, "sortOrder", void 0);
//# sourceMappingURL=query-gwa.dto.js.map