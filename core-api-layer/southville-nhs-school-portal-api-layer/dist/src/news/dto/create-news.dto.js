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
exports.CreateNewsDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateNewsDto {
    title;
    description;
    articleJson;
    articleHtml;
    categoryId;
    tags;
    visibility;
    scheduledDate;
    coAuthorIds;
    featuredImageUrl;
    r2FeaturedImageKey;
}
exports.CreateNewsDto = CreateNewsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Article title',
        example: 'Science Fair Champions Announced',
        maxLength: 255,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateNewsDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Article description/excerpt (auto-generated from content if empty)',
        example: 'Congratulations to all participants in this year\'s science fair competition',
        maxLength: 500,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateNewsDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Article content in ProseMirror JSON format (from Tiptap editor)',
        example: { type: 'doc', content: [] },
    }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Object)
], CreateNewsDto.prototype, "articleJson", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Article content in rendered HTML format (from Tiptap editor)',
        example: '<p>Full article content here...</p>',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateNewsDto.prototype, "articleHtml", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Category ID',
        example: 'b9a9b3e4-5c5f-47b7-8ad5-89f09f0e1234',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateNewsDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Tags (will be auto-created if they don\'t exist)',
        example: ['science', 'competition', 'students'],
        type: [String],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateNewsDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Article visibility',
        example: 'public',
        enum: ['public', 'students', 'teachers', 'private'],
        default: 'public',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['public', 'students', 'teachers', 'private']),
    __metadata("design:type", String)
], CreateNewsDto.prototype, "visibility", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Scheduled publish date (for future publication)',
        example: '2025-01-01T09:00:00Z',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateNewsDto.prototype, "scheduledDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Co-author user IDs (must be journalism members)',
        example: ['e1caec49-f61d-4158-bac7-1dd456e9976b'],
        type: [String],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    __metadata("design:type", Array)
], CreateNewsDto.prototype, "coAuthorIds", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Featured image URL (from R2 storage, optional if article has images)',
        example: 'https://r2.../news/featured/abc123.jpg',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNewsDto.prototype, "featuredImageUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'R2 storage key for featured image',
        example: 'news/featured/abc123.jpg',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNewsDto.prototype, "r2FeaturedImageKey", void 0);
//# sourceMappingURL=create-news.dto.js.map