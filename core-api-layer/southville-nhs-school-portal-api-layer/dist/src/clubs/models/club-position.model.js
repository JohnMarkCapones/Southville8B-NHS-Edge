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
exports.ClubPosition = void 0;
const swagger_1 = require("@nestjs/swagger");
class ClubPosition {
    id;
    name;
    description;
    level;
    createdAt;
    updatedAt;
}
exports.ClubPosition = ClubPosition;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Position ID' }),
    __metadata("design:type", String)
], ClubPosition.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Position name' }),
    __metadata("design:type", String)
], ClubPosition.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Position description' }),
    __metadata("design:type", String)
], ClubPosition.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Authority level' }),
    __metadata("design:type", Number)
], ClubPosition.prototype, "level", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Created at' }),
    __metadata("design:type", Date)
], ClubPosition.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Updated at' }),
    __metadata("design:type", Date)
], ClubPosition.prototype, "updatedAt", void 0);
//# sourceMappingURL=club-position.model.js.map