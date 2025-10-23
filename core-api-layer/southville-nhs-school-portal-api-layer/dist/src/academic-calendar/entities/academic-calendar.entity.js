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
exports.AcademicCalendar = void 0;
const typeorm_1 = require("typeorm");
const academic_calendar_day_entity_1 = require("./academic-calendar-day.entity");
const academic_calendar_marker_entity_1 = require("./academic-calendar-marker.entity");
let AcademicCalendar = class AcademicCalendar {
    id;
    year;
    month_name;
    term;
    start_date;
    end_date;
    total_days;
    description;
    created_at;
    updated_at;
    days;
    markers;
};
exports.AcademicCalendar = AcademicCalendar;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AcademicCalendar.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], AcademicCalendar.prototype, "year", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], AcademicCalendar.prototype, "month_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], AcademicCalendar.prototype, "term", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], AcademicCalendar.prototype, "start_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], AcademicCalendar.prototype, "end_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], AcademicCalendar.prototype, "total_days", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], AcademicCalendar.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: 'timestamp with time zone',
    }),
    __metadata("design:type", Date)
], AcademicCalendar.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: 'timestamp with time zone',
    }),
    __metadata("design:type", Date)
], AcademicCalendar.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => academic_calendar_day_entity_1.AcademicCalendarDay, (day) => day.academic_calendar),
    __metadata("design:type", Array)
], AcademicCalendar.prototype, "days", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => academic_calendar_marker_entity_1.AcademicCalendarMarker, (marker) => marker.academic_calendar),
    __metadata("design:type", Array)
], AcademicCalendar.prototype, "markers", void 0);
exports.AcademicCalendar = AcademicCalendar = __decorate([
    (0, typeorm_1.Entity)('academic_calendar')
], AcademicCalendar);
//# sourceMappingURL=academic-calendar.entity.js.map