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
exports.CreateQuizQuestionDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const create_quiz_choice_dto_1 = require("./create-quiz-choice.dto");
class CreateQuizQuestionDto {
    questionText;
    questionType;
    orderIndex;
    points;
    allowPartialCredit;
    timeLimitSeconds;
    isPoolQuestion;
    sourceQuestionBankId;
    choices;
    metadata;
}
exports.CreateQuizQuestionDto = CreateQuizQuestionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, swagger_1.ApiProperty)({
        example: 'What is 2 + 2?',
        description: 'Question text',
        minLength: 3,
    }),
    __metadata("design:type", String)
], CreateQuizQuestionDto.prototype, "questionText", void 0);
__decorate([
    (0, class_validator_1.IsEnum)([
        'multiple_choice',
        'checkbox',
        'true_false',
        'short_answer',
        'essay',
        'fill_in_blank',
        'matching',
        'drag_drop',
        'ordering',
        'dropdown',
        'linear_scale',
    ]),
    (0, swagger_1.ApiProperty)({
        example: 'multiple_choice',
        description: 'Question type',
        enum: [
            'multiple_choice',
            'checkbox',
            'true_false',
            'short_answer',
            'essay',
            'fill_in_blank',
            'matching',
            'drag_drop',
            'ordering',
            'dropdown',
            'linear_scale',
        ],
    }),
    __metadata("design:type", String)
], CreateQuizQuestionDto.prototype, "questionType", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, swagger_1.ApiProperty)({
        example: 0,
        description: 'Order index (position in quiz)',
        minimum: 0,
    }),
    __metadata("design:type", Number)
], CreateQuizQuestionDto.prototype, "orderIndex", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, swagger_1.ApiProperty)({
        example: 5,
        description: 'Points for this question',
        default: 1,
        required: false,
        minimum: 0,
    }),
    __metadata("design:type", Number)
], CreateQuizQuestionDto.prototype, "points", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Allow partial credit for this question',
        default: false,
        required: false,
    }),
    __metadata("design:type", Boolean)
], CreateQuizQuestionDto.prototype, "allowPartialCredit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, swagger_1.ApiProperty)({
        example: 60,
        description: 'Time limit in seconds for this question',
        required: false,
        minimum: 1,
    }),
    __metadata("design:type", Number)
], CreateQuizQuestionDto.prototype, "timeLimitSeconds", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, swagger_1.ApiProperty)({
        example: false,
        description: 'Is this question part of a randomization pool',
        default: false,
        required: false,
    }),
    __metadata("design:type", Boolean)
], CreateQuizQuestionDto.prototype, "isPoolQuestion", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    (0, swagger_1.ApiProperty)({
        example: '550e8400-e29b-41d4-a716-446655440000',
        description: 'Source question bank ID if imported from question bank',
        required: false,
    }),
    __metadata("design:type", String)
], CreateQuizQuestionDto.prototype, "sourceQuestionBankId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => create_quiz_choice_dto_1.CreateQuizChoiceDto),
    (0, swagger_1.ApiProperty)({
        type: [create_quiz_choice_dto_1.CreateQuizChoiceDto],
        description: 'Answer choices for multiple choice, checkbox, etc.',
        required: false,
    }),
    __metadata("design:type", Array)
], CreateQuizQuestionDto.prototype, "choices", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        example: { pairs: [{ left: 'A', right: '1' }] },
        description: 'Metadata for complex question types (matching, ordering, drag-drop, fill-in-blank)',
        required: false,
    }),
    __metadata("design:type", Object)
], CreateQuizQuestionDto.prototype, "metadata", void 0);
//# sourceMappingURL=create-quiz-question.dto.js.map