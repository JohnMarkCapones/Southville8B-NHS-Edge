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
exports.CampusFacility = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_campus_facility_dto_1 = require("../dto/create-campus-facility.dto");
class CampusFacility {
    id;
    name;
    imageUrl;
    description;
    buildingId;
    floorId;
    capacity;
    type;
    status;
    domainId;
    createdBy;
    createdAt;
    updatedAt;
}
exports.CampusFacility = CampusFacility;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Campus facility ID',
    }),
    __metadata("design:type", String)
], CampusFacility.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Library',
        description: 'Campus facility name',
    }),
    __metadata("design:type", String)
], CampusFacility.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'https://example.com/image.jpg',
        description: 'Image URL of the campus facility',
        required: false,
    }),
    __metadata("design:type", String)
], CampusFacility.prototype, "imageUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'A modern library with extensive collection of books and digital resources',
        description: 'Description of the campus facility',
        required: false,
    }),
    __metadata("design:type", String)
], CampusFacility.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Building ID where the facility is located',
    }),
    __metadata("design:type", String)
], CampusFacility.prototype, "buildingId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Floor ID where the facility is located',
    }),
    __metadata("design:type", String)
], CampusFacility.prototype, "floorId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 50,
        description: 'Facility capacity (number of people)',
        required: false,
    }),
    __metadata("design:type", Number)
], CampusFacility.prototype, "capacity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: create_campus_facility_dto_1.FacilityType,
        example: create_campus_facility_dto_1.FacilityType.LIBRARY,
        description: 'Type of campus facility',
    }),
    __metadata("design:type", String)
], CampusFacility.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: create_campus_facility_dto_1.FacilityStatus,
        example: create_campus_facility_dto_1.FacilityStatus.AVAILABLE,
        description: 'Current status of the facility',
        required: false,
    }),
    __metadata("design:type", String)
], CampusFacility.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Domain ID for scoping the facility',
    }),
    __metadata("design:type", String)
], CampusFacility.prototype, "domainId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'User ID of the creator',
    }),
    __metadata("design:type", String)
], CampusFacility.prototype, "createdBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2024-01-15T10:30:00Z',
        description: 'Creation timestamp',
    }),
    __metadata("design:type", String)
], CampusFacility.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2024-01-15T10:30:00Z',
        description: 'Last update timestamp',
    }),
    __metadata("design:type", String)
], CampusFacility.prototype, "updatedAt", void 0);
//# sourceMappingURL=campus-facility.entity.js.map