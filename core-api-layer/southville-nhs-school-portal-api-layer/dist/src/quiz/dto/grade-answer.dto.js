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
exports.GradeAnswerDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class GradeAnswerDto {
    pointsAwarded;
    isCorrect;
    graderFeedback;
}
exports.GradeAnswerDto = GradeAnswerDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, swagger_1.ApiProperty)({
        example: 8.5,
        description: 'Points awarded for this answer',
        minimum: 0,
    }),
    __metadata("design:type", Number)
], GradeAnswerDto.prototype, "pointsAwarded", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, swagger_1.ApiProperty)({
        example: true,
        description: 'Is the answer correct',
    }),
    __metadata("design:type", Boolean)
], GradeAnswerDto.prototype, "isCorrect", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        example: 'Good answer, but could use more details on X',
        description: 'Feedback for the student',
        required: false,
    }),
    __metadata("design:type", String)
], GradeAnswerDto.prototype, "graderFeedback", void 0);
//# sourceMappingURL=grade-answer.dto.js.map