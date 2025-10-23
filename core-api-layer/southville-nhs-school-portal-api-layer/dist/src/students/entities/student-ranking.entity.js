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
exports.StudentRanking = void 0;
const swagger_1 = require("@nestjs/swagger");
class StudentRanking {
    id;
    student_id;
    grade_level;
    rank;
    honor_status;
    quarter;
    school_year;
    created_at;
    updated_at;
    student;
}
exports.StudentRanking = StudentRanking;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ranking ID (UUID)' }),
    __metadata("design:type", String)
], StudentRanking.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student ID (UUID)' }),
    __metadata("design:type", String)
], StudentRanking.prototype, "student_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Grade level', example: 'Grade 7' }),
    __metadata("design:type", String)
], StudentRanking.prototype, "grade_level", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student rank (1-100)', example: 15 }),
    __metadata("design:type", Number)
], StudentRanking.prototype, "rank", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Honor status',
        example: 'With High Honors',
        required: false,
    }),
    __metadata("design:type", String)
], StudentRanking.prototype, "honor_status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Academic quarter', example: 'Q1' }),
    __metadata("design:type", String)
], StudentRanking.prototype, "quarter", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'School year', example: '2024-2025' }),
    __metadata("design:type", String)
], StudentRanking.prototype, "school_year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Created at timestamp' }),
    __metadata("design:type", String)
], StudentRanking.prototype, "created_at", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Updated at timestamp' }),
    __metadata("design:type", String)
], StudentRanking.prototype, "updated_at", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Student information',
        required: false,
    }),
    __metadata("design:type", Object)
], StudentRanking.prototype, "student", void 0);
//# sourceMappingURL=student-ranking.entity.js.map