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
exports.AddCoAuthorDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class AddCoAuthorDto {
    userId;
    role;
}
exports.AddCoAuthorDto = AddCoAuthorDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User ID of the co-author (must be journalism member)',
        example: 'e1caec49-f61d-4158-bac7-1dd456e9976b',
    }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AddCoAuthorDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Role of the co-author in this article',
        example: 'co-author',
        enum: ['co-author', 'editor', 'contributor'],
        default: 'co-author',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['co-author', 'editor', 'contributor']),
    __metadata("design:type", String)
], AddCoAuthorDto.prototype, "role", void 0);
//# sourceMappingURL=add-co-author.dto.js.map