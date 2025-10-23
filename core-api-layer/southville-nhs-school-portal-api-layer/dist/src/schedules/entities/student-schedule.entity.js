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
exports.StudentSchedule = void 0;
const swagger_1 = require("@nestjs/swagger");
class StudentSchedule {
    id;
    scheduleId;
    studentId;
    createdAt;
    schedule;
    student;
}
exports.StudentSchedule = StudentSchedule;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student schedule assignment ID' }),
    __metadata("design:type", String)
], StudentSchedule.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Schedule ID' }),
    __metadata("design:type", String)
], StudentSchedule.prototype, "scheduleId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student ID' }),
    __metadata("design:type", String)
], StudentSchedule.prototype, "studentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Assignment timestamp' }),
    __metadata("design:type", String)
], StudentSchedule.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Schedule information', required: false }),
    __metadata("design:type", Object)
], StudentSchedule.prototype, "schedule", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student information', required: false }),
    __metadata("design:type", Object)
], StudentSchedule.prototype, "student", void 0);
//# sourceMappingURL=student-schedule.entity.js.map