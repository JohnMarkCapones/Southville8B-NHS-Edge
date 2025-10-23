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
exports.ModuleWithDetails = exports.SectionModule = exports.Module = void 0;
const swagger_1 = require("@nestjs/swagger");
class Module {
    id;
    title;
    description;
    file_url;
    uploaded_by;
    r2_file_key;
    file_size_bytes;
    mime_type;
    is_global;
    is_deleted;
    deleted_at;
    deleted_by;
    subject_id;
    created_at;
    updated_at;
}
exports.Module = Module;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique identifier for the module',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], Module.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Title of the module',
        example: 'Introduction to Biology',
    }),
    __metadata("design:type", String)
], Module.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Description of the module',
        example: 'Basic concepts of biology for beginners',
    }),
    __metadata("design:type", String)
], Module.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'URL to the module file',
        example: 'https://example.com/modules/biology-intro.pdf',
    }),
    __metadata("design:type", String)
], Module.prototype, "file_url", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID of the user who uploaded the module',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], Module.prototype, "uploaded_by", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Cloudflare R2 storage key path',
        example: 'modules/123e4567-e89b-12d3-a456-426614174000/biology-intro.pdf',
    }),
    __metadata("design:type", String)
], Module.prototype, "r2_file_key", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'File size in bytes',
        example: 2048576,
    }),
    __metadata("design:type", Number)
], Module.prototype, "file_size_bytes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'MIME type of the file',
        example: 'application/pdf',
    }),
    __metadata("design:type", String)
], Module.prototype, "mime_type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether module is global (accessible to all teachers of same subject) or section-specific',
        default: false,
    }),
    __metadata("design:type", Boolean)
], Module.prototype, "is_global", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Soft delete flag - files retained for 30 days',
        default: false,
    }),
    __metadata("design:type", Boolean)
], Module.prototype, "is_deleted", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Timestamp when module was deleted',
        example: '2024-01-15T10:30:00Z',
    }),
    __metadata("design:type", String)
], Module.prototype, "deleted_at", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID of the user who deleted the module',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], Module.prototype, "deleted_by", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Subject ID for global module access control - only teachers with this subject can access',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], Module.prototype, "subject_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Timestamp when module was created',
        example: '2024-01-01T10:00:00Z',
    }),
    __metadata("design:type", String)
], Module.prototype, "created_at", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Timestamp when module was last updated',
        example: '2024-01-15T10:30:00Z',
    }),
    __metadata("design:type", String)
], Module.prototype, "updated_at", void 0);
class SectionModule {
    id;
    section_id;
    module_id;
    visible;
    assigned_at;
    assigned_by;
}
exports.SectionModule = SectionModule;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique identifier for the section-module assignment',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], SectionModule.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Section ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], SectionModule.prototype, "section_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Module ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], SectionModule.prototype, "module_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the module is visible to students in this section',
        default: true,
    }),
    __metadata("design:type", Boolean)
], SectionModule.prototype, "visible", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Timestamp when module was assigned to section',
        example: '2024-01-01T10:00:00Z',
    }),
    __metadata("design:type", String)
], SectionModule.prototype, "assigned_at", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID of the user who assigned the module to the section',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], SectionModule.prototype, "assigned_by", void 0);
class ModuleWithDetails extends Module {
    uploader;
    subject;
    sections;
    downloadStats;
}
exports.ModuleWithDetails = ModuleWithDetails;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Uploader information',
        type: 'object',
        properties: {
            id: { type: 'string' },
            full_name: { type: 'string' },
            email: { type: 'string' },
        },
    }),
    __metadata("design:type", Object)
], ModuleWithDetails.prototype, "uploader", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Subject information for global modules',
        type: 'object',
        properties: {
            id: { type: 'string' },
            subject_name: { type: 'string' },
            description: { type: 'string' },
        },
    }),
    __metadata("design:type", Object)
], ModuleWithDetails.prototype, "subject", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Sections assigned to this module (for non-global modules)',
        type: 'array',
        items: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                grade_level: { type: 'string' },
            },
        },
    }),
    __metadata("design:type", Array)
], ModuleWithDetails.prototype, "sections", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Download statistics',
        type: 'object',
        properties: {
            totalDownloads: { type: 'number' },
            uniqueUsers: { type: 'number' },
            successRate: { type: 'number' },
            lastDownloaded: { type: 'string' },
        },
    }),
    __metadata("design:type", Object)
], ModuleWithDetails.prototype, "downloadStats", void 0);
//# sourceMappingURL=module.entity.js.map