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
exports.AcademicCalendarMarker = void 0;
const typeorm_1 = require("typeorm");
const academic_calendar_entity_1 = require("./academic-calendar.entity");
const academic_calendar_day_entity_1 = require("./academic-calendar-day.entity");
let AcademicCalendarMarker = class AcademicCalendarMarker {
    id;
    academic_calendar_id;
    academic_calendar_day_id;
    color;
    icon;
    label;
    order_priority;
    created_at;
    academic_calendar;
    academic_calendar_day;
};
exports.AcademicCalendarMarker = AcademicCalendarMarker;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], AcademicCalendarMarker.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], AcademicCalendarMarker.prototype, "academic_calendar_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], AcademicCalendarMarker.prototype, "academic_calendar_day_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], AcademicCalendarMarker.prototype, "color", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], AcademicCalendarMarker.prototype, "icon", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], AcademicCalendarMarker.prototype, "label", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], AcademicCalendarMarker.prototype, "order_priority", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: 'timestamp with time zone',
    }),
    __metadata("design:type", Date)
], AcademicCalendarMarker.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => academic_calendar_entity_1.AcademicCalendar, (calendar) => calendar.markers),
    (0, typeorm_1.JoinColumn)({ name: 'academic_calendar_id' }),
    __metadata("design:type", academic_calendar_entity_1.AcademicCalendar)
], AcademicCalendarMarker.prototype, "academic_calendar", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => academic_calendar_day_entity_1.AcademicCalendarDay, (day) => day.markers),
    (0, typeorm_1.JoinColumn)({ name: 'academic_calendar_day_id' }),
    __metadata("design:type", academic_calendar_day_entity_1.AcademicCalendarDay)
], AcademicCalendarMarker.prototype, "academic_calendar_day", void 0);
exports.AcademicCalendarMarker = AcademicCalendarMarker = __decorate([
    (0, typeorm_1.Entity)('academic_calendar_markers')
], AcademicCalendarMarker);
//# sourceMappingURL=academic-calendar-marker.entity.js.map