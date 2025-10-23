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
exports.Event = void 0;
const swagger_1 = require("@nestjs/swagger");
class Event {
    id;
    title;
    description;
    date;
    time;
    location;
    organizerId;
    eventImage;
    status;
    visibility;
    createdAt;
    updatedAt;
    organizer;
    tags;
    additionalInfo;
    highlights;
    schedule;
    faq;
}
exports.Event = Event;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Event ID' }),
    __metadata("design:type", String)
], Event.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Event title' }),
    __metadata("design:type", String)
], Event.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Event description' }),
    __metadata("design:type", String)
], Event.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Event date' }),
    __metadata("design:type", String)
], Event.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Event time' }),
    __metadata("design:type", String)
], Event.prototype, "time", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Event location' }),
    __metadata("design:type", String)
], Event.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Organizer user ID' }),
    __metadata("design:type", String)
], Event.prototype, "organizerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Event image URL', required: false }),
    __metadata("design:type", String)
], Event.prototype, "eventImage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Event status',
        enum: ['draft', 'published', 'cancelled', 'completed'],
    }),
    __metadata("design:type", String)
], Event.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Event visibility',
        enum: ['public', 'private'],
    }),
    __metadata("design:type", String)
], Event.prototype, "visibility", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Creation timestamp' }),
    __metadata("design:type", String)
], Event.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last update timestamp' }),
    __metadata("design:type", String)
], Event.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Organizer user info', required: false }),
    __metadata("design:type", Object)
], Event.prototype, "organizer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tags associated with event',
        type: 'array',
        required: false,
    }),
    __metadata("design:type", Array)
], Event.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Additional information sections',
        type: 'array',
        required: false,
    }),
    __metadata("design:type", Array)
], Event.prototype, "additionalInfo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Event highlights',
        type: 'array',
        required: false,
    }),
    __metadata("design:type", Array)
], Event.prototype, "highlights", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Event schedule',
        type: 'array',
        required: false,
    }),
    __metadata("design:type", Array)
], Event.prototype, "schedule", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Event FAQ',
        type: 'array',
        required: false,
    }),
    __metadata("design:type", Array)
], Event.prototype, "faq", void 0);
//# sourceMappingURL=event.entity.js.map