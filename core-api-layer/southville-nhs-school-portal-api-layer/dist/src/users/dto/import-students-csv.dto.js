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
exports.BulkImportResultDto = exports.ImportStudentsCsvDto = exports.CsvStudentRowDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class CsvStudentRowDto {
    full_name;
    role;
    status;
    first_name;
    last_name;
    middle_name;
    student_id;
    lrn_id;
    grade_level;
    enrollment;
    section;
    age;
    birthday;
    guardian_name;
    relationship;
    phone_number;
    email;
    address;
    is_primary;
}
exports.CsvStudentRowDto = CsvStudentRowDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(100),
    (0, swagger_1.ApiProperty)({
        example: 'Liam Alexander Santos',
        description: 'Full name of the student',
    }),
    __metadata("design:type", String)
], CsvStudentRowDto.prototype, "full_name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        example: 'Student',
        description: 'Role (should be Student)',
    }),
    __metadata("design:type", String)
], CsvStudentRowDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        example: 'Active',
        description: 'Status (Active, Transferred, etc.)',
    }),
    __metadata("design:type", String)
], CsvStudentRowDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(50),
    (0, swagger_1.ApiProperty)({
        example: 'Liam',
        description: 'First name',
    }),
    __metadata("design:type", String)
], CsvStudentRowDto.prototype, "first_name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(50),
    (0, swagger_1.ApiProperty)({
        example: 'Santos',
        description: 'Last name',
    }),
    __metadata("design:type", String)
], CsvStudentRowDto.prototype, "last_name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    (0, swagger_1.ApiProperty)({
        example: 'Alexander',
        description: 'Middle name',
        required: false,
    }),
    __metadata("design:type", String)
], CsvStudentRowDto.prototype, "middle_name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(5),
    (0, class_validator_1.MaxLength)(20),
    (0, swagger_1.ApiProperty)({
        example: 'STU-1000',
        description: 'Student ID (not used for import, only LRN)',
    }),
    __metadata("design:type", String)
], CsvStudentRowDto.prototype, "student_id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(5),
    (0, class_validator_1.MaxLength)(15),
    (0, swagger_1.ApiProperty)({
        example: 'LRN-9000',
        description: 'LRN ID (used for email generation)',
    }),
    __metadata("design:type", String)
], CsvStudentRowDto.prototype, "lrn_id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(20),
    (0, swagger_1.ApiProperty)({
        example: 'Grade 8',
        description: 'Grade level',
    }),
    __metadata("design:type", String)
], CsvStudentRowDto.prototype, "grade_level", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(2000),
    (0, class_validator_1.Max)(2030),
    (0, swagger_1.ApiProperty)({
        example: 2023,
        description: 'Enrollment year',
    }),
    __metadata("design:type", Number)
], CsvStudentRowDto.prototype, "enrollment", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(50),
    (0, swagger_1.ApiProperty)({
        example: 'Sampaguita',
        description: 'Section name',
    }),
    __metadata("design:type", String)
], CsvStudentRowDto.prototype, "section", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(5),
    (0, class_validator_1.Max)(25),
    (0, swagger_1.ApiProperty)({
        example: 13,
        description: 'Age',
        required: false,
    }),
    __metadata("design:type", Number)
], CsvStudentRowDto.prototype, "age", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, swagger_1.ApiProperty)({
        example: '2008-11-04',
        description: 'Birthday (YYYY-MM-DD)',
    }),
    __metadata("design:type", String)
], CsvStudentRowDto.prototype, "birthday", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(100),
    (0, swagger_1.ApiProperty)({
        example: 'Emma Hernandez',
        description: 'Guardian name',
    }),
    __metadata("design:type", String)
], CsvStudentRowDto.prototype, "guardian_name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(50),
    (0, swagger_1.ApiProperty)({
        example: 'Mother',
        description: 'Relationship to student',
    }),
    __metadata("design:type", String)
], CsvStudentRowDto.prototype, "relationship", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    (0, class_validator_1.MaxLength)(20),
    (0, swagger_1.ApiProperty)({
        example: '6.39439E+11',
        description: 'Phone number (can be in scientific notation)',
    }),
    __metadata("design:type", String)
], CsvStudentRowDto.prototype, "phone_number", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.MaxLength)(100),
    (0, swagger_1.ApiProperty)({
        example: 'emmahernandez@gmail.com',
        description: 'Guardian email',
        required: false,
    }),
    __metadata("design:type", String)
], CsvStudentRowDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    (0, swagger_1.ApiProperty)({
        example: 'Unit 18, Pine Road, Barangay 5, Pasay',
        description: 'Address',
        required: false,
    }),
    __metadata("design:type", String)
], CsvStudentRowDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Is this the primary guardian?',
        required: false,
    }),
    __metadata("design:type", Boolean)
], CsvStudentRowDto.prototype, "is_primary", void 0);
class ImportStudentsCsvDto {
    students;
}
exports.ImportStudentsCsvDto = ImportStudentsCsvDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CsvStudentRowDto),
    (0, swagger_1.ApiProperty)({
        description: 'Array of student rows from CSV',
        type: [CsvStudentRowDto],
    }),
    __metadata("design:type", Array)
], ImportStudentsCsvDto.prototype, "students", void 0);
class BulkImportResultDto {
    success;
    failed;
    results;
    errors;
}
exports.BulkImportResultDto = BulkImportResultDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of successfully imported students',
        example: 25,
    }),
    __metadata("design:type", Number)
], BulkImportResultDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of failed imports',
        example: 2,
    }),
    __metadata("design:type", Number)
], BulkImportResultDto.prototype, "failed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Successfully imported student details',
        type: 'array',
    }),
    __metadata("design:type", Array)
], BulkImportResultDto.prototype, "results", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Failed import details with error messages',
        type: 'array',
    }),
    __metadata("design:type", Array)
], BulkImportResultDto.prototype, "errors", void 0);
//# sourceMappingURL=import-students-csv.dto.js.map