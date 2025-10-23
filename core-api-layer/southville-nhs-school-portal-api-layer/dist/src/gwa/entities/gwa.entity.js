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
exports.Gwa = exports.HonorStatus = exports.GradingPeriod = void 0;
const swagger_1 = require("@nestjs/swagger");
var GradingPeriod;
(function (GradingPeriod) {
    GradingPeriod["Q1"] = "Q1";
    GradingPeriod["Q2"] = "Q2";
    GradingPeriod["Q3"] = "Q3";
    GradingPeriod["Q4"] = "Q4";
})(GradingPeriod || (exports.GradingPeriod = GradingPeriod = {}));
var HonorStatus;
(function (HonorStatus) {
    HonorStatus["NONE"] = "None";
    HonorStatus["WITH_HONORS"] = "With Honors";
    HonorStatus["WITH_HIGH_HONORS"] = "With High Honors";
    HonorStatus["WITH_HIGHEST_HONORS"] = "With Highest Honors";
})(HonorStatus || (exports.HonorStatus = HonorStatus = {}));
class Gwa {
    id;
    student_id;
    gwa;
    grading_period;
    school_year;
    remarks;
    honor_status;
    recorded_by;
    created_at;
    updated_at;
    student;
    teacher;
}
exports.Gwa = Gwa;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'GWA record ID (UUID)' }),
    __metadata("design:type", String)
], Gwa.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student ID (UUID)' }),
    __metadata("design:type", String)
], Gwa.prototype, "student_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'General Weighted Average',
        example: 95.5,
        minimum: 50.0,
        maximum: 100.0,
    }),
    __metadata("design:type", Number)
], Gwa.prototype, "gwa", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Grading period',
        enum: GradingPeriod,
        example: GradingPeriod.Q1,
    }),
    __metadata("design:type", String)
], Gwa.prototype, "grading_period", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'School year',
        example: '2024-2025',
    }),
    __metadata("design:type", String)
], Gwa.prototype, "school_year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Remarks',
        required: false,
        example: 'Excellent Performance',
    }),
    __metadata("design:type", String)
], Gwa.prototype, "remarks", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Honor status',
        enum: HonorStatus,
        example: HonorStatus.WITH_HIGH_HONORS,
    }),
    __metadata("design:type", String)
], Gwa.prototype, "honor_status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Teacher who recorded this GWA (UUID)' }),
    __metadata("design:type", String)
], Gwa.prototype, "recorded_by", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Creation timestamp' }),
    __metadata("design:type", String)
], Gwa.prototype, "created_at", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last update timestamp' }),
    __metadata("design:type", String)
], Gwa.prototype, "updated_at", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student information', required: false }),
    __metadata("design:type", Object)
], Gwa.prototype, "student", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Teacher who recorded this GWA',
        required: false,
    }),
    __metadata("design:type", Object)
], Gwa.prototype, "teacher", void 0);
//# sourceMappingURL=gwa.entity.js.map