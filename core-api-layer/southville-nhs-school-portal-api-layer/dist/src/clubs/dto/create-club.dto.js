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
exports.CreateClubDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateClubDto {
    name;
    description;
    president_id;
    vp_id;
    secretary_id;
    advisor_id;
    co_advisor_id;
    domain_id;
}
exports.CreateClubDto = CreateClubDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Club name',
        example: 'Math Club',
        maxLength: 255,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateClubDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Club description',
        example: 'A club for mathematics enthusiasts',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateClubDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'President user ID',
        example: 'e1caec49-f61d-4158-bac7-1dd456e9976b',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateClubDto.prototype, "president_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Vice President user ID',
        example: 'e1caec49-f61d-4158-bac7-1dd456e9976b',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateClubDto.prototype, "vp_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Secretary user ID',
        example: 'e1caec49-f61d-4158-bac7-1dd456e9976b',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateClubDto.prototype, "secretary_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Advisor user ID',
        example: 'e1caec49-f61d-4158-bac7-1dd456e9976b',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateClubDto.prototype, "advisor_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Co-Advisor user ID',
        example: 'e1caec49-f61d-4158-bac7-1dd456e9976b',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateClubDto.prototype, "co_advisor_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Domain ID that this club belongs to',
        example: 'b9a9b3e4-5c5f-47b7-8ad5-89f09f0e1234',
    }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateClubDto.prototype, "domain_id", void 0);
//# sourceMappingURL=create-club.dto.js.map