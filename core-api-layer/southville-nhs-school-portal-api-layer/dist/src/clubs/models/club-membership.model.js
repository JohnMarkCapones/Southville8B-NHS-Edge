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
exports.ClubMembership = void 0;
const swagger_1 = require("@nestjs/swagger");
class ClubMembership {
    id;
    studentId;
    clubId;
    positionId;
    joinedAt;
    isActive;
    createdAt;
    updatedAt;
    student;
    club;
    position;
}
exports.ClubMembership = ClubMembership;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Membership ID' }),
    __metadata("design:type", String)
], ClubMembership.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student ID' }),
    __metadata("design:type", String)
], ClubMembership.prototype, "studentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Club ID' }),
    __metadata("design:type", String)
], ClubMembership.prototype, "clubId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Position ID' }),
    __metadata("design:type", String)
], ClubMembership.prototype, "positionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Joined at' }),
    __metadata("design:type", Date)
], ClubMembership.prototype, "joinedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Is active' }),
    __metadata("design:type", Boolean)
], ClubMembership.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Created at' }),
    __metadata("design:type", Date)
], ClubMembership.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Updated at' }),
    __metadata("design:type", Date)
], ClubMembership.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student details', required: false }),
    __metadata("design:type", Object)
], ClubMembership.prototype, "student", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Club details', required: false }),
    __metadata("design:type", Object)
], ClubMembership.prototype, "club", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Position details', required: false }),
    __metadata("design:type", Object)
], ClubMembership.prototype, "position", void 0);
//# sourceMappingURL=club-membership.model.js.map