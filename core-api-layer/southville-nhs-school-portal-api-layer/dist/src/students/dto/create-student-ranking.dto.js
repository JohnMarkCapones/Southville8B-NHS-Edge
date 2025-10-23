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
exports.CreateStudentRankingDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateStudentRankingDto {
    studentId;
    gradeLevel;
    rank;
    honorStatus;
    quarter;
    schoolYear;
}
exports.CreateStudentRankingDto = CreateStudentRankingDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Student ID (UUID)',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateStudentRankingDto.prototype, "studentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Grade level',
        example: 'Grade 7',
        enum: ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'],
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsIn)(['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10']),
    __metadata("design:type", String)
], CreateStudentRankingDto.prototype, "gradeLevel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Student rank (1-100 for top students)',
        example: 15,
        minimum: 1,
        maximum: 100,
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CreateStudentRankingDto.prototype, "rank", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Honor status',
        example: 'With High Honors',
        enum: [
            'With Highest Honors',
            'With High Honors',
            'With Honors',
            'No Honors',
        ],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['With Highest Honors', 'With High Honors', 'With Honors', 'No Honors']),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateStudentRankingDto.prototype, "honorStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Academic quarter',
        example: 'Q1',
        enum: ['Q1', 'Q2', 'Q3', 'Q4'],
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsIn)(['Q1', 'Q2', 'Q3', 'Q4']),
    __metadata("design:type", String)
], CreateStudentRankingDto.prototype, "quarter", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'School year',
        example: '2024-2025',
        pattern: '^\\d{4}-\\d{4}$',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", String)
], CreateStudentRankingDto.prototype, "schoolYear", void 0);
//# sourceMappingURL=create-student-ranking.dto.js.map