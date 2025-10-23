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
exports.DepartmentInformation = void 0;
const swagger_1 = require("@nestjs/swagger");
class DepartmentInformation {
    id;
    department_id;
    office_name;
    contact_person;
    description;
    email;
    contact_number;
    created_at;
}
exports.DepartmentInformation = DepartmentInformation;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique identifier for the department information',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], DepartmentInformation.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the department this information belongs to',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], DepartmentInformation.prototype, "department_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Name of the office',
        example: 'Registrar Office',
    }),
    __metadata("design:type", String)
], DepartmentInformation.prototype, "office_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Contact person for the department',
        example: 'Dr. John Smith',
    }),
    __metadata("design:type", String)
], DepartmentInformation.prototype, "contact_person", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Description of the department',
        example: 'Handles student registration and academic records',
    }),
    __metadata("design:type", String)
], DepartmentInformation.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Email address for contact',
        example: 'registrar@southville.edu.ph',
    }),
    __metadata("design:type", String)
], DepartmentInformation.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Contact number',
        example: '+63 2 1234 5678',
    }),
    __metadata("design:type", String)
], DepartmentInformation.prototype, "contact_number", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Timestamp when the record was created',
        example: '2024-01-15T10:30:00Z',
    }),
    __metadata("design:type", Date)
], DepartmentInformation.prototype, "created_at", void 0);
//# sourceMappingURL=department-information.entity.js.map