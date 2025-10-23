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
exports.Teacher = void 0;
const swagger_1 = require("@nestjs/swagger");
class Teacher {
    id;
    user_id;
    first_name;
    last_name;
    middle_name;
    age;
    birthday;
    subject_specialization_id;
    department_id;
    advisory_section_id;
    created_at;
    updated_at;
    subject_specialization;
    department;
    advisory_section;
}
exports.Teacher = Teacher;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Teacher ID (UUID)' }),
    __metadata("design:type", String)
], Teacher.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID (UUID)' }),
    __metadata("design:type", String)
], Teacher.prototype, "user_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'First name' }),
    __metadata("design:type", String)
], Teacher.prototype, "first_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last name' }),
    __metadata("design:type", String)
], Teacher.prototype, "last_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Middle name', required: false }),
    __metadata("design:type", String)
], Teacher.prototype, "middle_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Age', required: false }),
    __metadata("design:type", Number)
], Teacher.prototype, "age", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Birthday', required: false }),
    __metadata("design:type", String)
], Teacher.prototype, "birthday", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Subject specialization ID', required: false }),
    __metadata("design:type", String)
], Teacher.prototype, "subject_specialization_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Department ID', required: false }),
    __metadata("design:type", String)
], Teacher.prototype, "department_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Advisory section ID', required: false }),
    __metadata("design:type", String)
], Teacher.prototype, "advisory_section_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Creation timestamp' }),
    __metadata("design:type", String)
], Teacher.prototype, "created_at", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last update timestamp' }),
    __metadata("design:type", String)
], Teacher.prototype, "updated_at", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Subject specialization', required: false }),
    __metadata("design:type", Object)
], Teacher.prototype, "subject_specialization", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Department', required: false }),
    __metadata("design:type", Object)
], Teacher.prototype, "department", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Advisory section', required: false }),
    __metadata("design:type", Object)
], Teacher.prototype, "advisory_section", void 0);
//# sourceMappingURL=teacher.entity.js.map