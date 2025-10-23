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
exports.Section = void 0;
const swagger_1 = require("@nestjs/swagger");
class Section {
    id;
    name;
    gradeLevel;
    teacherId;
    createdAt;
    updatedAt;
    roomId;
    buildingId;
    teacher;
    students;
}
exports.Section = Section;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Section ID',
    }),
    __metadata("design:type", String)
], Section.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Section A',
        description: 'Section name',
    }),
    __metadata("design:type", String)
], Section.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Grade 10',
        description: 'Grade level',
        required: false,
    }),
    __metadata("design:type", String)
], Section.prototype, "gradeLevel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Teacher ID (foreign key to users table)',
        required: false,
    }),
    __metadata("design:type", String)
], Section.prototype, "teacherId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2024-01-15T10:30:00Z',
        description: 'Creation timestamp',
    }),
    __metadata("design:type", String)
], Section.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2024-01-15T10:30:00Z',
        description: 'Last update timestamp',
    }),
    __metadata("design:type", String)
], Section.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Room ID',
        required: false,
    }),
    __metadata("design:type", String)
], Section.prototype, "roomId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Building ID',
        required: false,
    }),
    __metadata("design:type", String)
], Section.prototype, "buildingId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Teacher information',
        required: false,
    }),
    __metadata("design:type", Object)
], Section.prototype, "teacher", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Students in this section',
        required: false,
    }),
    __metadata("design:type", Array)
], Section.prototype, "students", void 0);
//# sourceMappingURL=section.entity.js.map