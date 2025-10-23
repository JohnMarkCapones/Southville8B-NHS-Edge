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
exports.EmergencyContact = void 0;
const swagger_1 = require("@nestjs/swagger");
class EmergencyContact {
    id;
    studentId;
    guardianName;
    relationship;
    phoneNumber;
    email;
    address;
    isPrimary;
    createdAt;
    updatedAt;
}
exports.EmergencyContact = EmergencyContact;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Emergency contact ID',
    }),
    __metadata("design:type", String)
], EmergencyContact.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Student user ID',
    }),
    __metadata("design:type", String)
], EmergencyContact.prototype, "studentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Maria Santos',
        description: 'Guardian name',
    }),
    __metadata("design:type", String)
], EmergencyContact.prototype, "guardianName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Mother',
        description: 'Relationship',
    }),
    __metadata("design:type", String)
], EmergencyContact.prototype, "relationship", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '+639171234567',
        description: 'Phone number',
    }),
    __metadata("design:type", String)
], EmergencyContact.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'maria@email.com',
        description: 'Email',
        required: false,
    }),
    __metadata("design:type", String)
], EmergencyContact.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '123 Main St',
        description: 'Address',
        required: false,
    }),
    __metadata("design:type", String)
], EmergencyContact.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Is primary contact',
    }),
    __metadata("design:type", Boolean)
], EmergencyContact.prototype, "isPrimary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2024-01-15T10:30:00Z',
        description: 'Created timestamp',
    }),
    __metadata("design:type", String)
], EmergencyContact.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2024-01-15T10:30:00Z',
        description: 'Updated timestamp',
    }),
    __metadata("design:type", String)
], EmergencyContact.prototype, "updatedAt", void 0);
//# sourceMappingURL=emergency-contact.entity.js.map