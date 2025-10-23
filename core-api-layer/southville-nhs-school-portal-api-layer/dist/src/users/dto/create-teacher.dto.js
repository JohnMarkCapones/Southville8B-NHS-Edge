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
exports.CreateTeacherDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const create_user_dto_1 = require("./create-user.dto");
class CreateTeacherDto extends create_user_dto_1.CreateUserDto {
    firstName;
    lastName;
    middleName;
    birthday;
    age;
    subjectSpecializationId;
    departmentId;
    phoneNumber;
    constructor() {
        super();
        this.role = create_user_dto_1.UserRole.TEACHER;
        this.userType = create_user_dto_1.UserType.TEACHER;
    }
}
exports.CreateTeacherDto = CreateTeacherDto;
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
], CreateTeacherDto.prototype, "firstName", void 0);
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
], CreateTeacherDto.prototype, "lastName", void 0);
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
], CreateTeacherDto.prototype, "middleName", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, swagger_1.ApiProperty)({
        example: '1985-05-15',
        description: 'Birthday (used for password generation)',
        type: 'string',
        format: 'date',
    }),
    __metadata("design:type", String)
], CreateTeacherDto.prototype, "birthday", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(18),
    (0, class_validator_1.Max)(80),
    (0, swagger_1.ApiProperty)({
        example: 35,
        description: 'Age',
        required: false,
        minimum: 18,
        maximum: 80,
    }),
    __metadata("design:type", Number)
], CreateTeacherDto.prototype, "age", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    (0, swagger_1.ApiProperty)({
        required: false,
        description: 'Subject specialization ID from subjects table',
    }),
    __metadata("design:type", String)
], CreateTeacherDto.prototype, "subjectSpecializationId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    (0, swagger_1.ApiProperty)({
        required: false,
        description: 'Department ID from departments table',
    }),
    __metadata("design:type", String)
], CreateTeacherDto.prototype, "departmentId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    (0, class_validator_1.MaxLength)(15),
    (0, class_validator_1.Matches)(/^\+?[1-9]\d{1,14}$/, {
        message: 'Phone number must be a valid international format',
    }),
    (0, swagger_1.ApiProperty)({
        example: '+1234567890',
        description: 'Phone number in international format',
        required: false,
        minLength: 10,
        maxLength: 15,
    }),
    __metadata("design:type", String)
], CreateTeacherDto.prototype, "phoneNumber", void 0);
//# sourceMappingURL=create-teacher.dto.js.map