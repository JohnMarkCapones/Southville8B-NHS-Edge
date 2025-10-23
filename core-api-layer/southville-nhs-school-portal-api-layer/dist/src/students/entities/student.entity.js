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
exports.Student = void 0;
const swagger_1 = require("@nestjs/swagger");
const emergency_contact_entity_1 = require("./emergency-contact.entity");
class Student {
    id;
    user_id;
    first_name;
    last_name;
    middle_name;
    student_id;
    lrn_id;
    grade_level;
    enrollment_year;
    honor_status;
    rank;
    section_id;
    age;
    birthday;
    section;
    user;
    emergencyContacts;
}
exports.Student = Student;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student ID (UUID)' }),
    __metadata("design:type", String)
], Student.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID (UUID)' }),
    __metadata("design:type", String)
], Student.prototype, "user_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'First name' }),
    __metadata("design:type", String)
], Student.prototype, "first_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last name' }),
    __metadata("design:type", String)
], Student.prototype, "last_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Middle name', required: false }),
    __metadata("design:type", String)
], Student.prototype, "middle_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student ID' }),
    __metadata("design:type", String)
], Student.prototype, "student_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'LRN ID' }),
    __metadata("design:type", String)
], Student.prototype, "lrn_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Grade level', required: false }),
    __metadata("design:type", String)
], Student.prototype, "grade_level", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Enrollment year', required: false }),
    __metadata("design:type", Number)
], Student.prototype, "enrollment_year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Honor status', required: false }),
    __metadata("design:type", String)
], Student.prototype, "honor_status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Rank', required: false }),
    __metadata("design:type", Number)
], Student.prototype, "rank", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Section ID', required: false }),
    __metadata("design:type", String)
], Student.prototype, "section_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Age', required: false }),
    __metadata("design:type", Number)
], Student.prototype, "age", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Birthday', required: false }),
    __metadata("design:type", String)
], Student.prototype, "birthday", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Section', required: false }),
    __metadata("design:type", Object)
], Student.prototype, "section", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User data', required: false }),
    __metadata("design:type", Object)
], Student.prototype, "user", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Emergency contacts',
        type: [emergency_contact_entity_1.EmergencyContact],
        required: false,
    }),
    __metadata("design:type", Array)
], Student.prototype, "emergencyContacts", void 0);
//# sourceMappingURL=student.entity.js.map