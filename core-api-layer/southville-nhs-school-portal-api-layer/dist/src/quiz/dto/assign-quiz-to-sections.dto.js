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
exports.AssignQuizToSectionsDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class AssignQuizToSectionsDto {
    sectionIds;
    startDate;
    endDate;
    timeLimit;
    sectionSettings;
}
exports.AssignQuizToSectionsDto = AssignQuizToSectionsDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    (0, swagger_1.ApiProperty)({
        example: ['550e8400-e29b-41d4-a716-446655440001'],
        description: 'Array of section IDs to assign quiz to',
        type: [String],
    }),
    __metadata("design:type", Array)
], AssignQuizToSectionsDto.prototype, "sectionIds", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    (0, swagger_1.ApiProperty)({
        example: '2025-01-15T10:00:00Z',
        description: 'Override start date for these sections',
        required: false,
    }),
    __metadata("design:type", String)
], AssignQuizToSectionsDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    (0, swagger_1.ApiProperty)({
        example: '2025-01-20T23:59:59Z',
        description: 'Override end date for these sections',
        required: false,
    }),
    __metadata("design:type", String)
], AssignQuizToSectionsDto.prototype, "endDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, swagger_1.ApiProperty)({
        example: 60,
        description: 'Override time limit in minutes for these sections',
        required: false,
    }),
    __metadata("design:type", Number)
], AssignQuizToSectionsDto.prototype, "timeLimit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        example: { allowLateSub: true, latePenalty: 10 },
        description: 'Section-specific settings override',
        required: false,
    }),
    __metadata("design:type", Object)
], AssignQuizToSectionsDto.prototype, "sectionSettings", void 0);
//# sourceMappingURL=assign-quiz-to-sections.dto.js.map