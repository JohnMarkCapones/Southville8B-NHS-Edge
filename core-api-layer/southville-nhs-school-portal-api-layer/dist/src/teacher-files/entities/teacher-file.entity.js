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
exports.TeacherFileWithDetails = exports.TeacherFile = void 0;
const swagger_1 = require("@nestjs/swagger");
class TeacherFile {
    id;
    folder_id;
    title;
    description;
    file_url;
    r2_file_key;
    file_size_bytes;
    mime_type;
    original_filename;
    is_deleted;
    deleted_at;
    deleted_by;
    uploaded_by;
    updated_by;
    created_at;
    updated_at;
}
exports.TeacherFile = TeacherFile;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique identifier',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], TeacherFile.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Folder ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], TeacherFile.prototype, "folder_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'File title',
        example: 'Math Quiz - Algebra',
    }),
    __metadata("design:type", String)
], TeacherFile.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'File description',
        example: 'Quiz covering algebraic equations',
    }),
    __metadata("design:type", String)
], TeacherFile.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'R2 public URL',
        example: 'https://bucket.r2.dev/teacher-files/folder-id/uuid-filename.pdf',
    }),
    __metadata("design:type", String)
], TeacherFile.prototype, "file_url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'R2 storage key',
        example: 'teacher-files/folder-id/uuid-filename.pdf',
    }),
    __metadata("design:type", String)
], TeacherFile.prototype, "r2_file_key", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'File size in bytes',
        example: 2048576,
    }),
    __metadata("design:type", Number)
], TeacherFile.prototype, "file_size_bytes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'MIME type',
        example: 'application/pdf',
    }),
    __metadata("design:type", String)
], TeacherFile.prototype, "mime_type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Original filename',
        example: 'algebra-quiz.pdf',
    }),
    __metadata("design:type", String)
], TeacherFile.prototype, "original_filename", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Soft delete flag',
        default: false,
    }),
    __metadata("design:type", Boolean)
], TeacherFile.prototype, "is_deleted", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Deletion timestamp',
        example: '2024-01-15T10:30:00Z',
    }),
    __metadata("design:type", String)
], TeacherFile.prototype, "deleted_at", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'User who deleted',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], TeacherFile.prototype, "deleted_by", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User who uploaded',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], TeacherFile.prototype, "uploaded_by", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'User who last updated',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], TeacherFile.prototype, "updated_by", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Upload timestamp',
        example: '2024-01-01T10:00:00Z',
    }),
    __metadata("design:type", String)
], TeacherFile.prototype, "created_at", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last update timestamp',
        example: '2024-01-15T10:30:00Z',
    }),
    __metadata("design:type", String)
], TeacherFile.prototype, "updated_at", void 0);
class TeacherFileWithDetails extends TeacherFile {
    folder;
    uploader;
    download_count;
}
exports.TeacherFileWithDetails = TeacherFileWithDetails;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Folder information',
    }),
    __metadata("design:type", Object)
], TeacherFileWithDetails.prototype, "folder", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Uploader information',
    }),
    __metadata("design:type", Object)
], TeacherFileWithDetails.prototype, "uploader", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Download count',
        example: 25,
    }),
    __metadata("design:type", Number)
], TeacherFileWithDetails.prototype, "download_count", void 0);
//# sourceMappingURL=teacher-file.entity.js.map