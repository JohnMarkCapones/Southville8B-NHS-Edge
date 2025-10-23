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
exports.Department = void 0;
const swagger_1 = require("@nestjs/swagger");
class Department {
    id;
    department_name;
    description;
    head_id;
    is_active;
    created_at;
    updated_at;
    head;
}
exports.Department = Department;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Department UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], Department.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Department name',
        example: 'Information Technology',
    }),
    __metadata("design:type", String)
], Department.prototype, "department_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Department description',
        required: false,
        example: 'Manages all IT-related curriculum and programs',
    }),
    __metadata("design:type", String)
], Department.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Teacher ID who heads the department',
        required: false,
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], Department.prototype, "head_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Active status',
        default: true,
    }),
    __metadata("design:type", Boolean)
], Department.prototype, "is_active", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Created timestamp',
        example: '2024-01-15T10:30:00Z',
    }),
    __metadata("design:type", Date)
], Department.prototype, "created_at", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Updated timestamp',
        example: '2024-01-15T10:30:00Z',
    }),
    __metadata("design:type", Date)
], Department.prototype, "updated_at", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Department head details',
        required: false,
    }),
    __metadata("design:type", Object)
], Department.prototype, "head", void 0);
//# sourceMappingURL=department.entity.js.map