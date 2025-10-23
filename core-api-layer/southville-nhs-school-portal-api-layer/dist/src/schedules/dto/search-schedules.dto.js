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
exports.SearchSchedulesDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const schedule_entity_1 = require("../entities/schedule.entity");
class SearchSchedulesDto {
    search;
    sectionId;
    teacherId;
    dayOfWeek;
    schoolYear;
    semester;
    page = 1;
    limit = 10;
}
exports.SearchSchedulesDto = SearchSchedulesDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'Search term for teacher name, subject name, or section name',
        required: false,
        example: 'John Doe',
    }),
    __metadata("design:type", String)
], SearchSchedulesDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsUUID)('4'),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'Filter by section ID',
        required: false,
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], SearchSchedulesDto.prototype, "sectionId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)('4'),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'Filter by teacher ID',
        required: false,
        example: '123e4567-e89b-12d3-a456-426614174001',
    }),
    __metadata("design:type", String)
], SearchSchedulesDto.prototype, "teacherId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(schedule_entity_1.DayOfWeek),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'Filter by day of the week',
        enum: schedule_entity_1.DayOfWeek,
        required: false,
        example: schedule_entity_1.DayOfWeek.MONDAY,
    }),
    __metadata("design:type", String)
], SearchSchedulesDto.prototype, "dayOfWeek", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'Filter by school year',
        required: false,
        example: '2024-2025',
    }),
    __metadata("design:type", String)
], SearchSchedulesDto.prototype, "schoolYear", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(schedule_entity_1.Semester),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'Filter by semester',
        enum: schedule_entity_1.Semester,
        required: false,
        example: schedule_entity_1.Semester.FIRST,
    }),
    __metadata("design:type", String)
], SearchSchedulesDto.prototype, "semester", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'Page number',
        required: false,
        example: 1,
        minimum: 1,
        maximum: 100,
    }),
    __metadata("design:type", Number)
], SearchSchedulesDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'Items per page',
        required: false,
        example: 10,
        minimum: 1,
        maximum: 100,
    }),
    __metadata("design:type", Number)
], SearchSchedulesDto.prototype, "limit", void 0);
//# sourceMappingURL=search-schedules.dto.js.map