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
exports.SubmitAnswerDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class SubmitAnswerDto {
    questionId;
    choiceId;
    choiceIds;
    answerText;
    answerJson;
}
exports.SubmitAnswerDto = SubmitAnswerDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, swagger_1.ApiProperty)({
        example: '550e8400-e29b-41d4-a716-446655440000',
        description: 'Question ID',
    }),
    __metadata("design:type", String)
], SubmitAnswerDto.prototype, "questionId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    (0, swagger_1.ApiProperty)({
        example: '550e8400-e29b-41d4-a716-446655440001',
        description: 'Choice ID (for MCQ, True/False)',
        required: false,
    }),
    __metadata("design:type", String)
], SubmitAnswerDto.prototype, "choiceId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    (0, swagger_1.ApiProperty)({
        example: [
            '550e8400-e29b-41d4-a716-446655440001',
            '550e8400-e29b-41d4-a716-446655440002',
        ],
        description: 'Choice IDs (for checkbox - multiple correct)',
        type: [String],
        required: false,
    }),
    __metadata("design:type", Array)
], SubmitAnswerDto.prototype, "choiceIds", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        example: 'The answer is 42',
        description: 'Text answer (for short answer, essay)',
        required: false,
    }),
    __metadata("design:type", String)
], SubmitAnswerDto.prototype, "answerText", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        example: { pairs: [{ left: 'A', right: '1' }] },
        description: 'Complex answer (for matching, ordering, drag-drop)',
        required: false,
    }),
    __metadata("design:type", Object)
], SubmitAnswerDto.prototype, "answerJson", void 0);
//# sourceMappingURL=submit-answer.dto.js.map