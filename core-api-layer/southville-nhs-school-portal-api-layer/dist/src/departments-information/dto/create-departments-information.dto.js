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
exports.CreateDepartmentsInformationDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateDepartmentsInformationDto {
    departmentId;
    officeName;
    contactPerson;
    description;
    email;
    contactNumber;
}
exports.CreateDepartmentsInformationDto = CreateDepartmentsInformationDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)({
        description: 'Department ID from departments table',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], CreateDepartmentsInformationDto.prototype, "departmentId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    (0, swagger_1.ApiProperty)({
        description: 'Office name',
        example: 'Main Office',
        required: false,
        maxLength: 255,
    }),
    __metadata("design:type", String)
], CreateDepartmentsInformationDto.prototype, "officeName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    (0, swagger_1.ApiProperty)({
        description: 'Contact person name',
        example: 'John Smith',
        required: false,
        maxLength: 255,
    }),
    __metadata("design:type", String)
], CreateDepartmentsInformationDto.prototype, "contactPerson", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    (0, swagger_1.ApiProperty)({
        description: 'Department description',
        example: 'Handles student enrollment and academic records',
        required: false,
        maxLength: 2000,
    }),
    __metadata("design:type", String)
], CreateDepartmentsInformationDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.MaxLength)(255),
    (0, swagger_1.ApiProperty)({
        description: 'Contact email address',
        example: 'contact@school.edu',
        required: false,
        maxLength: 255,
    }),
    __metadata("design:type", String)
], CreateDepartmentsInformationDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(7),
    (0, class_validator_1.MaxLength)(16),
    (0, class_validator_1.Matches)(/^\+?[1-9]\d{1,14}$/, {
        message: 'Contact number must be a valid international format',
    }),
    (0, swagger_1.ApiProperty)({
        description: 'Contact phone number in international format',
        example: '+1234567890',
        required: false,
        minLength: 7,
        maxLength: 16,
    }),
    __metadata("design:type", String)
], CreateDepartmentsInformationDto.prototype, "contactNumber", void 0);
//# sourceMappingURL=create-departments-information.dto.js.map