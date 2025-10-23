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
exports.CreateEmergencyContactDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateEmergencyContactDto {
    guardianName;
    relationship;
    phoneNumber;
    email;
    address;
    isPrimary;
}
exports.CreateEmergencyContactDto = CreateEmergencyContactDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(100),
    (0, swagger_1.ApiProperty)({
        example: 'Maria Santos',
        description: 'Guardian/Emergency contact name',
        minLength: 2,
        maxLength: 100,
    }),
    __metadata("design:type", String)
], CreateEmergencyContactDto.prototype, "guardianName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(50),
    (0, swagger_1.ApiProperty)({
        example: 'Mother',
        description: 'Relationship to student',
        minLength: 2,
        maxLength: 50,
    }),
    __metadata("design:type", String)
], CreateEmergencyContactDto.prototype, "relationship", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    (0, class_validator_1.MaxLength)(20),
    (0, swagger_1.ApiProperty)({
        example: '+639171234567',
        description: 'Phone number',
        minLength: 10,
        maxLength: 20,
    }),
    __metadata("design:type", String)
], CreateEmergencyContactDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.MaxLength)(100),
    (0, swagger_1.ApiProperty)({
        example: 'maria.santos@email.com',
        description: 'Email address',
        required: false,
        maxLength: 100,
    }),
    __metadata("design:type", String)
], CreateEmergencyContactDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    (0, swagger_1.ApiProperty)({
        example: '123 Main St, City',
        description: 'Address',
        required: false,
        maxLength: 500,
    }),
    __metadata("design:type", String)
], CreateEmergencyContactDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Is this the primary contact?',
        required: false,
        default: false,
    }),
    __metadata("design:type", Boolean)
], CreateEmergencyContactDto.prototype, "isPrimary", void 0);
//# sourceMappingURL=create-emergency-contact.dto.js.map