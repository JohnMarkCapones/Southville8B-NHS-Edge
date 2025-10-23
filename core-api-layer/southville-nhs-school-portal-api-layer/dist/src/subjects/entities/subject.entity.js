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
exports.Subject = void 0;
const swagger_1 = require("@nestjs/swagger");
class Subject {
    id;
    subject_name;
    description;
    grade_level;
    department_id;
    color_hex;
    created_at;
    updated_at;
    department;
}
exports.Subject = Subject;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Subject UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], Subject.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Subject name',
        example: 'Advanced Mathematics',
    }),
    __metadata("design:type", String)
], Subject.prototype, "subject_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Subject description',
        required: false,
    }),
    __metadata("design:type", String)
], Subject.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Grade level',
        required: false,
        example: 10,
    }),
    __metadata("design:type", Number)
], Subject.prototype, "grade_level", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Department ID',
        required: false,
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], Subject.prototype, "department_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Color hex code',
        required: false,
        example: '#3B82F6',
    }),
    __metadata("design:type", String)
], Subject.prototype, "color_hex", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Created timestamp',
    }),
    __metadata("design:type", Date)
], Subject.prototype, "created_at", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Updated timestamp',
    }),
    __metadata("design:type", Date)
], Subject.prototype, "updated_at", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Department details',
        required: false,
    }),
    __metadata("design:type", Object)
], Subject.prototype, "department", void 0);
//# sourceMappingURL=subject.entity.js.map