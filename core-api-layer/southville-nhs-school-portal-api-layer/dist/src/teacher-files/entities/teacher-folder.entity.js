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
exports.TeacherFolderWithChildren = exports.TeacherFolder = void 0;
const swagger_1 = require("@nestjs/swagger");
class TeacherFolder {
    id;
    name;
    description;
    parent_id;
    is_deleted;
    deleted_at;
    deleted_by;
    created_by;
    updated_by;
    created_at;
    updated_at;
}
exports.TeacherFolder = TeacherFolder;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique identifier',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], TeacherFolder.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Folder name',
        example: 'Grade 10 Materials',
    }),
    __metadata("design:type", String)
], TeacherFolder.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Folder description',
        example: 'Teaching materials for Grade 10 students',
    }),
    __metadata("design:type", String)
], TeacherFolder.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Parent folder ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], TeacherFolder.prototype, "parent_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Soft delete flag',
        default: false,
    }),
    __metadata("design:type", Boolean)
], TeacherFolder.prototype, "is_deleted", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Deletion timestamp',
        example: '2024-01-15T10:30:00Z',
    }),
    __metadata("design:type", String)
], TeacherFolder.prototype, "deleted_at", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'User who deleted',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], TeacherFolder.prototype, "deleted_by", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'User who created',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], TeacherFolder.prototype, "created_by", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'User who last updated',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], TeacherFolder.prototype, "updated_by", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Creation timestamp',
        example: '2024-01-01T10:00:00Z',
    }),
    __metadata("design:type", String)
], TeacherFolder.prototype, "created_at", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last update timestamp',
        example: '2024-01-15T10:30:00Z',
    }),
    __metadata("design:type", String)
], TeacherFolder.prototype, "updated_at", void 0);
class TeacherFolderWithChildren extends TeacherFolder {
    children;
    file_count;
}
exports.TeacherFolderWithChildren = TeacherFolderWithChildren;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Child folders',
        type: [TeacherFolder],
        isArray: true,
    }),
    __metadata("design:type", Array)
], TeacherFolderWithChildren.prototype, "children", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Number of files in folder',
        example: 5,
    }),
    __metadata("design:type", Number)
], TeacherFolderWithChildren.prototype, "file_count", void 0);
//# sourceMappingURL=teacher-folder.entity.js.map