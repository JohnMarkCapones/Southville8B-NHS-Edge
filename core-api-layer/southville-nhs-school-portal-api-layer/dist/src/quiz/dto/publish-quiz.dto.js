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
exports.PublishQuizDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class PublishQuizDto {
    status;
    sectionIds;
}
exports.PublishQuizDto = PublishQuizDto;
__decorate([
    (0, class_validator_1.IsEnum)(['published', 'scheduled']),
    (0, swagger_1.ApiProperty)({
        example: 'published',
        description: 'Publication status',
        enum: ['published', 'scheduled'],
    }),
    __metadata("design:type", String)
], PublishQuizDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, swagger_1.ApiProperty)({
        example: ['550e8400-e29b-41d4-a716-446655440000'],
        description: 'Section IDs to assign this quiz to (for section_only visibility)',
        required: false,
        type: [String],
    }),
    __metadata("design:type", Array)
], PublishQuizDto.prototype, "sectionIds", void 0);
//# sourceMappingURL=publish-quiz.dto.js.map