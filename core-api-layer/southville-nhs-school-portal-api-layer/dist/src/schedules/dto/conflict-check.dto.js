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
exports.ConflictCheckDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const schedule_entity_1 = require("../entities/schedule.entity");
let IsValidTimeFormatConstraint = class IsValidTimeFormatConstraint {
    validate(timeString) {
        if (!timeString)
            return false;
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
        return timeRegex.test(timeString);
    }
    defaultMessage() {
        return 'Time must be in HH:mm:ss format (e.g., 08:30:00)';
    }
};
IsValidTimeFormatConstraint = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: 'isValidTimeFormat', async: false })
], IsValidTimeFormatConstraint);
let IsValidSchoolYearConstraint = class IsValidSchoolYearConstraint {
    validate(schoolYear) {
        if (!schoolYear)
            return false;
        const yearRegex = /^\d{4}-\d{4}$/;
        if (!yearRegex.test(schoolYear))
            return false;
        const [startYear, endYear] = schoolYear.split('-').map(Number);
        return endYear === startYear + 1;
    }
    defaultMessage() {
        return 'School year must be in YYYY-YYYY format where end year is start year + 1 (e.g., 2024-2025)';
    }
};
IsValidSchoolYearConstraint = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: 'isValidSchoolYear', async: false })
], IsValidSchoolYearConstraint);
let IsValidTimeOrderConstraint = class IsValidTimeOrderConstraint {
    validate(value, args) {
        const object = args.object;
        const startTime = object.startTime;
        const endTime = object.endTime;
        if (!startTime || !endTime)
            return true;
        return startTime < endTime;
    }
    defaultMessage() {
        return 'End time must be after start time';
    }
};
IsValidTimeOrderConstraint = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: 'isValidTimeOrder', async: false })
], IsValidTimeOrderConstraint);
class ConflictCheckDto {
    excludeScheduleId;
    teacherId;
    roomId;
    sectionId;
    dayOfWeek;
    startTime;
    endTime;
    schoolYear;
    semester;
}
exports.ConflictCheckDto = ConflictCheckDto;
__decorate([
    (0, class_validator_1.IsUUID)('4'),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'Schedule ID to exclude from conflict check (for updates)',
        required: false,
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], ConflictCheckDto.prototype, "excludeScheduleId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)('4'),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'Teacher ID to check for conflicts',
        required: false,
        example: '123e4567-e89b-12d3-a456-426614174001',
    }),
    __metadata("design:type", String)
], ConflictCheckDto.prototype, "teacherId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)('4'),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'Room ID to check for conflicts',
        required: false,
        example: '123e4567-e89b-12d3-a456-426614174002',
    }),
    __metadata("design:type", String)
], ConflictCheckDto.prototype, "roomId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)('4'),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'Section ID to check for conflicts',
        required: false,
        example: '123e4567-e89b-12d3-a456-426614174003',
    }),
    __metadata("design:type", String)
], ConflictCheckDto.prototype, "sectionId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(schedule_entity_1.DayOfWeek),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'Day of the week to check',
        enum: schedule_entity_1.DayOfWeek,
        required: false,
        example: schedule_entity_1.DayOfWeek.MONDAY,
    }),
    __metadata("design:type", String)
], ConflictCheckDto.prototype, "dayOfWeek", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Validate)(IsValidTimeFormatConstraint),
    (0, swagger_1.ApiProperty)({
        description: 'Start time to check',
        required: false,
        example: '08:00:00',
    }),
    __metadata("design:type", String)
], ConflictCheckDto.prototype, "startTime", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Validate)(IsValidTimeFormatConstraint),
    (0, class_validator_1.Validate)(IsValidTimeOrderConstraint),
    (0, swagger_1.ApiProperty)({
        description: 'End time to check',
        required: false,
        example: '09:00:00',
    }),
    __metadata("design:type", String)
], ConflictCheckDto.prototype, "endTime", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'School year to check conflicts for',
        required: false,
        example: 2024,
    }),
    __metadata("design:type", Number)
], ConflictCheckDto.prototype, "schoolYear", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(schedule_entity_1.Semester),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'Semester to check conflicts for',
        enum: schedule_entity_1.Semester,
        required: false,
        example: schedule_entity_1.Semester.FIRST,
    }),
    __metadata("design:type", String)
], ConflictCheckDto.prototype, "semester", void 0);
//# sourceMappingURL=conflict-check.dto.js.map