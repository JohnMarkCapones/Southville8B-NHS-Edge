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
exports.AcademicCalendarDay = void 0;
const typeorm_1 = require("typeorm");
const academic_calendar_entity_1 = require("./academic-calendar.entity");
const academic_calendar_marker_entity_1 = require("./academic-calendar-marker.entity");
let AcademicCalendarDay = class AcademicCalendarDay {
    id;
    academic_calendar_id;
    date;
    day_of_week;
    week_number;
    is_weekend;
    is_holiday;
    is_current_day;
    marker_icon;
    marker_color;
    note;
    created_at;
    academic_calendar;
    markers;
};
exports.AcademicCalendarDay = AcademicCalendarDay;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], AcademicCalendarDay.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], AcademicCalendarDay.prototype, "academic_calendar_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], AcademicCalendarDay.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10 }),
    __metadata("design:type", String)
], AcademicCalendarDay.prototype, "day_of_week", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], AcademicCalendarDay.prototype, "week_number", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], AcademicCalendarDay.prototype, "is_weekend", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], AcademicCalendarDay.prototype, "is_holiday", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], AcademicCalendarDay.prototype, "is_current_day", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], AcademicCalendarDay.prototype, "marker_icon", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", String)
], AcademicCalendarDay.prototype, "marker_color", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], AcademicCalendarDay.prototype, "note", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: 'timestamp with time zone',
    }),
    __metadata("design:type", Date)
], AcademicCalendarDay.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => academic_calendar_entity_1.AcademicCalendar, (calendar) => calendar.days),
    (0, typeorm_1.JoinColumn)({ name: 'academic_calendar_id' }),
    __metadata("design:type", academic_calendar_entity_1.AcademicCalendar)
], AcademicCalendarDay.prototype, "academic_calendar", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => academic_calendar_marker_entity_1.AcademicCalendarMarker, (marker) => marker.academic_calendar_day),
    __metadata("design:type", Array)
], AcademicCalendarDay.prototype, "markers", void 0);
exports.AcademicCalendarDay = AcademicCalendarDay = __decorate([
    (0, typeorm_1.Entity)('academic_calendar_days'),
    (0, typeorm_1.Unique)(['academic_calendar_id', 'date'])
], AcademicCalendarDay);
//# sourceMappingURL=academic-calendar-day.entity.js.map