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
exports.ValidateAccessLinkDto = exports.GenerateAccessLinkDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class GenerateAccessLinkDto {
    expiresAt;
    accessCode;
    maxUses;
    requiresAuth;
}
exports.GenerateAccessLinkDto = GenerateAccessLinkDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    (0, swagger_1.ApiProperty)({
        example: '2025-01-20T23:59:59Z',
        description: 'Expiration date/time for the access link',
        required: false,
    }),
    __metadata("design:type", String)
], GenerateAccessLinkDto.prototype, "expiresAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(4),
    (0, class_validator_1.MaxLength)(20),
    (0, swagger_1.ApiProperty)({
        example: 'MATH2025',
        description: 'Optional access code required to use the link',
        required: false,
        minLength: 4,
        maxLength: 20,
    }),
    __metadata("design:type", String)
], GenerateAccessLinkDto.prototype, "accessCode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(10000),
    (0, swagger_1.ApiProperty)({
        example: 100,
        description: 'Maximum number of times this link can be used',
        required: false,
        minimum: 1,
        maximum: 10000,
    }),
    __metadata("design:type", Number)
], GenerateAccessLinkDto.prototype, "maxUses", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Whether authentication is required to access quiz via this link',
        required: false,
        default: true,
    }),
    __metadata("design:type", Boolean)
], GenerateAccessLinkDto.prototype, "requiresAuth", void 0);
class ValidateAccessLinkDto {
    token;
    accessCode;
}
exports.ValidateAccessLinkDto = ValidateAccessLinkDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        example: 'a1b2c3d4e5f6...',
        description: 'Access token from the URL',
    }),
    __metadata("design:type", String)
], ValidateAccessLinkDto.prototype, "token", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        example: 'MATH2025',
        description: 'Access code if required',
        required: false,
    }),
    __metadata("design:type", String)
], ValidateAccessLinkDto.prototype, "accessCode", void 0);
//# sourceMappingURL=generate-access-link.dto.js.map