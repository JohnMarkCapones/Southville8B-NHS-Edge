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
exports.CreateStudentDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const create_emergency_contact_dto_1 = require("./create-emergency-contact.dto");
class CreateStudentDto {
    firstName;
    lastName;
    middleName;
    studentId;
    lrnId;
    birthday;
    gradeLevel;
    enrollmentYear;
    honorStatus;
    age;
    sectionId;
    emergencyContacts;
}
exports.CreateStudentDto = CreateStudentDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(50),
    (0, swagger_1.ApiProperty)({
        example: 'John',
        description: 'First name',
        minLength: 2,
        maxLength: 50,
    }),
    __metadata("design:type", String)
], CreateStudentDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(50),
    (0, swagger_1.ApiProperty)({
        example: 'Doe',
        description: 'Last name',
        minLength: 2,
        maxLength: 50,
    }),
    __metadata("design:type", String)
], CreateStudentDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(50),
    (0, swagger_1.ApiProperty)({
        example: 'Michael',
        description: 'Middle name',
        required: false,
        minLength: 1,
        maxLength: 50,
    }),
    __metadata("design:type", String)
], CreateStudentDto.prototype, "middleName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(5),
    (0, class_validator_1.MaxLength)(20),
    (0, swagger_1.ApiProperty)({
        example: 'STU-2024-001',
        description: 'Student ID',
        minLength: 5,
        maxLength: 20,
    }),
    __metadata("design:type", String)
], CreateStudentDto.prototype, "studentId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    (0, class_validator_1.MaxLength)(15),
    (0, swagger_1.ApiProperty)({
        example: '123456789012',
        description: 'LRN ID (used as email: lrn_id@student.local)',
        minLength: 10,
        maxLength: 15,
    }),
    __metadata("design:type", String)
], CreateStudentDto.prototype, "lrnId", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, swagger_1.ApiProperty)({
        example: '2008-05-15',
        description: 'Birthday (used for password generation)',
        type: 'string',
        format: 'date',
    }),
    __metadata("design:type", String)
], CreateStudentDto.prototype, "birthday", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(20),
    (0, swagger_1.ApiProperty)({
        example: 'Grade 10',
        description: 'Grade level',
        minLength: 2,
        maxLength: 20,
    }),
    __metadata("design:type", String)
], CreateStudentDto.prototype, "gradeLevel", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(2000),
    (0, class_validator_1.Max)(2030),
    (0, swagger_1.ApiProperty)({
        example: 2024,
        description: 'Enrollment year',
        minimum: 2000,
        maximum: 2030,
    }),
    __metadata("design:type", Number)
], CreateStudentDto.prototype, "enrollmentYear", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    (0, swagger_1.ApiProperty)({
        example: 'Honor Student',
        description: 'Honor status',
        required: false,
        maxLength: 50,
    }),
    __metadata("design:type", String)
], CreateStudentDto.prototype, "honorStatus", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(5),
    (0, class_validator_1.Max)(25),
    (0, swagger_1.ApiProperty)({
        example: 16,
        description: 'Age',
        required: false,
        minimum: 5,
        maximum: 25,
    }),
    __metadata("design:type", Number)
], CreateStudentDto.prototype, "age", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    (0, swagger_1.ApiProperty)({
        required: false,
        description: 'Section ID from sections table',
    }),
    __metadata("design:type", String)
], CreateStudentDto.prototype, "sectionId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => create_emergency_contact_dto_1.CreateEmergencyContactDto),
    (0, swagger_1.ApiProperty)({
        type: [create_emergency_contact_dto_1.CreateEmergencyContactDto],
        description: 'Emergency contacts (optional)',
        required: false,
    }),
    __metadata("design:type", Array)
], CreateStudentDto.prototype, "emergencyContacts", void 0);
//# sourceMappingURL=create-student.dto.js.map