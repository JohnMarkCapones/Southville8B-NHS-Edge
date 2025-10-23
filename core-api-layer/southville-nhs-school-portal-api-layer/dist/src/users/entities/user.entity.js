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
exports.User = void 0;
const swagger_1 = require("@nestjs/swagger");
const teacher_entity_1 = require("./teacher.entity");
const admin_entity_1 = require("./admin.entity");
const student_entity_1 = require("../../students/entities/student.entity");
class User {
    id;
    full_name;
    email;
    role_id;
    status;
    created_at;
    updated_at;
    role;
    teacher;
    admin;
    student;
}
exports.User = User;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID (UUID)' }),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Full name' }),
    __metadata("design:type", String)
], User.prototype, "full_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Email address' }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Role ID (UUID)' }),
    __metadata("design:type", String)
], User.prototype, "role_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User status' }),
    __metadata("design:type", String)
], User.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Creation timestamp' }),
    __metadata("design:type", String)
], User.prototype, "created_at", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last update timestamp' }),
    __metadata("design:type", String)
], User.prototype, "updated_at", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Role name', required: false }),
    __metadata("design:type", Object)
], User.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Teacher data', required: false }),
    __metadata("design:type", teacher_entity_1.Teacher)
], User.prototype, "teacher", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Admin data', required: false }),
    __metadata("design:type", admin_entity_1.Admin)
], User.prototype, "admin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student data', required: false }),
    __metadata("design:type", student_entity_1.Student)
], User.prototype, "student", void 0);
//# sourceMappingURL=user.entity.js.map