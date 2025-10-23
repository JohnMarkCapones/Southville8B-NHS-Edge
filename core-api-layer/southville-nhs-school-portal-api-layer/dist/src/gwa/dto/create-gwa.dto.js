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
exports.CreateGwaDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateGwaDto {
    student_id;
    gwa;
    grading_period;
    school_year;
    remarks;
    honor_status;
}
exports.CreateGwaDto = CreateGwaDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Student ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateGwaDto.prototype, "student_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'General Weighted Average (50-100)',
        example: 87.5,
        minimum: 50,
        maximum: 100,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(50),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CreateGwaDto.prototype, "gwa", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Grading period',
        example: 'Q1',
        enum: ['Q1', 'Q2', 'Q3', 'Q4'],
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['Q1', 'Q2', 'Q3', 'Q4']),
    __metadata("design:type", String)
], CreateGwaDto.prototype, "grading_period", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'School year',
        example: '2024-2025',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGwaDto.prototype, "school_year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional remarks',
        example: 'Excellent performance',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGwaDto.prototype, "remarks", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Honor status',
        example: 'With Honors',
        enum: ['None', 'With Honors', 'High Honors', 'Highest Honors'],
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGwaDto.prototype, "honor_status", void 0);
//# sourceMappingURL=create-gwa.dto.js.map