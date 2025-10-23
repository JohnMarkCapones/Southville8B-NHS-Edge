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
exports.EventStatisticsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class EventStatisticsDto {
    totalEvents;
    thisWeekEvents;
    upcomingEvents;
    pastEvents;
    publishedEvents;
    draftEvents;
    cancelledEvents;
}
exports.EventStatisticsDto = EventStatisticsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of events' }),
    __metadata("design:type", Number)
], EventStatisticsDto.prototype, "totalEvents", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Events created this week' }),
    __metadata("design:type", Number)
], EventStatisticsDto.prototype, "thisWeekEvents", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Upcoming published events' }),
    __metadata("design:type", Number)
], EventStatisticsDto.prototype, "upcomingEvents", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Past completed events' }),
    __metadata("design:type", Number)
], EventStatisticsDto.prototype, "pastEvents", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Published events count' }),
    __metadata("design:type", Number)
], EventStatisticsDto.prototype, "publishedEvents", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Draft events count' }),
    __metadata("design:type", Number)
], EventStatisticsDto.prototype, "draftEvents", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Cancelled events count' }),
    __metadata("design:type", Number)
], EventStatisticsDto.prototype, "cancelledEvents", void 0);
//# sourceMappingURL=event-statistics.dto.js.map