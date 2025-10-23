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
exports.CreateAnnouncementDto = exports.AnnouncementVisibility = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const sanitize_html_1 = require("sanitize-html");
var AnnouncementVisibility;
(function (AnnouncementVisibility) {
    AnnouncementVisibility["PUBLIC"] = "public";
    AnnouncementVisibility["PRIVATE"] = "private";
})(AnnouncementVisibility || (exports.AnnouncementVisibility = AnnouncementVisibility = {}));
let IsFutureDateConstraint = class IsFutureDateConstraint {
    validate(dateString) {
        if (!dateString)
            return true;
        const date = new Date(dateString);
        const now = new Date();
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(now.getFullYear() + 1);
        return date > now && date <= oneYearFromNow;
    }
    defaultMessage() {
        return 'Expiration date must be in the future and not more than 1 year from now';
    }
};
IsFutureDateConstraint = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: 'isFutureDate', async: false })
], IsFutureDateConstraint);
class CreateAnnouncementDto {
    title;
    content;
    expiresAt;
    type;
    visibility = AnnouncementVisibility.PUBLIC;
    targetRoleIds;
    tagIds;
}
exports.CreateAnnouncementDto = CreateAnnouncementDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(255),
    (0, swagger_1.ApiProperty)({
        example: 'School Assembly Next Week',
        description: 'Announcement title',
        minLength: 3,
        maxLength: 255,
    }),
    __metadata("design:type", String)
], CreateAnnouncementDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(10),
    (0, class_validator_1.MaxLength)(10000),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value !== 'string') {
            return value || '';
        }
        return (0, sanitize_html_1.default)(value, {
            allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'a'],
            allowedAttributes: { a: ['href'] },
        });
    }),
    (0, swagger_1.ApiProperty)({
        example: 'There will be a school assembly...',
        description: 'Announcement content (HTML sanitized)',
        minLength: 10,
        maxLength: 10000,
    }),
    __metadata("design:type", String)
], CreateAnnouncementDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.Validate)(IsFutureDateConstraint),
    (0, swagger_1.ApiProperty)({
        required: false,
        example: '2025-12-31T23:59:59Z',
        description: 'Expiration date (must be in future, max 1 year)',
    }),
    __metadata("design:type", String)
], CreateAnnouncementDto.prototype, "expiresAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    (0, swagger_1.ApiProperty)({
        required: false,
        example: 'event',
        description: 'Announcement type',
        maxLength: 50,
    }),
    __metadata("design:type", String)
], CreateAnnouncementDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(AnnouncementVisibility),
    (0, swagger_1.ApiProperty)({
        enum: AnnouncementVisibility,
        default: AnnouncementVisibility.PUBLIC,
        description: 'Visibility setting',
    }),
    __metadata("design:type", String)
], CreateAnnouncementDto.prototype, "visibility", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1, { message: 'At least one target role is required' }),
    (0, class_validator_1.ArrayMaxSize)(10, { message: 'Maximum 10 target roles allowed' }),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    (0, swagger_1.ApiProperty)({
        type: [String],
        description: 'Target role IDs (min: 1, max: 10)',
        example: ['role-uuid-1', 'role-uuid-2'],
        minItems: 1,
        maxItems: 10,
    }),
    __metadata("design:type", Array)
], CreateAnnouncementDto.prototype, "targetRoleIds", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(10, { message: 'Maximum 10 tags allowed per announcement' }),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    (0, swagger_1.ApiProperty)({
        required: false,
        type: [String],
        description: 'Tag IDs to associate (max: 10)',
        example: ['tag-uuid-1'],
        maxItems: 10,
    }),
    __metadata("design:type", Array)
], CreateAnnouncementDto.prototype, "tagIds", void 0);
//# sourceMappingURL=create-announcement.dto.js.map