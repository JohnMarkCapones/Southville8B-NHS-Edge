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
exports.Schedule = exports.Semester = exports.DayOfWeek = void 0;
const swagger_1 = require("@nestjs/swagger");
var DayOfWeek;
(function (DayOfWeek) {
    DayOfWeek["MONDAY"] = "Monday";
    DayOfWeek["TUESDAY"] = "Tuesday";
    DayOfWeek["WEDNESDAY"] = "Wednesday";
    DayOfWeek["THURSDAY"] = "Thursday";
    DayOfWeek["FRIDAY"] = "Friday";
    DayOfWeek["SATURDAY"] = "Saturday";
    DayOfWeek["SUNDAY"] = "Sunday";
})(DayOfWeek || (exports.DayOfWeek = DayOfWeek = {}));
var Semester;
(function (Semester) {
    Semester["FIRST"] = "1st";
    Semester["SECOND"] = "2nd";
})(Semester || (exports.Semester = Semester = {}));
class Schedule {
    id;
    subjectId;
    teacherId;
    sectionId;
    roomId;
    buildingId;
    dayOfWeek;
    startTime;
    endTime;
    schoolYear;
    semester;
    createdAt;
    updatedAt;
    subject;
    teacher;
    section;
    room;
    building;
    students;
}
exports.Schedule = Schedule;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Schedule ID' }),
    __metadata("design:type", String)
], Schedule.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Subject ID' }),
    __metadata("design:type", String)
], Schedule.prototype, "subjectId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Teacher ID' }),
    __metadata("design:type", String)
], Schedule.prototype, "teacherId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Section ID' }),
    __metadata("design:type", String)
], Schedule.prototype, "sectionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Room ID' }),
    __metadata("design:type", String)
], Schedule.prototype, "roomId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Building ID' }),
    __metadata("design:type", String)
], Schedule.prototype, "buildingId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Day of the week',
        enum: DayOfWeek,
        example: DayOfWeek.MONDAY,
    }),
    __metadata("design:type", String)
], Schedule.prototype, "dayOfWeek", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Start time',
        example: '08:00:00',
    }),
    __metadata("design:type", String)
], Schedule.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'End time',
        example: '09:00:00',
    }),
    __metadata("design:type", String)
], Schedule.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'School year',
        example: '2024-2025',
    }),
    __metadata("design:type", String)
], Schedule.prototype, "schoolYear", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Semester',
        enum: Semester,
        example: Semester.FIRST,
    }),
    __metadata("design:type", String)
], Schedule.prototype, "semester", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Creation timestamp' }),
    __metadata("design:type", String)
], Schedule.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last update timestamp' }),
    __metadata("design:type", String)
], Schedule.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Subject information', required: false }),
    __metadata("design:type", Object)
], Schedule.prototype, "subject", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Teacher information', required: false }),
    __metadata("design:type", Object)
], Schedule.prototype, "teacher", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Section information', required: false }),
    __metadata("design:type", Object)
], Schedule.prototype, "section", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Room information', required: false }),
    __metadata("design:type", Object)
], Schedule.prototype, "room", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Building information', required: false }),
    __metadata("design:type", Object)
], Schedule.prototype, "building", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Students enrolled in this schedule',
        type: 'array',
        required: false,
    }),
    __metadata("design:type", Array)
], Schedule.prototype, "students", void 0);
//# sourceMappingURL=schedule.entity.js.map