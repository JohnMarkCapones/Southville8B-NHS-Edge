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
exports.CreateEventDto = exports.CreateEventFaqDto = exports.CreateEventScheduleDto = exports.CreateEventHighlightDto = exports.CreateEventAdditionalInfoDto = exports.EventVisibility = exports.EventStatus = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const sanitizeHtml = require("sanitize-html");
const common_1 = require("../../common");
var EventStatus;
(function (EventStatus) {
    EventStatus["DRAFT"] = "draft";
    EventStatus["PUBLISHED"] = "published";
    EventStatus["CANCELLED"] = "cancelled";
    EventStatus["COMPLETED"] = "completed";
})(EventStatus || (exports.EventStatus = EventStatus = {}));
var EventVisibility;
(function (EventVisibility) {
    EventVisibility["PUBLIC"] = "public";
    EventVisibility["PRIVATE"] = "private";
})(EventVisibility || (exports.EventVisibility = EventVisibility = {}));
let IsFutureDateConstraint = class IsFutureDateConstraint {
    validate(date, args) {
        if (!date)
            return false;
        const eventDate = new Date(date);
        const now = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(now.getFullYear() - 1);
        return eventDate >= oneYearAgo;
    }
    defaultMessage() {
        return 'Event date must be within the last year or in the future';
    }
};
IsFutureDateConstraint = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: 'isFutureDate', async: false })
], IsFutureDateConstraint);
let IsValidTimeConstraint = class IsValidTimeConstraint {
    validate(time, args) {
        if (!time)
            return false;
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(time);
    }
    defaultMessage() {
        return 'Time must be in HH:MM format (24-hour)';
    }
};
IsValidTimeConstraint = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: 'isValidTime', async: false })
], IsValidTimeConstraint);
class CreateEventAdditionalInfoDto {
    title;
    content;
    orderIndex;
}
exports.CreateEventAdditionalInfoDto = CreateEventAdditionalInfoDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(255),
    (0, swagger_1.ApiProperty)({
        example: 'Event Guidelines',
        description: 'Info section title',
        minLength: 3,
        maxLength: 255,
    }),
    __metadata("design:type", String)
], CreateEventAdditionalInfoDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(10),
    (0, class_validator_1.MaxLength)(2000),
    (0, class_transformer_1.Transform)(({ value }) => sanitizeHtml(value, {
        allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'a'],
        allowedAttributes: { a: ['href'] },
    })),
    (0, swagger_1.ApiProperty)({
        example: 'Please follow these guidelines...',
        description: 'Info section content (HTML sanitized)',
        minLength: 10,
        maxLength: 2000,
    }),
    __metadata("design:type", String)
], CreateEventAdditionalInfoDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    (0, swagger_1.ApiProperty)({
        required: false,
        description: 'Display order index',
        example: 0,
    }),
    __metadata("design:type", Number)
], CreateEventAdditionalInfoDto.prototype, "orderIndex", void 0);
class CreateEventHighlightDto {
    title;
    content;
    imageUrl;
    orderIndex;
}
exports.CreateEventHighlightDto = CreateEventHighlightDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(255),
    (0, swagger_1.ApiProperty)({
        example: 'Key Speaker',
        description: 'Highlight title',
        minLength: 3,
        maxLength: 255,
    }),
    __metadata("design:type", String)
], CreateEventHighlightDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(10),
    (0, class_validator_1.MaxLength)(2000),
    (0, class_transformer_1.Transform)(({ value }) => sanitizeHtml(value, {
        allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'a'],
        allowedAttributes: { a: ['href'] },
    })),
    (0, swagger_1.ApiProperty)({
        example: 'Dr. Smith will present...',
        description: 'Highlight content (HTML sanitized)',
        minLength: 10,
        maxLength: 2000,
    }),
    __metadata("design:type", String)
], CreateEventHighlightDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, common_1.IsSafeUrl)(),
    (0, class_validator_1.MaxLength)(500),
    (0, swagger_1.ApiProperty)({
        required: false,
        example: 'https://example.com/speaker.jpg',
        description: 'Highlight image URL',
        maxLength: 500,
    }),
    __metadata("design:type", String)
], CreateEventHighlightDto.prototype, "imageUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    (0, swagger_1.ApiProperty)({
        required: false,
        description: 'Display order index',
        example: 0,
    }),
    __metadata("design:type", Number)
], CreateEventHighlightDto.prototype, "orderIndex", void 0);
class CreateEventScheduleDto {
    activityTime;
    activityDescription;
    orderIndex;
}
exports.CreateEventScheduleDto = CreateEventScheduleDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Validate)(IsValidTimeConstraint),
    (0, swagger_1.ApiProperty)({
        example: '09:00',
        description: 'Activity time (HH:MM format)',
    }),
    __metadata("design:type", String)
], CreateEventScheduleDto.prototype, "activityTime", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(5),
    (0, class_validator_1.MaxLength)(1000),
    (0, class_transformer_1.Transform)(({ value }) => sanitizeHtml(value, {
        allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    })),
    (0, swagger_1.ApiProperty)({
        example: 'Registration and welcome',
        description: 'Activity description (HTML sanitized)',
        minLength: 5,
        maxLength: 1000,
    }),
    __metadata("design:type", String)
], CreateEventScheduleDto.prototype, "activityDescription", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    (0, swagger_1.ApiProperty)({
        required: false,
        description: 'Display order index',
        example: 0,
    }),
    __metadata("design:type", Number)
], CreateEventScheduleDto.prototype, "orderIndex", void 0);
class CreateEventFaqDto {
    question;
    answer;
}
exports.CreateEventFaqDto = CreateEventFaqDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(5),
    (0, class_validator_1.MaxLength)(500),
    (0, swagger_1.ApiProperty)({
        example: 'What should I bring to the event?',
        description: 'FAQ question',
        minLength: 5,
        maxLength: 500,
    }),
    __metadata("design:type", String)
], CreateEventFaqDto.prototype, "question", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(10),
    (0, class_validator_1.MaxLength)(2000),
    (0, class_transformer_1.Transform)(({ value }) => sanitizeHtml(value, {
        allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'a'],
        allowedAttributes: { a: ['href'] },
    })),
    (0, swagger_1.ApiProperty)({
        example: 'Please bring your ID and confirmation email...',
        description: 'FAQ answer (HTML sanitized)',
        minLength: 10,
        maxLength: 2000,
    }),
    __metadata("design:type", String)
], CreateEventFaqDto.prototype, "answer", void 0);
class CreateEventDto {
    title;
    description;
    date;
    time;
    location;
    organizerId;
    eventImage;
    status;
    visibility;
    tagIds;
    additionalInfo;
    highlights;
    schedule;
    faq;
}
exports.CreateEventDto = CreateEventDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(5),
    (0, class_validator_1.MaxLength)(255),
    (0, swagger_1.ApiProperty)({
        example: 'Annual School Science Fair',
        description: 'Event title',
        minLength: 5,
        maxLength: 255,
    }),
    __metadata("design:type", String)
], CreateEventDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(20),
    (0, class_validator_1.MaxLength)(5000),
    (0, class_transformer_1.Transform)(({ value }) => sanitizeHtml(value, {
        allowedTags: [
            'b',
            'i',
            'em',
            'strong',
            'p',
            'br',
            'ul',
            'ol',
            'li',
            'a',
            'h1',
            'h2',
            'h3',
        ],
        allowedAttributes: { a: ['href'] },
    })),
    (0, swagger_1.ApiProperty)({
        example: 'Join us for our annual science fair...',
        description: 'Event description (HTML sanitized)',
        minLength: 20,
        maxLength: 5000,
    }),
    __metadata("design:type", String)
], CreateEventDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.Validate)(IsFutureDateConstraint),
    (0, swagger_1.ApiProperty)({
        example: '2025-12-15',
        description: 'Event date (YYYY-MM-DD format)',
    }),
    __metadata("design:type", String)
], CreateEventDto.prototype, "date", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Validate)(IsValidTimeConstraint),
    (0, swagger_1.ApiProperty)({
        example: '09:00',
        description: 'Event time (HH:MM format)',
    }),
    __metadata("design:type", String)
], CreateEventDto.prototype, "time", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(255),
    (0, swagger_1.ApiProperty)({
        example: 'Main Auditorium',
        description: 'Event location',
        minLength: 3,
        maxLength: 255,
    }),
    __metadata("design:type", String)
], CreateEventDto.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsUUID)('4'),
    (0, swagger_1.ApiProperty)({
        example: '550e8400-e29b-41d4-a716-446655440000',
        description: 'Organizer user ID',
    }),
    __metadata("design:type", String)
], CreateEventDto.prototype, "organizerId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    (0, swagger_1.ApiProperty)({
        required: false,
        example: 'events/images/filename.jpg',
        description: 'Event image file key or URL',
        maxLength: 500,
    }),
    __metadata("design:type", String)
], CreateEventDto.prototype, "eventImage", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(EventStatus),
    (0, swagger_1.ApiProperty)({
        enum: EventStatus,
        default: EventStatus.DRAFT,
        description: 'Event status',
    }),
    __metadata("design:type", String)
], CreateEventDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(EventVisibility),
    (0, swagger_1.ApiProperty)({
        enum: EventVisibility,
        default: EventVisibility.PUBLIC,
        description: 'Event visibility',
    }),
    __metadata("design:type", String)
], CreateEventDto.prototype, "visibility", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(0),
    (0, class_validator_1.ArrayMaxSize)(10, { message: 'Maximum 10 tags allowed per event' }),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    (0, swagger_1.ApiProperty)({
        required: false,
        type: [String],
        description: 'Tag IDs to associate (max: 10)',
        example: ['tag-uuid-1', 'tag-uuid-2'],
        maxItems: 10,
    }),
    __metadata("design:type", Array)
], CreateEventDto.prototype, "tagIds", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(0),
    (0, class_validator_1.ArrayMaxSize)(20, { message: 'Maximum 20 additional info sections allowed' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateEventAdditionalInfoDto),
    (0, swagger_1.ApiProperty)({
        required: false,
        type: [CreateEventAdditionalInfoDto],
        description: 'Additional information sections',
        maxItems: 20,
    }),
    __metadata("design:type", Array)
], CreateEventDto.prototype, "additionalInfo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(0),
    (0, class_validator_1.ArrayMaxSize)(10, { message: 'Maximum 10 highlights allowed' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateEventHighlightDto),
    (0, swagger_1.ApiProperty)({
        required: false,
        type: [CreateEventHighlightDto],
        description: 'Event highlights',
        maxItems: 10,
    }),
    __metadata("design:type", Array)
], CreateEventDto.prototype, "highlights", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(0),
    (0, class_validator_1.ArrayMaxSize)(50, { message: 'Maximum 50 schedule items allowed' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateEventScheduleDto),
    (0, swagger_1.ApiProperty)({
        required: false,
        type: [CreateEventScheduleDto],
        description: 'Event schedule',
        maxItems: 50,
    }),
    __metadata("design:type", Array)
], CreateEventDto.prototype, "schedule", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(0),
    (0, class_validator_1.ArrayMaxSize)(20, { message: 'Maximum 20 FAQ items allowed' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateEventFaqDto),
    (0, swagger_1.ApiProperty)({
        required: false,
        type: [CreateEventFaqDto],
        description: 'Event FAQ',
        maxItems: 20,
    }),
    __metadata("design:type", Array)
], CreateEventDto.prototype, "faq", void 0);
//# sourceMappingURL=create-event.dto.js.map