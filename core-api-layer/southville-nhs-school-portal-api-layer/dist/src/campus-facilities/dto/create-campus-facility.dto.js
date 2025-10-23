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
exports.CreateCampusFacilityDto = exports.FacilityStatus = exports.FacilityType = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var FacilityType;
(function (FacilityType) {
    FacilityType["LIBRARY"] = "Library";
    FacilityType["LABORATORY"] = "Laboratory";
    FacilityType["AUDITORIUM"] = "Auditorium";
    FacilityType["GYMNASIUM"] = "Gymnasium";
    FacilityType["CAFETERIA"] = "Cafeteria";
    FacilityType["CLINIC"] = "Clinic";
    FacilityType["OFFICE"] = "Office";
    FacilityType["OUTDOOR"] = "Outdoor";
    FacilityType["OTHER"] = "Other";
})(FacilityType || (exports.FacilityType = FacilityType = {}));
var FacilityStatus;
(function (FacilityStatus) {
    FacilityStatus["AVAILABLE"] = "Available";
    FacilityStatus["OCCUPIED"] = "Occupied";
    FacilityStatus["MAINTENANCE"] = "Maintenance";
    FacilityStatus["CLOSED"] = "Closed";
})(FacilityStatus || (exports.FacilityStatus = FacilityStatus = {}));
class CreateCampusFacilityDto {
    name;
    description;
    buildingId;
    floorId;
    capacity;
    type;
    status;
    domainId;
    createdBy;
}
exports.CreateCampusFacilityDto = CreateCampusFacilityDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(255),
    (0, swagger_1.ApiProperty)({
        example: 'Library',
        description: 'Campus facility name',
        minLength: 2,
        maxLength: 255,
    }),
    __metadata("design:type", String)
], CreateCampusFacilityDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    (0, swagger_1.ApiProperty)({
        example: 'A modern library with extensive collection of books and digital resources',
        description: 'Description of the campus facility',
        required: false,
        maxLength: 2000,
    }),
    __metadata("design:type", String)
], CreateCampusFacilityDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, swagger_1.ApiProperty)({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Building ID where the facility is located',
    }),
    __metadata("design:type", String)
], CreateCampusFacilityDto.prototype, "buildingId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, swagger_1.ApiProperty)({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Floor ID where the facility is located',
    }),
    __metadata("design:type", String)
], CreateCampusFacilityDto.prototype, "floorId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, swagger_1.ApiProperty)({
        example: 50,
        description: 'Facility capacity (number of people)',
        required: false,
        minimum: 0,
    }),
    __metadata("design:type", Number)
], CreateCampusFacilityDto.prototype, "capacity", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(FacilityType),
    (0, swagger_1.ApiProperty)({
        enum: FacilityType,
        example: FacilityType.LIBRARY,
        description: 'Type of campus facility',
    }),
    __metadata("design:type", String)
], CreateCampusFacilityDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(FacilityStatus),
    (0, swagger_1.ApiProperty)({
        enum: FacilityStatus,
        example: FacilityStatus.AVAILABLE,
        description: 'Current status of the facility',
        required: false,
    }),
    __metadata("design:type", String)
], CreateCampusFacilityDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, swagger_1.ApiProperty)({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Domain ID for scoping the facility',
    }),
    __metadata("design:type", String)
], CreateCampusFacilityDto.prototype, "domainId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, swagger_1.ApiProperty)({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'User ID of the creator',
    }),
    __metadata("design:type", String)
], CreateCampusFacilityDto.prototype, "createdBy", void 0);
//# sourceMappingURL=create-campus-facility.dto.js.map